import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { SleepingCatRugSprite } from './Sprites2D'

// ─────────────────────────────────────────────────────────────
// Dynamic Animated Cartoon Flames (Wayfinder Storybook Fire)
// 6-frame hand-painted animated flame tongues with licking tips,
// incandescent core glow, pulsing ember bed, and cozy firelight!
// 100% clean alpha, zero cropping artifacts, zero pink/white fringe.
// ─────────────────────────────────────────────────────────────
const DynamicCartoonFlames = () => {
  const frontFlameRef = useRef()
  const crossFlameRef = useRef()
  const coreFlameRef = useRef()
  const coalsRef = useRef()
  const lightRef = useRef()

  // Preload 6 clean hand-painted cartoon flame frames
  const flameTextures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const tex = loader.load(`/assets/props/fire_${i}.png`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [])

  // 1. River Stone Hearth Ring (12 3D low-poly rocks)
  const stones = useMemo(() => {
    let seed = 4411
    const prng = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const list = []
    const count = 12
    const radius = 1.35
    const colors = ['#566370', '#47535e', '#617180', '#3e4a54', '#6b7a88']

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (prng() - 0.5) * 0.15
      const r = radius + (prng() - 0.5) * 0.22
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      const sx = 0.28 + prng() * 0.14
      const sy = 0.20 + prng() * 0.10
      const sz = 0.26 + prng() * 0.12

      list.push({
        pos: [x, sy * 0.85, z],
        scale: [sx, sy, sz],
        rot: [prng() * 0.4, prng() * Math.PI * 2, prng() * 0.4],
        color: colors[Math.floor(prng() * colors.length)],
      })
    }
    return list
  }, [])

  // 2. Charred Timber Teepee Logs (6 3D logs leaning inward)
  const teepeeLogs = useMemo(() => {
    const list = []
    const count = 6
    const radius = 0.82
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 2 === 0 ? 0.1 : -0.1)
      const xBase = Math.cos(angle) * radius
      const zBase = Math.sin(angle) * radius
      const xTop = (Math.random() - 0.5) * 0.16
      const zTop = (Math.random() - 0.5) * 0.16
      const yTop = 1.25

      const start = new THREE.Vector3(xBase, 0.1, zBase)
      const end = new THREE.Vector3(xTop, yTop, zTop)
      const mid = start.clone().add(end).multiplyScalar(0.5)
      const dir = end.clone().sub(start)
      const len = dir.length()

      const orientation = new THREE.Matrix4()
      orientation.lookAt(start, end, new THREE.Vector3(0, 1, 0))
      const rot = new THREE.Euler().setFromRotationMatrix(orientation)

      list.push({
        pos: [mid.x, mid.y, mid.z],
        rot: [rot.x + Math.PI / 2, rot.y, rot.z],
        len: len,
      })
    }
    return list
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Dynamic Flame Frame Cycling (~11 fps)
    const frameIdx = Math.floor(t * 11) % flameTextures.length
    const currentTex = flameTextures[frameIdx]

    if (frontFlameRef.current && frontFlameRef.current.material.map !== currentTex) {
      frontFlameRef.current.material.map = currentTex
      frontFlameRef.current.material.needsUpdate = true
    }

    if (crossFlameRef.current && crossFlameRef.current.material.map !== currentTex) {
      crossFlameRef.current.material.map = currentTex
      crossFlameRef.current.material.needsUpdate = true
    }

    if (coreFlameRef.current && coreFlameRef.current.material.map !== currentTex) {
      coreFlameRef.current.material.map = currentTex
      coreFlameRef.current.material.needsUpdate = true
    }

    // Dynamic stretching / licking animation
    const stretchY = 1.0 + Math.sin(t * 15) * 0.07 + Math.cos(t * 22) * 0.04
    const squishX = 1.0 + Math.cos(t * 12) * 0.05
    if (frontFlameRef.current) {
      frontFlameRef.current.scale.set(squishX * 1.6, stretchY * 2.1, 1.0)
    }
    if (crossFlameRef.current) {
      crossFlameRef.current.scale.set(squishX * 1.45, stretchY * 1.95, 1.0)
    }
    if (coreFlameRef.current) {
      coreFlameRef.current.scale.set(squishX * 1.25, stretchY * 1.65, 1.0)
    }

    // 2. Coals glowing pulse
    if (coalsRef.current) {
      const emissivePulse = 2.0 + Math.sin(t * 7) * 0.4
      coalsRef.current.material.emissiveIntensity = emissivePulse
    }

    // 3. Dynamic flickering point light
    if (lightRef.current) {
      lightRef.current.intensity = 4.8 + Math.sin(t * 16) * 0.7 + Math.cos(t * 28) * 0.4
    }
  })

  return (
    <group name="dynamic-cartoon-campfire">
      {/* A. 3D River Stone Hearth */}
      {stones.map((st, i) => (
        <mesh key={i} position={st.pos} rotation={st.rot} scale={st.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={st.color} roughness={0.9} flatShading />
        </mesh>
      ))}

      {/* B. Glowing 3D Charcoal / Ember Bed (Properly sized to stay inside rocks) */}
      <mesh ref={coalsRef} position={[0, 0.10, 0]}>
        <cylinderGeometry args={[0.72, 0.85, 0.18, 10]} />
        <meshStandardMaterial
          color="#180a03"
          emissive="#ff3e00"
          emissiveIntensity={2.0}
          roughness={0.95}
        />
      </mesh>

      {/* C. 3D Charred Timber Teepee Logs */}
      {teepeeLogs.map((log, i) => (
        <mesh key={i} position={log.pos} rotation={log.rot}>
          <cylinderGeometry args={[0.10, 0.14, log.len, 7]} />
          <meshStandardMaterial
            color="#22140c"
            roughness={0.88}
            emissive="#782408"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}

      {/* D. Volumetric 3D Cross-Plane Flame Tongue Quads */}
      {/* 1. Cross-Plane Angle 1 */}
      <mesh ref={crossFlameRef} position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={flameTextures[0]}
          transparent
          alphaTest={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Cross-Plane Angle 2 */}
      <mesh position={[0, 1.05, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <planeGeometry args={[1.4, 1.9]} />
        <meshBasicMaterial
          map={flameTextures[1]}
          transparent
          alphaTest={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Camera-Facing Primary Animated Flame Billboard */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh ref={frontFlameRef} position={[0, 1.05, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={flameTextures[0]}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* 4. Glowing Additive Incandescent Core Heart */}
        <mesh ref={coreFlameRef} position={[0, 0.92, 0.02]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={flameTextures[0]}
            color="#ffee88"
            transparent
            blending={THREE.AdditiveBlending}
            opacity={0.65}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </Billboard>

      {/* E. Dynamic Flickering Warm Point Light */}
      <pointLight
        ref={lightRef}
        position={[0, 1.25, 0]}
        color="#ff7b25"
        intensity={4.8}
        distance={15}
        decay={2}
      />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// Upgraded 2D Cartoon Campsite Props
// Spaced out naturally so they don't clip through benches!
// Hand-painted 2D cartoon gouache style matching Wayfinder.
// ─────────────────────────────────────────────────────────────
const CampsiteProps = () => {
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  const crateTex = useMemo(() => {
    const t = loader.load('/assets/props/prop_travel_crate.png')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [loader])

  const barrelTex = useMemo(() => {
    const t = loader.load('/assets/props/prop_timber_barrel.png')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [loader])

  const bucketTex = useMemo(() => {
    const t = loader.load('/assets/props/prop_water_bucket.png')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [loader])

  const kettleTex = useMemo(() => {
    const t = loader.load('/assets/props/prop_iron_kettle.png')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [loader])

  return (
    <group name="upgraded-campsite-props">
      {/* 1. 2D Cartoon Wooden Crate (North-West clearing) */}
      <group position={[-2.8, 0, -4.2]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.6, 0.8, 1]}>
          <circleGeometry args={[0.5, 16]} />
          <meshBasicMaterial color="#0b140c" transparent opacity={0.35} />
        </mesh>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          <mesh position={[0, 0.75, 0]}>
            <planeGeometry args={[1.7, 1.55]} />
            <meshBasicMaterial map={crateTex} transparent alphaTest={0.12} side={THREE.DoubleSide} />
          </mesh>
        </Billboard>
      </group>

      {/* 2. 2D Cartoon Oak Timber Barrel (Beside Crate) */}
      <group position={[-1.2, 0, -4.5]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.48, 16]} />
          <meshBasicMaterial color="#0b140c" transparent opacity={0.35} />
        </mesh>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          <mesh position={[0, 0.8, 0]}>
            <planeGeometry args={[1.35, 1.6]} />
            <meshBasicMaterial map={barrelTex} transparent alphaTest={0.12} side={THREE.DoubleSide} />
          </mesh>
        </Billboard>
      </group>

      {/* 3. 2D Cartoon Water Bucket (Near West Bench) */}
      <group position={[-4.5, 0, -1.2]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 14]} />
          <meshBasicMaterial color="#0b140c" transparent opacity={0.32} />
        </mesh>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          <mesh position={[0, 0.55, 0]}>
            <planeGeometry args={[1.0, 1.15]} />
            <meshBasicMaterial map={bucketTex} transparent alphaTest={0.12} side={THREE.DoubleSide} />
          </mesh>
        </Billboard>
      </group>

      {/* 4. 2D Cartoon Cast Iron Kettle (Resting on flat hearth stone near flames) */}
      <group position={[1.25, 0.15, 0.6]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.32, 12]} />
          <meshBasicMaterial color="#0b140c" transparent opacity={0.32} />
        </mesh>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          <mesh position={[0, 0.38, 0]}>
            <planeGeometry args={[0.85, 0.85]} />
            <meshBasicMaterial map={kettleTex} transparent alphaTest={0.12} side={THREE.DoubleSide} />
          </mesh>
        </Billboard>
        {/* Soft Kettle Steam Sparkles */}
        <Sparkles
          count={5}
          scale={[0.3, 0.6, 0.3]}
          position={[0, 0.75, 0]}
          size={1.5}
          speed={0.8}
          color="#ffffff"
        />
      </group>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// Fallen Timber Log Bench
// Horizontal mossy wood logs placed around the campfire for seating
// ─────────────────────────────────────────────────────────────
const FallenLogBench = ({ position = [0, 0, 0], rotation = [0, 0, 0], length = 3.8, radius = 0.42 }) => {
  const logTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#2c1b12'
    ctx.fillRect(0, 0, 256, 128)

    for (let i = 0; i < 28; i++) {
      const y = Math.random() * 128
      ctx.strokeStyle = Math.random() > 0.5 ? '#422a1c' : '#1e120b'
      ctx.lineWidth = 1.5 + Math.random() * 3.0
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(80, y + (Math.random() * 16 - 8), 160, y + (Math.random() * 16 - 8), 256, y)
      ctx.stroke()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length + 0.6, radius * 2.8]} />
        <meshBasicMaterial color="#121a0e" transparent opacity={0.45} />
      </mesh>

      <mesh position={[0, radius * 0.85, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius * 1.05, length, 12]} />
        <meshStandardMaterial
          map={logTexture}
          roughness={0.88}
          color="#8a6346"
        />
      </mesh>
    </group>
  )
}

export const Campfire = ({ position = [0, 0, 0] }) => {
  return (
    <group position={position}>
      {/* 1. Fallen Timber Log Benches */}
      <FallenLogBench position={[0.2, 0, -3.2]} rotation={[0, 0.12, 0]} length={4.2} />
      <FallenLogBench position={[-3.6, 0, -0.6]} rotation={[0, 1.45, 0]} length={3.8} />
      <FallenLogBench position={[-2.4, 0, 3.2]} rotation={[0, 0.55, 0]} length={3.6} />
      <FallenLogBench position={[2.8, 0, 2.8]} rotation={[0, -0.65, 0]} length={3.8} />

      {/* 2. Upgraded 2D Cartoon Campsite Props (Chest, Barrel, Bucket, Kettle) */}
      <CampsiteProps />

      {/* 3. Dynamic Cartoon Animated Campfire (Stone hearth, glowing coals, animated flames, light) */}
      <DynamicCartoonFlames />

      {/* 4. Cozy Woven Traveler Rug with Sleeping Black Cat (Clean position beside hearth) */}
      <SleepingCatRugSprite position={[2.4, 0, -1.2]} scale={0.9} />

      {/* 5. Warm Ambient Floating Embers & Dust Motes */}
      <Sparkles
        count={28}
        scale={[2.2, 3.8, 2.2]}
        position={[0, 1.6, 0]}
        size={3.0}
        speed={1.4}
        noise={0.6}
        color="#ffaa33"
      />
    </group>
  )
}
