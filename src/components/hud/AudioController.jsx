import React, { useEffect, useRef } from 'react'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { CURATED_TRACKS } from '../../data/musicData'

export const AudioController = () => {
  const audioPlaying = usePortfolioStore((s) => s.audioPlaying)
  const soundVolume = usePortfolioStore((s) => s.soundVolume)
  const currentTrackIndex = usePortfolioStore((s) => s.currentTrackIndex)
  const spotifySeekTarget = usePortfolioStore((s) => s.spotifySeekTarget)
  const clearSeekTarget = usePortfolioStore((s) => s.clearSeekTarget)

  const is3DMode = usePortfolioStore((s) => s.is3DMode)
  const catCurrentPos = usePortfolioStore((s) => s.catCurrentPos)

  const isSpotifyPlaying = usePortfolioStore((s) => s.isSpotifyPlaying)

  const audioCtxRef = useRef(null)
  const musicAudioRef = useRef(null)
  const masterGainRef = useRef(null)
  const musicGainRef = useRef(null)
  const intervalRef = useRef(null)

  // 1. AudioContext and Background Atmosphere Initialization
  useEffect(() => {
    if (audioPlaying) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return

        const ctx = new AudioContext()
        audioCtxRef.current = ctx
        if (ctx.state === 'suspended') ctx.resume()

        // Master Gain
        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime)
        masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, soundVolume * 0.52), ctx.currentTime + 1.5)
        masterGain.connect(ctx.destination)
        masterGainRef.current = masterGain

        // Active Track from Store
        const initialTrack = CURATED_TRACKS[currentTrackIndex] || CURATED_TRACKS[0]
        const music = new Audio(initialTrack.src)
        music.loop = false
        music.crossOrigin = 'anonymous'
        musicAudioRef.current = music

        const musicSource = ctx.createMediaElementSource(music)
        const musicGain = ctx.createGain()
        musicGain.gain.setValueAtTime(0.44, ctx.currentTime)
        musicSource.connect(musicGain)
        musicGain.connect(masterGain)
        musicGainRef.current = musicGain

        // Progress synchronization
        music.ontimeupdate = () => {
          const store = usePortfolioStore.getState()
          const track = CURATED_TRACKS[store.currentTrackIndex]
          store.setSpotifyPlaybackTime(
            music.currentTime,
            music.duration || track?.duration || 136
          )
        }

        music.onloadedmetadata = () => {
          const store = usePortfolioStore.getState()
          store.setSpotifyPlaybackTime(music.currentTime, music.duration)
        }

        // On track ended: advance to next track
        music.onended = () => {
          const store = usePortfolioStore.getState()
          if (store.spotifyIsLooping) {
            store.nextTrack()
          }
        }

        // Play ambient music unless user is actively playing Spotify
        if (!usePortfolioStore.getState().isSpotifyPlaying) {
          music.play().catch((err) => {
            console.warn('Playback prevented by browser policy:', err)
          })
        }

        // 2. Soft Whispering Wind (Brownian noise layer)
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        let lastOut = 0.0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          output[i] = (lastOut + 0.02 * white) / 1.02
          lastOut = output[i]
          output[i] *= 1.8
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

        // 3. Cozy Campfire Crackle Pulses (Spatial: only crackles near campfire [0, 0] in 3D)
        intervalRef.current = setInterval(() => {
          if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return
          const catPos = usePortfolioStore.getState().catCurrentPos
          const in3D = usePortfolioStore.getState().is3DMode
          if (in3D && catPos) {
            const distToFire = Math.hypot(catPos[0], catPos[2])
            if (distToFire > 12.0) return
          }
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
          } catch {}
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
      musicGainRef.current = null
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
      musicGainRef.current = null
    }
  }, [audioPlaying])

  // 2. Handle Track Changes
  useEffect(() => {
    if (!audioPlaying || !musicAudioRef.current) return
    const track = CURATED_TRACKS[currentTrackIndex]
    if (track) {
      const currentSrc = musicAudioRef.current.src
      if (!currentSrc.endsWith(track.src)) {
        musicAudioRef.current.src = track.src
        musicAudioRef.current.currentTime = 0
        if (!isSpotifyPlaying) {
          musicAudioRef.current.play().catch(() => {})
        }
      }
    }
  }, [currentTrackIndex, audioPlaying, isSpotifyPlaying])

  // 3. Pause Ambient Music ONLY when Spotify is actively playing
  useEffect(() => {
    if (isSpotifyPlaying) {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause()
      }
    } else if (audioPlaying) {
      if (musicAudioRef.current && musicAudioRef.current.paused) {
        musicAudioRef.current.play().catch(() => {})
      }
    }
  }, [isSpotifyPlaying, audioPlaying])

  // 4. Detect User Clicking Inside Spotify Embed Iframe via Window Blur
  useEffect(() => {
    const handleBlur = () => {
      setTimeout(() => {
        const store = usePortfolioStore.getState()
        if (
          store.isSpotifyVisible &&
          store.spotifyMode === 'embed' &&
          document.activeElement &&
          document.activeElement.tagName === 'IFRAME'
        ) {
          store.setIsSpotifyPlaying(true)
          if (musicAudioRef.current) {
            musicAudioRef.current.pause()
          }
        }
      }, 80)
    }
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [])

  // 5. Handle Scrubbing / Seeking
  useEffect(() => {
    if (spotifySeekTarget !== null && musicAudioRef.current) {
      try {
        musicAudioRef.current.currentTime = spotifySeekTarget
      } catch {}
      clearSeekTarget()
    }
  }, [spotifySeekTarget, clearSeekTarget])

  // 6. Responsive Master Volume Adjustment
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
