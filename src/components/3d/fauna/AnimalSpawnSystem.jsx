import { Billboard } from '@react-three/drei'
import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'
import { RIVER_POINTS } from '../mapConfig'

/**
 * AnimalSpawnSystem
 * Authentic Wayfinder-style living fauna:
 * 1. River Koi: Swimming head-first downstream in current direction (180° flipped)
 * 2. Riverbank Frogs: On dry riverbank stones with cute water-droplet/guiro croak & hops
 * 3. Wayfinder-Style Songbirds: Perched on rails & benches, gentle idle bob, 2-frame wing flutter & chirp on approach
 * 4. Wayfinder-Style Curled Foxes: Curled sleeping bean silhouette on ground; wakes up with big cartoon eye when cat approaches
 */

const FISH_CONFIGS = [
  // 1. Far Upstream Origin (High North Mountains, u: 0.04 - 0.22)
  { initialU: 0.04, lateralOffset: -0.8, speed: 0.011, scale: 1.25, phase: 0.3 },
  { initialU: 0.10, lateralOffset: 1.1, speed: 0.009, scale: 1.15, phase: 1.8 },
  { initialU: 0.16, lateralOffset: -1.3, speed: 0.013, scale: 1.35, phase: 3.5 },
  { initialU: 0.22, lateralOffset: 0.7, speed: 0.010, scale: 1.10, phase: 5.1 },

  // 2. Upstream Approach & Northern Meanders (u: 0.28 - 0.46)
  { initialU: 0.28, lateralOffset: -1.0, speed: 0.012, scale: 1.30, phase: 0.9 },
  { initialU: 0.34, lateralOffset: 1.2, speed: 0.011, scale: 1.20, phase: 2.4 },
  { initialU: 0.40, lateralOffset: -0.6, speed: 0.014, scale: 1.40, phase: 4.0 },
  { initialU: 0.46, lateralOffset: 0.9, speed: 0.010, scale: 1.05, phase: 1.2 },

  // 3. Wooden Footbridge Crossing & Mid-River (u: 0.52 - 0.70)
  { initialU: 0.52, lateralOffset: -1.4, speed: 0.012, scale: 1.25, phase: 3.0 },
  { initialU: 0.58, lateralOffset: 0.8, speed: 0.011, scale: 1.15, phase: 4.7 },
  { initialU: 0.64, lateralOffset: -0.9, speed: 0.013, scale: 1.35, phase: 0.5 },
  { initialU: 0.70, lateralOffset: 1.3, speed: 0.010, scale: 1.10, phase: 2.1 },

  // 4. Downstream Eastbound & Far Horizon (u: 0.76 - 0.94)
  { initialU: 0.76, lateralOffset: -1.1, speed: 0.012, scale: 1.30, phase: 3.8 },
  { initialU: 0.82, lateralOffset: 0.7, speed: 0.009, scale: 1.15, phase: 5.4 },
  { initialU: 0.88, lateralOffset: -1.2, speed: 0.013, scale: 1.40, phase: 1.6 },
  { initialU: 0.94, lateralOffset: 1.0, speed: 0.011, scale: 1.20, phase: 3.2 },
]

const FROG_SPAWNS = [
  { pos: [24.0, 0.12, -14.5], scale: 3.3, shadowR: 1.1 },   // South of footbridge dry riverbank
  { pos: [36.0, 0.12, -38.5], scale: 3.25, shadowR: 1.05 }, // North of footbridge dry riverbank
  { pos: [58.0, 0.12, -14.0], scale: 3.35, shadowR: 1.15 }, // East river shoreline knoll
  { pos: [84.0, 0.12, -17.0], scale: 3.3, shadowR: 1.1 },   // Mid-east riverbank grass
  { pos: [115.0, 0.12, -20.0], scale: 3.25, shadowR: 1.05 },// Far-east riverbank reeds
  { pos: [14.0, 0.12, -48.0], scale: 3.3, shadowR: 1.1 },   // West river meander bank
  { pos: [-16.0, 0.12, -68.0], scale: 3.35, shadowR: 1.15 },// Upstream west dry riverbank
  { pos: [-22.0, 0.12, -100.0], scale: 3.25, shadowR: 1.05 },// Upstream far-north dry bank
  { pos: [-96.0, 0.12, 85.0], scale: 3.2, shadowR: 1.05 },  // Near Wishing Well water puddle
  { pos: [-102.0, 0.12, -48.0], scale: 3.3, shadowR: 1.1 }, // Near Bioluminescent Grove moist soil
]

