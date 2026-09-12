import React, { useMemo } from 'react'
import { usePortfolioStore, DISTRICT_COORDINATES } from '../../store/usePortfolioStore'

// ----------------------------------------------------------------------
// Screen/Camera-Aligned Radar Projection (Rotated 45° Clockwise)
// Matches the isometric camera perspective:
// - Screen Forward (-X, -Z) -> Up on Radar
// - Screen Right (+X, -Z)   -> Right on Radar
// - Screen Down (+X, +Z)    -> Down on Radar (Traveler's Cabin)
// - Screen Left (-X, +Z)    -> Left on Radar (Whispering Well)
// ----------------------------------------------------------------------
const RADAR_RAD = (45 * Math.PI) / 180
const COS_R = Math.cos(RADAR_RAD)
const SIN_R = Math.sin(RADAR_RAD)

export function worldToRadar(x, z) {
  // 45° clockwise rotation
  const rx = x * COS_R - z * SIN_R
  const ry = x * SIN_R + z * COS_R

  // Map ~125 world units to 30% disc radius
  const scale = 30 / 125
  let dx = rx * scale
  let dy = ry * scale

  // Circular disc boundary constraint (34% max radius)
  const dist = Math.hypot(dx, dy)
  const maxR = 34
  if (dist > maxR) {
    dx = (dx / dist) * maxR
    dy = (dy / dist) * maxR
  }

  return {
    left: `${50 + dx}%`,
    top: `${50 + dy}%`,
  }
}

