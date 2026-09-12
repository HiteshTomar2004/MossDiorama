import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// -------------------------------------------------------------
// Wind Atmosphere System (Wayfinder WindAtmosphereSystem)
// Curved procedural wind ribbons gracefully sweeping across the canopy
// -------------------------------------------------------------
const SingleWindRibbon = ({ initialSeed = 0 }) => {
  const meshRef = useRef()
  const progressRef = useRef(initialSeed)

  // Pre-generate smooth winding wind curve
  const { geometry, length } = useMemo(() => {
    const pts = []
    const ptsCount = 28
    const baseAngle = Math.random() * Math.PI * 2
    for (let i = 0; i < ptsCount; i++) {
      const t = i / (ptsCount - 1)
      const x = Math.cos(baseAngle) * (t * 45) + Math.sin(t * 8) * 4.5
      const z = Math.sin(baseAngle) * (t * 45) + Math.cos(t * 7) * 3.5
      const y = Math.sin(t * Math.PI) * 1.8 + 1.2
      pts.push(new THREE.Vector3(x, y, z))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const geo = new THREE.TubeGeometry(curve, 32, 0.12, 6, false)
    return { geometry: geo, length: 45 }
  }, [])

  // Material with soft white/mint glow
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#e6fffa',
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  // Position & movement
  const spawnData = useRef({
    origin: new THREE.Vector3((Math.random() - 0.5) * 180, 0, (Math.random() - 0.5) * 180),
    speed: 0.18 + Math.random() * 0.12,
    lifetime: 4.5 + Math.random() * 2.0,
    elapsed: initialSeed * 4.5,
  })

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const sd = spawnData.current
    sd.elapsed += delta * sd.speed

    if (sd.elapsed > sd.lifetime) {
      sd.elapsed = 0
      // Respawn near new meadow coordinates
      sd.origin.set((Math.random() - 0.5) * 180, 0, (Math.random() - 0.5) * 180)
    }

    const t = sd.elapsed / sd.lifetime
    // Fade in and out
    const alpha = Math.sin(t * Math.PI) * 0.45
    material.opacity = alpha

    // Move forward along breeze
    meshRef.current.position.set(
      sd.origin.x + t * 25,
      sd.origin.y + Math.sin(t * Math.PI) * 1.5,
      sd.origin.z + t * 18
    )
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}

export const WindAtmosphere = () => {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <SingleWindRibbon key={i} initialSeed={i / 8} />
      ))}
    </group>
  )
}
