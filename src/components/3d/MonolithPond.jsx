import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Billboard } from '@react-three/drei'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────
// Authentic Wayfinder Watercolor Mountain Lake
// Shader and watercolor flow identical to RiverWater:
// - deepColor: #22799e (Luminous gouache teal-cerulean)
// - midColor: #389ec4 (Bright storybook sky turquoise)
// - shallowColor: #78cde3 (Pale sea-glass watercolor wash)
// - shoreGlowColor: #c2edf7 (Delicate paper-wash rim)
// - Pure white painted chalk rim (#ffffff)
// - Flowing paper ripples matching river frequency
// - Authentic hand-painted storybook rock assets on dry shoreline bank
// - Chill, peaceful swimming koi fish with animated tails & wake ripples
// ─────────────────────────────────────────────────────────────────
const LakeWaterShader = {
  uniforms: {
    time: { value: 0 },
    deepColor: { value: new THREE.Color('#22799e') },       // Exact RiverWater teal
    midColor: { value: new THREE.Color('#389ec4') },        // Exact RiverWater turquoise
    shallowColor: { value: new THREE.Color('#78cde3') },    // Exact RiverWater sea-glass
    shoreGlowColor: { value: new THREE.Color('#c2edf7') },  // Exact RiverWater shore rim
  },
  vertexShader: /* glsl */ `
    uniform float time;
    attribute float shore;
    varying float vShore;
    varying vec3 vWorldPos;

    void main() {
      vShore = shore;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float time;
    uniform vec3 deepColor;
    uniform vec3 midColor;
    uniform vec3 shallowColor;
    uniform vec3 shoreGlowColor;

    varying float vShore;
    varying vec3 vWorldPos;

    void main() {
      // 1. Soft, luminous watercolor gradient matching RiverWater
      vec3 col = mix(deepColor, midColor, smoothstep(0.0, 0.55, vShore));
      col = mix(col, shallowColor, smoothstep(0.50, 0.88, vShore));

      // 2. Flowing watercolor surface ripples (matching RiverWater spatial scale & speed)
      float flow = time * 0.45;
      float streak1 = sin(vWorldPos.x * 0.52 - flow * 4.2 + sin(vWorldPos.z * 0.28 + time * 0.5) * 1.6);
      float streak2 = cos(vWorldPos.x * 0.76 - flow * 5.6 + cos(vWorldPos.z * 0.36 - time * 0.4) * 1.4);
      float flowFoam = smoothstep(0.85, 0.98, streak1 * 0.5 + streak2 * 0.5);

      // Delicate micro-current ripples
      float currentLine = sin(vWorldPos.z * 0.58 + sin(vWorldPos.x * 0.48 - flow * 2.8) * 1.3);
      float currentFoam = smoothstep(0.92, 0.99, currentLine) * 0.28;

      // Blend subtle flowing white painted ripples
      float foamCombined = (flowFoam * 0.42 + currentFoam) * (1.0 - vShore * 0.35);
      col = mix(col, vec3(0.94, 0.98, 1.0), foamCombined);

      // 3. Delicate chalk white painted rim at shoreline
      float shoreGlow = smoothstep(0.72, 0.92, vShore);
      col = mix(col, shoreGlowColor, shoreGlow * 0.65);

      float whiteRim = smoothstep(0.91, 0.98, vShore);
      col = mix(col, vec3(1.0, 1.0, 1.0), whiteRim * 0.82);

      // 4. Soft edge feather so water rests naturally on watercolor paper
      float alpha = mix(0.94, 0.72, smoothstep(0.92, 1.0, vShore));

      gl_FragColor = vec4(col, alpha);
    }
  `,
}

