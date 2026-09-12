// -------------------------------------------------------------
// Unified Map Layout & Navigation Configuration
// Exactly matches the user's hand-drawn sketch (Campfire, Bridge,
// Stone Tablet, Mushroom Grove, Wishing Well, Rustic Hut)
// -------------------------------------------------------------

export const CLEARINGS = {
  campfire: { x: 0, z: 0, radius: 13.0, innerClearRadius: 8.5, name: 'Campfire' },
  stoneTablet: { x: 28, z: -98, radius: 15.0, innerClearRadius: 10.0, name: 'Projects' },
  mushroomGrove: { x: -108, z: -34, radius: 15.0, innerClearRadius: 10.0, name: 'Blog' },
  wishingWell: { x: -100, z: 80, radius: 15.0, innerClearRadius: 10.0, name: 'Resume' },
  rusticHut: { x: 86, z: 88, radius: 15.0, innerClearRadius: 10.0, name: 'Contact' },
}

export const RIVER_POINTS = [
  [-12, -180],
  [-14, -150],
  [-10, -120],
  [-6, -95],
  [-8, -75],
  [-2, -56],
  [5, -46],     // Smooth approach bend (new intermediate)
  [12, -38],
  [20, -32],    // Gentle curve toward bridge (new intermediate)
  [30, -26.5],  // Wooden footbridge crossing point (only path intersection!)
  [42, -24],    // Gentle curve away from bridge (new intermediate)
  [56, -24],
  [72, -26],    // Smooth eastward flow (new intermediate)
  [88, -27],
  [105, -30],   // Smooth continuation (new intermediate)
  [122, -32],
  [140, -31],   // Gentle end (new intermediate)
  [155, -30],
  [180, -28],
]

export const WORLD_EXTENT = 360

export const BRIDGE_CONFIG = {
  position: [30, 0, -26.5],
  rotation: [0, 1.31, 0], // Spans perpendicularly across the flowing river from bank to bank
  length: 15.5,
  width: 7.5,
}

// 4 Winding Serpentine Trails with Multiple Curving S-Bends (NO PLUS SHAPE!)
export const TRAILS = {
  toStoneTablet: [
    [0, 0],
    [8, -6],
    [16, -11],
    [22, -15],
    [28, -19], // South riverbank cobblestone terminus
    [30, -26.5], // Footbridge walkway over open water
    [32, -34], // North riverbank cobblestone terminus
    [36, -42],
    [38, -50],
    [30, -58], // Curves left (S-bend 1)
    [18, -66],
    [14, -74],
    [22, -82], // Curves right (S-bend 2)
    [34, -88],
    [32, -94],
    [28, -98], // Stone Tablet Monolith
  ],
  toMushroomGrove: [
    [0, 0],
    [-8, -12],
    [-14, -24], // Curves north
    [-24, -32], // Curves west
    [-36, -34],
    [-46, -26], // Curves south-west (S-bend 1)
    [-54, -18],
    [-66, -18], // Curves back north-west (S-bend 2)
    [-78, -26],
    [-90, -34], // Sweeps west (S-bend 3)
    [-100, -36],
    [-108, -34], // Mushroom Grove
  ],
  toWishingWell: [
    [0, 0],
    [-4, 14],
    [-6, 26], // Curves south
    [2, 36],  // Curves southeast (S-bend 1)
    [4, 46],
    [-6, 54], // Curves southwest (S-bend 2)
    [-22, 60],
    [-40, 58],
    [-58, 62], // Curves south (S-bend 3)
    [-74, 70],
    [-88, 76],
    [-100, 80], // Wishing Well
  ],
  toRusticHut: [
    [0, 0],
    [12, 8],
    [24, 14], // Curves east-southeast
    [34, 24], // Curves south (S-bend 1)
    [38, 36],
    [48, 44], // Curves east (S-bend 2)
    [62, 46],
    [72, 54],
    [78, 66], // Curves south (S-bend 3)
    [82, 78],
    [86, 88], // Rustic Hut
  ],
}

export const PATH_HALF_WIDTH = 7.0 // Generous, wide cobblestone road (clearly visible!)

// Compute distance from point (px, pz) to a polyline
export function distToPolyline(px, pz, points) {
  let minDist = Infinity
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i][0]
    const z1 = points[i][1]
    const x2 = points[i + 1][0]
    const z2 = points[i + 1][1]
    const l2 = (x2 - x1) ** 2 + (z2 - z1) ** 2
    if (l2 === 0) {
      const d = Math.hypot(px - x1, pz - z1)
      if (d < minDist) minDist = d
      continue
    }
    let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2
    t = Math.max(0, Math.min(1, t))
    const projX = x1 + t * (x2 - x1)
    const projZ = z1 + t * (z2 - z1)
    const d = Math.hypot(px - projX, pz - projZ)
    if (d < minDist) minDist = d
  }
  return minDist
}

