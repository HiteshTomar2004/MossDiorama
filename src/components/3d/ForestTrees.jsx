import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { TREE_OBSTACLES } from './obstacleData'
import {
  CLEARINGS,
  RIVER_POINTS,
  distToPolyline,
} from './mapConfig'
import { sfx } from '../../utils/sfxPlayer'

// ─────────────────────────────────────────────────────────────────
// Tree Wind & Cat Interaction Uniforms
// ─────────────────────────────────────────────────────────────────
const treeUniforms = {
  time: { value: 0 },
  catPos: { value: new THREE.Vector3(0, 0, 0) },
}

// Static billboard material (for solid boulders)
function createBillboardMaterial(texture) {
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide,
    depthWrite: true,
  })

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `
      #ifdef USE_INSTANCING
        vec4 instanceWorldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vec4 mvPosition = modelViewMatrix * instanceWorldPos;
        float instScale = length(vec3(instanceMatrix[0].x, instanceMatrix[0].y, instanceMatrix[0].z));
        mvPosition.xy += transformed.xy * instScale;
      #else
        vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mvPosition.xy += transformed.xy;
      #endif
      gl_Position = projectionMatrix * mvPosition;
      `
    )
  }

  return mat
}

// Interactive Wobbly Tree Billboard Material (Wayfinder tree flex & wobble!)
function createWobblyTreeBillboardMaterial(texture, uniforms) {
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide,
    depthWrite: true,
  })

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.time = uniforms.time
    shader.uniforms.catPos = uniforms.catPos

    shader.vertexShader = `
      uniform float time;
      uniform vec3 catPos;
      ${shader.vertexShader}
    `

    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `
      #ifdef USE_INSTANCING
        vec4 instanceWorldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vec4 mvPosition = modelViewMatrix * instanceWorldPos;
        float instScale = length(vec3(instanceMatrix[0].x, instanceMatrix[0].y, instanceMatrix[0].z));

        // Tree flexibility: 0.0 at trunk root on ground, 1.0 at upper foliage
        float heightFactor = clamp(uv.y, 0.0, 1.0);
        float flex = pow(heightFactor, 1.35);

        // 1. Organic breeze sway rippling smoothly through forest
        float windPhase = time * 2.2 + instanceWorldPos.x * 0.08 + instanceWorldPos.z * 0.08;
        float windSway = (sin(windPhase) * 0.22 + sin(windPhase * 1.7 + 0.5) * 0.10) * flex * instScale;

        // 2. Interactive Cat phase-through wobble (Wayfinder tree interaction!)
        vec2 toCat = instanceWorldPos.xz - catPos.xz;
        float distToCat = length(toCat);
        // Brush zone when cat is within 3.5 units
        float brush = smoothstep(3.5, 0.2, distToCat);
        vec2 pushDir = normalize(toCat + vec2(0.001));
        float catScreenPush = (pushDir.x - pushDir.y) * 0.707 * brush * 0.85 * flex;

        // Springy elastic wobble when brushed
        float springWobble = sin(time * 9.0 + instanceWorldPos.x) * exp(-distToCat * 0.8) * brush * 0.55 * flex;

        vec2 localOffset = transformed.xy * instScale;
        localOffset.x += windSway + catScreenPush + springWobble;

        mvPosition.xy += localOffset;
      #else
        vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        mvPosition.xy += transformed.xy;
      #endif
      gl_Position = projectionMatrix * mvPosition;
      `
    )
  }

  return mat
}

function makeCanvasTex(canvas) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  return tex
}

// ─────────────────────────────────────────────────────────────────
// Authentic Wayfinder Tree Texture Generators
// Directly modeled after in-game screenshots media_1789155563623.jpg & media_1789155597530.png
// ─────────────────────────────────────────────────────────────────

