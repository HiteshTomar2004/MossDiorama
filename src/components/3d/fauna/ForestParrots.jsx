import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

/**
 * ForestParrots
 * 2D Animated Perched Songbirds / Parrots.
 * - Perched naturally on campfire logs, bridge railings, and mossy boulders
 * - 3-frame sprite animation (perched calm, curious head-tilt, wing flutter)
 * - Proximity wing-flutter and melodic birdsong chirp when the cat approaches
 */

const PARROT_SPAWNS = [
  { pos: [2.2, 0.75, -3.4], scale: 1.75, phase: 0.2 },   // Campfire bench north
  { pos: [-3.0, 0.75, 2.2], scale: 1.7, phase: 1.8 },   // Campfire bench south
  { pos: [28.4, 1.65, -24.6], scale: 1.8, phase: 3.4 }, // Wooden bridge south rail
  { pos: [31.6, 1.65, -28.4], scale: 1.75, phase: 4.9 },// Wooden bridge north rail
  { pos: [-94.5, 1.05, 76.0], scale: 1.8, phase: 2.1 }, // Boulder near Whispering Well
  { pos: [81.0, 0.95, 83.0], scale: 1.7, phase: 0.9 },  // Fence rail near Traveler's Cabin
]

export const ForestParrots = () => {
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  // 1. Preload parrot textures (cache-busted v=9)
  const textures = useMemo(() => {
    return [0, 1, 2].map((i) => {
      const tex = loader.load(`/assets/fauna/parrot_${i}.png?v=9`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const meshRefs = useRef([])
  const matRefs = useRef([])
  const stateRefs = useRef(
    PARROT_SPAWNS.map((p) => ({
      frame: 0,
      idleTimer: Math.random() * 4.0,
      actionDuration: 0,
      flutterTimer: 0,
      isFluttering: false,
      flutterCooldown: Math.random() * 2.0,
      phase: p.phase,
    }))
  )

  useFrame((_, delta) => {
    const time = performance.now() * 0.001
    const catPos = usePortfolioStore.getState().catCurrentPos

    PARROT_SPAWNS.forEach((spawn, idx) => {
      const mesh = meshRefs.current[idx]
      const mat = matRefs.current[idx]
      const st = stateRefs.current[idx]
      if (!mesh || !mat) return

      st.flutterCooldown = Math.max(0, st.flutterCooldown - delta)

      // Check cat proximity
      if (catPos && !st.isFluttering && st.flutterCooldown <= 0) {
        const dx = catPos[0] - spawn.pos[0]
        const dz = catPos[2] - spawn.pos[2]
        const distSq = dx * dx + dz * dz

        if (distSq < 30.0) {
          st.isFluttering = true
          st.flutterTimer = 1.3
          st.flutterCooldown = 4.5
          sfx.playBirdChirp()
        }
      }

      // Gentle vertical perching breathing bob
      const bob = Math.sin(time * 2.2 + st.phase) * 0.02
      mesh.position.y = spawn.pos[1] + bob

      // Handle Flutter Animation
      if (st.isFluttering) {
        st.flutterTimer -= delta
        if (st.flutterTimer <= 0) {
          st.isFluttering = false
          st.frame = 0
        } else {
          // Rapid flutter between frame 0 and frame 2
          const flutterPhase = Math.floor((time * 12.0) % 2)
          st.frame = flutterPhase === 0 ? 0 : 2
        }
      } else {
        // Idle Animation Cycle
        st.idleTimer += delta
        if (st.actionDuration > 0) {
          st.actionDuration -= delta
          if (st.actionDuration <= 0) {
            st.frame = 0
          }
        } else if (st.idleTimer >= 4.0) {
          st.idleTimer = 0
          const isTilt = Math.random() < 0.7
          st.frame = isTilt ? 1 : 2
          st.actionDuration = isTilt ? 0.7 : 0.4
        }
      }

      if (mat.map !== textures[st.frame]) {
        mat.map = textures[st.frame]
        mat.needsUpdate = true
      }
    })
  })

  return (
    <group name="ForestParrotsGroup">
      {PARROT_SPAWNS.map((spawn, idx) => (
        <Billboard
          key={idx}
          ref={(el) => (meshRefs.current[idx] = el)}
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
          position={spawn.pos}
        >
          <mesh scale={[spawn.scale * 1.05, spawn.scale * 1.15, 1]} renderOrder={16}>
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
      ))}
    </group>
  )
}