export const MinimapCompass = () => {
  const { activeDistrict, setActiveDistrict, openOverlay, catCurrentPos, setCatTarget, cursorWorldPos } = usePortfolioStore()

  // Live Cat marker position
  const catX = catCurrentPos ? catCurrentPos[0] : 0
  const catZ = catCurrentPos ? catCurrentPos[2] : 0

  // 1. Dynamic Landmark Positions (Derived with 100% mathematical precision from 3D world coords)
  const districtPositions = useMemo(() => {
    const map = {}
    for (const [key, item] of Object.entries(DISTRICT_COORDINATES)) {
      map[key] = worldToRadar(item.x, item.z)
    }
    return map
  }, [])

  // 2. Live Cat Marker Position (Uses identical formula: ZERO pixel offset when standing at any landmark!)
  const catRadarPos = useMemo(() => {
    return worldToRadar(catX, catZ)
  }, [catX, catZ])

  // Click anywhere on radar to steer cat in that direction (exact inverse 45° un-rotation)
  const handleRadarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = (e.clientX - rect.left) / rect.width - 0.5
    const clickY = (e.clientY - rect.top) / rect.height - 0.5

    const scaleInv = 125 / 0.30
    const rx = clickX * scaleInv
    const ry = clickY * scaleInv

    const targetX = rx * COS_R + ry * SIN_R
    const targetZ = -rx * SIN_R + ry * COS_R
    setCatTarget([targetX, 0, targetZ])
  }

  // Click specific district node: steer cat directly to that sanctuary's approach landing
  const handleSpotClick = (e, key, item) => {
    e.stopPropagation()
    setActiveDistrict(key)
    const targetX = item.stopX ?? item.x
    const targetZ = item.stopZ ?? item.z
    setCatTarget([targetX, 0, targetZ])
    const distToDistrict = Math.hypot(catX - item.x, catZ - item.z)
    if (distToDistrict < 22 && key !== 'hearth') {
      openOverlay(key)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 hidden sm:flex flex-col items-center pointer-events-none select-none">
      <div
        onClick={handleRadarClick}
        title="Click on radar to steer cat · Click icons to travel"
        className="relative w-28 h-28 rounded-full silksong-card border border-spore-mint/30 shadow-2xl p-2 flex items-center justify-center pointer-events-auto cursor-crosshair overflow-hidden"
      >
        {/* Cardinal Direction Indicators aligned with rotated world axes */}
        <span
          style={{ left: '80%', top: '20%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-['Cinzel'] text-amber-fire font-bold pointer-events-none drop-shadow-[0_0_4px_rgba(223,157,82,0.8)]"
          title="North (Towards Monolith)"
        >
          N
        </span>
        <span
          style={{ left: '80%', top: '80%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-['Cinzel'] text-bone-muted/60 font-semibold pointer-events-none"
          title="East"
        >
          E
        </span>
        <span
          style={{ left: '20%', top: '80%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-['Cinzel'] text-bone-muted/60 font-semibold pointer-events-none"
          title="South"
        >
          S
        </span>
        <span
          style={{ left: '20%', top: '20%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] font-['Cinzel'] text-bone-muted/60 font-semibold pointer-events-none"
          title="West (Towards Mushroom Grove)"
        >
          W
        </span>

        {/* Concentric subtle radar rings */}
        <div className="absolute inset-3 rounded-full border border-spore-mint/10 pointer-events-none" />
        <div className="absolute inset-7 rounded-full border border-spore-mint/15 pointer-events-none" />

        {/* Subtle crosshair guide lines along cardinal axes */}
        <div className="absolute inset-x-3 top-1/2 h-[1px] bg-spore-mint/10 pointer-events-none rotate-45" />
        <div className="absolute inset-y-3 left-1/2 w-[1px] bg-spore-mint/10 pointer-events-none rotate-45" />

        {/* District nodes accurately plotted in screen-aligned coordinates */}
        {Object.entries(DISTRICT_COORDINATES).map(([key, item]) => {
          const pos = districtPositions[key] || { left: '50%', top: '50%' }
          const distToDistrict = Math.hypot(catX - item.x, catZ - item.z)
          const isNearby = distToDistrict < 25
          const isActive = activeDistrict === key
          const isHearth = key === 'hearth'

          return (
            <button
              key={key}
              onClick={(e) => handleSpotClick(e, key, item)}
              title={`${item.name} (${item.symbol}) - Click to walk here`}
              style={{ left: pos.left, top: pos.top }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isHearth
                  ? 'w-4 h-4 bg-amber-fire border border-amber-glow shadow-[0_0_10px_rgba(223,157,82,0.9)] z-10'
                  : isNearby || isActive
                  ? 'w-4 h-4 bg-scarf-crimson border border-white shadow-[0_0_12px_rgba(201,59,59,0.9)] scale-110 z-20'
                  : 'w-3 h-3 bg-spore-mint/70 hover:bg-spore-mint hover:scale-125 border border-spore-mint/40 z-10'
              }`}
            >
              <span className="text-[9px] leading-none pointer-events-none select-none">
                {isHearth ? '🔥' : item.symbol}
              </span>
            </button>
          )
        })}

        {/* Live Player Cat Radar Indicator (Perfect 1:1 Overlap with Landmarks) */}
        <div
          style={{ left: catRadarPos.left, top: catRadarPos.top }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center transition-all duration-75"
        >
          {/* Subtle breathing radar ring */}
          <div className="absolute w-5 h-5 rounded-full bg-scarf-crimson/30 animate-ping" />
          {/* Cat icon pip */}
          <div className="relative w-3 h-3 rounded-full bg-[#121214] border-2 border-scarf-crimson shadow-[0_0_8px_rgba(201,59,59,0.9)] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-pale-bone" />
          </div>
        </div>
      </div>

      <span className="mt-1.5 font-['Cinzel'] text-[10px] tracking-widest text-bone-muted/70 uppercase">
        ◈ Realm Radar ◈
      </span>

      {/* Live World Coordinates Display */}
      <div className="mt-1.5 flex flex-col items-center gap-0.5 bg-black/80 border border-amber-fire/50 rounded-lg px-2.5 py-1 shadow-2xl backdrop-blur-md select-all">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-glow">
          <span className="text-amber-fire text-[10px]">🐾 Cat:</span>
          <span>X: {catX.toFixed(1)}</span>
          <span className="text-white/20">|</span>
          <span>Z: {catZ.toFixed(1)}</span>
        </div>
        {cursorWorldPos && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-spore-mint/90">
            <span>🎯 Aim:</span>
            <span>X: {cursorWorldPos[0].toFixed(1)}</span>
            <span className="text-white/20">|</span>
            <span>Z: {cursorWorldPos[1].toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
