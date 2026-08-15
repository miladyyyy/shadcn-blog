import Image from 'next/image'
import Link from 'next/link'
import { Icons } from '@/components/icons/icons'
import PixelCard from '@/components/pixel-card'
import { Section } from '@/components/section'
import { buttonVariants } from '@/components/ui/button'
import { ViewAnimation } from '@/components/view-animation'
import Balancer from '@/components/wrap-balancer'
import { cn } from '@/lib/utils'
import avatarImage from '../../../../public/images/avatar.png'

const Hero = () => {
  return (
    <Section className='relative isolate flex flex-col items-center justify-center gap-6 overflow-hidden bg-background px-4 py-16 sm:px-16 sm:py-24 md:py-32'>
      <PixelCard
        className='pointer-events-none absolute inset-0 z-0 opacity-90 dark:opacity-35'
        colors='#B4B4B4'
      />

      {/* <ViewAnimation
        delay={0.05}
        initial={{ opacity: 0, translateY: -6 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <div className='flex items-center justify-center space-x-2'>
          <Icons.code className='h-6 w-6 text-primary transition-transform hover:scale-125' />
          <span className='font-medium text-muted-foreground text-sm'>
            Full-Stack Developer & Tech Writer
          </span>
        </div>
      </ViewAnimation> */}

      <ViewAnimation
        className='relative z-10'
        delay={0.1}
        initial={{ opacity: 0, translateY: -6 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <Image
          alt='avatar'
          className='rounded-full'
          height={100}
          src={avatarImage}
          width={100}
        />
      </ViewAnimation>

      <ViewAnimation
        className='relative z-10'
        delay={0.15}
        initial={{ opacity: 0, translateY: -6 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <p className='max-w-xl text-center text-muted-foreground md:max-w-2xl md:text-lg'>
          <Balancer>
            欢迎来到我的博客！这里分享我在前端开发、全栈工程和技术写作方面的经验与见解。希望我的文章能为你提供有价值的参考和启发。
          </Balancer>
        </p>
      </ViewAnimation>

      <ViewAnimation
        className='relative z-10'
        delay={0.2}
        initial={{ opacity: 0, translateY: -6 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <div className='flex flex-wrap items-center justify-center gap-4'>
          <Link
            className={cn(
              buttonVariants({
                variant: 'default',
                size: 'lg',
              }),
              'group rounded-full bg-primary hover:bg-primary/90'
            )}
            href='/posts'
          >
            浏览文章
            <Icons.arrowRight className='ml-2 size-5 transition-transform group-hover:-rotate-45' />
          </Link>
        </div>
      </ViewAnimation>
    </Section>
  )
}

export default Hero
