import React, { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CLEARINGS, RIVER_POINTS, distToPolyline } from './mapConfig'
import { TREE_OBSTACLES } from './obstacleData'

// ─────────────────────────────────────────────────────────────────
// GPU Billboarding Shader Material
// Direct view-space billboarding on GPU for 60+ FPS zero-overhead
// ─────────────────────────────────────────────────────────────────
function createBillboardMaterial(texture) {
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.04,
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

function loadPropTex(url) {
  const loader = new THREE.TextureLoader()
  const tex = loader.load(url)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  return tex
}

// ─────────────────────────────────────────────────────────────────
// Cut Timber Tree Stump Canvas Texture
// ─────────────────────────────────────────────────────────────────
function createTreeStumpTexture() {
  const c = document.createElement('canvas')
  c.width = 384
  c.height = 384
  const g = c.getContext('2d')
  g.clearRect(0, 0, 384, 384)

  const cx = 192, baseY = 320, topY = 160, wTop = 85, wBot = 115

  // Bark
  g.fillStyle = '#2a1a12'
  g.beginPath()
  g.moveTo(cx - wTop, topY)
  g.lineTo(cx + wTop, topY)
  g.quadraticCurveTo(cx + wBot + 15, (topY + baseY) / 2, cx + wBot, baseY)
  g.quadraticCurveTo(cx, baseY + 18, cx - wBot, baseY)
  g.quadraticCurveTo(cx - wBot - 15, (topY + baseY) / 2, cx - wTop, topY)
  g.closePath()
  g.fill()

  // Rings
  g.fillStyle = '#c7b29a'
  g.beginPath()
  g.ellipse(cx, topY, wTop, 44, 0, 0, Math.PI * 2)
  g.fill()

  g.strokeStyle = '#3e291d'
  g.lineWidth = 3
  ;[0.82, 0.64, 0.46, 0.28].forEach((r) => {
    g.beginPath()
    g.ellipse(cx, topY, wTop * r, 44 * r, 0, 0, Math.PI * 2)
    g.stroke()
  })

  // Shelf mushrooms
  const drawMushroom = (x, y, r) => {
    g.fillStyle = '#451a03'
    g.beginPath()
    g.arc(x, y, r, Math.PI, 0, false)
    g.fill()
  }
  drawMushroom(cx - 100, baseY - 5, 22)
  drawMushroom(cx + 95, baseY - 8, 25)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ─────────────────────────────────────────────────────────────────
// Fallen Forest Stick Canvas Texture
// ─────────────────────────────────────────────────────────────────
function createFallenStickTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const g = c.getContext('2d')
  g.clearRect(0, 0, 256, 256)

  g.strokeStyle = 'rgba(40, 30, 20, 0.32)'
  g.lineWidth = 9
  g.lineCap = 'round'
  g.beginPath()
  g.moveTo(35, 145); g.lineTo(225, 125)
  g.moveTo(150, 133); g.lineTo(195, 175)
  g.stroke()

  g.strokeStyle = '#28170d'
  g.lineWidth = 8
  g.beginPath()
  g.moveTo(30, 140)
  g.lineTo(220, 120)
  g.stroke()

  g.lineWidth = 6
  g.beginPath()
  g.moveTo(145, 128)
  g.lineTo(190, 170)
  g.stroke()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ─────────────────────────────────────────────────────────────────
// Helper Component: Instanced Billboard Layer (True THREE.InstancedMesh)
// ─────────────────────────────────────────────────────────────────
const InstancedBillboardLayer = ({ texture, items, quadSize = [2.2, 2.5], yOffset = 0 }) => {
  const meshRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(quadSize[0], quadSize[1])
    geo.translate(0, quadSize[1] * 0.48, 0)
    return geo
  }, [quadSize])

  const material = useMemo(() => createBillboardMaterial(texture), [texture])

  useEffect(() => {
    if (!meshRef.current || items.length === 0) return
    const dummy = new THREE.Object3D()
    items.forEach((item, idx) => {
      const { x, z, scale = 1.0, y = yOffset } = item
      dummy.position.set(x, y, z)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(idx, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [items, yOffset])

  if (items.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, items.length]}
      frustumCulled={false}
    />
  )
}

// ─────────────────────────────────────────────────────────────────
// Helper Component: Flat Ground Quads (e.g. Fallen Sticks)
// ─────────────────────────────────────────────────────────────────
const InstancedGroundQuadLayer = ({ texture, items, quadSize = [2.2, 2.2] }) => {
  const meshRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(quadSize[0], quadSize[1])
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [quadSize])

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }, [texture])

  useEffect(() => {
    if (!meshRef.current || items.length === 0) return
    const dummy = new THREE.Object3D()
    items.forEach((item, idx) => {
      const { x, z, rot = 0, scale = 1.0 } = item
      dummy.position.set(x, 0.03, z)
      dummy.rotation.set(0, rot, 0)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(idx, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [items])

  if (items.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, items.length]}
      frustumCulled={false}
    />
  )
}

// ─────────────────────────────────────────────────────────────────
// All Extracted AI Hand-Painted Sprites Configuration
// Prominent, rich sizes (2.2 - 2.8 units) matching Wayfinder screenshot
// ─────────────────────────────────────────────────────────────────
const FLORA_SPRITE_DEFS = [
  // Red Flowers
  { key: 'redBell', url: '/assets/props/flower_red_bell.png', size: [2.2, 2.5] },
  { key: 'redBellPair', url: '/assets/props/flower_red_bell_pair.png', size: [2.6, 2.8] },
  { key: 'redPoppy', url: '/assets/props/flower_red_poppy.png', size: [2.4, 2.6] },
  { key: 'redCluster', url: '/assets/props/flower_red_cluster.png', size: [2.8, 2.8] },

  // Yellow Flowers
  { key: 'yellowBell', url: '/assets/props/flower_yellow_bell.png', size: [2.2, 2.5] },
  { key: 'yellowBellPair', url: '/assets/props/flower_yellow_bell_pair.png', size: [2.6, 2.8] },
  { key: 'yellowPoppy', url: '/assets/props/flower_yellow_poppy.png', size: [2.4, 2.6] },
  { key: 'yellowCluster', url: '/assets/props/flower_yellow_cluster.png', size: [2.8, 2.8] },

  // Wheat, Wild Grass, Reeds, Spires
  { key: 'wheatStalks', url: '/assets/props/flower_wheat_stalks.png', size: [2.4, 2.8] },
  { key: 'wildGrass', url: '/assets/props/flower_wild_grass.png', size: [2.5, 2.8] },
  { key: 'tallReed', url: '/assets/props/flower_tall_reed.png', size: [2.2, 3.2] },
  { key: 'goldenSpire', url: '/assets/props/flower_golden_spire.png', size: [2.6, 3.4] },

  // Mushrooms & Fungi
  { key: 'ringMushroom', url: '/assets/props/flower_ring_mushroom.png', size: [2.0, 2.0] },
  { key: 'shroomTrio', url: '/assets/props/flower_shroom_trio.png', size: [2.4, 2.4] },
  { key: 'whitePuff', url: '/assets/props/flower_white_puff.png', size: [2.4, 2.4] },
  { key: 'fairyCluster', url: '/assets/props/flower_fairy_cluster.png', size: [2.8, 2.6] },

  // Ancient Rocks, Snail Boulders & Monoliths
  { key: 'snailBoulder', url: '/assets/props/rock_snail_boulder.png', size: [3.6, 3.2] },
  { key: 'snailLarge', url: '/assets/props/rock_snail_large.png', size: [4.2, 3.4] },
  { key: 'standingStone', url: '/assets/props/rock_standing_stone.png', size: [2.6, 5.2] },
  { key: 'runePillar', url: '/assets/props/rock_rune_pillar.png', size: [2.2, 5.5] },
  { key: 'tallObelisk', url: '/assets/props/rock_tall_obelisk.png', size: [2.2, 5.5] },
  { key: 'mossBoulder', url: '/assets/props/rock_moss_boulder.png', size: [3.4, 2.2] },
  { key: 'riverSlate', url: '/assets/props/rock_river_slate.png', size: [3.2, 2.0] },
  { key: 'shelfBoulder', url: '/assets/props/rock_shelf_boulder.png', size: [3.2, 3.2] },
  { key: 'paintedPebbles', url: '/assets/props/rock_painted_pebbles.png', size: [2.2, 1.6] },
]

// ─────────────────────────────────────────────────────────────────
// Main ForestFlora Component (Powered by ALL Extracted AI Sprites)
// ─────────────────────────────────────────────────────────────────
export const ForestFlora = () => {
  // 1. Load All Extracted Sprites
  const textures = useMemo(() => {
    const map = {}
    FLORA_SPRITE_DEFS.forEach((d) => {
      map[d.key] = loadPropTex(d.url)
    })
    return map
  }, [])

  const treeStumpTex = useMemo(() => createTreeStumpTexture(), [])
  const fallenStickTex = useMemo(() => createFallenStickTexture(), [])

  // 2. Generate rich, lively distribution of all flora, mushrooms, rocks & monuments
  const { floraBuckets, stumpList, stickList } = useMemo(() => {
    let seed = 90210
    const prng = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const buckets = {}
    FLORA_SPRITE_DEFS.forEach((d) => {
      buckets[d.key] = []
    })

    const stumps = []
    const sticks = []

    const SOLID_ROCKS = {
      snailBoulder: 1.25,
      snailLarge: 1.55,
      standingStone: 1.05,
      runePillar: 0.95,
      tallObelisk: 0.95,
      shelfBoulder: 1.15,
      mossBoulder: 1.15,
    }

    const addProp = (key, x, z, scale = 1.0) => {
      // Exclude lake area completely (center: 101.5, -77.0, base radius 10.0 + shoreline margin)
      if (Math.hypot(x - 101.5, z - (-77.0)) < 13.5) return

      if (buckets[key]) {
        buckets[key].push({ x, z, scale })
      }
      if (SOLID_ROCKS[key]) {
        TREE_OBSTACLES.push({ x, z, r: SOLID_ROCKS[key] * scale })
      }
    }

    // ─────────────────────────────────────────────────────────────
    // A. Fairy Rings & Mushroom Groves
    // ─────────────────────────────────────────────────────────────
    // 1. Mushroom Grove (DistrictBlog: -108, -34)
    const fgX = -108
    const fgZ = -34

    // Natural fairy mushroom grove distribution across 3 organic zones (~44 mushrooms)
    const groveZones = [
      { radius: 3.8, count: 12, spread: 0.6 },
      { radius: 5.8, count: 16, spread: 0.7 },
      { radius: 8.0, count: 16, spread: 0.9 },
    ]
    groveZones.forEach(({ radius, count, spread }) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (prng() - 0.5) * 0.4
        const r = radius + (prng() - 0.5) * spread
        const rx = fgX + Math.cos(angle) * r
        const rz = fgZ + Math.sin(angle) * r
        // Keep clear around the blog typewriter robot to the right of the giant mushroom
        if (Math.hypot(rx - (-100.0), rz - (-33.5)) < 3.5) continue

        const roll = prng()
        if (roll < 0.35) addProp('ringMushroom', rx, rz, 0.65 + prng() * 0.3)
        else if (roll < 0.65) addProp('shroomTrio', rx, rz, 0.70 + prng() * 0.3)
        else if (roll < 0.85) addProp('whitePuff', rx, rz, 0.65 + prng() * 0.3)
        else addProp('fairyCluster', rx, rz, 0.75 + prng() * 0.3)
      }
    })

    // Flanking monuments & flowers at Mushroom Grove
    addProp('standingStone', fgX - 6.5, fgZ - 4.0, 1.05)
    addProp('runePillar', fgX + 6.8, fgZ + 3.5, 1.0)
    addProp('shelfBoulder', fgX - 5.5, fgZ + 5.0, 0.95)
    addProp('redBellPair', fgX + 4.2, fgZ - 4.2, 1.1)
    addProp('yellowBellPair', fgX - 4.0, fgZ - 5.0, 1.05)
    sticks.push({ x: fgX - 4.5, z: fgZ + 1.2, rot: 0.6, scale: 1.1 })
    sticks.push({ x: fgX + 4.2, z: fgZ - 1.8, rot: -0.4, scale: 1.2 })

    // 2. South Glade Fairy Ring (-14, 16)
    const sgX = -14
    const sgZ = 16
    stumps.push({ x: sgX, z: sgZ, scale: 1.1 })
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + (prng() - 0.5) * 0.3
      const r = 3.2 + (prng() - 0.5) * 0.8
      const sx = sgX + Math.cos(angle) * r
      const sz = sgZ + Math.sin(angle) * r
      if (prng() > 0.5) addProp('ringMushroom', sx, sz, 0.60 + prng() * 0.3)
      else addProp('shroomTrio', sx, sz, 0.65 + prng() * 0.3)
    }
    addProp('whitePuff', sgX + 2.5, sgZ - 2.8, 0.9)
    addProp('redPoppy', sgX - 2.6, sgZ - 2.2, 1.0)
    addProp('yellowPoppy', sgX + 2.8, sgZ + 1.8, 1.0)
    sticks.push({ x: sgX + 1.5, z: sgZ - 2.0, rot: 1.2, scale: 1.0 })

    // 3. East Glade Fairy Ring (64, -72)
    const egX = 64
    const egZ = -72
    stumps.push({ x: egX, z: egZ, scale: 1.15 })
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + (prng() - 0.5) * 0.25
      const r = 2.8 + (prng() - 0.5) * 0.6
      const ex = egX + Math.cos(angle) * r
      const ez = egZ + Math.sin(angle) * r
      if (prng() > 0.5) addProp('fairyCluster', ex, ez, 0.65 + prng() * 0.3)
      else addProp('whitePuff', ex, ez, 0.60 + prng() * 0.3)
    }
    addProp('yellowCluster', egX - 2.4, egZ + 2.2, 1.05)
    addProp('redBell', egX + 2.6, egZ - 2.0, 1.0)

    // 4. Deep North Woods Fairy Ring (-18, -108)
    const ngX = -18
    const ngZ = -108
    stumps.push({ x: ngX, z: ngZ, scale: 1.1 })
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + (prng() - 0.5) * 0.3
      const r = 2.6 + (prng() - 0.5) * 0.5
      addProp('shroomTrio', ngX + Math.cos(angle) * r, ngZ + Math.sin(angle) * r, 0.60 + prng() * 0.3)
    }

    // ─────────────────────────────────────────────────────────────
    // B. Ancient Sanctuaries, Snail Boulders & Monoliths
    // ─────────────────────────────────────────────────────────────
    // 1. Projects Sanctuary (28, -98)
    addProp('runePillar', 22, -92, 1.1)
    addProp('tallObelisk', 34, -94, 1.05)
    addProp('snailLarge', 24, -105, 1.2)
    addProp('goldenSpire', 26, -90, 1.1)
    addProp('goldenSpire', 32, -92, 1.0)
    addProp('redPoppy', 20, -96, 1.1)
    addProp('wheatStalks', 36, -98, 1.05)
    stumps.push({ x: 28, z: -94, scale: 1.15 })

    // 2. Resume Sanctuary (-100, 80)
    addProp('standingStone', -94, 75, 1.1)
    addProp('runePillar', -106, 85, 1.05)
    addProp('snailBoulder', -88, 74, 1.15)
    addProp('yellowPoppy', -92, 78, 1.05)
    addProp('yellowCluster', -102, 74, 1.1)
    addProp('wildGrass', -86, 76, 1.0)
    stumps.push({ x: -96, z: 82, scale: 1.2 })

    // 3. Contact Sanctuary (86, 88) - perimeter framing around Traveler's Cabin
    addProp('tallObelisk', 78, 82, 1.1)
    addProp('standingStone', 96, 94, 1.1)
    addProp('snailLarge', 76, 92, 1.2)
    addProp('redCluster', 80, 94, 1.1)
    addProp('redBellPair', 94, 84, 1.05)
    addProp('wheatStalks', 77, 86, 1.0)
    stumps.push({ x: 94, z: 82, scale: 1.15 })

    // 4. Campfire Clearing Environs (Moved to the lateral perimeter sides!)
    addProp('snailBoulder', -5.8, 3.2, 1.15)
    addProp('snailLarge', 6.2, -4.5, 1.1)
    addProp('wheatStalks', -6.5, 1.8, 1.05)
    addProp('wheatStalks', 7.2, 1.2, 1.0)
    // Yellow flowers moved out of the central walking space to the lateral sides:
    addProp('yellowBell', -8.2, 2.0, 1.0)
    addProp('yellowBellPair', 8.5, 2.8, 1.05)
    addProp('yellowPoppy', 8.0, -1.8, 1.0)
    addProp('goldenSpire', 8.8, 1.2, 1.0)
    // Red flowers framing side/rear edges:
    addProp('redBell', 6.5, -3.8, 1.0)
    addProp('redBellPair', -5.8, -3.2, 1.05)
    addProp('redPoppy', -6.8, 4.5, 1.0)
    addProp('wildGrass', -7.2, 2.8, 1.0)
    // Cozy shrooms and pebbles around the perimeter:
    addProp('shroomTrio', -3.8, -4.2, 0.9)
    addProp('whitePuff', 3.8, -4.5, 0.9)
    addProp('ringMushroom', -4.5, -3.0, 0.85)
    addProp('paintedPebbles', 6.8, -4.8, 1.0)
    addProp('paintedPebbles', -6.8, 2.2, 0.95)

    // 5. Scenic Snail Boulders along Trails & Vistas
    const scenicSnailLocs = [
      [10, -16, 'snailLarge', 1.25],
      [42, -38, 'snailBoulder', 1.15],
      [-45, -25, 'snailLarge', 1.2],
      [-28, 48, 'snailBoulder', 1.15],
      [55, 28, 'snailLarge', 1.2],
      [-65, 18, 'snailBoulder', 1.12],
      [15, -68, 'snailBoulder', 1.18],
      [-15, 78, 'snailLarge', 1.22],
      [42, 68, 'snailBoulder', 1.15],
    ]
    scenicSnailLocs.forEach(([x, z, type, s]) => {
      addProp(type, x, z, s)
      // Companion flower/wheat cluster
      addProp('wheatStalks', x + 1.6, z - 1.4, 1.0)
      addProp(prng() > 0.5 ? 'redBell' : 'yellowBell', x - 1.5, z + 1.2, 0.95)
      addProp('paintedPebbles', x + 1.2, z + 1.5, 0.9)
    })

    // 6. Ancient Standing Stone & Obelisk Sentinels on Ridges
    const ridgeMonuments = [
      [-75, -90, 'standingStone', 1.1],
      [72, -85, 'runePillar', 1.1],
      [-95, 50, 'tallObelisk', 1.05],
      [85, 40, 'standingStone', 1.1],
      [-42, -82, 'tallObelisk', 1.05],
      [48, 105, 'runePillar', 1.1],
    ]
    ridgeMonuments.forEach(([x, z, type, s]) => {
      addProp(type, x, z, s)
      addProp('wildGrass', x + 1.4, z - 1.2, 1.05)
      addProp('goldenSpire', x - 1.2, z + 1.2, 1.0)
    })

    // ─────────────────────────────────────────────────────────────
    // C. Riverside Reeds, River Slates & Moss Boulders (Dry Shoreline Only!)
    // ─────────────────────────────────────────────────────────────
    // Footbridge landings (safely placed on dry ground at bridge approach)
    addProp('riverSlate', 39, -35, 1.1)
    addProp('mossBoulder', 41, -33, 1.05)
    addProp('tallReed', 38, -37, 1.15)
    addProp('goldenSpire', 40, -32, 1.1)

    // River channel shoreline props (safely along river normal on dry banks)
    for (let i = 1; i < RIVER_POINTS.length - 2; i += 2) {
      const p1 = RIVER_POINTS[i]
      const p2 = RIVER_POINTS[i + 1]
      const tx = p2[0] - p1[0]
      const tz = p2[1] - p1[1]
      const len = Math.hypot(tx, tz) || 1
      const nx = -tz / len
      const nz = tx / len

      // Bank distance: 7.5 to 9.2 (completely on dry land outside the 5.5 water mesh)
      ;[1, -1].forEach((side) => {
        const bankDist = (7.5 + prng() * 1.5) * side
        const px = p1[0] + nx * bankDist + (prng() - 0.5) * 1.5
        const pz = p1[1] + nz * bankDist + (prng() - 0.5) * 1.5

        // Keep 22 units of clear buffer around the entire footbridge structure
        if (distToPolyline(px, pz, RIVER_POINTS) >= 6.8 && Math.hypot(px - 30, pz - (-26.5)) > 22.0) {
          if (prng() > 0.4) {
            addProp(side > 0 ? 'riverSlate' : 'mossBoulder', px, pz, 0.95 + prng() * 0.3)
          }
          addProp(prng() > 0.5 ? 'tallReed' : 'wildGrass', px + nx * 0.8 * side, pz + nz * 0.8 * side, 1.0 + prng() * 0.3)
          if (prng() > 0.5) {
            addProp('paintedPebbles', px - nx * 0.6 * side, pz - nz * 0.6 * side, 0.85)
          }
        }
      })
    }

    // ─────────────────────────────────────────────────────────────
    // D. Rich Meadow Wildflower Scatter (~260 scenic flora spots)
    // Red bells, poppies, yellow bells, golden spires, wheat & mushrooms!
    // ─────────────────────────────────────────────────────────────
    const meadowSpots = 260
    for (let i = 0; i < meadowSpots; i++) {
      const fx = (prng() - 0.5) * 280
      const fz = (prng() - 0.5) * 280

      if (distToPolyline(fx, fz, RIVER_POINTS) < 6.8) continue
      if (Math.hypot(fx, fz) < 2.5) continue
      if (Math.hypot(fx - 30, fz - (-26.5)) < 22.0) continue
      if (Math.hypot(fx - 101.5, fz - (-77.0)) < 13.5) continue

      // Pick randomly from all categories for a genuinely colorful, thriving meadow!
      const roll = prng()
      if (roll < 0.12) {
        // Red bellflower or red bell pair
        addProp(prng() > 0.5 ? 'redBell' : 'redBellPair', fx, fz, 0.85 + prng() * 0.35)
        if (prng() > 0.5) addProp('wheatStalks', fx + (prng() - 0.5) * 1.6, fz + (prng() - 0.5) * 1.6, 0.85)
      } else if (roll < 0.24) {
        // Red poppy or red cluster
        addProp(prng() > 0.5 ? 'redPoppy' : 'redCluster', fx, fz, 0.85 + prng() * 0.35)
      } else if (roll < 0.36) {
        // Yellow bellflower or yellow bell pair
        addProp(prng() > 0.5 ? 'yellowBell' : 'yellowBellPair', fx, fz, 0.85 + prng() * 0.35)
        if (prng() > 0.5) addProp('wildGrass', fx + (prng() - 0.5) * 1.6, fz + (prng() - 0.5) * 1.6, 0.85)
      } else if (roll < 0.48) {
        // Yellow poppy or yellow cluster
        addProp(prng() > 0.5 ? 'yellowPoppy' : 'yellowCluster', fx, fz, 0.85 + prng() * 0.35)
      } else if (roll < 0.60) {
        // Wheat stalks or wild grass
        addProp(prng() > 0.5 ? 'wheatStalks' : 'wildGrass', fx, fz, 0.90 + prng() * 0.35)
      } else if (roll < 0.70) {
        // Golden spire or tall reed
        addProp(prng() > 0.5 ? 'goldenSpire' : 'tallReed', fx, fz, 0.90 + prng() * 0.35)
      } else if (roll < 0.80) {
        // Shroom trio or white puff mushroom
        addProp(prng() > 0.5 ? 'shroomTrio' : 'whitePuff', fx, fz, 0.75 + prng() * 0.30)
      } else if (roll < 0.88) {
        // Shelf boulder or moss boulder
        addProp(prng() > 0.5 ? 'shelfBoulder' : 'mossBoulder', fx, fz, 0.85 + prng() * 0.30)
      } else if (roll < 0.94) {
        // Painted pebbles
        addProp('paintedPebbles', fx, fz, 0.80 + prng() * 0.30)
      } else {
        // Fallen sticks
        sticks.push({
          x: fx,
          z: fz,
          rot: prng() * Math.PI * 2,
          scale: 0.85 + prng() * 0.40,
        })
      }
    }

    return {
      floraBuckets: buckets,
      stumpList: stumps,
      stickList: sticks,
    }
  }, [])

  return (
    <group name="forest-flora">
      {/* 1. All 25 Extracted AI Sprites (16 Flowers/Plants + 9 Rocks/Monuments) */}
      {FLORA_SPRITE_DEFS.map((def) => {
        const items = floraBuckets[def.key] || []
        if (items.length === 0) return null
        return (
          <InstancedBillboardLayer
            key={def.key}
            texture={textures[def.key]}
            items={items}
            quadSize={def.size}
          />
        )
      })}

      {/* 2. Timber Tree Stumps */}
      <InstancedBillboardLayer
        texture={treeStumpTex}
        items={stumpList}
        quadSize={[1.8, 1.8]}
      />

      {/* 3. Fallen Timber Sticks (Flat on ground) */}
      <InstancedGroundQuadLayer
        texture={fallenStickTex}
        items={stickList}
        quadSize={[1.8, 1.8]}
      />
    </group>
  )
}
