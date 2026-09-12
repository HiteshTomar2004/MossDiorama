import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import { CLEARINGS, RIVER_POINTS, distToPolyline } from './mapConfig'

// ----------------------------------------------------------------------
// Static Instanced Meadow Grass (Wayfinder EnvironmentGrassSystem)
// View-space billboarded chalk sweeps that ALWAYS point towards the camera!
// Features continuous rolling wind wave and dynamic interactive bending.
// ----------------------------------------------------------------------

const GrassShaderMaterial = {
  uniforms: {
    time: { value: 0 },
    catPos: { value: new THREE.Vector3(0, 0, 0) },
    baseColor: { value: new THREE.Color('#f2ede4') }, // Warm paper chalk cream (no grey!)
    midColor: { value: new THREE.Color('#faf8f5') },  // Pure chalk ivory
    tipColor: { value: new THREE.Color('#ffffff') },  // Brilliant sparkling chalk white
  },
  vertexShader: /* glsl */ `
    attribute vec3 instanceOffset;
    attribute float instanceScale;

    uniform float time;
    uniform vec3 catPos;

    varying vec2 vUv;
    varying float vWave;

    void main() {
      vUv = uv;

      // 1. View-space billboarding: Anchor root point to exact ground coordinate in view space
      vec4 mvPosition = modelViewMatrix * vec4(instanceOffset, 1.0);

      // 2. Local 2D blade cluster coordinates in screen/view space
      vec2 localPos = position.xy * instanceScale;

      // 3. Continuous rolling wind wave rippling smoothly across the meadow
      float wavePhase = time * 2.8 + instanceOffset.x * 0.09 + instanceOffset.z * 0.09;
      float wave = sin(wavePhase) * 0.30 + sin(wavePhase * 1.7 + 0.5) * 0.12;

      // 4. Interactive push from player cat
      vec2 toCat = instanceOffset.xz - catPos.xz;
      float distToCat = length(toCat);
      vec2 pushDir = normalize(toCat + vec2(0.001));
      float pushStrength = smoothstep(2.4, 0.2, distToCat) * 1.15;
      float catScreenPush = (pushDir.x - pushDir.y) * 0.707 * pushStrength;

      // Displacement increases from root (0.0) to tips (1.0)
      float tipFactor = pow(uv.y, 1.15);
      float intraFlutter = sin(time * 3.6 + position.x * 4.0) * 0.05;
      localPos.x += (wave + intraFlutter + catScreenPush) * tipFactor * instanceScale;
      localPos.y -= pushStrength * 0.18 * tipFactor * instanceScale;

      // 5. Add billboard offset directly in view space:
      // localPos.x is horizontal across the screen, localPos.y is vertical up the screen!
      mvPosition.xy += localPos;

      vWave = sin(wavePhase);

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 baseColor;
    uniform vec3 midColor;
    uniform vec3 tipColor;

    varying vec2 vUv;
    varying float vWave;

    void main() {
      // Pure brilliant chalk gradient: warm cream root -> pure chalk ivory -> brilliant chalk white
      vec3 col = mix(baseColor, midColor, smoothstep(0.0, 0.35, vUv.y));
      col = mix(col, tipColor, smoothstep(0.35, 0.90, vUv.y));

      // Continuous shimmering light wave rolling across meadow
      col += vWave * 0.05 * vUv.y;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
}

export const InstancedMeadowGrass = () => {
  const meshRef = useRef()

  // Hand-crafted bold chalk grass clump (Wayfinder EnvironmentGrassSystem)
  // Bold, visible, painterly chalk brush flourishes in pure white!
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()

    // 14 bold natural chalk blades: [xCenter, halfWidth, lean, height]
    const bladeDefs = [
      // Central tall blades (bold, prominent chalk strokes)
      [ 0.00, 0.14,  0.04, 1.35],
      [-0.24, 0.13, -0.08, 1.25],
      [ 0.26, 0.13,  0.10, 1.22],
      // Mid-height arching blades
      [-0.52, 0.12, -0.22, 1.10],
      [ 0.54, 0.12,  0.24, 1.08],
      [-0.82, 0.11, -0.34, 0.95],
      [ 0.85, 0.11,  0.36, 0.92],
      // Outer arching blades
      [-1.15, 0.10, -0.46, 0.78],
      [ 1.18, 0.10,  0.48, 0.75],
      // Far ground accent sweeps
      [-1.45, 0.09, -0.58, 0.58],
      [ 1.48, 0.09,  0.60, 0.55],
      // Layer 2 filler blades (adds volume & thick painterly body to clump)
      [-0.12, 0.12, -0.04, 1.18],
      [ 0.14, 0.12,  0.06, 1.15],
      [ 0.02, 0.13,  0.02, 1.05],
    ]

    const vertices = []
    const uvs = []

    bladeDefs.forEach(([x, hw, lean, h]) => {
      // 3 vertices per blade triangle: (baseLeft, baseRight, tip)
      vertices.push(
        x - hw, 0.0, 0.0,
        x + hw, 0.0, 0.0,
        x + lean, h, 0.0
      )
      uvs.push(
        0.0, 0.0,
        1.0, 0.0,
        0.5, 1.0
      )
    })

    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    geo.computeVertexNormals()
    return geo
  }, [])

  // Generate lush grass patches across the realm (~2,300 patches)
  const { instancedGeo, count } = useMemo(() => {
    let seed = 42
    const prng = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const off = []
    const scl = []

    const addGrass = (x, z) => {
      // Avoid river water and bridge with generous margin
      if (distToPolyline(x, z, RIVER_POINTS) < 7.5) return
      if (Math.hypot(x - 30, z - (-26.5)) < 9.5) return

      // Keep clearings inner circle open (generous open space around campfire!)
      for (const key of Object.keys(CLEARINGS)) {
        const cl = CLEARINGS[key]
        const minR = key === 'campfire' ? 7.8 : cl.innerClearRadius - 1.0
        if (Math.hypot(x - cl.x, z - cl.z) < minR) return
      }

      // Keep lake water surface crystal clear
      if (Math.hypot(x - 101.5, z - (-77.0)) < 13.0) return

      off.push(x, 0.02, z)
      scl.push(0.85 + prng() * 0.40)
    }

    // 1. Lush grass patches distributed across the paper meadow (~1,200 patches)
    const meadowTufts = 1200
    for (let i = 0; i < meadowTufts; i++) {
      const gx = (prng() - 0.5) * 310
      const gz = (prng() - 0.5) * 310
      addGrass(gx, gz)
    }

    // 2. Gentle outer framing grass only beyond the campfire clearing perimeter
    for (let i = 0; i < 14; i++) {
      const angle = prng() * Math.PI * 2
      const r = 8.5 + prng() * 3.5
      addGrass(Math.cos(angle) * r, Math.sin(angle) * r)
    }

    // 3. Dense lush framing around glades and sanctuaries
    for (const key of Object.keys(CLEARINGS)) {
      const cl = CLEARINGS[key]
      const count = 35
      for (let i = 0; i < count; i++) {
        const angle = prng() * Math.PI * 2
        const r = cl.innerClearRadius + 0.5 + prng() * (cl.radius - cl.innerClearRadius + 6.0)
        const x = cl.x + Math.cos(angle) * r
        const z = cl.z + Math.sin(angle) * r
        addGrass(x, z)
      }
    }

    const igeo = new THREE.InstancedBufferGeometry()
    igeo.copy(geometry)
    igeo.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(new Float32Array(off), 3))
    igeo.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(new Float32Array(scl), 1))
    igeo.instanceCount = off.length / 3
    igeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 220)

    return { instancedGeo: igeo, count: off.length / 3 }
  }, [geometry])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      ...GrassShaderMaterial,
      side: THREE.DoubleSide,
    })
  }, [])

  useFrame(({ clock }) => {
    if (material) {
      material.uniforms.time.value = clock.getElapsedTime()
      const catPos = usePortfolioStore.getState().catCurrentPos
      if (catPos) {
        material.uniforms.catPos.value.set(catPos[0], catPos[1], catPos[2])
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={instancedGeo}
      material={material}
      frustumCulled={false}
    />
  )
}
