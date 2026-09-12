import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { usePortfolioStore } from '../../../store/usePortfolioStore'

/**
 * WildFoxes
 * 2D Animated Red Storybook Wild Foxes in prominent, clearly visible locations.
 * - Sized generously (2.8 - 3.2 units) matching the traveler cat (no tiny pea foxes!)
 * - Placed right near spawn / campfire clearing edge and along scenic trails
 * - 1. Campfire clearing sitting alert fox watching the player cat
 * - 2. Campfire tree root curled sleeping fox with breathing cycle
 * - 3. River path sitting fox
 * - 4. Meadow overlook curled sleeping fox
 */

const FOX_SPAWNS = [
  // 1. Sitting alert fox right at the Campfire spawn clearing edge (Immediately visible on load!)
  { type: 'sit', pos: [8.5, 0.05, 4.5], scale: 2.8, shadowR: 0.85 },
  // 2. Curled sleeping fox nestled peacefully under the oak tree by the campsite
  { type: 'sleep', pos: [-7.8, 0.05, -5.8], scale: 2.7, shadowR: 0.95 },
  // 3. Sitting fox along the sunny trail heading toward the footbridge
  { type: 'sit', pos: [22.0, 0.05, -9.0], scale: 2.9, shadowR: 0.88 },
  // 4. Curled sleeping fox in the sunlit meadow flower bed
  { type: 'sleep', pos: [38.0, 0.05, 8.0], scale: 2.6, shadowR: 0.92 },
]

export const WildFoxes = () => {
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  // 1. Preload sleeping and sitting fox textures (cache-busted v=9)
  const sleepTextures = useMemo(() => {
    return [0, 1].map((i) => {
      const tex = loader.load(`/assets/fauna/fox_sleep_${i}.png?v=9`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const sitTextures = useMemo(() => {
    return [0, 1].map((i) => {
      const tex = loader.load(`/assets/fauna/fox_sit_${i}.png?v=9`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const meshRefs = useRef([])
  const matRefs = useRef([])
  const stateRefs = useRef(
    FOX_SPAWNS.map((f) => ({
      frame: 0,
      timer: Math.random() * 2.0,
      actionDuration: 0,
      type: f.type,
    }))
  )

  useFrame((_, delta) => {
    const time = performance.now() * 0.001
    const catPos = usePortfolioStore.getState().catCurrentPos

    FOX_SPAWNS.forEach((spawn, idx) => {
      const mesh = meshRefs.current[idx]
      const mat = matRefs.current[idx]
      const st = stateRefs.current[idx]
      if (!mesh || !mat) return

      if (spawn.type === 'sleep') {
        // Slow rhythmic breathing cycle
        st.timer += delta
        if (st.timer >= 1.6) {
          st.timer = 0
          st.frame = (st.frame + 1) % 2
          mat.map = sleepTextures[st.frame]
          mat.needsUpdate = true
        }
        // Subtle chest expansion bob
        const breath = 1.0 + Math.sin(time * 2.0 + idx) * 0.03
        mesh.scale.set(spawn.scale * 1.25 * breath, spawn.scale * 0.95 * breath, 1)
      } else {
        // Sitting Fox: Watch player cat if close
        let isCatClose = false
        if (catPos) {
          const dx = catPos[0] - spawn.pos[0]
          const dz = catPos[2] - spawn.pos[2]
          isCatClose = dx * dx + dz * dz < 42.0 // Within 6.5 units
        }

        if (isCatClose) {
          // Alert head-tilt tracking cat
          st.frame = 1
          st.timer = 0
        } else {
          st.timer += delta
          if (st.actionDuration > 0) {
            st.actionDuration -= delta
            if (st.actionDuration <= 0) {
              st.frame = 0
            }
          } else if (st.timer >= 3.8) {
            st.timer = 0
            st.frame = 1
            st.actionDuration = 0.9
          }
        }

        if (mat.map !== sitTextures[st.frame]) {
          mat.map = sitTextures[st.frame]
          mat.needsUpdate = true
        }
        mesh.scale.set(spawn.scale * 1.05, spawn.scale * 1.15, 1)
      }
    })
  })

  return (
    <group name="WildFoxesGroup">
      {FOX_SPAWNS.map((spawn, idx) => (
        <group key={idx} position={spawn.pos}>
          {/* Ground Shadow */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, 0]}
            renderOrder={9}
          >
            <circleGeometry args={[spawn.shadowR, 20]} />
            <meshBasicMaterial
              color="#0a1a0d"
              transparent
              opacity={0.36}
              depthWrite={false}
            />
          </mesh>

          {/* 2D Billboard Fox */}
          <Billboard
            follow
            lockX={false}
            lockY={false}
            lockZ={false}
            position={[0, spawn.type === 'sleep' ? spawn.scale * 0.45 : spawn.scale * 0.62, 0]}
          >
            <mesh
              ref={(el) => (meshRefs.current[idx] = el)}
              renderOrder={15}
            >
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                ref={(el) => (matRefs.current[idx] = el)}
                map={spawn.type === 'sleep' ? sleepTextures[0] : sitTextures[0]}
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
