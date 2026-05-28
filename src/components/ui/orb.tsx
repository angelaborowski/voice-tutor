import { useEffect, useMemo, useRef, type CSSProperties, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

import { fragmentShader, vertexShader } from "./orb-shaders"
import { clamp01, splitmix32 } from "./orb-utils"

export type AgentState = null | "thinking" | "listening" | "talking"

type OrbProps = {
  colors?: [string, string]
  colorsRef?: RefObject<[string, string]>
  resizeDebounce?: number
  seed?: number
  agentState?: AgentState
  volumeMode?: "auto" | "manual"
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: RefObject<number>
  outputVolumeRef?: RefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
  inverted?: boolean
  className?: string
}

export function Orb({
  colors = ["#CADCFC", "#A0B9D1"],
  colorsRef,
  resizeDebounce = 100,
  seed,
  agentState = null,
  volumeMode = "auto",
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
  inverted,
  className,
}: OrbProps) {
  return (
    <div
      className={className ?? "relative h-full w-full"}
      style={
        {
          "--orb-color-a": colors[0],
          "--orb-color-b": colors[1],
        } as CSSProperties
      }
    >
      <Canvas
        resize={{ debounce: resizeDebounce }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
        }}
      >
        <Scene
          colors={colors}
          colorsRef={colorsRef}
          seed={seed}
          agentState={agentState}
          volumeMode={volumeMode}
          manualInput={manualInput}
          manualOutput={manualOutput}
          inputVolumeRef={inputVolumeRef}
          outputVolumeRef={outputVolumeRef}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
          inverted={inverted}
        />
      </Canvas>
    </div>
  )
}