// Compute the closest point on a polyline to (px, pz)
export function getClosestPointOnPolyline(px, pz, points) {
  let minDist = Infinity
  let closestX = px
  let closestZ = pz
  let closestSeg = 0
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i][0]
    const z1 = points[i][1]
    const x2 = points[i + 1][0]
    const z2 = points[i + 1][1]
    const l2 = (x2 - x1) ** 2 + (z2 - z1) ** 2
    if (l2 === 0) continue
    let t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2))
    const projX = x1 + t * (x2 - x1)
    const projZ = z1 + t * (z2 - z1)
    const d = Math.hypot(px - projX, pz - projZ)
    if (d < minDist) {
      minDist = d
      closestX = projX
      closestZ = projZ
      closestSeg = i
    }
  }
  return { x: closestX, z: closestZ, dist: minDist, seg: closestSeg }
}

// Check if a point (px, pz) is on the North bank (Projects Monolith side) of the river
export function isNorthOfRiver(px, pz) {
  const { seg } = getClosestPointOnPolyline(px, pz, RIVER_POINTS)
  const r1 = RIVER_POINTS[seg]
  const r2 = RIVER_POINTS[seg + 1]
  const vx = r2[0] - r1[0]
  const vz = r2[1] - r1[1]
  const wx = px - r1[0]
  const wz = pz - r1[1]
  const cross = vx * wz - vz * wx
  return cross < 0
}

// Key bridge navigation waypoints aligned along the center walkway axis (rotation 1.31 rad)
export const BRIDGE_WAYPOINTS = {
  southApproach: [27.0, -15.0],
  southLanding: [28.0, -18.5],
  center: [30.0, -26.5],
  northLanding: [32.0, -34.5],
  northApproach: [33.0, -38.0],
}

// Check if a point is within any clearing
export function getClearingProximity(px, pz) {
  for (const key of Object.keys(CLEARINGS)) {
    const cl = CLEARINGS[key]
    const dist = Math.hypot(px - cl.x, pz - cl.z)
    if (dist < cl.radius) {
      return { inside: true, dist, clearing: cl }
    }
  }
  return { inside: false, dist: Infinity, clearing: null }
}

// Distance from (px, pz) to nearest trail centerline
export function distToNearestTrail(px, pz) {
  let minD = Infinity
  for (const trailKey of Object.keys(TRAILS)) {
    const d = distToPolyline(px, pz, TRAILS[trailKey])
    if (d < minD) minD = d
  }
  return minD
}

// Check if position is inside the walkable corridor or clearings
export function isPositionWalkable(px, pz) {
  if (getClearingProximity(px, pz).inside) return true
  return distToNearestTrail(px, pz) <= PATH_HALF_WIDTH
}

// Get the nearest valid walkable point if cat steps outside
export function clampToWalkable(px, pz) {
  if (isPositionWalkable(px, pz)) return { x: px, z: pz }

  // Check if near any clearing border
  for (const key of Object.keys(CLEARINGS)) {
    const cl = CLEARINGS[key]
    const dist = Math.hypot(px - cl.x, pz - cl.z)
    if (dist < cl.radius + 2.0) {
      const angle = Math.atan2(pz - cl.z, px - cl.x)
      return {
        x: cl.x + Math.cos(angle) * (cl.radius - 0.4),
        z: cl.z + Math.sin(angle) * (cl.radius - 0.4),
      }
    }
  }

  // Otherwise clamp to nearest trail corridor
  let bestProj = { x: px, z: pz }
  let bestDist = Infinity

  for (const trailKey of Object.keys(TRAILS)) {
    const points = TRAILS[trailKey]
    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i][0]
      const z1 = points[i][1]
      const x2 = points[i + 1][0]
      const z2 = points[i + 1][1]
      const l2 = (x2 - x1) ** 2 + (z2 - z1) ** 2
      if (l2 === 0) continue
      let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2
      t = Math.max(0, Math.min(1, t))
      const projX = x1 + t * (x2 - x1)
      const projZ = z1 + t * (z2 - z1)
      const d = Math.hypot(px - projX, pz - projZ)
      if (d < bestDist) {
        bestDist = d
        if (d > PATH_HALF_WIDTH) {
          const ratio = (PATH_HALF_WIDTH - 0.3) / d
          bestProj = {
            x: projX + (px - projX) * ratio,
            z: projZ + (pz - projZ) * ratio,
          }
        } else {
          bestProj = { x: px, z: pz }
        }
      }
    }
  }

  return bestProj
}