// ─────────────────────────────────────────────────────────────────
// Scenic Shoreline Rock Configurations (Using authentic hand-painted assets)
// Placed on dry land along the bank just outside the organic shoreline
// ─────────────────────────────────────────────────────────────────
const SHORELINE_ROCKS = [
  // 1. Northeast Bank (towards conifer forest)
  { type: 'riverSlate', pos: [-8.8, 0, -5.8], size: [3.2, 2.0], scale: 1.1, shadowR: 1.4 },
  { type: 'paintedPebbles', pos: [-7.8, 0, -6.8], size: [2.2, 1.6], scale: 0.85, shadowR: 0.9 },

  // 3. East Bank (Vistas side)
  { type: 'shelfBoulder', pos: [9.8, 0, -4.6], size: [3.2, 3.2], scale: 1.0, shadowR: 1.5 },
  { type: 'riverSlate', pos: [10.5, 0, -3.0], size: [3.2, 2.0], scale: 0.95, shadowR: 1.3 },

  // 3. South Bank
  { type: 'mossBoulder', pos: [9.0, 0, 5.5], size: [3.4, 2.2], scale: 0.95, shadowR: 1.4 },
  { type: 'paintedPebbles', pos: [9.8, 0, 6.4], size: [2.2, 1.6], scale: 0.85, shadowR: 0.9 },

  // 4. Top-Left Bank: Horizontal Ancient Megalith Slab (Standing stone laid flat)
  {
    type: 'standingStone',
    pos: [-9.4, 0, 4.8],
    size: [2.6, 5.2],
    scale: 0.95,
    rotationZ: Math.PI / 2 - 0.12,
    shadowScale: [2.5, 1.1],
    shadowRot: 0.35,
  },
  {
    type: 'paintedPebbles',
    pos: [-8.6, 0, 6.0],
    size: [2.2, 1.6],
    scale: 0.85,
    shadowR: 0.9,
  },

  // 5. User-specified Vertical Standing Stone (Exact world coordinates: X: 100.6, Z: -84.8)
  {
    type: 'standingStone',
    pos: [-0.9, 0, -7.8],
    size: [2.6, 5.2],
    scale: 1.0,
    shadowR: 1.45,
  },
]

// ─────────────────────────────────────────────────────────────────
// Chill Koi Fish Configurations (Swimming in deep water)
// ─────────────────────────────────────────────────────────────────
const KOI_CONFIGS = [
  // Fish 1: Big Kohaku cruising counter-clockwise
  { a: 4.8, b: 3.6, speed: 0.22, phase: 0.0, scale: 1.25, rippleTimer: 0.2, variant: 'kohaku' },
  // Fish 2: Black & Red Koi (Hi Utsuri) cruising clockwise
  { a: 3.6, b: 4.5, speed: -0.19, phase: 2.1, scale: 1.20, rippleTimer: 0.8, variant: 'black_red' },
  // Fish 3: Slender Kohaku cruising outer loop
  { a: 4.2, b: 4.0, speed: 0.17, phase: 4.3, scale: 1.05, rippleTimer: 1.4, variant: 'kohaku' },
  // Fish 4: Striking Obsidian/Crimson Black & Red Koi gliding inner oval
  { a: 5.2, b: 3.2, speed: -0.21, phase: 1.2, scale: 1.30, rippleTimer: 0.5, variant: 'black_red' },
  // Fish 5: Medium Kohaku exploring northwest cove
  { a: 3.8, b: 4.8, speed: 0.18, phase: 3.4, scale: 1.15, rippleTimer: 1.1, variant: 'kohaku' },
  // Fish 6: Graceful Black & Red Koi sweeping wide south arc
  { a: 4.6, b: 4.2, speed: -0.16, phase: 5.2, scale: 1.25, rippleTimer: 1.7, variant: 'black_red' },
]

