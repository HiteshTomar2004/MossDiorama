import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RIVER_POINTS } from '../mapConfig'

/**
 * RiverFish
 * 2D Animated Koi Fish swimming smoothly head-first along the winding river.
 * - Tangent-aligned heading so fish swim directly with the river current (no sideways sliding!)
 * - Plump Japanese Kohaku Nishikigoi textures with 3-frame undulating veil tail
 * - S-curve sinusoidal swimming path and expanding water ripple rings
 */

const FISH_CONFIGS = [
  { initialU: 0.33, lateralOffset: -1.2, speed: 0.012, scale: 1.25, phase: 0.0, variant: 'black_red' },
  { initialU: 0.38, lateralOffset: 0.9, speed: 0.010, scale: 1.1, phase: 1.5, variant: 'kohaku' },
  { initialU: 0.43, lateralOffset: -0.6, speed: 0.014, scale: 1.35, phase: 3.1, variant: 'black_red' },
  { initialU: 0.48, lateralOffset: 1.3, speed: 0.011, scale: 1.15, phase: 4.2, variant: 'kohaku' },
  { initialU: 0.53, lateralOffset: -1.0, speed: 0.013, scale: 1.2, phase: 0.8, variant: 'black_red' },
  { initialU: 0.58, lateralOffset: 0.8, speed: 0.010, scale: 1.05, phase: 2.3, variant: 'kohaku' },
  { initialU: 0.63, lateralOffset: -1.3, speed: 0.012, scale: 1.3, phase: 5.0, variant: 'black_red' },
]

export const RiverFish = () => {
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  // 1. Preload 3-frame koi textures
  const textures = useMemo(() => {
    return [0, 1, 2].map((i) => {
      const tex = loader.load(`/assets/fauna/fish_${i}.png?v=9`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  const blackTextures = useMemo(() => {
    return [0, 1, 2].map((i) => {
      const tex = loader.load(`/assets/fauna/fish_black_${i}.png?v=1`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  // 2. Build river spline curve
  const riverCurve = useMemo(() => {
    const pts = RIVER_POINTS.map((p) => new THREE.Vector3(p[0], 0, p[1]))
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
  }, [])

  const fishGroupRefs = useRef([])
  const matRefs = useRef([])
  const rippleRefs = useRef([])
  const stateRefs = useRef(
    FISH_CONFIGS.map((cfg) => ({
      u: cfg.initialU,
      frame: 0,
      frameTimer: 0,
      rippleTimer: Math.random() * 2.0,
      rippleScale: 0.2,
      rippleAlpha: 0.4,
    }))
  )

  useFrame((_, delta) => {
    const time = performance.now() * 0.001

    FISH_CONFIGS.forEach((cfg, idx) => {
      const grp = fishGroupRefs.current[idx]
      const mat = matRefs.current[idx]
      const ripple = rippleRefs.current[idx]
      const st = stateRefs.current[idx]
      if (!grp) return

      // Advance along curve (looping within scenic river reach u: 0.30 to 0.70)
      st.u += cfg.speed * delta
      if (st.u > 0.68) st.u = 0.31

      // 3-frame tail wag (~6 fps)
      st.frameTimer += delta
      if (st.frameTimer >= 0.16) {
        st.frameTimer = 0
        st.frame = (st.frame + 1) % 3
        if (mat) {
          mat.map = (cfg.variant === 'black_red' ? blackTextures : textures)[st.frame]
          mat.needsUpdate = true
        }
      }

      // Sample curve point and tangent
      const pt = riverCurve.getPointAt(st.u)
      const tangent = riverCurve.getTangentAt(st.u)
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()

      // Sinusoidal S-curve weaving
      const weave = Math.sin(time * 2.6 + cfg.phase) * 0.38
      const currentOffset = cfg.lateralOffset + weave

      const posX = pt.x + normal.x * currentOffset
      const posZ = pt.z + normal.z * currentOffset

      grp.position.set(posX, 0.05, posZ)

      // Calculate yaw: Head points downstream with current (180 deg flipped from previous upstream orientation)
      const baseAngle = Math.atan2(tangent.x, tangent.z) + Math.PI
      const steerAngle = Math.cos(time * 2.6 + cfg.phase) * 0.18
      grp.rotation.set(0, baseAngle + steerAngle, 0)

      // Update soft water ripple ring trailing behind fish
      if (ripple) {
        st.rippleTimer += delta
        if (st.rippleTimer > 2.0) {
          st.rippleTimer = 0
          st.rippleScale = 0.2
          st.rippleAlpha = 0.4
          ripple.position.set(posX - tangent.x * 0.6, 0.04, posZ - tangent.z * 0.6)
        } else {
          st.rippleScale += delta * 0.6
          st.rippleAlpha = Math.max(0, 0.4 * (1.0 - st.rippleTimer / 2.0))
          ripple.scale.set(st.rippleScale, st.rippleScale, 1)
          if (ripple.material) {
            ripple.material.opacity = st.rippleAlpha
          }
        }
      }
    })
  })

  return (
    <group name="RiverFishGroup">
      {FISH_CONFIGS.map((cfg, idx) => (
        <React.Fragment key={idx}>
          {/* Water ripple ring behind fish */}
          <mesh
            ref={(el) => (rippleRefs.current[idx] = el)}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, 0]}
          >
            <ringGeometry args={[0.3, 0.5, 18]} />
            <meshBasicMaterial
              color="#e0f7fa"
              transparent
              opacity={0.3}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Oriented Fish Group: Yaw handles river flow direction */}
          <group ref={(el) => (fishGroupRefs.current[idx] = el)}>
            {/* Plane lies flat on water surface. Local +Y is the fish head pointing along +Z! */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              renderOrder={5}
            >
              <planeGeometry args={[1.1 * cfg.scale, 2.2 * cfg.scale]} />
              <meshBasicMaterial
                ref={(el) => (matRefs.current[idx] = el)}
                map={(cfg.variant === 'black_red' ? blackTextures : textures)[0]}
                transparent
                alphaTest={0.06}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </React.Fragment>
      ))}
    </group>
  )
}
