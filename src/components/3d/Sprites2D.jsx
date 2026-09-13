import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

// -------------------------------------------------------------
// 1. HAND-PAINTED WATERCOLOR CAMPFIRE (from Concept Art)
// -------------------------------------------------------------
function createWatercolorCampfireTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 512, 512)

  // Soft Warm Fire Glow Aura
  const aura = ctx.createRadialGradient(256, 330, 20, 256, 330, 220)
  aura.addColorStop(0, 'rgba(255, 185, 50, 0.75)')
  aura.addColorStop(0.35, 'rgba(245, 120, 30, 0.4)')
  aura.addColorStop(0.75, 'rgba(210, 60, 20, 0.12)')
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = aura
  ctx.beginPath()
  ctx.arc(256, 330, 220, 0, Math.PI * 2)
  ctx.fill()

  // Circle of River Stones
  const stones = [
    { x: 140, y: 395, r: 24, c: '#6c7780' },
    { x: 185, y: 420, r: 26, c: '#59656e' },
    { x: 240, y: 428, r: 28, c: '#4d5860' },
    { x: 295, y: 422, r: 26, c: '#5e6a73' },
    { x: 345, y: 400, r: 24, c: '#6f7b84' },
    { x: 375, y: 365, r: 22, c: '#525e66' },
    { x: 360, y: 335, r: 20, c: '#626e76' },
    { x: 315, y: 315, r: 22, c: '#48545c' },
    { x: 256, y: 308, r: 24, c: '#55616a' },
    { x: 195, y: 315, r: 22, c: '#5e6a73' },
    { x: 150, y: 335, r: 20, c: '#4c5860' },
    { x: 130, y: 365, r: 22, c: '#637078' },
  ]

  stones.forEach(s => {
    ctx.fillStyle = s.c
    ctx.beginPath()
    ctx.ellipse(s.x, s.y, s.r, s.r * 0.72, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.beginPath()
    ctx.ellipse(s.x - 2, s.y - 4, s.r * 0.6, s.r * 0.35, -0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(20, 25, 30, 0.4)'
    ctx.beginPath()
    ctx.ellipse(s.x, s.y + s.r * 0.45, s.r * 0.8, s.r * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
  })

  // Sturdy Crossed Timber Logs (from Concept Art)
  const drawLog = (x1, y1, x2, y2, width, color = '#2e1c12') => {
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.strokeStyle = '#543625'
    ctx.lineWidth = width * 0.4
    ctx.beginPath()
    ctx.moveTo(x1 + 3, y1 - 2)
    ctx.lineTo(x2 - 3, y2 - 2)
    ctx.stroke()
    ctx.restore()
  }

  drawLog(160, 400, 350, 335, 28, '#1e110a')
  drawLog(165, 340, 345, 400, 28, '#26150e')
  drawLog(205, 410, 310, 325, 24, '#1b0f0a')
  drawLog(185, 350, 325, 385, 26, '#311b11')

  // Hot Glowing Coals Bed
  const coals = ctx.createRadialGradient(256, 365, 8, 256, 365, 95)
  coals.addColorStop(0, 'rgba(255, 255, 235, 1)')
  coals.addColorStop(0.3, 'rgba(255, 180, 45, 0.95)')
  coals.addColorStop(0.7, 'rgba(230, 70, 20, 0.85)')
  coals.addColorStop(1, 'rgba(120, 25, 12, 0)')
  ctx.fillStyle = coals
  ctx.beginPath()
  ctx.ellipse(256, 365, 95, 40, 0, 0, Math.PI * 2)
  ctx.fill()

  // Stylized Warm Watercolor Flames
  ctx.fillStyle = 'rgba(240, 85, 35, 0.94)'
  ctx.beginPath()
  ctx.moveTo(256, 95)
  ctx.quadraticCurveTo(335, 215, 325, 335)
  ctx.quadraticCurveTo(310, 385, 256, 385)
  ctx.quadraticCurveTo(202, 385, 187, 335)
  ctx.quadraticCurveTo(177, 215, 256, 95)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 165, 30, 0.96)'
  ctx.beginPath()
  ctx.moveTo(256, 135)
  ctx.quadraticCurveTo(315, 235, 305, 345)
  ctx.quadraticCurveTo(290, 380, 256, 380)
  ctx.quadraticCurveTo(222, 380, 207, 345)
  ctx.quadraticCurveTo(197, 235, 256, 135)
  ctx.fill()

  ctx.fillStyle = '#fed35b'
  ctx.beginPath()
  ctx.moveTo(256, 185)
  ctx.quadraticCurveTo(295, 265, 285, 350)
  ctx.quadraticCurveTo(275, 375, 256, 375)
  ctx.quadraticCurveTo(237, 375, 227, 350)
  ctx.quadraticCurveTo(217, 265, 256, 185)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(256, 335, 24, 44, 0, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const CampfireSprite = ({ position = [0, 0, 0] }) => {
  const texture = useMemo(() => createWatercolorCampfireTexture(), [])
  const spriteRef = useRef()

  useFrame(({ clock }) => {
    if (!spriteRef.current) return
    const t = clock.getElapsedTime()
    const s = 1.0 + Math.sin(t * 12) * 0.03
    spriteRef.current.scale.set(3.4 * s, 3.4 * (1 + Math.sin(t * 16) * 0.045), 1)
  })

  return (
    <group position={position}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh ref={spriteRef} position={[0, 1.35, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
      <pointLight position={[0, 0.9, 0]} color="#ff9e3b" intensity={26} distance={24} />
    </group>
  )
}

// -------------------------------------------------------------
// 1b. SLEEPING CAT ON COZY RUG (Exact from Concept Art!)
// -------------------------------------------------------------
function createSleepingCatRugTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 220
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 320, 220)

  // Ground shadow under rug
  ctx.fillStyle = 'rgba(15, 25, 18, 0.35)'
  ctx.beginPath()
  ctx.roundRect(30, 75, 260, 125, 12)
  ctx.fill()

  // Woven Red Traveler Rug
  ctx.fillStyle = '#8b2626'
  ctx.beginPath()
  ctx.roundRect(35, 70, 250, 120, 8)
  ctx.fill()

  // Gold woven border & geometric pattern
  ctx.strokeStyle = '#d4af37'
  ctx.lineWidth = 3.5
  ctx.strokeRect(45, 80, 230, 100)

  ctx.strokeStyle = '#e6c265'
  ctx.lineWidth = 2
  ctx.strokeRect(55, 90, 210, 80)

  // Rug fringe / tassels
  ctx.fillStyle = '#e6c265'
  for (let i = 40; i < 280; i += 8) {
    ctx.fillRect(i, 65, 3, 7)
    ctx.fillRect(i, 188, 3, 7)
  }

  // Sleeping Black Cat curled into a cozy crescent
  ctx.save()
  ctx.translate(160, 130)

  // Cat body (curled ball)
  ctx.fillStyle = '#141416'
  ctx.beginPath()
  ctx.ellipse(0, 0, 48, 34, 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Cat head curled tucked into body
  ctx.beginPath()
  ctx.arc(32, -8, 20, 0, Math.PI * 2)
  ctx.fill()

  // Cat ears
  ctx.beginPath()
  ctx.moveTo(25, -24)
  ctx.lineTo(34, -38)
  ctx.lineTo(42, -22)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(38, -20)
  ctx.lineTo(48, -34)
  ctx.lineTo(52, -18)
  ctx.closePath()
  ctx.fill()

  // Crimson Traveler's Scarf wrapped around neck
  ctx.fillStyle = '#c92a2a'
  ctx.beginPath()
  ctx.ellipse(22, 2, 14, 18, 0.4, 0, Math.PI * 2)
  ctx.fill()

  // Scarf golden tassel
  ctx.fillStyle = '#ffbe0b'
  ctx.fillRect(24, 16, 8, 12)

  // Cat tail curled around body
  ctx.strokeStyle = '#141416'
  ctx.lineWidth = 9
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(-10, 8, 36, 0.4, Math.PI * 0.95)
  ctx.stroke()

  // Gentle sleeping eye crescent
  ctx.strokeStyle = '#383840'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(38, -6, 5, 0.2, Math.PI * 0.9)
  ctx.stroke()

  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const SleepingCatRugSprite = ({ position = [1.4, 0, 0.5] }) => {
  const texture = useMemo(() => createSleepingCatRugTexture(), [])

  return (
    <group position={position}>
      {/* Flat on ground or slight tilt */}
      <mesh rotation={[-Math.PI / 2, 0, 0.2]} position={[0, 0.04, 0]}>
        <planeGeometry args={[2.8, 1.9]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}


// -------------------------------------------------------------
// 1c-alt. LAYERED EVERGREEN PINE TREE
// -------------------------------------------------------------
function createPineTreeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 360
  canvas.height = 540
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 360, 540)

  // Soft ground contact shadow
  ctx.fillStyle = 'rgba(12, 24, 16, 0.38)'
  ctx.beginPath()
  ctx.ellipse(180, 515, 75, 20, 0, 0, Math.PI * 2)
  ctx.fill()

  // Sturdy Textured Brown Bark Trunk
  ctx.fillStyle = '#342116'
  ctx.beginPath()
  ctx.moveTo(165, 510)
  ctx.lineTo(170, 200)
  ctx.lineTo(190, 200)
  ctx.lineTo(195, 510)
  ctx.closePath()
  ctx.fill()

  // Bark ridge details
  ctx.strokeStyle = '#4e3322'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(173, 500)
  ctx.lineTo(175, 240)
  ctx.moveTo(185, 490)
  ctx.lineTo(183, 260)
  ctx.stroke()

  // Layered Stylized Pine Foliage Tiers (Bottom to Top)
  const drawTier = (yTop, yBottom, halfWidth, darkColor, lightColor) => {
    // Shaded back layer
    ctx.fillStyle = darkColor
    ctx.beginPath()
    ctx.moveTo(180, yTop)
    ctx.lineTo(180 + halfWidth, yBottom)
    // Serrated needle fringe
    ctx.quadraticCurveTo(180 + halfWidth * 0.5, yBottom - 10, 180, yBottom + 12)
    ctx.quadraticCurveTo(180 - halfWidth * 0.5, yBottom - 10, 180 - halfWidth, yBottom)
    ctx.closePath()
    ctx.fill()

    // Light highlights on upper foliage slope
    ctx.fillStyle = lightColor
    ctx.beginPath()
    ctx.moveTo(180, yTop + 6)
    ctx.lineTo(180 + halfWidth * 0.85, yBottom - 12)
    ctx.quadraticCurveTo(180 + halfWidth * 0.4, yBottom - 24, 180, yBottom - 4)
    ctx.quadraticCurveTo(180 - halfWidth * 0.4, yBottom - 24, 180 - halfWidth * 0.85, yBottom - 12)
    ctx.closePath()
    ctx.fill()
  }

  // Tier 1 (Lowest, widest)
  drawTier(280, 440, 125, '#183823', '#2a5a3a')
  // Tier 2
  drawTier(200, 350, 110, '#1d422a', '#326c46')
  // Tier 3
  drawTier(130, 260, 90, '#234f32', '#3a7d52')
  // Tier 4
  drawTier(70, 180, 70, '#285a3a', '#44915f')
  // Tier 5 (Crown)
  drawTier(20, 110, 45, '#2e6742', '#4ea66e')

  // Delicate white forest spores / pine tips
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.beginPath()
  ctx.arc(180, 20, 4, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const PineTreeSprite = ({ position = [0, 0, 0], scale = 1 }) => {
  const texture = useMemo(() => createPineTreeTexture(), [])

  return (
    <group position={position} scale={scale}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 4.4, 0]}>
          <planeGeometry args={[5.2, 7.8]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  )
}

// -------------------------------------------------------------
// 1d. RUSTIC WOODEN SIGNPOST SPRITE (from Concept Art!)
// -------------------------------------------------------------
function createWoodenSignpostTexture(label, icon) {
  const canvas = document.createElement('canvas')
  canvas.width = 240
  canvas.height = 280
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 240, 280)

  // Ground shadow
  ctx.fillStyle = 'rgba(15, 25, 18, 0.35)'
  ctx.beginPath()
  ctx.ellipse(120, 270, 45, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  // Wooden Post
  ctx.fillStyle = '#422818'
  ctx.beginPath()
  ctx.roundRect(110, 60, 20, 210, 4)
  ctx.fill()
  ctx.strokeStyle = '#5a3822'
  ctx.lineWidth = 3
  ctx.strokeRect(110, 60, 20, 210)

  // Carved Wooden Plaque
  ctx.fillStyle = '#6b4428'
  ctx.beginPath()
  ctx.roundRect(20, 40, 200, 75, 8)
  ctx.fill()

  // Wood grain & border
  ctx.strokeStyle = '#8d5d37'
  ctx.lineWidth = 4
  ctx.strokeRect(22, 42, 196, 71)

  ctx.strokeStyle = '#4a2f1c'
  ctx.lineWidth = 2
  ctx.strokeRect(28, 48, 184, 59)

  // Metal nails
  ctx.fillStyle = '#26170d'
  ctx.beginPath()
  ctx.arc(34, 54, 3, 0, Math.PI * 2)
  ctx.arc(206, 54, 3, 0, Math.PI * 2)
  ctx.arc(34, 101, 3, 0, Math.PI * 2)
  ctx.arc(206, 101, 3, 0, Math.PI * 2)
  ctx.fill()

  // Label text
  ctx.fillStyle = '#fceecb'
  ctx.font = 'bold 22px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 120, 72)

  // Subtitle icon
  ctx.font = '18px serif'
  ctx.fillStyle = '#ffd166'
  ctx.fillText(icon, 120, 95)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const WoodenSignpostSprite = ({ position = [0, 0, 0], label = 'STATION', icon = '◈', scale = 1 }) => {
  const texture = useMemo(() => createWoodenSignpostTexture(label, icon), [label, icon])

  return (
    <group position={position} scale={scale}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 1.6, 0]}>
          <planeGeometry args={[2.4, 2.8]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  )
}

// -------------------------------------------------------------
// 1e. SUPPLY CRATES & TIMBER BARRELS (from Concept Art!)
// -------------------------------------------------------------
function createCratesAndBarrelsTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 300
  canvas.height = 240
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 300, 240)

  // Soft ground shadow
  ctx.fillStyle = 'rgba(15, 25, 18, 0.35)'
  ctx.beginPath()
  ctx.ellipse(150, 220, 120, 18, 0, 0, Math.PI * 2)
  ctx.fill()

  // Wooden Crate 1 (Left)
  ctx.fillStyle = '#784e2d'
  ctx.beginPath()
  ctx.roundRect(30, 110, 100, 100, 6)
  ctx.fill()
  ctx.strokeStyle = '#52341d'
  ctx.lineWidth = 4
  ctx.strokeRect(30, 110, 100, 100)
  // X brace
  ctx.beginPath()
  ctx.moveTo(35, 115)
  ctx.lineTo(125, 205)
  ctx.moveTo(125, 115)
  ctx.lineTo(35, 205)
  ctx.stroke()

  // Timber Barrel (Right)
  ctx.fillStyle = '#5c3921'
  ctx.beginPath()
  ctx.ellipse(210, 155, 48, 65, 0, 0, Math.PI * 2)
  ctx.fill()
  // Iron bands
  ctx.strokeStyle = '#2d3748'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.ellipse(210, 120, 44, 12, 0, 0, Math.PI * 2)
  ctx.ellipse(210, 155, 48, 14, 0, 0, Math.PI * 2)
  ctx.ellipse(210, 190, 44, 12, 0, 0, Math.PI * 2)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const CratesAndBarrelsSprite = ({ position = [0, 0, 0], scale = 1 }) => {
  const texture = useMemo(() => createCratesAndBarrelsTexture(), [])

  return (
    <group position={position} scale={scale}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 1.2, 0]}>
          <planeGeometry args={[3.2, 2.5]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  )
}

// -------------------------------------------------------------
// 1b. WAYFINDER BARE TWIG TREE (Signature Clearing Tree)
// -------------------------------------------------------------
function createWayfinderBareTreeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 360
  canvas.height = 480
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 360, 480)

  // Hand-drawn minimalist dark brown trunk & bare angular twigs (Wayfinder reference)
  ctx.strokeStyle = '#38281d'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Main slender trunk
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(180, 460)
  ctx.lineTo(180, 240)
  ctx.lineTo(180, 100)
  ctx.stroke()

  // Primary branches
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.moveTo(180, 300)
  ctx.lineTo(130, 250)
  ctx.lineTo(120, 220)
  ctx.moveTo(180, 270)
  ctx.lineTo(230, 230)
  ctx.lineTo(245, 200)
  ctx.moveTo(180, 200)
  ctx.lineTo(145, 160)
  ctx.moveTo(180, 170)
  ctx.lineTo(215, 140)
  ctx.stroke()

  // Fine angular twigs (exact Wayfinder style from reference image)
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(120, 220)
  ctx.lineTo(105, 205)
  ctx.moveTo(130, 250)
  ctx.lineTo(140, 215)
  ctx.moveTo(245, 200)
  ctx.lineTo(260, 185)
  ctx.moveTo(230, 230)
  ctx.lineTo(220, 195)
  ctx.moveTo(145, 160)
  ctx.lineTo(135, 130)
  ctx.moveTo(180, 140)
  ctx.lineTo(165, 110)
  ctx.moveTo(215, 140)
  ctx.lineTo(225, 115)
  ctx.moveTo(180, 100)
  ctx.lineTo(180, 60)
  ctx.stroke()

  // Soft bark highlight on trunk edge
  ctx.strokeStyle = '#543d2d'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(176, 450)
  ctx.lineTo(176, 200)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const WayfinderBareTreeSprite = ({ position = [0, 0, 0], scale = 1 }) => {
  const texture = useMemo(() => createWayfinderBareTreeTexture(), [])

  return (
    <group position={position} scale={scale}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 2.6, 0]}>
          <planeGeometry args={[3.8, 5.2]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  )
}

// -------------------------------------------------------------
// 1c. WAYFINDER SLATE STONES, MUSHROOMS & STRAY TWIG
// -------------------------------------------------------------
function createWayfinderClearingStonesTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 380
  canvas.height = 260
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 380, 260)

  // Ground drop shadows (Wayfinder soft grey contact shadows)
  ctx.fillStyle = 'rgba(70, 65, 60, 0.32)'
  ctx.beginPath()
  ctx.ellipse(120, 215, 65, 20, 0, 0, Math.PI * 2)
  ctx.ellipse(240, 205, 55, 18, 0, 0, Math.PI * 2)
  ctx.ellipse(290, 225, 35, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  // 1. Large Tall Slate Stone (Left)
  ctx.fillStyle = '#6b7a88'
  ctx.beginPath()
  ctx.moveTo(85, 215)
  ctx.quadraticCurveTo(70, 130, 115, 75)
  ctx.quadraticCurveTo(145, 65, 155, 130)
  ctx.quadraticCurveTo(160, 195, 150, 215)
  ctx.closePath()
  ctx.fill()

  // Stone facet shading
  ctx.fillStyle = '#546270'
  ctx.beginPath()
  ctx.moveTo(115, 75)
  ctx.lineTo(125, 215)
  ctx.lineTo(150, 215)
  ctx.quadraticCurveTo(160, 195, 155, 130)
  ctx.quadraticCurveTo(145, 65, 115, 75)
  ctx.fill()

  // Slate top light highlight
  ctx.strokeStyle = '#8d9da9'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(88, 200)
  ctx.quadraticCurveTo(75, 135, 115, 78)
  ctx.stroke()

  // 2. Medium Slate Stone (Right)
  ctx.fillStyle = '#657380'
  ctx.beginPath()
  ctx.moveTo(200, 205)
  ctx.quadraticCurveTo(210, 120, 245, 110)
  ctx.quadraticCurveTo(285, 125, 280, 205)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#4f5c68'
  ctx.beginPath()
  ctx.moveTo(245, 110)
  ctx.lineTo(250, 205)
  ctx.lineTo(280, 205)
  ctx.quadraticCurveTo(285, 125, 245, 110)
  ctx.fill()

  // 3. Small Pebble
  ctx.fillStyle = '#5c6974'
  ctx.beginPath()
  ctx.ellipse(290, 222, 22, 14, -0.15, 0, Math.PI * 2)
  ctx.fill()

  // 4. Tiny White Fairy Mushrooms on delicate stems (Wayfinder detail)
  const drawMushroom = (x, y, h) => {
    ctx.strokeStyle = '#e0ded8'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - h)
    ctx.stroke()

    // White rounded cap
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x, y - h, 6.5, Math.PI, 0)
    ctx.closePath()
    ctx.fill()
  }

  drawMushroom(175, 210, 28)
  drawMushroom(190, 212, 24)
  drawMushroom(168, 214, 18)
  drawMushroom(205, 215, 22)

  // 5. Stray Fallen Twig on the ground (Wayfinder detail)
  ctx.strokeStyle = '#3d2b1f'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(215, 230)
  ctx.lineTo(265, 228)
  ctx.lineTo(275, 236)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const WayfinderClearingStonesSprite = ({ position = [0, 0, 0], scale = 1 }) => {
  const texture = useMemo(() => createWayfinderClearingStonesTexture(), [])

  return (
    <group position={position} scale={scale}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 0.95, 0]}>
          <planeGeometry args={[3.2, 2.2]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  )
}

