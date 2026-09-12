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
    ? 'bg-white/90 backdrop-blur-md border border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-neutral-900'
    : 'bg-[#0f1412]/90 backdrop-blur-md border border-[#222e28] shadow-[0_6px_24px_rgba(0,0,0,0.4)] text-[#f0ede6]'

  const buttonHoverClass = isLight2D
    ? 'border-neutral-200 hover:border-neutral-400 bg-neutral-100/80 hover:bg-neutral-200/80 text-neutral-700'
    : 'border-[#222e28] hover:border-[#384840] bg-[#141b17] hover:bg-[#1a231e] text-[#a4b2aa] hover:text-[#f0ede6]'

  const navLabels = {
    hearth: 'Hearth',
    projects: 'Projects',
    resume: 'Resume',
    blog: 'Blog',
    contact: 'Contact'
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between pointer-events-none select-none">
        {/* Brand Identity / Home Anchor */}
        <div
          onClick={() => handleNavClick('hearth')}
          className={`pointer-events-auto flex items-center space-x-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border transition-all duration-300 cursor-pointer group shadow-sm ${cardClass}`}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
              isLight2D
                ? 'bg-neutral-900 text-amber-500 border border-neutral-700'
                : 'bg-[#c89658]/20 border border-[#c89658]/50 text-[#e4b77d]'
            }`}
          >
            <Flame className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="flex flex-col">
            <span
              className={`font-['Cinzel_Decorative'] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-colors ${
                isLight2D ? 'text-neutral-900' : 'text-[#f0ede6]'
              }`}
            >
              The Moss Grotto
            </span>
            <span
              className={`font-['Cinzel'] text-[11px] sm:text-xs tracking-wider ${
                isLight2D ? 'text-neutral-500 font-semibold' : 'text-[#c89658] font-medium'
              }`}
            >
              Hitesh · Portfolio
            </span>
          </div>
        </div>

        {/* Center District Fast-Travel / Section Jump Hub (Desktop) - Large, No Emojis */}
        <nav
          className={`pointer-events-auto hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-full border transition-all duration-300 ${cardClass}`}
        >
          {Object.entries(DISTRICT_COORDINATES).map(([key, item]) => {
            const isActive = activeDistrict === key
            const label = navLabels[key] || item.name
            return (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-['Cinzel'] tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? isLight2D
                      ? 'bg-neutral-900 text-white font-bold shadow-sm'
                      : 'bg-[#233129] border border-[#3e5648] text-[#f0ede6] font-bold shadow-[0_0_12px_rgba(35,49,41,0.6)]'
                    : isLight2D
                    ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 font-medium'
                    : 'text-[#8e9f95] hover:text-[#f0ede6] hover:bg-[#18211c] font-medium'
                }`}
              >
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right Controls: 2D Theme Toggle, Audio, Mode Switch & Mobile Hamburger */}
        <div className="pointer-events-auto flex items-center space-x-2 sm:space-x-3">
          {/* 2D Dark / Light Mode Switch (Only visible in 2D mode) */}
          {!is3DMode && (
            <button
              onClick={toggle2DDarkMode}
              className={`p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                isLight2D
                  ? 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 shadow-sm'
                  : 'border-[#293730] bg-[#141b17] hover:bg-[#1c2620] text-[#c2d1c8] shadow-md'
              }`}
              title={is2DDarkMode ? 'Switch to White-Gray Light Mode' : 'Switch to Slate Dark Mode'}
            >
              {is2DDarkMode ? (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#e4b77d]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-700" />
              )}
              <span className="hidden lg:inline text-xs sm:text-sm font-['Cinzel'] tracking-wider uppercase font-semibold">
                {is2DDarkMode ? 'Dark' : 'Light'}
              </span>
            </button>
          )}

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
              audioPlaying
                ? isLight2D
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-100 font-bold'
                  : 'border-[#c89658]/60 text-[#e4b77d] bg-[#c89658]/15'
                : buttonHoverClass
            }`}
            title={audioPlaying ? 'Mute Atmosphere' : 'Play Ambient Atmosphere'}
          >
            {audioPlaying ? (
              <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            )}
            <span className="hidden sm:inline text-xs sm:text-sm font-['Cinzel'] tracking-wider uppercase font-semibold">
              {audioPlaying ? 'Sound' : 'Mute'}
            </span>
          </button>

          {/* 2D / 3D Mode Switch */}
          <button
            onClick={toggle3DMode}
            className={`p-2.5 sm:px-4.5 sm:py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center space-x-2 shadow-sm ${
              isLight2D
                ? 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800'
                : 'border-[#384840] bg-[#1a241f] text-[#f0ede6] hover:bg-[#233129]'
            }`}
            title="Toggle between 3D Diorama and 2D Reading View"
          >
            {is3DMode ? <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Box className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#e4b77d]" />}
            <span className="hidden sm:inline text-xs sm:text-sm font-['Cinzel'] tracking-wider uppercase font-bold">
              {is3DMode ? '3D Realm' : '2D View'}
            </span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${buttonHoverClass}`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer - Enlarged, No Emojis */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-md md:hidden flex flex-col justify-start pt-24 px-5 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full rounded-2xl p-5 border space-y-3 shadow-2xl ${
              isLight2D
                ? 'bg-white border-neutral-200 text-neutral-900'
                : 'bg-[#0f1412] border-[#222e28] text-[#f0ede6]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-[#222e28] text-xs font-['Cinzel'] tracking-widest uppercase">
              <span className="font-bold">Navigation</span>
              <span className="text-[11px] text-neutral-500 dark:text-[#8e9f95]">Select Sanctuary</span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {Object.entries(DISTRICT_COORDINATES).map(([key, item]) => {
                const isActive = activeDistrict === key
                const label = navLabels[key] || item.name
                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-['Cinzel'] tracking-wider uppercase transition-all ${
                      isActive
                        ? isLight2D
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'bg-[#233129] border border-[#3e5648] text-[#f0ede6] font-bold'
                        : isLight2D
                        ? 'hover:bg-neutral-100 text-neutral-700'
                        : 'hover:bg-[#18211c] text-[#a4b2aa]'
                    }`}
                  >
                    <span className="font-semibold">{label}</span>
                    <span className="text-xs text-neutral-400 dark:text-[#52645a]">◈</span>
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
