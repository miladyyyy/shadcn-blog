import { createTokenizer } from '@orama/tokenizers/mandarin'
import { createI18nSearchAPI } from 'fumadocs-core/search/server'
import { i18n } from '@/lib/i18n'
import { getPosts } from '@/lib/source'

export const { GET } = createI18nSearchAPI('advanced', {
  i18n,
  indexes: getPosts().map((page) => ({
    title: page.data.title ?? 'Untitled',
    description: page.data.description,
    structuredData: page.data.structuredData,
    id: page.url,
    locale: page.locale ?? i18n.defaultLanguage,
    url: page.url,
  })),
  localeMap: {
    cn: {
      components: {
        tokenizer: createTokenizer(),
      },
      search: {
        threshold: 0,
        tolerance: 0,
      },
    },
  },
})
