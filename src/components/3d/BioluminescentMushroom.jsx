import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────
// High-Performance Storybook 3D Bioluminescent Mushroom Grove
// Directly modeled after public/textures/silksong_mushrooms.jpg:
// - Authentic parasol / bell-shaped umbrella caps created via lathe profiles
// - Hand-painted celestial turquoise & mint bioluminescent cap textures
// - Radiant underside gill discs with luminous pleated emission
// - Elegant, sinuous ivory-cream fibrous stalks with flared collar rings (annulus)
// - Naturally grounded with creeping root tendrils & river pebbles (NO harsh base puck!)
// - Soft pulsing cyan radiance & floating bioluminescent spore motes
// - Consolidated into 4 single-draw-call BufferGeometries for silky 60+ FPS
// ─────────────────────────────────────────────────────────────────

// High-speed native buffer geometry merging (zero extra imports / zero warnings)
function mergeBufferGeometries(geometries) {
  if (!geometries || !geometries.length) return null
  let posLen = 0, normLen = 0, uvLen = 0, indexLen = 0
  geometries.forEach((g) => {
    posLen += g.attributes.position.array.length
    normLen += g.attributes.normal.array.length
    uvLen += (g.attributes.uv ? g.attributes.uv.array.length : 0)
    indexLen += (g.index ? g.index.array.length : g.attributes.position.count)
  })

  const pos = new Float32Array(posLen)
  const norm = new Float32Array(normLen)
  const uv = new Float32Array(uvLen)
  const index = indexLen > 65535 ? new Uint32Array(indexLen) : new Uint16Array(indexLen)

  let posOff = 0, normOff = 0, uvOff = 0, indexOff = 0, vertOff = 0
  geometries.forEach((g) => {
    pos.set(g.attributes.position.array, posOff)
    posOff += g.attributes.position.array.length

    norm.set(g.attributes.normal.array, normOff)
    normOff += g.attributes.normal.array.length

    if (g.attributes.uv) {
      uv.set(g.attributes.uv.array, uvOff)
      uvOff += g.attributes.uv.array.length
    }

    if (g.index) {
      for (let i = 0; i < g.index.array.length; i++) {
        index[indexOff + i] = g.index.array[i] + vertOff
      }
      indexOff += g.index.array.length
    } else {
      const count = g.attributes.position.count
      for (let i = 0; i < count; i++) {
        index[indexOff + i] = i + vertOff
      }
      indexOff += count
    }
    vertOff += g.attributes.position.count
  })

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(norm, 3))
  merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  merged.setIndex(new THREE.BufferAttribute(index, 1))
  return merged
}

// Matrix helper to apply translation and Euler rotations to BufferGeometries
function transformGeo(geo, x, y, z, rx = 0, ry = 0, rz = 0) {
  const mat = new THREE.Matrix4()
  const rot = new THREE.Euler(rx, ry, rz)
  mat.makeRotationFromEuler(rot)
  mat.setPosition(x, y, z)
  geo.applyMatrix4(mat)
  return geo
}

// Helper to construct an authentic bell/parasol mushroom cap via lathe curve
function createParasolCapGeo(scale = 1.0, segments = 16) {
  const points = [
    new THREE.Vector2(0.001, 1.95),
    new THREE.Vector2(0.35, 1.90),
    new THREE.Vector2(0.75, 1.76),
    new THREE.Vector2(1.20, 1.50),
    new THREE.Vector2(1.65, 1.12),
    new THREE.Vector2(2.05, 0.65),
    new THREE.Vector2(2.35, 0.18),
    new THREE.Vector2(2.38, -0.05),
    new THREE.Vector2(2.20, -0.15),
    new THREE.Vector2(1.90, -0.18),
  ]
  const scaledPoints = points.map((p) => new THREE.Vector2(p.x * scale, p.y * scale))
  const geo = new THREE.LatheGeometry(scaledPoints, segments)
  geo.computeVertexNormals()
  return geo
}

