// adapted from https://github.com/braydoncoyer/braydoncoyer.dev/
import * as motion from 'motion/react-client'
import Balancer from 'react-wrap-balancer'
import { BlurImage } from '@/components/blur-image'
import { Icons } from '@/components/icons/icons'
import { Section } from '@/components/section'
import { TagCard } from '@/components/tags/tag-card'
import { ViewAnimation } from '@/components/view-animation'
import { formatChineseDate } from '@/lib/format-date'
import type { BlogPage as MDXPage } from '@/lib/source'

interface HeaderProps {
  page: MDXPage
  tags?: string[]
}

export const Header = ({ page, tags }: HeaderProps) => {
  const image = page.data.image
  const formattedDate = formatChineseDate(page.data.date)

  return (
    <Section className='p-6 md:p-12 lg:p-16'>
      <motion.div
        animate={{ opacity: 1 }}
        className='flex max-w-4xl flex-col gap-4'
        initial={{ opacity: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {image ? (
          <div className='relative aspect-video overflow-hidden rounded-2xl shadow-xl'>
            <BlurImage
              alt={page.data.title ?? 'Blog cover image'}
              className='absolute inset-0 h-full w-full'
              fill
              imageClassName='object-cover'
              sizes='(min-width: 1024px) 800px, 100vw'
              src={image}
            />
          </div>
        ) : null}
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-6 text-muted-foreground text-xs'>
            <span className='inline-flex items-center gap-1.5'>
              <Icons.calendar aria-hidden='true' className='size-3.5' />
              {formattedDate}
            </span>
          </div>
          <div className='space-y-4 text-balance'>
            <h1 className='typography-hero font-medium text-4xl leading-11.25 tracking-tight md:text-5xl md:leading-15'>
              <Balancer>{page.data.title ?? 'Untitled'}</Balancer>
            </h1>
            <p className='typography-body text-muted-foreground leading-8'>
              <Balancer>{page.data.description ?? ''}</Balancer>
            </p>
          </div>
        </div>
        {tags?.length ? (
          <div className='flex flex-wrap gap-2'>
            {tags.map((tag, index) => (
              <ViewAnimation
                delay={0.1 + index * 0.05}
                initial={{ opacity: 0, translateY: -6 }}
                key={tag}
                whileInView={{ opacity: 1, translateY: 0 }}
              >
                <TagCard name={tag} />
              </ViewAnimation>
            ))}
          </div>
        ) : null}
      </motion.div>
    </Section>
  )
}
