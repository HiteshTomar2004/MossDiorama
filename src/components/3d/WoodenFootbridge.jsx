import React, { useMemo } from 'react'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────
// Authentic Wayfinder 2D Cartoonish Hand-Painted Wooden Footbridge
// Stylized gouache wooden deck planks, warm chestnut timber tones,
// hand-drawn wood grain and nail pegs, soft water drop shadow,
// 2.5D cartoon railings, and ZERO green blocks or harsh blackness!
// ─────────────────────────────────────────────────────────────────

// 1. Hand-Painted 2D Cartoon Bridge Deck Canvas Texture (1024 x 512)
function create2DCartoonBridgeTexture() {
  const w = 1024
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)

  // A. Soft Painted River Contact Drop Shadow
  ctx.fillStyle = 'rgba(12, 28, 42, 0.35)'
  ctx.beginPath()
  ctx.roundRect(18, 22, w - 36, h - 44, 20)
  ctx.fill()

  // B. Longitudinal Heavy Foundation Beams (running along top and bottom edges)
  ctx.fillStyle = '#3a2012'
  ctx.fillRect(25, 45, w - 50, 42)
  ctx.fillRect(25, h - 87, w - 50, 42)

  // C. Hand-Crafted Cartoon Wood Planks (~22 planks spanning across bridge length)
  const plankCount = 22
  const plankW = (w - 70) / plankCount
  const startX = 35

  // Warm, painterly cartoon chestnut timber palette
  const plankColors = [
    '#6c4026', '#76492e', '#5e361d', '#72462b', '#663c23',
    '#7b4d30', '#623920', '#74472c', '#5a341c', '#6f4327',
  ]

  for (let i = 0; i < plankCount; i++) {
    const px = startX + i * plankW
    const py = 35
    const pw = plankW - 4
    const ph = h - 70
    const color = plankColors[i % plankColors.length]

    // 1. Dark separation gap behind plank
    ctx.fillStyle = '#261309'
    ctx.beginPath()
    ctx.roundRect(px - 1, py - 1, pw + 2, ph + 2, 6)
    ctx.fill()

    // 2. Main Plank Body with rounded cartoon corners
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(px, py, pw, ph, 5)
    ctx.fill()

    // 3. Top-edge Gouache Highlight (gives stylized storybook bevel)
    ctx.fillStyle = 'rgba(255, 215, 175, 0.28)'
    ctx.beginPath()
    ctx.roundRect(px + 1, py + 2, pw - 2, 4, 3)
    ctx.fill()

    // 4. Subtle Painted Wood Grain lines
    ctx.strokeStyle = 'rgba(40, 20, 10, 0.22)'
    ctx.lineWidth = 2
    ctx.beginPath()
    const grainY1 = py + 40 + ((i * 37) % 60)
    const grainY2 = py + 180 + ((i * 43) % 80)
    const grainY3 = py + 320 + ((i * 29) % 70)
    ctx.moveTo(px + 3, grainY1); ctx.lineTo(px + pw - 3, grainY1 + 5)
    ctx.moveTo(px + 3, grainY2); ctx.lineTo(px + pw - 3, grainY2 - 4)
    ctx.moveTo(px + 3, grainY3); ctx.lineTo(px + pw - 3, grainY3 + 3)
    ctx.stroke()

    // 5. Cartoon Wood Knot on occasional planks
    if (i % 4 === 1) {
      const knotY = py + 120 + ((i * 51) % 200)
      ctx.fillStyle = '#32190c'
      ctx.beginPath()
      ctx.ellipse(px + pw * 0.5, knotY, pw * 0.22, 6, 0.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // 6. Cartoon Peg Nails at top and bottom ends
    const nailPositions = [py + 18, py + 38, py + ph - 38, py + ph - 18]
    nailPositions.forEach((ny) => {
      // Dark nail cavity
      ctx.fillStyle = '#1c0d05'
      ctx.beginPath()
      ctx.arc(px + pw * 0.5, ny, 3.2, 0, Math.PI * 2)
      ctx.fill()
      // Warm dot highlight
      ctx.fillStyle = '#d49b6a'
      ctx.beginPath()
      ctx.arc(px + pw * 0.5 - 0.8, ny - 0.8, 1.2, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  // D. Riverbank Dirt / Timber Transition at ends (warm dirt tone, NO GREEN!)
  const drawEndTrim = (x) => {
    ctx.fillStyle = '#422514'
    ctx.beginPath()
    ctx.roundRect(x, 32, 16, h - 64, 4)
    ctx.fill()
    ctx.fillStyle = 'rgba(215, 195, 175, 0.25)'
    ctx.fillRect(x + 2, 34, 3, h - 68)
  }
  drawEndTrim(18)
  drawEndTrim(w - 34)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// 2. Hand-Painted 2.5D Cartoon Railing Canvas Texture (1024 x 160)
function create2DCartoonRailingTexture() {
  const w = 1024
  const h = 160
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)

  // A. Heavy Top Handrail Beam
  ctx.fillStyle = '#2e160a'
  ctx.beginPath()
  ctx.roundRect(25, 20, w - 50, 18, 6)
  ctx.fill()
  ctx.fillStyle = '#653b22'
  ctx.beginPath()
  ctx.roundRect(26, 22, w - 52, 14, 5)
  ctx.fill()
  ctx.fillStyle = 'rgba(255, 215, 175, 0.35)'
  ctx.fillRect(28, 23, w - 56, 3)

  // B. Mid Timber Knee-Rail
  ctx.fillStyle = '#261207'
  ctx.fillRect(28, 78, w - 56, 12)
  ctx.fillStyle = '#56311b'
  ctx.fillRect(29, 80, w - 58, 8)

  // C. 7 Cute Cartoon Vertical Posts with rounded caps
  const postCount = 7
  const postSpacing = (w - 100) / (postCount - 1)
  for (let i = 0; i < postCount; i++) {
    const px = 50 + i * postSpacing
    // Dark post outline
    ctx.fillStyle = '#221006'
    ctx.beginPath()
    ctx.roundRect(px - 11, 10, 22, h - 18, 5)
    ctx.fill()
    // Main post timber
    ctx.fillStyle = '#603820'
    ctx.beginPath()
    ctx.roundRect(px - 9, 12, 18, h - 22, 4)
    ctx.fill()
    // Highlight streak
    ctx.fillStyle = 'rgba(255, 215, 175, 0.30)'
    ctx.fillRect(px - 7, 14, 4, h - 26)

    // Rope wrap accent at post junctions
    ctx.fillStyle = '#b58a52'
    ctx.fillRect(px - 10, 42, 20, 5)
    ctx.fillRect(px - 10, 94, 20, 5)
    ctx.strokeStyle = '#6b4c23'
    ctx.lineWidth = 1
    ctx.strokeRect(px - 10, 42, 20, 5)
    ctx.strokeRect(px - 10, 94, 20, 5)
  }

  // D. Cartoon Lanterns on First and Last Posts
  ;[50, 50 + (postCount - 1) * postSpacing].forEach((lx) => {
    // Wrought iron bracket
    ctx.fillStyle = '#161618'
    ctx.fillRect(lx - 5, 2, 10, 10)
    // Glowing amber glass core
    ctx.fillStyle = '#ffa726'
    ctx.beginPath()
    ctx.roundRect(lx - 9, -6, 18, 16, 4)
    ctx.fill()
    // Inner white-hot glow
    ctx.fillStyle = '#fff3e0'
    ctx.beginPath()
    ctx.arc(lx, 2, 3.5, 0, Math.PI * 2)
    ctx.fill()
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const WoodenFootbridge = ({
  position = [30, 0, -26.5],
  rotation = [0, 1.31, 0],
  length = 15.5,
  width = 6.4,
}) => {
  const deckTexture = useMemo(() => create2DCartoonBridgeTexture(), [])
  const railTexture = useMemo(() => create2DCartoonRailingTexture(), [])
  const halfLen = length / 2
  const maxArch = 0.52 // Graceful, visible storybook arch over the flowing river

  // 1. Arched Wooden Deck Ribbon Geometry
  const deckGeometry = useMemo(() => {
    const segments = 36
    const positions = []
    const uvs = []
    const indices = []
    const halfW = width / 2

    for (let i = 0; i <= segments; i++) {
      const u = i / segments
      const x = -halfLen + u * length
      const normX = x / halfLen
      // Parabolic arch profile: rests at 0.16 on banks, arches to 0.16 + maxArch at apex
      const y = 0.16 + maxArch * (1.0 - normX * normX)

      // Pair of vertices across the deck width (-halfW to +halfW in local Z)
      positions.push(x, y, -halfW)
      positions.push(x, y, halfW)

      uvs.push(u, 0)
      uvs.push(u, 1)

      if (i < segments) {
        const a = i * 2
        const b = a + 1
        const c = a + 2
        const d = a + 3
        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [length, width, halfLen, maxArch])

  // 2. Arched 2.5D Cartoon Handrail Ribbon Geometry
  const createArchedRailGeo = (zPos) => {
    const segments = 36
    const positions = []
    const uvs = []
    const indices = []
    const railH = 1.25

    for (let i = 0; i <= segments; i++) {
      const u = i / segments
      const x = -halfLen + u * length
      const normX = x / halfLen
      const y = 0.16 + maxArch * (1.0 - normX * normX)

      positions.push(x, y, zPos)
      positions.push(x, y + railH, zPos)

      uvs.push(u, 0)
      uvs.push(u, 1)

      if (i < segments) {
        const a = i * 2
        const b = a + 1
        const c = a + 2
        const d = a + 3
        indices.push(a, b, c)
        indices.push(b, d, c)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }

  const northRailGeo = useMemo(() => createArchedRailGeo(-width / 2 + 0.18), [length, width, halfLen, maxArch])
  const southRailGeo = useMemo(() => createArchedRailGeo(width / 2 - 0.18), [length, width, halfLen, maxArch])

  // Corner lantern apex heights
  const cornerX = halfLen - 0.8
  const cornerNormX = cornerX / halfLen
  const cornerY = 0.16 + maxArch * (1.0 - cornerNormX * cornerNormX) + 1.15

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Gracefully Arched Hand-Painted Cartoon Deck */}
      <mesh geometry={deckGeometry} renderOrder={1}>
        <meshBasicMaterial
          map={deckTexture}
          transparent
          alphaTest={0.02}
          side={THREE.DoubleSide}
          depthWrite={true}
        />
      </mesh>

      {/* 2. North Arched 2.5D Cartoon Handrail */}
      <mesh geometry={northRailGeo}>
        <meshBasicMaterial
          map={railTexture}
          transparent
          alphaTest={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. South Arched 2.5D Cartoon Handrail */}
      <mesh geometry={southRailGeo}>
        <meshBasicMaterial
          map={railTexture}
          transparent
          alphaTest={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Warm Cozy Amber Lantern Lights on the 4 Corners */}
      <pointLight
        position={[-cornerX, cornerY, width / 2 - 0.2]}
        color="#ff9e34"
        intensity={1.6}
        distance={7.5}
      />
      <pointLight
        position={[-cornerX, cornerY, -width / 2 + 0.2]}
        color="#ff9e34"
        intensity={1.6}
        distance={7.5}
      />
      <pointLight
        position={[cornerX, cornerY, width / 2 - 0.2]}
        color="#ff9e34"
        intensity={1.6}
        distance={7.5}
      />
      <pointLight
        position={[cornerX, cornerY, -width / 2 + 0.2]}
        color="#ff9e34"
        intensity={1.6}
        distance={7.5}
      />
    </group>
  )
}


