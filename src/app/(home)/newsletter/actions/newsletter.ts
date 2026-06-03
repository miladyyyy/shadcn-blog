'use server'

import { Resend } from 'resend'
import { env } from '@/env'
import { getContact, sendWelcomeEmail, updateContact } from '@/lib/resend'
import { ActionError, actionClient } from '@/lib/safe-action/client'
import { botIdMiddleware } from '@/lib/safe-action/middleware'
import { getSortedByDatePosts } from '@/lib/source'
import { NewsletterSchema } from '@/lib/validators'

const resend = new Resend(env.RESEND_API_KEY)

const splitName = (name = '') => {
  const [firstName, ...lastName] = name.split(' ').filter(Boolean)
  return {
    firstName,
    lastName: lastName.join(' '),
  }
}

export const subscribe = actionClient
  .use(botIdMiddleware)
  .inputSchema(NewsletterSchema)
  .action(async ({ parsedInput: { email } }) => {
    const audienceId = env.RESEND_AUDIENCE_ID

    if (!(env.RESEND_API_KEY && audienceId && env.EMAIL_FROM)) {
      throw new ActionError('Newsletter email service is not configured.')
    }

    const { firstName, lastName } = splitName()

    try {
      const contact = await getContact({ email, audienceId })

      if (contact) {
        await updateContact({
          email,
          firstName,
          lastName,
          audienceId,
          unsubscribed: false,
        })

        return {
          success: true,
          message: 'You are already subscribed to our newsletter!',
        }
      }

      const { data, error } = await resend.contacts.create({
        email,
        audienceId,
        firstName,
        lastName,
        unsubscribed: false,
      })

      if (!data || error) {
        throw new Error(
          `Failed to create contact: ${error?.message || 'Unknown error'}`
        )
      }

      const posts = getSortedByDatePosts()
      await sendWelcomeEmail({
        posts,
        to: email,
        firstName: firstName || 'there',
      })

      return {
        success: true,
        message: 'You are now subscribed to our newsletter!',
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
      if (error instanceof ActionError) {
        throw error
      }
      throw new ActionError('Oops, something went wrong while subscribing.')
    }
  })