// Tree 1: Iconic Bulbous Orange Gouache Autumn Tree (media_1789155563623.jpg)
function createWayfinderGouacheOrangeTree() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 640
  const g = c.getContext('2d')
  g.clearRect(0, 0, 512, 640)

  // 1. Large Bulbous Egg/Rounded Gouache Canopy
  const cx = 256, cy = 250, rx = 185, ry = 220
  g.save()
  g.beginPath()
  g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  g.clip()

  // Base warm coral/orange wash
  g.fillStyle = '#ea580c'
  g.fillRect(0, 0, 512, 640)

  // Curved horizontal painterly gouache bands
  const bands = [
    { y: 70, h: 50, col: '#fb923c' },
    { y: 130, h: 65, col: '#f97316' },
    { y: 210, h: 55, col: '#ea580c' },
    { y: 275, h: 70, col: '#f97316' },
    { y: 355, h: 65, col: '#ea580c' },
    { y: 430, h: 55, col: '#c2410c' },
  ]

  bands.forEach((b) => {
    g.fillStyle = b.col
    g.beginPath()
    g.ellipse(cx, b.y + b.h / 2, rx * 1.15, b.h * 0.75, 0.08, 0, Math.PI * 2)
    g.fill()
  })

  // Soft chalky peach highlight stroke curved across top-right
  g.strokeStyle = 'rgba(254, 215, 170, 0.75)'
  g.lineWidth = 14
  g.lineCap = 'round'
  g.beginPath()
  g.arc(cx + 20, cy - 30, rx * 0.78, -Math.PI * 0.45, -Math.PI * 0.1)
  g.stroke()

  g.restore()

  // 2. Thick Central Dark Timber Trunk
  g.strokeStyle = '#24140c'
  g.fillStyle = '#24140c'
  g.lineWidth = 18
  g.lineCap = 'round'
  g.lineJoin = 'round'

  g.beginPath()
  g.moveTo(cx, 620)
  g.lineTo(cx, 55)
  g.stroke()

  // 3. Signature Wayfinder Perpendicular Hatch Branches
  const drawHatchBranch = (yStart, len, angleRad, tickCount = 6) => {
    const cosA = Math.cos(angleRad)
    const sinA = Math.sin(angleRad)
    const endX = cx + cosA * len
    const endY = yStart + sinA * len

    // Main limb
    g.lineWidth = 10
    g.beginPath()
    g.moveTo(cx, yStart)
    g.lineTo(endX, endY)
    g.stroke()

    // Perpendicular ticks
    g.lineWidth = 5.5
    const perpX = -sinA * 13
    const perpY = cosA * 13

    for (let i = 1; i <= tickCount; i++) {
      const t = i / (tickCount + 0.6)
      const px = cx + cosA * len * t
      const py = yStart + sinA * len * t
      g.beginPath()
      g.moveTo(px, py)
      g.lineTo(px + perpX, py + perpY)
      g.stroke()
    }
  }

  // Draw 5 tiers of horizontal hatch branches extending across the gouache canopy
  drawHatchBranch(120, 105, -0.05, 4)
  drawHatchBranch(140, 115, Math.PI + 0.05, 4)
  drawHatchBranch(200, 140, 0.05, 6)
  drawHatchBranch(220, 150, Math.PI - 0.05, 6)
  drawHatchBranch(290, 155, -0.08, 7)
  drawHatchBranch(310, 160, Math.PI + 0.08, 7)
  drawHatchBranch(380, 145, 0.05, 6)
  drawHatchBranch(400, 140, Math.PI - 0.05, 6)

  return makeCanvasTex(c)
}

// Tree 2: Wayfinder Tiered "Bone-Branch" Conifer (media_1789155563623.jpg)
function createWayfinderBranchingPine() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 640
  const g = c.getContext('2d')
  g.clearRect(0, 0, 512, 640)

  const cx = 256

  // 1. Translucent Olive/Sage Needle Tufts on Tiers
  const drawNeedleClump = (x, y, w, h) => {
    g.fillStyle = 'rgba(100, 128, 62, 0.82)'
    g.beginPath()
    g.ellipse(x, y, w, h, -0.05, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = 'rgba(130, 162, 82, 0.70)'
    g.beginPath()
    g.ellipse(x - 2, y - 3, w * 0.65, h * 0.6, -0.1, 0, Math.PI * 2)
    g.fill()
  }

  drawNeedleClump(cx - 75, 430, 65, 22)
  drawNeedleClump(cx + 80, 420, 70, 24)
  drawNeedleClump(cx - 65, 340, 55, 20)
  drawNeedleClump(cx + 60, 335, 60, 22)
  drawNeedleClump(cx - 50, 255, 45, 18)
  drawNeedleClump(cx + 50, 250, 48, 18)
  drawNeedleClump(cx - 35, 180, 35, 16)
  drawNeedleClump(cx + 38, 175, 38, 16)

  // 2. Central Dark Wood Trunk
  g.strokeStyle = '#25160d'
  g.fillStyle = '#25160d'
  g.lineWidth = 17
  g.lineCap = 'round'
  g.lineJoin = 'round'

  g.beginPath()
  g.moveTo(cx, 620)
  g.lineTo(cx, 75)
  g.stroke()

  // 3. Tiered Branches with Perpendicular Hatch Twigs (Wayfinder Bone-Branch signature)
  const drawBranchPair = (y, spanL, spanR, angleUpDeg = 10, ticks = 5) => {
    const rad = (angleUpDeg * Math.PI) / 180

    // Left branch
    g.lineWidth = 10
    g.beginPath()
    g.moveTo(cx, y)
    g.lineTo(cx - spanL, y - Math.sin(rad) * spanL)
    g.stroke()

    // Right branch
    g.beginPath()
    g.moveTo(cx, y)
    g.lineTo(cx + spanR, y - Math.sin(rad) * spanR)
    g.stroke()

    // Ticks on left
    g.lineWidth = 5
    for (let i = 1; i <= ticks; i++) {
      const t = i / (ticks + 0.5)
      const bx = cx - spanL * t
      const by = y - Math.sin(rad) * spanL * t
      g.beginPath()
      g.moveTo(bx, by)
      g.lineTo(bx + Math.sin(rad) * 14, by - Math.cos(rad) * 14)
      g.stroke()
    }

    // Ticks on right
    for (let i = 1; i <= ticks; i++) {
      const t = i / (ticks + 0.5)
      const bx = cx + spanR * t
      const by = y - Math.sin(rad) * spanR * t
      g.beginPath()
      g.moveTo(bx, by)
      g.lineTo(bx - Math.sin(rad) * 14, by - Math.cos(rad) * 14)
      g.stroke()
    }
  }

  drawBranchPair(490, 160, 165, 12, 6)
  drawBranchPair(410, 140, 145, 14, 5)
  drawBranchPair(330, 120, 125, 15, 5)
  drawBranchPair(250, 95, 100, 16, 4)
  drawBranchPair(180, 75, 78, 18, 3)
  drawBranchPair(125, 50, 52, 20, 2)

  // Top fork
  g.lineWidth = 8
  g.beginPath()
  g.moveTo(cx, 85); g.lineTo(cx - 20, 45)
  g.moveTo(cx, 85); g.lineTo(cx + 20, 45)
  g.stroke()

  return makeCanvasTex(c)
}