const BIRD_PERCHES = [
  // 0. Campfire Spawn Clearing Perches (Right around spawn!)
  { pos: [-0.8, 0.74, -3.18], scale: 2.35, phase: 1.2 },    // North timber log bench
  { pos: [3.1, 0.74, 2.6], scale: 2.35, phase: 4.1 },      // Southeast timber log bench

  // 1. The Sole Footbridge Songbird (Only ONE on the bridge!)
  { pos: [30.0, 1.62, -26.5], scale: 2.75, phase: 3.4 },

  // 2. North & Northwest Wilderness (Far off the paths)
  { pos: [-68.0, 1.10, -104.0], scale: 2.8, phase: 1.1 },   // Northwest Deep Woods granite boulder
  { pos: [-24.0, 1.45, -124.0], scale: 2.85, phase: 4.3 },  // North Mountain Rim high rock outcrop (river-safe)
  { pos: [-106.0, 1.25, -84.0], scale: 2.7, phase: 2.6 },   // Northwest Far Rim lone boulder
  { pos: [-36.0, 1.05, -70.0], scale: 2.75, phase: 5.4 },   // North open meadow wildflower stone
  { pos: [12.0, 1.20, -135.0], scale: 2.8, phase: 0.7 },    // Far northern ridge boulder

  // 3. Projects Sanctuary Wilderness (Scattered on outer ruins)
  { pos: [24.0, 1.75, -94.0], scale: 2.8, phase: 0.8 },     // Mossy rune pillar
  { pos: [46.0, 1.15, -88.0], scale: 2.7, phase: 2.3 },     // Wild meadow stone east of monolith
  { pos: [38.0, 1.35, -108.0], scale: 2.75, phase: 3.9 },   // Granite monolith backdrop boulder

  // 4. Northeast & Far East Wilderness (Far off the paths)
  { pos: [66.0, 1.20, -92.0], scale: 2.75, phase: 1.8 },    // Northeast Hills wild boulder
  { pos: [96.0, 1.30, -102.0], scale: 2.85, phase: 4.6 },   // North-Northeast Far Woods rock
  { pos: [122.0, 1.15, -58.0], scale: 2.75, phase: 3.2 },   // Far East Waterside Forest stone
  { pos: [70.0, 0.95, -60.0], scale: 2.7, phase: 0.5 },     // Northeast riverside wild meadow rock
  { pos: [108.0, 1.05, -12.0], scale: 2.75, phase: 2.1 },   // Far-east upland meadow stone (river-safe)

  // 5. Far West Wilderness & Bioluminescent Grove (Far off the paths)
  { pos: [-128.0, 1.15, 14.0], scale: 2.8, phase: 4.8 },    // Far West Meadow Rim rocky shelf
  { pos: [-110.0, 1.20, 50.0], scale: 2.75, phase: 1.4 },   // West Hills sentinel boulder
  { pos: [-104.0, 2.35, -40.0], scale: 2.85, phase: 3.5 },  // High atop giant turquoise mushroom cap
  { pos: [-118.0, 1.45, -26.0], scale: 2.75, phase: 0.2 },  // Glowing spore shelf deep in grove
  { pos: [-86.0, 1.10, -72.0], scale: 2.75, phase: 5.0 },   // Lone birch copse boulder

  // 6. Southwest Wilderness (Far off the paths)
  { pos: [-88.0, 1.15, 112.0], scale: 2.8, phase: 2.7 },    // Southwest Far Woods granite stone
  { pos: [-48.0, 1.20, 122.0], scale: 2.85, phase: 1.6 },   // South Deep Woods mossy boulder
  { pos: [-62.0, 1.05, 46.0], scale: 2.7, phase: 4.1 },     // Southwest Glade wild stone
  { pos: [-94.5, 1.15, 76.0], scale: 2.75, phase: 5.7 },    // Wishing boulder by well

  // 7. Southeast & Far South Wilderness (Far off the paths)
  { pos: [62.0, 1.15, 126.0], scale: 2.8, phase: 3.8 },     // Far South Forest Rim boulder
  { pos: [116.0, 1.20, 72.0], scale: 2.85, phase: 0.9 },    // Southeast Far Ridge alpine rock
  { pos: [86.0, 1.15, 58.0], scale: 2.75, phase: 2.4 },     // East Plateau Grove wild stone
  { pos: [18.0, 1.15, 122.0], scale: 2.8, phase: 4.5 },     // Far South Deep Glade granite outcrop
  { pos: [92.0, 1.45, 94.0], scale: 2.8, phase: 1.3 },      // Timber fence rail at rustic cabin edge
]

