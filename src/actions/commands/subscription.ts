import { Composer } from 'grammy'
import { templates } from 'lib/templates'
import { bot } from 'src/bot'

const composer = new Composer()

composer.command('subscribe', async (ctx) => {
  const commandPayload = ctx.message!.text.split(' ').slice(1).join(' ')
  const publicChat = ['supergroup', 'group'].includes(ctx.chat.type)
  let messageText = 'Choose subscription below'
  if (commandPayload) {
    messageText += `\nKeywords:${commandPayload}`
  }
  try {
    const { keyboard } = await subscriptionKeyboard(
      ctx.chat.id,
      commandPayload,
      0,
      publicChat
    )
    await ctx.reply(messageText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    })
  } catch (e) {
    return ctx.reply(templates.error(e))
  }
})

bot.use(composer.middleware())
