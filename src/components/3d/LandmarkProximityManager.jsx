import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePortfolioStore } from '../../store/usePortfolioStore'

/**
 * LANDMARK_ZONES
 * Defines the center coordinates and enter/exit proximity radii for the 4 district landmarks.
 * - enterRadius: distance threshold where popup auto-opens on approach (~10.5 units)
 * - exitRadius: distance threshold where popup auto-dismisses on walk-away (~15.5 units)
 */
const LANDMARK_ZONES = [
  { id: 'projects', center: [26.5, -95.0], enterRadius: 10.5, exitRadius: 15.5 },
  { id: 'resume', center: [-97.5, 78.0], enterRadius: 10.5, exitRadius: 15.5 },
  { id: 'blog', center: [-104.0, -33.5], enterRadius: 10.5, exitRadius: 15.5 },
  { id: 'contact', center: [86.0, 88.0], enterRadius: 10.5, exitRadius: 15.5 },
]

/**
 * LandmarkProximityManager
 * Handles automatic popup display when cat walks into landmark clearings,
 * allows user to dismiss/click away without immediate re-triggering,
 * and automatically dismisses the popup when the cat simply walks away.
 */
export const LandmarkProximityManager = () => {
  const openOverlay = usePortfolioStore((s) => s.openOverlay)
  const closeOverlay = usePortfolioStore((s) => s.closeOverlay)
  const setActiveDistrict = usePortfolioStore((s) => s.setActiveDistrict)

  // Tracks which landmarks were explicitly dismissed by the user while standing nearby
  const userDismissedRef = useRef({
    projects: false,
    resume: false,
    blog: false,
    contact: false,
  })

  const prevActiveOverlayRef = useRef(null)
  const openedByProximityRef = useRef(false)

  useFrame(() => {
    const state = usePortfolioStore.getState()
    if (!state.is3DMode) return

    const catPos = state.catCurrentPos
    if (!catPos || !Number.isFinite(catPos[0]) || !Number.isFinite(catPos[2])) return

    const activeOverlay = state.activeOverlay
    const px = catPos[0]
    const pz = catPos[2]

    // 1. Detect if an overlay was just dismissed (was open last frame, now closed)
    const prevOverlay = prevActiveOverlayRef.current
    if (prevOverlay && !activeOverlay) {
      openedByProximityRef.current = false
      const zone = LANDMARK_ZONES.find((z) => z.id === prevOverlay)
      if (zone) {
        const dx = px - zone.center[0]
        const dz = pz - zone.center[1]
        // If user closed overlay while still in the vicinity, remember dismissal
        if (dx * dx + dz * dz <= zone.exitRadius * zone.exitRadius) {
          userDismissedRef.current[prevOverlay] = true
        }
      }
    } else if (!prevOverlay && activeOverlay) {
      // Overlay opened: clear dismissal flag for this landmark
      userDismissedRef.current[activeOverlay] = false
    }

    // 2. Auto-close overlay if cat simply walks away past exitRadius (only when opened by proximity)
    if (activeOverlay && openedByProximityRef.current) {
      const activeZone = LANDMARK_ZONES.find((z) => z.id === activeOverlay)
      if (activeZone) {
        const dx = px - activeZone.center[0]
        const dz = pz - activeZone.center[1]
        const distSq = dx * dx + dz * dz
        if (distSq > activeZone.exitRadius * activeZone.exitRadius) {
          openedByProximityRef.current = false
          closeOverlay()
          userDismissedRef.current[activeZone.id] = false
        }
      }
    }

    // 3. Proximity check for all landmark zones
    for (let i = 0; i < LANDMARK_ZONES.length; i++) {
      const zone = LANDMARK_ZONES[i]
      const dx = px - zone.center[0]
      const dz = pz - zone.center[1]
      const distSq = dx * dx + dz * dz

      // If cat walks far away, reset dismissal flag so returning triggers again
      if (distSq > zone.exitRadius * zone.exitRadius) {
        userDismissedRef.current[zone.id] = false
      } else if (distSq < zone.enterRadius * zone.enterRadius) {
        // Cat is in vicinity! Auto-show popup if not currently open and not dismissed
        if (!activeOverlay && !userDismissedRef.current[zone.id]) {
          openedByProximityRef.current = true
          // Update active district indicator without setting catTarget navigation
          setActiveDistrict(zone.id, false)
          openOverlay(zone.id)
        }
      }
    }

    prevActiveOverlayRef.current = usePortfolioStore.getState().activeOverlay
  })

  return null
}
