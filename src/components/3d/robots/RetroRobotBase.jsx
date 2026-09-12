import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

// -------------------------------------------------------------
// Dynamic Procedural Canvas Face Texture (Expressive LED Eyes & Grill)
// -------------------------------------------------------------
function createRetroFaceTexture(eyeColor = '#4ade80', pupilColor = '#14532d') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  const draw = (blinkProgress = 0) => {
    ctx.fillStyle = '#1c2226' // Dark CRT monitor glass
    ctx.fillRect(0, 0, 256, 256)

    // Subtle CRT scanline effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    for (let y = 0; y < 256; y += 8) {
      ctx.fillRect(0, y, 256, 4)
    }

    // Glowing Eyes
    const eyeHeight = Math.max(2, 42 * (1.0 - blinkProgress))
    ctx.fillStyle = eyeColor
    ctx.shadowColor = eyeColor
    ctx.shadowBlur = 12

    // Left Eye
    ctx.beginPath()
    ctx.ellipse(82, 90, 24, eyeHeight, 0, 0, Math.PI * 2)
    ctx.fill()

    // Right Eye
    ctx.beginPath()
    ctx.ellipse(174, 90, 24, eyeHeight, 0, 0, Math.PI * 2)
    ctx.fill()

    // Pupils (if not blinking)
    if (blinkProgress < 0.7) {
      ctx.fillStyle = pupilColor
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(82, 90, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(174, 90, 10, 0, Math.PI * 2)
      ctx.fill()
    }

    // Cute Speaker Grill Mouth (Vertical Slats)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#fde047' // Retro pale-gold / yellow teeth grill
    ctx.beginPath()
    ctx.roundRect(68, 172, 120, 26, 6)
    ctx.fill()

    // Grill vertical separators
    ctx.strokeStyle = '#1c2226'
    ctx.lineWidth = 4
    ctx.beginPath()
    for (let x = 86; x < 185; x += 18) {
      ctx.moveTo(x, 172)
      ctx.lineTo(x, 198)
    }
    ctx.stroke()
  }

  draw(0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return { texture, canvas, draw }
}

