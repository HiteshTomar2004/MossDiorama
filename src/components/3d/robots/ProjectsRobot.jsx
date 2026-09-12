import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RetroRobotBase } from './RetroRobotBase'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

export const ProjectsRobot = ({ position = [25.0, 0, -92.5], rotation = [0, 0.45, 0] }) => {
  const solderArmRef = useRef()
  const pcbArmRef = useRef()
  const sparkLightRef = useRef()
  const openOverlay = usePortfolioStore((s) => s.openOverlay)
  const setActiveDistrict = usePortfolioStore((s) => s.setActiveDistrict)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Tapping soldering probe against PCB
    if (solderArmRef.current) {
      const tap = Math.sin(t * 5.5) * 0.12
      solderArmRef.current.rotation.x = -0.65 + tap
      solderArmRef.current.rotation.z = -0.35 + tap * 0.5
    }

    // 2. PCB holding arm subtle steady bob
    if (pcbArmRef.current) {
      pcbArmRef.current.rotation.x = -0.55 + Math.cos(t * 2.5) * 0.04
    }

    // 3. Spark light flicker
    if (sparkLightRef.current) {
      const flicker = Math.sin(t * 22.0) > 0.4 ? 1.2 : 0.15
      sparkLightRef.current.intensity = flicker
    }
  })

  const handleClick = () => {
    sfx.playRobotWork('spark')
    setActiveDistrict('projects')
    openOverlay('projects')
  }

  return (
    <RetroRobotBase
      position={position}
      rotation={rotation}
      scale={0.88}
      enamelColor="#a8cec7"      // Retro sage-mint enamel (matching reference image)
      accentColor="#ea580c"      // Vibrant coral-orange joints & ear bolts
      eyeColor="#22c55e"         // Glowing emerald CRT eyes
      pupilColor="#14532d"
      headShape="box"            // Boxy CRT TV head
      antennaType="twin"         // Twin straight ball antennae
      districtKey="projects"
      onClick={handleClick}
    >
      {/* --- Left Arm: Holding Green PCB Circuit Board --- */}
      <group ref={pcbArmRef} position={[-0.58, 1.38, 0]}>
        {/* Shoulder Cap */}
        <mesh material={new THREE.MeshStandardMaterial({ color: '#ea580c' })}>
          <sphereGeometry args={[0.16, 12, 12]} />
        </mesh>
        {/* Upper Arm Conduit */}
        <mesh position={[-0.08, -0.22, 0.12]} rotation={[0.4, 0, -0.2]} material={new THREE.MeshStandardMaterial({ color: '#34383c' })}>
          <cylinderGeometry args={[0.08, 0.08, 0.32, 12]} />
        </mesh>
        {/* Forearm Gauntlet */}
        <mesh position={[-0.05, -0.38, 0.28]} rotation={[0.9, 0.1, -0.1]} material={new THREE.MeshStandardMaterial({ color: '#a8cec7' })}>
          <cylinderGeometry args={[0.10, 0.09, 0.28, 12]} />
        </mesh>
        {/* Claw Clamp */}
        <mesh position={[-0.02, -0.48, 0.42]} material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })}>
          <boxGeometry args={[0.14, 0.08, 0.12]} />
        </mesh>

        {/* The Green Circuit Board (PCB) */}
        <group position={[0.05, -0.46, 0.52]} rotation={[0.4, -0.3, 0.1]}>
          {/* PCB Base */}
          <mesh material={new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.4 })}>
            <boxGeometry args={[0.38, 0.02, 0.28]} />
          </mesh>
          {/* Integrated Circuit (IC) Chip */}
          <mesh position={[0, 0.015, 0]} material={new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.5 })}>
            <boxGeometry args={[0.14, 0.02, 0.12]} />
          </mesh>
          {/* Copper Traces / Capacitor Cylinders */}
          <mesh position={[-0.10, 0.025, -0.06]} material={new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.6 })}>
            <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
          </mesh>
          <mesh position={[0.10, 0.02, 0.06]} material={new THREE.MeshStandardMaterial({ color: '#eab308' })}>
            <cylinderGeometry args={[0.02, 0.02, 0.03, 8]} />
          </mesh>
        </group>
      </group>

      {/* --- Right Arm: Soldering Stylus & Spark --- */}
      <group ref={solderArmRef} position={[0.58, 1.38, 0]}>
        {/* Shoulder Cap */}
        <mesh material={new THREE.MeshStandardMaterial({ color: '#ea580c' })}>
          <sphereGeometry args={[0.16, 12, 12]} />
        </mesh>
        {/* Upper Arm Conduit */}
        <mesh position={[0.06, -0.20, 0.14]} rotation={[0.45, 0, 0.2]} material={new THREE.MeshStandardMaterial({ color: '#34383c' })}>
          <cylinderGeometry args={[0.08, 0.08, 0.32, 12]} />
        </mesh>
        {/* Forearm Gauntlet */}
        <mesh position={[0.02, -0.36, 0.30]} rotation={[0.95, -0.1, 0.1]} material={new THREE.MeshStandardMaterial({ color: '#a8cec7' })}>
          <cylinderGeometry args={[0.10, 0.09, 0.28, 12]} />
        </mesh>
        {/* Soldering Iron Handle & Hot Tip */}
        <group position={[-0.06, -0.46, 0.44]} rotation={[0.3, -0.2, 0.5]}>
          <mesh material={new THREE.MeshStandardMaterial({ color: '#1e293b' })}>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
          </mesh>
          {/* Glowing Red-Hot Copper Tip */}
          <mesh position={[0, -0.13, 0]} material={new THREE.MeshBasicMaterial({ color: '#fb923c' })}>
            <coneGeometry args={[0.022, 0.08, 8]} />
          </mesh>
          {/* Dynamic Soldering Point Light */}
          <pointLight ref={sparkLightRef} position={[0, -0.16, 0]} color="#fdba74" distance={2.5} intensity={0.8} />
        </group>
      </group>

      {/* Mini Tool Bench / Battery beside the robot */}
      <group position={[0.62, 0.15, -0.12]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 })}>
          <boxGeometry args={[0.38, 0.28, 0.38]} />
        </mesh>
        {/* Battery with terminals */}
        <mesh position={[0, 0.20, 0]} material={new THREE.MeshStandardMaterial({ color: '#dc2626' })}>
          <cylinderGeometry args={[0.08, 0.08, 0.14, 12]} />
        </mesh>
        <mesh position={[0.03, 0.28, 0]} material={new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.8 })}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
        </mesh>
      </group>
    </RetroRobotBase>
  )
}
