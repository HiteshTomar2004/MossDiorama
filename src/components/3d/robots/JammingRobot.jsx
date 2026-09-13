import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { usePortfolioStore } from '../../../store/usePortfolioStore'
import { sfx } from '../../../utils/sfxPlayer'

/**
 * JammingRobot
 * Cute retro cartoon tin-toy robot wearing headphones, jamming by the enchanted lake.
 * - Dynamic tempo: chills at 3.2 FPS when idle, jams at 5.8 FPS with bouncing groove when music plays.
 * - Musical sparkles & floating notes when audio or Spotify is active.
 * - Plays funky 8-bit chiptune groove riff and pops speech bubble on click.
 * - Opens/controls Spotify player on click.
 * - Cat proximity detection with inquisitive robotic 'hmm'.
 */
export const JammingRobot = ({
  position = [100.2, 0, -66.2],
  scale = 2.65,
  shadowRadius = 0.8,
}) => {
  const meshRef = useRef()
  const matRef = useRef()
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const bubbleTimerRef = useRef(null)

  const audioPlaying = usePortfolioStore((s) => s.audioPlaying)
  const isSpotifyPlaying = usePortfolioStore((s) => s.isSpotifyPlaying)
  const setSpotifyVisible = usePortfolioStore((s) => s.setSpotifyVisible)

  const isMusicActive = audioPlaying || isSpotifyPlaying

  // 1. Preload 4-frame jamming sprite textures
  const loader = useMemo(() => new THREE.TextureLoader(), [])
  const textures = useMemo(() => {
    return [0, 1, 2, 3].map((i) => {
      const tex = loader.load(`/assets/robots/jamming_${i}.png`)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.magFilter = THREE.LinearFilter
      tex.minFilter = THREE.LinearMipmapLinearFilter
      return tex
    })
  }, [loader])

  // Speech bubble canvas texture
  const bubbleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 160
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, 512, 160)

    // Pill bubble background
    ctx.fillStyle = 'rgba(18, 20, 24, 0.92)'
    if (ctx.roundRect) {
      ctx.beginPath()
      ctx.roundRect(16, 16, 480, 100, 28)
      ctx.fill()
    } else {
      ctx.fillRect(16, 16, 480, 100)
    }

    // Border
    ctx.lineWidth = 4
    ctx.strokeStyle = '#1db954'
    if (ctx.roundRect) {
      ctx.beginPath()
      ctx.roundRect(16, 16, 480, 100, 28)
      ctx.stroke()
    }

    // Tail
    ctx.fillStyle = 'rgba(18, 20, 24, 0.92)'
    ctx.beginPath()
    ctx.moveTo(236, 116)
    ctx.lineTo(256, 148)
    ctx.lineTo(276, 116)
    ctx.fill()
    ctx.strokeStyle = '#1db954'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(236, 116)
    ctx.lineTo(256, 148)
    ctx.lineTo(276, 116)
    ctx.stroke()

    // Text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 30px "Cinzel", "Newsreader", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('♪ Jammin\' by the lake! ♫', 256, 66)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  const frameIndexRef = useRef(0)
  const timerRef = useRef(0)

  const hasInteractedRef = useRef(false)

  useFrame(({ clock }, delta) => {
    // Dynamic FPS: 5.8 FPS when grooving to music, 3.2 FPS when chilling
    const fps = isMusicActive ? 5.8 : 3.2
    const frameDuration = 1.0 / fps

    timerRef.current += delta
    if (timerRef.current >= frameDuration) {
      timerRef.current = timerRef.current % frameDuration
      frameIndexRef.current = (frameIndexRef.current + 1) % textures.length
      if (matRef.current) {
        matRef.current.map = textures[frameIndexRef.current]
        matRef.current.needsUpdate = true
      }
    }

    // Subtle rhythmic head-bob bounce in sync with music
    if (groupRef.current) {
      if (isMusicActive) {
        const beat = Math.sin(clock.getElapsedTime() * 7.5)
        groupRef.current.position.y = Math.max(0, beat * 0.08)
      } else {
        groupRef.current.position.y = 0
      }
    }

    // Proximity detection: emit cute robot 'hmm' ONCE per encounter (enter < 4.2, exit > 6.5)
    const catPos = usePortfolioStore.getState().catCurrentPos
    if (catPos) {
      const dx = catPos[0] - position[0]
      const dz = catPos[2] - position[2]
      const distSq = dx * dx + dz * dz
      if (distSq < 17.64) {
        if (!hasInteractedRef.current) {
          hasInteractedRef.current = true
          sfx.playRobotHmm()
        }
      } else if (distSq > 42.25) {
        hasInteractedRef.current = false
      }
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    sfx.playRobotGroove()
    setSpotifyVisible(true)

    // Show speech bubble for 3.5 seconds
    setShowBubble(true)
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = setTimeout(() => {
      setShowBubble(false)
    }, 3500)
  }

  return (
    <group position={position}>
      {/* Ground Contact Shadow */}
      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        raycast={() => null}
        renderOrder={10}
      >
        <circleGeometry args={[shadowRadius, 24]} />
        <meshBasicMaterial
          color="#081408"
          transparent
          opacity={0.34}
          depthTest={true}
          depthWrite={false}
          polygonOffset={true}
          polygonOffsetFactor={-1.5}
          polygonOffsetUnits={-1.5}
        />
      </mesh>

      {/* Floating Musical Sparkles when Music is Active */}
      {isMusicActive && (
        <group position={[0, 1.8, 0]}>
          <Sparkles
            count={14}
            scale={[1.8, 2.2, 1.8]}
            size={3.8}
            speed={1.4}
            color="#1db954"
          />
          <Sparkles
            count={8}
            scale={[1.4, 2.0, 1.4]}
            size={4.2}
            speed={1.0}
            color="#facc15"
          />
        </group>
      )}

      {/* Camera-Facing Billboard Robot Sprite */}
      <group ref={groupRef}>
        <Billboard
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
          position={[0, scale * 0.5, 0]}
        >
          <mesh
            ref={meshRef}
            onClick={handleClick}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              setHovered(false)
              document.body.style.cursor = 'auto'
            }}
          >
            <planeGeometry args={[scale, scale]} />
            <meshBasicMaterial
              ref={matRef}
              map={textures[0]}
              transparent
              alphaTest={0.08}
              depthTest={true}
              depthWrite={true}
              side={THREE.DoubleSide}
              color={hovered ? '#ffffff' : '#f5f7fa'}
            />
          </mesh>

          {/* Interactive Speech Bubble */}
          {showBubble && (
            <mesh position={[0, scale * 0.58 + 0.45, 0.05]}>
              <planeGeometry args={[2.8, 0.88]} />
              <meshBasicMaterial
                map={bubbleTexture}
                transparent
                depthTest={false}
              />
            </mesh>
          )}
        </Billboard>
      </group>
    </group>
  )
}
