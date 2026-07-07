import type { LinkItemType } from 'fumadocs-ui/layouts/shared'
import { Icons } from '@/components/icons/icons'

export const linkItems: LinkItemType[] = [
  {
    text: '关于',
    icon: <Icons.user />,
    url: '/about',
  },
  {
    text: '文章',
    icon: <Icons.posts />,
    url: '/posts',
    active: 'nested-url',
  },
]