// Tree 3: Geometric Triangular Pine with Chalk-White Border (media_1789155597530.png)
function createWayfinderTriangularPine() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 640
  const g = c.getContext('2d')
  g.clearRect(0, 0, 512, 640)

  const cx = 256
  const topY = 75
  const botY = 485
  const halfW = 125

  // 1. Painted Olive Triangle Body
  g.fillStyle = '#65753e'
  g.beginPath()
  g.moveTo(cx, topY)
  g.lineTo(cx + halfW, botY)
  g.lineTo(cx - halfW, botY)
  g.closePath()
  g.fill()

  // Inner subtle shadow facet on right side
  g.fillStyle = 'rgba(68, 80, 42, 0.40)'
  g.beginPath()
  g.moveTo(cx, topY)
  g.lineTo(cx + halfW, botY)
  g.lineTo(cx, botY)
  g.closePath()
  g.fill()

  // 2. Crisp Painted Chalk-White Border Outline (Directly from screenshot!)
  g.strokeStyle = '#f8fafc'
  g.lineWidth = 14
  g.lineJoin = 'round'
  g.lineCap = 'round'
  g.beginPath()
  g.moveTo(cx, topY)
  g.lineTo(cx + halfW, botY)
  g.lineTo(cx - halfW, botY)
  g.closePath()
  g.stroke()

  // 3. Prominent Dark Wood Center Trunk
  g.strokeStyle = '#26170e'
  g.lineWidth = 17
  g.lineCap = 'round'
  g.beginPath()
  g.moveTo(cx, 620)
  g.lineTo(cx, topY + 30)
  g.stroke()

  // 4. Diagonal Interior Branches reaching toward triangle edges
  g.lineWidth = 9
  g.beginPath()
  // Lower branches
  g.moveTo(cx, 440); g.lineTo(cx - 75, 400)
  g.moveTo(cx, 410); g.lineTo(cx + 80, 365)
  // Mid branches
  g.moveTo(cx, 340); g.lineTo(cx - 65, 305)
  g.moveTo(cx, 305); g.lineTo(cx + 60, 275)
  // Upper branches
  g.moveTo(cx, 240); g.lineTo(cx - 45, 215)
  g.moveTo(cx, 210); g.lineTo(cx + 40, 185)
  g.stroke()

  // Horizontal Ground Foot Bar (as seen in screenshot media_1789155597530.png)
  g.lineWidth = 14
  g.beginPath()
  g.moveTo(cx - 55, 620)
  g.lineTo(cx + 55, 620)
  g.stroke()

  return makeCanvasTex(c)
}