// ─────────────────────────────────────────────────────────────────
// Helper: Procedural 4-Point Shiny Sparkle Star Texture
// ─────────────────────────────────────────────────────────────────
function createSparkleStarTexture() {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const g = c.getContext('2d')
  g.clearRect(0, 0, 64, 64)

  // Soft luminous radial glow
  const rad = g.createRadialGradient(32, 32, 2, 32, 32, 28)
  rad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
  rad.addColorStop(0.25, 'rgba(187, 247, 208, 0.95)')
  rad.addColorStop(0.60, 'rgba(74, 222, 128, 0.45)')
  rad.addColorStop(1, 'rgba(34, 197, 94, 0)')
  g.fillStyle = rad
  g.beginPath()
  g.arc(32, 32, 30, 0, Math.PI * 2)
  g.fill()

  // 4-point diamond glint star needle
  g.fillStyle = '#ffffff'
  // Horizontal beam
  g.beginPath()
  g.moveTo(32, 26)
  g.quadraticCurveTo(32, 32, 4, 32)
  g.quadraticCurveTo(32, 32, 32, 38)
  g.quadraticCurveTo(32, 32, 60, 32)
  g.quadraticCurveTo(32, 32, 32, 26)
  g.fill()
  // Vertical beam
  g.beginPath()
  g.moveTo(26, 32)
  g.quadraticCurveTo(32, 32, 32, 4)
  g.quadraticCurveTo(32, 32, 38, 32)
  g.quadraticCurveTo(32, 32, 32, 60)
  g.quadraticCurveTo(32, 32, 26, 32)
  g.fill()

  // Intense white core glint
  g.fillStyle = '#ffffff'
  g.beginPath()
  g.arc(32, 32, 3.5, 0, Math.PI * 2)
  g.fill()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const STAR_GLINT_CONFIGS = [
  { radius: 1.3, speed: 1.6, phase: 0.0, yOffset: 0.5, scale: 0.70 },
  { radius: 1.6, speed: -1.3, phase: 1.8, yOffset: -0.6, scale: 0.78 },
  { radius: 1.4, speed: 2.1, phase: 3.5, yOffset: 0.9, scale: 0.60 },
  { radius: 1.7, speed: -1.5, phase: 5.0, yOffset: -0.2, scale: 0.72 },
  { radius: 1.2, speed: 1.8, phase: 2.4, yOffset: -0.9, scale: 0.62 },
  { radius: 1.5, speed: -2.2, phase: 4.1, yOffset: 0.6, scale: 0.68 },
]

// ─────────────────────────────────────────────────────────────────
// Low-Poly Sims Green Diamond (Plumbob)
// Pure 8-facet low-poly diamond with shiny light-green sparkles
// ─────────────────────────────────────────────────────────────────
const SimsPlumbob = () => {
  const plumbobRef = useRef()
  const starRefs = useRef([])

  const starTex = useMemo(() => createSparkleStarTexture(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (plumbobRef.current) {
      // Smooth continuous 360 spin
      plumbobRef.current.rotation.y = t * 1.5
      // Gentle floating levitation bob
      plumbobRef.current.position.y = 4.4 + Math.sin(t * 2.2) * 0.35
      // Subtle tilt
      plumbobRef.current.rotation.z = Math.sin(t * 1.6) * 0.05
      plumbobRef.current.rotation.x = Math.cos(t * 1.4) * 0.05
    }

    // Animate orbiting 4-point sparkle star glints
    STAR_GLINT_CONFIGS.forEach((cfg, idx) => {
      const star = starRefs.current[idx]
      if (!star) return

      const angle = t * cfg.speed + cfg.phase
      const sx = Math.cos(angle) * cfg.radius
      const sz = Math.sin(angle) * cfg.radius
      const sy = cfg.yOffset + Math.sin(t * 3.0 + cfg.phase) * 0.25
      star.position.set(sx, sy, sz)

      // Twinkling glint pulse
      const twinkle = 0.35 + 0.65 * Math.pow(Math.sin(t * 4.5 + cfg.phase * 2.0), 2)
      const currentScale = cfg.scale * twinkle
      star.scale.set(currentScale, currentScale, currentScale)
    })
  })

  // Authentic 8-facet low-poly diamond (classic octahedron)
  const lowPolyGeo = useMemo(() => new THREE.OctahedronGeometry(1.0, 0), [])

  return (
    <group position={[0, 0, 0]}>
      {/* Floating Low-Poly Sims Diamond (Plumbob) */}
      <group ref={plumbobRef} position={[0, 4.4, 0]}>
        {/* Crisp Low-Poly Faceted Emerald Diamond */}
        <mesh
          geometry={lowPolyGeo}
          scale={[0.9, 2.3, 0.9]}
          renderOrder={10}
        >
          <meshStandardMaterial
            color="#22c55e"
            emissive="#15803d"
            emissiveIntensity={0.65}
            roughness={0.18}
            metalness={0.12}
            flatShading
          />
        </mesh>

        {/* Orbiting Twinkling 4-Point Shiny Sparkle Stars */}
        {STAR_GLINT_CONFIGS.map((_, idx) => (
          <Billboard
            key={`glint-star-${idx}`}
            ref={(el) => (starRefs.current[idx] = el)}
            follow
            lockX={false}
            lockY={false}
            lockZ={false}
          >
            <mesh renderOrder={15}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                map={starTex}
                transparent
                alphaTest={0.01}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Billboard>
        ))}

        {/* Dense Shiny Light-Green Diamond Dust Sparkles */}
        {/* Layer 1: Bright mint-green twinkling flecks */}
        <Sparkles
          count={28}
          scale={[2.6, 3.6, 2.6]}
          position={[0, 0, 0]}
          size={3.8}
          speed={1.4}
          noise={1.8}
          color="#86efac"
          opacity={0.85}
        />

        {/* Layer 2: Ultra-bright pale seafoam/white glints */}
        <Sparkles
          count={16}
          scale={[2.0, 2.8, 2.0]}
          position={[0, 0, 0]}
          size={4.8}
          speed={2.0}
          noise={2.2}
          color="#dcfce7"
          opacity={0.9}
        />

        {/* Layer 3: Vibrant lime-emerald floating motes */}
        <Sparkles
          count={20}
          scale={[3.0, 4.0, 3.0]}
          position={[0, 0, 0]}
          size={2.8}
          speed={1.0}
          noise={1.4}
          color="#4ade80"
          opacity={0.75}
        />
      </group>

      {/* Magical Emerald Glow Light */}
      <pointLight
        position={[0, 4.4, 0]}
        color="#22c55e"
        intensity={2.2}
        distance={12}
        decay={2}
      />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────
// Primary Mountain Lake Component
// Center: [101.5, 0, -77.0], Top: [91.5, 0, -77.0]
// ─────────────────────────────────────────────────────────────────
export const MonolithPond = ({ position = [101.5, 0, -77.0] }) => {
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  // 1. Preload Authentic Storybook Rock Textures
  const rockTextures = useMemo(() => ({
    mossBoulder: loader.load('/assets/props/rock_moss_boulder.png'),
    riverSlate: loader.load('/assets/props/rock_river_slate.png'),
    paintedPebbles: loader.load('/assets/props/rock_painted_pebbles.png'),
    shelfBoulder: loader.load('/assets/props/rock_shelf_boulder.png'),
    standingStone: loader.load('/assets/props/rock_standing_stone.png'),
  }), [loader])

  // 2. Preload 3-Frame Koi Fish Textures (Kohaku & Black/Red Hi Utsuri)
  const fishTextures = useMemo(() => [0, 1, 2].map((i) => {
    const tex = loader.load(`/assets/fauna/fish_${i}.png?v=12`)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.magFilter = THREE.LinearFilter
    tex.minFilter = THREE.LinearMipmapLinearFilter
    return tex
  }), [loader])

  const blackFishTextures = useMemo(() => [0, 1, 2].map((i) => {
    const tex = loader.load(`/assets/fauna/fish_black_${i}.png?v=1`)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.magFilter = THREE.LinearFilter
    tex.minFilter = THREE.LinearMipmapLinearFilter
    return tex
  }), [loader])

  // 3. Concentric Polar Disc Geometry:
  // - Center at [0, 0, 0] (world [101.5, 0, -77.0])
  // - Shoreline reaches exactly [91.5, 0, -77.0] at theta = PI (10 units along -X)
  // - Natural organic harmonic perimeter (varying between 8.2 and 11.0 units)
  // - shore attribute goes from 0.0 at center to 1.0 at outer rim
  const waterGeo = useMemo(() => {
    const rings = 24
    const segments = 72
    const positions = []
    const shores = []
    const indices = []

    // Center vertex (shore = 0)
    positions.push(0, 0.07, 0)
    shores.push(0.0)

    // Helper: compute organic radius for angle theta
    const getRadius = (theta) => {
      // At theta = PI (direction toward x = 91.5), radius is exactly 10.0 units
      const dTheta = theta - Math.PI
      const varR = 0.09 * Math.cos(2 * dTheta) - 0.09 + 0.06 * Math.sin(3 * dTheta) - 0.04 * Math.sin(dTheta)
      return 10.0 + varR * 10.0
    }

    // Concentric rings from 1 to rings
    for (let r = 1; r <= rings; r++) {
      const frac = r / rings
      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * Math.PI * 2
        const R = getRadius(theta) * frac
        const px = Math.cos(theta) * R
        const pz = Math.sin(theta) * R
        positions.push(px, 0.07, pz)
        shores.push(frac)
      }
    }

    // Inner ring triangle fan to center vertex (0)
    for (let s = 0; s < segments; s++) {
      const nextS = (s + 1) % segments
      indices.push(0, 1 + s, 1 + nextS)
    }

    // Outer concentric quads (split into 2 triangles)
    for (let r = 1; r < rings; r++) {
      const ringStart = 1 + (r - 1) * segments
      const nextRingStart = 1 + r * segments
      for (let s = 0; s < segments; s++) {
        const nextS = (s + 1) % segments
        const curIdx = ringStart + s
        const nextCurIdx = ringStart + nextS
        const outerIdx = nextRingStart + s
        const nextOuterIdx = nextRingStart + nextS

        indices.push(curIdx, outerIdx, nextCurIdx)
        indices.push(nextCurIdx, outerIdx, nextOuterIdx)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('shore', new THREE.Float32BufferAttribute(shores, 1))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])

  // 4. Water Shader Material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      ...LakeWaterShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
    })
  }, [])

  // 5. Fish Animation State
  const fishGrpRefs = useRef([])
  const fishMatRefs = useRef([])
  const fishRippleRefs = useRef([])
  const fishStates = useRef(
    KOI_CONFIGS.map((cfg) => ({
      frame: 0,
      frameTimer: 0,
      rippleScale: 0.25,
      rippleAlpha: 0.35,
      rippleTimer: cfg.rippleTimer,
    }))
  )

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime()
    material.uniforms.time.value = elapsed

    // Animate Chill Koi Fish
    KOI_CONFIGS.forEach((cfg, idx) => {
      const grp = fishGrpRefs.current[idx]
      const mat = fishMatRefs.current[idx]
      const rip = fishRippleRefs.current[idx]
      const st = fishStates.current[idx]
      if (!grp || !st) return

      // Smooth elliptical trajectory in deep water
      const angle = elapsed * cfg.speed + cfg.phase
      const weaveX = Math.sin(elapsed * 1.5 + cfg.phase) * 0.25
      const weaveZ = Math.cos(elapsed * 1.2 + cfg.phase) * 0.25
      const px = Math.cos(angle) * cfg.a + weaveX
      const pz = Math.sin(angle) * cfg.b + weaveZ

      grp.position.set(px, 0.05, pz)

      // Velocity tangent for natural heading
      const dx = -cfg.a * Math.sin(angle) * cfg.speed
      const dz = cfg.b * Math.cos(angle) * cfg.speed
      const heading = Math.atan2(dx, dz) + Math.PI
      grp.rotation.set(0, heading, 0)

      // 3-frame tail wag (~6 fps)
      st.frameTimer += delta
      if (st.frameTimer >= 0.16) {
        st.frameTimer = 0
        st.frame = (st.frame + 1) % 3
        if (mat) {
          mat.map = (cfg.variant === 'black_red' ? blackFishTextures : fishTextures)[st.frame]
          mat.needsUpdate = true
        }
      }

      // Trailing surface water ripple
      if (rip) {
        st.rippleTimer += delta
        if (st.rippleTimer > 2.0) {
          st.rippleTimer = 0
          st.rippleScale = 0.25
          st.rippleAlpha = 0.35
          rip.position.set(px - (dx / (Math.hypot(dx, dz) || 1)) * 0.4, 0.052, pz - (dz / (Math.hypot(dx, dz) || 1)) * 0.4)
        } else {
          st.rippleScale += delta * 0.55
          st.rippleAlpha = Math.max(0, 0.35 * (1.0 - st.rippleTimer / 2.0))
          rip.scale.set(st.rippleScale, st.rippleScale, 1)
          if (rip.material) {
            rip.material.opacity = st.rippleAlpha
          }
        }
      }
    })
  })

  return (
    <group position={position} name="MountainLake">
      {/* 1. Pristine Flowing Watercolor Water Surface (Exact match to RiverWater) */}
      <mesh
        geometry={waterGeo}
        material={material}
        renderOrder={2}
      />

      {/* 2. Chill Koi Fish Swimming in Deep Watercolor Basin */}
      {KOI_CONFIGS.map((cfg, idx) => (
        <React.Fragment key={`koi-${idx}`}>
          {/* Expanding Surface Ripple Behind Fish */}
          <mesh
            ref={(el) => (fishRippleRefs.current[idx] = el)}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.052, 0]}
          >
            <ringGeometry args={[0.25, 0.45, 18]} />
            <meshBasicMaterial
              color="#d0f2fe"
              transparent
              opacity={0.35}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Koi Fish Billboard */}
          <group ref={(el) => (fishGrpRefs.current[idx] = el)}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
              <planeGeometry args={[1.1 * cfg.scale, 2.2 * cfg.scale]} />
              <meshBasicMaterial
                ref={(el) => (fishMatRefs.current[idx] = el)}
                map={(cfg.variant === 'black_red' ? blackFishTextures : fishTextures)[0]}
                transparent
                alphaTest={0.01}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* 3. Authentic Hand-Painted Storybook Rocks on Dry Shoreline Bank */}
      {SHORELINE_ROCKS.map((rock, idx) => {
        const tex = rockTextures[rock.type]
        if (!tex) return null
        const [w, h] = rock.size
        const s = rock.scale || 1.0
        const isHorizontal = !!rock.rotationZ
        const effH = isHorizontal ? w * s : h * s

        return (
          <group key={`shore-rock-${idx}`} position={rock.pos}>
            {/* Soft Ground Contact Shadow */}
            <mesh
              rotation={[-Math.PI / 2, 0, rock.shadowRot || 0]}
              position={[0, 0.02, 0]}
              scale={rock.shadowScale ? [rock.shadowScale[0] * s, rock.shadowScale[1] * s, 1] : [1, 1, 1]}
              renderOrder={4}
            >
              <circleGeometry args={[rock.shadowScale ? 1.0 : (rock.shadowR || 1.2) * s, 18]} />
              <meshBasicMaterial
                color="#0a1a0d"
                transparent
                opacity={0.28}
                depthWrite={false}
              />
            </mesh>

            {/* Storybook 2D Billboard Rock */}
            <Billboard
              follow
              lockX={false}
              lockY={false}
              lockZ={false}
              position={[0, effH * 0.48, 0]}
            >
              <mesh rotation={[0, 0, rock.rotationZ || 0]} renderOrder={6}>
                <planeGeometry args={[w * s, h * s]} />
                <meshBasicMaterial
                  map={tex}
                  transparent
                  alphaTest={0.04}
                  side={THREE.DoubleSide}
                  depthWrite={true}
                />
              </mesh>
            </Billboard>
          </group>
        )
      })}

      {/* 4. Iconic Sims Green Diamond (Plumbob) floating over center of lake */}
      <SimsPlumbob />

      {/* 5. Subtle Ambient Water Sparkles */}
      <Sparkles
        count={12}
        scale={[18, 2.0, 18]}
        position={[0, 0.8, 0]}
        size={2.0}
        speed={0.35}
        color="#c2edf7"
        opacity={0.55}
      />
    </group>
  )
}
