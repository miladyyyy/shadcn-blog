'use client'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'
import type React from 'react'
import { useRef } from 'react'
import styles from './holographic-card.module.css'

interface HolographicCardProps {
  imageSrc?: string
  altText?: string
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  imageSrc = '/images/29_hires.png',
  altText = 'Pokemon Card',
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  // 1. 初始化 Motion Value (由 0 到 100 映射鼠标相对于卡片的百分比位置)
  const pointerX = useMotionValue(50)
  const pointerY = useMotionValue(50)

  // 2. 控制光效强度的 Motion Value (0 为无光效，1 为完全开启)
  const effectIntensity = useMotionValue(0)

  // 3. 派生出倾斜角度 (将 0-100% 的位置映射到相应的倾斜度数)
  // 鼠标在最左侧(0) 倾斜 14deg，在最右侧(100) 倾斜 -14deg
  const tiltLR = useTransform(pointerX, [0, 100], [14, -14])
  // 鼠标在最上侧(0) 倾斜 -14deg，在最下侧(100) 倾斜 14deg
  const tiltUD = useTransform(pointerY, [0, 100], [-14, 14])

  // 4. 计算鼠标距离中心的距离百分比 (用于滤镜和光效的深层计算)
  const pointerFromCenter = useTransform<number, number>(
    [pointerX, pointerY],
    (values: number[]) => {
      const [x = 50, y = 50] = values

      const pxFromCenter = Math.abs((x - 50) / 50)
      const pyFromCenter = Math.abs((y - 50) / 50)

      return Math.max(pxFromCenter, pyFromCenter)
    }
  )

  // 5. 组合成传给 DOM 的一组包含 Motion Value 的 CSS 变量
  const dynamicStyles = {
    '--tilt-left-right': useTransform(tiltLR, (v) => `${v}deg`),
    '--tilt-up-down': useTransform(tiltUD, (v) => `${v}deg`),
    '--pointer-x': useTransform(pointerX, (v) => `${v}%`),
    '--pointer-y': useTransform(pointerY, (v) => `${v}%`),
    '--background-x': useTransform(pointerX, (v) => `${v}%`),
    '--background-y': useTransform(pointerY, (v) => `${v}%`),
    '--pointer-from-center': pointerFromCenter,
    '--effect-intensity': effectIntensity,
  } as React.CSSProperties

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) {
      return
    }

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 计算百分比并直接更新 Motion Value (不会触发 React 的无用 Re-render)
    const px = (x / rect.width) * 100
    const py = (y / rect.height) * 100

    pointerX.set(px)
    pointerY.set(py)
    effectIntensity.set(1)
  }

  const handlePointerLeave = () => {
    // 精调弹簧参数：高刚度 + 适中阻尼 = 灵动回弹
    const springConfig = {
      type: 'spring' as const,
      stiffness: 250, // 提高刚度，回弹更迅速
      damping: 14, // 降低阻尼，允许轻微的超越边界摆动
      mass: 0.8, // 减轻质量，让卡片看起来更轻盈
    }

    animate(pointerX, 50, springConfig)
    animate(pointerY, 50, springConfig)
    animate(effectIntensity, 0, springConfig)
  }

  return (
    <div
      className={`not-prose ${styles.card}`}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={cardRef}
    >
      {/* 将普通 div 升级为 motion.div，直接绑定 3D 转换与动态变量 */}
      <motion.div
        className={styles.card__rotator}
        style={{
          ...dynamicStyles,
          transform:
            'rotateY(var(--tilt-left-right)) rotateX(var(--tilt-up-down))',
        }}
      >
        <div className={styles.card__front}>
          <Image alt={altText} fill priority src={imageSrc} />
          <div className={styles.card__shine} />
          <div className={styles.card__glare} />
        </div>
      </motion.div>
    </div>
  )
}

export default HolographicCard
