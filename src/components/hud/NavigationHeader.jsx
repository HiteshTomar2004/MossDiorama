import React from 'react'
import { Flame, Volume2, VolumeX, Eye, Compass } from 'lucide-react'
import { usePortfolioStore, DISTRICT_COORDINATES } from '../../store/usePortfolioStore'

export const NavigationHeader = () => {
  const {
    activeDistrict,
    setActiveDistrict,
    openOverlay,
    is3DMode,
    toggle3DMode,
    audioPlaying,
    toggleAudio
  } = usePortfolioStore()

  const handleNavClick = (districtId) => {
    setActiveDistrict(districtId)
    if (districtId !== 'hearth') {
      // Also open overlay or let user inspect station
      openOverlay(districtId)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between pointer-events-none select-none">
      {/* Brand Identity / Home Anchor */}
      <div
        onClick={() => handleNavClick('hearth')}
        className="pointer-events-auto flex items-center space-x-2.5 px-3.5 py-2 rounded-xl silksong-card border border-spore-mint/30 hover:border-amber-fire/60 transition-all cursor-pointer group shadow-lg"
      >
        <div className="w-6 h-6 rounded-full bg-amber-fire/20 flex items-center justify-center border border-amber-fire/40 group-hover:scale-110 transition-transform">
          <Flame className="w-3.5 h-3.5 text-amber-fire animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-['Cinzel_Decorative'] text-xs font-bold tracking-[0.25em] text-pale-bone uppercase">
            The Moss Grotto
          </span>
          <span className="font-['Cinzel'] text-[10px] tracking-widest text-amber-fire/80">
            Hitesh · Portfolio
          </span>
        </div>
      </div>

      {/* Center District Fast-Travel Hub */}
      <nav className="pointer-events-auto hidden md:flex items-center space-x-1.5 px-2 py-1.5 rounded-full silksong-card border border-spore-mint/20 shadow-xl">
        {Object.entries(DISTRICT_COORDINATES).map(([key, item]) => {
          const isActive = activeDistrict === key
          return (
            <button
              key={key}
              onClick={() => handleNavClick(key)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-['Cinzel'] tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-amber-fire/25 border border-amber-fire/70 text-amber-fire shadow-[0_0_10px_rgba(223,157,82,0.3)]'
                  : 'text-bone-muted hover:text-pale-bone hover:bg-grotto-900/60'
              }`}
            >
              <span className="text-[11px] select-none text-amber-fire/90">{item.symbol}</span>
              <span>{key}</span>
            </button>
          )
        })}
      </nav>

      {/* Right Controls: Audio & 2D/3D Mode */}
      <div className="pointer-events-auto flex items-center space-x-2">
        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-2 sm:px-3 sm:py-2 rounded-xl silksong-card border transition-all cursor-pointer flex items-center space-x-2 shadow-lg ${
            audioPlaying
              ? 'border-amber-fire/50 text-amber-fire bg-amber-fire/15'
              : 'border-spore-mint/20 text-bone-muted hover:text-pale-bone'
          }`}
          title={audioPlaying ? 'Mute Atmosphere' : 'Play Ambient Atmosphere'}
        >
          {audioPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline text-[11px] font-['Cinzel'] tracking-wider uppercase">
            {audioPlaying ? 'Ambience On' : 'Muted'}
          </span>
        </button>

        {/* 2D / 3D Mode Switch */}
        <button
          onClick={toggle3DMode}
          className="p-2 sm:px-3 sm:py-2 rounded-xl silksong-card border border-spore-mint/20 text-bone-muted hover:text-pale-bone hover:border-spore-mint/50 transition-all cursor-pointer flex items-center space-x-2 shadow-lg"
          title="Toggle between 3D Diorama and 2D Reading View"
        >
          <Eye className="w-4 h-4 text-spore-mint" />
          <span className="hidden sm:inline text-[11px] font-['Cinzel'] tracking-wider uppercase">
            {is3DMode ? '3D Realm' : '2D View'}
          </span>
        </button>
      </div>
    </header>
  )
}
