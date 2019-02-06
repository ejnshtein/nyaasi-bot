const { getTorrent } = require('../nyaasi')
// const { AllHtmlEntities } = require('html-entities')
// const { decode } = new AllHtmlEntities()
const { templates, buttons } = require('../lib')

module.exports = async (id, query = '', history = 'p=1:o=0') => {
  const torrent = await getTorrent(id)
  const messageText = templates.torrent.view(
    id,
    torrent,
    `https://nyaa.si/?q=${query}`
  )

  const keyboard = [
    [
      {
        text: buttons.torrent.download,
        callback_data: `d=${id}`
      }, {
        text: buttons.torrent.magnet,
        callback_data: `magnet=${id}:${history}`
      },
      {
        text: buttons.share,
        switch_inline_query: `torrent:${id}`
      }
    ],
    [
      {
        text: buttons.back,
        callback_data: history
      },
      {
        text: buttons.page.refresh,
        callback_data: `t=${id}:${history}`
      }
    ]
  ]
  return {
    torrent,
    text: messageText,
    extra: {
      reply_markup: {
        inline_keyboard: keyboard
      },
      parse_mode: 'HTML'
    }
  }
}
