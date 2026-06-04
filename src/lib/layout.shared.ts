import { zhCN } from '@fumadocs/language/zh-cn'
import { defineTranslations } from 'fumadocs-core/i18n'
import { openapiTranslations } from 'fumadocs-openapi/i18n'
import { uiTranslations } from 'fumadocs-ui/i18n'

export const translations = defineTranslations()
  .extend(uiTranslations())
  // add extensions according to the integrations you configured, e.g. Fumadocs OpenAPI:
  .extend(openapiTranslations())
  // Traditional Chinese
  .preset(zhCN())
