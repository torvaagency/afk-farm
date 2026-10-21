import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Edges, Html, OrbitControls, Sparkles, useCursor, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { PLANTS } from "./constants"
import type { FarmSlot } from "./useGameStore"

/* -------------------------------------------------------------------------- */
/*  Crop looks – every plant maps onto a small set of low-poly "kinds"         */
/* -------------------------------------------------------------------------- */

type Kind =
  | "grass"
  | "carrot"
  | "potato"
  | "stalk"
  | "shroom"
  | "bush"
  | "conifer"
  | "tree"
  | "flower"
  | "gem"
  | "swirl"

interface Look {
  kind: Kind
  color: string // main body colour
  accent: string // fruit / petal / cap colour
  glow?: boolean
}

const LOOKS: Record<string, Look> = {
  wheat: { kind: "grass", color: "#9bbf3a", accent: "#e8c84a" },
  carrot: { kind: "carrot", color: "#3f9b3a", accent: "#f08a24" },
  corn: { kind: "stalk", color: "#4aa543", accent: "#f2d23c" },
  mushroom: { kind: "shroom", color: "#efe6d2", accent: "#d63a3a" },
  tomato: { kind: "bush", color: "#3f9b3a", accent: "#e53935" },
  potato: { kind: "potato", color: "#3f9b3a", accent: "#b8895a" },
  pine: { kind: "conifer", color: "#1f6b3a", accent: "#6b4a2b" },
  oak: { kind: "tree", color: "#3f9b3a", accent: "#6b4a2b" },
  strawberry: { kind: "bush", color: "#3f9b3a", accent: "#ff4d6d" },
  grapes: { kind: "bush", color: "#3f9b3a", accent: "#8e44ad" },
  mana_blossom: { kind: "flower", color: "#3fae6a", accent: "#ff7ad9", glow: true },
  dragon_pepper: { kind: "bush", color: "#2f7d32", accent: "#ff3b1f", glow: true },
  starfruit: { kind: "gem", color: "#3f9b3a", accent: "#ffd93b", glow: true },
  moonflower: { kind: "flower", color: "#4a6fb0", accent: "#cfe3ff", glow: true },
  solar_lily: { kind: "flower", color: "#5da83a", accent: "#ffb020", glow: true },
  crystal_fruit: { kind: "gem", color: "#4aa5c9", accent: "#6fe3ff", glow: true },
  golden_apple: { kind: "bush", color: "#3f9b3a", accent: "#ffcf24", glow: true },
  eternity_seed: { kind: "swirl", color: "#6a4bd6", accent: "#b78cff", glow: true },
}

const FALLBACK_LOOK: Look = { kind: "bush", color: "#3f9b3a", accent: "#e53935" }

function Mat({ color, glow = 0 }: { color: string; glow?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      flatShading
      roughness={0.85}
      metalness={0.05}
      emissive={glow > 0 ? color : "#000000"}
      emissiveIntensity={glow}
    />
  )
}

/* ------------------------------ Crop models ------------------------------- */

function Sprout() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow>
        <coneGeometry args={[0.05, 0.24, 5]} />
        <Mat color="#5fd24a" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.09, 0.2, 0]} rotation={[0, 0, -s * 0.9]} scale={[1, 0.35, 0.6]} castShadow>
          <icosahedronGeometry args={[0.1, 0]} />
          <Mat color="#6be05a" />
        </mesh>
      ))}
    </group>
  )
}

function Leaves({ color, count = 4, radius = 0.12, height = 0.35 }: { color: string; count?: number; radius?: number; height?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * radius, height / 2, Math.sin(a) * radius]}
            rotation={[Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35]}
            castShadow
          >
            <coneGeometry args={[0.07, height, 4]} />
            <Mat color={color} />
          </mesh>
        )
      })}
    </>
  )
}