// -------------------------------------------------------------
// Dynamic Procedural Chest Panel Texture (Meter Needle & Indicator Bars)
// -------------------------------------------------------------
function createRetroChestTexture(accentColor = '#f97316') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  const draw = (needleAngle = 0, lightCycle = 0) => {
    ctx.fillStyle = '#d5dfdf'
    ctx.fillRect(0, 0, 256, 256)

    // Dark inset bezel
    ctx.fillStyle = '#262f33'
    ctx.beginPath()
    ctx.roundRect(14, 14, 228, 228, 12)
    ctx.fill()

    // 1. Analog Circular Gauge
    ctx.fillStyle = '#f1f5f9'
    ctx.beginPath()
    ctx.arc(75, 80, 42, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = accentColor
    ctx.lineWidth = 5
    ctx.stroke()

    // Needle
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(75, 80)
    const nx = 75 + Math.cos(needleAngle) * 32
    const ny = 80 + Math.sin(needleAngle) * 32
    ctx.lineTo(nx, ny)
    ctx.stroke()
    ctx.fillStyle = '#1e293b'
    ctx.beginPath()
    ctx.arc(75, 80, 6, 0, Math.PI * 2)
    ctx.fill()

    // 2. Horizontal Status Indicator Bar (Segmented LED)
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.roundRect(138, 48, 88, 64, 6)
    ctx.fill()
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 2
    ctx.stroke()

    // 3 Segmented Light Bars
    const colors = ['#ef4444', '#f59e0b', '#22c55e']
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = (lightCycle % 3 === i) ? '#f8fafc' : colors[i]
      ctx.beginPath()
      ctx.roundRect(148, 58 + i * 18, 68, 12, 3)
      ctx.fill()
    }

    // 3. Lower Push-Button Row (6 Pills)
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#fde047' : accentColor
      ctx.beginPath()
      ctx.roundRect(32 + i * 34, 175, 24, 38, 5)
      ctx.fill()
      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  draw(-0.4, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return { texture, canvas, draw }
}

// -------------------------------------------------------------
// Retro Robot Base 3D Mesh
// -------------------------------------------------------------
export const RetroRobotBase = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  enamelColor = '#b2d1cb',      // Vintage sage mint/teal body
  accentColor = '#f97316',      // Warm coral/orange ear bolts & joints
  eyeColor = '#4ade80',         // Glowing green LED eyes
  pupilColor = '#14532d',
  headShape = 'box',            // 'box' | 'dome' | 'wide'
  antennaType = 'twin',         // 'twin' | 'single' | 'curved'
  districtKey = 'projects',
  onClick,
  onHover,
  children,                     // Unique accessory props (typewriter, letter, PCB, etc.)
}) => {
  const groupRef = useRef()
  const headRef = useRef()
  const antennaRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Canvas textures
  const face = useMemo(() => createRetroFaceTexture(eyeColor, pupilColor), [eyeColor, pupilColor])
  const chest = useMemo(() => createRetroChestTexture(accentColor), [accentColor])

  // Materials
  const materials = useMemo(() => {
    return {
      enamel: new THREE.MeshStandardMaterial({
        color: enamelColor,
        roughness: 0.35,
        metalness: 0.15,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.30,
        metalness: 0.20,
      }),
      conduit: new THREE.MeshStandardMaterial({
        color: '#34383c', // Dark charcoal rubber flex conduit
        roughness: 0.65,
        metalness: 0.10,
      }),
      metal: new THREE.MeshStandardMaterial({
        color: '#94a3b8', // Silver chrome / aluminum
        roughness: 0.25,
        metalness: 0.60,
      }),
      visor: new THREE.MeshBasicMaterial({
        map: face.texture,
      }),
      chestPanel: new THREE.MeshBasicMaterial({
        map: chest.texture,
      }),
      shadow: new THREE.MeshBasicMaterial({
        color: '#1a1f16',
        transparent: true,
        opacity: 0.38,
      }),
    }
  }, [enamelColor, accentColor, face.texture, chest.texture])

  // Animation and interaction state
  const blinkTimerRef = useRef(Math.random() * 3.0)
  const isBlinkingRef = useRef(false)
  const blinkProgressRef = useRef(0)
  const needleTimerRef = useRef(0)

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // 1. Idle breathing torso bob
    const bob = Math.sin(t * 2.8) * 0.035
    groupRef.current.position.y = position[1] + bob

    // 2. Antenna wobble
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(t * 4.2) * 0.08
    }

    // 3. Eye Blinking Cycle
    blinkTimerRef.current -= delta
    if (blinkTimerRef.current <= 0) {
      isBlinkingRef.current = true
      blinkTimerRef.current = 2.8 + Math.random() * 3.5 // Next blink in 3-6s
      blinkProgressRef.current = 0
    }

    if (isBlinkingRef.current) {
      blinkProgressRef.current += delta * 6.0
      const prog = Math.sin(blinkProgressRef.current * Math.PI)
      face.draw(Math.max(0, prog))
      face.texture.needsUpdate = true
      if (blinkProgressRef.current >= 1.0) {
        isBlinkingRef.current = false
        face.draw(0)
        face.texture.needsUpdate = true
      }
    }

    // 4. Chest meter needle twitch & light sequencing
    needleTimerRef.current += delta
    if (needleTimerRef.current > 0.35) {
      needleTimerRef.current = 0
      const needleAngle = -0.5 + Math.random() * 1.0
      const cycle = Math.floor(t * 2.5)
      chest.draw(needleAngle, cycle)
      chest.texture.needsUpdate = true
    }

    // 5. Cat Proximity Tracking & Head Swivel
    const catPos = usePortfolioStore.getState().catCurrentPos
    if (catPos && headRef.current) {
      const dx = catPos[0] - position[0]
      const dz = catPos[2] - position[2]
      const distSq = dx * dx + dz * dz

      // Head smoothly turns towards cat within 9 units
      if (distSq < 81.0) {
        const targetAngle = Math.atan2(dx, dz) - rotation[1]
        // Clamp head swivel to natural range (-75° to +75°)
        const clampedAngle = THREE.MathUtils.clamp(targetAngle, -1.3, 1.3)
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, clampedAngle, 0.08)
      } else {
        // Return to center
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, 0.04)
      }

      // Inquisitive 'hmm' sound when cat gets close (within 4.2 units)
      if (distSq < 17.6) {
        sfx.playRobotHmm()
      }
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (onClick) onClick()
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
        if (onHover) onHover(true)
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
        if (onHover) onHover(false)
      }}
    >
      {/* 0. Soft Ambient Ground Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.shadow}>
        <circleGeometry args={[0.92, 24]} />
      </mesh>

      {/* 1. Chunky Stomper Feet & Boots */}
      {/* Left Boot */}
      <group position={[-0.32, 0.16, 0.04]}>
        <mesh material={materials.enamel}>
          <boxGeometry args={[0.34, 0.28, 0.52]} />
        </mesh>
        {/* Side Wheel Rivet Hub */}
        <mesh position={[-0.18, 0, -0.05]} rotation={[0, 0, Math.PI / 2]} material={materials.accent}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
        </mesh>
      </group>

      {/* Right Boot */}
      <group position={[0.32, 0.16, 0.04]}>
        <mesh material={materials.enamel}>
          <boxGeometry args={[0.34, 0.28, 0.52]} />
        </mesh>
        {/* Side Wheel Rivet Hub */}
        <mesh position={[0.18, 0, -0.05]} rotation={[0, 0, Math.PI / 2]} material={materials.accent}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
        </mesh>
      </group>

      {/* 2. Ribbed Conduit Upper Legs (Accordion Rubber) */}
      {[-0.32, 0.32].map((xOffset, idx) => (
        <group key={`leg-${idx}`} position={[xOffset, 0.44, 0]}>
          {[0, 0.08, 0.16].map((yOff, rIdx) => (
            <mesh key={`ring-${rIdx}`} position={[0, yOff, 0]} material={materials.conduit}>
              <cylinderGeometry args={[0.11, 0.11, 0.06, 14]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 3. Pelvis / Hip Mount */}
      <mesh position={[0, 0.68, 0]} material={materials.accent}>
        <boxGeometry args={[0.82, 0.16, 0.56]} />
      </mesh>

      {/* 4. Boxy Torso with Chest Gauge Panel */}
      <group position={[0, 1.15, 0]}>
        {/* Main Enamel Torso Block */}
        <mesh material={materials.enamel}>
          <boxGeometry args={[0.96, 0.78, 0.68]} />
        </mesh>

        {/* Front Inset Bezel with Chest Panel Canvas */}
        <mesh position={[0, 0.02, 0.342]} material={materials.chestPanel}>
          <planeGeometry args={[0.76, 0.62]} />
        </mesh>

        {/* Corner Rivets */}
        {[
          [-0.42, 0.32],
          [0.42, 0.32],
          [-0.42, -0.32],
          [0.42, -0.32],
        ].map(([rx, ry], rIdx) => (
          <mesh key={`rivet-${rIdx}`} position={[rx, ry, 0.343]} material={materials.metal}>
            <sphereGeometry args={[0.032, 8, 8]} />
          </mesh>
        ))}

        {/* Back Exhaust Vent / Battery Pack */}
        <mesh position={[0, 0.05, -0.36]} material={materials.conduit}>
          <boxGeometry args={[0.55, 0.45, 0.12]} />
        </mesh>
      </group>

      {/* 5. Ribbed Conduit Neck */}
      <group position={[0, 1.62, 0]}>
        <mesh material={materials.conduit}>
          <cylinderGeometry args={[0.16, 0.16, 0.16, 16]} />
        </mesh>
      </group>

      {/* 6. Articulated Head Unit with Visor & Antennae */}
      <group ref={headRef} position={[0, 1.95, 0]}>
        {/* A. Head Chassis based on HeadShape */}
        {headShape === 'dome' ? (
          <group>
            {/* Cylindrical lower head + dome cap */}
            <mesh position={[0, -0.05, 0]} material={materials.enamel}>
              <cylinderGeometry args={[0.42, 0.44, 0.38, 24]} />
            </mesh>
            <mesh position={[0, 0.14, 0]} material={materials.enamel}>
              <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          </group>
        ) : headShape === 'wide' ? (
          /* Wide oval saucer head */
          <mesh material={materials.enamel} scale={[1.25, 0.88, 1.05]}>
            <boxGeometry args={[0.72, 0.64, 0.58]} />
          </mesh>
        ) : (
          /* Classic Boxy TV CRT Head */
          <mesh material={materials.enamel}>
            <boxGeometry args={[0.82, 0.66, 0.64]} />
          </mesh>
        )}

        {/* B. Curved Front Visor Screen */}
        <mesh position={[0, -0.02, 0.322]} material={materials.visor}>
          <planeGeometry args={[0.62, 0.48]} />
        </mesh>
        {/* Dark Visor Raised Frame Bezel */}
        <mesh position={[0, -0.02, 0.321]} material={materials.conduit}>
          <boxGeometry args={[0.68, 0.54, 0.02]} />
        </mesh>

        {/* C. Ear Bolt Dials (Left & Right) */}
        <mesh position={[-0.43, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.accent}>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
        </mesh>
        <mesh position={[0.43, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.accent}>
          <cylinderGeometry args={[0.14, 0.14, 0.08, 16]} />
        </mesh>

        {/* D. Antennae on top */}
        <group ref={antennaRef} position={[0, 0.34, 0]}>
          {antennaType === 'single' ? (
            /* Single center finial ball */
            <group>
              <mesh position={[0, 0.08, 0]} material={materials.metal}>
                <cylinderGeometry args={[0.025, 0.025, 0.16, 8]} />
              </mesh>
              <mesh position={[0, 0.19, 0]} material={materials.accent}>
                <sphereGeometry args={[0.075, 12, 12]} />
              </mesh>
            </group>
          ) : antennaType === 'curved' ? (
            /* Curved spring antennae */
            <group>
              {[-0.22, 0.22].map((xOff, idx) => (
                <group key={`ant-${idx}`} position={[xOff, 0, 0]} rotation={[0, 0, (idx === 0 ? 0.35 : -0.35)]}>
                  <mesh position={[0, 0.12, 0]} material={materials.metal}>
                    <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
                  </mesh>
                  <mesh position={[0, 0.26, 0]} material={materials.accent}>
                    <sphereGeometry args={[0.06, 12, 12]} />
                  </mesh>
                </group>
              ))}
            </group>
          ) : (
            /* Classic Twin straight ball-tipped antennae */
            <group>
              {[-0.24, 0.24].map((xOff, idx) => (
                <group key={`ant-${idx}`} position={[xOff, 0, 0]}>
                  <mesh position={[0, 0.12, 0]} material={materials.metal}>
                    <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
                  </mesh>
                  <mesh position={[0, 0.26, 0]} material={materials.accent}>
                    <sphereGeometry args={[0.065, 12, 12]} />
                  </mesh>
                </group>
              ))}
            </group>
          )}
        </group>
      </group>

      {/* 7. Unique Animated Accessory Props & Arms (Passed by Child Robot Components) */}
      {children}
    </group>
  )
}
