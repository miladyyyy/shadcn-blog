'use client'

import { cva } from 'class-variance-authority'
import { Airplay, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  type ComponentProps,
  type MouseEvent,
  useEffect,
  useState,
} from 'react'
import { cn } from '@/lib/utils'

const itemVariants = cva(
  'size-6.5 rounded-full p-1.5 text-fd-muted-foreground',
  {
    variants: {
      active: {
        true: 'bg-fd-accent text-fd-accent-foreground',
        false: 'text-fd-muted-foreground',
      },
    },
  }
)

const full = [
  ['light', Sun] as const,
  ['dark', Moon] as const,
  ['system', Airplay] as const,
]

export const ThemeToggle = ({
  className,
  mode = 'light-dark',
  ...props
}: ComponentProps<'div'> & {
  mode?: 'light-dark' | 'light-dark-system'
}) => {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const container = cn(
    'inline-flex items-center rounded-full border p-1',
    className
  )

  const handleChangeTheme = async (
    nextTheme: 'light' | 'dark' | 'system',
    event: MouseEvent<HTMLButtonElement>
  ) => {
    function update() {
      setTheme(nextTheme)
    }

    if (document.startViewTransition && nextTheme !== resolvedTheme) {
      document.documentElement.style.setProperty(
        '--theme-transition-x',
        `${event.clientX}px`
      )
      document.documentElement.style.setProperty(
        '--theme-transition-y',
        `${event.clientY}px`
      )
      document.documentElement.style.viewTransitionName = 'theme-transition'
      await document.startViewTransition(update).finished
      document.documentElement.style.viewTransitionName = ''
      document.documentElement.style.removeProperty('--theme-transition-x')
      document.documentElement.style.removeProperty('--theme-transition-y')
    } else {
      update()
    }
  }

  if (mode === 'light-dark') {
    const value = mounted ? resolvedTheme : null

    return (
      <button
        aria-label={'Toggle Theme'}
        className={container}
        data-theme-toggle=''
        onClick={(event) =>
          handleChangeTheme(value === 'light' ? 'dark' : 'light', event)
        }
        type='button'
      >
        {full.map(([key, Icon]) => {
          if (key === 'system') {
            return null
          }

          return (
            <Icon
              className={cn(itemVariants({ active: value === key }))}
              fill='currentColor'
              key={key}
            />
          )
        })}
      </button>
    )
  }

  const value = mounted ? theme : null

  return (
    <div className={container} data-theme-toggle='' {...props}>
      {full.map(([key, Icon]) => (
        <button
          aria-label={key}
          className={cn(itemVariants({ active: value === key }))}
          key={key}
          onClick={(event) => handleChangeTheme(key, event)}
          type='button'
        >
          <Icon className='size-full' fill='currentColor' />
        </button>
      ))}
    </div>
  )
}
