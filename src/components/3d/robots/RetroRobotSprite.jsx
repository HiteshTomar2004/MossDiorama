import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

/**
 * RetroRobotSprite
 * 2D Animated Billboard Sprite for the 4 Landmark Robots.
 * - Rendered as a camera-facing 2D billboard quad (identical technique to CharacterCat)
 * - Uses 4-frame sprite animation matching the user's retro tin-toy comic reference
 * - Stoic rectangular grill jaws and blank staring eyes with centered pupils
 * - Plays cute robotic 'hmm' sound when the cat approaches
 * - Plays distinct mechanical work sound and opens district overlay on click
 */
export const RetroRobotSprite = ({
  name,
  position = [0, 0, 0],
  scale = 2.4,
  districtKey,
  workSound,
  fps = 4.5,
  shadowRadius = 0.75,
}) => {
  const meshRef = useRef()
  const matRef = useRef()
  const [hovered, setHovered] = useState(false)

  const openOverlay = usePortfolioStore((s) => s.openOverlay)
  const setActiveDistrict = usePortfolioStore((s) => s.setActiveDistrict)

  // 1. Preload 4-frame sprite animation textures
  const loader = useMemo(() => new THREE.TextureLoader(), [])
  const textures = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const tex = loader.load(`/assets/robots/${name}_${i}.png`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [name, loader])

  const frameIndexRef = useRef(0)
  const timerRef = useRef(0)
  const frameDuration = 1.0 / fps

  useFrame((_, delta) => {
    // 2. Animate sprite frames
    timerRef.current += delta
    if (timerRef.current >= frameDuration) {
      timerRef.current = timerRef.current % frameDuration
      frameIndexRef.current = (frameIndexRef.current + 1) % textures.length
      if (matRef.current) {
        matRef.current.map = textures[frameIndexRef.current]
        matRef.current.needsUpdate = true
      }
    }

    // 3. Cat proximity detection: emit cute inquisitive 'hmm' within 4.2 units
    const catPos = usePortfolioStore.getState().catCurrentPos
    if (catPos) {
      const dx = catPos[0] - position[0]
      const dz = catPos[2] - position[2]
      const distSq = dx * dx + dz * dz
      if (distSq < 17.6) {
        sfx.playRobotHmm()
      }
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (workSound) {
      sfx.playRobotWork(workSound)
    }
    if (districtKey) {
      setActiveDistrict(districtKey)
      openOverlay(districtKey)
    }
  }

  return (
    <group position={position}>
      {/* Soft Ground Contact Shadow (like the cat's shadow) */}
      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
        renderOrder={10}
      >
        <circleGeometry args={[shadowRadius, 24]} />
        <meshBasicMaterial
          color="#081408"
          transparent
          opacity={0.32}
          depthTest={true}
          depthWrite={false}
          polygonOffset={true}
          polygonOffsetFactor={-3}
          polygonOffsetUnits={-3}
        />
      </mesh>

      {/* 2D Billboarded Animated Robot Quad */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <mesh
          ref={meshRef}
          position={[0, scale * 0.48, 0]}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = 'auto'
          }}
          scale={hovered ? [scale * 1.06, scale * 1.06, 1] : [scale, scale, 1]}
          renderOrder={20}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            ref={matRef}
            map={textures[0]}
            transparent
            alphaTest={0.06}
            side={THREE.DoubleSide}
            depthWrite={true}
          />
        </mesh>
      </Billboard>
    </group>
  )
}