// 1. Hand-Painted Celestial Turquoise Bioluminescent Cap Texture (512 x 512)
// (NO concentric bullseye rings! Clean organic gouache gradient + celestial spore specks)
function createMushroomCapTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  // Smooth vertical bell gradient (y=0 top apex -> y=512 bottom rim)
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#f0ffff') // iridescent cyan-white celestial apex
  grad.addColorStop(0.18, '#85f7dc') // luminous mint
  grad.addColorStop(0.45, '#00cec9') // vibrant electric turquoise
  grad.addColorStop(0.75, '#0984e3') // deep fantasy teal-cobalt
  grad.addColorStop(0.92, '#0c5460') // dark forest moss shade
  grad.addColorStop(1, '#063028') // dark underside rim lip
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Soft organic cloudy gouache bloom patches
  const clouds = [
    [130, 140, 75], [260, 110, 85], [390, 150, 70],
    [90, 260, 80], [240, 230, 95], [380, 250, 85],
    [160, 360, 70], [330, 350, 75],
  ]
  clouds.forEach(([cx, cy, cr]) => {
    const cg = ctx.createRadialGradient(cx, cy, 5, cx, cy, cr)
    cg.addColorStop(0, 'rgba(195, 255, 240, 0.40)')
    cg.addColorStop(0.6, 'rgba(85, 239, 196, 0.20)')
    cg.addColorStop(1, 'rgba(0, 206, 201, 0)')
    ctx.fillStyle = cg
    ctx.beginPath()
    ctx.arc(cx, cy, cr, 0, Math.PI * 2)
    ctx.fill()
  })

  // Scattered delicate celestial spore specks (tiny glowing dots, like in silksong_mushrooms.jpg)
  const specks = [
    [256, 45, 3.5], [210, 75, 4.0], [305, 80, 4.0],
    [155, 120, 3.0], [350, 115, 3.5], [265, 140, 4.5],
    [185, 175, 3.0], [325, 180, 3.0], [120, 210, 2.5],
    [400, 205, 3.0], [225, 235, 3.5], [290, 240, 3.5],
    [150, 285, 2.5], [365, 290, 2.5], [256, 310, 3.0],
    [190, 350, 2.0], [320, 355, 2.0], [240, 385, 2.5],
  ]

  specks.forEach(([sx, sy, sr]) => {
    // Soft outer glow
    ctx.fillStyle = 'rgba(85, 239, 196, 0.70)'
    ctx.beginPath()
    ctx.arc(sx, sy, sr * 2.2, 0, Math.PI * 2)
    ctx.fill()
    // Pinpoint white star core
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  })

  // Delicate sunlit rim highlight along the bottom edge
  ctx.fillStyle = 'rgba(165, 255, 235, 0.35)'
  ctx.fillRect(0, h - 22, w, 4)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// 2. Radiant Underside Gills Texture (512 x 512)
function createMushroomGillTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  // Glowing mint core gradient
  const grad = ctx.createRadialGradient(256, 256, 12, 256, 256, 250)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.22, '#a8ffeb')
  grad.addColorStop(0.60, '#00cec9')
  grad.addColorStop(0.88, '#0984e3')
  grad.addColorStop(1, '#052c4a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Pleated radial gills
  const gillCount = 44
  ctx.strokeStyle = 'rgba(235, 255, 250, 0.70)'
  ctx.lineWidth = 2.2
  for (let i = 0; i < gillCount; i++) {
    const angle = (i / gillCount) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    ctx.beginPath()
    ctx.moveTo(256 + cos * 22, 256 + sin * 22)
    ctx.lineTo(256 + cos * 248, 256 + sin * 248)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 3. Sinuous Ivory-Cream Fibrous Stalk Texture (512 x 512)
function createMushroomStalkTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  // Warm ivory-parchment flesh
  ctx.fillStyle = '#f2ece0'
  ctx.fillRect(0, 0, w, h)

  // Vertical fibrous ridges & fluting
  const strips = 18
  const sW = w / strips
  for (let i = 0; i < strips; i++) {
    const x = i * sW
    const grad = ctx.createLinearGradient(x, 0, x + sW, 0)
    grad.addColorStop(0, '#cfc5b4')
    grad.addColorStop(0.35, '#faf7f0')
    grad.addColorStop(0.70, '#ece5d6')
    grad.addColorStop(1, '#c5bbae')
    ctx.fillStyle = grad
    ctx.fillRect(x, 0, sW, h)

    // Vertical organic wood grain lines
    ctx.strokeStyle = 'rgba(105, 95, 80, 0.22)'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(x + sW * 0.5, 0)
    for (let y = 0; y <= h; y += 35) {
      const wiggle = Math.sin((y + i * 45) * 0.04) * 3
      ctx.lineTo(x + sW * 0.5 + wiggle, y)
    }
    ctx.stroke()
  }

  // Soft moss wash at base
  const moss = ctx.createLinearGradient(0, h * 0.65, 0, h)
  moss.addColorStop(0, 'rgba(50, 95, 45, 0)')
  moss.addColorStop(0.7, 'rgba(65, 125, 55, 0.35)')
  moss.addColorStop(1, 'rgba(75, 145, 65, 0.60)')
  ctx.fillStyle = moss
  ctx.fillRect(0, h * 0.65, w, h * 0.35)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 4. Soft Contact AO Ground Shadow Texture (512 x 512)
// (Feathered edges that seamlessly blend into the terrain without any harsh lines)
function createMushroomGroundShadow() {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 512, 512)

  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 240)
  grad.addColorStop(0, 'rgba(14, 24, 18, 0.80)')
  grad.addColorStop(0.40, 'rgba(18, 30, 22, 0.45)')
  grad.addColorStop(0.75, 'rgba(22, 36, 26, 0.12)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(256, 256, 240, 205, 0, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const BioluminescentMushroom = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onInspect,
  hovered = false,
}) => {
  const glowLightRef = useRef()
  const sporesRef = useRef()

  // Procedural Canvas Textures (Cached once)
  const capTex = useMemo(() => createMushroomCapTexture(), [])
  const gillTex = useMemo(() => createMushroomGillTexture(), [])
  const stalkTex = useMemo(() => createMushroomStalkTexture(), [])
  const shadowTex = useMemo(() => createMushroomGroundShadow(), [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 1: 5 Parasol / Bell Umbrella Mushroom Caps
  // ─────────────────────────────────────────────────────────────
  const mergedCapsGeometry = useMemo(() => {
    const list = [
      // 1. Giant Central Mother Cap (Scale 1.0, Height ≈ 5.5)
      transformGeo(createParasolCapGeo(1.0, 16), 0, 5.4, 0, 0.05, 0, -0.06),

      // 2. Medium Left Cap (Scale 0.65, tilted outward left)
      transformGeo(createParasolCapGeo(0.65, 12), -2.1, 3.8, 0.4, -0.12, 0.1, 0.38),

      // 3. Medium Right Cap (Scale 0.70, tilted outward right)
      transformGeo(createParasolCapGeo(0.70, 12), 2.2, 4.0, -0.2, 0.15, -0.1, -0.42),

      // 4. Front Button Cap (Scale 0.45, nestled in front)
      transformGeo(createParasolCapGeo(0.45, 10), -0.65, 2.5, 1.3, 0.26, 0, -0.12),

      // 5. Far-Left Sprout Cap (Scale 0.30, curved baby mushroom)
      transformGeo(createParasolCapGeo(0.30, 8), -2.4, 1.5, 1.2, 0.20, 0.1, 0.48),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 2: Radiant Underside Gills
  // ─────────────────────────────────────────────────────────────
  const mergedGillsGeometry = useMemo(() => {
    const list = [
      // 1. Mother cap gills (Concave disc tucked under the parasol rim)
      transformGeo(new THREE.CircleGeometry(2.15, 16), 0, 5.25, 0, Math.PI * 0.5 + 0.05, 0, -0.06),

      // 2. Medium Left cap gills
      transformGeo(new THREE.CircleGeometry(1.40, 12), -2.1, 3.70, 0.4, Math.PI * 0.5 - 0.12, 0.1, 0.38),

      // 3. Medium Right cap gills
      transformGeo(new THREE.CircleGeometry(1.50, 12), 2.2, 3.90, -0.2, Math.PI * 0.5 + 0.15, -0.1, -0.42),

      // 4. Front Button cap gills
      transformGeo(new THREE.CircleGeometry(0.96, 10), -0.65, 2.42, 1.3, Math.PI * 0.5 + 0.26, 0, -0.12),

      // 5. Far-Left Sprout gills
      transformGeo(new THREE.CircleGeometry(0.64, 8), -2.4, 1.45, 1.2, Math.PI * 0.5 + 0.20, 0.1, 0.48),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 3: Tall Sinuous Ivory Stalks & Fluted Collars
  // ─────────────────────────────────────────────────────────────
  const mergedStalksGeometry = useMemo(() => {
    const list = [
      // 1. Giant Mother Stalk: Tall, elegant, sinuous trunk (Height: 5.2, base y=0 to y=5.2)
      // Lower flared base
      transformGeo(new THREE.CylinderGeometry(0.55, 0.85, 2.6, 8), 0, 1.3, 0, 0.03, 0, -0.04),
      // Upper stalk flaring into cap
      transformGeo(new THREE.CylinderGeometry(0.72, 0.55, 2.6, 8), 0, 3.9, 0, 0.05, 0, -0.06),
      // Fluted collar skirt (annulus ring below gills)
      transformGeo(new THREE.TorusGeometry(0.68, 0.12, 5, 8), 0, 4.85, 0, Math.PI * 0.5 + 0.05, 0, -0.06),

      // 2. Medium Left Stalk (Leaning outward left)
      transformGeo(new THREE.CylinderGeometry(0.28, 0.48, 3.4, 7), -1.15, 1.85, 0.22, -0.08, 0.05, 0.38),
      transformGeo(new THREE.TorusGeometry(0.35, 0.08, 4, 7), -1.90, 3.30, 0.35, Math.PI * 0.5 - 0.1, 0.05, 0.38),

      // 3. Medium Right Stalk (Leaning outward right)
      transformGeo(new THREE.CylinderGeometry(0.30, 0.52, 3.6, 7), 1.25, 2.05, -0.12, 0.10, -0.05, -0.42),
      transformGeo(new THREE.TorusGeometry(0.38, 0.08, 4, 7), 2.00, 3.50, -0.18, Math.PI * 0.5 + 0.12, -0.05, -0.42),

      // 4. Front Button Stalk
      transformGeo(new THREE.CylinderGeometry(0.20, 0.34, 2.2, 6), -0.45, 1.20, 0.90, 0.22, 0, -0.12),

      // 5. Far-Left Sprout Stalk
      transformGeo(new THREE.CylinderGeometry(0.12, 0.22, 1.4, 5), -1.85, 0.80, 0.85, 0.18, 0.08, 0.45),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 4: River Stones & Creeping Root Tendrils (NO UGLY BASE DISC!)
  // ─────────────────────────────────────────────────────────────
  const mergedBaseGeometry = useMemo(() => {
    const list = [
      // Natural low-poly river stones nestled around the stalk bases
      transformGeo(new THREE.DodecahedronGeometry(0.48, 0), -1.6, 0.22, 1.3, 0.2, 0.5, 0.1),
      transformGeo(new THREE.DodecahedronGeometry(0.42, 0), 1.8, 0.20, 1.0, -0.3, 0.4, 0.2),
      transformGeo(new THREE.DodecahedronGeometry(0.55, 0), 0.4, 0.24, -1.5, 0.1, -0.6, 0.3),
      transformGeo(new THREE.DodecahedronGeometry(0.38, 0), -1.3, 0.18, -1.3, 0.4, 0.2, -0.2),
      transformGeo(new THREE.DodecahedronGeometry(0.32, 0), 1.2, 0.15, -1.2, -0.2, 0.3, 0.4),

      // Gnarled root tendrils anchoring the stalks into the forest soil
      transformGeo(new THREE.CylinderGeometry(0.14, 0.28, 1.8, 5), -1.2, 0.18, 1.2, 0.2, 0.7, -0.8),
      transformGeo(new THREE.CylinderGeometry(0.16, 0.30, 2.0, 5), 1.4, 0.20, 0.9, -0.2, -0.6, 0.75),
      transformGeo(new THREE.CylinderGeometry(0.14, 0.26, 1.9, 5), 0.3, 0.20, -1.3, -0.8, 0.3, 0.1),
      transformGeo(new THREE.CylinderGeometry(0.12, 0.22, 1.6, 5), -1.4, 0.16, -0.8, -0.4, -0.5, -0.7),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // Floating Bioluminescent Spore Particles (7 low-poly motes)
  const sporeCount = 7
  const sporeData = useMemo(() => {
    return Array.from({ length: sporeCount }, (_, i) => ({
      angle: (i / sporeCount) * Math.PI * 2,
      r: 0.8 + (i % 3) * 0.55,
      phase: i * 1.25,
      baseY: 1.0 + (i % 4) * 0.6,
    }))
  }, [])

  // Frame animation: Pulsing bioluminescent light & rising spores
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Pulsing magical cyan/mint glow under the giant cap
    if (glowLightRef.current) {
      glowLightRef.current.intensity = 8.0 + Math.sin(t * 2.2) * 1.8
    }

    // 2. Floating bioluminescent spore motes drifting upward
    if (sporesRef.current) {
      sporesRef.current.children.forEach((child, i) => {
        const item = sporeData[i]
        const cycle = ((t * 0.38 + i * 0.32) % 2.8) / 2.8
        const curR = item.r + Math.sin(t * 1.2 + item.phase) * 0.30
        child.position.y = item.baseY + cycle * 5.2
        child.position.x = Math.cos(item.angle + t * 0.22) * curR
        child.position.z = Math.sin(item.angle + t * 0.22) * curR
        const s = 0.3 + Math.sin(cycle * Math.PI) * 0.7
        child.scale.set(s, s, s)
      })
    }
  })

  return (
    <group
      position={position}
      rotation={rotation}
      scale={[0.95, 0.95, 0.95]}
      onClick={onInspect}
    >
      {/* 1. Soft Contact AO Ground Shadow (Seamlessly blends into terrain) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[9.5, 9.5]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.65} depthWrite={false} />
      </mesh>

      {/* 2. Natural River Stones & Root Tendrils (Merged - 1 Draw Call, NO UGLY BASE PUCK) */}
      <mesh geometry={mergedBaseGeometry}>
        <meshLambertMaterial color="#586774" />
      </mesh>

      {/* 3. Sinuous Ivory Stalks & Fluted Collars (Merged - 1 Draw Call) */}
      <mesh geometry={mergedStalksGeometry}>
        <meshLambertMaterial map={stalkTex} color="#ffffff" />
      </mesh>

      {/* 4. Radiant Underside Gills (Merged - 1 Draw Call, High Emission) */}
      <mesh geometry={mergedGillsGeometry}>
        <meshBasicMaterial map={gillTex} side={THREE.DoubleSide} />
      </mesh>

      {/* 5. 5 Parasol / Bell Umbrella Mushroom Caps (Merged - 1 Draw Call) */}
      <mesh geometry={mergedCapsGeometry}>
        <meshLambertMaterial map={capTex} color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* 6. Primary Pulsing Bioluminescent Cyan Light Under Canopy */}
      <pointLight
        ref={glowLightRef}
        position={[0, 4.8, 0.2]}
        color="#55efc4"
        intensity={8.0}
        distance={18}
        decay={2}
      />

      {/* 7. Secondary Soft Mint Ambient Ground Glow */}
      <pointLight
        position={[0, 1.8, 0]}
        color="#00cec9"
        intensity={3.5}
        distance={10}
        decay={2}
      />

      {/* 8. Floating Bioluminescent Spore Motes */}
      <group ref={sporesRef}>
        {sporeData.map((_, i) => (
          <mesh key={`spore-${i}`} position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.07, 5, 4]} />
            <meshBasicMaterial color="#a8ffeb" transparent opacity={0.75} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