const FOX_SPAWNS = [
  // 1. North & Northeast Wilderness (Under trees far off path)
  { pos: [-35.0, 0.05, -67.0], width: 3.0, height: 1.9 },   // North Copse shady roots
  { pos: [14.0, 0.05, -98.0], width: 3.1, height: 1.95 },   // North Plateau Grove conifer
  { pos: [20.0, 0.05, -92.0], width: 3.1, height: 1.95 },   // Under conifer roots near Runic Monolith
  { pos: [38.0, 0.05, -106.0], width: 3.0, height: 1.9 },   // Pine canopy east of monolith
  { pos: [64.0, 0.05, -57.0], width: 2.95, height: 1.85 },  // Northeast Riverside Copse
  { pos: [68.0, 0.05, -90.0], width: 3.05, height: 1.9 },   // Northeast Hills Copse
  { pos: [94.0, 0.05, -100.0], width: 3.1, height: 1.95 },  // North-Northeast Far Woods
  { pos: [-24.0, 0.05, -118.0], width: 3.1, height: 1.95 }, // North Mountain Rim cedar (river-safe)

  // 2. Northwest Wilderness (Under trees far off path)
  { pos: [-68.0, 0.05, -102.0], width: 3.0, height: 1.9 },  // Northwest Deep Woods
  { pos: [-105.0, 0.05, -82.0], width: 3.1, height: 1.95 }, // Northwest Far Rim pine
  { pos: [-85.0, 0.05, -70.0], width: 2.95, height: 1.85 }, // Lone conifer in northwest wilds
  { pos: [-25.0, 0.05, -47.0], width: 3.0, height: 1.9 },   // River Approach Copse oak

  // 3. West & Southwest Wilderness (Under trees far off path)
  { pos: [-100.0, 0.05, -42.0], width: 3.1, height: 1.95 }, // Under giant bioluminescent mushrooms
  { pos: [-114.0, 0.05, -30.0], width: 3.0, height: 1.9 },  // Deep willow roots in mushroom grove
  { pos: [-125.0, 0.05, 16.0], width: 3.05, height: 1.9 },  // Far West Meadow Rim oak
  { pos: [-82.0, 0.05, -17.0], width: 2.95, height: 1.85 }, // Far West Copse near Blog
  { pos: [-58.0, 0.05, 40.0], width: 3.0, height: 1.9 },    // Southwest Glade birch
  { pos: [-85.0, 0.05, 106.0], width: 3.1, height: 1.95 },  // Southwest Far Woods pine
  { pos: [-92.0, 0.05, 86.0], width: 3.05, height: 1.9 },   // Under weeping willow canopy near stone well
  { pos: [-108.0, 0.05, 74.0], width: 2.95, height: 1.85 }, // Between mossy rock and fern roots

  // 4. South & Southeast Wilderness (Under trees far off path)
  { pos: [-45.0, 0.05, 116.0], width: 3.1, height: 1.95 },  // South Deep Woods oak
  { pos: [-18.0, 0.05, 66.0], width: 2.95, height: 1.85 },  // South-Central Meadow tree
  { pos: [15.0, 0.05, 116.0], width: 3.1, height: 1.95 },   // Far South Deep Glade conifer
  { pos: [58.0, 0.05, 120.0], width: 3.1, height: 1.95 },   // Far South Forest Rim pine
  { pos: [48.0, 0.05, 46.0], width: 2.95, height: 1.85 },   // Southeast Meadow tree
  { pos: [82.0, 0.05, 60.0], width: 3.05, height: 1.9 },    // East Plateau Grove conifer
  { pos: [78.0, 0.05, 82.0], width: 3.0, height: 1.9 },     // Under pine canopy near timber fence
  { pos: [96.0, 0.05, 86.0], width: 3.1, height: 1.95 },   // Behind firewood shelter under pine roots
  { pos: [112.0, 0.05, 66.0], width: 3.05, height: 1.9 },   // Southeast Far Ridge cedar
  { pos: [118.0, 0.05, -57.0], width: 3.0, height: 1.9 },   // Far East Waterside Forest oak
  { pos: [98.0, 0.05, -10.0], width: 2.95, height: 1.85 },  // South River Copse willow (river-safe)
]

