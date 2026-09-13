import React, { useEffect, useRef } from 'react'

/**
 * AsciiDonut Component
 * Renders Andy Sloane's legendary 3D rotating ASCII donut (donut.c)
 * Optimized for 30fps animation directly updating a <pre> element
 * with minimal CPU footprint and zero React re-renders.
 */
export const AsciiDonut = ({ isLight = false }) => {
  const preRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    // 130 columns x 52 rows provides high-density ASCII shading that frames the middle section
    const cols = 130
    const rows = 52
    const b = new Array(cols * rows)
    const z = new Float32Array(cols * rows)
    const chars = '.,-~:;=!*#$@'

    let A = 0.5
    let B = 0.5
    let animationFrameId
    let lastTime = 0
    const frameInterval = 1000 / 30 // ~30 FPS for authentic retro terminal feel & low CPU

    // Mouse movement listener for subtle 3D interactive parallax tilt
    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1
      const normY = (e.clientY / window.innerHeight) * 2 - 1
      mouseRef.current.targetX = normX * 0.4
      mouseRef.current.targetY = normY * 0.4
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const renderFrame = (time) => {
      animationFrameId = requestAnimationFrame(renderFrame)

      // Throttle to target FPS
      if (time - lastTime < frameInterval) return
      lastTime = time

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      // Continuous serene rotation
      A += 0.035
      B += 0.018

      const curA = A + mouseRef.current.y
      const curB = B + mouseRef.current.x

      b.fill(' ')
      z.fill(0)

      const sinA = Math.sin(curA), cosA = Math.cos(curA)
      const sinB = Math.sin(curB), cosB = Math.cos(curB)

      const xOffset = cols / 2
      const yOffset = rows / 2
      // Fill the frame to match the full width and height of the middle hero section
      const xMult = cols * 0.60
      const yMult = rows * 0.72

      // Donut math: theta (i) and phi (j) with dense sampling steps
      for (let j = 0; j < 6.28; j += 0.05) {
        const cosJ = Math.cos(j), sinJ = Math.sin(j)
        for (let i = 0; i < 6.28; i += 0.018) {
          const sinI = Math.sin(i), cosI = Math.cos(i)
          const h = cosJ + 2
          const D = 1 / (sinI * h * sinA + sinJ * cosA + 5)
          const t = sinI * h * cosA - sinJ * sinA

          const x = Math.floor(xOffset + xMult * D * (cosI * h * cosB - t * sinB))
          const y = Math.floor(yOffset + yMult * D * (cosI * h * sinB + t * cosB))
          const o = x + cols * y
          const N = Math.floor(
            8 * ((sinJ * sinA - sinI * cosJ * cosA) * cosB - sinI * cosJ * sinA - sinJ * cosA - cosI * cosJ * sinB)
          )

          if (y >= 0 && y < rows && x >= 0 && x < cols && D > z[o]) {
            z[o] = D
            b[o] = chars[N > 0 ? (N < 12 ? N : 11) : 0]
          }
        }
      }

      // Assemble characters into newline-separated text
      let frameStr = ''
      for (let r = 0; r < rows; r++) {
        frameStr += b.slice(r * cols, (r + 1) * cols).join('') + '\n'
      }

      if (preRef.current) {
        preRef.current.textContent = frameStr
      }
    }

    // Render first frame immediately so there is zero flash on mount
    renderFrame(performance.now())

    // Pause animation when browser tab is inactive to save battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId)
      } else {
        lastTime = performance.now()
        animationFrameId = requestAnimationFrame(renderFrame)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      <pre
        ref={preRef}
        className={`font-mono transition-colors duration-300 ${
          isLight
            ? 'text-neutral-900/[0.25] font-semibold'
            : 'text-[#d4a373]/[0.09]'
        }`}
        style={{
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
          fontSize: 'clamp(9px, 1.15vw, 16px)',
          lineHeight: '0.78',
          letterSpacing: '-0.04em',
        }}
      />
    </div>
  )
}
