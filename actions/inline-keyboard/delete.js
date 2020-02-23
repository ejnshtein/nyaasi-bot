import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
const composer = new Composer()

composer.action('delete', async ctx => {
  try {
    await ctx.deleteMessage()
  } catch (e) {
    return ctx.answerCbQuery('This message too old, you should delete it yourserf.', true)
  }
  return ctx.answerCbQuery('')
})

bot.use(composer.middleware())
