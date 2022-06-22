import { Composer, Context } from 'grammy'
import { bot } from 'src/bot'
import { onlyAdmin } from 'src/middlewares/only-admin'
import { onlyGroup } from 'src/middlewares/only-group'
import { onlyPrivate } from 'src/middlewares/only-private'
const composer = new Composer()

const deleteFn = async (ctx: Context) => {
  try {
    await ctx.deleteMessage()
  } catch (e) {
    return ctx.answerCallbackQuery(
      'This message too old, you should delete it yourself.'
    )
  }
  return ctx.answerCallbackQuery('')
}

composer.filter(onlyPrivate).callbackQuery('delete', deleteFn)

composer.filter(onlyGroup).filter(onlyAdmin).callbackQuery('delete', deleteFn)

bot.use(composer.middleware())