// Tree 4: Golden Autumn Gouache Tree (Yellow/Butterscotch variation)
function createWayfinderGoldenGouacheTree() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 640
  const g = c.getContext('2d')
  g.clearRect(0, 0, 512, 640)

  const cx = 256, cy = 250, rx = 180, ry = 215
  g.save()
  g.beginPath()
  g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  g.clip()

  // Base golden ochre wash
  g.fillStyle = '#d97706'
  g.fillRect(0, 0, 512, 640)

  // Curved horizontal bands in buttercup yellow and amber
  const bands = [
    { y: 70, h: 50, col: '#fef08a' },
    { y: 130, h: 65, col: '#facc15' },
    { y: 210, h: 55, col: '#f59e0b' },
    { y: 275, h: 70, col: '#d97706' },
    { y: 355, h: 65, col: '#b45309' },
    { y: 430, h: 55, col: '#92400e' },
  ]

  bands.forEach((b) => {
    g.fillStyle = b.col
    g.beginPath()
    g.ellipse(cx, b.y + b.h / 2, rx * 1.15, b.h * 0.75, 0.08, 0, Math.PI * 2)
    g.fill()
  })

  // Soft butter highlight stroke
  g.strokeStyle = 'rgba(254, 240, 138, 0.8)'
  g.lineWidth = 14
  g.lineCap = 'round'
  g.beginPath()
  g.arc(cx + 20, cy - 30, rx * 0.78, -Math.PI * 0.45, -Math.PI * 0.1)
  g.stroke()

  g.restore()

  // Trunk & Branches
  g.strokeStyle = '#26170e'
  g.lineWidth = 18
  g.lineCap = 'round'
  g.lineJoin = 'round'

  g.beginPath()
  g.moveTo(cx, 620)
  g.lineTo(cx, 55)
  g.stroke()

  const drawHatchBranch = (yStart, len, angleRad, tickCount = 6) => {
    const cosA = Math.cos(angleRad)
    const sinA = Math.sin(angleRad)
    const endX = cx + cosA * len
    const endY = yStart + sinA * len

    g.lineWidth = 10
    g.beginPath()
    g.moveTo(cx, yStart)
    g.lineTo(endX, endY)
    g.stroke()

    g.lineWidth = 5.5
    const perpX = -sinA * 13
    const perpY = cosA * 13

    for (let i = 1; i <= tickCount; i++) {
      const t = i / (tickCount + 0.6)
      const px = cx + cosA * len * t
      const py = yStart + sinA * len * t
      g.beginPath()
      g.moveTo(px, py)
      g.lineTo(px + perpX, py + perpY)
      g.stroke()
    }
  }

  drawHatchBranch(130, 100, -0.05, 4)
  drawHatchBranch(150, 110, Math.PI + 0.05, 4)
  drawHatchBranch(210, 135, 0.05, 6)
  drawHatchBranch(230, 145, Math.PI - 0.05, 6)
  drawHatchBranch(300, 150, -0.08, 7)
  drawHatchBranch(320, 155, Math.PI + 0.08, 7)
  drawHatchBranch(390, 140, 0.05, 6)

  return makeCanvasTex(c)
}

// ─────────────────────────────────────────────────────────────────
// Authentic Wayfinder Painted Slate Boulders
// Directly matching standing stones & mushrooms in media_1789141834072.png
// ─────────────────────────────────────────────────────────────────

