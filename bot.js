require('dotenv').config({ path: './.env' })
const Telegraf = require('telegraf')
// const rateLimit = require('telegraf-ratelimit') // maybe in future...
const { URL } = require('url')
const { getView } = require('./nyaasi')
const { logger, middleware, nedb: { collection } } = require('./database')
const { onlyPrivate } = require('./middlewares')

const buttons = require('./buttons')
const template = require('./template')
const { messageKeyboard, view, keyboardPage } = require('./generators')
const { AllHtmlEntities } = require('html-entities')
const { decode } = new AllHtmlEntities()
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.telegram.getMe()
  .then(botInfo => {
    bot.options.username = botInfo.username
  })

/* eslint no-extend-native: 0 */
Number.prototype.normalizeZero = function () {
  return this.valueOf().toString().length > 1 ? this.valueOf() : `0${this.valueOf()}`
}

bot.use(logger())
bot.use(middleware())

module.exports = {
  bot
}

bot.start(async ctx => {
  if (/\/start (\S*)/i.test(ctx.message.text)) {
    const buffer = ctx.message.text.match(/\/start (\S*)/i)[1]
    const text = Buffer.from(buffer, 'base64').toString('ascii')
    if (/download:[0-9]+/i.test(text)) {
      const id = text.match(/download:([0-9]+)/i)[1]
      return ctx.replyWithDocument({
        url: `https://nyaa.si/download/${id}.torrent`,
        filename: `${id}.torrent`
      })
    } else if (/view:[0-9]+/i.test(text)) {
      const id = text.match(/view:([0-9]+)/i)[1]
      const searchUrl = 'https://nyaa.si/?p=1'
      const messageText = await view(id, searchUrl)
      const keyboard = [
        [{
          text: buttons.torrent.download,
          callback_data: `d=${id}`
        }, {
          text: buttons.torrent.magnet,
          callback_data: `magnet=${id}:p=1:o=0`
        }],
        [{
          text: buttons.page.refresh,
          callback_data: `v=${id}:p=1:o=0`
        }],
        [{
          text: buttons.back,
          callback_data: 'p=1:o=0'
        }]
      ]
      return ctx.reply(messageText, {
        reply_markup: {
          inline_keyboard: keyboard
        },
        parse_mode: 'HTML'
      })
    } else if (/query:[\S\s]+/i.test(text)) {
      const query = text.match(/query:([\S\s])+/i)[1]
      const result = await keyboardPage(query)
      return ctx.reply(result.message, result.extra)
    } else if (/magnet:[0-9]+/i.test(text)) {
      const id = text.match(/magnet:([0-9]+)/i)[1]
      const view = await getView(id)
      const searchUrl = `https://nyaa.si/`
      const messageText = `<a href="${searchUrl}">&#160;</a>${view.title}\n<code>${view.links.magnet}</code>`
      return ctx.reply(messageText, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{
              text: buttons.back,
              callback_data: `v=${id}:p=1:o=0`
            }]
          ]
        }
      })
    }
  }
  ctx.reply('I\'m nyaa.si website bot and i can help you to find some content from there.\nJust use command /index or /search <text to search> and i\'ll found it on nyaa.si')
})

bot.command('count', async (ctx) => {
  if (ctx.local && ctx.local.admin) { // optional
    const usersCount = await collection('users').count()
    ctx.reply(`I'm working for ${usersCount} user(s)!`)
  }
})
bot.command('source', (ctx) => {
  ctx.reply('My source code at <a href="https://github.com/ejnshtein/nyaasi-bot">Github</a>', {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Bot source code',
          url: 'https://github.com/ejnshtein/nyaasi-bot'
        }]
      ]
    }
  })
})

bot.command('chat', (ctx) => ctx.reply('༼ つ ◕_◕ ༽つ @nyaasi_chat'))

bot.command('about', ({
    reply
  }) =>
  reply('I\'m <a href="https://nyaa.si">nyaa.si</a> website bot.\nFor now, I can search for torrents on <a href="https://nyaa.si">nyaa.si</a> (＾◡＾)っ.\nMore features will arrive soon! ( ͡~ ͜ʖ ͡°)\n\nI\'m still in beta, so please be patient! ( ﾉ ﾟｰﾟ)ﾉ\n\nMy source code at <a href="https://github.com/ejnshtein/nyaasi-bot">github</a>', {
    parse_mode: 'HTML'
  })
)

