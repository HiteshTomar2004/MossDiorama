import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────
// High-Performance Storybook 3D Runic Monolith Landmark
// - Stepped ancient cracked stone dais & plinth foundation
// - 4-sided tapered ancient stone obelisk with peaked pyramidion capstone
// - Carved insectoid / moth guardian totem effigies (top & bottom crests)
// - Inset central runic channels with glowing electric cyan ancient glyphs
// - Gnarled ancient tree roots & mossy creepers clawing up the stone base
// - Pulsing magical cyan radiance & floating glowing spore motes
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

// 1. Weathered Ancient Slate/Granite Stone Texture (512 x 512)
function createMonolithStoneTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  // Dark charcoal-slate base
  ctx.fillStyle = '#232b26'
  ctx.fillRect(0, 0, w, h)

  // Masonry stone block courses & facets
  const rows = 8
  const rowH = h / rows
  const colors = ['#38463e', '#415248', '#344239', '#46574d', '#3b4941', '#4c5e53']

  for (let r = 0; r < rows; r++) {
    const y = r * rowH
    const cols = 4 + (r % 2)
    const colW = w / cols
    for (let c = 0; c < cols; c++) {
      const x = c * colW
      const color = colors[(r * 3 + c) % colors.length]

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x + 2, y + 2, colW - 4, rowH - 4, 5)
      ctx.fill()

      // Top sunlit slate bevel
      ctx.fillStyle = 'rgba(215, 235, 225, 0.22)'
      ctx.fillRect(x + 4, y + 3, colW - 8, 3)

      // Weathered stone micro-cracks
      if ((r + c) % 3 === 0) {
        ctx.strokeStyle = 'rgba(16, 22, 18, 0.45)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(x + colW * 0.3, y + 4)
        ctx.lineTo(x + colW * 0.45, y + rowH * 0.5)
        ctx.lineTo(x + colW * 0.38, y + rowH - 4)
        ctx.stroke()
      }

      // Ancient forest moss / golden lichen spots
      if ((r * 2 + c) % 5 === 0) {
        ctx.fillStyle = 'rgba(68, 140, 78, 0.45)' // lush emerald moss
        ctx.beginPath()
        ctx.arc(x + colW * 0.65, y + rowH * 0.75, 7, 0, Math.PI * 2)
        ctx.fill()
      } else if ((r + c * 3) % 7 === 0) {
        ctx.fillStyle = 'rgba(195, 135, 45, 0.40)' // golden autumn lichen
        ctx.beginPath()
        ctx.arc(x + colW * 0.25, y + rowH * 0.65, 5.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 2. Luminous Ancient Cyan Runic Inscriptions Texture (256 x 1024)
function createGlowingRuneTexture() {
  const w = 256, h = 1024
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)

  // Dark stone channel backing
  const grad = ctx.createLinearGradient(0, 0, w, 0)
  grad.addColorStop(0, 'rgba(12, 20, 16, 0.95)')
  grad.addColorStop(0.5, 'rgba(16, 28, 22, 0.98)')
  grad.addColorStop(1, 'rgba(12, 20, 16, 0.95)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Subtle cyan mystical ambient glow down the trough
  const troughGlow = ctx.createLinearGradient(0, 0, w, 0)
  troughGlow.addColorStop(0, 'rgba(0, 206, 201, 0)')
  troughGlow.addColorStop(0.5, 'rgba(85, 239, 196, 0.28)')
  troughGlow.addColorStop(1, 'rgba(0, 206, 201, 0)')
  ctx.fillStyle = troughGlow
  ctx.fillRect(0, 0, w, h)

  // Carved Ancient Silksong Runic Glyphs
  ctx.save()
  ctx.shadowColor = '#55efc4'
  ctx.shadowBlur = 18
  ctx.strokeStyle = '#e8ffff'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const cx = w * 0.5

  // Rune 1: Diamond Sigil (top)
  ctx.beginPath()
  ctx.moveTo(cx, 70)
  ctx.lineTo(cx + 45, 115)
  ctx.lineTo(cx, 160)
  ctx.lineTo(cx - 45, 115)
  ctx.closePath()
  ctx.stroke()
  ctx.fillStyle = '#70f3d4'
  ctx.beginPath()
  ctx.arc(cx, 115, 10, 0, Math.PI * 2)
  ctx.fill()

  // Rune 2: Ancient "R" Spindle Rune
  ctx.beginPath()
  ctx.moveTo(cx - 35, 195)
  ctx.lineTo(cx - 35, 305)
  ctx.moveTo(cx - 35, 195)
  ctx.quadraticCurveTo(cx + 45, 195, cx + 45, 245)
  ctx.quadraticCurveTo(cx + 45, 275, cx - 35, 275)
  ctx.moveTo(cx - 5, 275)
  ctx.lineTo(cx + 40, 310)
  ctx.stroke()

  // Rune 3: Weaving Loom Chevron Glyph
  ctx.beginPath()
  ctx.moveTo(cx - 40, 350)
  ctx.lineTo(cx, 385)
  ctx.lineTo(cx + 40, 350)
  ctx.moveTo(cx - 40, 410)
  ctx.lineTo(cx, 445)
  ctx.lineTo(cx + 40, 410)
  ctx.stroke()

  // Rune 4: Ancient "N" Needle Sigil
  ctx.beginPath()
  ctx.moveTo(cx - 35, 485)
  ctx.lineTo(cx - 35, 600)
  ctx.lineTo(cx + 35, 485)
  ctx.lineTo(cx + 35, 600)
  ctx.stroke()

  // Rune 5: Spindle Eye of Pharloom
  ctx.beginPath()
  ctx.ellipse(cx, 660, 42, 24, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx, 660, 11, 0, Math.PI * 2)
  ctx.fill()

  // Rune 6: Trident / Mandible Crest
  ctx.beginPath()
  ctx.moveTo(cx - 35, 730)
  ctx.lineTo(cx - 20, 810)
  ctx.lineTo(cx, 760)
  ctx.lineTo(cx + 20, 810)
  ctx.lineTo(cx + 35, 730)
  ctx.moveTo(cx, 760)
  ctx.lineTo(cx, 840)
  ctx.stroke()

  // Rune 7: Bottom Terminal Spindle
  ctx.beginPath()
  ctx.arc(cx, 890, 16, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, 915)
  ctx.lineTo(cx, 970)
  ctx.moveTo(cx - 25, 940)
  ctx.lineTo(cx + 25, 940)
  ctx.stroke()

  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 3. Ancient Weathered Root Bark Texture (512 x 512)
function createAncientRootTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#3a2416' // deep earthy root brown
  ctx.fillRect(0, 0, w, h)

  const strips = 16
  const sW = w / strips
  for (let i = 0; i < strips; i++) {
    const x = i * sW
    const grad = ctx.createLinearGradient(x, 0, x + sW, 0)
    grad.addColorStop(0, '#26160c')
    grad.addColorStop(0.35, '#4e3321')
    grad.addColorStop(0.7, '#5d3d27')
    grad.addColorStop(1, '#2c1a0e')
    ctx.fillStyle = grad
    ctx.fillRect(x, 0, sW, h)

    // Wood fiber highlights
    ctx.strokeStyle = 'rgba(230, 195, 155, 0.28)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x + sW * 0.5, 0)
    for (let y = 0; y <= h; y += 35) {
      const wiggle = Math.sin((y + i * 40) * 0.05) * 3.5
      ctx.lineTo(x + sW * 0.5 + wiggle, y)
    }
    ctx.stroke()
  }

  // Creeping green moss wash over roots
  const moss = ctx.createLinearGradient(0, h * 0.4, 0, h)
  moss.addColorStop(0, 'rgba(50, 95, 45, 0)')
  moss.addColorStop(0.7, 'rgba(65, 125, 55, 0.35)')
  moss.addColorStop(1, 'rgba(75, 140, 60, 0.55)')
  ctx.fillStyle = moss
  ctx.fillRect(0, h * 0.4, w, h * 0.6)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 4. Soft Contact AO Ground Shadow Texture (512 x 512)
function createMonolithGroundShadow() {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 512, 512)

  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 240)
  grad.addColorStop(0, 'rgba(12, 20, 14, 0.85)')
  grad.addColorStop(0.45, 'rgba(16, 26, 18, 0.50)')
  grad.addColorStop(0.8, 'rgba(20, 32, 22, 0.14)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(256, 256, 240, 215, 0, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const RunicMonolith = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onInspect,
  hovered = false,
}) => {
  const runeLightRef = useRef()
  const sporesRef = useRef()

  // Procedural Canvas Textures (Cached once)
  const stoneTex = useMemo(() => createMonolithStoneTexture(), [])
  const runeTex = useMemo(() => createGlowingRuneTexture(), [])
  const rootTex = useMemo(() => createAncientRootTexture(), [])
  const shadowTex = useMemo(() => createMonolithGroundShadow(), [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 1: Stepped Dais Foundation, Obelisk Body & Pyramidion Cap
  // ─────────────────────────────────────────────────────────────
  const mergedStoneGeometry = useMemo(() => {
    const list = [
      // Foundation Tier 1: Lower massive cracked stone plinth slab
      transformGeo(new THREE.BoxGeometry(4.8, 0.45, 4.4), 0, 0.22, 0),
      // Foundation Tier 2: Upper chamfered stone plinth slab
      transformGeo(new THREE.BoxGeometry(3.9, 0.40, 3.5), 0, 0.62, 0),

      // 4-Sided Tapered Ancient Stone Obelisk Body
      // (radiusTop: 1.15, radiusBottom: 1.65, height: 7.2, 4 sides rotated by 45° to align faces)
      transformGeo(new THREE.CylinderGeometry(1.15, 1.65, 7.2, 4), 0, 4.42, 0, 0, Math.PI / 4, 0),

      // Peaked 4-Sided Pyramidion Capstone (pointing ^ into the sky)
      // (radius: 1.15, height: 1.6, 4 sides rotated by 45°)
      transformGeo(new THREE.ConeGeometry(1.15, 1.6, 4), 0, 8.82, 0, 0, Math.PI / 4, 0),

      // Vertical Inset Rune Channel Border Trim Frames
      // Left vertical curb frame of front channel
      transformGeo(new THREE.BoxGeometry(0.12, 5.0, 0.16), -0.48, 4.4, 1.08),
      // Right vertical curb frame of front channel
      transformGeo(new THREE.BoxGeometry(0.12, 5.0, 0.16), 0.48, 4.4, 1.08),
      // Top channel lintel frame
      transformGeo(new THREE.BoxGeometry(0.96, 0.16, 0.16), 0, 6.95, 1.08),
      // Bottom channel sill frame
      transformGeo(new THREE.BoxGeometry(0.96, 0.16, 0.16), 0, 1.85, 1.08),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 2: Silksong Moth Guardian & Beetle Totem Crests
  // ─────────────────────────────────────────────────────────────
  const mergedTotemGeometry = useMemo(() => {
    const list = [
      // ── TOP MOTH GUARDIAN CREST (y ≈ 7.1) ──
      // Central sculpted bug head diamond
      transformGeo(new THREE.ConeGeometry(0.24, 0.48, 4), 0, 7.25, 1.18, Math.PI, Math.PI / 4, 0),
      // Left curved antenna horn
      transformGeo(new THREE.CylinderGeometry(0.04, 0.07, 0.65, 5), -0.26, 7.55, 1.12, 0, 0, -0.42),
      // Right curved antenna horn
      transformGeo(new THREE.CylinderGeometry(0.04, 0.07, 0.65, 5), 0.26, 7.55, 1.12, 0, 0, 0.42),
      // Left mandible claw
      transformGeo(new THREE.ConeGeometry(0.06, 0.35, 4), -0.14, 6.95, 1.16, Math.PI, 0, 0.2),
      // Right mandible claw
      transformGeo(new THREE.ConeGeometry(0.06, 0.35, 4), 0.14, 6.95, 1.16, Math.PI, 0, -0.2),
      // Left folded wing chevron facet
      transformGeo(new THREE.BoxGeometry(0.48, 0.36, 0.12), -0.52, 7.35, 1.06, 0, 0, 0.38),
      // Right folded wing chevron facet
      transformGeo(new THREE.BoxGeometry(0.48, 0.36, 0.12), 0.52, 7.35, 1.06, 0, 0, -0.38),

      // ── BOTTOM HORNED BEETLE CREST (y ≈ 1.85) ──
      // Beetle carapace diamond
      transformGeo(new THREE.ConeGeometry(0.26, 0.45, 4), 0, 1.95, 1.18, 0, Math.PI / 4, 0),
      // Left downward mandible
      transformGeo(new THREE.ConeGeometry(0.06, 0.32, 4), -0.14, 1.62, 1.16, Math.PI, 0, 0.15),
      // Right downward mandible
      transformGeo(new THREE.ConeGeometry(0.06, 0.32, 4), 0.14, 1.62, 1.16, Math.PI, 0, -0.15),
      // Left wing skirt
      transformGeo(new THREE.BoxGeometry(0.42, 0.28, 0.10), -0.46, 2.05, 1.08, 0, 0, -0.32),
      // Right wing skirt
      transformGeo(new THREE.BoxGeometry(0.42, 0.28, 0.10), 0.46, 2.05, 1.08, 0, 0, 0.32),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 3: Glowing Runic Inscription Channel Planes
  // ─────────────────────────────────────────────────────────────
  const mergedRuneGeometry = useMemo(() => {
    const list = [
      // Front primary rune channel plane (centered between frames)
      transformGeo(new THREE.PlaneGeometry(0.82, 4.9), 0, 4.4, 1.06),
      // Right side secondary glyph channel
      transformGeo(new THREE.PlaneGeometry(0.65, 4.0), 1.06, 4.2, 0, 0, Math.PI / 2, 0),
      // Left side secondary glyph channel
      transformGeo(new THREE.PlaneGeometry(0.65, 4.0), -1.06, 4.2, 0, 0, -Math.PI / 2, 0),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 4: Ancient Gnarled Tree Roots & Creepers
  // ─────────────────────────────────────────────────────────────
  const mergedRootGeometry = useMemo(() => {
    const list = [
      // Front-left heavy root claw crawling over plinth
      transformGeo(new THREE.CylinderGeometry(0.20, 0.36, 1.8, 5), -1.6, 0.6, 1.5, 0.4, 0.3, -0.6),
      transformGeo(new THREE.CylinderGeometry(0.14, 0.24, 1.4, 5), -2.1, 0.2, 1.9, 0.1, 0.8, -0.9),
      // Front-left climbing root creeping up obelisk corner
      transformGeo(new THREE.CylinderGeometry(0.12, 0.20, 2.2, 5), -1.15, 1.8, 1.15, 0.1, -0.2, -0.15),

      // Front-right heavy root claw
      transformGeo(new THREE.CylinderGeometry(0.22, 0.38, 1.9, 5), 1.5, 0.65, 1.4, 0.4, -0.3, 0.55),
      transformGeo(new THREE.CylinderGeometry(0.15, 0.25, 1.5, 5), 2.0, 0.22, 1.8, 0.2, -0.7, 0.85),
      // Front-right creeping vine twisting up obelisk corner
      transformGeo(new THREE.CylinderGeometry(0.12, 0.18, 2.6, 5), 1.18, 2.0, 1.12, -0.1, 0.2, 0.18),

      // Rear-left root anchoring into forest ground
      transformGeo(new THREE.CylinderGeometry(0.18, 0.34, 2.0, 5), -1.7, 0.55, -1.5, -0.5, -0.4, -0.6),
      transformGeo(new THREE.CylinderGeometry(0.12, 0.22, 1.6, 5), -2.2, 0.18, -1.9, -0.2, -0.7, -0.9),

      // Rear-right massive root trunk anchoring rear
      transformGeo(new THREE.CylinderGeometry(0.22, 0.38, 2.2, 5), 1.6, 0.6, -1.5, -0.5, 0.4, 0.6),
      transformGeo(new THREE.CylinderGeometry(0.14, 0.24, 1.6, 5), 2.1, 0.2, -1.9, -0.2, 0.8, 0.9),
      // Rear climbing branch
      transformGeo(new THREE.CylinderGeometry(0.10, 0.16, 2.4, 5), 0.95, 2.2, -1.05, 0.1, 0.3, -0.15),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // Floating Runic Embers / Spores Data (6 low-poly motes)
  const sporeCount = 6
  const sporeData = useMemo(() => {
    return Array.from({ length: sporeCount }, (_, i) => ({
      angle: (i / sporeCount) * Math.PI * 2,
      r: 0.6 + (i % 3) * 0.35,
      phase: i * 1.35,
    }))
  }, [])

  // Frame animation: Pulsing ancient cyan rune light & rising spores
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Pulsing mystical cyan glow
    if (runeLightRef.current) {
      runeLightRef.current.intensity = 8.5 + Math.sin(t * 2.4) * 2.2
    }

    // 2. Floating runic ember motes rising upward
    if (sporesRef.current) {
      sporesRef.current.children.forEach((child, i) => {
        const item = sporeData[i]
        const cycle = ((t * 0.42 + i * 0.35) % 3.0) / 3.0
        const curR = item.r + Math.sin(t * 1.1 + item.phase) * 0.22
        child.position.y = 1.2 + cycle * 6.5
        child.position.x = Math.cos(item.angle + t * 0.25) * curR
        child.position.z = 0.3 + Math.sin(item.angle + t * 0.25) * curR
        const s = 0.25 + Math.sin(cycle * Math.PI) * 0.75
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
      {/* 1. Soft Contact AO Ground Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[9.5, 9.5]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.72} depthWrite={false} />
      </mesh>

      {/* 2. Stepped Plinth, Obelisk Body & Pyramidion (Merged - 1 Draw Call) */}
      <mesh geometry={mergedStoneGeometry}>
        <meshLambertMaterial map={stoneTex} color="#a6b8ae" />
      </mesh>

      {/* 3. Silksong Moth Guardian & Beetle Totem Crests (Merged - 1 Draw Call) */}
      <mesh geometry={mergedTotemGeometry}>
        <meshLambertMaterial map={stoneTex} color="#bdcbbe" />
      </mesh>

      {/* 4. Ancient Gnarled Tree Roots & Creepers (Merged - 1 Draw Call) */}
      <mesh geometry={mergedRootGeometry}>
        <meshLambertMaterial map={rootTex} color="#bfaea0" />
      </mesh>

      {/* 5. Luminous Ancient Cyan Runic Inscriptions (Merged - 1 Draw Call) */}
      <mesh geometry={mergedRuneGeometry}>
        <meshBasicMaterial map={runeTex} transparent opacity={0.96} side={THREE.DoubleSide} />
      </mesh>

      {/* 6. Pulsing Magical Cyan Point Light */}
      <pointLight
        ref={runeLightRef}
        position={[0, 4.4, 1.4]}
        color="#55efc4"
        intensity={8.5}
        distance={16}
        decay={2}
      />

      {/* 7. Secondary Soft Backfill Ambient Cyan Glow */}
      <pointLight
        position={[0, 2.0, -0.6]}
        color="#00cec9"
        intensity={3.2}
        distance={10}
        decay={2}
      />

      {/* 8. Floating Runic Ember / Cyan Spore Particles */}
      <group ref={sporesRef}>
        {sporeData.map((_, i) => (
          <mesh key={`spore-${i}`} position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.075, 5, 4]} />
            <meshBasicMaterial color="#a8ffeb" transparent opacity={0.75} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
