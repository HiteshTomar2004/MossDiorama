import React from 'react'
import { Sparkles } from '@react-three/drei'

export const ParticlesSpores = () => {
  return (
    <group>
      {/* Wayfinder Floating White Dust Motes & Spores across entire 280x280 forest */}
      <Sparkles
        count={90}
        scale={[240, 24, 240]}
        position={[0, 8, 0]}
        size={2.8}
        speed={0.35}
        noise={0.9}
        color="#ffffff"
        opacity={0.85}
      />

      {/* Airborne Golden Autumn Leaf Flecks drifting through canopy */}
      <Sparkles
        count={50}
        scale={[220, 18, 220]}
        position={[0, 6, 0]}
        size={3.4}
        speed={0.48}
        noise={1.4}
        color="#f59e0b"
        opacity={0.75}
      />

      {/* Glowing Mint Spore Flecks near clearings and paths */}
      <Sparkles
        count={30}
        scale={[180, 14, 180]}
        position={[0, 4, 0]}
        size={2.4}
        speed={0.28}
        noise={0.7}
        color="#a7f3d0"
        opacity={0.65}
      />
    </group>
  )
}