function CropModel({ look }: { look: Look }) {
  const { kind, color, accent } = look
  const glow = look.glow ? 0.45 : 0

  switch (kind) {
    case "grass":
      return (
        <group>
          {Array.from({ length: 9 }).map((_, i) => {
            const a = i * 2.4
            const r = 0.1 + (i % 3) * 0.12
            return (
              <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} rotation={[Math.sin(a) * 0.12, 0, Math.cos(a) * 0.12]}>
                <mesh position={[0, 0.3, 0]} castShadow>
                  <boxGeometry args={[0.04, 0.6, 0.04]} />
                  <Mat color={color} />
                </mesh>
                <mesh position={[0, 0.66, 0]} castShadow>
                  <boxGeometry args={[0.08, 0.22, 0.08]} />
                  <Mat color={accent} />
                </mesh>
              </group>
            )
          })}
        </group>
      )

    case "carrot":
      return (
        <group>
          <Leaves color={color} count={5} radius={0.06} height={0.5} />
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.12, 0.32, 6]} />
            <Mat color={accent} />
          </mesh>
        </group>
      )

    case "potato":
      return (
        <group>
          <Leaves color={color} count={5} radius={0.1} height={0.45} />
          {[
            [-0.18, 0.08, 0.1],
            [0.15, 0.07, 0.15],
            [0.02, 0.07, -0.2],
          ].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]} scale={[1.1, 0.7, 0.9]} castShadow>
              <dodecahedronGeometry args={[0.12, 0]} />
              <Mat color={accent} />
            </mesh>
          ))}
        </group>
      )

    case "stalk":
      return (
        <group>
          {[
            [-0.12, 0.08],
            [0.14, -0.06],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh position={[0, 0.45, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.06, 0.9, 6]} />
                <Mat color={color} />
              </mesh>
              {[0.35, 0.55].map((y, j) => (
                <mesh key={j} position={[0.12 * (j ? -1 : 1), y, 0]} rotation={[0, 0, (j ? 1 : -1) * 0.8]} scale={[1, 0.15, 0.4]} castShadow>
                  <boxGeometry args={[0.35, 0.35, 0.35]} />
                  <Mat color={color} />
                </mesh>
              ))}
              <mesh position={[0.07, 0.62, 0]} rotation={[0, 0, -0.2]} castShadow>
                <cylinderGeometry args={[0.07, 0.05, 0.3, 6]} />
                <Mat color={accent} />
              </mesh>
            </group>
          ))}
        </group>
      )

    case "shroom":
      return (
        <group>
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.11, 0.28, 6]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0, 0.27, 0]} castShadow>
            <sphereGeometry args={[0.32, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat color={accent} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = i * 1.3
            return (
              <mesh key={i} position={[Math.cos(a) * 0.17, 0.38 - (i % 2) * 0.07, Math.sin(a) * 0.17]}>
                <icosahedronGeometry args={[0.04, 0]} />
                <meshStandardMaterial color="#ffffff" flatShading />
              </mesh>
            )
          })}
        </group>
      )

    case "bush":
      return (
        <group>
          <mesh position={[0, 0.3, 0]} scale={[1, 0.8, 1]} castShadow>
            <icosahedronGeometry args={[0.36, 0]} />
            <Mat color={color} />
          </mesh>
          {Array.from({ length: 7 }).map((_, i) => {
            const a = i * 0.9
            const y = 0.18 + (i % 3) * 0.12
            return (
              <mesh key={i} position={[Math.cos(a) * 0.34, y, Math.sin(a) * 0.34]} castShadow>
                <icosahedronGeometry args={[0.085, 0]} />
                <Mat color={accent} glow={glow || 0.15} />
              </mesh>
            )
          })}
        </group>
      )

    case "conifer":
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.24, 5]} />
            <Mat color={accent} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.35 + i * 0.28, 0]} castShadow>
              <coneGeometry args={[0.38 - i * 0.1, 0.5, 6]} />
              <Mat color={color} />
            </mesh>
          ))}
        </group>
      )

    case "tree":
      return (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 0.5, 6]} />
            <Mat color={accent} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <icosahedronGeometry args={[0.38, 0]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0.2, 0.55, 0.1]} castShadow>
            <icosahedronGeometry args={[0.24, 0]} />
            <Mat color="#4fb04a" />
          </mesh>
        </group>
      )

    case "flower":
      return (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.5, 5]} />
            <Mat color={color} />
          </mesh>
          <Leaves color={color} count={3} radius={0.08} height={0.28} />
          <group position={[0, 0.55, 0]}>
            {Array.from({ length: 7 }).map((_, i) => {
              const a = (i / 7) * Math.PI * 2
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15]}
                  rotation={[0, -a, 0.35]}
                  scale={[1, 0.25, 0.6]}
                  castShadow
                >
                  <icosahedronGeometry args={[0.13, 0]} />
                  <Mat color={accent} glow={glow} />
                </mesh>
              )
            })}
            <mesh>
              <icosahedronGeometry args={[0.08, 0]} />
              <Mat color="#fff3a0" glow={0.8} />
            </mesh>
          </group>
          {look.glow && <pointLight position={[0, 0.6, 0]} color={accent} intensity={0.6} distance={1.6} />}
        </group>
      )

    case "gem":
      return (
        <group>
          <Leaves color="#3f9b3a" count={4} radius={0.12} height={0.3} />
          <Spinner y={0.62} speed={0.8}>
            <mesh castShadow>
              <octahedronGeometry args={[0.22, 0]} />
              <Mat color={accent} glow={0.7} />
            </mesh>
          </Spinner>
          <pointLight position={[0, 0.65, 0]} color={accent} intensity={0.7} distance={1.8} />
        </group>
      )

    case "swirl":
      return (
        <group>
          <Spinner y={0.55} speed={1.2}>
            <mesh castShadow>
              <torusKnotGeometry args={[0.18, 0.055, 48, 8]} />
              <Mat color={accent} glow={0.8} />
            </mesh>
          </Spinner>
          <pointLight position={[0, 0.6, 0]} color={accent} intensity={0.8} distance={2} />
        </group>
      )
  }
}

