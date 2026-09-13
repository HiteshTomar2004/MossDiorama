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
  cameraTarget: [0, 0, 0],
  hoveredObject: null,
  catTarget: null,
  catCurrentPos: [2.0, 0, 1.2],
  catIsMoving: false,
  cursorWorldPos: null,

  setCatTarget: (pos) => set({ catTarget: pos }),
  setCatCurrentPos: (pos) => set({ catCurrentPos: pos }),
  setCursorWorldPos: (pos) => set({ cursorWorldPos: pos }),
  setCatIsMoving: (moving) => set({ catIsMoving: moving }),
  toggleFollowCat: () => set((state) => ({ followCatCamera: !state.followCatCamera })),

  setActiveDistrict: (districtId) => {
    const coords = DISTRICT_COORDINATES[districtId] || DISTRICT_COORDINATES.hearth
    const targetX = coords.stopX ?? coords.x
    const targetZ = coords.stopZ ?? coords.z
    set({
      activeDistrict: districtId,
      catTarget: [targetX, 0, targetZ],
    })
  },

  openOverlay: (overlayId) => set({ activeOverlay: overlayId }),
  closeOverlay: () => set({ activeOverlay: null }),

  toggle3DMode: () => set((state) => ({ is3DMode: !state.is3DMode })),
  toggle2DDarkMode: () => set((state) => ({ is2DDarkMode: !state.is2DDarkMode })),
  set2DDarkMode: (val) => set({ is2DDarkMode: val }),
  toggleAudio: () => set((state) => ({ audioPlaying: !state.audioPlaying })),
  setSoundVolume: (volume) => set({ soundVolume: volume }),
  setHoveredObject: (obj) => set({ hoveredObject: obj }),
}))
