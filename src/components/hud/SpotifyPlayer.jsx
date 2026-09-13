import React, { useState } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Disc3,
  Sparkles,
  Radio,
  CheckCircle2,
  X,
} from 'lucide-react'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { CURATED_TRACKS, SPOTIFY_EMBEDS, toSpotifyEmbedUrl, USER_SPOTIFY_CONFIG } from '../../data/musicData'

/**
 * SpotifyPlayer
 * Sleek floating matte Spotify music player supporting both curated ambient soundtrack
 * and authentic Spotify Web embeds with synced controls, scrubber, and spinning vinyl disc.
 */
export const SpotifyPlayer = () => {
  const audioPlaying = usePortfolioStore((s) => s.audioPlaying)
  const soundVolume = usePortfolioStore((s) => s.soundVolume)
  const currentTrackIndex = usePortfolioStore((s) => s.currentTrackIndex)
  const is3DMode = usePortfolioStore((s) => s.is3DMode)
  const is2DDarkMode = usePortfolioStore((s) => s.is2DDarkMode)
  const isSpotifyExpanded = usePortfolioStore((s) => s.isSpotifyExpanded)
  const isSpotifyVisible = usePortfolioStore((s) => s.isSpotifyVisible)
  const spotifyMode = usePortfolioStore((s) => s.spotifyMode)
  const activeSpotifyEmbedIndex = usePortfolioStore((s) => s.activeSpotifyEmbedIndex)
  const spotifyCurrentTime = usePortfolioStore((s) => s.spotifyCurrentTime)
  const spotifyDuration = usePortfolioStore((s) => s.spotifyDuration)
  const spotifyIsLooping = usePortfolioStore((s) => s.spotifyIsLooping)
  const spotifyIsShuffled = usePortfolioStore((s) => s.spotifyIsShuffled)
  const isSpotifyPlaying = usePortfolioStore((s) => s.isSpotifyPlaying)
  const setIsSpotifyPlaying = usePortfolioStore((s) => s.setIsSpotifyPlaying)

  const toggleAudio = usePortfolioStore((s) => s.toggleAudio)
  const setSoundVolume = usePortfolioStore((s) => s.setSoundVolume)
  const toggleSpotifyExpanded = usePortfolioStore((s) => s.toggleSpotifyExpanded)
  const setSpotifyExpanded = usePortfolioStore((s) => s.setSpotifyExpanded)
  const setSpotifyVisible = usePortfolioStore((s) => s.setSpotifyVisible)
  const toggleSpotifyVisible = usePortfolioStore((s) => s.toggleSpotifyVisible)
  const setSpotifyMode = usePortfolioStore((s) => s.setSpotifyMode)
  const setActiveSpotifyEmbedIndex = usePortfolioStore((s) => s.setActiveSpotifyEmbedIndex)
  const setCurrentTrackIndex = usePortfolioStore((s) => s.setCurrentTrackIndex)
  const nextTrack = usePortfolioStore((s) => s.nextTrack)
  const prevTrack = usePortfolioStore((s) => s.prevTrack)
  const seekTo = usePortfolioStore((s) => s.seekTo)
  const toggleSpotifyLoop = usePortfolioStore((s) => s.toggleSpotifyLoop)
  const toggleSpotifyShuffle = usePortfolioStore((s) => s.toggleSpotifyShuffle)

  const catCurrentPos = usePortfolioStore((s) => s.catCurrentPos)
  const customSpotifyUrl = usePortfolioStore((s) => s.customSpotifyUrl)
  const setCustomSpotifyUrl = usePortfolioStore((s) => s.setCustomSpotifyUrl)
  const [urlInputValue, setUrlInputValue] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [prevVolume, setPrevVolume] = useState(0.4)
  const [embedHeight, setEmbedHeight] = useState(152)

  if (!isSpotifyVisible) return null

  const isLight = !is3DMode && !is2DDarkMode
  const isNearLake =
    is3DMode &&
    catCurrentPos &&
    Math.min(
      Math.hypot(catCurrentPos[0] - 101.5, catCurrentPos[2] - (-77.0)),
      Math.hypot(catCurrentPos[0] - 102.3, catCurrentPos[2] - (-66.7))
    ) <= 32.0

  const currentTrack = CURATED_TRACKS[currentTrackIndex] || CURATED_TRACKS[0]
  const currentEmbed = SPOTIFY_EMBEDS[activeSpotifyEmbedIndex] || SPOTIFY_EMBEDS[0]

  const activeEmbedUrl = customSpotifyUrl
    ? toSpotifyEmbedUrl(customSpotifyUrl)
    : currentEmbed.embedUrl

  const displayTitle =
    spotifyMode === 'embed'
      ? customSpotifyUrl
        ? 'Custom Spotify Playlist'
        : currentEmbed.title
      : currentTrack.title

  const displayArtist =
    spotifyMode === 'embed'
      ? customSpotifyUrl
        ? 'Spotify Library'
        : currentEmbed.artist
      : currentTrack.artist

  // Format time helpers (mm:ss)
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value)
    seekTo(newTime)
  }

  const handleVolumeToggle = () => {
    if (soundVolume > 0) {
      setPrevVolume(soundVolume)
      setSoundVolume(0)
    } else {
      setSoundVolume(prevVolume || 0.4)
    }
  }

  // Calculate progress ratio (0 to 100%)
  const progressPercent = spotifyDuration > 0 ? (spotifyCurrentTime / spotifyDuration) * 100 : 0

  return (
    <div className="fixed bottom-5 left-5 z-40 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ─────────────────────────────────────────────────────────────
          1. COLLAPSED MINI-PILL
         ───────────────────────────────────────────────────────────── */}
      {!isSpotifyExpanded ? (
        <div
          className={`flex items-center space-x-2.5 px-3 py-2 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300 group cursor-pointer ${
            isLight
              ? 'bg-white/95 border border-neutral-200 text-neutral-800 hover:border-neutral-300'
              : 'bg-[#121418]/95 border border-white/[0.08] text-[#f4f4f6] hover:border-white/[0.16]'
          }`}
          onClick={() => setSpotifyExpanded(true)}
        >
          {/* Spotify Green Icon or Animated EQ Bars */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-[#1db954]/15 text-[#1db954] shrink-0">
            {(spotifyMode === 'curated' && audioPlaying) || (spotifyMode === 'embed' && isSpotifyPlaying) ? (
              <div className="flex items-end space-x-0.5 h-3.5">
                <span className="w-0.5 h-full bg-[#1db954] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-2.5 bg-[#1db954] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-3 bg-[#1db954] rounded-full animate-bounce" />
              </div>
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            )}
          </div>

          {/* Track Info Ticker */}
          <div className="flex flex-col max-w-[140px] sm:max-w-[190px] truncate">
            <span className="text-xs font-semibold truncate leading-tight">
              {displayTitle}
            </span>
            <div className="flex items-center space-x-1 truncate">
              <span
                className={`text-[10px] truncate ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                {displayArtist}
              </span>
              {isNearLake && (
                <span className="hidden sm:inline-block px-1 py-0.2 rounded bg-[#1db954]/20 text-[#1db954] text-[8px] font-bold uppercase shrink-0">
                  Lake
                </span>
              )}
            </div>
          </div>

          {/* Mini Action buttons */}
          <div className="flex items-center space-x-1">
            {spotifyMode === 'curated' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleAudio()
                }}
                className="p-1.5 rounded-lg bg-[#1db954] hover:bg-[#1ed760] text-black transition-colors cursor-pointer"
                title={audioPlaying ? 'Pause Atmosphere' : 'Play Atmosphere'}
              >
                {audioPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
            )}

            {/* Expand Chevron */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSpotifyExpanded(true)
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100' : 'text-neutral-500 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Expand Player"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Close / Dismiss button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSpotifyVisible(false)
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100' : 'text-neutral-500 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Close Spotify Player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            2. EXPANDED FULL PLAYER CARD
           ───────────────────────────────────────────────────────────── */
        <div
          className={`w-[320px] sm:w-[356px] rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 border overflow-hidden ${
            isLight
              ? 'bg-white/95 border-neutral-200/90 text-neutral-800'
              : 'bg-[#121418]/95 border-white/[0.08] text-[#f4f4f6]'
          }`}
        >
          {/* Card Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              isLight ? 'border-neutral-100 bg-neutral-50/50' : 'border-white/[0.05] bg-[#16191f]/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 fill-[#1db954]" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#1db954]">
                {isNearLake ? '🌊 Lakeside Vinyl Stream' : 'Spotify Atmosphere'}
              </span>
            </div>

            {/* Mode Switcher Tabs & Actions */}
            <div className="flex items-center space-x-1.5">
              <div
                className={`flex p-0.5 rounded-lg ${
                  isLight ? 'bg-neutral-200/80' : 'bg-white/[0.06]'
                }`}
              >
                <button
                  onClick={() => setSpotifyMode('embed')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                    spotifyMode === 'embed'
                      ? isLight
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'bg-[#242730] text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Spotify
                </button>
                <button
                  onClick={() => setSpotifyMode('curated')}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                    spotifyMode === 'curated'
                      ? isLight
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'bg-[#242730] text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  World Ambient
                </button>
              </div>

              {/* Minimize button */}
              <button
                onClick={() => setSpotifyExpanded(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100' : 'text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                }`}
                title="Collapse"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSpotifyVisible(false)
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100' : 'text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                }`}
                title="Close Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              MODE A: Curated Ambient Soundtrack (High-Fidelity Audio)
             ───────────────────────────────────────────────────────── */}
          {spotifyMode === 'curated' ? (
            <div className="p-4 space-y-4">
              {/* Vinyl & Artwork Display */}
              <div className="flex items-center space-x-4">
                {/* Album Cover & Rotating Vinyl Disc */}
                <div className="relative w-24 h-24 shrink-0">
                  {/* Vinyl Record Disc (slides out & rotates when audioPlaying) */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-neutral-950 border border-neutral-800 shadow-xl transition-transform duration-700 flex items-center justify-center ${
                      audioPlaying ? 'translate-x-5 animate-spin [animation-duration:4s]' : 'translate-x-1'
                    }`}
                    style={{
                      backgroundImage:
                        'repeating-radial-gradient(circle, #1a1a1a 0, #1a1a1a 2px, #0d0d0d 3px, #0d0d0d 5px)',
                    }}
                  >
                    {/* Vinyl Center Emerald Label */}
                    <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center shadow-inner">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#121418] border border-white/20" />
                    </div>
                  </div>

                  {/* Album Sleeve Art Cover */}
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    className="relative z-10 w-24 h-24 rounded-xl object-cover shadow-lg border border-white/10"
                  />
                </div>

                {/* Track Titles & Spotify External Link */}
                <div className="flex flex-col flex-1 min-w-0 pl-3">
                  <span className="text-xs font-semibold leading-snug line-clamp-2">
                    {currentTrack.title}
                  </span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span
                      className={`text-[11px] truncate ${
                        isLight ? 'text-neutral-500' : 'text-neutral-400'
                      }`}
                    >
                      {currentTrack.artist}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-[#1db954] shrink-0" />
                  </div>
                  <span
                    className={`text-[10px] truncate mt-0.5 ${
                      isLight ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {currentTrack.album}
                  </span>

                  {/* Link to Spotify */}
                  <a
                    href={currentTrack.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[10px] font-medium text-[#1db954] hover:underline mt-2 w-fit"
                  >
                    <span>Open in Spotify</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Scrubber Progress Bar */}
              <div className="space-y-1">
                <div className="relative flex items-center group">
                  <input
                    type="range"
                    min="0"
                    max={spotifyDuration || 136}
                    step="0.5"
                    value={spotifyCurrentTime || 0}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-neutral-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
                    style={{
                      background: `linear-gradient(to right, #1db954 ${progressPercent}%, ${
                        isLight ? '#e5e7eb' : 'rgba(255,255,255,0.1)'
                      } ${progressPercent}%)`,
                    }}
                  />
                </div>
                <div
                  className={`flex justify-between text-[10px] font-['JetBrains_Mono',monospace] ${
                    isLight ? 'text-neutral-500' : 'text-neutral-400'
                  }`}
                >
                  <span>{formatTime(spotifyCurrentTime)}</span>
                  <span>{formatTime(spotifyDuration || currentTrack.duration)}</span>
                </div>
              </div>

              {/* Main Playback Control Bar */}
              <div className="flex items-center justify-between pt-1">
                {/* Shuffle Button */}
                <button
                  onClick={toggleSpotifyShuffle}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    spotifyIsShuffled
                      ? 'text-[#1db954] bg-[#1db954]/10'
                      : isLight
                      ? 'text-neutral-400 hover:text-neutral-800'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={spotifyIsShuffled ? 'Shuffle On' : 'Shuffle Off'}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                {/* Prev Track */}
                <button
                  onClick={prevTrack}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100 text-neutral-700' : 'hover:bg-white/[0.08] text-neutral-300'
                  }`}
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                {/* Main Play/Pause Squircle */}
                <button
                  onClick={toggleAudio}
                  className="p-3 rounded-2xl bg-[#1db954] hover:bg-[#1ed760] text-black transition-transform duration-150 active:scale-95 shadow-md shadow-[#1db954]/25 cursor-pointer"
                  title={audioPlaying ? 'Pause Atmosphere' : 'Play Atmosphere'}
                >
                  {audioPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Next Track */}
                <button
                  onClick={nextTrack}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-neutral-100 text-neutral-700' : 'hover:bg-white/[0.08] text-neutral-300'
                  }`}
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>

                {/* Repeat / Loop Button */}
                <button
                  onClick={toggleSpotifyLoop}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    spotifyIsLooping
                      ? 'text-[#1db954] bg-[#1db954]/10'
                      : isLight
                      ? 'text-neutral-400 hover:text-neutral-800'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={spotifyIsLooping ? 'Repeat On' : 'Repeat Off'}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Volume Slider & Playlist Toggle */}
              <div
                className={`flex items-center justify-between pt-2 border-t text-xs ${
                  isLight ? 'border-neutral-100 text-neutral-600' : 'border-white/[0.06] text-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-2 flex-1 max-w-[170px]">
                  <button
                    onClick={handleVolumeToggle}
                    className="p-1 rounded-md hover:text-[#1db954] transition-colors cursor-pointer"
                    title={soundVolume === 0 ? 'Unmute' : 'Mute'}
                  >
                    {soundVolume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-neutral-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#1db954]"
                  />
                </div>

                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={`text-[11px] font-semibold transition-colors cursor-pointer px-2 py-1 rounded-md ${
                    showPlaylist
                      ? 'text-[#1db954] bg-[#1db954]/10'
                      : isLight
                      ? 'hover:bg-neutral-100'
                      : 'hover:bg-white/[0.06]'
                  }`}
                >
                  {showPlaylist ? 'Hide Playlist' : 'Playlist (3)'}
                </button>
              </div>

              {/* Expandable Curated Playlist Drawer */}
              {showPlaylist && (
                <div
                  className={`mt-2 p-2 rounded-xl space-y-1 max-h-36 overflow-y-auto ${
                    isLight ? 'bg-neutral-50 border border-neutral-100' : 'bg-black/25 border border-white/[0.04]'
                  }`}
                >
                  {CURATED_TRACKS.map((t, idx) => {
                    const isCurrent = currentTrackIndex === idx
                    return (
                      <div
                        key={t.id}
                        onClick={() => setCurrentTrackIndex(idx)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isCurrent
                            ? isLight
                              ? 'bg-neutral-200/70 font-semibold text-neutral-900'
                              : 'bg-white/[0.08] font-semibold text-white'
                            : isLight
                            ? 'hover:bg-neutral-100 text-neutral-700'
                            : 'hover:bg-white/[0.04] text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span
                            className={`text-[10px] w-4 ${
                              isCurrent ? 'text-[#1db954]' : 'text-neutral-500'
                            }`}
                          >
                            {isCurrent && audioPlaying ? '▶' : idx + 1}
                          </span>
                          <span className="truncate">{t.title}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 shrink-0 ml-2 font-['JetBrains_Mono']">
                          {formatTime(t.duration)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────
                MODE B: Authentic Spotify Web Embed (Real Spotify Songs)
               ───────────────────────────────────────────────────────── */
            <div className="p-3 space-y-3">
              {/* Spotify Playlist Selector & Custom URL Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1.5 overflow-x-auto pb-1 max-w-[260px]">
                  {customSpotifyUrl && (
                    <button
                      onClick={() => setCustomSpotifyUrl(customSpotifyUrl)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg whitespace-nowrap transition-colors cursor-pointer bg-[#1db954] text-black font-semibold`}
                    >
                      ★ My Playlist
                    </button>
                  )}
                  {SPOTIFY_EMBEDS.map((emb, idx) => (
                    <button
                      key={emb.id}
                      onClick={() => {
                        setCustomSpotifyUrl('')
                        setActiveSpotifyEmbedIndex(idx)
                      }}
                      className={`px-2.5 py-1 text-[11px] rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        !customSpotifyUrl && activeSpotifyEmbedIndex === idx
                          ? 'bg-[#1db954] text-black font-semibold'
                          : isLight
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300'
                      }`}
                    >
                      {emb.title}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    showUrlInput
                      ? 'text-[#1db954] bg-[#1db954]/15'
                      : isLight
                      ? 'text-neutral-500 hover:text-neutral-900 bg-neutral-100'
                      : 'text-neutral-400 hover:text-white bg-white/[0.06]'
                  }`}
                  title="Link your own Spotify Playlist or Track URL"
                >
                  {showUrlInput ? 'Close' : '+ Link URL'}
                </button>
              </div>

              {/* Custom Spotify Playlist URL Input */}
              {showUrlInput && (
                <div
                  className={`p-2.5 rounded-xl space-y-2 text-xs ${
                    isLight ? 'bg-neutral-100 border border-neutral-200' : 'bg-white/[0.04] border border-white/[0.08]'
                  }`}
                >
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                    Paste your Spotify Playlist / Track / Album URL:
                  </label>
                  <div className="flex space-x-1.5">
                    <input
                      type="url"
                      placeholder="https://open.spotify.com/playlist/..."
                      value={urlInputValue}
                      onChange={(e) => setUrlInputValue(e.target.value)}
                      className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs border outline-none font-['JetBrains_Mono'] ${
                        isLight
                          ? 'bg-white border-neutral-300 text-neutral-900 focus:border-[#1db954]'
                          : 'bg-[#0e1014] border-white/15 text-white focus:border-[#1db954]'
                      }`}
                    />
                    <button
                      onClick={() => {
                        if (urlInputValue.trim()) {
                          setCustomSpotifyUrl(urlInputValue.trim())
                          setShowUrlInput(false)
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Load
                    </button>
                  </div>
                </div>
              )}

              {/* Official Responsive Spotify Embed Iframe (Plays REAL Spotify Songs!) */}
              <div className="rounded-xl overflow-hidden shadow-md bg-neutral-950 border border-white/[0.06]">
                <iframe
                  title="Spotify Embed Player"
                  src={activeEmbedUrl}
                  width="100%"
                  height={embedHeight}
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl transition-all duration-300"
                />
              </div>

              {/* Site Ambient Atmosphere Control Banner */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] ${
                  isLight ? 'bg-neutral-100/90 border border-neutral-200' : 'bg-white/[0.04] border border-white/[0.06]'
                }`}
              >
                <span className={isLight ? 'text-neutral-600' : 'text-neutral-400'}>
                  Site Ambient Atmosphere:
                </span>
                <button
                  onClick={() => {
                    if (isSpotifyPlaying) {
                      setIsSpotifyPlaying(false)
                    }
                    toggleAudio()
                  }}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    audioPlaying && !isSpotifyPlaying
                      ? 'text-amber-500 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/20'
                      : isLight
                      ? 'text-neutral-600 hover:text-neutral-900 bg-neutral-200/80'
                      : 'text-neutral-300 hover:text-white bg-white/[0.08]'
                  }`}
                  title={audioPlaying && !isSpotifyPlaying ? 'Click to Mute Ambient Audio' : 'Click to Play Ambient Audio'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${audioPlaying && !isSpotifyPlaying ? 'bg-amber-400 animate-ping' : 'bg-neutral-500'}`} />
                  <span>{audioPlaying && !isSpotifyPlaying ? 'Active' : 'Muted (Resume)'}</span>
                </button>
              </div>

              {/* View Height Toggle & Direct Open in Spotify Link */}
              <div className="flex justify-between items-center text-[11px] px-1 text-neutral-400">
                <button
                  onClick={() => setEmbedHeight(embedHeight === 152 ? 352 : 152)}
                  className="text-[10px] text-neutral-400 hover:text-[#1db954] transition-colors cursor-pointer"
                  title="Toggle between compact player and full tracklist view"
                >
                  {embedHeight === 152 ? '⤢ Show Tracklist (352px)' : '⤡ Compact View (152px)'}
                </button>
                <a
                  href={customSpotifyUrl || currentEmbed.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#1db954] hover:underline font-medium"
                >
                  <span>Open in Spotify App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
