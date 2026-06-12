import { File, Files, Folder } from 'fumadocs-ui/components/files'
import { InlineTOC } from 'fumadocs-ui/components/inline-toc'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogProgressBar from '@/components/blog/progress-bar'
import { PostJsonLd } from '@/components/json-ld'
import { PageTOC, TOCProvider } from '@/components/page-toc'
import { Section } from '@/components/section'
import { description as homeDescription } from '@/constants/site'
import { formatChineseDate } from '@/lib/format-date'
import { createMetadata, getBlogPageImage } from '@/lib/metadata'
import { getPost, getPosts } from '@/lib/source'
import { Header } from './_components/header'
import { Share } from './page.client'

export default async function Page(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const page = getPost([params.slug])

  if (!page) {
    notFound()
  }
  const { body: Mdx, toc, tags, lastModified } = page.data

  const lastUpdate = lastModified ? new Date(lastModified) : undefined

  return (
    <>
      <BlogProgressBar />
      <Header page={page} tags={tags} />

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
              <div className='prose min-w-0 flex-1 px-4'>
                <Mdx
                  components={{
                    ...defaultMdxComponents,
                    File,
                    Files,
                    Folder,
                    Tabs,
                    Tab,
                  }}
                />
              </div>
            </div>
            <div className='flex flex-col gap-4 border-border border-t border-dashed p-4 text-sm lg:sticky lg:top-[4rem] lg:h-[calc(100vh-4rem)] lg:self-start lg:overflow-y-auto lg:border-t-0 lg:border-l'>
              {toc?.length ? (
                <PageTOC
                  className='hidden border-border border-b border-dashed pb-4 lg:flex'
                  items={toc}
                  scrollAreaClassName='max-h-[min(24rem,calc(100vh-20rem))]'
                />
              ) : null}
              <div>
                <p className='mb-1 text-fd-muted-foreground text-sm'>
                  发布时间
                </p>
                <p className='font-medium'>
                  {formatChineseDate(page.data.date)}
                </p>
              </div>
              {lastUpdate && (
                <div>
                  <p className='mb-1 text-fd-muted-foreground text-sm'>
                    上次更新
                  </p>
                  <p className='font-medium'>{formatChineseDate(lastUpdate)}</p>
                </div>
              )}
              <Share url={page.url} />
            </div>
          </article>
        </TOCProvider>
      </Section>
      <PostJsonLd page={page} />
    </>
  )
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const params = await props.params
  const page = getPost([params.slug])

  if (!page) {
    notFound()
  }

  const title = page.data.title ?? 'Untitled'
  const description = page.data.description ?? homeDescription

  const image = getBlogPageImage(page)

  return createMetadata({
    title,
    description,
    openGraph: {
      url: `/posts/${page.slugs.join('/')}`,
      images: image.url,
    },
    twitter: {
      images: image.url,
    },
    alternates: {
      canonical: page.url,
    },
  })
}

export function generateStaticParams(): { slug: string | undefined }[] {
  return getPosts().map((page) => ({
    slug: page.slugs[0],
  }))
}
