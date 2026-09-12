import React, { useState, useEffect } from 'react'
import { Flame, Volume2, VolumeX, Eye, Box, Sun, Moon, Menu, X, Compass, Sparkles } from 'lucide-react'
import { usePortfolioStore, DISTRICT_COORDINATES } from '../../store/usePortfolioStore'

export const NavigationHeader = () => {
  const {
    activeDistrict,
    setActiveDistrict,
    openOverlay,
    is3DMode,
    toggle3DMode,
    is2DDarkMode,
    toggle2DDarkMode,
    audioPlaying,
    toggleAudio
  } = usePortfolioStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isLight2D = !is3DMode && !is2DDarkMode

  // Scroll spy in 2D reading mode
  useEffect(() => {
    if (is3DMode) return

    const sectionIds = ['hearth', 'projects', 'resume', 'blog', 'contact']
    const handleScroll = () => {
      const scrollY = window.scrollY + 200
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i])
        if (el && el.offsetTop <= scrollY) {
          usePortfolioStore.setState({ activeDistrict: sectionIds[i] })
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [is3DMode])

  const handleNavClick = (districtId) => {
    setActiveDistrict(districtId)
    setMobileMenuOpen(false)

    if (is3DMode) {
      if (districtId !== 'hearth') {
        openOverlay(districtId)
      }
    } else {
      const el = document.getElementById(districtId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  // Card & button theme classes
  const cardClass = isLight2D
    ? 'bg-white/85 backdrop-blur-md border border-neutral-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-neutral-900'
    : 'silksong-card border border-spore-mint/30 shadow-lg text-pale-bone'

  const buttonHoverClass = isLight2D
    ? 'border-neutral-200 hover:border-neutral-400 bg-neutral-100/70 hover:bg-neutral-200/70 text-neutral-700'
    : 'border-spore-mint/20 hover:border-spore-mint/50 bg-grotto-950/60 hover:bg-grotto-900 text-bone-muted hover:text-pale-bone'

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-3.5 py-3 flex items-center justify-between pointer-events-none select-none">
        {/* Brand Identity / Home Anchor */}
        <div
          onClick={() => handleNavClick('hearth')}
          className={`pointer-events-auto flex items-center space-x-2.5 px-3.5 py-2 rounded-xl border transition-all duration-300 cursor-pointer group shadow-sm ${cardClass}`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
              isLight2D
                ? 'bg-neutral-900 text-amber-500 border border-neutral-700'
                : 'bg-amber-fire/20 border border-amber-fire/40 text-amber-fire'
            }`}
          >
            <Flame className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span
              className={`font-['Cinzel_Decorative'] text-xs font-bold tracking-[0.2em] uppercase transition-colors ${
                isLight2D ? 'text-neutral-900' : 'text-pale-bone'
              }`}
            >
              The Moss Grotto
            </span>
            <span
              className={`font-['Cinzel'] text-[10px] tracking-widest ${
                isLight2D ? 'text-neutral-500 font-semibold' : 'text-amber-fire/80'
              }`}
            >
              Hitesh · Portfolio
            </span>
          </div>
        </div>

        {/* Center District Fast-Travel / Section Jump Hub (Desktop) */}
        <nav
          className={`pointer-events-auto hidden md:flex items-center space-x-1 px-2 py-1.5 rounded-full border transition-all duration-300 ${cardClass}`}
        >
          {Object.entries(DISTRICT_COORDINATES).map(([key, item]) => {
            const isActive = activeDistrict === key
            return (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-['Cinzel'] tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? isLight2D
                      ? 'bg-neutral-900 text-white font-bold shadow-sm'
                      : 'bg-amber-fire/25 border border-amber-fire/70 text-amber-fire shadow-[0_0_10px_rgba(223,157,82,0.3)]'
                    : isLight2D
                    ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                    : 'text-bone-muted hover:text-pale-bone hover:bg-grotto-900/60'
                }`}
              >
                <span className="text-[11px] select-none">{item.symbol}</span>
                <span>{key}</span>
              </button>
            )
          })}
        </nav>

        {/* Right Controls: 2D Theme Toggle, Audio, Mode Switch & Mobile Hamburger */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* 2D Dark / Light Mode Switch (Only visible in 2D mode) */}
          {!is3DMode && (
            <button
              onClick={toggle2DDarkMode}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                isLight2D
                  ? 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 shadow-sm'
                  : 'border-spore-mint/30 bg-grotto-900/80 hover:bg-grotto-850 text-spore-mint shadow-md'
              }`}
              title={is2DDarkMode ? 'Switch to White-Gray Light Mode' : 'Switch to Moss Green Dark Mode'}
            >
              {is2DDarkMode ? (
                <Sun className="w-4 h-4 text-amber-glow animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
              <span className="hidden lg:inline text-[11px] font-['Cinzel'] tracking-wider uppercase font-semibold">
                {is2DDarkMode ? 'Moss Dark' : 'White Light'}
              </span>
            </button>
          )}

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
              audioPlaying
                ? isLight2D
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-100 font-bold'
                  : 'border-amber-fire/50 text-amber-fire bg-amber-fire/15'
                : buttonHoverClass
            }`}
            title={audioPlaying ? 'Mute Atmosphere' : 'Play Ambient Atmosphere'}
          >
            {audioPlaying ? (
              <Volume2 className="w-4 h-4 text-amber-fire animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-[11px] font-['Cinzel'] tracking-wider uppercase font-semibold">
              {audioPlaying ? 'Ambience' : 'Muted'}
            </span>
          </button>

          {/* 2D / 3D Mode Switch */}
          <button
            onClick={toggle3DMode}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center space-x-2 shadow-sm ${
              isLight2D
                ? 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
                : 'border-spore-mint/30 bg-spore-mint/15 text-spore-glow hover:bg-spore-mint/25'
            }`}
            title="Toggle between 3D Diorama and 2D Reading View"
          >
            {is3DMode ? <Eye className="w-4 h-4" /> : <Box className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-['Cinzel'] tracking-wider uppercase font-bold">
              {is3DMode ? '3D Realm' : '2D View'}
            </span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border transition-all duration-200 cursor-pointer ${buttonHoverClass}`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden flex flex-col justify-start pt-20 px-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full rounded-2xl p-4 border space-y-2 shadow-2xl ${
              isLight2D
                ? 'bg-white border-neutral-200 text-neutral-900'
                : 'silksong-card border-spore-mint/30 text-pale-bone'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-spore-mint/20 text-xs font-['Cinzel'] tracking-wider uppercase">
              <span className="font-bold">Select Sanctuary</span>
              <span className="text-[10px] text-neutral-500 dark:text-bone-muted">Jump to section</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {Object.entries(DISTRICT_COORDINATES).map(([key, item]) => {
                const isActive = activeDistrict === key
                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(key)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-['Cinzel'] tracking-wider uppercase transition-all ${
                      isActive
                        ? isLight2D
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'bg-amber-fire/20 border border-amber-fire/60 text-amber-fire'
                        : isLight2D
                        ? 'hover:bg-neutral-100 text-neutral-700'
                        : 'hover:bg-grotto-900/80 text-bone-muted'
                    }`}
                  >
                    <span className="text-sm select-none">{item.symbol}</span>
                    <span className="font-semibold">{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
