import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { TRAILS, CLEARINGS, BRIDGE_CONFIG } from './mapConfig'

// -------------------------------------------------------------
// High-Resolution Procedural Autumn Leaf Textures
// -------------------------------------------------------------
function createInteractiveLeafTextures() {
  const createTexture = (drawFn) => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 256, 256)
    drawFn(ctx)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }

  // 1. Golden Maple Leaf
  const texMaple = createTexture((ctx) => {
    // Soft ambient ground shadow
    ctx.fillStyle = 'rgba(24, 28, 18, 0.40)'
    ctx.beginPath()
    ctx.ellipse(128, 142, 68, 38, 0, 0, Math.PI * 2)
    ctx.fill()

    // Vibrant Golden Maple Gradient
    const grad = ctx.createLinearGradient(128, 30, 128, 205)
    grad.addColorStop(0, '#fef08a')  // Sunny gold tip
    grad.addColorStop(0.25, '#fbbf24')
    grad.addColorStop(0.65, '#f59e0b') // Rich golden amber
    grad.addColorStop(1, '#d97706')    // Deep autumnal amber
    ctx.fillStyle = grad

    ctx.beginPath()
    ctx.moveTo(128, 30)
    // Top-right lobe
    ctx.quadraticCurveTo(155, 52, 178, 62)
    ctx.quadraticCurveTo(168, 80, 192, 102)
    ctx.quadraticCurveTo(174, 118, 186, 145)
    // Lower right to stem base
    ctx.quadraticCurveTo(155, 162, 138, 188)
    ctx.quadraticCurveTo(128, 178, 118, 188)
    // Lower left to stem base
    ctx.quadraticCurveTo(101, 162, 70, 145)
    ctx.quadraticCurveTo(82, 118, 64, 102)
    ctx.quadraticCurveTo(88, 80, 78, 62)
    ctx.quadraticCurveTo(101, 52, 128, 30)
    ctx.closePath()
    ctx.fill()

    // Fine gouache leaf edge accent
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.75)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Leaf Veins
    ctx.strokeStyle = '#b45309'
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    // Main central vein
    ctx.moveTo(128, 188)
    ctx.lineTo(128, 48)
    // Side veins
    ctx.moveTo(128, 145)
    ctx.lineTo(172, 108)
    ctx.moveTo(128, 145)
    ctx.lineTo(84, 108)
    ctx.moveTo(128, 108)
    ctx.lineTo(162, 75)
    ctx.moveTo(128, 108)
    ctx.lineTo(94, 75)
    ctx.stroke()

    // Curved stem
    ctx.strokeStyle = '#92400e'
    ctx.lineWidth = 4.5
    ctx.beginPath()
    ctx.moveTo(128, 188)
    ctx.quadraticCurveTo(126, 212, 132, 226)
    ctx.stroke()
  })

  // 2. Fiery Crimson & Amber Autumn Leaf
  const texCrimson = createTexture((ctx) => {
    // Soft ground shadow
    ctx.fillStyle = 'rgba(28, 22, 18, 0.42)'
    ctx.beginPath()
    ctx.ellipse(128, 142, 65, 36, 0, 0, Math.PI * 2)
    ctx.fill()

    // Fiery orange/crimson gradient
    const grad = ctx.createLinearGradient(128, 30, 128, 205)
    grad.addColorStop(0, '#ea580c')
    grad.addColorStop(0.35, '#dc2626') // Crimson blush
    grad.addColorStop(0.75, '#f59e0b') // Warm gold
    grad.addColorStop(1, '#b45309')
    ctx.fillStyle = grad

    ctx.beginPath()
    ctx.moveTo(128, 32)
    ctx.quadraticCurveTo(160, 56, 182, 85)
    ctx.quadraticCurveTo(196, 120, 172, 155)
    ctx.quadraticCurveTo(145, 178, 134, 192)
    ctx.quadraticCurveTo(128, 182, 122, 192)
    ctx.quadraticCurveTo(111, 178, 84, 155)
    ctx.quadraticCurveTo(60, 120, 74, 85)
    ctx.quadraticCurveTo(96, 56, 128, 32)
    ctx.closePath()
    ctx.fill()

    // Crimson accent outline
    ctx.strokeStyle = 'rgba(153, 27, 27, 0.8)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Veins
    ctx.strokeStyle = '#7f1d1d'
    ctx.lineWidth = 3.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(128, 192)
    ctx.lineTo(128, 48)
    ctx.moveTo(128, 150)
    ctx.lineTo(168, 122)
    ctx.moveTo(128, 150)
    ctx.lineTo(88, 122)
    ctx.moveTo(128, 110)
    ctx.lineTo(160, 88)
    ctx.moveTo(128, 110)
    ctx.lineTo(96, 88)
    ctx.stroke()

    // Stem
    ctx.strokeStyle = '#78350f'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(128, 192)
    ctx.quadraticCurveTo(130, 214, 125, 226)
    ctx.stroke()
  })

  // 3. Sunny Ginkgo Fan Leaf
  const texGinkgo = createTexture((ctx) => {
    // Soft ground shadow
    ctx.fillStyle = 'rgba(24, 28, 16, 0.38)'
    ctx.beginPath()
    ctx.ellipse(128, 142, 70, 36, 0, 0, Math.PI * 2)
    ctx.fill()

    // Radiant sunny fan gradient
    const grad = ctx.createLinearGradient(128, 40, 128, 190)
    grad.addColorStop(0, '#fef08a')
    grad.addColorStop(0.45, '#facc15')
    grad.addColorStop(1, '#d97706')
    ctx.fillStyle = grad

    ctx.beginPath()
    ctx.moveTo(128, 185)
    // Fan outward right
    ctx.quadraticCurveTo(175, 165, 205, 115)
    ctx.quadraticCurveTo(200, 65, 150, 48)
    // Scalloped center notch
    ctx.quadraticCurveTo(128, 62, 106, 48)
    // Fan downward left
    ctx.quadraticCurveTo(56, 65, 51, 115)
    ctx.quadraticCurveTo(81, 165, 128, 185)
    ctx.closePath()
    ctx.fill()

    // Outline
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.7)'
    ctx.lineWidth = 2.8
    ctx.stroke()

    // Fan-like radiating veins
    ctx.strokeStyle = '#d97706'
    ctx.lineWidth = 1.8
    ctx.lineCap = 'round'
    ctx.beginPath()
    for (let a = -0.55; a <= 0.55; a += 0.18) {
      ctx.moveTo(128, 185)
      const ex = 128 + Math.sin(a) * 120
      const ey = 185 - Math.cos(a) * 125
      ctx.lineTo(ex, ey)
    }
    ctx.stroke()

    // Long slender ginkgo petiole
    ctx.strokeStyle = '#92400e'
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(128, 185)
    ctx.quadraticCurveTo(122, 210, 120, 230)
    ctx.stroke()
  })

  return [texMaple, texCrimson, texGinkgo]
}

