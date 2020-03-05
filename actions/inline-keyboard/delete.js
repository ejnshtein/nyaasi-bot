import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
const composer = new Composer()

const deleteFn = async ctx => {
  try {
    await ctx.deleteMessage()
  } catch (e) {
    return ctx.answerCbQuery('This message too old, you should delete it yourserf.', true)
  }
  return ctx.answerCbQuery('')
}

composer.action(
  'delete',
  Composer.privateChat(
    deleteFn
  )
)

composer.action(
  'delete',
  Composer.groupChat(
    Composer.admin(
      deleteFn
    )
  )
)

bot.use(composer.middleware())
