import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { usePortfolioStore } from '../../store/usePortfolioStore'

/**
 * VinylTurntable
 * 3D Interactive Vintage Turntable located near the campfire hearth.
 * - Real 3D spinning vinyl record with Spotify emerald center label
 * - Tonearm that swings into position when playing
 * - Glowing Spotify LED power indicator
 * - Floating musical note sparkles when active
 * - Interactive click & cat proximity detection
 */
export const VinylTurntable = ({ position = [102.3, 0, -66.7] }) => {
  const audioPlaying = usePortfolioStore((s) => s.audioPlaying)
  const isSpotifyPlaying = usePortfolioStore((s) => s.isSpotifyPlaying)
  const setSpotifyExpanded = usePortfolioStore((s) => s.setSpotifyExpanded)
  const setSpotifyVisible = usePortfolioStore((s) => s.setSpotifyVisible)

  const recordRef = useRef()
  const tonearmRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const [isCatNear, setIsCatNear] = useState(false)

  const isMusicActive = audioPlaying || isSpotifyPlaying

  // Label Canvas Texture (Spotify Emerald Emblem)
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    // Emerald circle
    ctx.fillStyle = '#1db954'
    ctx.beginPath()
    ctx.arc(64, 64, 62, 0, Math.PI * 2)
    ctx.fill()

    // Sound waves inside badge
    ctx.fillStyle = '#121418'
    ctx.beginPath()
    ctx.arc(64, 64, 12, 0, Math.PI * 2)
    ctx.fill()

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  const promptTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#121418'
    if (ctx.roundRect) {
      ctx.beginPath()
      ctx.roundRect(8, 8, 496, 112, 24)
      ctx.fill()
      ctx.strokeStyle = '#1db954'
      ctx.lineWidth = 6
      ctx.stroke()
    } else {
      ctx.fillRect(8, 8, 496, 112)
    }

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('♫ Spotify Turntable · Click', 256, 64)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useFrame((_, delta) => {
    // 1. Spin the vinyl record continuously when music is playing
    if (recordRef.current && isMusicActive) {
      recordRef.current.rotation.y += delta * 3.8
    }

    // 2. Tonearm angle interpolation
    if (tonearmRef.current) {
      // Resting angle: 0.35 rad, playing angle: -0.15 rad
      const targetAngle = isMusicActive ? -0.18 : 0.40
      tonearmRef.current.rotation.y = THREE.MathUtils.damp(
        tonearmRef.current.rotation.y,
        targetAngle,
        6,
        delta
      )
    }

    // 3. Cat proximity check
    const catPos = usePortfolioStore.getState().catCurrentPos
    if (catPos) {
      const dx = catPos[0] - position[0]
      const dz = catPos[2] - position[2]
      const distSq = dx * dx + dz * dz
      setIsCatNear(distSq < 18.0) // within ~4.2 units
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    setSpotifyVisible(true)
    setSpotifyExpanded(true)
  }

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setIsHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Rustic Tree Trunk Stand / Pedestal */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.62, 0.70, 0.56, 16]} />
        <meshStandardMaterial color="#4a3020" roughness={0.92} />
      </mesh>

      {/* Stand Ground Shadow */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 16]} />
        <meshBasicMaterial color="#0a0f0a" transparent opacity={0.4} />
      </mesh>

      {/* Turntable Plinth (Matte Walnut Chassis) */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.96, 0.12, 0.82]} />
        <meshStandardMaterial
          color={isHovered ? '#3b2518' : '#2d1b10'}
          roughness={0.75}
        />
      </mesh>

      {/* Metal Turntable Platter (Chassis Inset) */}
      <mesh position={[-0.08, 0.69, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.03, 32]} />
        <meshStandardMaterial color="#444950" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 3D Rotating Vinyl Record */}
      <group ref={recordRef} position={[-0.08, 0.71, 0]}>
        {/* Black Vinyl Disc */}
        <mesh>
          <cylinderGeometry args={[0.33, 0.33, 0.015, 36]} />
          <meshStandardMaterial
            color="#111215"
            metalness={0.4}
            roughness={0.25}
          />
        </mesh>

        {/* Emerald Center Spotify Label */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.005, 24]} />
          <meshBasicMaterial map={labelTexture} />
        </mesh>

        {/* Center Metal Spindle */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 12]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Tonearm Assembly */}
      <group position={[0.32, 0.69, -0.22]}>
        {/* Tonearm Base Pivot */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Pivoting Arm */}
        <group ref={tonearmRef}>
          <mesh position={[-0.14, 0.06, 0.12]} rotation={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.34, 10]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.85} roughness={0.15} />
          </mesh>
          {/* Cartridge & Headshell */}
          <mesh position={[-0.24, 0.05, 0.23]} rotation={[0, -0.6, 0]}>
            <boxGeometry args={[0.025, 0.02, 0.05]} />
            <meshStandardMaterial color="#1db954" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Spotify Emerald LED Power Indicator */}
      <mesh position={[0.38, 0.69, 0.28]}>
        <sphereGeometry args={[0.016, 12, 12]} />
        <meshBasicMaterial color={isMusicActive ? '#1db954' : '#4b5563'} />
      </mesh>
      {isMusicActive && (
        <pointLight
          position={[0.38, 0.72, 0.28]}
          color="#1db954"
          intensity={0.8}
          distance={1.5}
        />
      )}

      {/* Floating Musical Note Sparkles when Playing */}
      {isMusicActive && (
        <Sparkles
          count={12}
          scale={[1.2, 1.6, 1.2]}
          position={[-0.08, 1.2, 0]}
          size={3.2}
          speed={0.8}
          color="#86efac"
          opacity={0.85}
        />
      )}

      {/* Interactive Prompt Billboard */}
      {(isCatNear || isHovered) && (
        <Billboard position={[0, 1.45, 0]} follow lockX={false} lockY={false} lockZ={false}>
          <mesh scale={[0.85, 0.85, 0.85]}>
            <planeGeometry args={[2.8, 0.7]} />
            <meshBasicMaterial
              map={promptTexture}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>
      )}
    </group>
  )
}
