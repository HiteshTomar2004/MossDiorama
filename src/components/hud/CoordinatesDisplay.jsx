import React from 'react'
import { usePortfolioStore } from '../../store/usePortfolioStore'

/**
 * CoordinatesDisplay
 * Standalone HUD component for inspecting live world coordinates of the player cat and mouse cursor.
 * Very useful for positioning new props, robots, fauna, landmarks, and obstacle radii.
 */
export const CoordinatesDisplay = ({ className = '' }) => {
  const catCurrentPos = usePortfolioStore((s) => s.catCurrentPos)
  const cursorWorldPos = usePortfolioStore((s) => s.cursorWorldPos)

  const catX = catCurrentPos ? catCurrentPos[0] : 0
  const catZ = catCurrentPos ? catCurrentPos[2] : 0

  return (
    <div
      className={`flex flex-col items-center gap-0.5 bg-black/85 border border-amber-fire/50 rounded-lg px-2.5 py-1.5 shadow-2xl backdrop-blur-md select-all font-mono text-xs ${className}`}
      title="Live World Coordinates (Cat & Aim)"
    >
      <div className="flex items-center gap-1.5 font-bold text-amber-glow">
        <span className="text-amber-fire text-[10px]">🐾 Cat:</span>
        <span>X: {catX.toFixed(1)}</span>
        <span className="text-white/25">|</span>
        <span>Z: {catZ.toFixed(1)}</span>
      </div>

      {cursorWorldPos && (
        <div className="flex items-center gap-1.5 text-[10px] text-spore-mint/90">
          <span>🎯 Aim:</span>
          <span>X: {cursorWorldPos[0].toFixed(1)}</span>
          <span className="text-white/25">|</span>
          <span>Z: {cursorWorldPos[1].toFixed(1)}</span>
        </div>
      )}
    </div>
  )
}

export default CoordinatesDisplay
