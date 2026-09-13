import React, { useState, useEffect } from 'react'
import {
  Volume2,
  VolumeX,
  Eye,
  Box,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react'
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
    toggleAudio,
    isSpotifyVisible,
    toggleSpotifyVisible
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

  const navLabels = {
    hearth: 'Home',
    projects: 'Projects',
    blog: 'Notes',
    resume: 'Resume',
    contact: 'Contact'
  }

  // Card & button theme classes from start
  const centerNavShellClass = is3DMode
    ? 'bg-[#141816]/85 backdrop-blur-md border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-[#f0ede6]'
    : isLight2D
    ? 'bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-sm text-neutral-900'
    : 'bg-[#121416]/95 backdrop-blur-md border border-white/[0.08] shadow-lg text-[#f4f4f6]'

  const buttonHoverClass = isLight2D
    ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
    : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-neutral-100'

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between pointer-events-none select-none">
        {/* Top-Left: Empty spacer keeps layout clean with name button removed */}
        <div />

        {/* Center District Navigation Capsule (Dead-center on screen) */}
        <nav
          className={`pointer-events-auto hidden md:flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-full border transition-all duration-300 absolute left-1/2 -translate-x-1/2 ${centerNavShellClass}`}
        >
          {Object.entries(DISTRICT_COORDINATES).map(([key, item]) => {
            const isActive = activeDistrict === key
            const label = navLabels[key] || item.name
            return (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-['Cinzel'] tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? is3DMode
                      ? 'bg-[#f0ede6] text-[#121514] font-bold shadow-[0_2px_10px_rgba(0,0,0,0.25)]'
                      : isLight2D
                      ? 'bg-neutral-900 text-white font-bold shadow-sm'
                      : 'bg-white/[0.16] text-white font-bold shadow-sm'
                    : isLight2D
                    ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80 font-medium'
                    : is3DMode
                    ? 'text-[#9ca8a1] hover:text-[#f0ede6] hover:bg-white/[0.08] font-medium'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.06] font-medium'
                }`}
              >
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right Controls: Exactly as at start for Mute, Spotify, and Mode Toggle */}
        <div className="pointer-events-auto flex items-center space-x-2 sm:space-x-2.5 ml-auto">
          {/* 2D Dark / Light Mode Switch (Only visible in 2D mode) */}
          {!is3DMode && (
            <button
              onClick={toggle2DDarkMode}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
                isLight2D
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white'
              }`}
              title={is2DDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {is2DDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700" />
              )}
              <span className="hidden lg:inline text-xs font-['Cinzel'] tracking-wider uppercase font-semibold">
                {is2DDarkMode ? 'Dark' : 'Light'}
              </span>
            </button>
          )}

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
              audioPlaying
                ? isLight2D
                  ? 'bg-neutral-200 text-neutral-900 border-neutral-300 font-semibold'
                  : 'bg-[#141816]/90 text-amber-300 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.2)] font-semibold'
                : isLight2D
                ? 'bg-white/95 hover:bg-neutral-100 text-neutral-700 border-neutral-200/90'
                : 'bg-[#141816]/85 hover:bg-[#1c221f] text-[#d4ded7] hover:text-white border-white/[0.12] hover:border-white/25'
            }`}
            title={audioPlaying ? 'Mute Atmosphere' : 'Play Ambient Atmosphere'}
          >
            {audioPlaying ? (
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-xs font-['Cinzel'] tracking-wider uppercase font-semibold">
              {audioPlaying ? 'Sound' : 'Mute'}
            </span>
          </button>

          {/* Spotify Player Toggle */}
          <button
            onClick={toggleSpotifyVisible}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
              isSpotifyVisible
                ? isLight2D
                  ? 'bg-[#1db954]/20 text-[#1db954] font-semibold border-[#1db954]/40 shadow-xs'
                  : 'bg-[#141816]/90 text-[#1db954] font-semibold border-[#1db954]/40 shadow-[0_0_10px_rgba(29,185,84,0.25)]'
                : isLight2D
                ? 'bg-white/95 hover:bg-neutral-100 text-neutral-700 border-neutral-200/90'
                : 'bg-[#141816]/85 hover:bg-[#1c221f] text-[#d4ded7] hover:text-[#1db954] border-white/[0.12] hover:border-white/25'
            }`}
            title={isSpotifyVisible ? 'Hide Spotify Player' : 'Open Spotify Player'}
          >
            <svg className="w-4 h-4 fill-[#1db954] shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="hidden sm:inline text-xs font-['Cinzel'] tracking-wider uppercase font-semibold">
              Spotify
            </span>
          </button>

          {/* 2D / 3D Mode Switch (Primary CTA) */}
          <button
            onClick={toggle3DMode}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center space-x-1.5 font-semibold text-xs sm:text-sm font-['Cinzel'] tracking-wider uppercase shadow-sm ${
              isLight2D
                ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                : 'bg-neutral-100 text-neutral-950 hover:bg-white'
            }`}
            title="Toggle between 3D Diorama and 2D Reading View"
          >
            {is3DMode ? <Eye className="w-4 h-4" /> : <Box className="w-4 h-4 text-amber-600 dark:text-amber-600" />}
            <span className="hidden sm:inline">
              {is3DMode ? '3D Realm' : '2D View'}
            </span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl transition-all duration-200 cursor-pointer border shadow-sm ${
              isLight2D
                ? 'bg-white/95 hover:bg-neutral-100 text-neutral-800 border-neutral-200/90'
                : 'bg-[#141816]/85 hover:bg-[#1c221f] text-neutral-200 hover:text-white border-white/[0.12]'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/75 backdrop-blur-md md:hidden flex flex-col justify-start pt-20 px-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm mx-auto rounded-2xl p-5 border space-y-3 shadow-2xl ${
              isLight2D
                ? 'bg-white border-neutral-200 text-neutral-900'
                : 'bg-[#101412] border-white/[0.12] text-[#f4f4f6]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-['Cinzel'] tracking-widest uppercase">
              <span className="font-bold text-amber-fire">◈ Navigation ◈</span>
              <span className="text-[11px] text-neutral-400">Select Section</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {Object.entries(DISTRICT_COORDINATES).map(([key, item]) => {
                const isActive = activeDistrict === key
                const label = navLabels[key] || item.name

                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(key)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-['Cinzel'] tracking-wider uppercase transition-all ${
                      isActive
                        ? is3DMode
                          ? 'bg-white text-[#121514] font-bold shadow-sm'
                          : isLight2D
                          ? 'bg-neutral-900 text-white font-bold'
                          : 'bg-white/[0.14] text-white font-bold'
                        : isLight2D
                        ? 'hover:bg-neutral-100 text-neutral-700'
                        : 'hover:bg-white/[0.06] text-neutral-300'
                    }`}
                  >
                    <span className="font-semibold">{label}</span>
                    {isActive && <span className="text-xs text-amber-400">●</span>}
                  </button>
                )
              })}
            </div>

            {/* Mobile Sound & Spotify Quick Controls */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center space-x-2">
              <button
                onClick={() => {
                  toggleAudio()
                  setMobileMenuOpen(false)
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-['Cinzel'] tracking-wider uppercase font-semibold transition-all ${
                  audioPlaying
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : isLight2D
                    ? 'bg-neutral-100 text-neutral-700'
                    : 'bg-white/[0.06] text-neutral-300'
                }`}
              >
                {audioPlaying ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{audioPlaying ? 'Sound' : 'Mute'}</span>
              </button>

              <button
                onClick={() => {
                  toggleSpotifyVisible()
                  setMobileMenuOpen(false)
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-['Cinzel'] tracking-wider uppercase font-semibold transition-all ${
                  isSpotifyVisible
                    ? 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30'
                    : isLight2D
                    ? 'bg-neutral-100 text-neutral-700'
                    : 'bg-white/[0.06] text-neutral-300'
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-[#1db954]" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span>Spotify</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


