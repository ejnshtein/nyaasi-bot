import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
import subscriptionKeyboard from '../../views/inline-keyboard/subscription.js'
import { templates } from '../../lib/index.js'

const composer = new Composer()

composer.command(
  'subscribe',
  Composer.privateChat(
    async ctx => {
      const commandPayload = ctx.message.text.split(' ').slice(1).join(' ')
      let messageText = 'Choose subscription below'
      if (commandPayload) {
        messageText += `\nKeywords:${commandPayload}`
      }
      try {
        const { keyboard } = await subscriptionKeyboard(ctx.from.id, commandPayload)
        await ctx.reply(
          messageText,
          {
            reply_markup: {
              inline_keyboard: keyboard
            }
          }
        )
      } catch (e) {
        return ctx.reply(templates.error(e))
      }
    }
  )
)

bot.use(composer.middleware())
