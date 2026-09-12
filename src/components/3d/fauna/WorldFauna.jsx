import React from 'react'
import { AnimalSpawnSystem } from './AnimalSpawnSystem'

/**
 * WorldFauna
 * Living wildlife ecosystem coordinator directly modeled on Wayfinder's AnimalSpawnSystem:
 * - Dynamic, movement-based procedural animal spawning & lifecycle
 * - River Koi flowing head-first downstream in the direction of the river current
 * - Living frogs on dry shoreline stones with melodic water-droplet croaks and proximity hops
 * - Songbirds that fly in, perch on rails/benches, and flutter away into the forest canopy when approached
 * - Wild foxes that nap, sit alert, and scamper into the tree line
 */
export const WorldFauna = () => {
  return (
    <group name="WorldFauna">
      <AnimalSpawnSystem />
    </group>
  )
}
