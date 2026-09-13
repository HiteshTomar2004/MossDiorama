import { usePortfolioStore } from '../store/usePortfolioStore'

// -------------------------------------------------------------
// High-Performance Web Audio SFX Player
// Manages preloaded audio buffers for:
// - Minecraft grass block footsteps (4 variations)
// - Wooden bridge footsteps (2 variations)
// - Interactive autumn leaf rustles (4 variations)
// -------------------------------------------------------------

class SFXEngine {
  constructor() {
    this.ctx = null
    this.buffers = {
      grass: [],
      wood: [],
      leaf: [],
      rock: [],
      treeRustle: [],
      robotHmm: [],
      robotSpark: null,
      robotChime: null,
      robotBeep: null,
      robotTypewriter: null,
      frogCroak: null,
      birdChirp: null,
    }
    this.lastGrassIdx = -1
    this.lastWoodIdx = -1
    this.lastLeafIdx = -1
    this.lastRockIdx = -1
    this.lastTreeRustleIdx = -1
    this.lastHmmTime = 0
    this.lastFrogTime = 0
    this.lastBirdTime = 0
    this.lastWorkTime = {}
    this.lastStepTime = 0
    this.lastLeafTime = 0
    this.lastRockBumpTime = 0
    this.lastTreeRustleTime = 0
    this.isLoaded = false
  }

