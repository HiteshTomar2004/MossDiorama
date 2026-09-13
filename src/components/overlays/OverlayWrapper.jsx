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
    <div
      onClick={closeOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl max-h-[88vh] flex flex-col bg-[#0e0f12] text-[#f4f4f6] rounded-2xl overflow-hidden shadow-[0_16px_70px_rgba(0,0,0,0.8)] border border-white/[0.08] cursor-default selectable-prose"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.08] bg-[#121417]/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-[#d4a373] text-lg select-none">{symbol || '◈'}</span>
            <h2 className="font-['Instrument_Serif'] text-2xl sm:text-3xl tracking-tight text-[#f4f4f6]">
              {title}
            </h2>
          </div>

          <button
            onClick={closeOverlay}
            className="group flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-all duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <span className="text-xs uppercase tracking-wider font-['Cinzel'] hidden sm:inline">Dismiss</span>
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-neutral-300">
          {children}
        </div>

        {/* Subtle Bottom Bar */}
        <div className="px-6 py-2.5 bg-[#121417] border-t border-white/[0.08] flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span className="flex items-center space-x-2">
            <span className="text-[#d4a373]">◈</span>
            <span className="tracking-wider uppercase font-['Cinzel'] text-[11px] text-neutral-400">3D Realm Dossier</span>
          </span>
          <span className="text-[11px] font-['Cinzel'] tracking-wider text-neutral-500">Press ESC or click Dismiss to return</span>
        </div>
      </div>
    </div>
  )
}
