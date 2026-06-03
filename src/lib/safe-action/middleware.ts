import { checkBotId } from 'botid/server'
import type { MiddlewareFn } from 'next-safe-action'
import { env } from '@/env'
import { ActionError } from './client'

type BotIdMiddleware = MiddlewareFn<string, undefined, object, object>

export const botIdMiddleware: BotIdMiddleware = async ({ next }) => {
  const verification = await checkBotId({
    developmentOptions:
      env.NODE_ENV !== 'production' && env.BOTID_DEV_BYPASS
        ? {
            bypass: env.BOTID_DEV_BYPASS,
          }
        : undefined,
  })

  if (verification.isBot) {
    throw new ActionError(
      'Bot protection blocked this request. Please refresh and try again.'
    )
  }

  return next()
}
