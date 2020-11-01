import { Composer } from '@telegraf/core'
import { buttons, loadSearchParams, getXtFromMagnet, templates } from '../../lib/index.js'
import { Nyaa } from '@ejnshtein/nyaasi'
import { bot } from '../../core/bot.js'
import env from '../../env.js'

const composer = new Composer()

composer.action(/^magnet=([0-9]+):p=(\S+):o=(\S+)/i, async ctx => {
  const { value } = loadSearchParams(ctx.callbackQuery.message)
  const searchUrl = `https://${env.HOST}/?p=${ctx.match[2]}${value ? `&q=${value}` : ''}`
  try {
    const torrent = await Nyaa.getTorrentAnonymous(ctx.match[1], undefined, { baseUrl: `https://${env.HOST}` })
    let messageText = `${torrent.name}\n`
    messageText += `<code>${torrent.links.magnet}</code><a href="${searchUrl}">&#8203;</a>`
    await ctx.answerCbQuery('')
    return ctx.editMessageText(messageText, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open magnet',
              url: `${env.MAGNET_REDIRECT_HOST}/${env.MAGNET_REDIRECT_PREFIX}/${getXtFromMagnet(torrent.links.magnet)}`
            }
          ],
          [
            {
              text: buttons.back,
              callback_data: `t=${ctx.match[1]}:p=${ctx.match[2]}:o=${ctx.match[3]}`
            }
          ]
        ]
      }
    })
  } catch (e) {
    return ctx.answerCbQuery(templates.error(e), true)
  }
})

bot.use(composer.middleware())
