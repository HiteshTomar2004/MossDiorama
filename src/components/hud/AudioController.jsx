import React, { useEffect, useRef } from 'react'
import { usePortfolioStore } from '../../store/usePortfolioStore'

export const AudioController = () => {
  const audioPlaying = usePortfolioStore((s) => s.audioPlaying)
  const soundVolume = usePortfolioStore((s) => s.soundVolume)
  const audioCtxRef = useRef(null)
  const musicAudioRef = useRef(null)
  const masterGainRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (audioPlaying) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return

        const ctx = new AudioContext()
        audioCtxRef.current = ctx
        if (ctx.state === 'suspended') ctx.resume()

        // Master Gain (lowered slightly for cozy, balanced ambient listening)
        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime)
        masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, soundVolume * 0.52), ctx.currentTime + 1.5)
        masterGain.connect(ctx.destination)
        masterGainRef.current = masterGain

        // 1. Alternating C418 Ambient Playlist (Droopy Likes Ricochet Homage + Contemplative Piano Homage)
        const PLAYLIST = [
          '/assets/audio/droopy_ricochet_ambient.mp3',
          '/assets/audio/droopy_piano_ambient.mp3',
        ]
        let currentTrackIdx = 0

        const music = new Audio(PLAYLIST[currentTrackIdx])
        music.loop = false
        music.crossOrigin = 'anonymous'
        musicAudioRef.current = music

        const musicSource = ctx.createMediaElementSource(music)
        const musicGain = ctx.createGain()
        // Lowered music gain from 0.85 to 0.38 for pleasant, non-intrusive backdrop
        musicGain.gain.setValueAtTime(0.38, ctx.currentTime)
        musicSource.connect(musicGain)
        musicGain.connect(masterGain)

        // Automatically cycle between tracks with a peaceful 4-second pause
        music.onended = () => {
          if (!audioCtxRef.current || !musicAudioRef.current) return
          setTimeout(() => {
            if (!musicAudioRef.current) return
            currentTrackIdx = (currentTrackIdx + 1) % PLAYLIST.length
            music.src = PLAYLIST[currentTrackIdx]
            music.play().catch(() => {})
          }, 4000)
        }

        music.play().catch((err) => {
          console.warn('Playback prevented by browser policy:', err)
        })

        // 2. Soft Whispering Wind (Brownian noise layer)
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let lastOut = 0.0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          output[i] = (lastOut + 0.02 * white) / 1.02
          lastOut = output[i]
          output[i] *= 1.8 // Subtle background scale
        }

        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(220, ctx.currentTime)

        const windGain = ctx.createGain()
        windGain.gain.setValueAtTime(0.024, ctx.currentTime)

        whiteNoise.connect(filter)
        filter.connect(windGain)
        windGain.connect(masterGain)
        whiteNoise.start()

        // 3. Subtle Cozy Campfire Crackle Pulses
        intervalRef.current = setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return
          try {
            const osc = audioCtxRef.current.createOscillator()
            const popGain = audioCtxRef.current.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(110 + Math.random() * 160, audioCtxRef.current.currentTime)
            popGain.gain.setValueAtTime(0.004, audioCtxRef.current.currentTime)
            popGain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.07)
            osc.connect(popGain)
            popGain.connect(masterGain)
            osc.start()
            osc.stop(audioCtxRef.current.currentTime + 0.08)
          } catch {
            // ignore
          }
        }, 420)
      } catch (err) {
        console.warn('AudioContext initialization error:', err)
      }
    } else {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause()
        musicAudioRef.current.src = ''
        musicAudioRef.current = null
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
    }

    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause()
        musicAudioRef.current.src = ''
        musicAudioRef.current = null
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
    }
  }, [audioPlaying])

  // Responsive volume adjustment
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      try {
        masterGainRef.current.gain.setTargetAtTime(
          Math.max(0.0001, soundVolume * 0.52),
          audioCtxRef.current.currentTime,
          0.1
        )
      } catch (e) {}
    }
  }, [soundVolume])

  return null
}
