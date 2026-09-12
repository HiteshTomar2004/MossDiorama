import React, { useState, useEffect } from 'react'
import { usePortfolioStore } from './store/usePortfolioStore'
import { WorldScene } from './components/3d/WorldScene'
import { NavigationHeader } from './components/hud/NavigationHeader'
import { MinimapCompass } from './components/hud/MinimapCompass'
import { AudioController } from './components/hud/AudioController'
import { OverlayProjects } from './components/overlays/OverlayProjects'
import { OverlayResume } from './components/overlays/OverlayResume'
import { OverlayBlog } from './components/overlays/OverlayBlog'
import { OverlayContact } from './components/overlays/OverlayContact'
import { FullReadingView } from './components/overlays/FullReadingView'
import { Compass, Sparkles } from 'lucide-react'

export function App() {
  const is3DMode = usePortfolioStore((s) => s.is3DMode)
  const is2DDarkMode = usePortfolioStore((s) => s.is2DDarkMode)
  const activeOverlay = usePortfolioStore((s) => s.activeOverlay)
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  const isLight2D = !is3DMode && !is2DDarkMode

  return (
    <div
      className={`relative min-h-screen transition-colors duration-300 ${
        isLight2D
          ? 'bg-[#fcfbf9] text-neutral-900 font-["Newsreader"] selection:bg-neutral-900 selection:text-white'
          : 'bg-grotto-950 text-pale-bone font-["Alegreya"] selection:bg-amber-fire/30 selection:text-amber-glow'
      }`}
    >
      {/* HUD Navigation Header */}
      <NavigationHeader />

      {/* Procedural Ambient Audio Synthesizer */}
      <AudioController />

      {/* Main View: 3D Isometric Realm OR 2D Reading View */}
      {is3DMode ? (
        <>
          <WorldScene />
          <MinimapCompass />

          {/* Interactive Navigation Hint */}
          {showHint && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-1000 animate-fadeIn">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full silksong-card border border-spore-mint/30 shadow-2xl backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-fire animate-spin" />
                <span className="font-['Cinzel'] text-xs tracking-wider text-pale-bone">
                  Hold Left Click to steer the cat · Right Click to orbit camera · Middle Click to pan
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <FullReadingView />
      )}

      {/* 2D Interactive Overlays */}
      {activeOverlay === 'projects' && <OverlayProjects />}
      {activeOverlay === 'resume' && <OverlayResume />}
      {activeOverlay === 'blog' && <OverlayBlog />}
      {activeOverlay === 'contact' && <OverlayContact />}
    </div>
  )
}

export default App