export const AnimalSpawnSystem = () => {
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  // ──────────────────────────────────────────────
  // 1. Texture Loading (Cache-busted v=11)
  // ──────────────────────────────────────────────
  const fishTextures = useMemo(() => [0, 1, 2].map((i) => {
    const t = loader.load(`/assets/fauna/fish_${i}.png?v=11`)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }), [loader])

  const frogTextures = useMemo(() => [0, 1, 2, 3].map((i) => {
    const t = loader.load(`/assets/fauna/frog_${i}.png?v=14`)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }), [loader])

  // Wayfinder-style songbird: 0: perch, 1: alert head-tilt, 2: wing-up, 3: wing-down
  const birdTextures = useMemo(() => [0, 1, 2, 3].map((i) => {
    const t = loader.load(`/assets/fauna/parrot_${i}.png?v=13`)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }), [loader])

  // Wayfinder-style curled fox: sleep (closed eye + 'z') and awake (open cartoon eye)
  const foxSleepTex = useMemo(() => {
    const t = loader.load('/assets/fauna/fox_sleep_0.png?v=12')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [loader])

  const foxAwakeTex = useMemo(() => {
    const t = loader.load('/assets/fauna/fox_sit_0.png?v=12')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [loader])

  // Build river spline curve
  const riverCurve = useMemo(() => {
    const pts = RIVER_POINTS.map((p) => new THREE.Vector3(p[0], 0, p[1]))
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
  }, [])

  // ──────────────────────────────────────────────
  // 2. Component Refs & States
  // ──────────────────────────────────────────────
  // Fish
  const fishGrpRefs = useRef([])
  const fishMatRefs = useRef([])
  const fishRippleRefs = useRef([])
  const fishStates = useRef(
    FISH_CONFIGS.map((cfg) => ({
      u: cfg.initialU,
      frame: 0,
      frameTimer: 0,
      rippleTimer: Math.random() * 2.0,
      rippleScale: 0.2,
      rippleAlpha: 0.35,
    }))
  )

  // Frogs
  const frogGrpRefs = useRef([])
  const frogMatRefs = useRef([])
  const frogStates = useRef(
    FROG_SPAWNS.map(() => ({
      frame: 0,
      idleTimer: Math.random() * 3.5,
      actionDuration: 0,
      hopProgress: 0,
      isHopping: false,
      hopCooldown: Math.random() * 2.0,
    }))
  )

  // Birds
  const birdGrpRefs = useRef([])
  const birdMatRefs = useRef([])
  const birdStates = useRef(
    BIRD_PERCHES.map((p) => ({
      frame: 0,
      idleTimer: Math.random() * 3.5,
      actionDuration: 0,
      flutterTimer: 0,
      isFluttering: false,
      cooldown: Math.random() * 2.0,
      phase: p.phase,
    }))
  )

  // Foxes
  const foxMatRefs = useRef([])
  const foxStates = useRef(
    FOX_SPAWNS.map(() => ({
      isAwake: false,
      awakeTimer: 0,
    }))
  )

  // ──────────────────────────────────────────────
  // 3. Main Fauna Update Loop (useFrame)
  // ──────────────────────────────────────────────
  useFrame((_, delta) => {
    const time = performance.now() * 0.001
    const catPos = usePortfolioStore.getState().catCurrentPos
    const px = catPos ? catPos[0] : 0
    const pz = catPos ? catPos[2] : 0

    // ──────────────────────────────────────────────
    // A. River Koi: Swimming head-first downstream
    // ──────────────────────────────────────────────
    FISH_CONFIGS.forEach((cfg, idx) => {
      let st = fishStates.current[idx]
      if (!st) {
        st = {
          u: cfg.initialU,
          frame: 0,
          frameTimer: 0,
          rippleTimer: Math.random() * 2.0,
          rippleScale: 0.2,
          rippleAlpha: 0.35,
        }
        fishStates.current[idx] = st
      }
      const grp = fishGrpRefs.current[idx]
      const mat = fishMatRefs.current[idx]
      const ripple = fishRippleRefs.current[idx]
      if (!grp || !mat) return

      st.u += cfg.speed * delta
      if (st.u >= 0.99) {
        st.u = 0.01
      }

      // Smooth edge fade: fade-in at upstream mountain origin [0.01, 0.06], fade-out at downstream map boundary [0.94, 0.99]
      let fishAlpha = 1.0
      if (st.u < 0.06) {
        fishAlpha = Math.max(0, Math.min(1, (st.u - 0.01) / 0.05))
      } else if (st.u > 0.94) {
        fishAlpha = Math.max(0, Math.min(1, (0.99 - st.u) / 0.05))
      }
      mat.opacity = fishAlpha

      st.frameTimer += delta
      if (st.frameTimer >= 0.16) {
        st.frameTimer = 0
        st.frame = (st.frame + 1) % 3
        mat.map = fishTextures[st.frame]
        mat.needsUpdate = true
      }

      const pt = riverCurve.getPointAt(st.u)
      const tangent = riverCurve.getTangentAt(st.u)
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()

      const weave = Math.sin(time * 2.6 + cfg.phase) * 0.38
      const currentOffset = cfg.lateralOffset + weave

      const posX = pt.x + normal.x * currentOffset
      const posZ = pt.z + normal.z * currentOffset

      grp.position.set(posX, 0.05, posZ)

      // 180° flipped: Head points downstream in the direction of current
      const baseAngle = Math.atan2(tangent.x, tangent.z) + Math.PI
      const steerAngle = Math.cos(time * 2.6 + cfg.phase) * 0.18
      grp.rotation.set(0, baseAngle + steerAngle, 0)

      if (ripple) {
        st.rippleTimer += delta
        if (st.rippleTimer > 2.0) {
          st.rippleTimer = 0
          st.rippleScale = 0.2
          st.rippleAlpha = 0.35
          ripple.position.set(posX - tangent.x * 0.7, 0.04, posZ - tangent.z * 0.7)
        } else {
          st.rippleScale += delta * 0.6
          st.rippleAlpha = Math.max(0, 0.35 * (1.0 - st.rippleTimer / 2.0))
          ripple.scale.set(st.rippleScale, st.rippleScale, 1)
          if (ripple.material) ripple.material.opacity = st.rippleAlpha * fishAlpha
        }
      }
    })

    // ──────────────────────────────────────────────
    // B. Riverbank Frogs: On dry banks with cute croaks
    // ──────────────────────────────────────────────
    FROG_SPAWNS.forEach((spawn, idx) => {
      let st = frogStates.current[idx]
      if (!st) {
        st = {
          frame: 0,
          idleTimer: Math.random() * 3.5,
          actionDuration: 0,
          hopProgress: 0,
          isHopping: false,
          hopCooldown: Math.random() * 2.0,
        }
        frogStates.current[idx] = st
      }
      const grp = frogGrpRefs.current[idx]
      const mat = frogMatRefs.current[idx]
      if (!grp || !mat) return

      st.hopCooldown = Math.max(0, st.hopCooldown - delta)

      // Fast AABB rejection before distance check
      if (catPos && !st.isHopping && st.hopCooldown <= 0) {
        const dx = px - spawn.pos[0]
        if (Math.abs(dx) <= 5.0) {
          const dz = pz - spawn.pos[2]
          if (Math.abs(dz) <= 5.0 && dx * dx + dz * dz < 25.0) {
            st.isHopping = true
            st.hopProgress = 0
            st.frame = 3 // Leaping pose!
            st.hopCooldown = 3.6
            sfx.playFrogCroak()
          }
        }
      }

      if (st.isHopping) {
        st.hopProgress += delta * 2.2
        st.frame = 3 // Mid-air leaping pose
        if (st.hopProgress >= 1.0) {
          st.isHopping = false
          st.hopProgress = 0
          grp.position.y = spawn.pos[1]
          st.frame = 0 // Land back into sitting pose
        } else {
          const jumpArc = Math.sin(st.hopProgress * Math.PI) * 0.85
          grp.position.y = spawn.pos[1] + jumpArc
        }
      } else {
        st.idleTimer += delta
        if (st.actionDuration > 0) {
          st.actionDuration -= delta
          if (st.actionDuration <= 0) st.frame = 0
        } else if (st.idleTimer >= 3.4) {
          st.idleTimer = 0
          const isCroak = Math.random() < 0.65
          st.frame = isCroak ? 1 : 2 // 1: throat puff croak, 2: happy blink
          st.actionDuration = isCroak ? 0.65 : 0.35
        }
      }

      if (mat.map !== frogTextures[st.frame]) {
        mat.map = frogTextures[st.frame]
        mat.needsUpdate = true
      }
    })

    // ──────────────────────────────────────────────
    // C. Wayfinder-Style Songbirds: Perched, flutter on approach
    // ──────────────────────────────────────────────
    BIRD_PERCHES.forEach((spawn, idx) => {
      const grp = birdGrpRefs.current[idx]
      const mat = birdMatRefs.current[idx]
      let st = birdStates.current[idx]
      if (!st) {
        st = {
          frame: 0,
          idleTimer: Math.random() * 3.5,
          actionDuration: 0,
          flutterTimer: 0,
          isFluttering: false,
          cooldown: Math.random() * 2.0,
          phase: spawn.phase || 0,
        }
        birdStates.current[idx] = st
      }
      if (!grp || !mat) return

      st.cooldown = Math.max(0, st.cooldown - delta)

      // Fast AABB rejection before distance check
      if (catPos && !st.isFluttering && st.cooldown <= 0) {
        const dx = px - spawn.pos[0]
        if (Math.abs(dx) <= 5.5) {
          const dz = pz - spawn.pos[2]
          if (Math.abs(dz) <= 5.5 && dx * dx + dz * dz < 30.25) {
            st.isFluttering = true
            st.flutterTimer = 1.3
            st.cooldown = 4.2
            sfx.playBirdChirp()
          }
        }
      }

      // Gentle vertical breathing bob
      const bob = Math.sin(time * 2.2 + st.phase) * 0.02
      const flutterLift = st.isFluttering ? Math.sin(((1.3 - st.flutterTimer) / 1.3) * Math.PI) * 0.42 : 0
      grp.position.y = spawn.pos[1] + spawn.scale * 0.34 + bob + flutterLift

      if (st.isFluttering) {
        st.flutterTimer -= delta
        if (st.flutterTimer <= 0) {
          st.isFluttering = false
          st.frame = 0
        } else {
          // Rapid wing flap between frame 2 (wings up) and frame 3 (wings down)
          const fPhase = Math.floor((time * 10.0) % 2)
          st.frame = fPhase === 0 ? 2 : 3
        }
      } else {
        // Idle: calm perch (0) with occasional cute head tilt (1)
        st.idleTimer += delta
        if (st.actionDuration > 0) {
          st.actionDuration -= delta
          if (st.actionDuration <= 0) st.frame = 0
        } else if (st.idleTimer >= 3.8) {
          st.idleTimer = 0
          st.frame = 1
          st.actionDuration = 0.75
        }
      }

      if (mat.map !== birdTextures[st.frame]) {
        mat.map = birdTextures[st.frame]
        mat.needsUpdate = true
      }
    })

    // ──────────────────────────────────────────────
    // D. Wayfinder-Style Curled Foxes: Sleep & Eye Open on Approach
    // ──────────────────────────────────────────────
    FOX_SPAWNS.forEach((spawn, idx) => {
      let st = foxStates.current[idx]
      if (!st) {
        st = { isAwake: false, awakeTimer: 0 }
        foxStates.current[idx] = st
      }
      const mat = foxMatRefs.current[idx]
      if (!mat) return

      const dx = px - spawn.pos[0]
      const dz = pz - spawn.pos[2]
      // Fast AABB rejection before hypotenuse check
      const isNear = Math.abs(dx) <= 7.2 && Math.abs(dz) <= 7.2 && (dx * dx + dz * dz < 52.0)

      // If cat is near (< 7.2 units), fox wakes up and opens its eye to watch the player!
      if (isNear) {
        st.isAwake = true
        st.awakeTimer = 2.0 // Keep awake for 2.0s after cat moves away
      } else {
        if (st.awakeTimer > 0) {
          st.awakeTimer -= delta
        } else {
          st.isAwake = false
        }
      }

      const targetTex = st.isAwake ? foxAwakeTex : foxSleepTex
      if (mat.map !== targetTex) {
        mat.map = targetTex
        mat.needsUpdate = true
      }
    })
  })

  return (
    <group name="AnimalSpawnSystem">
      {/* 1. River Koi (Downstream with current) */}
      {FISH_CONFIGS.map((cfg, idx) => (
        <React.Fragment key={`fish-${idx}`}>
          <mesh
            ref={(el) => (fishRippleRefs.current[idx] = el)}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03, 0]}
          >
            <ringGeometry args={[0.3, 0.5, 18]} />
            <meshBasicMaterial
              color="#e0f7fa"
              transparent
              opacity={0.3}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          <group ref={(el) => (fishGrpRefs.current[idx] = el)}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
              <planeGeometry args={[1.1 * cfg.scale, 2.2 * cfg.scale]} />
              <meshBasicMaterial
                ref={(el) => (fishMatRefs.current[idx] = el)}
                map={fishTextures[0]}
                transparent
                alphaTest={0.001}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* 2. Riverbank Frogs (On dry riverbanks) */}
      {FROG_SPAWNS.map((spawn, idx) => (
        <group
          key={`frog-${idx}`}
          ref={(el) => (frogGrpRefs.current[idx] = el)}
          position={spawn.pos}
        >
          {/* Ground Contact Shadow */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, 0]}
            renderOrder={9}
          >
            <circleGeometry args={[spawn.shadowR, 18]} />
            <meshBasicMaterial
              color="#0a1a0d"
              transparent
              opacity={0.34}
              depthWrite={false}
            />
          </mesh>

          <Billboard
            follow
            lockX={false}
            lockY={false}
            lockZ={false}
            position={[0, spawn.scale * 0.34, 0]}
          >
            <mesh scale={[spawn.scale, spawn.scale, 1]} renderOrder={15}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                ref={(el) => (frogMatRefs.current[idx] = el)}
                map={frogTextures[0]}
                transparent
                alphaTest={0.06}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Billboard>
        </group>
      ))}

      {/* 3. Wayfinder-Style Songbirds (Perched on Rails & Benches) */}
      {BIRD_PERCHES.map((spawn, idx) => (
        <Billboard
          key={`bird-${idx}`}
          ref={(el) => (birdGrpRefs.current[idx] = el)}
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[spawn.pos[0], spawn.pos[1] + spawn.scale * 0.34, spawn.pos[2]]}
        >
          <mesh scale={[spawn.scale, spawn.scale, 1]} renderOrder={16}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              ref={(el) => (birdMatRefs.current[idx] = el)}
              map={birdTextures[0]}
              transparent
              alphaTest={0.06}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>
      ))}

      {/* 4. Wayfinder-Style Curled Foxes (Sleeping with 'z', eye opens when approached) */}
      {FOX_SPAWNS.map((spawn, idx) => (
        <group key={`fox-${idx}`} position={spawn.pos}>
          {/* Soft Ground Contact Shadow (matches flat curled baseline) */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, 0]}
            scale={[spawn.width * 0.48, spawn.height * 0.42, 1]}
            renderOrder={9}
          >
            <circleGeometry args={[1.05, 24]} />
            <meshBasicMaterial
              color="#0a1a0d"
              transparent
              opacity={0.38}
              depthWrite={false}
            />
          </mesh>

          {/* 2D Billboard Curled Fox */}
          <Billboard
            follow
            lockX={false}
            lockY={false}
            lockZ={false}
            position={[0, spawn.height * 0.48, 0]}
          >
            <mesh renderOrder={15}>
              <planeGeometry args={[spawn.width, spawn.height]} />
              <meshBasicMaterial
                ref={(el) => (foxMatRefs.current[idx] = el)}
                map={foxSleepTex}
                transparent
                alphaTest={0.06}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </Billboard>
        </group>
      ))}
    </group>
  )
}
