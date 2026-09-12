import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { BioluminescentMushroom } from './BioluminescentMushroom'

export const DistrictBlog = ({ position = [-75, 0, 65] }) => {
  const [hovered, setHovered] = useState(false)
  const openOverlay = usePortfolioStore((s) => s.openOverlay)
  const setActiveDistrict = usePortfolioStore((s) => s.setActiveDistrict)

  const handleClick = (e) => {
    e.stopPropagation()
    setActiveDistrict('blog')
    openOverlay('blog')
  }

  return (
    <group
      position={position}
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
      {/* 3D Storybook Bioluminescent Mushroom Grove Landmark */}
      <BioluminescentMushroom position={[0, 0, 0]} onInspect={handleClick} hovered={hovered} />

      {/* Floating Silksong HTML Badge */}
      <Html position={[0, 8.6, 0]} center distanceFactor={28}>
        <div
          className={`transition-all duration-300 transform select-none cursor-pointer ${
            hovered ? 'scale-110 -translate-y-1' : 'opacity-90'
          }`}
        >
          <div className="px-3.5 py-1.5 rounded-full silksong-card border border-spore-mint/40 flex items-center space-x-2 shadow-2xl backdrop-blur-md">
            <span className="text-spore-mint text-xs">🍄</span>
            <span className="font-['Cinzel'] text-xs tracking-widest text-pale-bone uppercase font-bold whitespace-nowrap">
              ◈ 03 · Grove Notes ◈
            </span>
          </div>
        </div>
      </Html>
    </group>
  )
}
