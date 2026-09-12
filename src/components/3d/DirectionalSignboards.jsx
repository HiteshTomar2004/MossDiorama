import React, { useMemo, useState } from 'react'
import { Billboard, Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { sfx } from '../../utils/sfxPlayer'

/**
 * DirectionalSignboards
 * 4 authentic storybook wooden arrow signboards placed at the trailheads of the campfire spawn clearing:
 * 1. Projects ➔ (Northeast towards Runic Monolith / Footbridge)
 * 2. ⬅ Blog (Northwest towards Bioluminescent Mushroom Grove)
 * 3. ⬅ Resume (Southwest towards Whispering Well)
 * 4. Contact ➔ (Southeast towards Traveler's Cabin)
 * 
 * Features:
 * - High-res hand-drawn vector art matching user's reference illustration
 * - Ground contact shadows & 3D low-poly river stones at each post base
 * - Smooth interactive hover feedback with cursor change, golden firefly sparkles, and floating Wayfinder badge
 * - One-click navigation: sends player cat walking down the trail to that landmark!
 */

const SIGN_CONFIGS = [
  {
    id: 'projects',
    name: 'Projects',
    symbol: '⚒',
    pos: [10.5, 0, -8.5],
    texturePath: '/assets/props/sign_projects.png',
    arrowDir: 'right',
    target: [28.0, 0, -92.5],
    description: 'Runic Monolith',
    shadowScale: [1.35, 0.85, 1],
    stoneColors: ['#5c5650', '#4a443e', '#665e56'],
  },
  {
    id: 'blog',
    name: 'Blog',
    symbol: '🍄',
    pos: [-9.8, 0, -8.3],
    texturePath: '/assets/props/sign_blog.png',
    arrowDir: 'left',
    target: [-98.2, 0, -33.5],
    description: 'Mushroom Grove',
    shadowScale: [1.35, 0.85, 1],
    stoneColors: ['#544e48', '#423d38', '#615a52'],
  },
  {
    id: 'resume',
    name: 'Resume',
    symbol: '📜',
    pos: [-10.8, 0, 5.8],
    texturePath: '/assets/props/sign_resume.png',
    arrowDir: 'left',
    target: [-95.5, 0, 76.8],
    description: 'Whispering Well',
    shadowScale: [1.35, 0.85, 1],
    stoneColors: ['#58524c', '#46403a', '#645d55'],
  },
  {
    id: 'contact',
    name: 'Contact',
    symbol: '🛖',
    pos: [7.2, 0, 9.9],
    texturePath: '/assets/props/sign_contact.png',
    arrowDir: 'right',
    target: [86.8, 0, 93.8],
    description: "Traveler's Cabin",
    shadowScale: [1.35, 0.85, 1],
    stoneColors: ['#5b554f', '#49433d', '#676058'],
  },
]

const SingleSignboard = ({ cfg, texture }) => {
  const [hovered, setHovered] = useState(false)
  const setCatTarget = usePortfolioStore((s) => s.setCatTarget)
  const setActiveDistrict = usePortfolioStore((s) => s.setActiveDistrict)

  const handleClick = (e) => {
    e.stopPropagation()
    sfx.playWood()
    setCatTarget(cfg.target[0], cfg.target[2])
    setActiveDistrict(cfg.id)
  }

  // 3-4 small 3D grounding stones around the base
  const baseStones = useMemo(() => [
    { pos: [-0.35, 0.12, 0.15], scale: [0.32, 0.22, 0.28], color: cfg.stoneColors[0], rot: [0.2, 0.5, 0.1] },
    { pos: [0.32, 0.10, -0.12], scale: [0.28, 0.18, 0.25], color: cfg.stoneColors[1], rot: [-0.1, 1.2, 0.3] },
    { pos: [-0.10, 0.08, -0.22], scale: [0.24, 0.16, 0.22], color: cfg.stoneColors[2], rot: [0.4, -0.6, 0.2] },
  ], [cfg.stoneColors])

  const width = 2.65
  const height = 2.55

  return (
    <group
      position={cfg.pos}
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
    >
      {/* 1. Ground Contact Shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={cfg.shadowScale}
      >
        <circleGeometry args={[0.92, 20]} />
        <meshBasicMaterial
          color="#0a180d"
          transparent
          opacity={0.36}
          depthWrite={false}
        />
      </mesh>

      {/* 2. 3D Low-Poly River Stones around post base for parallax depth */}
      {baseStones.map((stone, idx) => (
        <mesh
          key={`stone-${idx}`}
          position={stone.pos}
          rotation={stone.rot}
          scale={stone.scale}
        >
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={stone.color}
            roughness={0.92}
            metalness={0.08}
          />
        </mesh>
      ))}

      {/* 3. 2D Storybook Wooden Signboard Billboard */}
      <Billboard
        follow
        lockX={false}
        lockY={false}
        lockZ={false}
        position={[0, height * 0.5, 0]}
      >
        <mesh
          scale={[hovered ? width * 1.05 : width, hovered ? height * 1.05 : height, 1]}
          renderOrder={14}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.08}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>

      {/* 4. Golden Firefly Sparkles on Hover */}
      {hovered && (
        <Sparkles
          count={8}
          scale={[2.0, 1.8, 2.0]}
          position={[0, 1.4, 0]}
          size={2.5}
          speed={1.2}
          color="#f59e0b"
        />
      )}

      {/* 5. Floating Wayfinder Badge on Hover */}
      {hovered && (
        <Html position={[0, 2.75, 0]} center distanceFactor={26}>
          <div className="transition-all duration-300 pointer-events-none select-none flex items-center gap-1.5 px-3 py-1 rounded-full silksong-card border border-amber-fire/60 shadow-xl backdrop-blur-md scale-110 opacity-100 -translate-y-1">
            <span className="text-sm">{cfg.symbol}</span>
            <span className="font-['Cinzel'] text-xs font-bold text-pale-bone tracking-wider uppercase">
              {cfg.name}
            </span>
            <span className="text-[10px] font-['Cinzel'] text-amber-fire/80 tracking-normal">
              · {cfg.description}
            </span>
            <span className="text-amber-fire text-xs font-mono font-bold ml-0.5">➔</span>
          </div>
        </Html>
      )}
    </group>
  )
}

export const DirectionalSignboards = () => {
  const loader = useMemo(() => new THREE.TextureLoader(), [])

  // Cache-busted texture loading
  const textures = useMemo(() => {
    return SIGN_CONFIGS.map((cfg) => {
      const tex = loader.load(`${cfg.texturePath}?v=2`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  return (
    <group name="DirectionalSignboards">
      {SIGN_CONFIGS.map((cfg, idx) => (
        <SingleSignboard
          key={cfg.id}
          cfg={cfg}
          texture={textures[idx]}
        />
      ))}
    </group>
  )
}