function Spinner({ y, speed, children }: { y: number; speed: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((s, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * speed
    ref.current.position.y = y + Math.sin(s.clock.elapsedTime * 2) * 0.04
  })
  return <group ref={ref} position={[0, y, 0]}>{children}</group>
}

/* --------------------------------- Plots ---------------------------------- */

const SOIL_TOP = 0.2
const GROW_FROM_SPROUT = 0.34

interface PlotProps {
  index: number
  position: [number, number, number]
  slot: FarmSlot | null
  isSpeedBoosted: boolean
  isSelected: boolean
  isDarkMode: boolean
  onSelect: (index: number) => void
}

function Plot({ index, position, slot, isSpeedBoosted, isSelected, isDarkMode, onSelect }: PlotProps) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const texture = useTexture("/farm-patch.jpg")
  const plant = slot ? PLANTS[slot.plantId] : null
  const look = (slot && LOOKS[slot.plantId]) || FALLBACK_LOOK

  const sproutRef = useRef<THREE.Group>(null)
  const cropRef = useRef<THREE.Group>(null)
  const barRef = useRef<THREE.Group>(null)
  const barWrapRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  useFrame((state) => {
    let growth = 0
    let remaining = 0
    if (slot && plant) {
      const mult = isSpeedBoosted ? 2 : 1
      const elapsed = ((Date.now() - slot.plantedAt) / 1000) * mult
      growth = slot.isHarvestable ? 1 : Math.min(1, elapsed / plant.growTime)
      remaining = slot.isHarvestable ? 0 : Math.max(0, Math.ceil((plant.growTime - elapsed) / mult))
    }
    const ready = !!slot?.isHarvestable
    const t = state.clock.elapsedTime

    if (sproutRef.current) {
      sproutRef.current.visible = !!slot && growth < GROW_FROM_SPROUT
      const s = 0.6 + (growth / GROW_FROM_SPROUT) * 0.6
      sproutRef.current.scale.setScalar(s)
    }
    if (cropRef.current) {
      const show = !!slot && growth >= GROW_FROM_SPROUT
      cropRef.current.visible = show
      const g = Math.max(0, (growth - GROW_FROM_SPROUT) / (1 - GROW_FROM_SPROUT))
      const base = 0.4 + 0.6 * g
      const pulse = ready ? 1 + Math.sin(t * 4) * 0.04 : 1
      cropRef.current.scale.setScalar(base * pulse)
      cropRef.current.position.y = SOIL_TOP + (ready ? Math.abs(Math.sin(t * 2.5)) * 0.06 : 0)
      cropRef.current.rotation.y = ready ? Math.sin(t * 1.5) * 0.15 : 0
    }
    if (barWrapRef.current && barRef.current) {
      barWrapRef.current.visible = !!slot && !ready
      barRef.current.scale.x = Math.max(0.001, growth)
    }
    if (ringRef.current) {
      ringRef.current.visible = ready
      ringRef.current.rotation.z = t * 1.5
    }
    if (hovered && labelRef.current && plant) {
      labelRef.current.textContent = ready ? `${plant.name} - READY` : `${plant.name} - ${remaining}s`
    }
  })

  const soil = isDarkMode ? "#6b4a30" : "#8a6240"

  return (
    <group position={position}>
      {/* grass rim */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[1.06, 0.08, 1.06]} />
        <meshStandardMaterial color={isDarkMode ? "#2d6a35" : "#4fa850"} flatShading roughness={1} />
      </mesh>

      {/* soil block */}
      <mesh
        position={[0, 0.11, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          onSelect(index)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.94, 0.18, 0.94]} />
        <meshStandardMaterial color={soil} flatShading roughness={1} />
        {(hovered || isSelected) && <Edges color={isSelected ? "#22d3ee" : "#ffffff"} threshold={15} />}
      </mesh>
      {/* textured soil top */}
      <mesh position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.92, 0.92]} />
        <meshStandardMaterial map={texture} color={isDarkMode ? "#9a8a80" : "#c8b8a8"} roughness={1} />
      </mesh>

      {/* crops */}
      <group ref={sproutRef} position={[0, SOIL_TOP, 0]} visible={false}>
        <Sprout />
      </group>
      <group ref={cropRef} position={[0, SOIL_TOP, 0]} visible={false}>
        <CropModel look={look} />
      </group>

      {/* growth progress bar on the front edge. Track and fill must never share a coplanar face (z-fighting), so the fill is shorter and sits in front of the track. */}
      <group ref={barWrapRef} position={[-0.4, 0.07, 0.58]} visible={false}>
        <mesh position={[0.4, 0, 0]} renderOrder={1}>
          <boxGeometry args={[0.8, 0.07, 0.05]} />
          <meshBasicMaterial color="#0b1a22" />
        </mesh>
        <group ref={barRef}>
          <mesh position={[0.4, 0, 0.02]} renderOrder={2}>
            <boxGeometry args={[0.8, 0.045, 0.05]} />
            <meshBasicMaterial color={isSpeedBoosted ? "#c084fc" : "#22d3ee"} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* harvest-ready halo */}
      <mesh ref={ringRef} position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[0.46, 0.02, 6, 24]} />
        <meshBasicMaterial color="#22d3ee" toneMapped={false} />
      </mesh>
      {slot?.isHarvestable && (
        <Sparkles count={10} scale={[0.9, 1.1, 0.9]} position={[0, 0.7, 0]} size={3} speed={0.6} color="#67e8f9" />
      )}

      {/* hover label */}
      {hovered && plant && (
        <Html position={[0, 1.35, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
          <div
            ref={labelRef}
            className="whitespace-nowrap border border-cyan-500/50 bg-black/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-300"
          />
        </Html>
      )}
    </group>
  )
}

