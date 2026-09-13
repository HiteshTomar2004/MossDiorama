import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import * as THREE from 'three'

import { TREE_OBSTACLES } from './obstacleData'
import {
  RIVER_POINTS,
  distToPolyline,
  getClosestPointOnPolyline,
  isNorthOfRiver,
  BRIDGE_WAYPOINTS,
} from './mapConfig'
import { sfx } from '../../utils/sfxPlayer'

// ─────────────────────────────────────────────────────────────────
// Charming 2D Animated Black Traveler Cat (Jiji / Wayfinder Companion)
// Pure solid black silhouette, big round white cartoon eyes,
// cute pointed ears, and vibrant red neck bandana!
// Silky smooth 8-frame walk cycle + calm, poised, still idle stance!
// Zero white borders, zero cropping artifacts, instant responsiveness.
// ─────────────────────────────────────────────────────────────────
// Solid landmark architecture hitboxes (prevents cat from penetrating monolith, well, cabin, etc.)
const LANDMARK_OBSTACLES = [
  { x: 0, z: 0, r: 2.2 },       // Campfire stone ring
  { x: 28, z: -98, r: 2.5 },    // Runic Monolith base
  { x: -108, z: -34, r: 2.2 },  // Giant Mushroom stem
  { x: -100, z: 80, r: 2.2 },   // Whispering Well stone rim
  { x: 86, z: 88, r: 4.8 },     // Traveler's Cabin foundation
  { x: 101.5, z: -77.0, r: 8.8 }, // Mountain Lake water body (keeps cat on shoreline)
]

