import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
import subscriptionKeyboard from '../../views/inline-keyboard/subscription.js'
import { templates, buttons, getXtFromMagnet } from '../../lib/index.js'
import env from '../../env.js'
import mongoose from 'mongoose'
import { parse } from 'querystring'

const composer = new Composer()

composer.action(
  /subscription:(\S+)/i,
  // Composer.privateChat(
  async ctx => {
    const { offset, refresh } = parse(ctx.match[1])
    const publicChat = ['supergroup', 'group'].includes(ctx.chat.type)
    const ref = Boolean(Number.parseInt(refresh))
    const commandPayload = ctx.match.includes(':') ? ctx.callbackQuery.message.text.split(':').slice(1).join(':') : ''
    try {
      const { keyboard } = await subscriptionKeyboard(ctx.chat.id, commandPayload, Number.parseInt(offset), publicChat)
      await ctx.editMessageReplyMarkup({
        inline_keyboard: keyboard
      })
      await ctx.answerCbQuery('')
    } catch (e) {
      if (ref && /message is not modified/i.test(e.message)) {
        return ctx.answerCbQuery('')
      } else {
        return ctx.answerCbQuery(templates.error(e), true)
      }
    }
  }
  // )
)

const subscribeFn = async ctx => {
  try {
    const { id, offset } = parse(ctx.match[1])
    const result = await ctx.db('subscriptions')
      .aggregate(
        [
          {
            $match: {
              _id: mongoose.Types.ObjectId(id)
            }
          },
          {
            $addFields: {
              subscribed: {
                $in: [ctx.chat.id, '$chats']
              }
            }
          },
          {
            $project: {
              users: 0
            }
          }
        ]
      )
    const sub = result.pop()
    if (!sub) {
      return ctx.answerCbQuery('Subscription not found')
    }
    const { subscribed } = sub
    const { ok, n } = await ctx.db('subscriptions')
      .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        subscribed
          ? {
            $pull: { chats: ctx.chat.id }
          } : {
            $addToSet: { chats: ctx.chat.id }
          }
      )
    if (ok) {
      await ctx.answerCbQuery(subscribed ? 'Unsubscribed!' : 'Subscribed!')
    } else {
      await ctx.answerCbQuery('Something went wrong...')
    }
    const publicChat = ['supergroup', 'group'].includes(ctx.chat.type)
    const commandPayload = ctx.match.includes(':') ? ctx.callbackQuery.message.text.split(':').slice(1).join(':') : ''
    const { keyboard } = await subscriptionKeyboard(ctx.chat.id, commandPayload, Number.parseInt(offset), publicChat)
    await ctx.editMessageReplyMarkup({
      inline_keyboard: keyboard
    })
  } catch (e) {
    return ctx.answerCbQuery(templates.error(e), true)
  }
}

composer.action(
  /subscribe:(\S+)/i,
  Composer.privateChat(
    subscribeFn
  )
)

composer.action(
  /subscribe:(\S+)/i,
  Composer.groupChat(
    Composer.optional(
      async ctx => {
        const user = await ctx.getChatMember(ctx.from.id)

        return ['creator', 'administrator'].includes(user.status)
      },
      subscribeFn
    )
  )
)

bot.use(composer.middleware())