interface BuyPlotProps {
  position: [number, number, number]
  cost: number
  affordable: boolean
  onBuy: () => void
}

function BuyPlot({ position, cost, affordable, onBuy }: BuyPlotProps) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered && affordable)
  const ref = useRef<THREE.Mesh>(null)

  useFrame((s) => {
    if (ref.current) ref.current.position.y = 0.14 + Math.sin(s.clock.elapsedTime * 2) * 0.03
  })

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          if (affordable) onBuy()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.94, 0.14, 0.94]} />
        <meshStandardMaterial
          color="#22d3ee"
          transparent
          opacity={hovered && affordable ? 0.55 : 0.28}
          emissive="#22d3ee"
          emissiveIntensity={affordable ? 0.5 : 0.1}
          flatShading
        />
        <Edges color={affordable ? "#22d3ee" : "#475569"} />
      </mesh>
      <Html position={[0, 0.5, 0]} center style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
        <div className={`whitespace-nowrap text-center font-mono text-[10px] uppercase ${affordable ? "text-cyan-300" : "text-neutral-500"}`}>
          <div className="font-bold">Buy node</div>
          <div className="opacity-70">${cost.toLocaleString()}</div>
        </div>
      </Html>
    </group>
  )
}

/* ---------------------------------- Scene --------------------------------- */

