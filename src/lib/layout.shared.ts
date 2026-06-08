import { zhCN } from '@fumadocs/language/zh-cn'
import { defineTranslations } from 'fumadocs-core/i18n'
import { uiTranslations } from 'fumadocs-ui/i18n'

export const translations = defineTranslations()
  .extend(uiTranslations())
  // Traditional Chinese
  .preset(zhCN())
