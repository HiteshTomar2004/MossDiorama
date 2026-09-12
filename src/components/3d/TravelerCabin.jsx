import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────
// High-Performance Storybook 3D Traveler's Cabin (Wayfinder / Ghibli)
// - Peaked A-frame roof (^) with zero rectangular attic clipping
// - Warm golden-honey cedar log walls (lightened, non-reddish tone)
// - Front balcony deck, joists, and railings as dark as the roof
// - Dark weathered ancient tree-root stilts at the base
// - Sized up by 20% (scale: 0.80) for balanced environmental presence
// - Curving river stone staircase with natural river stone slate
// - Consolidated into 7 merged BufferGeometries for silky 60+ FPS
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

// 1. Warm Golden-Honey Cedar Log Cabin Wall Texture (512 x 512) - NON-RED
function createLogCabinWallTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#966c3e'
  ctx.fillRect(0, 0, w, h)

  const logCount = 6
  const logH = h / logCount
  for (let i = 0; i < logCount; i++) {
    const y = i * logH
    // Luminous warm golden-amber gradient (no ugly terracotta/red)
    const grad = ctx.createLinearGradient(0, y, 0, y + logH)
    grad.addColorStop(0, '#5e4222') // top groove seam
    grad.addColorStop(0.18, '#f5dcab') // soft warm honey-cream bevel highlight
    grad.addColorStop(0.5, '#c5925a') // luminous golden honey wood body
    grad.addColorStop(0.85, '#875f32') // warm amber shadow
    grad.addColorStop(1, '#4e3518') // bottom groove seam
    ctx.fillStyle = grad
    ctx.fillRect(0, y, w, logH)

    // Hand-painted horizontal wood grain streaks
    ctx.strokeStyle = 'rgba(80, 52, 24, 0.26)'
    ctx.lineWidth = 2
    for (let g = 0; g < 4; g++) {
      ctx.beginPath()
      const gy = y + 10 + g * (logH / 4)
      ctx.moveTo(0, gy)
      ctx.bezierCurveTo(w * 0.33, gy + (i % 2 === 0 ? 3 : -3), w * 0.66, gy - (i % 2 === 0 ? 2 : -4), w, gy)
      ctx.stroke()
    }

    // Top gouache highlight rim
    ctx.fillStyle = 'rgba(255, 245, 220, 0.45)'
    ctx.fillRect(0, y + 2, w, 3)

    // Wood knot rings
    if (i % 2 === 1) {
      const kx = (i * 175 + 90) % w
      const ky = y + logH * 0.5
      ctx.fillStyle = '#80562a'
      ctx.beginPath()
      ctx.ellipse(kx, ky, 18, 9, 0.1, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(245, 220, 171, 0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 2. Dark Weathered Cedar Shake Roof Texture (512 x 512)
function createRoofShingleTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1c0d05'
  ctx.fillRect(0, 0, w, h)

  const rows = 8
  const rowH = h / rows
  const cols = 7
  const colW = w / cols
  const shingleColors = ['#2e1a0e', '#3a2113', '#251309', '#341d0f', '#3e2415', '#2a160b']

  for (let r = 0; r < rows; r++) {
    const y = r * rowH
    const xOffset = (r % 2) * (colW * 0.5)
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + xOffset
      const color = shingleColors[(r * 5 + c + 13) % shingleColors.length]

      // Drop shadow behind shingle
      ctx.fillStyle = '#100501'
      ctx.fillRect(x, y + 2, colW - 3, rowH + 4)

      // Shingle body
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x + 1, y, colW - 5, rowH - 2, [0, 0, 4, 4])
      ctx.fill()

      // Bottom bevel highlight
      ctx.fillStyle = 'rgba(255, 200, 160, 0.2)'
      ctx.fillRect(x + 2, y + rowH - 5, colW - 7, 2)

      // Vertical wood grain split
      ctx.strokeStyle = 'rgba(15, 6, 2, 0.35)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x + colW * 0.38, y + 4)
      ctx.lineTo(x + colW * 0.38, y + rowH - 4)
      ctx.stroke()

      // Subtle moss spot
      if ((r + c) % 5 === 0) {
        ctx.fillStyle = 'rgba(95, 115, 45, 0.32)'
        ctx.beginPath()
        ctx.arc(x + colW * 0.6, y + rowH * 0.7, 5, 0, Math.PI * 2)
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

// 3. Dark Weathered Balcony Timber Plank Texture (512 x 512) - MATCHES ROOF
function createDarkBalconyPlankTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#221208'
  ctx.fillRect(0, 0, w, h)

  const plankCount = 10
  const plankW = w / plankCount
  const colors = ['#2e1a0e', '#3a2113', '#251309', '#341d0f', '#3e2415', '#2a160b']

  for (let i = 0; i < plankCount; i++) {
    const x = i * plankW
    const color = colors[i % colors.length]
    // Seam
    ctx.fillStyle = '#140803'
    ctx.fillRect(x, 0, plankW, h)

    // Plank body
    ctx.fillStyle = color
    ctx.fillRect(x + 2, 0, plankW - 4, h)

    // Left gouache highlight
    ctx.fillStyle = 'rgba(255, 200, 160, 0.22)'
    ctx.fillRect(x + 3, 0, 2, h)

    // Wood grain
    ctx.strokeStyle = 'rgba(15, 6, 2, 0.32)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x + plankW * 0.5, 0)
    ctx.lineTo(x + plankW * 0.5, h)
    ctx.stroke()

    // Peg nails
    ;[25, h - 25].forEach((ny) => {
      ctx.fillStyle = '#100501'
      ctx.beginPath()
      ctx.arc(x + plankW * 0.5, ny, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#b87042'
      ctx.beginPath()
      ctx.arc(x + plankW * 0.5 - 1, ny - 1, 1, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 4. Warm Weathered Tree Bark Texture (512 x 512) - 20% LIGHTER
function createTreeBarkTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#442b1a' // ~20% lighter base
  ctx.fillRect(0, 0, w, h)

  const ridgeCount = 18
  const ridgeW = w / ridgeCount
  for (let i = 0; i < ridgeCount; i++) {
    const x = i * ridgeW
    const grad = ctx.createLinearGradient(x, 0, x + ridgeW, 0)
    grad.addColorStop(0, '#2a170c') // furrow
    grad.addColorStop(0.3, '#593a23') // ridge body
    grad.addColorStop(0.65, '#6e482c') // ridge highlight
    grad.addColorStop(1, '#3a2414') // furrow
    ctx.fillStyle = grad
    ctx.fillRect(x, 0, ridgeW, h)

    // Bark ridge lines
    ctx.strokeStyle = 'rgba(255, 215, 175, 0.35)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + ridgeW * 0.5, 0)
    for (let y = 0; y <= h; y += 40) {
      const wiggle = Math.sin((y + i * 50) * 0.04) * 4
      ctx.lineTo(x + ridgeW * 0.5 + wiggle, y)
    }
    ctx.stroke()
  }

  // Subtle earthy forest moss at ground base
  const mossGrad = ctx.createLinearGradient(0, h * 0.5, 0, h)
  mossGrad.addColorStop(0, 'rgba(60, 80, 32, 0)')
  mossGrad.addColorStop(0.65, 'rgba(70, 95, 38, 0.32)')
  mossGrad.addColorStop(1, 'rgba(80, 110, 45, 0.55)')
  ctx.fillStyle = mossGrad
  ctx.fillRect(0, h * 0.5, w, h * 0.5)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 5. Richer Darker River Stone Masonry Texture (512 x 512) - SLIGHTLY DARKER
function createStoneMasonryTexture() {
  const w = 512, h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#28323a' // darker mortar seam
  ctx.fillRect(0, 0, w, h)

  const rows = 8
  const rowH = h / rows
  const stoneColors = ['#4e5c69', '#586774', '#44515c', '#5e6f7d', '#3e4a54', '#52616d']

  for (let r = 0; r < rows; r++) {
    const y = r * rowH
    const cols = 5 + (r % 2)
    const colW = w / cols
    for (let c = 0; c < cols; c++) {
      const x = c * colW
      const color = stoneColors[(r * 4 + c) % stoneColors.length]
      // Rounded river stone block
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x + 3, y + 3, colW - 6, rowH - 6, 7)
      ctx.fill()

      // Top bevel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'
      ctx.beginPath()
      ctx.roundRect(x + 5, y + 4, colW - 10, 4, 3)
      ctx.fill()

      // Bottom shadow rim
      ctx.fillStyle = 'rgba(15, 22, 28, 0.35)'
      ctx.beginPath()
      ctx.roundRect(x + 5, y + rowH - 8, colW - 10, 4, 3)
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 6. Glowing Clear Translucent Multi-Pane Window Texture (256 x 256)
function createGlowingWindowTexture() {
  const w = 256, h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')

  // Clear, luminous pale glass gradient (soft ivory / warm moonlight, NOT fiery golden yellow)
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.5, 8, w * 0.5, h * 0.5, w * 0.65)
  glow.addColorStop(0, '#ffffff') // clean bright core
  glow.addColorStop(0.3, '#fbf8f0') // pale warm ivory
  glow.addColorStop(0.7, '#e8dcbf') // subtle soft warm tint
  glow.addColorStop(1, '#cfc2a5') // soft antique edge
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // Clear glass diagonal specular reflection / sheen (crisp sky reflection)
  ctx.fillStyle = 'rgba(235, 245, 255, 0.45)'
  ctx.beginPath()
  ctx.moveTo(0, 35); ctx.lineTo(110, 0); ctx.lineTo(155, 0); ctx.lineTo(0, 80)
  ctx.fill()
  ctx.fillStyle = 'rgba(235, 245, 255, 0.25)'
  ctx.beginPath()
  ctx.moveTo(0, 105); ctx.lineTo(185, 0); ctx.lineTo(215, 0); ctx.lineTo(0, 135)
  ctx.fill()

  // Dark timber outer sash frame
  ctx.fillStyle = '#221107'
  ctx.fillRect(0, 0, w, 18)
  ctx.fillRect(0, h - 18, w, 18)
  ctx.fillRect(0, 0, 18, h)
  ctx.fillRect(w - 18, 0, 18, h)

  // Inner wooden mullions (cross grid)
  ctx.fillRect(w * 0.5 - 5, 0, 10, h)
  ctx.fillRect(0, h * 0.5 - 5, w, 10)

  // Subtle bevel on mullions
  ctx.fillStyle = 'rgba(255, 235, 210, 0.35)'
  ctx.fillRect(w * 0.5 - 3, 18, 2, h - 36)
  ctx.fillRect(18, h * 0.5 - 3, w - 36, 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 7. Soft Radial Ground Shadow Texture (512 x 512)
function createGroundShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 512, 512)

  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 240)
  grad.addColorStop(0, 'rgba(20, 15, 10, 0.82)')
  grad.addColorStop(0.45, 'rgba(25, 18, 12, 0.50)')
  grad.addColorStop(0.8, 'rgba(30, 22, 14, 0.15)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.ellipse(256, 256, 240, 195, 0, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const TravelerCabin = ({
  position = [0, 0, 0],
  rotation = [0, (15 * Math.PI) / 180, 0],
  onInspect,
  hovered = false,
}) => {
  const lanternLightRef = useRef()
  const smokeRef = useRef()

  // Pre-generate stylized canvas textures once
  const wallTex = useMemo(() => createLogCabinWallTexture(), [])
  const roofTex = useMemo(() => createRoofShingleTexture(), [])
  const balconyTex = useMemo(() => createDarkBalconyPlankTexture(), [])
  const barkTex = useMemo(() => createTreeBarkTexture(), [])
  const stoneTex = useMemo(() => createStoneMasonryTexture(), [])
  const windowTex = useMemo(() => createGlowingWindowTexture(), [])
  const shadowTex = useMemo(() => createGroundShadowTexture(), [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 1: Curving River Stone Stairs & Foundations
  // ─────────────────────────────────────────────────────────────
  const mergedStoneGeometry = useMemo(() => {
    const list = []
    const STAIR_ROT = -0.537 // Clean diagonal angle matching the stair run

    // Subterranean solid bedrock foundation base (sinks deep below y = 0 to y = -1.2)
    list.push(transformGeo(new THREE.BoxGeometry(2.5, 1.4, 3.8), 1.40, -0.50, 2.52, 0, STAIR_ROT, 0))

    // 3 stepped masonry foundation plinths aligned at the exact same angle
    // Tier 1 (under steps 0-3, sinking to y = -1.0)
    list.push(transformGeo(new THREE.BoxGeometry(2.1, 1.7, 1.4), 1.89, -0.15, 3.35, 0, STAIR_ROT, 0))
    // Tier 2 (under steps 3-6, sinking to y = -1.0)
    list.push(transformGeo(new THREE.BoxGeometry(2.1, 2.6, 1.5), 1.40, 0.30, 2.52, 0, STAIR_ROT, 0))
    // Tier 3 (under steps 6-9, sinking to y = -1.0)
    list.push(transformGeo(new THREE.BoxGeometry(2.1, 3.5, 1.5), 0.95, 0.75, 1.77, 0, STAIR_ROT, 0))

    // Ground entrance threshold slab at the foot of the staircase
    list.push(transformGeo(new THREE.BoxGeometry(2.5, 0.35, 0.7), 2.19, 0.05, 3.84, 0, STAIR_ROT, 0))

    // 10 perfectly even stone steps rising to the porch landing
    for (let i = 0; i < 10; i++) {
      const t = i / 9
      const x = 2.1 * (1 - t) + 0.7 * t
      const y = 0.20 + 2.70 * t
      const z = 3.7 * (1 - t) + 1.35 * t
      list.push(transformGeo(new THREE.BoxGeometry(2.2, 0.38, 0.75), x, y, z, 0, STAIR_ROT, 0))
    }

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 2: Warm Golden Honey-Cedar Log Walls & Gables
  // ─────────────────────────────────────────────────────────────
  const mergedWallGeometry = useMemo(() => {
    const list = [
      // Lower floor main timber body
      transformGeo(new THREE.BoxGeometry(8.2, 3.4, 5.3), 0, 4.85, -1.1),
      // Inner attic box (fits 100% inside the A-frame roof slopes, ZERO extrusion!)
      transformGeo(new THREE.BoxGeometry(2.2, 2.4, 5.0), -0.5, 7.7, -1.1),
      // Lower front window frame
      transformGeo(new THREE.BoxGeometry(1.85, 1.65, 0.12), 2.2, 4.75, 1.54),
      // Lower right window frame
      transformGeo(new THREE.BoxGeometry(1.8, 1.6, 0.12), 4.12, 4.75, -1.0, 0, Math.PI / 2, 0),
      // Upper single window frame centered on the triangular gable (x = -0.5)
      transformGeo(new THREE.BoxGeometry(1.2, 1.3, 0.1), -0.5, 8.1, 1.57),
    ]

    // Triangular Gable Facades (pointing upwards ^)
    const shape = new THREE.Shape()
    shape.moveTo(-2.2, 0)
    shape.lineTo(0, 4.9)
    shape.lineTo(2.2, 0)
    shape.closePath()

    const gFront = new THREE.ShapeGeometry(shape)
    gFront.computeVertexNormals()
    list.push(transformGeo(gFront, -0.5, 6.55, 1.54))

    const gRear = new THREE.ShapeGeometry(shape)
    gRear.computeVertexNormals()
    list.push(transformGeo(gRear, -0.5, 6.55, -3.74, 0, Math.PI, 0))

    // 20 low-poly interlocking log corner end-caps (5-sided chiseled logs)
    const xOffsets = [-4.15, 4.15]
    const zOffsets = [1.55, -3.75]
    xOffsets.forEach((cx) => {
      zOffsets.forEach((cz) => {
        for (let t = 0; t < 5; t++) {
          const cy = 3.5 + t * 0.65
          const isX = (t % 2 === 0)
          list.push(transformGeo(
            new THREE.CylinderGeometry(0.24, 0.24, 0.70, 5),
            cx + (isX ? (cx > 0 ? 0.25 : -0.25) : 0), cy, cz + (!isX ? (cz > 0 ? 0.25 : -0.25) : 0),
            isX ? 0 : Math.PI / 2, 0, isX ? Math.PI / 2 : 0
          ))
        }
      })
    })

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 3: Front Balcony Area & Door (AS DARK AS THE ROOF)
  // ─────────────────────────────────────────────────────────────
  const mergedBalconyGeometry = useMemo(() => {
    const list = [
      // Underfloor cross-beams
      transformGeo(new THREE.BoxGeometry(8.8, 0.45, 0.45), 0, 3.0, 0.5),
      transformGeo(new THREE.BoxGeometry(8.8, 0.45, 0.45), 0, 3.0, -2.6),
      transformGeo(new THREE.BoxGeometry(0.45, 0.45, 3.8), -3.6, 3.0, -1.05),
      transformGeo(new THREE.BoxGeometry(0.45, 0.45, 3.8), 3.4, 3.0, -1.05),
      // Front Porch deck platform
      transformGeo(new THREE.BoxGeometry(5.2, 0.22, 2.4), -1.8, 3.12, 1.3),
      // Front top/mid handrails
      transformGeo(new THREE.BoxGeometry(4.9, 0.14, 0.14), -1.8, 4.45, 2.4),
      transformGeo(new THREE.BoxGeometry(4.9, 0.09, 0.09), -1.8, 3.75, 2.4),
      // Left side top/mid rails
      transformGeo(new THREE.BoxGeometry(0.14, 0.14, 2.2), -4.2, 4.45, 1.35),
      transformGeo(new THREE.BoxGeometry(0.09, 0.09, 2.2), -4.2, 3.75, 1.35),
      // Front door leaf & frame
      transformGeo(new THREE.BoxGeometry(1.7, 2.6, 0.12), -1.6, 4.35, 1.54),
      transformGeo(new THREE.BoxGeometry(1.42, 2.38, 0.06), -1.6, 4.30, 1.58),
      // Front A-frame gable bargeboard trims
      transformGeo(new THREE.BoxGeometry(0.22, 5.8, 0.35), -1.75, 9.05, 1.62, 0, 0, -0.583),
      transformGeo(new THREE.BoxGeometry(0.22, 5.8, 0.35), 0.75, 9.05, 1.62, 0, 0, 0.583),
      // Right eave fascia trim
      transformGeo(new THREE.BoxGeometry(2.8, 0.22, 0.35), 3.05, 6.90, 1.62, 0, 0, -0.18),
    ]

    // Cantilevered floor joists under porch
    ;[-4.0, -3.0, -2.0, -1.0, 0.4].forEach((jx) => {
      list.push(transformGeo(new THREE.BoxGeometry(0.2, 0.24, 2.6), jx, 2.95, 1.3))
    })

    // Low-poly architectural squared timber porch posts (12 triangles each)
    ;[[-4.2, 3.9, 2.4], [-2.6, 3.9, 2.4], [-1.0, 3.9, 2.4], [0.6, 3.9, 2.4], [-4.2, 3.9, 0.3]].forEach((pos) => {
      list.push(transformGeo(new THREE.BoxGeometry(0.16, 1.4, 0.16), pos[0], pos[1], pos[2]))
    })

    // Low-poly squared X-brace branch balusters
    ;[
      [-3.4, 2.4, 0.55], [-3.4, 2.4, -0.55],
      [-1.8, 2.4, 0.55], [-1.8, 2.4, -0.55],
      [-0.2, 2.4, 0.55], [-0.2, 2.4, -0.55],
    ].forEach((br) => {
      list.push(transformGeo(new THREE.BoxGeometry(0.08, 1.6, 0.08), br[0], 4.05, br[1], 0, 0, br[2]))
    })

    // Staircase vertical posts along the outer edge of the stone steps (NO tilted pole!)
    ;[
      [2.76, 1.11, 3.93, 0.85],
      [2.30, 2.01, 3.15, 0.85],
      [1.83, 2.91, 2.36, 0.85],
      [1.52, 3.51, 1.84, 0.85],
    ].forEach((p) => {
      list.push(transformGeo(new THREE.CylinderGeometry(0.07, 0.08, p[3], 5), p[0], p[1], p[2]))
    })

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 4: Storybook Stepped Cedar Shake Roof & Rafters
  // ─────────────────────────────────────────────────────────────
  const mergedRoofGeometry = useMemo(() => {
    const list = [
      // Central A-Frame Roof Slopes — forming an inverted V (^) over the attic tower
      // Left slope: from ridge (-0.5, 11.6) down over the porch to left eave
      transformGeo(new THREE.BoxGeometry(0.22, 6.8, 6.2), -2.25, 8.85, -1.1, 0, 0, -0.583),
      // Right slope: from ridge (-0.5, 11.6) down to right eave
      transformGeo(new THREE.BoxGeometry(0.22, 6.0, 6.2), 1.05, 9.15, -1.1, 0, 0, 0.583),

      // Right lower roof tier sloping gently down over the right ground floor wall
      transformGeo(new THREE.BoxGeometry(2.8, 0.22, 5.8), 3.05, 6.90, -1.1, 0, 0, -0.18),

      // Heavy timber ridge cap beam along the peak (6 segments)
      transformGeo(new THREE.CylinderGeometry(0.24, 0.24, 6.3, 6), -0.5, 11.65, -1.1, Math.PI / 2, 0, 0),
    ]

    // 8 low-poly rustic rafter stick ends protruding along the roof ridge
    for (let i = 0; i < 8; i++) {
      const z = -3.6 + i * 0.72
      const h = 0.68 + Math.sin(i * 2.1) * 0.18
      list.push(transformGeo(
        new THREE.CylinderGeometry(0.06, 0.08, h, 4),
        -0.5 + Math.sin(i * 5.1) * 0.06, 11.85 + h * 0.5, z,
        Math.cos(i * 4.3) * 0.12, 0, Math.sin(i * 3.7) * 0.10
      ))
    }

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 5: Deep Dark Ancient Tree Bark Stilts & Trunks
  // ─────────────────────────────────────────────────────────────
  const mergedBarkGeometry = useMemo(() => {
    const list = [
      // Left main gnarled trunk (8 segments) - cleanly grounded from y = -1.2 to y = 3.2 (height 4.4)
      transformGeo(new THREE.CylinderGeometry(1.3, 1.85, 4.4, 8), -3.6, 1.0, 0.5, 0.08, 0.2, -0.10),

      // Right main trunk (8 segments) - cleanly grounded from y = -1.2 to y = 3.2 (height 4.4)
      transformGeo(new THREE.CylinderGeometry(1.25, 1.80, 4.4, 8), 3.6, 1.0, 0.3, -0.06, -0.2, 0.08),

      // Rear stilt posts (6 segments) - cleanly grounded from y = -1.2 to y = 3.2 (height 4.4)
      transformGeo(new THREE.CylinderGeometry(0.30, 0.36, 4.4, 6), -3.4, 1.0, -2.6),
      transformGeo(new THREE.CylinderGeometry(0.30, 0.36, 4.4, 6), 3.2, 1.0, -2.6),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 6: Glowing Amber Windows
  // ─────────────────────────────────────────────────────────────
  const mergedWindowGeometry = useMemo(() => {
    const list = [
      // Lower front window
      transformGeo(new THREE.PlaneGeometry(1.6, 1.4), 2.2, 4.75, 1.61),
      // Lower right side window
      transformGeo(new THREE.PlaneGeometry(1.5, 1.3), 4.19, 4.75, -1.0, 0, Math.PI / 2, 0),
      // Upper single attic window centered on triangular gable (x = -0.5)
      transformGeo(new THREE.PlaneGeometry(1.05, 1.15), -0.5, 8.1, 1.63),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // ─────────────────────────────────────────────────────────────
  // MERGED GEOMETRY 7: Rustic Iron Props & Slender Stovepipe Chimney
  // ─────────────────────────────────────────────────────────────
  const mergedIronGeometry = useMemo(() => {
    const list = [
      // Porch lantern hook & top
      transformGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 4), 0.6, 4.65, 2.4),
      // Door latch
      transformGeo(new THREE.BoxGeometry(0.06, 0.2, 0.08), -1.1, 4.30, 1.64),

      // Slender rustic iron stovepipe chimney firmly planted through the roof
      transformGeo(new THREE.CylinderGeometry(0.18, 0.20, 3.4, 6), -2.2, 9.90, -1.5),
      // Roof flashing collar sealing the chimney base to the roof
      transformGeo(new THREE.BoxGeometry(0.55, 0.08, 0.55), -2.2, 8.95, -1.5, 0, 0, -0.583),
      // Iron chimney stay bracket securing the pipe to the roof peak
      transformGeo(new THREE.BoxGeometry(1.65, 0.05, 0.05), -1.35, 10.6, -1.5),
      // Stovepipe rain cowl cap (6 segments)
      transformGeo(new THREE.CylinderGeometry(0.36, 0.05, 0.16, 6), -2.2, 11.65, -1.5),
    ]

    return mergeBufferGeometries(list)
  }, [])

  // Lightweight Smoke Particle Data (4 low-poly puffs)
  const smokeCount = 4
  const smokeData = useMemo(() => {
    return Array.from({ length: smokeCount }, (_, i) => ({
      offsetY: (i / smokeCount) * 3.6,
      phase: i * 1.35,
      scale: 0.3 + (i / smokeCount) * 0.5,
    }))
  }, [])

  // Lightweight Frame Updates (NO material mutations!)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Soft lantern firelight flicker
    if (lanternLightRef.current) {
      lanternLightRef.current.intensity = 4.0 + Math.sin(t * 3.2) * 0.7
    }

    // 2. Smoke particles drift from the stovepipe cowl
    if (smokeRef.current) {
      smokeRef.current.children.forEach((child, i) => {
        const item = smokeData[i]
        const cycle = ((t * 0.55 + i * 0.5) % 3.0) / 3.0
        child.position.y = 11.75 + cycle * 3.6
        child.position.x = -2.2 + Math.sin(t * 0.7 + item.phase) * 0.3 + cycle * 0.5
        child.position.z = -1.5 + Math.cos(t * 0.6 + item.phase) * 0.2
        const s = 0.3 + cycle * 0.9
        child.scale.set(s, s, s)
      })
    }
  })

  return (
    // Sized up by 20% from 0.67 -> 0.804 (scale: 0.80), rotated anticlockwise by 15 deg
    <group position={position} rotation={rotation} scale={[0.80, 0.80, 0.80]} onClick={onInspect}>
      {/* 1. Soft Contact AO Ground Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0.2]}>
        <planeGeometry args={[18.5, 15.5]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.65} depthWrite={false} />
      </mesh>

      {/* 2. Curving River Stone Stairs & Foundations (Merged - 1 Draw Call) */}
      <mesh geometry={mergedStoneGeometry}>
        <meshLambertMaterial map={stoneTex} color="#b4c0cb" />
      </mesh>

      {/* 3. Warm Golden Honey-Cedar Log Cabin Walls & Gables (Merged - 1 Draw Call) */}
      <mesh geometry={mergedWallGeometry}>
        <meshLambertMaterial map={wallTex} color="#fbf4ea" side={THREE.DoubleSide} />
      </mesh>

      {/* 4. Front Balcony Area & Door (AS DARK AS THE ROOF) (Merged - 1 Draw Call) */}
      <mesh geometry={mergedBalconyGeometry}>
        <meshLambertMaterial map={balconyTex} color="#cfb8a6" />
      </mesh>

      {/* 5. Dark Weathered Cedar Shake Roof (Merged - 1 Draw Call) */}
      <mesh geometry={mergedRoofGeometry}>
        <meshLambertMaterial map={roofTex} color="#cfb8a6" side={THREE.DoubleSide} />
      </mesh>

      {/* 6. Deep Ancient Tree Bark Stilts & Roots (~20% Lighter) (Merged - 1 Draw Call) */}
      <mesh geometry={mergedBarkGeometry}>
        <meshLambertMaterial map={barkTex} color="#b29b87" />
      </mesh>

      {/* 7. Clear Translucent Multi-Pane Windows (Merged - 1 Draw Call) */}
      <mesh geometry={mergedWindowGeometry}>
        <meshBasicMaterial map={windowTex} />
      </mesh>

      {/* 8. Rustic Iron Cauldron, Stovepipe & Lantern Hook (Merged - 1 Draw Call) */}
      <mesh geometry={mergedIronGeometry}>
        <meshLambertMaterial color="#26262a" />
      </mesh>

      {/* 9. Porch Clear Glowing Lantern Core */}
      <mesh position={[0.6, 4.35, 2.4]}>
        <boxGeometry args={[0.28, 0.38, 0.28]} />
        <meshBasicMaterial map={windowTex} />
      </mesh>

      {/* 10. Soft Gentle Firelight Glow on Porch */}
      <pointLight
        ref={lanternLightRef}
        position={[0.6, 4.35, 2.5]}
        color="#fff2db"
        intensity={3.8}
        distance={12}
        decay={2}
      />

      {/* 11. Lightweight Animated Chimney Smoke Puffs (Low-Poly) */}
      <group ref={smokeRef}>
        {smokeData.map((_, i) => (
          <mesh key={`smoke-${i}`} position={[-2.2, 11.75, -1.5]}>
            <sphereGeometry args={[0.34, 5, 4]} />
            <meshBasicMaterial color="#eeddc8" transparent opacity={0.20} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