bot.hears(/\/search ([\s\S]*)/i, onlyPrivate, async (ctx, next) => {
  if (ctx.match && ctx.match[1]) {
    const result = await keyboardPage(ctx.match[1])
    ctx.reply(result.message, result.extra)
  } else {
    next(ctx)
  }
})

bot.command(['index', 'search'], onlyPrivate, async (ctx) => {
  const result = await keyboardPage()
  ctx.reply(result.message, result.extra)
})

bot.action(/^p=(\S+):o=(\S+)$/ig, async ctx => {
  ctx.answerCbQuery('')
  const entities = ctx.callbackQuery.message.entities.filter(el => el.type === 'text_link')
  const entity = entities[entities.length - 1]
  const page = Number.parseInt(ctx.match[1])
  const offset = Number.parseInt(ctx.match[2])
  const location = new URL(entity.url)
  let query = ''
  if (location.searchParams.has('q')) {
    query = location.searchParams.get('q')
  }
  const keyboard = await messageKeyboard(query, {
    history: `p=${ctx.match[1]}:o=${ctx.match[2]}`,
    page: ctx.match[1],
    offset: Number.parseInt(ctx.match[2])
  })
  if (offset >= 10) {
    if (offset < 70) {
      keyboard.unshift([{
        text: buttons.offset.minus(10),
        callback_data: `p=${page}:o=${offset - 10}`
      }, {
        text: buttons.offset.plus(10),
        callback_data: `p=${page}:o=${offset + 10}`
      }])
    } else {
      keyboard.unshift([{
        text: buttons.offset.minus(10),
        callback_data: `p=${page}:o=${offset - 10}`
      }])
    }
  } else {
    keyboard.unshift([{
      text: buttons.offset.plus(10),
      callback_data: `p=${page}:o=${offset + 10}`
    }])
  }
  const pageLine = []
  if (page >= 2) {
    pageLine.push({
      text: buttons.page.prev(page - 1),
      callback_data: `p=${page - 1}:o=0`
    })
    pageLine.push({
      text: buttons.page.locate(page),
      callback_data: `p=${page}:o=${offset}`
    })
  } else {
    pageLine.push({
      text: buttons.page.locate(page),
      callback_data: `p=${page}:o=${offset}`
    })
  }
  pageLine.push({
    text: buttons.page.next(page + 1),
    callback_data: `p=${page + 1}:o=0`
  })
  pageLine.push({
    text: buttons.page.nextDub(page + 2),
    callback_data: `p=${page + 2}:o=0`
  })
  if (page >= 3) {
    pageLine.unshift({
      text: buttons.page.prevDub(1),
      callback_data: 'p=1:o=0'
    })
  }
  keyboard.unshift(pageLine)
  const searchUrl = `https://nyaa.si/?p=${page}${query ? `&q=${query}` : ''}`
  ctx.editMessageText(template.searchText(searchUrl, query, page, offset), {
    reply_markup: {
      inline_keyboard: keyboard
    },
    disable_web_page_preview: true,
    parse_mode: 'HTML'
  })
})

bot.action(/^v=(\S+?):p=(\S+):o=(\S+)$/ig, async ctx => {
  ctx.answerCbQuery('')
  const entities = ctx.callbackQuery.message.entities.filter(el => el.type === 'text_link')
  const entity = entities[entities.length - 1]
  const location = new URL(entity.url)
  let query = ''
  if (location.searchParams.has('q')) {
    query = location.searchParams.get('q')
  }
  const searchUrl = `https://nyaa.si/?p=${ctx.match[2]}${query ? `&q=${query}` : ''}`
  const messageText = await view(ctx.match[1], searchUrl)
  const keyboard = [
    [{
      text: buttons.torrent.download,
      callback_data: `d=${ctx.match[1]}`
    }, {
      text: buttons.torrent.magnet,
      callback_data: `magnet=${ctx.match[1]}:p=${ctx.match[2]}:o=${ctx.match[3]}`
    }],
    [{
      text: buttons.page.refresh,
      callback_data: ctx.match[0]
    }],
    [{
      text: buttons.back,
      callback_data: `p=${ctx.match[2]}:o=${ctx.match[3]}`
    }]
  ]
  ctx.editMessageText(messageText, {
    reply_markup: {
      inline_keyboard: keyboard
    },
    parse_mode: 'HTML'
  })
})

