import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RetroRobotBase } from './RetroRobotBase'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

export const ContactRobot = ({ position = [80.5, 0, 83.0], rotation = [0, -0.65, 0] }) => {
  const wavingArmRef = useRef()
  const openOverlay = usePortfolioStore((s) => s.openOverlay)
  const setActiveDistrict = usePortfolioStore((s) => s.setActiveDistrict)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Cheerful, rhythmic waving arm motion
    if (wavingArmRef.current) {
      const wave = Math.sin(t * 4.8) * 0.42
      wavingArmRef.current.rotation.z = -1.1 + wave
      wavingArmRef.current.rotation.x = 0.25 + Math.cos(t * 4.8) * 0.15
    }
  })

  const handleClick = () => {
    sfx.playRobotWork('beep')
    setActiveDistrict('contact')
    openOverlay('contact')
  }

  return (
    <RetroRobotBase
      position={position}
      rotation={rotation}
      scale={0.88}
      enamelColor="#93c5fd"      // Retro powder-blue mail carrier enamel
      accentColor="#1d4ed8"      // Deep royal blue postal accents
      eyeColor="#fbbf24"         // Bright warm amber CRT eyes
      pupilColor="#78350f"
      headShape="box"
      antennaType="curved"       // Playful curved spring antennae (matching top-right ref)
      districtKey="contact"
      onClick={handleClick}
    >
      {/* Postal Service Officer Cap on Head */}
      <group position={[0, 2.30, 0.08]} rotation={[-0.1, 0, 0]}>
        {/* Navy Blue Crown Cap */}
        <mesh material={new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.5 })}>
          <cylinderGeometry args={[0.38, 0.42, 0.16, 20]} />
        </mesh>
        {/* Shiny Black Visor / Brim */}
        <mesh position={[0, -0.06, 0.28]} rotation={[0.35, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2, metalness: 0.8 })}>
          <boxGeometry args={[0.42, 0.03, 0.22]} />
        </mesh>
        {/* Golden Postal Insignia Badge */}
        <mesh position={[0, 0.03, 0.38]} material={new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.6 })}>
          <circleGeometry args={[0.06, 12]} />
        </mesh>
      </group>

      {/* Cross-Body Leather Mail Satchel */}
      <group position={[0, 1.10, 0]}>
        {/* Leather Strap diagonally across chest */}
        <mesh position={[0, 0.08, 0.344]} rotation={[0, 0, -0.68]} material={new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 })}>
          <boxGeometry args={[0.08, 0.98, 0.015]} />
        </mesh>
        {/* Leather Bag resting at the hip */}
        <mesh position={[-0.52, -0.15, 0.12]} rotation={[0, 0.3, 0.1]} material={new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.7 })}>
          <boxGeometry args={[0.22, 0.36, 0.42]} />
        </mesh>
        {/* Brass Bag Buckle */}
        <mesh position={[-0.58, -0.12, 0.26]} material={new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.7 })}>
          <boxGeometry args={[0.04, 0.08, 0.08]} />
        </mesh>
      </group>

      {/* Left Arm: Holding Stamped Airmail Letter */}
      <group position={[-0.56, 1.38, 0]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#1d4ed8' })}>
          <sphereGeometry args={[0.15, 12, 12]} />
        </mesh>
        {/* Forearm angled forward */}
        <mesh position={[-0.05, -0.22, 0.18]} rotation={[0.8, 0, -0.1]} material={new THREE.MeshStandardMaterial({ color: '#93c5fd' })}>
          <cylinderGeometry args={[0.09, 0.08, 0.32, 12]} />
        </mesh>
        {/* The Airmail Envelope */}
        <group position={[0.02, -0.28, 0.35]} rotation={[0.4, 0.2, -0.1]}>
          <mesh material={new THREE.MeshStandardMaterial({ color: '#f8fafc' })}>
            <boxGeometry args={[0.34, 0.24, 0.015]} />
          </mesh>
          {/* Red/Blue Postage Stamp */}
          <mesh position={[0.10, 0.06, 0.01]} material={new THREE.MeshStandardMaterial({ color: '#dc2626' })}>
            <boxGeometry args={[0.06, 0.06, 0.005]} />
          </mesh>
        </group>
      </group>

      {/* Right Arm: Cheerful Waving Hand (Animated) */}
      <group position={[0.56, 1.38, 0]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#1d4ed8' })}>
          <sphereGeometry args={[0.15, 12, 12]} />
        </mesh>
        {/* Waving Joint */}
        <group ref={wavingArmRef}>
          <mesh position={[0.18, 0.18, 0]} rotation={[0, 0, -0.4]} material={new THREE.MeshStandardMaterial({ color: '#34383c' })}>
            <cylinderGeometry args={[0.08, 0.08, 0.34, 12]} />
          </mesh>
          {/* Gauntlet */}
          <mesh position={[0.34, 0.36, 0]} rotation={[0, 0, -0.3]} material={new THREE.MeshStandardMaterial({ color: '#93c5fd' })}>
            <cylinderGeometry args={[0.10, 0.09, 0.26, 12]} />
          </mesh>
          {/* Waving Open Cartoon Claw/Mitten */}
          <group position={[0.44, 0.52, 0]}>
            <mesh material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })}>
              <sphereGeometry args={[0.09, 12, 12]} />
            </mesh>
            {/* Claws spread in wave */}
            <mesh position={[-0.04, 0.08, 0]} material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })}>
              <boxGeometry args={[0.04, 0.10, 0.04]} />
            </mesh>
            <mesh position={[0.04, 0.08, 0]} material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })}>
              <boxGeometry args={[0.04, 0.10, 0.04]} />
            </mesh>
          </group>
        </group>
      </group>
    </RetroRobotBase>
  )
}
