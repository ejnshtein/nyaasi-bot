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
  Composer.privateChat(
    async ctx => {
      const { offset, refresh } = parse(ctx.match[1])
      const ref = Boolean(Number.parseInt(refresh))
      const commandPayload = ctx.match.includes(':') ? ctx.callbackQuery.message.text.split(':').slice(1).join(':') : ''
      try {
        const { keyboard } = await subscriptionKeyboard(ctx.from.id, commandPayload, Number.parseInt(offset))
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
  )
)

composer.action(
  /subscribe:(\S+)/i,
  Composer.privateChat(
    async ctx => {
      try {
        const { id, subscribed, offset, s } = parse(ctx.match[1])
        const sub = Boolean(Number.parseInt(subscribed))
        if (s) {
          const torrent = await ctx.db('torrent')
            .findOne(
              {
                id: ctx.message.entities.filter(el => el.type === 'url').shift().url.split('/').filter(Boolean).pop()
              }
            )
          await ctx.editMessageReplyMarkup(
            {
              inline_keyboard: [
                [
                  {
                    text: buttons.torrent.download,
                    callback_data: `d=${torrent.id}`
                  },
                  {
                    text: buttons.torrent.magnet,
                    url: `${env.MAGNET_REDIRECT_HOST}/${env.MAGNET_REDIRECT_PREFIX}/${getXtFromMagnet(torrent.magnet)}`
                  },
                  {
                    text: buttons.share,
                    switch_inline_query: `torrent:${torrent.id}`
                  }
                ],
                [
                  {
                    text: sub ? 'Unsubscribe' : 'Subscribe',
                    callback_data: `subscribe:id=${sub._id}&subscribed=${sub ? '1' : '0'}&s=1`
                  }
                ]
              ]
            }
          )
          await ctx.answerCbQuery(sub ? 'Unsubscribed!' : 'Subscribed!')
          return
        }
        const { ok, n } = await ctx.db('subscriptions')
          .updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            sub
              ? {
                $pull: { users: ctx.from.id }
              } : {
                $addToSet: { users: ctx.from.id }
              }
          )
        if (ok) {
          await ctx.answerCbQuery(sub ? 'Unsubscribed!' : 'Subscribed!')
        } else {
          await ctx.answerCbQuery('Something went wrong...')
        }
        const commandPayload = ctx.match.includes(':') ? ctx.callbackQuery.message.text.split(':').slice(1).join(':') : ''
        const { keyboard } = await subscriptionKeyboard(ctx.from.id, commandPayload, Number.parseInt(offset))
        await ctx.editMessageReplyMarkup({
          inline_keyboard: keyboard
        })
      } catch (e) {
        return ctx.answerCbQuery(templates.error(e), true)
      }
    }
  )
)

bot.use(composer.middleware())