function Scene({
  colors,
  colorsRef,
  seed,
  agentState,
  volumeMode,
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
  inverted,
}: {
  colors: [string, string]
  colorsRef?: RefObject<[string, string]>
  seed?: number
  agentState: AgentState
  volumeMode: "auto" | "manual"
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: RefObject<number>
  outputVolumeRef?: RefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
  inverted?: boolean
}) {
  const { gl } = useThree()
  const circleRef =
    useRef<THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial>>(null)
  const initialColorsRef = useRef<[string, string]>(colors)
  const targetColor1Ref = useRef(new THREE.Color(colors[0]))
  const targetColor2Ref = useRef(new THREE.Color(colors[1]))
  const animSpeedRef = useRef(0.1)
  const perlinNoiseTexture = useMemo(() => createNoiseTexture(seed), [seed])

  const agentRef = useRef<AgentState>(agentState)
  const modeRef = useRef<"auto" | "manual">(volumeMode)
  const manualInRef = useRef<number>(manualInput ?? 0)
  const manualOutRef = useRef<number>(manualOutput ?? 0)
  const curInRef = useRef(0)
  const curOutRef = useRef(0)

  useEffect(() => {
    agentRef.current = agentState
  }, [agentState])

  useEffect(() => {
    modeRef.current = volumeMode
  }, [volumeMode])

  useEffect(() => {
    manualInRef.current = clamp01(
      manualInput ?? inputVolumeRef?.current ?? getInputVolume?.() ?? 0
    )
  }, [manualInput, inputVolumeRef, getInputVolume])

  useEffect(() => {
    manualOutRef.current = clamp01(
      manualOutput ?? outputVolumeRef?.current ?? getOutputVolume?.() ?? 0
    )
  }, [manualOutput, outputVolumeRef, getOutputVolume])

  const random = useMemo(
    () => splitmix32(seed ?? Math.floor(Math.random() * 2 ** 32)),
    [seed]
  )
  const offsets = useMemo(
    () =>
      new Float32Array(Array.from({ length: 7 }, () => random() * Math.PI * 2)),
    [random]
  )

  useEffect(() => {
    targetColor1Ref.current = new THREE.Color(colors[0])
    targetColor2Ref.current = new THREE.Color(colors[1])
  }, [colors])

  useEffect(() => {
    const apply = () => {
      if (!circleRef.current) return
      const isDark =
        inverted ?? document.documentElement.classList.contains("dark")
      circleRef.current.material.uniforms.uInverted.value = isDark ? 1 : 0
    }

    apply()

    const observer = new MutationObserver(apply)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [inverted])

  useFrame((_, delta: number) => {
    const mat = circleRef.current?.material
    if (!mat) return
    const live = colorsRef?.current
    if (live) {
      if (live[0]) targetColor1Ref.current.set(live[0])
      if (live[1]) targetColor2Ref.current.set(live[1])
    }
    const u = mat.uniforms
    u.uTime.value += delta * 0.68

    if (u.uOpacity.value < 1) {
      u.uOpacity.value = Math.min(1, u.uOpacity.value + delta * 2)
    }

    let targetIn = 0
    let targetOut = 0.3
    const liveInput = manualInput ?? inputVolumeRef?.current ?? getInputVolume?.()
    const liveOutput = manualOutput ?? outputVolumeRef?.current ?? getOutputVolume?.()
    const hasVolumeSource =
      liveInput !== undefined ||
      liveOutput !== undefined ||
      Boolean(inputVolumeRef || outputVolumeRef || getInputVolume || getOutputVolume)

    if (modeRef.current === "manual") {
      targetIn = clamp01(liveInput ?? 0)
      targetOut = clamp01(liveOutput ?? 0)
    } else if (hasVolumeSource) {
      const t = u.uTime.value * 2
      const input = clamp01(liveInput ?? 0)
      const output = clamp01(liveOutput ?? 0)

      if (agentRef.current === null) {
        targetIn = 0.05 + Math.sin(t * 0.8) * 0.04
        targetOut = 0.34
      } else if (agentRef.current === "listening") {
        targetIn = clamp01(
          Math.max(input * 1.4, 0.08 + Math.sin(t * 2.4) * 0.04)
        )
        targetOut = clamp01(
          Math.max(output * 0.6, 0.25 + Math.sin(t * 1.1 + 0.5) * 0.05)
        )
      } else if (agentRef.current === "talking") {
        targetIn = clamp01(
          Math.max(input * 0.75, 0.08 + Math.sin(t * 2.0) * 0.03)
        )
        targetOut = clamp01(
          Math.max(output * 1.35, 0.34 + Math.sin(t * 3.2) * 0.08)
        )
      } else {
        const base = 0.22 + 0.05 * Math.sin(t * 0.8)
        const wander = 0.05 * Math.sin(t * 2.0) * Math.sin(t * 0.47 + 1.2)
        targetIn = clamp01(Math.max(input * 0.45, base + wander))
        targetOut = clamp01(
          Math.max(output * 0.8, 0.36 + 0.08 * Math.sin(t * 1.1 + 0.6))
        )
      }
    } else {
      const t = u.uTime.value * 2
      if (agentRef.current === null) {
        targetIn = 0.05 + Math.sin(t * 0.8) * 0.04
        targetOut = 0.34
      } else if (agentRef.current === "listening") {
        targetIn = clamp01(0.54 + Math.sin(t * 3.0) * 0.28)
        targetOut = clamp01(0.52 + Math.sin(t * 1.2 + 0.5) * 0.08)
      } else if (agentRef.current === "talking") {
        targetIn = clamp01(0.68 + Math.sin(t * 4.8) * 0.16 + Math.sin(t * 9.0) * 0.04)
        targetOut = clamp01(0.74 + Math.sin(t * 3.3) * 0.13)
      } else {
        const base = 0.42 + 0.08 * Math.sin(t * 0.8)
        const wander = 0.07 * Math.sin(t * 2.0) * Math.sin(t * 0.47 + 1.2)
        targetIn = clamp01(base + wander)
        targetOut = clamp01(0.52 + 0.12 * Math.sin(t * 1.1 + 0.6))
      }
    }

    curInRef.current += (targetIn - curInRef.current) * 0.2
    curOutRef.current += (targetOut - curOutRef.current) * 0.2

    const targetSpeed = 0.14 + (1 - Math.pow(curOutRef.current - 1, 2)) * 1.15
    animSpeedRef.current += (targetSpeed - animSpeedRef.current) * 0.12

    u.uAnimation.value += delta * animSpeedRef.current
    u.uInputVolume.value = curInRef.current
    u.uOutputVolume.value = curOutRef.current
    u.uColor1.value.lerp(targetColor1Ref.current, 0.012)
    u.uColor2.value.lerp(targetColor2Ref.current, 0.012)
  })

  useEffect(() => {
    const canvas = gl.domElement
    const onContextLost = (event: Event) => {
      event.preventDefault()
      setTimeout(() => {
        gl.forceContextRestore()
      }, 1)
    }
    canvas.addEventListener("webglcontextlost", onContextLost, false)
    return () =>
      canvas.removeEventListener("webglcontextlost", onContextLost, false)
  }, [gl])

  const uniforms = useMemo(() => {
    const isDark =
      inverted ??
      (typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark"))
    return {
      uColor1: new THREE.Uniform(new THREE.Color(initialColorsRef.current[0])),
      uColor2: new THREE.Uniform(new THREE.Color(initialColorsRef.current[1])),
      uOffsets: { value: offsets },
      uPerlinTexture: new THREE.Uniform(perlinNoiseTexture),
      uTime: new THREE.Uniform(0),
      uAnimation: new THREE.Uniform(0.1),
      uInverted: new THREE.Uniform(isDark ? 1 : 0),
      uInputVolume: new THREE.Uniform(0),
      uOutputVolume: new THREE.Uniform(0),
      uOpacity: new THREE.Uniform(1),
    }
  }, [perlinNoiseTexture, offsets, inverted])

  useEffect(() => () => perlinNoiseTexture.dispose(), [perlinNoiseTexture])

  return (
    <mesh ref={circleRef}>
      <circleGeometry args={[3.5, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent={true}
      />
    </mesh>
  )
}

function createNoiseTexture(seed?: number) {
  const size = 128
  const random = splitmix32(seed ?? 917_263)
  const grids = [8, 16, 32].map((gridSize) => ({
    gridSize,
    values: Array.from({ length: gridSize * gridSize }, () => random()),
  }))
  const data = new Uint8Array(size * size * 4)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size
      const ny = y / size
      const noise =
        sampleGrid(grids[0], nx, ny) * 0.58 +
        sampleGrid(grids[1], nx, ny) * 0.3 +
        sampleGrid(grids[2], nx, ny) * 0.12
      const value = Math.floor((0.32 + noise * 0.36) * 255)
      const offset = (y * size + x) * 4
      data[offset] = value
      data[offset + 1] = value
      data[offset + 2] = value
      data[offset + 3] = 255
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

function sampleGrid(
  grid: { gridSize: number; values: number[] },
  x: number,
  y: number,
) {
  const scaledX = x * grid.gridSize
  const scaledY = y * grid.gridSize
  const x0 = Math.floor(scaledX) % grid.gridSize
  const y0 = Math.floor(scaledY) % grid.gridSize
  const x1 = (x0 + 1) % grid.gridSize
  const y1 = (y0 + 1) % grid.gridSize
  const tx = smoothstep(scaledX - Math.floor(scaledX))
  const ty = smoothstep(scaledY - Math.floor(scaledY))
  const at = (gridX: number, gridY: number) =>
    grid.values[gridY * grid.gridSize + gridX] ?? 0.5

  return lerp(
    lerp(at(x0, y0), at(x1, y0), tx),
    lerp(at(x0, y1), at(x1, y1), tx),
    ty,
  )
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value)
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount
}
