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

    // Ensure catCurrentPos has valid finite coordinates
    const catX = Number.isFinite(catCurrentPos[0]) ? catCurrentPos[0] : 2.0
    const catZ = Number.isFinite(catCurrentPos[2]) ? catCurrentPos[2] : 1.2
    const catVec = new THREE.Vector3(catX, 0, catZ)
    const target = controlsRef.current.target

    // Auto-recover if camera or target ever has NaN coordinates
    if (!Number.isFinite(camera.position.x) || !Number.isFinite(target.x)) {
      target.set(catX, 0, catZ)
      camera.position.set(catX + 12.0, 18.0, catZ + 12.8)
      camera.lookAt(target)
      controlsRef.current.update()
      return
    }

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

    // Safety distance recovery: if camera is ever pulled or glitched beyond visible bounds
    const distToTarget = camera.position.distanceTo(target)
    if (distToTarget > 52 || distToTarget < 5) {
      camera.position.set(catVec.x + 12.0, 18.0, catVec.z + 12.8)
      target.copy(catVec)
    }

    controlsRef.current.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[2.0, 0, 1.2]}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={8}
      maxDistance={48} // Never zoom out into the fog!
      minPolarAngle={0.08} // Prevent gimbal flipping at exact vertical zenith
      maxPolarAngle={Math.PI / 2 - 0.06} // Strict clamp (~86.5°): camera can NEVER orbit under base terrain!
      mouseButtons={{
        LEFT: null, // Left click is reserved for walking/steering the cat!
        MIDDLE: null, // Middle click disabled to prevent camera loss
        RIGHT: THREE.MOUSE.ROTATE, // Right click rotates/orbits the camera freely around cat
      }}
      touches={{
        ONE: null, // Touch one finger is for walking the cat
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      }}
    />
  )
}