bot.action(/download:(\S+);/, (ctx) => {
  ctx.answerCbQuery('')
  ctx.replyWithDocument({
    url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
    filename: ctx.match[1] + '.torrent'
  })
})
bot.action(/d=(\S+)/, (ctx) => {
  ctx.answerCbQuery('')
  const caption = `<a href="https://nyaa.si/view/${ctx.match[1]}">nyaa.si/view/${ctx.match[1]}</a>`
  ctx.replyWithDocument({
    url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
    filename: ctx.match[1] + '.torrent'
  }, {
    caption: caption,
    reply_to_message_id: ctx.callbackQuery.message.message_id,
    parse_mode: 'HTML'
  })
})

bot.action(/^magnet=([0-9]+):p=(\S+):o=(\S+)/i, async ctx => {
  ctx.answerCbQuery('')
  const entities = ctx.callbackQuery.message.entities.filter(el => el.type === 'text_link')
  const entity = entities[entities.length - 1]
  const location = new URL(entity.url)
  let query = ''
  if (location.searchParams.has('q')) {
    query = location.searchParams.get('q')
  }
  const searchUrl = `https://nyaa.si/?p=${ctx.match[2]}${query ? `&q=${query}` : ''}`
  const view = await getView(ctx.match[1])
  let messageText = `<a href="${searchUrl}">&#160;</a>${view.title}\n`
  messageText += `<code>${view.links.magnet}</code>`
  ctx.editMessageText(messageText, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [{
          text: buttons.back,
          callback_data: `v=${ctx.match[1]}:p=${ctx.match[2]}:o=${ctx.match[3]}`
        }]
      ]
    },
    reply_to_message_id: ctx.callbackQuery.message.message_id
  })
})

bot.on('inline_query', async ctx => {
  const {
    query
  } = ctx.inlineQuery
  let {
    offset
  } = ctx.inlineQuery
  offset = Number.parseInt(offset) || 0

  const page = offset ? Math.floor(offset / 75) + 1 : 1

  const response = await messageKeyboard.inlineMode(query, {
    page,
    offset: offset % 75
  })
  const results = response.map(el => {
    el.timestamp = new Date(el.timestamp * 1000)
    let messageText = `\n<a href="https://nyaa.si${el.links.page}">${decode(el.name)}</a>\n`
    messageText += `${el.fileSize} · ${template.date(el.timestamp)} · ⬆️ ${el.seeders} · ⬇️ ${el.leechers} · ☑️ ${el.nbDownload}\n${el.category.label}`
    return {
      type: 'article',
      id: el.id.toString(),
      title: decode(el.name),
      description: `${el.fileSize} · ⬆️ ${el.seeders} · ⬇️ ${el.leechers} · ☑️ ${el.nbDownload}\n${el.category.label}\n${template.date(el.timestamp)}`,
      input_message_content: {
        message_text: messageText,
        disable_web_page_preview: false,
        parse_mode: 'HTML'
      },
      reply_markup: {
        inline_keyboard: [
          [{
            text: buttons.torrent.magnet,
            url: `https://t.me/${bot.options.username}?start=${Buffer.from(`magnet:${el.id}`).toString('base64')}`
          }, {
            text: buttons.torrent.download,
            url: `https://t.me/${bot.options.username}?start=${Buffer.from(`download:${el.id}`).toString('base64')}`
          }, {
            text: 'Full view',
            url: `https://t.me/${bot.options.username}?start=${Buffer.from(`view:${el.id}`).toString('base64')}`
          }]
        ]
      }
    }
  })
  ctx.answerInlineQuery(results, {
    cache_time: 5,
    switch_pm_text: 'Continue searching...',
    switch_pm_parameter: `${Buffer.from(`query:${query.slice(0, 64)}`).toString('base64')}`,
    next_offset: `${offset + 25}`
  })
})

bot.startPolling()
