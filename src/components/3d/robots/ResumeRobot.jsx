import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RetroRobotBase } from './RetroRobotBase'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

export const ResumeRobot = ({ position = [-95.5, 0, 77.0], rotation = [0, 2.2, 0] }) => {
  const letterGroupRef = useRef()
  const openOverlay = usePortfolioStore((s) => s.openOverlay)
  const setActiveDistrict = usePortfolioStore((s) => s.setActiveDistrict)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Gentle offering sway: raises and tilts letter proudly
    if (letterGroupRef.current) {
      letterGroupRef.current.position.y = 1.18 + Math.sin(t * 2.2) * 0.04
      letterGroupRef.current.rotation.x = -0.22 + Math.cos(t * 2.2) * 0.05
    }
  })

  const handleClick = () => {
    sfx.playRobotWork('chime')
    setActiveDistrict('resume')
    openOverlay('resume')
  }

  return (
    <RetroRobotBase
      position={position}
      rotation={rotation}
      scale={0.88}
      enamelColor="#f3ece0"      // Warm antique cream enamel
      accentColor="#c2410c"      // Warm copper-rust dials & joints
      eyeColor="#38bdf8"         // Cyan blue friendly CRT eyes
      pupilColor="#0369a1"
      headShape="dome"           // Dome/bell head with top finial (matching top-center ref)
      antennaType="single"       // Single center ball finial on dome
      districtKey="resume"
      onClick={handleClick}
    >
      {/* Both Arms Holding Out the Parchment Letter */}
      <group ref={letterGroupRef} position={[0, 1.18, 0.42]}>
        {/* The Oversized Letter Envelope */}
        <mesh rotation={[0.2, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#fefce8', roughness: 0.7 })}>
          <boxGeometry args={[0.54, 0.38, 0.024]} />
        </mesh>

        {/* Golden Flap Crease Outline */}
        <mesh position={[0, 0.05, 0.015]} rotation={[0.2, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.3 })}>
          <boxGeometry args={[0.50, 0.02, 0.005]} />
        </mesh>

        {/* Crimson Wax Seal Disc */}
        <mesh position={[0, 0.03, 0.022]} rotation={[0.2, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.3 })}>
          <cylinderGeometry args={[0.055, 0.055, 0.012, 16]} />
        </mesh>

        {/* Left Holding Claw */}
        <mesh position={[-0.28, -0.06, 0.02]} rotation={[0, 0.4, 0]} material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })}>
          <boxGeometry args={[0.08, 0.14, 0.12]} />
        </mesh>

        {/* Right Holding Claw */}
        <mesh position={[0.28, -0.06, 0.02]} rotation={[0, -0.4, 0]} material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })}>
          <boxGeometry args={[0.08, 0.14, 0.12]} />
        </mesh>
      </group>

      {/* Arm Conduits leading from shoulders to letter */}
      {/* Left Shoulder & Upper Arm */}
      <group position={[-0.56, 1.38, 0]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#c2410c' })}>
          <sphereGeometry args={[0.15, 12, 12]} />
        </mesh>
        <mesh position={[0.12, -0.16, 0.22]} rotation={[0.7, 0, -0.4]} material={new THREE.MeshStandardMaterial({ color: '#34383c' })}>
          <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        </mesh>
      </group>

      {/* Right Shoulder & Upper Arm */}
      <group position={[0.56, 1.38, 0]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#c2410c' })}>
          <sphereGeometry args={[0.15, 12, 12]} />
        </mesh>
        <mesh position={[-0.12, -0.16, 0.22]} rotation={[0.7, 0, 0.4]} material={new THREE.MeshStandardMaterial({ color: '#34383c' })}>
          <cylinderGeometry args={[0.08, 0.08, 0.35, 12]} />
        </mesh>
      </group>
    </RetroRobotBase>
  )
}