// -------------------------------------------------------------
// Soft, gentle organic leaf rustle sound effect via Web Audio API
// -------------------------------------------------------------
let audioCtx = null
let lastRustleTime = 0

function playLeafRustleSound() {
  try {
    const now = performance.now()
    if (now - lastRustleTime < 110) return // Throttle
    lastRustleTime = now

    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    if (!audioCtx) audioCtx = new AudioContext()
    if (audioCtx.state === 'suspended') audioCtx.resume()

    const bufferSize = Math.floor(audioCtx.sampleRate * 0.16) // 160ms soft rustle
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      // Soft organic noise decay
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.38))
    }

    const noise = audioCtx.createBufferSource()
    noise.buffer = buffer

    // Warm, gentle low-pass filter
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 560 + Math.random() * 140
    filter.Q.value = 0.85

    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(0.045, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0004, audioCtx.currentTime + 0.16)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(audioCtx.destination)

    noise.start()
  } catch (e) {
    // Graceful fallback
  }
}

// -------------------------------------------------------------
// Single Interactive Leaf Mesh (High Visibility & Kinetic Flutter)
// -------------------------------------------------------------
const SingleLeaf = ({ initialPos, initialRot, initialScale, texture }) => {
  const meshRef = useRef()

  // Physics state
  const state = useRef({
    currentPos: new THREE.Vector3(...initialPos),
    baseY: initialPos[1],
    vel: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Euler(...initialRot),
    rotVel: new THREE.Vector3(0, 0, 0),
    isAirborne: false,
    flutterSeed: Math.random() * 100,
    hasInteracted: false,
  })

  // Trigger flutter kick when cat brushes near
  const kickLeaf = (intensity = 1.0) => {
    state.current.isAirborne = true
    state.current.vel.y = (2.2 + Math.random() * 1.4) * intensity // Floats high enough to clearly enjoy
    state.current.vel.x = (Math.random() - 0.5) * 2.2 * intensity
    state.current.vel.z = (Math.random() - 0.5) * 2.2 * intensity
    state.current.rotVel.x = (Math.random() - 0.5) * 7.5 * intensity
    state.current.rotVel.y = (Math.random() - 0.5) * 8.0 * intensity
    state.current.rotVel.z = (Math.random() - 0.5) * 7.5 * intensity
    playLeafRustleSound()
  }

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const st = state.current

    // 1. Resting state: enter/exit hysteresis check (< 1.75 enter, > 3.0 exit)
    if (!st.isAirborne) {
      const catPos = usePortfolioStore.getState().catCurrentPos
      if (!catPos) return
      const dx = catPos[0] - st.currentPos.x
      const dz = catPos[2] - st.currentPos.z
      const distSq = dx * dx + dz * dz

      if (distSq < 3.06) {
        if (!st.hasInteracted) {
          st.hasInteracted = true
          kickLeaf(1.0)
        }
      } else if (distSq > 9.0) {
        // Cat walked away: reset so leaf can be kicked again on return
        st.hasInteracted = false
      }
      return // Resting leaves do not dirty matrixWorld or run physics!
    }

    // 2. Airborne physics simulation
    const t = clock.getElapsedTime()
    st.vel.y -= 4.5 * delta // gentle floating gravity
    st.vel.x *= 0.95 // air resistance
    st.vel.z *= 0.95

    // Sinusoidal leaf flutter in autumn breeze
    const flutterX = Math.sin(t * 11 + st.flutterSeed) * 0.85 * delta
    const flutterZ = Math.cos(t * 9 + st.flutterSeed) * 0.65 * delta
    st.vel.x += flutterX
    st.vel.z += flutterZ

    st.currentPos.addScaledVector(st.vel, delta)

    // Dynamic 3D spin
    st.rot.x += st.rotVel.x * delta
    st.rot.y += st.rotVel.y * delta
    st.rot.z += st.rotVel.z * delta

    // Ground collision & settling
    if (st.currentPos.y <= st.baseY) {
      st.currentPos.y = st.baseY
      st.vel.set(0, 0, 0)
      st.rotVel.set(0, 0, 0)
      // Lay flat on ground with newly acquired rotation
      st.rot.x = -Math.PI / 2
      st.rot.y = 0
      st.isAirborne = false
    }

    meshRef.current.position.copy(st.currentPos)
    meshRef.current.rotation.copy(st.rot)
  })

  return (
    <mesh
      ref={meshRef}
      position={initialPos}
      rotation={initialRot}
      scale={[initialScale, initialScale, initialScale]}
    >
      {/* Scaled up from 0.42 to 1.38 so leaves are vividly noticeable from isometric view */}
      <planeGeometry args={[1.38, 1.38]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.04}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// -------------------------------------------------------------
// Interactive Autumn Leaves Layer
// -------------------------------------------------------------
export const InteractiveLeaves = () => {
  const textures = useMemo(() => createInteractiveLeafTextures(), [])

  // Generate dynamic golden leaves distributed along campfire glade & trails
  const leaves = useMemo(() => {
    const list = []

    const addLeaf = (x, z, groundElevation = 0.055) => {
      // Avoid placing right on top of wooden bridge deck
      const bridgeDx = x - BRIDGE_CONFIG.position[0]
      const bridgeDz = z - BRIDGE_CONFIG.position[2]
      if (bridgeDx * bridgeDx + bridgeDz * bridgeDz < 36.0) {
        return // Keep bridge walkway clear; leaves gather on landings
      }

      const textureIndex = Math.floor(Math.random() * textures.length)
      list.push({
        initialPos: [x, groundElevation, z],
        initialRot: [-Math.PI / 2, 0, Math.random() * Math.PI * 2],
        initialScale: 0.95 + Math.random() * 0.40, // 0.95 - 1.35x
        textureIndex,
      })
    }

    // 1. Central Campfire Clearing Ring (Immediate joy around spawn!)
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + (Math.random() * 0.3 - 0.15)
      const r = 2.6 + Math.random() * 6.8
      addLeaf(Math.cos(angle) * r, Math.sin(angle) * r)
    }

    // 2. Natural Autumn Trails Leading to Landmarks (Winding Waypoints)
    const trailPaths = [
      TRAILS.toStoneTablet,
      TRAILS.toMushroomGrove,
      TRAILS.toWishingWell,
      TRAILS.toRusticHut,
    ]

    trailPaths.forEach((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i]
        const p2 = path[i + 1]
        const count = 1
        for (let k = 0; k < count; k++) {
          const t = (k + 0.5 + Math.random() * 0.25) / count
          // Scatter with organic lateral spread
          const spread = Math.random() * 3.2 - 1.6
          const x = p1[0] + (p2[0] - p1[0]) * t + spread
          const z = p1[1] + (p2[1] - p1[1]) * t + spread
          addLeaf(x, z)
        }
      }
    })

    // 3. Landmark Glades (Drifts around sanctuaries)
    const landmarks = [
      CLEARINGS.stoneTablet,
      CLEARINGS.mushroomGrove,
      CLEARINGS.wishingWell,
      CLEARINGS.rusticHut,
    ]

    landmarks.forEach((cl) => {
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2
        const r = 2.4 + Math.random() * (cl.radius * 0.48)
        addLeaf(cl.x + Math.cos(angle) * r, cl.z + Math.sin(angle) * r)
      }
    })

    return list
  }, [textures])

  return (
    <group>
      {leaves.map((leaf, idx) => (
        <SingleLeaf
          key={idx}
          initialPos={leaf.initialPos}
          initialRot={leaf.initialRot}
          initialScale={leaf.initialScale}
          texture={textures[leaf.textureIndex]}
        />
      ))}
    </group>
  )
}