function createWayfinderStandingStone() {
  const c = document.createElement('canvas')
  c.width = 384
  c.height = 420
  const g = c.getContext('2d')
  g.clearRect(0, 0, 384, 420)

  g.fillStyle = '#52606d'
  g.beginPath()
  g.moveTo(110, 400)
  g.quadraticCurveTo(70, 320, 115, 180)
  g.quadraticCurveTo(155, 50, 192, 40)
  g.quadraticCurveTo(230, 50, 270, 180)
  g.quadraticCurveTo(310, 320, 274, 400)
  g.closePath()
  g.fill()

  g.fillStyle = '#3c4752'
  g.beginPath()
  g.moveTo(192, 40)
  g.quadraticCurveTo(230, 50, 270, 180)
  g.quadraticCurveTo(310, 320, 274, 400)
  g.lineTo(192, 400)
  g.closePath()
  g.fill()

  g.strokeStyle = '#8b9baa'
  g.lineWidth = 12
  g.lineCap = 'round'
  g.beginPath()
  g.moveTo(125, 200)
  g.quadraticCurveTo(160, 80, 192, 48)
  g.stroke()

  g.fillStyle = 'rgba(74, 98, 80, 0.85)'
  g.beginPath()
  g.ellipse(192, 395, 95, 20, 0, 0, Math.PI * 2)
  g.fill()

  const drawMushroom = (mx, my, scale = 1.0) => {
    g.strokeStyle = '#e5e7eb'
    g.lineWidth = 3.5 * scale
    g.beginPath()
    g.moveTo(mx, my)
    g.lineTo(mx + 1, my - 16 * scale)
    g.stroke()

    g.fillStyle = '#a7f3d0'
    g.beginPath()
    g.ellipse(mx + 1, my - 17 * scale, 9 * scale, 6.5 * scale, 0, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#ecfdf5'
    g.beginPath()
    g.ellipse(mx + 2, my - 18 * scale, 5 * scale, 3.5 * scale, -0.2, 0, Math.PI * 2)
    g.fill()
  }

  drawMushroom(90, 405, 1.2)
  drawMushroom(115, 412, 0.9)
  drawMushroom(285, 408, 1.1)

  return makeCanvasTex(c)
}

function createWayfinderRoundBoulder() {
  const c = document.createElement('canvas')
  c.width = 384
  c.height = 288
  const g = c.getContext('2d')
  g.clearRect(0, 0, 384, 288)

  g.fillStyle = '#4a5763'
  g.beginPath()
  g.moveTo(60, 260)
  g.quadraticCurveTo(45, 110, 140, 70)
  g.quadraticCurveTo(250, 60, 320, 130)
  g.quadraticCurveTo(345, 230, 290, 265)
  g.closePath()
  g.fill()

  g.fillStyle = '#37424d'
  g.beginPath()
  g.moveTo(180, 65)
  g.quadraticCurveTo(250, 60, 320, 130)
  g.quadraticCurveTo(345, 230, 290, 265)
  g.lineTo(170, 265)
  g.closePath()
  g.fill()

  g.strokeStyle = '#8595a4'
  g.lineWidth = 10
  g.lineCap = 'round'
  g.beginPath()
  g.moveTo(95, 115)
  g.quadraticCurveTo(160, 75, 240, 95)
  g.stroke()

  g.fillStyle = 'rgba(68, 92, 75, 0.80)'
  g.beginPath()
  g.ellipse(165, 85, 65, 18, -0.05, 0, Math.PI * 2)
  g.fill()

  return makeCanvasTex(c)
}

// ─────────────────────────────────────────────────────────────────
// Tree & Boulder Definitions
// ─────────────────────────────────────────────────────────────────
const WAYFINDER_TREE_DEFS = [
  { url: '/assets/trees/tree_orange_gouache.png', w: 7.6, h: 10.8 },
  { url: '/assets/trees/tree_triangular_pine.png', w: 3.8, h: 12.0 },
  { url: '/assets/trees/tree_tiered_conifer.png', w: 8.6, h: 10.6 },
  { url: '/assets/trees/tree_golden_gouache.png', w: 7.6, h: 10.8 },
]

const WAYFINDER_BOULDER_DEFS = [
  { url: '/assets/props/rock_standing_stone.png', w: 3.4, h: 6.2 },
  { url: '/assets/props/rock_moss_boulder.png', w: 4.2, h: 3.5 },
]

// ─────────────────────────────────────────────────────────────────
// GPU-Instanced Group Components
// ─────────────────────────────────────────────────────────────────
const InstancedMeshGroup = ({ geometry, material, instances }) => {
  const meshRef = useRef()

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    instances.forEach((inst, i) => {
      dummy.position.set(inst.pos[0], 0, inst.pos[1])
      dummy.scale.set(inst.scale, inst.scale, inst.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [instances])

  if (instances.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, instances.length]}
      frustumCulled={false}
    />
  )
}

// Diagonal Cast Shadows (As seen in media_1789155563623.jpg & media_1789155597530.png)
const InstancedShadowGroup = ({ instances }) => {
  const meshRef = useRef()

  const shadowGeo = useMemo(() => {
    // Elongated diagonal oval shadow geometry
    const geo = new THREE.PlaneGeometry(3.6, 7.2)
    geo.rotateX(-Math.PI / 2)
    // Offset along diagonal (away from light [45, 80, 35], behind tree trunk in -X and -Z)
    geo.translate(-1.8, 0, -2.4)
    geo.rotateY(0.40)
    return geo
  }, [])

  const shadowMat = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(32, 64, 4, 32, 64, 55)
    grad.addColorStop(0, 'rgba(40, 32, 20, 0.42)')
    grad.addColorStop(1, 'rgba(40, 32, 20, 0.0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 128)

    const tex = new THREE.CanvasTexture(canvas)
    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.82,
    })
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    instances.forEach((inst, i) => {
      dummy.position.set(inst.pos[0], 0.02, inst.pos[1])
      dummy.scale.set(inst.scale, 1, inst.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [instances])

  if (instances.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[shadowGeo, shadowMat, instances.length]}
      frustumCulled={false}
    />
  )
}

// ─────────────────────────────────────────────────────────────────
// Main Wayfinder Forest Trees & Boulders Component
// ─────────────────────────────────────────────────────────────────
export const ForestTrees = () => {
  // Pre-generate tree textures, geometries, materials using AI-generated transparent PNGs
  const { treeMaterials, treeGeometries } = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const mats = WAYFINDER_TREE_DEFS.map((d) => {
      const tex = loader.load(d.url)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.generateMipmaps = true
      return createWobblyTreeBillboardMaterial(tex, treeUniforms)
    })
    const geos = WAYFINDER_TREE_DEFS.map((d) => {
      const geo = new THREE.PlaneGeometry(d.w, d.h)
      geo.translate(0, d.h * 0.48, 0)
      return geo
    })
    return { treeMaterials: mats, treeGeometries: geos }
  }, [])

  // Pre-generate boulder textures, geometries, materials using AI-generated transparent PNGs
  const { boulderMaterials, boulderGeometries } = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const mats = WAYFINDER_BOULDER_DEFS.map((d) => {
      const tex = loader.load(d.url)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.generateMipmaps = true
      return createBillboardMaterial(tex)
    })
    const geos = WAYFINDER_BOULDER_DEFS.map((d) => {
      const geo = new THREE.PlaneGeometry(d.w, d.h)
      geo.translate(0, d.h * 0.48, 0)
      return geo
    })
    return { boulderMaterials: mats, boulderGeometries: geos }
  }, [])

  const lastTreeRustleTime = useRef(0)

  // Calculate tree and boulder positions across the 360-unit world
  // Phase-through trees: zero collision pushout so player can walk through trees and wobble them!
  // Solid boulders: physical hitboxes preserved!
  const { treeBuckets, boulderBuckets, allShadowInstances, allTreePositions } = useMemo(() => {
    const tBuckets = Array.from({ length: WAYFINDER_TREE_DEFS.length }, () => [])
    const bBuckets = Array.from({ length: WAYFINDER_BOULDER_DEFS.length }, () => [])
    const shadows = []
    const allTreePositions = []

    TREE_OBSTACLES.length = 0

    const addTree = (typeIdx, [x, z], scale = 1.0) => {
      const tIdx = typeIdx % WAYFINDER_TREE_DEFS.length
      tBuckets[tIdx].push({ pos: [x, z], scale })
      shadows.push({ pos: [x, z], scale })
      allTreePositions.push({ x, z, r: 2.8 * scale })
    }

    const addBoulder = (typeIdx, [x, z], scale = 1.0) => {
      const bIdx = typeIdx % WAYFINDER_BOULDER_DEFS.length
      bBuckets[bIdx].push({ pos: [x, z], scale })
      shadows.push({ pos: [x, z], scale: scale * 0.8 })
      TREE_OBSTACLES.push({ x, z, r: 1.1 * scale }) // Solid hitbox for rocks!
    }

    // Safety checks
    const isInRiver = (x, z) => distToPolyline(x, z, RIVER_POINTS) < 7.2
    const isInClearing = (x, z) => {
      for (const key of Object.keys(CLEARINGS)) {
        const cl = CLEARINGS[key]
        // Allow framing trees around campfire perimeter (radius 10.5) while keeping fire pit open
        const rCheck = key === 'campfire' ? 10.5 : cl.radius + 1.2
        if (Math.hypot(x - cl.x, z - cl.z) < rCheck) return true
      }
      return false
    }
    const isNearBridge = (x, z) => Math.hypot(x - 30, z + 26.5) < 22.0
    const isNearLake = (x, z) => Math.hypot(x - 101.5, z - (-77.0)) < 13.5

    const isSafe = (x, z) =>
      !isInRiver(x, z) &&
      !isInClearing(x, z) &&
      !isNearBridge(x, z) &&
      !isNearLake(x, z)

    // ─────────────────────────────────────────────────────────────
    // Scenic Copses (26 copses + 14 lone sentinel pines = ~70 trees total)
    // De-stacked: companion trees spaced 10.5-12.5 units along screen-horizontal axis
    // ─────────────────────────────────────────────────────────────
    const SCENIC_COPSES = [
      // 0A. Campfire West Framing Copse (Directly visible in starting view!)
      { cx: -15, cz: -11, trees: [{ type: 0, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: 8.0, dz: -7.0, s: 0.92 }] },
      // 0B. Campfire Southeast Framing Copse (Shifted outward to keep spawn clearings & signs unobstructed!)
      { cx: 26.0, cz: 14.0, trees: [{ type: 3, dx: 0, dz: 0, s: 1.02 }, { type: 1, dx: -7.5, dz: 8.5, s: 0.98 }] },

      // 1. West Meadow Copse (Orange Gouache + Tiered Conifer)
      { cx: -48, cz: -18, trees: [{ type: 0, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: 8.5, dz: -7.5, s: 0.95 }] },
      // 2. Far West Copse near Blog
      { cx: -82, cz: -15, trees: [{ type: 3, dx: 0, dz: 0, s: 1.0 }, { type: 1, dx: -7.5, dz: 8.5, s: 1.05 }] },
      // 3. North Copse toward Projects
      { cx: -35, cz: -65, trees: [{ type: 0, dx: 0, dz: 0, s: 1.1 }, { type: 2, dx: 8.5, dz: -7.0, s: 0.9 }, { type: 3, dx: -8.0, dz: 8.0, s: 0.95 }] },
      // 4. Northeast Riverside Copse
      { cx: 62, cz: -55, trees: [{ type: 3, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: -7.5, dz: 8.0, s: 0.9 }] },
      // 5. North Plateau Grove
      { cx: 14, cz: -96, trees: [{ type: 0, dx: 0, dz: 0, s: 1.15 }, { type: 1, dx: 8.0, dz: -7.5, s: 1.05 }] },
      // 6. Northwest Deep Woods
      { cx: -68, cz: -100, trees: [{ type: 2, dx: 0, dz: 0, s: 1.0 }, { type: 3, dx: 8.0, dz: -7.5, s: 0.95 }] },
      // 7. Southwest Glade toward Resume
      { cx: -58, cz: 42, trees: [{ type: 0, dx: 0, dz: 0, s: 1.05 }, { type: 1, dx: -7.5, dz: 8.0, s: 1.05 }] },
      // 8. South-Central Meadow
      { cx: -18, cz: 68, trees: [{ type: 3, dx: 0, dz: 0, s: 1.0 }, { type: 2, dx: 8.5, dz: -7.0, s: 0.9 }] },
      // 9. Southeast Meadow toward Contact
      { cx: 48, cz: 48, trees: [{ type: 0, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: -7.5, dz: 8.5, s: 0.95 }] },
      // 10. East Plateau Grove
      { cx: 82, cz: 62, trees: [{ type: 3, dx: 0, dz: 0, s: 1.1 }, { type: 1, dx: 8.0, dz: -7.5, s: 1.05 }] },
      // 11. South River Copse
      { cx: 98, cz: -18, trees: [{ type: 0, dx: 0, dz: 0, s: 1.0 }, { type: 2, dx: -7.5, dz: 8.0, s: 0.9 }] },
      // 12. Far South Deep Glade
      { cx: 15, cz: 118, trees: [{ type: 3, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: 8.5, dz: -7.5, s: 0.9 }] },
      // 13. River Approach Copse
      { cx: -25, cz: -45, trees: [{ type: 0, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: 8.0, dz: -7.0, s: 0.9 }] },
      // 14. South Pathway Copse
      { cx: 36, cz: 76, trees: [{ type: 3, dx: 0, dz: 0, s: 1.1 }, { type: 1, dx: -7.5, dz: 8.0, s: 1.05 }] },
      // 15. Northeast Hills Copse
      { cx: 66, cz: -88, trees: [{ type: 0, dx: 0, dz: 0, s: 1.0 }, { type: 2, dx: 8.0, dz: -7.5, s: 0.95 }] },

      // NEW COPSES (Denser, richer storybook woodland framing):
      // 16. Northwest Far Rim
      { cx: -105, cz: -80, trees: [{ type: 1, dx: 0, dz: 0, s: 1.15 }, { type: 3, dx: 8.5, dz: -7.5, s: 1.0 }] },
      // 17. Far West Meadow Rim
      { cx: -125, cz: 18, trees: [{ type: 0, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: -7.5, dz: 8.0, s: 0.95 }] },
      // 18. Southwest Far Woods
      { cx: -85, cz: 108, trees: [{ type: 3, dx: 0, dz: 0, s: 1.1 }, { type: 1, dx: 8.0, dz: -7.5, s: 1.05 }] },
      // 19. South Deep Woods
      { cx: -45, cz: 118, trees: [{ type: 0, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: -7.5, dz: 8.0, s: 0.9 }] },
      // 20. Far South Forest Rim
      { cx: 58, cz: 122, trees: [{ type: 3, dx: 0, dz: 0, s: 1.1 }, { type: 1, dx: 8.5, dz: -7.5, s: 1.0 }] },
      // 21. Southeast Far Ridge
      { cx: 112, cz: 68, trees: [{ type: 0, dx: 0, dz: 0, s: 1.05 }, { type: 2, dx: -7.5, dz: 8.0, s: 0.95 }] },
      // 22. Far East Waterside Forest
      { cx: 118, cz: -55, trees: [{ type: 3, dx: 0, dz: 0, s: 1.05 }, { type: 1, dx: 8.0, dz: -7.5, s: 1.1 }] },
      // 23. North Mountain Rim
      { cx: -8, cz: -118, trees: [{ type: 0, dx: 0, dz: 0, s: 1.15 }, { type: 2, dx: 8.5, dz: -7.0, s: 0.95 }] },
      // 24. North-Northeast Far Woods
      { cx: 92, cz: -98, trees: [{ type: 3, dx: 0, dz: 0, s: 1.1 }, { type: 2, dx: -7.5, dz: 8.0, s: 0.9 }] },
    ]

    SCENIC_COPSES.forEach((copse, cIdx) => {
      copse.trees.forEach((tr) => {
        const tx = copse.cx + tr.dx
        const tz = copse.cz + tr.dz
        if (isSafe(tx, tz)) {
          addTree(tr.type, [tx, tz], tr.s)
        }
      })
      if (isSafe(copse.cx + 4.0, copse.cz - 3.5)) {
        addBoulder(cIdx % 2, [copse.cx + 4.0, copse.cz - 3.5], 0.92)
      }
    })

    // Lone Sentinel Pines in wide open vistas (matching screenshot media_1789155597530.png)
    const LONE_TREES = [
      { x: -28, z: 24, type: 1, s: 1.15 },
      { x: 32, z: 18, type: 1, s: 1.10 },
      { x: -78, z: 68, type: 1, s: 1.20 },
      { x: 62, z: 92, type: 1, s: 1.15 },
      { x: 18, z: -48, type: 1, s: 1.10 },
      { x: -85, z: -68, type: 2, s: 1.05 },
      { x: -42, z: 88, type: 1, s: 1.12 },
      // New lone sentinel trees
      { x: -52, z: -75, type: 1, s: 1.15 },
      { x: 44, z: -98, type: 1, s: 1.12 },
      { x: 106, z: 24, type: 3, s: 1.08 },
      { x: -112, z: 54, type: 1, s: 1.15 },
      { x: -22, z: 102, type: 1, s: 1.10 },
      { x: 74, z: -24, type: 1, s: 1.15 },
    ]

    LONE_TREES.forEach((tr) => {
      if (isSafe(tr.x, tr.z)) {
        addTree(tr.type, [tr.x, tr.z], tr.s)
      }
    })

    return {
      treeBuckets: tBuckets,
      boulderBuckets: bBuckets,
      allShadowInstances: shadows,
      allTreePositions,
    }
  }, [])

  // Hook up continuous wind, interactive cat wobble, and calm canopy rustle sound
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    treeUniforms.time.value = t
    const state = usePortfolioStore.getState()
    const pos = state.catCurrentPos
    const isMoving = state.catIsMoving

    if (pos) {
      treeUniforms.catPos.value.set(pos[0], pos[1], pos[2])

      // When cat is actively walking and brushes through/near a tree
      if (isMoving && t - lastTreeRustleTime.current > 1.1) {
        for (let i = 0; i < allTreePositions.length; i++) {
          const tr = allTreePositions[i]
          const dx = pos[0] - tr.x
          const dz = pos[2] - tr.z
          // Fast bounding box check before distance calculation
          if (Math.abs(dx) < 3.2 && Math.abs(dz) < 3.2) {
            if (dx * dx + dz * dz < tr.r * tr.r) {
              lastTreeRustleTime.current = t
              sfx.playTreeRustle()
              break
            }
          }
        }
      }
    }
  })

  return (
    <group>
      {/* 1. All Contact Shadows rendered in a Single GPU Draw Call */}
      <InstancedShadowGroup instances={allShadowInstances} />

      {/* 2. Authentic Wayfinder Tree Types (GPU Instanced) */}
      {treeBuckets.map((instances, idx) => (
        <InstancedMeshGroup
          key={`wayfinder-tree-${idx}`}
          geometry={treeGeometries[idx]}
          material={treeMaterials[idx]}
          instances={instances}
        />
      ))}

      {/* 3. Authentic Wayfinder Slate Boulders & Mushrooms (GPU Instanced) */}
      {boulderBuckets.map((instances, idx) => (
        <InstancedMeshGroup
          key={`wayfinder-boulder-${idx}`}
          geometry={boulderGeometries[idx]}
          material={boulderMaterials[idx]}
          instances={instances}
        />
      ))}
    </group>
  )
}