// -------------------------------------------------------------
// 2. RUNIC MONOLITH (Projects - from Concept Art)
// -------------------------------------------------------------
function createWatercolorMonolithTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 460
  canvas.height = 580
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 460, 580)

  // Ground drop shadow
  ctx.fillStyle = 'rgba(12, 24, 16, 0.4)'
  ctx.beginPath()
  ctx.ellipse(230, 530, 160, 32, 0, 0, Math.PI * 2)
  ctx.fill()

  // Base stone steps
  ctx.fillStyle = '#324036'
  ctx.beginPath()
  ctx.roundRect(70, 490, 320, 45, 12)
  ctx.fill()
  ctx.fillStyle = '#425447'
  ctx.beginPath()
  ctx.roundRect(100, 455, 260, 40, 10)
  ctx.fill()

  // Weathered Stone Monolith Body
  ctx.fillStyle = '#45564c'
  ctx.beginPath()
  ctx.moveTo(130, 460)
  ctx.lineTo(145, 140)
  ctx.quadraticCurveTo(230, 45, 315, 140)
  ctx.lineTo(330, 460)
  ctx.closePath()
  ctx.fill()

  // Slate Shading / Facets
  ctx.fillStyle = '#36443c'
  ctx.beginPath()
  ctx.moveTo(230, 55)
  ctx.lineTo(240, 460)
  ctx.lineTo(330, 460)
  ctx.lineTo(315, 140)
  ctx.closePath()
  ctx.fill()

  // Stone highlight ridge
  ctx.strokeStyle = '#6f8a79'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(148, 140)
  ctx.quadraticCurveTo(230, 52, 310, 140)
  ctx.stroke()

  // Overgrown Ivy Vines (from Concept Art)
  ctx.strokeStyle = '#2d6a4f'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(140, 460)
  ctx.quadraticCurveTo(180, 340, 160, 240)
  ctx.quadraticCurveTo(150, 170, 200, 110)
  ctx.moveTo(320, 420)
  ctx.quadraticCurveTo(280, 300, 300, 200)
  ctx.stroke()

  // Ivy leaves
  ctx.fillStyle = '#40916c'
  const ivyPoints = [
    [155, 370], [175, 310], [158, 230], [185, 170],
    [290, 340], [280, 270], [305, 210], [220, 95]
  ]
  ivyPoints.forEach(([ix, iy]) => {
    ctx.beginPath()
    ctx.arc(ix, iy, 9, 0, Math.PI * 2)
    ctx.fill()
  })

  // Glowing Cyan Carved Inscriptions ("R N" & Ancient Spindle Runes)
  ctx.save()
  ctx.strokeStyle = '#55efc4'
  ctx.shadowColor = '#55efc4'
  ctx.shadowBlur = 24
  ctx.lineWidth = 7
  ctx.lineCap = 'round'

  // Carved "R" Rune
  ctx.beginPath()
  ctx.moveTo(200, 180)
  ctx.lineTo(200, 250)
  ctx.moveTo(200, 180)
  ctx.quadraticCurveTo(240, 180, 240, 215)
  ctx.quadraticCurveTo(240, 230, 200, 230)
  ctx.moveTo(215, 230)
  ctx.lineTo(240, 255)
  ctx.stroke()

  // Carved "N" Rune
  ctx.beginPath()
  ctx.moveTo(200, 285)
  ctx.lineTo(200, 355)
  ctx.lineTo(245, 285)
  ctx.lineTo(245, 355)
  ctx.stroke()

  // Spindle Runes top & bottom
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(225, 140, 16, 0, Math.PI * 2)
  ctx.moveTo(225, 380)
  ctx.lineTo(225, 425)
  ctx.moveTo(205, 400)
  ctx.lineTo(245, 400)
  ctx.stroke()
  ctx.restore()

  // Wooden Supply Crate at base (Left)
  ctx.fillStyle = '#7a4f2d'
  ctx.beginPath()
  ctx.roundRect(40, 440, 65, 65, 4)
  ctx.fill()
  ctx.strokeStyle = '#4e311a'
  ctx.lineWidth = 3
  ctx.strokeRect(40, 440, 65, 65)
  ctx.beginPath()
  ctx.moveTo(43, 443)
  ctx.lineTo(102, 502)
  ctx.stroke()

  // Timber Barrel at base (Right)
  ctx.fillStyle = '#5a371e'
  ctx.beginPath()
  ctx.ellipse(375, 465, 30, 42, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#2d3748'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(375, 445, 28, 8, 0, 0, Math.PI * 2)
  ctx.ellipse(375, 465, 30, 9, 0, 0, Math.PI * 2)
  ctx.ellipse(375, 485, 28, 8, 0, 0, Math.PI * 2)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const RunicMonolithSprite = ({ position = [-58, 0, -68], onInspect }) => {
  const texture = useMemo(() => createWatercolorMonolithTexture(), [])

  return (
    <group position={position} onClick={onInspect}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 4.6, 0]}>
          <planeGeometry args={[6.2, 7.8]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
      {/* Rustic Wooden Signpost in front of shrine */}
      <WoodenSignpostSprite position={[2.8, 0, 1.2]} label="PROJECTS" icon="⚒" scale={0.9} />
      <pointLight position={[0, 3.8, 0.8]} color="#55efc4" intensity={26} distance={25} />
    </group>
  )
}