  init() {
    if (this.ctx) return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      this.ctx = new AudioContext()
      if (this.ctx.state === 'suspended') {
        const resume = () => {
          this.ctx.resume()
          window.removeEventListener('click', resume)
          window.removeEventListener('keydown', resume)
          window.removeEventListener('pointerdown', resume)
          window.removeEventListener('touchstart', resume)
        }
        window.addEventListener('click', resume)
        window.addEventListener('keydown', resume)
        window.addEventListener('pointerdown', resume)
        window.addEventListener('touchstart', resume)
      }
      this.loadAllSounds()
    } catch (e) {
      console.warn('SFXEngine init error:', e)
    }
  }

  async loadBuffer(url) {
    try {
      const res = await fetch(url)
      const arrayBuf = await res.arrayBuffer()
      return await this.ctx.decodeAudioData(arrayBuf)
    } catch (e) {
      console.warn('Failed to load audio buffer:', url, e)
      return null
    }
  }

  async loadAllSounds() {
    if (this.isLoaded || !this.ctx) return
    this.isLoaded = true

    // 1. Authentic cat footsteps (extracted & mastered from catwalk.mp3)
    const grassPromises = [0, 1, 2, 3].map((i) =>
      this.loadBuffer(`/assets/audio/grass_step_${i}.mp3?v=7`)
    )
    // 2. Solid wood bridge steps
    const woodPromises = [0, 1].map((i) =>
      this.loadBuffer(`/assets/audio/wood_step_${i}.mp3?v=7`)
    )
    // 3. Ground autumn leaf rustles
    const leafPromises = [0, 1, 2, 3].map((i) =>
      this.loadBuffer(`/assets/audio/leaf_rustle_${i}.mp3?v=7`)
    )
    // 4. Solid rock & boulder collision bumps
    const rockPromises = [0, 1, 2].map((i) =>
      this.loadBuffer(`/assets/audio/tree_bump_${i}.mp3?v=7`)
    )
    // 5. Calm, stretched tree canopy leaf rustles
    const treeRustlePromises = [0, 1, 2].map((i) =>
      this.loadBuffer(`/assets/audio/tree_rustle_${i}.mp3?v=7`)
    )
    // 6. Minecraft Villager 'heeenh' / 'hrrrm' idle sounds
    const hmmPromises = [0, 1, 2].map((i) =>
      this.loadBuffer(`/assets/audio/robot_hmm_${i}.mp3?v=8`)
    )
    // 7. Robot interaction/work noises
    const sparkPromise = this.loadBuffer('/assets/audio/robot_spark.mp3?v=7')
    const chimePromise = this.loadBuffer('/assets/audio/robot_chime.mp3?v=7')
    const beepPromise = this.loadBuffer('/assets/audio/robot_beep.mp3?v=7')
    const typewriterPromise = this.loadBuffer('/assets/audio/robot_typewriter.mp3?v=7')
    const groovePromise = this.loadBuffer('/assets/audio/robot_groove.mp3?v=1')
    // 8. Living wildlife fauna sounds
    const frogPromise = this.loadBuffer('/assets/audio/frog_croak.mp3?v=10')
    const birdPromise = this.loadBuffer('/assets/audio/bird_chirp.mp3?v=8')

    const [grass, wood, leaf, rock, treeRustle, hmm, spark, chime, beep, typewriter, groove, frog, bird] = await Promise.all([
      Promise.all(grassPromises),
      Promise.all(woodPromises),
      Promise.all(leafPromises),
      Promise.all(rockPromises),
      Promise.all(treeRustlePromises),
      Promise.all(hmmPromises),
      sparkPromise,
      chimePromise,
      beepPromise,
      typewriterPromise,
      groovePromise,
      frogPromise,
      birdPromise,
    ])

    this.buffers.grass = grass.filter(Boolean)
    this.buffers.wood = wood.filter(Boolean)
    this.buffers.leaf = leaf.filter(Boolean)
    this.buffers.rock = rock.filter(Boolean)
    this.buffers.treeRustle = treeRustle.filter(Boolean)
    this.buffers.robotHmm = hmm.filter(Boolean)
    this.buffers.robotSpark = spark
    this.buffers.robotChime = chime
    this.buffers.robotBeep = beep
    this.buffers.robotTypewriter = typewriter
    this.buffers.robotGroove = groove
    this.buffers.frogCroak = frog
    this.buffers.birdChirp = bird
  }

  getVolume() {
    const state = usePortfolioStore.getState()
    // Ambience mute (state.audioPlaying) only controls background music/atmosphere!
    // Interactive SFX (cat footsteps, leaf rustles, nature wildlife, robot interactions) stay active.
    if (state.sfxEnabled === false) return 0
    if (state.soundVolume !== undefined && state.soundVolume <= 0) return 0
    return state.sfxVolume ?? 0.75
  }

  playBuffer(buffer, baseVolume = 0.5, pitchVariance = 0.08) {
    if (!buffer || !this.ctx) return
    if (this.ctx.state === 'suspended') this.ctx.resume()

    const masterVol = this.getVolume()
    if (masterVol <= 0.001) return

    try {
      const source = this.ctx.createBufferSource()
      source.buffer = buffer

      // Organic micro pitch variation (+- pitchVariance)
      const detune = 1.0 + (Math.random() * 2 - 1) * pitchVariance
      source.playbackRate.setValueAtTime(detune, this.ctx.currentTime)

      const gain = this.ctx.createGain()
      // Smooth footstep volume scaling
      const effectiveGain = baseVolume * masterVol
      gain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime)

      source.connect(gain)
      gain.connect(this.ctx.destination)
      source.start()
    } catch (e) {
      // Graceful ignore
    }
  }

  playGrassStep() {
    this.init()
    const now = performance.now()
    if (now - this.lastStepTime < 230) return // Spaced trot rhythm
    this.lastStepTime = now

    const list = this.buffers.grass
    if (list.length === 0) return

    // Choose different index from previous step
    let idx = Math.floor(Math.random() * list.length)
    if (idx === this.lastGrassIdx && list.length > 1) {
      idx = (idx + 1) % list.length
    }
    this.lastGrassIdx = idx

    // Authentic cat paw steps extracted directly from user catwalk.mp3
    this.playBuffer(list[idx], 0.32, 0.05)
  }

  playWoodStep() {
    this.init()
    const now = performance.now()
    if (now - this.lastStepTime < 230) return
    this.lastStepTime = now

    const list = this.buffers.wood
    if (list.length === 0) return

    let idx = Math.floor(Math.random() * list.length)
    if (idx === this.lastWoodIdx && list.length > 1) {
      idx = (idx + 1) % list.length
    }
    this.lastWoodIdx = idx

    // Dense solid oak bridge plank sound (no hollow bamboo chime)
    this.playBuffer(list[idx], 0.24, 0.04)
  }

  playWood() {
    this.playWoodStep()
  }

  playLeafRustle(intensity = 1.0) {
    this.init()
    const now = performance.now()
    if (now - this.lastLeafTime < 80) return // Allow tight flutter cascades
    this.lastLeafTime = now

    const list = this.buffers.leaf
    if (list.length === 0) return

    let idx = Math.floor(Math.random() * list.length)
    if (idx === this.lastLeafIdx && list.length > 1) {
      idx = (idx + 1) % list.length
    }
    this.lastLeafIdx = idx

    // Gently lowered leaf rustle volume for a soft, pleasant atmosphere
    const vol = Math.min(0.30, 0.18 * intensity)
    this.playBuffer(list[idx], vol, 0.12)
  }

  playRockBump() {
    this.init()
    const now = performance.now()
    if (now - this.lastRockBumpTime < 360) return // Debounce collision bumps
    this.lastRockBumpTime = now

    const list = this.buffers.rock
    if (list.length === 0) return

    let idx = Math.floor(Math.random() * list.length)
    if (idx === this.lastRockIdx && list.length > 1) {
      idx = (idx + 1) % list.length
    }
    this.lastRockIdx = idx

    // Tactile, solid rock/boulder contact thud
    this.playBuffer(list[idx], 0.28, 0.07)
  }

  // Alias for backward compatibility
  playTreeBump() {
    this.playRockBump()
  }

  playTreeRustle() {
    this.init()
    const now = performance.now()
    if (now - this.lastTreeRustleTime < 1100) return // Calm, stretched rustle debounce
    this.lastTreeRustleTime = now

    const list = this.buffers.treeRustle
    if (list.length === 0) return

    let idx = Math.floor(Math.random() * list.length)
    if (idx === this.lastTreeRustleIdx && list.length > 1) {
      idx = (idx + 1) % list.length
    }
    this.lastTreeRustleIdx = idx

    // Long, stretched, calm leafy canopy rustle
    this.playBuffer(list[idx], 0.32, 0.05)
  }

  // Play cute inquisitive robotic 'hmm' sound when cat gets close
  playRobotHmm() {
    this.init()
    const now = performance.now()
    if (now - this.lastHmmTime < 3600) return // 3.6s debounce
    this.lastHmmTime = now

    const list = this.buffers.robotHmm
    if (list.length === 0) return

    const idx = Math.floor(Math.random() * list.length)
    this.playBuffer(list[idx], 0.36, 0.06)
  }

  // Play robot working/interaction sound
  playRobotWork(type) {
    this.init()
    const now = performance.now()
    if (now - (this.lastWorkTime[type] || 0) < 650) return
    this.lastWorkTime[type] = now

    let buffer = null
    if (type === 'spark') buffer = this.buffers.robotSpark
    else if (type === 'chime') buffer = this.buffers.robotChime
    else if (type === 'beep') buffer = this.buffers.robotBeep
    else if (type === 'typewriter') buffer = this.buffers.robotTypewriter
    else if (type === 'groove') buffer = this.buffers.robotGroove

    if (buffer) {
      this.playBuffer(buffer, 0.35, 0.04)
    }
  }

  // Play robot funky groove riff
  playRobotGroove() {
    this.init()
    if (this.buffers.robotGroove) {
      this.playBuffer(this.buffers.robotGroove, 0.40, 0.04)
    }
  }

  // Play subtle frog croak sound
  playFrogCroak() {
    this.init()
    const now = performance.now()
    if (now - this.lastFrogTime < 2400) return
    this.lastFrogTime = now

    if (this.buffers.frogCroak) {
      this.playBuffer(this.buffers.frogCroak, 0.28, 0.08)
    }
  }

  // Play gentle melodic bird chirp sound
  playBirdChirp() {
    this.init()
    const now = performance.now()
    if (now - this.lastBirdTime < 3200) return
    this.lastBirdTime = now

    if (this.buffers.birdChirp) {
      this.playBuffer(this.buffers.birdChirp, 0.22, 0.07)
    }
  }
}

export const sfx = new SFXEngine()
 
// Preload and resume SFX on the very first user interaction anywhere in the window
if (typeof window !== 'undefined') {
  const onFirstInteraction = () => {
    sfx.init()
    if (sfx.ctx && sfx.ctx.state === 'suspended') {
      sfx.ctx.resume().catch(() => {})
    }
    window.removeEventListener('pointerdown', onFirstInteraction)
    window.removeEventListener('keydown', onFirstInteraction)
    window.removeEventListener('touchstart', onFirstInteraction)
  }
  window.addEventListener('pointerdown', onFirstInteraction, { once: true, passive: true })
  window.addEventListener('keydown', onFirstInteraction, { once: true, passive: true })
  window.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true })
}
