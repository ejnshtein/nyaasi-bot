import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
import env from '../../env.js'
import { templates } from '../../lib/index.js'

const composer = new Composer()

composer.action(/^d=([0-9]+)$/, async (ctx) => {
  const caption = `<a href="https://${env.HOST}/view/${ctx.match[1]}">${env.HOST}/view/${ctx.match[1]}</a>`
  try {
    await ctx.replyWithDocument({
      url: `https://${env.HOST}/download/${ctx.match[1]}.torrent`,
      filename: `${ctx.match[1]}.torrent`
    }, {
      caption: caption,
      reply_to_message_id: ctx.callbackQuery.message.message_id,
      parse_mode: 'HTML'
    })
  } catch (e) {
    return ctx.answerCbQuery(templates.error(e), true)
  }
  return ctx.answerCbQuery('')
})

bot.use(composer.middleware())
