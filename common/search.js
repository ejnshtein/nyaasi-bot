const { bot } = require('../core/bot')
const { onlyPrivate } = require('../middlewares')
const { keyboardPage, messageKeyboard } = require('../generators')
const { buttons, templates } = require('../lib')

bot.hears(/\/search ([\s\S]*)/i, onlyPrivate, async ({ reply, match }, next) => {
  if (match && match[1]) {
    const { message, extra } = await keyboardPage(match[1])
    reply(message, extra)
  } else {
    next()
  }
})

bot.command(['index', 'search'], onlyPrivate, async ({ reply }) => {
  const { message, extra } = await keyboardPage()
  reply(message, extra)
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
  ctx.editMessageText(templates.searchText(searchUrl, query, page, offset), {
    reply_markup: {
      inline_keyboard: keyboard
    },
    disable_web_page_preview: true,
    parse_mode: 'HTML'
  })
})
