import { create } from 'zustand'

export const DISTRICT_COORDINATES = {
  hearth: {
    x: 0,
    y: 0,
    z: 0,
    stopX: 1.8,
    stopZ: 3.6,
    name: 'Home',
    symbol: '🔥',
  },
  projects: {
    x: 28,
    y: 0,
    z: -98,
    stopX: 28.0,
    stopZ: -92.5,
    name: 'Projects',
    symbol: '💼',
  },
  blog: {
    x: -108,
    y: 0,
    z: -34,
    stopX: -98.2,
    stopZ: -33.5,
    name: 'Notes',
    symbol: '📝',
  },
  resume: {
    x: -100,
    y: 0,
    z: 80,
    stopX: -95.5,
    stopZ: 76.8,
    name: 'Resume',
    symbol: '📜',
  },
  contact: {
    x: 86,
    y: 0,
    z: 88,
    stopX: 86.8,
    stopZ: 93.8,
    name: 'Contact',
    symbol: '✉',
  },
}

export const usePortfolioStore = create((set) => ({
  activeDistrict: 'hearth',
  activeOverlay: null, // 'projects' | 'resume' | 'blog' | 'contact' | null
  is3DMode: true,
  is2DDarkMode: false, // default false = White-Gray Light Mode in 2D; true = Moss Dark Mode
  audioPlaying: false,
  soundVolume: 0.4,
  sfxEnabled: true,
  sfxVolume: 0.75,
  cameraTarget: [0, 0, 0],
  hoveredObject: null,
  catTarget: null,
  catCurrentPos: [2.0, 0, 1.2],
  catIsMoving: false,
  cursorWorldPos: null,

  // Music & Spotify State
  currentTrackIndex: 0,
  isSpotifyExpanded: false,
  isSpotifyVisible: false, // Hidden by default; opened via Header Spotify button or Lake Turntable
  spotifyMode: 'embed', // Real Spotify Embed is default!
  customSpotifyUrl: typeof window !== 'undefined' ? localStorage.getItem('custom_spotify_url') || '' : '',
  activeSpotifyEmbedIndex: 0,
  spotifyCurrentTime: 0,
  spotifyDuration: 136,
  spotifySeekTarget: null, // when user scrubs progress bar
  spotifyIsLooping: true,
  spotifyIsShuffled: false,
  isSpotifyPlaying: false,

  setCatTarget: (pos, optZ) => {
    if (!pos) {
      set({ catTarget: null })
      return
    }
    if (Array.isArray(pos) && Number.isFinite(pos[0]) && Number.isFinite(pos[2] ?? pos[1])) {
      set({ catTarget: [pos[0], 0, pos[2] ?? pos[1]] })
    } else if (Number.isFinite(pos) && Number.isFinite(optZ)) {
      set({ catTarget: [pos, 0, optZ] })
    } else {
      set({ catTarget: null })
    }
  },
  setCatCurrentPos: (pos) => set({ catCurrentPos: pos }),
  setCursorWorldPos: (pos) => set({ cursorWorldPos: pos }),
  setCatIsMoving: (moving) => set({ catIsMoving: moving }),
  toggleFollowCat: () => set((state) => ({ followCatCamera: !state.followCatCamera })),

  setActiveDistrict: (districtId, setTarget = true) => {
    const coords = DISTRICT_COORDINATES[districtId] || DISTRICT_COORDINATES.hearth
    const targetX = coords.stopX ?? coords.x
    const targetZ = coords.stopZ ?? coords.z
    set({
      activeDistrict: districtId,
      ...(setTarget ? { catTarget: [targetX, 0, targetZ] } : {}),
    })
  },

  openOverlay: (overlayId) => set({
    activeOverlay: overlayId,
    catTarget: null,
    catIsMoving: false,
  }),
  closeOverlay: () => set({ activeOverlay: null }),

  toggle3DMode: () => set((state) => ({ is3DMode: !state.is3DMode })),
  toggle2DDarkMode: () => set((state) => ({ is2DDarkMode: !state.is2DDarkMode })),
  set2DDarkMode: (val) => set({ is2DDarkMode: val }),
  toggleAudio: () => set((state) => {
    const next = !state.audioPlaying
    return {
      audioPlaying: next,
      isSpotifyPlaying: next ? false : state.isSpotifyPlaying,
    }
  }),
  setAudioPlaying: (playing) => set((state) => ({
    audioPlaying: playing,
    isSpotifyPlaying: playing ? false : state.isSpotifyPlaying,
  })),
  setSoundVolume: (volume) => set({ soundVolume: volume }),
  toggleSfx: () => set((state) => ({ sfxEnabled: !state.sfxEnabled })),
  setSfxEnabled: (val) => set({ sfxEnabled: val }),
  setSfxVolume: (vol) => set({ sfxVolume: vol }),
  setHoveredObject: (obj) => set({ hoveredObject: obj }),

  // Spotify Player Actions
  toggleSpotifyExpanded: () => set((state) => ({ isSpotifyExpanded: !state.isSpotifyExpanded })),
  setSpotifyExpanded: (val) => set({ isSpotifyExpanded: val }),
  toggleSpotifyVisible: () => set((state) => {
    const next = !state.isSpotifyVisible
    return {
      isSpotifyVisible: next,
      isSpotifyPlaying: next ? state.isSpotifyPlaying : false,
    }
  }),
  setSpotifyVisible: (val) => set((state) => ({
    isSpotifyVisible: val,
    isSpotifyPlaying: val ? state.isSpotifyPlaying : false,
  })),
  setSpotifyMode: (mode) => set({ spotifyMode: mode }),
  setCustomSpotifyUrl: (url) => {
    if (typeof window !== 'undefined') localStorage.setItem('custom_spotify_url', url)
    set({ customSpotifyUrl: url })
  },
  setActiveSpotifyEmbedIndex: (idx) => set({ activeSpotifyEmbedIndex: idx }),
  setCurrentTrackIndex: (idx) => set({ currentTrackIndex: idx, audioPlaying: true }),
  nextTrack: () => set((state) => {
    const nextIdx = (state.currentTrackIndex + 1) % 3
    return { currentTrackIndex: nextIdx, audioPlaying: true }
  }),
  prevTrack: () => set((state) => {
    const prevIdx = (state.currentTrackIndex - 1 + 3) % 3
    return { currentTrackIndex: prevIdx, audioPlaying: true }
  }),
  setSpotifyPlaybackTime: (currentTime, duration) => set({
    spotifyCurrentTime: currentTime,
    spotifyDuration: duration || 136,
  }),
  seekTo: (time) => set({ spotifySeekTarget: time }),
  clearSeekTarget: () => set({ spotifySeekTarget: null }),
  toggleSpotifyLoop: () => set((state) => ({ spotifyIsLooping: !state.spotifyIsLooping })),
  toggleSpotifyShuffle: () => set((state) => ({ spotifyIsShuffled: !state.spotifyIsShuffled })),
  setIsSpotifyPlaying: (val) => set({ isSpotifyPlaying: val }),
}))
