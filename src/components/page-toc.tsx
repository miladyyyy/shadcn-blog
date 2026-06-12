'use client'

import type { TOCItemType } from 'fumadocs-core/toc'
import { TOCScrollArea } from 'fumadocs-ui/components/toc'
import { TOCEmpty, TOCItem, TOCItems } from 'fumadocs-ui/components/toc/clerk'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type PageTOCProps = {
  items: TOCItemType[]
  title?: string
  scrollAreaClassName?: string
} & ComponentProps<'div'>

export function PageTOC({
  items,
  title = '目录',
  className,
  scrollAreaClassName,
  ...props
}: PageTOCProps) {
  return (
    <div className={cn('flex min-h-0 flex-col gap-2', className)} {...props}>
      <p className='font-medium text-sm'>{title}</p>
      {items.length ? (
        <TOCScrollArea
          className={cn(
            'max-h-[min(32rem,calc(100vh-12rem))]',
            scrollAreaClassName
          )}
        >
          <TOCItems>
            {items.map((item) => (
              <TOCItem item={item} key={item.url} />
            ))}
          </TOCItems>
        </TOCScrollArea>
      ) : (
        <TOCEmpty />
      )}
    </div>
  )
}

export { TOCProvider } from 'fumadocs-ui/components/toc'
