import React, { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePortfolioStore } from '../../store/usePortfolioStore'

export const CameraManager = () => {
  const controlsRef = useRef()
  const { camera } = useThree()
  const isInitializedRef = useRef(false)

  useFrame((_, delta) => {
    const catCurrentPos = usePortfolioStore.getState().catCurrentPos
    if (!controlsRef.current || !catCurrentPos) return

    const catVec = new THREE.Vector3(catCurrentPos[0], 0, catCurrentPos[2])
    const target = controlsRef.current.target

    if (!isInitializedRef.current) {
      // First frame initialization: default to exact angle centered on cat
      isInitializedRef.current = true
      target.set(catVec.x, 0, catVec.z)
      camera.position.set(catVec.x + 12.0, 18.0, catVec.z + 12.8)
      camera.lookAt(target)
      controlsRef.current.update()
      return
    }

    // Measure target shift and apply identical shift to camera.position
    // so the camera smoothly tracks the cat at constant distance & angle!
    const prevTarget = target.clone()
    const lerpFactor = Math.min(1.0, 4.5 * delta)
    target.lerp(catVec, lerpFactor)

    const deltaShift = target.clone().sub(prevTarget)
    camera.position.add(deltaShift)

    // Ensure orbit target never dips below the ground plane
    if (target.y < 0) {
      target.y = 0
    }

    controlsRef.current.update()

    // Safety floor clamp: camera must never penetrate or dip below the base terrain plane
    if (camera.position.y < 1.2) {
      camera.position.y = 1.2
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[2.0, 0, 1.2]}
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={240}
      minPolarAngle={0.08} // Prevent gimbal flipping at exact vertical zenith
      maxPolarAngle={Math.PI / 2 - 0.06} // Strict clamp (~86.5°): camera can NEVER orbit under base terrain!
      screenSpacePanning
      mouseButtons={{
        LEFT: null, // Left click is reserved for walking/steering the cat!
        MIDDLE: THREE.MOUSE.PAN, // Middle click drags/pans the camera across the world
        RIGHT: THREE.MOUSE.ROTATE, // Right click rotates/orbits the camera freely
      }}
      touches={{
        ONE: null, // Touch one finger is for walking the cat
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  )
}
