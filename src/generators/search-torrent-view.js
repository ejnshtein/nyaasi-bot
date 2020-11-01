const { search } = require('../nyaasi')
const { buttons, templates } = require('../lib')
const { AllHtmlEntities } = require('html-entities')
const { decode } = new AllHtmlEntities()

module.exports = async (query = '', page = 1, offset = 0) => {
  const { files: searchResult, current_page, last_page } = await search(query, {
    params: {
      p: page
    }
  })
  const slicedTorrents = searchResult
    .slice(offset, offset + 10)
  const keyboard = slicedTorrents
    .map(el => (
      [
        {
          text: decode(el.title),
          callback_data: `t=${el.id}:p=${page}:o=${offset}`
        }
      ]
    ))
  if (offset >= 10) {
    if (slicedTorrents.length === 10 && offset < 70) {
      keyboard.unshift(
        [
          {
            text: buttons.offset.minus(10),
            callback_data: `p=${page}:o=${offset - 10}`
          }, {
            text: buttons.offset.plus(10),
            callback_data: `p=${page}:o=${offset + 10}`
          }
        ]
      )
    } else {
      keyboard.unshift(
        [
          {
            text: buttons.offset.minus(10),
            callback_data: `p=${page}:o=${offset - 10}`
          }
        ]
      )
    }
  } else {
    keyboard.unshift(
      [
        {
          text: buttons.offset.plus(10),
          callback_data: `p=${page}:o=${offset + 10}`
        }
      ]
    )
  }
  const pageLine = []
  if (page >= 2) {
    pageLine.push(
      {
        text: buttons.page.prev(page - 1),
        callback_data: `p=${page - 1}:o=0`
      }
    )
  }
  pageLine.push(
    {
      text: buttons.page.locate(page),
      callback_data: `p=${page}:o=${offset}`
    }
  )
  if (last_page - current_page >= 1) {
    pageLine.push(
      {
        text: buttons.page.next(page + 1),
        callback_data: `p=${page + 1}:o=0`
      }
    )
  }
  if (last_page - current_page >= 2) {
    pageLine.push(
      {
        text: buttons.page.nextDub(page + 2),
        callback_data: `p=${page + 2}:o=0`
      }
    )
  }
  if (page >= 3) {
    pageLine.unshift(
      {
        text: buttons.page.prevDub(1),
        callback_data: 'p=1:o=0'
      }
    )
  }
  keyboard.unshift(pageLine)
  keyboard.unshift([{
    text: 'Switch to inline',
    switch_inline_query_current_chat: query
  }])
  const searchUrl = `https://${process.env.HOST}/?p=${page}&q=${query}`
  return {
    text: templates.searchText(
      searchUrl,
      query,
      page,
      offset
    ),
    extra: {
      reply_markup: {
        inline_keyboard: keyboard
      },
      disable_web_page_preview: true,
      parse_mode: 'HTML'
    }
  }
}
