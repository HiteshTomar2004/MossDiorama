import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RIVER_POINTS } from './mapConfig'

// ─────────────────────────────────────────────────────────────────
// Authentic Wayfinder Watercolor / Gouache River Water
// Soft luminous cerulean-teal watercolor wash, longitudinal flowing
// foam currents, subtle paper grain, and soft painterly shoreline rim.
// ZERO harsh royal navy blue, ZERO swimming-pool blob caustics!
// ─────────────────────────────────────────────────────────────────
const WaterShader = {
  uniforms: {
    time: { value: 0 },
    deepColor: { value: new THREE.Color('#22799e') },       // Luminous gouache teal-cerulean
    midColor: { value: new THREE.Color('#389ec4') },        // Bright storybook sky turquoise
    shallowColor: { value: new THREE.Color('#78cde3') },    // Pale sea-glass watercolor wash
    shoreGlowColor: { value: new THREE.Color('#c2edf7') },  // Delicate paper-wash rim
  },
  vertexShader: /* glsl */ `
    uniform float time;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float time;
    uniform vec3 deepColor;
    uniform vec3 midColor;
    uniform vec3 shallowColor;
    uniform vec3 shoreGlowColor;

    varying vec2 vUv;

    void main() {
      // Cross-river depth: 0 at center, 1 at shore
      float shore = abs(vUv.y - 0.5) * 2.0;

      // 1. Soft, luminous watercolor gradient across the river width
      vec3 col = mix(deepColor, midColor, smoothstep(0.0, 0.60, shore));
      col = mix(col, shallowColor, smoothstep(0.55, 0.88, shore));

      // 2. Longitudinal flowing paper stream ripples (flowing along river length U)
      float flow = time * 0.45;
      float streak1 = sin(vUv.x * 72.0 - flow * 4.2 + sin(vUv.y * 14.0 + time * 0.5) * 1.6);
      float streak2 = cos(vUv.x * 105.0 - flow * 5.6 + cos(vUv.y * 18.0 - time * 0.4) * 1.4);
      float flowFoam = smoothstep(0.85, 0.98, streak1 * 0.5 + streak2 * 0.5);

      // Delicate micro-current ripples
      float currentLine = sin(vUv.y * 28.0 + sin(vUv.x * 45.0 - flow * 2.8) * 1.3);
      float currentFoam = smoothstep(0.92, 0.99, currentLine) * 0.28;

      // Blend subtle flowing white painted ripples
      float foamCombined = (flowFoam * 0.42 + currentFoam) * (1.0 - shore * 0.35);
      col = mix(col, vec3(0.94, 0.98, 1.0), foamCombined);

      // 3. Delicate chalk white painted rim at shoreline
      float shoreGlow = smoothstep(0.72, 0.92, shore);
      col = mix(col, shoreGlowColor, shoreGlow * 0.65);

      float whiteRim = smoothstep(0.91, 0.98, shore);
      col = mix(col, vec3(1.0, 1.0, 1.0), whiteRim * 0.82);

      // 4. Soft edge feather so water rests naturally on watercolor paper
      float alpha = mix(0.94, 0.72, smoothstep(0.92, 1.0, shore));

      gl_FragColor = vec4(col, alpha);
    }
  `,
}

export const RiverWater = () => {
  const geometry = useMemo(() => {
    // CatmullRom spline for smooth, organic river bends
    const splineVecs = RIVER_POINTS.map((p) => new THREE.Vector3(p[0], 0, p[1]))
    const curve = new THREE.CatmullRomCurve3(splineVecs, false, 'catmullrom', 0.5)

    const numSamples = 200
    const pts = curve.getSpacedPoints(numSamples)
    const halfW = 5.5

    const positions = []
    const uvs = []
    const indices = []

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]

      // Smooth tangent
      let tangent
      if (i < pts.length - 1) {
        tangent = pts[i + 1].clone().sub(p).normalize()
      } else {
        tangent = p.clone().sub(pts[i - 1]).normalize()
      }

      // Perpendicular normal in XZ plane
      const nx = -tangent.z
      const nz = tangent.x

      positions.push(p.x - nx * halfW, 0.07, p.z - nz * halfW)
      positions.push(p.x + nx * halfW, 0.07, p.z + nz * halfW)

      const u = i / (pts.length - 1)
      uvs.push(u, 0)
      uvs.push(u, 1)

      if (i < pts.length - 1) {
        const j = i * 2
        indices.push(j, j + 1, j + 2)
        indices.push(j + 1, j + 3, j + 2)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...WaterShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  )

  useFrame(({ clock }) => {
    material.uniforms.time.value = clock.getElapsedTime()
  })

  return (
    <group name="river-water-group">
      <mesh geometry={geometry} material={material} renderOrder={2} />
    </group>
  )
}

