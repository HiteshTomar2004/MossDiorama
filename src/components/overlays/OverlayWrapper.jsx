import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { usePortfolioStore } from '../../store/usePortfolioStore'

export const OverlayWrapper = ({ title, symbol, children }) => {
  const closeOverlay = usePortfolioStore((s) => s.closeOverlay)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeOverlay()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeOverlay])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Container with Silksong stone card styling */}
      <div 
        className="relative w-full max-w-4xl max-h-[88vh] flex flex-col silksong-card rounded-xl overflow-hidden shadow-2xl border border-spore-mint/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ornate corner filigree accents */}
        <div className="absolute top-2 left-2 text-spore-mint/40 font-mono text-xs select-none pointer-events-none">╔</div>
        <div className="absolute top-2 right-2 text-spore-mint/40 font-mono text-xs select-none pointer-events-none">╗</div>
        <div className="absolute bottom-2 left-2 text-spore-mint/40 font-mono text-xs select-none pointer-events-none">╚</div>
        <div className="absolute bottom-2 right-2 text-spore-mint/40 font-mono text-xs select-none pointer-events-none">╝</div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-spore-mint/20 bg-grotto-900/80">
          <div className="flex items-center space-x-3">
            <span className="text-amber-fire text-lg select-none">{symbol}</span>
            <h2 className="font-['Cinzel'] text-xl sm:text-2xl font-bold tracking-[0.2em] text-pale-bone uppercase">
              {title}
            </h2>
          </div>

          <button
            onClick={closeOverlay}
            className="group flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-spore-mint/20 bg-grotto-950/60 hover:bg-scarf-crimson/20 hover:border-scarf-crimson/50 text-bone-muted hover:text-pale-bone transition-all duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <span className="text-xs uppercase tracking-widest font-['Cinzel'] hidden sm:inline">Dismiss</span>
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-pale-bone/90">
          {children}
        </div>

        {/* Subtle Bottom Bar with lore accent */}
        <div className="px-6 py-2.5 bg-grotto-950/80 border-t border-spore-mint/10 flex items-center justify-between text-xs font-['Cinzel'] tracking-widest text-bone-muted/60">
          <span>◈ Pharloom Chronicle ◈</span>
          <span>Press ESC or click Dismiss to return</span>
        </div>
      </div>
    </div>
  )
}
