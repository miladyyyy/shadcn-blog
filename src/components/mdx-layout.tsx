import type { TOCItemType } from 'fumadocs-core/toc'
import { InlineTOC } from 'fumadocs-ui/components/inline-toc'
import type { ReactNode } from 'react'
import { PageTOC, TOCProvider } from './page-toc'
import { Section } from './section'

interface MdxLayoutProps {
  children: ReactNode
  title: string
  toc?: TOCItemType[]
}

export default function MdxLayout({
  children,
  title,
  toc,
}: MdxLayoutProps): ReactNode {
  return (
    <>
      <Section className='p-4 lg:p-6'>
        <h1 className='typography-hero mx-auto text-center font-normal text-3xl leading-tight tracking-tighter md:text-5xl'>
          {title}
        </h1>
      </Section>

      <Section className='h-full' sectionClassName='flex flex-1'>
        <TOCProvider toc={toc ?? []}>
          <article className='grid min-h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px]'>
            <div className='flex flex-1 flex-col gap-4'>
              {toc?.length ? (
                <InlineTOC
                  className='rounded-none border-0 border-border border-b border-dashed lg:hidden'
                  items={toc}
                />
              ) : null}
              <div className='prose min-w-0 flex-1 px-4'>{children}</div>
              <div className='py-2' />
            </div>
            {toc?.length ? (
              <aside className='hidden border-border border-l border-dashed p-4 text-sm lg:sticky lg:top-[4rem] lg:flex lg:h-[calc(100vh-4rem)] lg:self-start lg:overflow-y-auto'>
                <PageTOC items={toc} />
              </aside>
            ) : null}
          </article>
        </TOCProvider>
      </Section>
    </>
  )
}
