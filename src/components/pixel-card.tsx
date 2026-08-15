'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const PIXEL_SIZE = 2
const STATIC_PIXEL_OPACITY = 0.58

const VARIANTS = {
  default: '#B4B4B4',
  blue: '#60a5fa,#818cf8,#38bdf8',
  yellow: '#facc15,#fbbf24,#fde047',
  pink: '#f9a8d4,#f0abfc,#c4b5fd',
} as const

interface PixelCardProps {
  variant?: keyof typeof VARIANTS
  gap?: number
  speed?: number
  colors?: string
  className?: string
  children?: ReactNode
}

interface Pixel {
  color: string
  opacity: number
  phase: number
  phaseSpeed: number
  x: number
  y: number
}

interface PixelGridOptions {
  colors: string[]
  gap: number
  height: number
  prefersReducedMotion: boolean
  speed: number
  width: number
}

const getOpacity = (phase: number) => {
  const wave = (Math.sin(phase) + 1) / 2
  return 0.12 + wave * 0.78
}

const drawPixel = (context: CanvasRenderingContext2D, pixel: Pixel) => {
  context.globalAlpha = pixel.opacity
  context.fillStyle = pixel.color
  context.fillRect(pixel.x, pixel.y, PIXEL_SIZE, PIXEL_SIZE)
}

const drawPixels = (context: CanvasRenderingContext2D, pixels: Pixel[]) => {
  for (const pixel of pixels) {
    drawPixel(context, pixel)
  }
  context.globalAlpha = 1
}

const animatePixels = (
  context: CanvasRenderingContext2D,
  pixels: Pixel[],
  elapsed: number
) => {
  for (const pixel of pixels) {
    pixel.phase += pixel.phaseSpeed * elapsed
    pixel.opacity = getOpacity(pixel.phase)
    drawPixel(context, pixel)
  }
  context.globalAlpha = 1
}

const createPixels = ({
  colors,
  gap,
  height,
  prefersReducedMotion,
  speed,
  width,
}: PixelGridOptions) => {
  const pixels: Pixel[] = []
  const animationSpeed = Math.max(speed, 0) * 0.02

  for (let x = 0; x < width; x += gap) {
    for (let y = 0; y < height; y += gap) {
      const phase = Math.random() * Math.PI * 2
      pixels.push({
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#93c5fd',
        opacity: prefersReducedMotion
          ? STATIC_PIXEL_OPACITY
          : getOpacity(phase),
        phase,
        phaseSpeed: (0.45 + Math.random() * 0.7) * animationSpeed,
        x,
        y,
      })
    }
  }

  return pixels
}

const setupCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const context = canvas.getContext('2d')
  if (!context) {
    return null
  }

  const devicePixelRatio = window.devicePixelRatio || 1
  canvas.width = Math.floor(width * devicePixelRatio)
  canvas.height = Math.floor(height * devicePixelRatio)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)

  return context
}

/**
 * A non-interactive React Bits-inspired pixel field. Pixel dimensions stay
 * fixed while their color intensity gently twinkles, so the background is
 * visible without hover interaction.
 */
export default function PixelCard({
  variant = 'default',
  gap = 6,
  speed = 200,
  colors,
  className,
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const resizeFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!(container && canvas)) {
      return
    }

    const palette = (colors ?? VARIANTS[variant]).split(',').filter(Boolean)
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    let context: CanvasRenderingContext2D | null = null
    let height = 0
    let lastTimestamp = 0
    let pixels: Pixel[] = []
    let width = 0

    const drawFrame = (timestamp: number) => {
      if (!context) {
        return
      }

      const elapsed = lastTimestamp
        ? Math.min(timestamp - lastTimestamp, 32) / 1000
        : 0
      lastTimestamp = timestamp
      context.clearRect(0, 0, width, height)
      animatePixels(context, pixels, elapsed)
      animationFrameRef.current = requestAnimationFrame(drawFrame)
    }

    const initialize = () => {
      const rect = container.getBoundingClientRect()
      width = Math.floor(rect.width)
      height = Math.floor(rect.height)
      if (!(width && height)) {
        return
      }

      context = setupCanvas(canvas, width, height)
      if (!context) {
        return
      }

      pixels = createPixels({
        colors: palette,
        gap,
        height,
        prefersReducedMotion,
        speed,
        width,
      })

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      context.clearRect(0, 0, width, height)
      drawPixels(context, pixels)
      if (!prefersReducedMotion) {
        lastTimestamp = 0
        animationFrameRef.current = requestAnimationFrame(drawFrame)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current)
      }
      resizeFrameRef.current = requestAnimationFrame(initialize)
    })

    initialize()
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current)
      }
    }
  }, [colors, gap, speed, variant])

  return (
    <div
      className={cn('relative isolate overflow-hidden', className)}
      ref={containerRef}
    >
      <canvas className='block size-full' ref={canvasRef} />
      {children}
    </div>
  )
}
