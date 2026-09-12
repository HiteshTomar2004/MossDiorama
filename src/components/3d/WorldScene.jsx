import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraManager } from './CameraManager'
import { EnvironmentTerrain } from './EnvironmentTerrain'
import { RiverWater } from './RiverWater'
import { WoodenFootbridge } from './WoodenFootbridge'
import { Campfire } from './Campfire'
import { CharacterCat } from './CharacterCat'
import { DistrictProjects } from './DistrictProjects'
import { DistrictResume } from './DistrictResume'
import { DistrictBlog } from './DistrictBlog'
import { DistrictContact } from './DistrictContact'
import { InteractiveLeaves } from './InteractiveLeaves'
import { ForestTrees } from './ForestTrees'
import { ForestFlora } from './ForestFlora'
import { InstancedMeadowGrass } from './InstancedMeadowGrass'
import { ParticlesSpores } from './ParticlesSpores'
import { LandmarkRobots } from './robots/LandmarkRobots'
import { WorldFauna } from './fauna/WorldFauna'
import { DirectionalSignboards } from './DirectionalSignboards'
import { MonolithPond } from './MonolithPond'

export const WorldScene = () => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#e6dfd1] overflow-hidden">
      <Canvas
        camera={{ position: [14, 18, 14], fov: 28 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Soft Pale Parchment Watercolor Atmosphere & Fog (Authentic Wayfinder) */}
        <color attach="background" args={['#e6dfd1']} />
        <fog attach="fog" args={['#e6dfd1', 65, 235]} />

        {/* Luminous Warm Ambient & Daylight (Soft, non-bleaching palette) */}
        <ambientLight intensity={1.25} color="#fff9ee" />
        <directionalLight
          position={[45, 80, 35]}
          intensity={1.45}
          color="#fffcf2"
        />
        <hemisphereLight
          color="#ffffff"
          groundColor="#dcd5c7"
          intensity={0.45}
        />

        <Suspense fallback={null}>
          <CameraManager />

          {/* 1. Lush Velvety Terrain with Cobblestones on Rich Dirt Road Foundation */}
          <EnvironmentTerrain />

          {/* 2. Animated Flowing Crystal Fantasy River Water */}
          <RiverWater />

          {/* 2b. Enchanted Storybook Lake */}
          <MonolithPond position={[101.5, 0, -77.0]} />

          {/* 3. Handcrafted Arched Wooden Footbridge spanning the open river */}
          <WoodenFootbridge
            position={[30, 0, -26.5]}
            rotation={[0, 1.31, 0]}
            length={15.5}
            width={6.4}
          />

          {/* 3. Instanced Swaying Meadow Grass */}
          <InstancedMeadowGrass />

          {/* 4. Open-Canopy Forest & Sprite Flora */}
          <ForestTrees />
          <ForestFlora />

          {/* 5. Campsite with Timber Log Benches & Fire Pit */}
          <Campfire position={[0, 0, 0]} />

          {/* 5b. Authentic Cartoon Wooden Directional Signboards at Spawn Trailheads */}
          <DirectionalSignboards />

          {/* 6. Dynamic Fallen Leaves & Player Character */}
          <InteractiveLeaves />
          <CharacterCat position={[1.8, 0, 0.8]} />

          {/* 7. Landmark Sanctuaries matching user sketch */}
          <DistrictProjects position={[28, 0, -98]} />
          <DistrictBlog position={[-108, 0, -34]} />
          <DistrictResume position={[-100, 0, 80]} />
          <DistrictContact position={[86, 0, 88]} />

          {/* 8. Animated Retro Cartoon Robots Stationed at Landmarks */}
          <LandmarkRobots />

          {/* 9. Living Wildlife Fauna: Swimming River Koi, Bank Frogs, Parrots, & Wild Foxes */}
          <WorldFauna />

          {/* 8. Ambient Forest Spores & Floating Dust Motes */}
          <ParticlesSpores />
        </Suspense>
      </Canvas>

      {/* Soft Luminous Parchment Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_72%,rgba(145,130,110,0.18)_100%)]" />
    </div>
  )
}
