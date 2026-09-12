import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { CLEARINGS, RIVER_POINTS } from './mapConfig'

// ----------------------------------------------------------------------
// Authentic Wayfinder Pale Parchment Watercolor Ground Canvas (4096 x 4096)
// Soft chalky greyish-white watercolor paper wash, horizontal paper grain,
// vibrant golden autumn leaf halo, clean riverbed, and ZERO PATHS!
// ----------------------------------------------------------------------
function createWayfinderTerrainTexture() {
  const size = 4096
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const WORLD_EXTENT = 360
  const toCanvas = (wx, wz) => ({
    x: ((wx + WORLD_EXTENT / 2) / WORLD_EXTENT) * size,
    y: ((wz + WORLD_EXTENT / 2) / WORLD_EXTENT) * size,
  })

  // 1. Base Pale Warm Storybook Watercolor Paper Wash (Wayfinder parchment aesthetic)
  ctx.fillStyle = '#e6dfd1'
  ctx.fillRect(0, 0, size, size)

  // 2. Broad Warm Watercolor Washes Across the Parchment
  const paperSpots = [
    { x: -60, z: -60, r: 140, c1: 'rgba(242, 238, 230, 0.75)', c2: 'rgba(230, 223, 209, 0)' },
    { x: 70, z: -70, r: 130, c1: 'rgba(224, 216, 204, 0.60)', c2: 'rgba(230, 223, 209, 0)' },
    { x: -70, z: 60, r: 130, c1: 'rgba(226, 218, 206, 0.65)', c2: 'rgba(230, 223, 209, 0)' },
    { x: 60, z: 70, r: 140, c1: 'rgba(245, 241, 234, 0.70)', c2: 'rgba(230, 223, 209, 0)' },
    { x: 0, z: 0, r: 110, c1: 'rgba(250, 246, 238, 0.80)', c2: 'rgba(230, 223, 209, 0)' },
    { x: -130, z: -120, r: 160, c1: 'rgba(218, 210, 196, 0.55)', c2: 'rgba(230, 223, 209, 0)' },
    { x: 130, z: 120, r: 160, c1: 'rgba(218, 210, 196, 0.55)', c2: 'rgba(230, 223, 209, 0)' },
  ]

  paperSpots.forEach((spot) => {
    const cp = toCanvas(spot.x, spot.z)
    const rPix = (spot.r / WORLD_EXTENT) * size
    const grad = ctx.createRadialGradient(cp.x, cp.y, rPix * 0.1, cp.x, cp.y, rPix)
    grad.addColorStop(0, spot.c1)
    grad.addColorStop(1, spot.c2)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cp.x, cp.y, rPix, 0, Math.PI * 2)
    ctx.fill()
  })

  // 3. Tactile Horizontal Chalky Watercolor Brush Strokes (Signature Wayfinder Paper Grain)
  let brushSeed = 1337
  const prng = () => {
    brushSeed = (brushSeed * 9301 + 49297) % 233280
    return brushSeed / 233280
  }

  for (let i = 0; i < 1600; i++) {
    const bx = prng() * size
    const by = prng() * size
    const bLen = 80 + prng() * 260
    const bHeight = 3 + prng() * 8
    const isLight = prng() > 0.42

    ctx.fillStyle = isLight
      ? 'rgba(255, 255, 255, 0.42)'
      : 'rgba(188, 178, 164, 0.22)'

    ctx.beginPath()
    ctx.ellipse(bx, by, bLen * 0.5, bHeight * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 4. Smooth Natural Riverbed under the water mesh (Zero paths crossing!)
  const drawSmoothPolyline = (points, strokeStyle, lineWidth) => {
    if (points.length < 2) return
    ctx.save()
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()

    const p0 = toCanvas(points[0][0], points[0][1])
    ctx.moveTo(p0.x, p0.y)

    for (let i = 1; i < points.length - 1; i++) {
      const pCurrent = toCanvas(points[i][0], points[i][1])
      const pNext = toCanvas(points[i + 1][0], points[i + 1][1])
      const xc = (pCurrent.x + pNext.x) / 2
      const yc = (pCurrent.y + pNext.y) / 2
      ctx.quadraticCurveTo(pCurrent.x, pCurrent.y, xc, yc)
    }
    const pLast = toCanvas(points[points.length - 1][0], points[points.length - 1][1])
    ctx.lineTo(pLast.x, pLast.y)
    ctx.stroke()
    ctx.restore()
  }

  // Gentle soft watercolor paper moist wash under the water (keeps meadow clean with NO ugly mud band!)
  drawSmoothPolyline(RIVER_POINTS, 'rgba(215, 205, 192, 0.40)', 128)
  // Riverbed pebble tone directly underneath the water mesh
  drawSmoothPolyline(RIVER_POINTS, '#8da8b8', 110)
  // Deeper riverbed slate channel
  drawSmoothPolyline(RIVER_POINTS, '#4a7082', 75)
  // Center deep channel
  drawSmoothPolyline(RIVER_POINTS, '#2e5163', 45)

  // 4b. Watercolor Lakebed Basin under Mountain Lake [101.5, -77.0]
  // Matches exact riverbed watercolor depth and moist paper rim
  const lakeCenter = toCanvas(101.5, -77.0)
  const lakeRadiusPix = (10.5 / WORLD_EXTENT) * size

  const lakeGrad = ctx.createRadialGradient(
    lakeCenter.x,
    lakeCenter.y,
    lakeRadiusPix * 0.1,
    lakeCenter.x,
    lakeCenter.y,
    lakeRadiusPix * 1.05
  )
  lakeGrad.addColorStop(0, '#2e5163')
  lakeGrad.addColorStop(0.42, '#4a7082')
  lakeGrad.addColorStop(0.72, '#8da8b8')
  lakeGrad.addColorStop(0.92, 'rgba(215, 205, 192, 0.40)')
  lakeGrad.addColorStop(1.0, 'rgba(230, 223, 209, 0)')

  ctx.fillStyle = lakeGrad
  ctx.beginPath()
  ctx.arc(lakeCenter.x, lakeCenter.y, lakeRadiusPix * 1.05, 0, Math.PI * 2)
  ctx.fill()

  // 5. Delicate Hand-Drawn Golden Maple Leaf Helper
  const drawLeaf = (lx, ly, rot, scale = 1.0, color = '#f59e0b') => {
    ctx.save()
    ctx.translate(lx, ly)
    ctx.rotate(rot)
    ctx.scale(scale, scale)

    // Soft drop shadow
    ctx.fillStyle = 'rgba(70, 60, 50, 0.22)'
    ctx.beginPath()
    ctx.ellipse(1.0, 1.5, 6.0, 3.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // 3-lobed golden maple leaf shape
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, -7)
    ctx.quadraticCurveTo(3, -5, 5, -2)
    ctx.quadraticCurveTo(6, 2, 2, 5)
    ctx.quadraticCurveTo(0, 4, -2, 5)
    ctx.quadraticCurveTo(-6, 2, -5, -2)
    ctx.quadraticCurveTo(-3, -5, 0, -7)
    ctx.fill()

    // Stem
    ctx.strokeStyle = '#b45309'
    ctx.lineWidth = 1.0
    ctx.beginPath()
    ctx.moveTo(0, 4)
    ctx.lineTo(0, 8)
    ctx.stroke()

    ctx.restore()
  }

  const leafPalette = ['#f59e0b', '#fbbf24', '#d97706', '#fef08a', '#ea580c', '#facc15']

  // 6. Iconic Wayfinder Circular Ring of Golden Leaves around Campfire
  // (Directly matches user uploaded reference screenshot media_1789141834072.png)
  const camp = toCanvas(CLEARINGS.campfire.x, CLEARINGS.campfire.z)
  const ringLeafCount = 420

  for (let i = 0; i < ringLeafCount; i++) {
    const angle = prng() * Math.PI * 2
    // Normal-ish distribution around radius 4.8 to 11.8 world units
    const rDist = 4.8 + prng() * 3.5 + prng() * 3.5
    const lx = camp.x + Math.cos(angle) * (rDist / WORLD_EXTENT) * size
    const ly = camp.y + Math.sin(angle) * (rDist / WORLD_EXTENT) * size
    const rot = prng() * Math.PI * 2
    const color = leafPalette[Math.floor(prng() * leafPalette.length)]
    const scale = 0.55 + prng() * 0.45
    drawLeaf(lx, ly, rot, scale, color)
  }

  // 7. Natural Trails of Golden Fallen Leaves Connecting Campfire to Landmarks
  // Directly inspired by media_1789155563623.jpg:
  // Pure drifts of golden autumn leaves guide travelers instead of artificial roads!
  const leafCorridors = [
    // South of bridge to stone tablet
    [[0, 0], [10, -8], [20, -14], [28, -19]],
    // North of bridge toward Stone Tablet sanctuary
    [[32, -34], [36, -46], [30, -58], [18, -66], [16, -76], [26, -88], [28, -98]],
    // Campfire to Mushroom Grove
    [[0, 0], [-18, -6], [-38, -10], [-58, -16], [-76, -22], [-92, -28], [-108, -34]],
    // Campfire to Wishing Well (Resume)
    [[0, 0], [-14, 12], [-32, 26], [-52, 42], [-70, 56], [-86, 68], [-100, 80]],
    // Campfire to Rustic Hut (Contact)
    [[0, 0], [14, 12], [30, 26], [48, 44], [64, 60], [76, 74], [86, 88]],
  ]

  // Subtle warm amber watercolor wash along the leaf paths
  leafCorridors.forEach((path) => {
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i]
      const p2 = path[i + 1]
      const cp1 = toCanvas(p1[0], p1[1])
      const cp2 = toCanvas(p2[0], p2[1])
      ctx.save()
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.10)'
      ctx.lineWidth = (16.0 / WORLD_EXTENT) * size
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cp1.x, cp1.y)
      ctx.lineTo(cp2.x, cp2.y)
      ctx.stroke()
      ctx.restore()
    }
  })

  // Paint rich, wide drifts of golden autumn leaves along all corridors
  leafCorridors.forEach((path) => {
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i]
      const p2 = path[i + 1]
      const segDist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
      const leavesInSeg = Math.floor(segDist * 5.2)

      for (let k = 0; k < leavesInSeg; k++) {
        const t = (k + prng() * 0.85) / leavesInSeg
        const lateralSpread = (prng() + prng() - 1.0) * 5.8
        const normalX = -(p2[1] - p1[1]) / (segDist || 1)
        const normalZ = (p2[0] - p1[0]) / (segDist || 1)

        const wx = p1[0] + (p2[0] - p1[0]) * t + normalX * lateralSpread
        const wz = p1[1] + (p2[1] - p1[1]) * t + normalZ * lateralSpread

        const cp = toCanvas(wx, wz)
        const rot = prng() * Math.PI * 2
        const color = leafPalette[Math.floor(prng() * leafPalette.length)]
        const scale = 0.42 + prng() * 0.48
        drawLeaf(cp.x, cp.y, rot, scale, color)
      }
    }
  })

  // 8. Golden Leaf Drifts at Landmark Districts (Natural glades)
  const landmarkClearings = [
    CLEARINGS.stoneTablet,
    CLEARINGS.mushroomGrove,
    CLEARINGS.wishingWell,
    CLEARINGS.rusticHut,
  ]

  landmarkClearings.forEach((cl) => {
    const cp = toCanvas(cl.x, cl.z)
    for (let i = 0; i < 180; i++) {
      const angle = prng() * Math.PI * 2
      const rDist = 2.5 + prng() * (cl.radius * 0.75)
      const lx = cp.x + Math.cos(angle) * (rDist / WORLD_EXTENT) * size
      const ly = cp.y + Math.sin(angle) * (rDist / WORLD_EXTENT) * size
      const rot = prng() * Math.PI * 2
      const color = leafPalette[Math.floor(prng() * leafPalette.length)]
      const scale = 0.48 + prng() * 0.42
      drawLeaf(lx, ly, rot, scale, color)
    }
  })

  // 9. Continuous Horizontal Chalk Grass Sweeps across the Paper Canvas
  // Directly gives the continuous chalk grain seen in Wayfinder!
  for (let i = 0; i < 1800; i++) {
    const gx = prng() * size
    const gy = prng() * size
    const gLen = 22 + prng() * 45
    const gHeight = 2.5 + prng() * 3.5
    const gAngle = (prng() - 0.5) * 0.12

    ctx.save()
    ctx.translate(gx, gy)
    ctx.rotate(gAngle)
    ctx.fillStyle = prng() > 0.40
      ? 'rgba(255, 255, 255, 0.52)'
      : 'rgba(235, 228, 218, 0.42)'
    ctx.beginPath()
    ctx.ellipse(0, 0, gLen * 0.5, gHeight * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

export const EnvironmentTerrain = () => {
  const meadowTexture = useMemo(() => createWayfinderTerrainTexture(), [])
  const isLmbDownRef = useRef(false)
  const isSteeringRef = useRef(false)
  const setCatTarget = usePortfolioStore((s) => s.setCatTarget)

  // Deadzone thresholds for continuous pointer steering with hysteresis:
  // - To START steering: cursor must be pulled at least 2.0 units away from cat (approx 1 cat length)
  // - To STOP steering: cursor must enter within 1.3 units of cat
  // This 0.7 unit deadband prevents any jitter, flutter, or micro-stepping at the boundary!
  const DEADZONE_START = 2.0
  const DEADZONE_STOP = 1.3

  const updateSteerTarget = (point) => {
    const catPos = usePortfolioStore.getState().catCurrentPos
    if (!catPos) {
      setCatTarget([point.x, 0, point.z])
      return
    }
    const dist = Math.hypot(point.x - catPos[0], point.z - catPos[2])

    if (isSteeringRef.current) {
      if (dist < DEADZONE_STOP) {
        // Pointer brought too close to cat: stop cleanly, zero glitching
        isSteeringRef.current = false
        setCatTarget(null)
      } else {
        setCatTarget([point.x, 0, point.z])
      }
    } else {
      if (dist >= DEADZONE_START) {
        // Pointer pulled well outside deadzone: engage smooth steering
        isSteeringRef.current = true
        setCatTarget([point.x, 0, point.z])
      } else {
        setCatTarget(null)
      }
    }
  }

  // Continuously steer cat toward mouse point while LMB is held
  const handlePointerDown = (e) => {
    if (e.button === 0) {
      isLmbDownRef.current = true
      updateSteerTarget(e.point)
    }
  }

  const handlePointerMove = (e) => {
    usePortfolioStore.getState().setCursorWorldPos([e.point.x, e.point.z])
    if (isLmbDownRef.current) {
      updateSteerTarget(e.point)
    }
  }

  const handlePointerUp = (e) => {
    if (e.button === 0) {
      isLmbDownRef.current = false
      isSteeringRef.current = false
    }
  }

  useEffect(() => {
    const onGlobalUp = (e) => {
      if (e.button === 0) {
        isLmbDownRef.current = false
        isSteeringRef.current = false
      }
    }
    window.addEventListener('pointerup', onGlobalUp)
    return () => window.removeEventListener('pointerup', onGlobalUp)
  }, [])

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[360, 360, 1, 1]} />
      <meshBasicMaterial map={meadowTexture} />
    </mesh>
  )
}
