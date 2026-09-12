import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// -------------------------------------------------------------
// Winding Forest River (from Concept Art media_1789144682813.jpg)
// Animated surface currents, teal-emerald depth, and shore foam
// -------------------------------------------------------------
const RiverWaterShader = {
  uniforms: {
    time: { value: 0 },
    deepColor: { value: new THREE.Color('#1a473f') },  // Deep glacial teal
    surfColor: { value: new THREE.Color('#387e74') },  // Sunlit emerald green
    foamColor: { value: new THREE.Color('#d1fae5') },  // Crest foam
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    uniform float time;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Gentle river surface undulation
      float wave = sin(time * 2.2 + pos.x * 0.4 + pos.z * 0.6) * 0.08;
      wave += cos(time * 1.5 + pos.x * 0.8) * 0.04;
      pos.y += wave;

      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float time;
    uniform vec3 deepColor;
    uniform vec3 surfColor;
    uniform vec3 foamColor;

    varying vec2 vUv;
    varying vec3 vWorldPos;

    void main() {
      // Flowing ripples
      float flow = time * 0.45;
      float ripple1 = sin(vUv.x * 24.0 + flow * 4.0 + sin(vUv.y * 12.0)) * 0.5 + 0.5;
      float ripple2 = cos(vUv.y * 18.0 - flow * 3.5 + cos(vUv.x * 16.0)) * 0.5 + 0.5;
      float ripples = (ripple1 + ripple2) * 0.5;

      // Base water depth gradient
      vec3 col = mix(deepColor, surfColor, ripples * 0.6 + vUv.y * 0.4);

      // Shore edge foam (along vUv.y edges)
      float shoreDist = min(vUv.y, 1.0 - vUv.y) * 2.0; // 0 at edges, 1 at center
      float foamMask = smoothstep(0.35, 0.05, shoreDist);
      float foamNoise = sin(vUv.x * 40.0 + time * 3.0) * 0.5 + 0.5;
      col = mix(col, foamColor, foamMask * foamNoise * 0.75);

      // Subtle water shimmer specular
      col += vec3(pow(ripples, 4.0) * 0.22);

      gl_FragColor = vec4(col, 0.88);
    }
  `,
}

export const ForestRiver = () => {
  const matRef = useRef()

  // Build curved ribbon geometry along the river path
  const riverGeometry = useMemo(() => {
    // Control points along the natural meandering curve
    const riverPoints = [
      new THREE.Vector3(-125, -0.08, -120),
      new THREE.Vector3(-85, -0.08, -85),
      new THREE.Vector3(-60, -0.08, -65),
      new THREE.Vector3(-42, -0.08, -45), // Passes under wooden bridge!
      new THREE.Vector3(-28, -0.08, -25),
      new THREE.Vector3(-45, -0.08, -5),
      new THREE.Vector3(-80, -0.08, 5),
      new THREE.Vector3(-125, -0.08, 15),
    ]

    const curve = new THREE.CatmullRomCurve3(riverPoints, false, 'catmullrom', 0.5)
    const samples = curve.getSpacedPoints(80)

    const RIVER_WIDTH = 7.5
    const verts = []
    const uvs = []
    const indices = []

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i]
      const nextP = samples[Math.min(i + 1, samples.length - 1)]
      const prevP = samples[Math.max(0, i - 1)]
      const tangent = new THREE.Vector3().subVectors(nextP, prevP).normalize()
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()

      // Left and right bank vertices
      const left = p.clone().addScaledVector(normal, -RIVER_WIDTH / 2)
      const right = p.clone().addScaledVector(normal, RIVER_WIDTH / 2)

      verts.push(left.x, left.y, left.z)
      verts.push(right.x, right.y, right.z)

      const u = i / (samples.length - 1)
      uvs.push(u, 0.0)
      uvs.push(u, 1.0)

      if (i < samples.length - 1) {
        const base = i * 2
        indices.push(base, base + 1, base + 2)
        indices.push(base + 1, base + 3, base + 2)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      ...RiverWaterShader,
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [])

  useFrame(({ clock }) => {
    if (material) {
      material.uniforms.time.value = clock.getElapsedTime()
    }
  })

  // Riverbank pebbles and mossy stones along the water's edge
  const riverStones = [
    [-62, 0.05, -70], [-56, 0.05, -60], [-36, 0.05, -50], [-48, 0.05, -40],
    [-22, 0.05, -28], [-24, 0.05, -18], [-52, 0.05, -10], [-74, 0.05, 0],
  ]

  return (
    <group>
      {/* Animated River Water Mesh */}
      <mesh geometry={riverGeometry} material={material} />

      {/* Riverbank Boulders */}
      {riverStones.map(([sx, sy, sz], idx) => (
        <mesh key={idx} position={[sx, sy, sz]} rotation={[-0.2, idx, 0]}>
          <dodecahedronGeometry args={[0.65 + (idx % 3) * 0.25, 0]} />
          <meshStandardMaterial color={idx % 2 === 0 ? '#48554e' : '#3a443e'} roughness={0.88} />
        </mesh>
      ))}
    </group>
  )
}