// -------------------------------------------------------------
// 3. TRAVELER EXPEDITION TENT (Resume - from Concept Art)
// -------------------------------------------------------------
function createWatercolorTentTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 540
  canvas.height = 460
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 540, 460)

  // Ground contact shadow
  ctx.fillStyle = 'rgba(12, 24, 16, 0.4)'
  ctx.beginPath()
  ctx.ellipse(270, 410, 220, 35, 0, 0, Math.PI * 2)
  ctx.fill()

  // Giant Ancient Tree Root Background (Right side)
  ctx.fillStyle = '#2f1f14'
  ctx.beginPath()
  ctx.moveTo(420, 0)
  ctx.quadraticCurveTo(460, 200, 530, 420)
  ctx.lineTo(390, 420)
  ctx.quadraticCurveTo(360, 260, 350, 0)
  ctx.closePath()
  ctx.fill()

  // Moss on root
  ctx.fillStyle = '#2d5d3b'
  ctx.beginPath()
  ctx.ellipse(440, 240, 35, 75, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Timber A-Frame Posts
  ctx.strokeStyle = '#3d2516'
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(80, 410)
  ctx.lineTo(260, 70)
  ctx.lineTo(430, 410)
  ctx.stroke()

  // Natural Canvas Pavilion Body
  ctx.fillStyle = '#dfd5c2'
  ctx.beginPath()
  ctx.moveTo(95, 400)
  ctx.lineTo(260, 90)
  ctx.lineTo(415, 400)
  ctx.closePath()
  ctx.fill()

  // Canvas fold shadow
  ctx.fillStyle = '#c5b8a0'
  ctx.beginPath()
  ctx.moveTo(260, 90)
  ctx.lineTo(415, 400)
  ctx.lineTo(320, 400)
  ctx.closePath()
  ctx.fill()

  // Warm Cozy Interior
  ctx.fillStyle = '#21160e'
  ctx.beginPath()
  ctx.moveTo(160, 390)
  ctx.lineTo(260, 160)
  ctx.lineTo(340, 390)
  ctx.closePath()
  ctx.fill()

  // Scholar's Study Desk (In front of tent)
  ctx.fillStyle = '#5a3a22'
  ctx.beginPath()
  ctx.roundRect(165, 330, 155, 60, 6)
  ctx.fill()
  ctx.strokeStyle = '#3d2516'
  ctx.lineWidth = 4
  ctx.strokeRect(165, 330, 155, 60)

  // Desk Legs
  ctx.fillStyle = '#3d2516'
  ctx.fillRect(175, 385, 12, 30)
  ctx.fillRect(295, 385, 12, 30)

  // Open Ancient Parchment Scroll / Map
  ctx.fillStyle = '#f5ecd7'
  ctx.beginPath()
  ctx.roundRect(185, 315, 100, 35, 4)
  ctx.fill()
  ctx.strokeStyle = '#8a6d4b'
  ctx.lineWidth = 2
  // Map scribbles
  ctx.beginPath()
  ctx.moveTo(195, 325)
  ctx.lineTo(240, 325)
  ctx.moveTo(195, 335)
  ctx.lineTo(270, 335)
  ctx.stroke()

  // Feather Quill in inkpot
  ctx.fillStyle = '#2d3748'
  ctx.beginPath()
  ctx.arc(275, 322, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(275, 322)
  ctx.lineTo(290, 290)
  ctx.stroke()

  // Hanging Amber Lantern from Ridgepole
  const lanternGlow = ctx.createRadialGradient(260, 210, 5, 260, 210, 55)
  lanternGlow.addColorStop(0, 'rgba(255, 225, 110, 0.95)')
  lanternGlow.addColorStop(0.4, 'rgba(255, 170, 40, 0.55)')
  lanternGlow.addColorStop(1, 'rgba(255, 170, 40, 0)')
  ctx.fillStyle = lanternGlow
  ctx.beginPath()
  ctx.arc(260, 210, 55, 0, Math.PI * 2)
  ctx.fill()

  // Lantern brass housing
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(251, 195, 18, 26)
  ctx.strokeStyle = '#78350f'
  ctx.lineWidth = 2.5
  ctx.strokeRect(251, 195, 18, 26)
  // Chain
  ctx.beginPath()
  ctx.moveTo(260, 155)
  ctx.lineTo(260, 195)
  ctx.stroke()

  // Timber Barrel & Crates by tent
  ctx.fillStyle = '#5c3921'
  ctx.beginPath()
  ctx.ellipse(430, 385, 28, 38, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#2d3748'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(430, 365, 26, 8, 0, 0, Math.PI * 2)
  ctx.ellipse(430, 385, 28, 9, 0, 0, Math.PI * 2)
  ctx.ellipse(430, 405, 26, 8, 0, 0, Math.PI * 2)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const TravelerTentSprite = ({ position = [78, 0, -24], onInspect }) => {
  const texture = useMemo(() => createWatercolorTentTexture(), [])

  return (
    <group position={position} onClick={onInspect}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 3.8, 0]}>
          <planeGeometry args={[8.6, 7.3]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
      {/* Rustic Wooden Signpost in front of tent */}
      <WoodenSignpostSprite position={[-3.2, 0, 1.4]} label="RESUME" icon="📜" scale={0.9} />
      <pointLight position={[0, 2.8, 0.8]} color="#ffb703" intensity={24} distance={24} />
    </group>
  )
}

// -------------------------------------------------------------
// 4. BIOLUMINESCENT MUSHROOM GROVE (Blog - from Concept Art)
// -------------------------------------------------------------
function createWatercolorMushroomTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 500
  canvas.height = 480
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 500, 480)

  // Ground shadow
  ctx.fillStyle = 'rgba(12, 24, 16, 0.4)'
  ctx.beginPath()
  ctx.ellipse(250, 430, 200, 35, 0, 0, Math.PI * 2)
  ctx.fill()

  // Soft Turquoise Ambient Spore Glow
  const glow = ctx.createRadialGradient(250, 200, 20, 250, 200, 220)
  glow.addColorStop(0, 'rgba(85, 239, 196, 0.45)')
  glow.addColorStop(0.5, 'rgba(0, 184, 148, 0.2)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(250, 200, 220, 0, Math.PI * 2)
  ctx.fill()

  // Pale Mushroom Stalks
  const drawStalk = (x1, y1, x2, y2, w) => {
    ctx.strokeStyle = '#e2ded2'
    ctx.lineWidth = w
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo((x1 + x2) / 2 + 10, (y1 + y2) / 2, x2, y2)
    ctx.stroke()
  }

  drawStalk(250, 420, 250, 180, 28)
  drawStalk(140, 420, 125, 270, 20)
  drawStalk(360, 420, 380, 280, 22)
  drawStalk(190, 425, 175, 330, 16)
  drawStalk(310, 425, 325, 340, 16)

  // Giant Central Glowing Mushroom Cap
  const capGrad = ctx.createLinearGradient(120, 90, 380, 220)
  capGrad.addColorStop(0, '#55efc4')
  capGrad.addColorStop(0.4, '#00cec9')
  capGrad.addColorStop(1, '#0984e3')
  ctx.fillStyle = capGrad
  ctx.beginPath()
  ctx.moveTo(110, 200)
  ctx.quadraticCurveTo(250, 50, 390, 200)
  ctx.quadraticCurveTo(250, 235, 110, 200)
  ctx.closePath()
  ctx.fill()

  // Cap underside gill ring
  ctx.fillStyle = 'rgba(9, 132, 227, 0.6)'
  ctx.beginPath()
  ctx.ellipse(250, 205, 130, 20, 0, 0, Math.PI * 2)
  ctx.fill()

  // Glowing white & cyan spore dots
  ctx.fillStyle = '#ffffff'
  const dots = [
    [190, 130, 9], [250, 95, 11], [310, 135, 9],
    [220, 170, 7], [275, 165, 7], [160, 165, 6], [340, 170, 6]
  ]
  dots.forEach(([dx, dy, dr]) => {
    ctx.beginPath()
    ctx.arc(dx, dy, dr, 0, Math.PI * 2)
    ctx.fill()
  })

  // Medium Left Cap (Aquamarine)
  ctx.fillStyle = '#00b894'
  ctx.beginPath()
  ctx.moveTo(65, 280)
  ctx.quadraticCurveTo(125, 190, 185, 280)
  ctx.quadraticCurveTo(125, 305, 65, 280)
  ctx.closePath()
  ctx.fill()

  // Medium Right Cap (Cyan)
  ctx.fillStyle = '#00cec9'
  ctx.beginPath()
  ctx.moveTo(315, 290)
  ctx.quadraticCurveTo(380, 200, 445, 290)
  ctx.quadraticCurveTo(380, 315, 315, 290)
  ctx.closePath()
  ctx.fill()

  // Tiny Ground Spores / Pin-mushrooms
  ctx.fillStyle = '#55efc4'
  const miniCaps = [[160, 335, 12], [330, 345, 14], [105, 385, 10], [395, 390, 11]]
  miniCaps.forEach(([mx, my, mr]) => {
    ctx.beginPath()
    ctx.arc(mx, my, mr, Math.PI, 0)
    ctx.closePath()
    ctx.fill()
  })

  // Wooden Lantern Post (Left side, from Concept Art)
  ctx.strokeStyle = '#4a3221'
  ctx.lineWidth = 9
  ctx.beginPath()
  ctx.moveTo(50, 420)
  ctx.lineTo(50, 260)
  ctx.quadraticCurveTo(50, 225, 80, 230)
  ctx.stroke()

  // Hanging Amber Lantern
  const lanternGlow = ctx.createRadialGradient(80, 255, 3, 80, 255, 35)
  lanternGlow.addColorStop(0, 'rgba(255, 215, 100, 0.95)')
  lanternGlow.addColorStop(0.5, 'rgba(255, 150, 30, 0.5)')
  lanternGlow.addColorStop(1, 'rgba(255, 150, 30, 0)')
  ctx.fillStyle = lanternGlow
  ctx.beginPath()
  ctx.arc(80, 255, 35, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffb703'
  ctx.fillRect(72, 245, 16, 22)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const MushroomGroveSprite = ({ position = [-72, 0, 42], onInspect }) => {
  const texture = useMemo(() => createWatercolorMushroomTexture(), [])

  return (
    <group position={position} onClick={onInspect}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 3.8, 0]}>
          <planeGeometry args={[7.8, 7.4]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
      {/* Rustic Wooden Signpost in front of grove */}
      <WoodenSignpostSprite position={[2.6, 0, 1.5]} label="BLOG" icon="📖" scale={0.9} />
      <pointLight position={[0, 3.2, 0]} color="#55efc4" intensity={26} distance={26} />
    </group>
  )
}

// -------------------------------------------------------------
// 5. ANCIENT WISHING WELL (Contact - from Concept Art)
// -------------------------------------------------------------
function createWatercolorWellTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 460
  canvas.height = 480
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 460, 480)

  // Ground contact shadow
  ctx.fillStyle = 'rgba(12, 24, 16, 0.4)'
  ctx.beginPath()
  ctx.ellipse(230, 430, 180, 32, 0, 0, Math.PI * 2)
  ctx.fill()

  // Circular Stone Well Base (from Concept Art)
  ctx.fillStyle = '#4a5850'
  ctx.beginPath()
  ctx.roundRect(90, 260, 280, 155, 24)
  ctx.fill()

  // Stone Masonry Blocks
  ctx.strokeStyle = '#2f3b34'
  ctx.lineWidth = 4
  ctx.beginPath()
  // Horizontal stone rows
  ctx.moveTo(90, 310)
  ctx.lineTo(370, 310)
  ctx.moveTo(90, 360)
  ctx.lineTo(370, 360)
  // Vertical joints
  ctx.moveTo(180, 260)
  ctx.lineTo(180, 310)
  ctx.moveTo(280, 260)
  ctx.lineTo(280, 310)
  ctx.moveTo(135, 310)
  ctx.lineTo(135, 360)
  ctx.moveTo(230, 310)
  ctx.lineTo(230, 360)
  ctx.moveTo(325, 310)
  ctx.lineTo(325, 360)
  ctx.moveTo(180, 360)
  ctx.lineTo(180, 415)
  ctx.moveTo(280, 360)
  ctx.lineTo(280, 415)
  ctx.stroke()

  // Top Stone Lip
  ctx.fillStyle = '#5c6e64'
  ctx.beginPath()
  ctx.ellipse(230, 260, 140, 32, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#38463e'
  ctx.lineWidth = 5
  ctx.stroke()

  // Shimmering Magical Cyan Water Pool
  const water = ctx.createRadialGradient(230, 260, 8, 230, 260, 110)
  water.addColorStop(0, '#a8ffeb')
  water.addColorStop(0.4, '#55efc4')
  water.addColorStop(0.8, '#00cec9')
  water.addColorStop(1, '#0984e3')
  ctx.fillStyle = water
  ctx.beginPath()
  ctx.ellipse(230, 260, 120, 24, 0, 0, Math.PI * 2)
  ctx.fill()

  // Water Ripple Rings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.ellipse(230, 260, 65, 12, 0, 0, Math.PI * 2)
  ctx.ellipse(230, 260, 30, 6, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Dripping Green Moss on rim
  ctx.fillStyle = '#40916c'
  ctx.beginPath()
  ctx.moveTo(140, 270)
  ctx.quadraticCurveTo(155, 320, 160, 340)
  ctx.quadraticCurveTo(165, 310, 175, 270)
  ctx.moveTo(270, 270)
  ctx.quadraticCurveTo(285, 335, 290, 355)
  ctx.quadraticCurveTo(300, 320, 310, 270)
  ctx.fill()

  // Floating Fireflies around the well rim (from Concept Art)
  const fireflies = [
    [130, 220], [170, 180], [240, 190], [300, 170],
    [330, 230], [210, 230], [270, 220]
  ]
  fireflies.forEach(([fx, fy]) => {
    // Firefly aura
    const fg = ctx.createRadialGradient(fx, fy, 1, fx, fy, 16)
    fg.addColorStop(0, 'rgba(168, 255, 235, 0.95)')
    fg.addColorStop(0.5, 'rgba(85, 239, 196, 0.4)')
    fg.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = fg
    ctx.beginPath()
    ctx.arc(fx, fy, 16, 0, Math.PI * 2)
    ctx.fill()
    // Core dot
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(fx, fy, 3, 0, Math.PI * 2)
    ctx.fill()
  })

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const WishingWellSprite = ({ position = [46, 0, 74], onInspect }) => {
  const texture = useMemo(() => createWatercolorWellTexture(), [])

  return (
    <group position={position} onClick={onInspect}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh position={[0, 3.2, 0]}>
          <planeGeometry args={[7.2, 7.5]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.01} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
      {/* Rustic Wooden Signpost in front of well */}
      <WoodenSignpostSprite position={[2.8, 0, 1.2]} label="CONTACT" icon="✉" scale={0.9} />
      <pointLight position={[0, 2.6, 0]} color="#55efc4" intensity={24} distance={24} />
    </group>
  )
}
