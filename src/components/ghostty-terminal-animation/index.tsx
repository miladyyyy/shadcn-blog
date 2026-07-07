'use client'

import clsx from 'clsx'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { ghosttyTerminalFrames } from './frames'
import styles from './terminal.module.css'

type TerminalFontSize = 'xtiny' | 'tiny' | 'small'
type AnimationFrame = readonly string[]

class AnimationManager {
  private animation: number | null = null
  private readonly callback: () => void
  private lastFrame = -1
  frameTime: number

  constructor(callback: () => void, fps = 30) {
    this.callback = callback
    this.frameTime = 1000 / fps
  }

  updateFPS(fps: number) {
    this.frameTime = 1000 / fps
  }

  start() {
    if (this.animation !== null) {
      return
    }
    this.animation = requestAnimationFrame(this.update)
  }

  pause() {
    if (this.animation === null) {
      return
    }
    this.lastFrame = -1
    cancelAnimationFrame(this.animation)
    this.animation = null
  }

  private readonly update = (time: number) => {
    let delta = time - this.lastFrame

    if (this.lastFrame === -1) {
      this.lastFrame = time
    } else {
      while (delta >= this.frameTime) {
        this.callback()
        delta -= this.frameTime
        this.lastFrame += this.frameTime
      }
    }

    this.animation = requestAnimationFrame(this.update)
  }
}

const KONAMI_CODE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
]

const BRAND_SPAN_PATTERN = /<span class="b">([\s\S]*?)<\/span>/g

function renderFrameLine(line: string, padding: string) {
  const nodes: ReactNode[] = []
  let cursor = 0

  nodes.push(padding)

  for (const match of line.matchAll(BRAND_SPAN_PATTERN)) {
    const [raw, value] = match
    const index = match.index ?? 0

    if (index > cursor) {
      nodes.push(line.slice(cursor, index))
    }

    nodes.push(
      <span className={styles.brand} key={`${index}-${value}`}>
        {value}
      </span>
    )
    cursor = index + raw.length
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor))
  }

  nodes.push(padding)

  return nodes
}

function Terminal({
  columns,
  fontSize,
  lines,
  rows,
  title,
  whitespacePadding = 0,
}: {
  columns: number
  fontSize: TerminalFontSize
  lines: AnimationFrame
  rows: number
  title: string
  whitespacePadding?: number
}) {
  const padding = ' '.repeat(whitespacePadding)

  return (
    <div
      className={clsx(
        styles.terminal,
        fontSize === 'xtiny' && styles.fontXTiny,
        fontSize === 'tiny' && styles.fontTiny,
        fontSize === 'small' && styles.fontSmall
      )}
      style={
        {
          '--columns': columns + 2 * whitespacePadding,
          '--rows': rows,
        } as CSSProperties
      }
    >
      <div className={styles.header}>
        <ul aria-hidden='true' className={styles.windowControls}>
          <li className={styles.windowButton} />
          <li className={styles.windowButton} />
          <li className={styles.windowButton} />
        </ul>
        <p className={styles.title}>{title}</p>
      </div>
      <pre className={styles.content}>
        {lines.map((line, index) => (
          <div className={styles.contentLine} key={`${index}-${line}`}>
            {renderFrameLine(line, padding)}
          </div>
        ))}
      </pre>
    </div>
  )
}

function AnimatedTerminal({
  columns,
  fontSize,
  frames,
  frameLengthMs,
  rows,
  title,
  whitespacePadding,
}: {
  columns: number
  fontSize: TerminalFontSize
  frames: readonly AnimationFrame[]
  frameLengthMs: number
  rows: number
  title: string
  whitespacePadding?: number
}) {
  const baseFps = 1000 / frameLengthMs
  const [currentFrame, setCurrentFrame] = useState(16)
  const [animationManager] = useState(
    () =>
      new AnimationManager(() => {
        setCurrentFrame((frame) => (frame + 1) % frames.length)
      }, baseFps)
  )

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (reducedMotion) {
      return
    }

    const handleFocus = () => animationManager.start()
    const handleBlur = () => animationManager.pause()
    const codeInProgress: string[] = []
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if (KONAMI_CODE[codeInProgress.length] === key) {
        codeInProgress.push(key)
      } else {
        codeInProgress.length = 0
      }

      if (codeInProgress.length !== KONAMI_CODE.length) {
        return
      }

      animationManager.updateFPS(
        animationManager.frameTime === 1000 / baseFps ? 240 : baseFps
      )
      codeInProgress.length = 0
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('keyup', handleKeyUp)

    if (document.visibilityState === 'visible') {
      animationManager.start()
    }

    return () => {
      animationManager.pause()
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [animationManager, baseFps])

  return (
    <Terminal
      columns={columns}
      fontSize={fontSize}
      lines={frames[currentFrame] ?? frames[0] ?? []}
      rows={rows}
      title={title}
      whitespacePadding={whitespacePadding}
    />
  )
}

export default function GhosttyTerminalAnimation() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const wrapper = wrapperRef.current

    if (!wrapper) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry?.contentRect.width ?? 0)
    })
    observer.observe(wrapper)

    return () => observer.disconnect()
  }, [])

  let fontSize: TerminalFontSize = 'xtiny'

  if (width >= 860) {
    fontSize = 'small'
  } else if (width >= 620) {
    fontSize = 'tiny'
  }

  return (
    <div className={styles.demo} ref={wrapperRef}>
      <AnimatedTerminal
        columns={100}
        fontSize={fontSize}
        frameLengthMs={31}
        frames={ghosttyTerminalFrames}
        rows={41}
        title='Ghostty'
        whitespacePadding={width >= 900 ? 10 : 0}
      />
    </div>
  )
}
