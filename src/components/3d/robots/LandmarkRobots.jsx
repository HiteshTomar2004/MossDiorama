import React from 'react'
import { RetroRobotSprite } from './RetroRobotSprite'

/**
 * LandmarkRobots
 * Renders all 4 animated 2D retro tin-toy cartoon robots stationed at each district landmark.
 * - Created as 2D camera-facing animated billboard sprites (matching the player cat technique).
 * - Exact comic tin-toy art style with stoic rectangular grill jaws and blank staring eyes with centered pupils.
 * - 4-frame sprite animation cycles for idle working motions.
 * - Plays cute robotic 'hmm' on cat approach, working sound & opens overlay on click.
 */
export const LandmarkRobots = () => {
  return (
    <group name="landmark-robots">
      {/* 1. Projects: Tinkering with PCB & Soldering Wand near Runic Monolith */}
      <RetroRobotSprite
        name="projects"
        position={[24.5, 0, -93.5]}
        scale={2.7}
        districtKey="projects"
        workSound="spark"
        fps={4.0}
        shadowRadius={0.8}
      />

      {/* 2. Resume: Presenting Sealed Resume Scroll near Whispering Well */}
      <RetroRobotSprite
        name="resume"
        position={[-95.5, 0, 77.0]}
        scale={2.7}
        districtKey="resume"
        workSound="chime"
        fps={3.5}
        shadowRadius={0.75}
      />

      {/* 3. Contact: Friendly Mailman Robot Waving at Front Porch Stairs */}
      <RetroRobotSprite
        name="contact"
        position={[88.2, 0, 92.2]}
        scale={2.7}
        districtKey="contact"
        workSound="beep"
        fps={4.5}
        shadowRadius={0.8}
      />

      {/* 4. Blog: Scribe Typing on Antique Typewriter 3 Cat Lengths to the Right of Giant Mushroom */}
      <RetroRobotSprite
        name="blog"
        position={[-100.0, 0, -33.5]}
        scale={2.7}
        districtKey="blog"
        workSound="typewriter"
        fps={5.0}
        shadowRadius={0.85}
      />
    </group>
  )
}