export const CharacterCat = () => {
  const catRef = useRef()
  const spriteMeshRef = useRef()
  const matRef = useRef()
  const shadowRef = useRef()
  const { camera } = useThree()

  // Smart waypoint pathfinding for crossing footbridge without river collision
  const waypointsRef = useRef([])
  const activeTargetPosRef = useRef(null)

  // Preload all 2D sprite frames (4-direction quadrupedal trot + 10s sit tail-wag)
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  const walkSideTextures = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const tex = loader.load(`/assets/cat/walk_side_${i}.png`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const walkDownTextures = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const tex = loader.load(`/assets/cat/walk_down_${i}.png`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const walkUpTextures = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const tex = loader.load(`/assets/cat/walk_up_${i}.png`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const idleTextures = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const tex = loader.load(`/assets/cat/idle_${i}.png`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const sitTextures = useMemo(() => {
    // Exactly two frames: tail wagging up and down on the left (never going to the right)
    return [0, 1].map((i) => {
      const tex = loader.load(`/assets/cat/sit_${i}.png`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const catTarget = usePortfolioStore((s) => s.catTarget)
  const setCatTarget = usePortfolioStore((s) => s.setCatTarget)
  const setCatCurrentPos = usePortfolioStore((s) => s.setCatCurrentPos)
  const setCatIsMoving = usePortfolioStore((s) => s.setCatIsMoving)
  const activeOverlay = usePortfolioStore((s) => s.activeOverlay)

  const [pos, setPos] = useState(new THREE.Vector3(2.0, 0, 1.2))
  const [isMoving, setIsMoving] = useState(false)
  const lastBroadcastPosRef = useRef([2.0, 0, 1.2])
  const keysPressed = useRef({})
  const blockedKeysRef = useRef(new Set())

  const idleTimerRef = useRef(0)
  const currentDirRef = useRef('down') // 'down' | 'up' | 'side'
  const animTimeRef = useRef(0)
  const facingSignRef = useRef(1)      // 1: right, -1: left
  const lastStepCadenceRef = useRef(-1) // Synchronizes footsteps

  // Halt movement immediately when overlay opens, and block keys held across transition
  useEffect(() => {
    if (activeOverlay) {
      Object.keys(keysPressed.current).forEach((k) => {
        if (keysPressed.current[k]) {
          blockedKeysRef.current.add(k)
        }
      })
      keysPressed.current = {}
      waypointsRef.current = []
      activeTargetPosRef.current = null
      setCatTarget(null)
      setCatIsMoving(false)
      setIsMoving(false)
    } else {
      blockedKeysRef.current.clear()
    }
  }, [activeOverlay, setCatTarget, setCatIsMoving])

  // Keyboard navigation listeners (WASD & Arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keystrokes when typing in inputs or textareas (e.g. Contact form)
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName) || e.target?.isContentEditable) {
        return
      }
      const key = e.key.toLowerCase()
      // If this key was held down as overlay opened, ignore repeated keydowns until cleanly released
      if (blockedKeysRef.current.has(key)) {
        return
      }
      keysPressed.current[key] = true
    }
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()
      blockedKeysRef.current.delete(key)
      keysPressed.current[key] = false
    }
    const handleBlur = () => {
      keysPressed.current = {}
      blockedKeysRef.current.clear()
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useFrame(({ clock }, delta) => {
    if (!catRef.current) return
    if (!Number.isFinite(pos.x) || !Number.isFinite(pos.z)) {
      pos.set(2.0, 0, 1.2)
    }
    const speed = 12.0 * delta // Responsive movement

    // Compute Camera-Relative Movement Vectors
    const camForward = new THREE.Vector3()
    camera.getWorldDirection(camForward)
    camForward.y = 0
    camForward.normalize()

    // Screen-right vector
    const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize()

    const moveDir = new THREE.Vector3()
    const keys = keysPressed.current

    if (keys['w'] || keys['arrowup']) {
      moveDir.add(camForward)
    }
    if (keys['s'] || keys['arrowdown']) {
      moveDir.sub(camForward)
    }
    if (keys['d'] || keys['arrowright']) {
      moveDir.add(camRight)
    }
    if (keys['a'] || keys['arrowleft']) {
      moveDir.sub(camRight)
    }

    // -------------------------------------------------------------
    // Precise Oriented Bounding Box (OBB) Footbridge Check
    // Center: [30, -26.5], Rotation: 1.31 rad, Length: 15.5, Width: 6.4
    // -------------------------------------------------------------
    const bdx = pos.x - 30.0
    const bdz = pos.z - (-26.5)
    const cosB = Math.cos(1.31)
    const sinB = Math.sin(1.31)

    let localX = bdx * cosB - bdz * sinB
    let localZ = bdx * sinB + bdz * cosB
    let onBridge = Math.abs(localX) <= 8.35 && Math.abs(localZ) <= 3.2

    let moving = false

    // 1. Keyboard movement priority
    if (moveDir.lengthSq() > 0.001) {
      moving = true
      if (catTarget) setCatTarget(null)
      waypointsRef.current = []
      activeTargetPosRef.current = null

      moveDir.normalize()
      pos.x += moveDir.x * speed
      pos.z += moveDir.z * speed

      // Update facing direction relative to screen camera view with 1.25 hysteresis
      const dotForward = moveDir.dot(camForward)
      const dotRight = moveDir.dot(camRight)

      const current = currentDirRef.current
      if (current === 'up' || current === 'down') {
        if (Math.abs(dotRight) > Math.abs(dotForward) * 1.25) {
          currentDirRef.current = 'side'
          facingSignRef.current = dotRight > 0 ? 1 : -1
        } else {
          if (dotForward > 0.05) currentDirRef.current = 'up'
          else if (dotForward < -0.05) currentDirRef.current = 'down'
        }
      } else {
        if (Math.abs(dotForward) > Math.abs(dotRight) * 1.25) {
          if (dotForward > 0.05) currentDirRef.current = 'up'
          else if (dotForward < -0.05) currentDirRef.current = 'down'
        } else {
          if (Math.abs(dotRight) > 0.05) {
            facingSignRef.current = dotRight > 0 ? 1 : -1
          }
        }
      }
    } else if (!activeOverlay && catTarget && Array.isArray(catTarget) && Number.isFinite(catTarget[0]) && Number.isFinite(catTarget[2])) {
      // 2. Click-to-move with Intelligent Bridge Pathfinding
      const targetX = catTarget[0]
      const targetZ = catTarget[2]

      const prev = activeTargetPosRef.current
      const hasTargetChanged = !prev || Math.hypot(prev[0] - targetX, prev[1] - targetZ) > 0.8

      if (hasTargetChanged) {
        activeTargetPosRef.current = [targetX, targetZ]
        const startIsNorth = isNorthOfRiver(pos.x, pos.z)
        const targetIsNorth = isNorthOfRiver(targetX, targetZ)

        if (startIsNorth === targetIsNorth) {
          // Direct travel on the same bank
          waypointsRef.current = [[targetX, targetZ]]
        } else {
          // Crossing required! Check if already traversing bridge
          const activeWps = waypointsRef.current
          if (
            activeWps.length > 1 &&
            isNorthOfRiver(activeWps[activeWps.length - 1][0], activeWps[activeWps.length - 1][1]) === targetIsNorth
          ) {
            // Update final target without resetting active bridge progress
            activeWps[activeWps.length - 1] = [targetX, targetZ]
          } else if (onBridge) {
            // Already on bridge deck: route toward target bank landing
            if (targetIsNorth) {
              waypointsRef.current = [
                BRIDGE_WAYPOINTS.northLanding,
                BRIDGE_WAYPOINTS.northApproach,
                [targetX, targetZ],
              ]
            } else {
              waypointsRef.current = [
                BRIDGE_WAYPOINTS.southLanding,
                BRIDGE_WAYPOINTS.southApproach,
                [targetX, targetZ],
              ]
            }
          } else if (!startIsNorth && targetIsNorth) {
            // Traveling South -> North across footbridge to Projects Monolith
            waypointsRef.current = [
              BRIDGE_WAYPOINTS.southApproach,
              BRIDGE_WAYPOINTS.southLanding,
              BRIDGE_WAYPOINTS.center,
              BRIDGE_WAYPOINTS.northLanding,
              BRIDGE_WAYPOINTS.northApproach,
              [targetX, targetZ],
            ]
          } else {
            // Traveling North -> South across footbridge back to Hearth/Clearings
            waypointsRef.current = [
              BRIDGE_WAYPOINTS.northApproach,
              BRIDGE_WAYPOINTS.northLanding,
              BRIDGE_WAYPOINTS.center,
              BRIDGE_WAYPOINTS.southLanding,
              BRIDGE_WAYPOINTS.southApproach,
              [targetX, targetZ],
            ]
          }
        }
      }

      // Step along active waypoints
      if (waypointsRef.current.length > 0) {
        const nextWp = waypointsRef.current[0]
        const dist = Math.hypot(nextWp[0] - pos.x, nextWp[1] - pos.z)
        const isFinal = waypointsRef.current.length === 1
        const arrivalThreshold = isFinal ? 0.35 : 1.25

        if (dist > arrivalThreshold) {
          moving = true
          const step = Math.min(speed, dist)
          const dirX = (nextWp[0] - pos.x) / dist
          const dirZ = (nextWp[1] - pos.z) / dist
          pos.x += dirX * step
          pos.z += dirZ * step

          const dotForward = dirX * camForward.x + dirZ * camForward.z
          const dotRight = dirX * camRight.x + dirZ * camRight.z

          const current = currentDirRef.current
          if (current === 'up' || current === 'down') {
            if (Math.abs(dotRight) > Math.abs(dotForward) * 1.25) {
              currentDirRef.current = 'side'
              facingSignRef.current = dotRight > 0 ? 1 : -1
            } else {
              if (dotForward > 0.05) currentDirRef.current = 'up'
              else if (dotForward < -0.05) currentDirRef.current = 'down'
            }
          } else {
            if (Math.abs(dotForward) > Math.abs(dotRight) * 1.25) {
              if (dotForward > 0.05) currentDirRef.current = 'up'
              else if (dotForward < -0.05) currentDirRef.current = 'down'
            } else {
              if (Math.abs(dotRight) > 0.05) {
                facingSignRef.current = dotRight > 0 ? 1 : -1
              }
            }
          }
        } else {
          // Reached current waypoint: advance to next
          waypointsRef.current.shift()
          if (waypointsRef.current.length === 0) {
            setCatTarget(null)
            activeTargetPosRef.current = null
          }
        }
      }
    }

    // Free open meadow exploration bounds
    pos.x = THREE.MathUtils.clamp(pos.x, -165, 165)
    pos.z = THREE.MathUtils.clamp(pos.z, -165, 165)

    // Re-evaluate footbridge position after movement
    const postBdx = pos.x - 30.0
    const postBdz = pos.z - (-26.5)
    localX = postBdx * cosB - postBdz * sinB
    localZ = postBdx * sinB + postBdz * cosB
    onBridge = Math.abs(localX) <= 8.35 && Math.abs(localZ) <= 3.2

    if (onBridge) {
      // Strictly clamp cat within central bridge walkway between handrails (no railing clipping!)
      if (Math.abs(localZ) > 2.25) {
        const clampedZ = Math.sign(localZ) * 2.25
        pos.x = 30.0 + (localX * cosB + clampedZ * sinB)
        pos.z = -26.5 + (-localX * sinB + clampedZ * cosB)
      }
    } else {
      // River water collision pushout
      const { x: rx, z: rz, dist: riverDist } = getClosestPointOnPolyline(pos.x, pos.z, RIVER_POINTS)
      const riverMargin = 5.8
      if (riverDist < riverMargin && riverDist > 0.001) {
        const push = riverMargin - riverDist
        pos.x += ((pos.x - rx) / riverDist) * push
        pos.z += ((pos.z - rz) / riverDist) * push
      }
    }

    // Solid boulders, rock formations, and landmark architecture collisions
    if (moving) {
      let collidedWithObstacle = false
      const treeObs = TREE_OBSTACLES
      const totalObs = treeObs.length + LANDMARK_OBSTACLES.length
      for (let i = 0; i < totalObs; i++) {
        const ob = i < treeObs.length ? treeObs[i] : LANDMARK_OBSTACLES[i - treeObs.length]
        const dx = pos.x - ob.x
        const dz = pos.z - ob.z
        const distSq = dx * dx + dz * dz
        const minDist = ob.r + 0.4
        if (distSq < minDist * minDist && distSq > 0.0001) {
          const d = Math.sqrt(distSq)
          const push = minDist - d
          pos.x += (dx / d) * push
          pos.z += (dz / d) * push
          collidedWithObstacle = true
        }
      }
      if (collidedWithObstacle) {
        sfx.playRockBump()
      }
    }

    // Responsive curved footbridge elevation arch (no paw sinking or vertical lag!)
    const normX = Math.min(1.0, Math.abs(localX) / 7.75)
    const bridgeElevation = onBridge ? (0.18 + 0.52 * (1.0 - normX * normX)) : 0.0
    pos.y = onBridge ? bridgeElevation : THREE.MathUtils.lerp(pos.y, 0.0, 0.28)

    catRef.current.position.copy(pos)

    // Only broadcast to Zustand store when position actually changes
    const lastPos = lastBroadcastPosRef.current
    const dpx = pos.x - lastPos[0]
    const dpy = pos.y - lastPos[1]
    const dpz = pos.z - lastPos[2]
    if (moving || (dpx * dpx + dpy * dpy + dpz * dpz > 0.0001)) {
      lastBroadcastPosRef.current = [pos.x, pos.y, pos.z]
      setCatCurrentPos(lastBroadcastPosRef.current)
    }

    if (usePortfolioStore.getState().catIsMoving !== moving) {
      usePortfolioStore.setState({ catIsMoving: moving })
      setIsMoving(moving)
    }

    // --- 2D FLIPBOOK ANIMATION & DYNAMICS ---
    animTimeRef.current += delta

    if (moving) {
      idleTimerRef.current = 0
    } else {
      idleTimerRef.current += delta
    }

    let targetTexture
    let bounceY = 0
    let targetW = 1.16
    let targetH = 2.10
    let targetFacing = 1

    if (moving) {
      // 4-frame quadrupedal trot cycle at 10.0 fps
      const frameIdx = Math.floor(animTimeRef.current * 10.0) % 4
      const stepPhase = animTimeRef.current * 12.0
      bounceY = Math.abs(Math.sin(stepPhase)) * 0.035

      // Play authentic Minecraft grass footsteps (or wooden bridge steps) with natural trot cadence
      const stepCadence = Math.floor(animTimeRef.current * 3.2)
      if (stepCadence !== lastStepCadenceRef.current) {
        lastStepCadenceRef.current = stepCadence
        if (onBridge) {
          sfx.playWoodStep()
        } else {
          sfx.playGrassStep()
        }
      }

      if (currentDirRef.current === 'side') {
        const sideFrameIdx = Math.floor(animTimeRef.current * 7.5) % walkSideTextures.length
        targetTexture = walkSideTextures[sideFrameIdx]
        targetW = 2.44
        targetH = 2.05
        targetFacing = facingSignRef.current
      } else if (currentDirRef.current === 'up') {
        targetTexture = walkUpTextures[frameIdx]
        targetW = 1.12
        targetH = 2.10
        targetFacing = 1
      } else {
        targetTexture = walkDownTextures[frameIdx]
        targetW = 1.16
        targetH = 2.10
        targetFacing = 1
      }
    } else {
      // Cat is Idle
      bounceY = 0

      if (idleTimerRef.current >= 10.0) {
        // Sitting pose on haunches with wagging tail after 10+ seconds
        // Two frames only: tail wags up and down on the left (never goes to the right)
        const wagIdx = Math.floor(animTimeRef.current * 2.2) % 2
        targetTexture = sitTextures[wagIdx]
        targetW = 1.30
        targetH = 2.15
        targetFacing = 1
      } else {
        // Stage 1: Living standing idle (0 to 10 seconds)
        // Alive and alert with subtle tail swish, head posture, and gentle breathing
        const breath = Math.sin(animTimeRef.current * 2.8) * 0.025

        if (currentDirRef.current === 'up') {
          // Standing rear view: gentle tail swish between frame 0 and 3
          const rearSeq = [0, 0, 1, 2, 3, 2, 1, 0]
          const rearIdx = Math.floor(animTimeRef.current * 2.2) % rearSeq.length
          targetTexture = walkUpTextures[rearSeq[rearIdx]]
          targetW = 1.12
          targetH = 2.10 + breath
          targetFacing = 1
        } else {
          // Standing 3/4 front/side view: living posture with tail swish and head turn
          const idleSeq = [0, 0, 1, 2, 3, 2, 1, 0]
          const idleIdx = Math.floor(animTimeRef.current * 2.2) % idleSeq.length
          targetTexture = idleTextures[idleSeq[idleIdx]]
          targetW = 1.60
          targetH = 2.05 + breath
          targetFacing = currentDirRef.current === 'side' ? facingSignRef.current : 1
        }
      }
    }

    if (matRef.current && targetTexture && matRef.current.map !== targetTexture) {
      matRef.current.map = targetTexture
      matRef.current.needsUpdate = true
    }

    if (spriteMeshRef.current) {
      // Direct, undistorted scale: sprite aspect ratio is always 100% faithful, never squashed through zero width!
      spriteMeshRef.current.scale.set(targetFacing * targetW, targetH, 1.0)
      // Keep paws positioned right at ground level
      spriteMeshRef.current.position.y = (targetH * 0.49) + bounceY
    }

    if (shadowRef.current) {
      const isSide = currentDirRef.current === 'side' && idleTimerRef.current < 10.0
      const shadowW = (isSide ? 0.62 : 0.46) * (moving ? (1.0 - bounceY * 0.5) : 1.0)
      const shadowH = 0.44 * (moving ? (1.0 - bounceY * 0.5) : 1.0)
      shadowRef.current.scale.set(shadowW, shadowH, 1.0)
    }
  })

  return (
    <group>
      {/* Click-to-Move Target Beacon Ring */}
      {isMoving && catTarget && (
        <group position={[catTarget[0], 0.04, catTarget[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <ringGeometry args={[0.3, 0.45, 24]} />
            <meshBasicMaterial color="#a7f3d0" transparent opacity={0.65} />
          </mesh>
          <pointLight color="#a7f3d0" intensity={1.2} distance={2.5} />
        </group>
      )}

      {/* The Charming 2D Animated Black Traveler Cat */}
      <group ref={catRef} position={[pos.x, 0, pos.z]}>
        {/* Soft Contact Shadow on Ground & Wooden Bridge Deck */}
        <mesh
          ref={shadowRef}
          position={[0, 0.04, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
          renderOrder={10}
        >
          <circleGeometry args={[1, 20]} />
          <meshBasicMaterial
            color="#081408"
            transparent
            opacity={0.38}
            depthTest={true}
            depthWrite={false}
            polygonOffset={true}
            polygonOffsetFactor={-3}
            polygonOffsetUnits={-3}
          />
        </mesh>

        {/* 2D Billboarded Animated Cat Quad */}
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          <mesh ref={spriteMeshRef} position={[0, 0.95, 0]} raycast={() => null} renderOrder={20}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              ref={matRef}
              map={walkDownTextures[0]}
              transparent
              alphaTest={0.08}
              side={THREE.DoubleSide}
              depthWrite={true}
            />
          </mesh>
        </Billboard>
      </group>
    </group>
  )
}
