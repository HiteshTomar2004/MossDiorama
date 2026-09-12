import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RetroRobotBase } from './RetroRobotBase'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

export const BlogRobot = ({ position = [-103.0, 0, -33.5], rotation = [0, 1.45, 0] }) => {
  const leftTypingRef = useRef()
  const rightTypingRef = useRef()
  const carriageRef = useRef()
  const openOverlay = usePortfolioStore((s) => s.openOverlay)
  const setActiveDistrict = usePortfolioStore((s) => s.setActiveDistrict)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Rapid alternating typing clack
    if (leftTypingRef.current) {
      const tapL = Math.abs(Math.sin(t * 11.0)) * 0.08
      leftTypingRef.current.position.y = -0.38 - tapL
      leftTypingRef.current.rotation.x = 0.75 + tapL * 1.5
    }
    if (rightTypingRef.current) {
      const tapR = Math.abs(Math.cos(t * 11.0 + 0.8)) * 0.08
      rightTypingRef.current.position.y = -0.38 - tapR
      rightTypingRef.current.rotation.x = 0.75 + tapR * 1.5
    }

    // Gentle carriage bounce
    if (carriageRef.current) {
      carriageRef.current.position.x = 0.04 * Math.sin(t * 2.2)
    }
  })

  const handleClick = () => {
    sfx.playRobotWork('typewriter')
    setActiveDistrict('blog')
    openOverlay('blog')
  }

  return (
    <RetroRobotBase
      position={position}
      rotation={rotation}
      scale={0.88}
      enamelColor="#98a886"      // Vintage olive / moss enamel
      accentColor="#c25838"      // Warm terracotta ear bolts & accents
      eyeColor="#a7f3d0"         // Pale mint glowing eyes
      pupilColor="#065f46"
      headShape="wide"           // Wide saucer head with bolt ears (matching bottom-center ref)
      antennaType="twin"
      districtKey="blog"
      onClick={handleClick}
    >
      {/* Round Vintage Spectacles on Face */}
      <group position={[0, 1.94, 0.33]}>
        {/* Left Lens Rim */}
        <mesh position={[-0.20, 0.05, 0]} material={new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.8 })}>
          <torusGeometry args={[0.12, 0.018, 8, 20]} />
        </mesh>
        {/* Right Lens Rim */}
        <mesh position={[0.20, 0.05, 0]} material={new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.8 })}>
          <torusGeometry args={[0.12, 0.018, 8, 20]} />
        </mesh>
        {/* Spectacles Nose Bridge */}
        <mesh position={[0, 0.05, 0]} material={new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.8 })}>
          <boxGeometry args={[0.14, 0.02, 0.02]} />
        </mesh>
      </group>

      {/* Carved Woodland Tree-Stump Desk */}
      <group position={[0, 0.42, 0.65]}>
        {/* Tree Stump Body */}
        <mesh material={new THREE.MeshStandardMaterial({ color: '#543d2b', roughness: 0.85 })}>
          <cylinderGeometry args={[0.42, 0.48, 0.82, 16]} />
        </mesh>
        {/* Desk Top Bark Rim */}
        <mesh position={[0, 0.42, 0]} material={new THREE.MeshStandardMaterial({ color: '#3d2b1f', roughness: 0.9 })}>
          <cylinderGeometry args={[0.46, 0.42, 0.04, 16]} />
        </mesh>

        {/* Vintage Antique Mechanical Typewriter */}
        <group position={[0, 0.52, -0.02]}>
          {/* Black Enameled Typewriter Chassis */}
          <mesh material={new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.3, metalness: 0.7 })}>
            <boxGeometry args={[0.52, 0.12, 0.44]} />
          </mesh>

          {/* Stepped Keybed Slant */}
          <mesh position={[0, -0.01, 0.10]} rotation={[0.28, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#27272a' })}>
            <boxGeometry args={[0.44, 0.08, 0.22]} />
          </mesh>

          {/* Miniature Circular Typewriter Keys */}
          {[-0.16, -0.08, 0, 0.08, 0.16].map((kx, i) => (
            <mesh key={`key-${i}`} position={[kx, 0.04, 0.12]} material={new THREE.MeshStandardMaterial({ color: '#f4f4f5', metalness: 0.4 })}>
              <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
            </mesh>
          ))}

          {/* Carriage Roller & Platen */}
          <group ref={carriageRef} position={[0, 0.10, -0.08]}>
            {/* Rubber Platen Roller */}
            <mesh rotation={[0, 0, Math.PI / 2]} material={new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.7 })}>
              <cylinderGeometry args={[0.04, 0.04, 0.48, 16]} />
            </mesh>
            {/* Chrome Carriage Ends */}
            <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={new THREE.MeshStandardMaterial({ color: '#e4e4e7', metalness: 0.9 })}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
            </mesh>
            <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={new THREE.MeshStandardMaterial({ color: '#e4e4e7', metalness: 0.9 })}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
            </mesh>

            {/* Typed Paper Sheet feeding upward */}
            <mesh position={[0, 0.16, -0.02]} rotation={[-0.15, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#fafaf9', roughness: 0.6 })}>
              <planeGeometry args={[0.34, 0.28]} />
            </mesh>
            {/* Ink Lines on Paper */}
            {[-0.04, 0.02, 0.08, 0.14].map((ly, lIdx) => (
              <mesh key={`line-${lIdx}`} position={[0, ly, -0.018]} rotation={[-0.15, 0, 0]} material={new THREE.MeshBasicMaterial({ color: '#52525b' })}>
                <planeGeometry args={[0.26, 0.012]} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* Animated Typing Arms (Claws click-clacking on keys) */}
      {/* Left Typing Arm */}
      <group position={[-0.56, 1.38, 0]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#c25838' })}>
          <sphereGeometry args={[0.15, 12, 12]} />
        </mesh>
        <group ref={leftTypingRef} position={[0.12, -0.38, 0.32]}>
          <mesh rotation={[0.8, 0.2, 0]} material={new THREE.MeshStandardMaterial({ color: '#98a886' })}>
            <cylinderGeometry args={[0.09, 0.08, 0.36, 12]} />
          </mesh>
          {/* Typing Claw Finger */}
          <mesh position={[0.04, -0.22, 0.18]} material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })}>
            <boxGeometry args={[0.06, 0.12, 0.06]} />
          </mesh>
        </group>
      </group>

      {/* Right Typing Arm */}
      <group position={[0.56, 1.38, 0]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#c25838' })}>
          <sphereGeometry args={[0.15, 12, 12]} />
        </mesh>
        <group ref={rightTypingRef} position={[-0.12, -0.38, 0.32]}>
          <mesh rotation={[0.8, -0.2, 0]} material={new THREE.MeshStandardMaterial({ color: '#98a886' })}>
            <cylinderGeometry args={[0.09, 0.08, 0.36, 12]} />
          </mesh>
          {/* Typing Claw Finger */}
          <mesh position={[-0.04, -0.22, 0.18]} material={new THREE.MeshStandardMaterial({ color: '#94a3b8' })}>
            <boxGeometry args={[0.06, 0.12, 0.06]} />
          </mesh>
        </group>
      </group>
    </RetroRobotBase>
  )
}