const COLS = 8
const PITCH = 1.15

function CameraRig({ cols, rows }: { cols: number; rows: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null)

  const aspect = size.width / Math.max(1, size.height)
  const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
  const elev = THREE.MathUtils.degToRad(52)
  const needW = (cols * PITCH * 1.15) / (2 * halfTan * aspect)
  const needD = (rows * PITCH * Math.sin(elev) + 1.6) / (2 * halfTan * 0.85)
  const dist = Math.max(4, needW, needD)

  useEffect(() => {
    camera.position.set(0, Math.sin(elev) * dist, Math.cos(elev) * dist)
    camera.lookAt(0, 0.2, 0)
    controls.current?.update()
  }, [camera, dist, elev])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 0.2, 0]}
      enablePan={false}
      minDistance={dist * 0.45}
      maxDistance={dist * 1.5}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2.15}
      enableDamping
    />
  )
}

export interface FarmScene3DProps {
  slots: (FarmSlot | null)[]
  unlockedSlots: number
  nextSlotCost: number
  money: number
  isSpeedBoosted: boolean
  isDarkMode: boolean
  selectedPlot: number | null
  onSelectPlot: (index: number) => void
  onBuySlot: () => void
}

export default function FarmScene3D({
  slots,
  unlockedSlots,
  nextSlotCost,
  money,
  isSpeedBoosted,
  isDarkMode,
  selectedPlot,
  onSelectPlot,
  onBuySlot,
}: FarmScene3DProps) {
  const visible = Math.min(unlockedSlots + 1, slots.length) // unlocked plots + the next purchasable one
  const cols = Math.min(COLS, visible)
  const rows = Math.ceil(visible / COLS)

  const posFor = (i: number): [number, number, number] => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    return [(col - (cols - 1) / 2) * PITCH, 0, (row - (rows - 1) / 2) * PITCH]
  }

  const sky = isDarkMode ? "#050a12" : "#cfe8f5"

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 40, near: 0.1, far: 100 }} gl={{ antialias: true }}>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 18, 40]} />

      <ambientLight intensity={isDarkMode ? 1.0 : 0.9} color={isDarkMode ? "#a9c1ff" : "#ffffff"} />
      <directionalLight
        position={[6, 10, 5]}
        intensity={isDarkMode ? 1.9 : 1.8}
        color={isDarkMode ? "#cfe0ff" : "#fff2d6"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />

      <CameraRig cols={cols} rows={rows} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[22, 40]} />
        <meshStandardMaterial color={isDarkMode ? "#10261a" : "#6bbf6b"} flatShading roughness={1} />
      </mesh>

      {isDarkMode && <Sparkles count={50} scale={[14, 4, 10]} position={[0, 2, 0]} size={2} speed={0.25} color="#22d3ee" />}

      <Suspense fallback={null}>
        {slots.slice(0, visible).map((slot, i) => {
          if (i < unlockedSlots) {
            return (
              <Plot
                key={i}
                index={i}
                position={posFor(i)}
                slot={slot}
                isSpeedBoosted={isSpeedBoosted}
                isSelected={selectedPlot === i}
                isDarkMode={isDarkMode}
                onSelect={onSelectPlot}
              />
            )
          }
          return <BuyPlot key={i} position={posFor(i)} cost={nextSlotCost} affordable={money >= nextSlotCost} onBuy={onBuySlot} />
        })}
      </Suspense>
    </Canvas>
  )
}
