import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

/**
 * RiverbankFrogs
 * 2D Animated Chubby Storybook Green Frogs perched safely on dry riverbanks and stone slabs.
 * - Guaranteed placement on dry land (no standing on water!)
 * - 3-frame animation: calm sit, wide throat-puff croak, and happy blink
 * - Proximity hop reaction with parabolic jump physics and frog croak sound
 */

const FROG_SPAWNS = [
  { pos: [24.0, 0.08, -14.5], scale: 1.85, shadowR: 0.65 }, // South bridge landing grass bank
  { pos: [35.0, 0.08, -38.5], scale: 1.8, shadowR: 0.62 },  // North bridge landing grass bank
  { pos: [54.0, 0.08, -15.0], scale: 1.9, shadowR: 0.68 },  // East river shoreline knoll
  { pos: [12.0, 0.08, -50.0], scale: 1.75, shadowR: 0.60 }, // West river meander meadow
  { pos: [10.0, 0.08, -20.0], scale: 1.85, shadowR: 0.65 }, // Campfire trail verge
  { pos: [-12.0, 0.08, -75.0], scale: 1.8, shadowR: 0.62 }, // Upstream grassy bank
]

export const RiverbankFrogs = () => {
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  // 1. Preload frog sprite textures (cache-busted v=9)
  const textures = useMemo(() => {
    return [0, 1, 2].map((i) => {
      const tex = loader.load(`/assets/fauna/frog_${i}.png?v=9`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const frogGroupRefs = useRef([])
  const matRefs = useRef([])
  const stateRefs = useRef(
    FROG_SPAWNS.map(() => ({
      frame: 0,
      idleTimer: Math.random() * 4.0,
      actionDuration: 0,
      hopProgress: 0,
      isHopping: false,
      hopCooldown: Math.random() * 2.0,
      hasInteracted: false,
    }))
  )

  useFrame((_, delta) => {
    const catPos = usePortfolioStore.getState().catCurrentPos

    FROG_SPAWNS.forEach((spawn, idx) => {
      const grp = frogGroupRefs.current[idx]
      const mat = matRefs.current[idx]
      const st = stateRefs.current[idx]
      if (!grp || !mat) return

      st.hopCooldown = Math.max(0, st.hopCooldown - delta)

      // Enter/Exit Hysteresis: interact ONCE when cat enters (< 4.8 units), reset only when cat leaves (> 7.5 units)
      if (catPos && !st.isHopping) {
        const dx = catPos[0] - spawn.pos[0]
        const dz = catPos[2] - spawn.pos[2]
        const distSq = dx * dx + dz * dz

        if (distSq < 23.0) {
          if (!st.hasInteracted && st.hopCooldown <= 0) {
            st.hasInteracted = true
            st.isHopping = true
            st.hopProgress = 0
            st.frame = 1 // Puffed throat croak during hop
            st.hopCooldown = 1.0
            sfx.playFrogCroak()
          }
        } else if (distSq > 56.25) {
          st.hasInteracted = false
        }
      }

      // Hop Physics
      if (st.isHopping) {
        st.hopProgress += delta * 2.4 // Hop takes ~0.42s
        if (st.hopProgress >= 1.0) {
          st.isHopping = false
          st.hopProgress = 0
          grp.position.y = spawn.pos[1]
          st.frame = 0
        } else {
          // Parabolic jump arc
          const jumpArc = Math.sin(st.hopProgress * Math.PI) * 0.75
          grp.position.y = spawn.pos[1] + jumpArc
        }
      } else {
        // Idle Animation Cycle
        st.idleTimer += delta
        if (st.actionDuration > 0) {
          st.actionDuration -= delta
          if (st.actionDuration <= 0) {
            st.frame = 0 // Return to serene sit
          }
        } else if (st.idleTimer >= 3.5) {
          st.idleTimer = 0
          const isCroak = Math.random() < 0.65
          st.frame = isCroak ? 1 : 2 // 1: croak puff, 2: happy blink
          st.actionDuration = isCroak ? 0.5 : 0.25
        }
      }

      if (mat.map !== textures[st.frame]) {
        mat.map = textures[st.frame]
        mat.needsUpdate = true
      }
    })
  })

  return (
    <group name="RiverbankFrogsGroup">
      {FROG_SPAWNS.map((spawn, idx) => (
        <group
          key={idx}
          ref={(el) => (frogGroupRefs.current[idx] = el)}
          position={spawn.pos}
        >
          {/* Soft Ground Contact Shadow */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, 0]}
            renderOrder={9}
          >
            <circleGeometry args={[spawn.shadowR, 18]} />
            <meshBasicMaterial
              color="#0a1a0d"
              transparent
              opacity={0.34}
              depthWrite={false}
            />
          </mesh>

          {/* 2D Billboard Frog Quad */}
          <Billboard
            follow
            lockX={false}
            lockY={false}
            lockZ={false}
            position={[0, spawn.scale * 0.48, 0]}
          >
            <mesh scale={[spawn.scale * 1.15, spawn.scale * 1.05, 1]} renderOrder={15}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                ref={(el) => (matRefs.current[idx] = el)}
                map={textures[0]}
                transparent
                alphaTest={0.06}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Billboard>
        </group>
      ))}
    </group>
  )
}
