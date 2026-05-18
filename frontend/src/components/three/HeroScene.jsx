import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// ── Floating Holographic Document ────────────────────────────────────────────
function HoloDocument() {
  const meshRef = useRef()
  const edgeRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.15
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.08
    }
    if (edgeRef.current) {
      edgeRef.current.rotation.y = meshRef.current?.rotation.y ?? 0
      edgeRef.current.rotation.x = meshRef.current?.rotation.x ?? 0
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.8}>
      <group>
        {/* Document body */}
        <mesh ref={meshRef}>
          <planeGeometry args={[2.2, 2.8, 32, 32]} />
          <meshStandardMaterial
            color="#0a0f1e"
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Glowing border lines */}
        <lineSegments ref={edgeRef}>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.2, 2.8)]} />
          <lineBasicMaterial color="#00f5ff" transparent opacity={0.8} />
        </lineSegments>

        {/* Scanlines on document */}
        {[-0.9, -0.5, -0.1, 0.3, 0.7, 1.0].map((y, i) => (
          <mesh key={i} position={[0, y, 0.01]}>
            <planeGeometry args={[1.6 - i * 0.1, 0.06]} />
            <meshBasicMaterial
              color={i === 0 ? '#00f5ff' : '#4a5568'}
              transparent
              opacity={i === 0 ? 0.9 : 0.4}
            />
          </mesh>
        ))}

        {/* AI badge top-right */}
        <mesh position={[0.7, 1.2, 0.02]}>
          <planeGeometry args={[0.6, 0.2]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.9} />
        </mesh>
      </group>
    </Float>
  )
}

// ── Particle Field ────────────────────────────────────────────────────────────
function ParticleField() {
  const count = 1800
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return arr
  }, [])

  const pointsRef = useRef()
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00f5ff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

// ── Ambient Orbs ──────────────────────────────────────────────────────────────
function AmbientOrb({ position, color, size = 0.6 }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.3
    }
  })

  return (
    <Sphere ref={ref} args={[size, 32, 32]} position={position}>
      <MeshDistortMaterial
        color={color}
        transparent
        opacity={0.15}
        distort={0.4}
        speed={2}
        roughness={0}
      />
    </Sphere>
  )
}

// ── Grid Plane ────────────────────────────────────────────────────────────────
function GridPlane() {
  return (
    <gridHelper
      args={[20, 20, '#1a2744', '#111827']}
      position={[0, -4, 0]}
      rotation={[0, 0, 0]}
    />
  )
}

// ── Main Scene Component ──────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f5ff" />
      <pointLight position={[-5, -3, -5]} intensity={1} color="#a855f7" />
      <pointLight position={[0, 0, 3]} intensity={0.8} color="#3b82f6" />

      <Stars radius={60} depth={50} count={3000} factor={3} fade speed={0.5} />
      <ParticleField />
      <HoloDocument />
      <AmbientOrb position={[-4, 0, -2]} color="#a855f7" size={1.2} />
      <AmbientOrb position={[4, 1, -3]} color="#00f5ff" size={0.8} />
      <GridPlane />
    </>
  )
}

// ── Exported Canvas Wrapper ───────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <Canvas
      className="hero-canvas"
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  )
}
