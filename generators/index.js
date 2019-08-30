const searchKeyboard = require('./search-keyboard')
const searchTorrentView = require('./search-torrent-view')
const torrentView = require('./torrent-view')
const { buttons, templates } = require('../lib')
module.exports = {
  searchKeyboard,
  torrentView,
  searchTorrentView,
  async searchTorrentKeyboard (query = '', params = {}) {
    const keyboard = await searchKeyboard(query, params)
    keyboard.unshift(
      [
        {
          text: buttons.offset.plus(10),
          callback_data: 'p=1:o=10'
        }
      ]
    )
    keyboard.unshift(
      [
        {
          text: buttons.page.locate(1),
          callback_data: 'p=1:o=0'
        }, {
          text: buttons.page.next(2),
          callback_data: 'p=2:o=0'
        }, {
          text: buttons.page.nextDub(3),
          callback_data: 'p=3:o=0'
        }
      ]
    )
    const searchUrl = `https://${process.env.HOST}/?p=1&q=${query}`
    const messageText = templates.searchText(searchUrl, query, 1, 0)
    return {
      text: messageText,
      extra: {
        reply_markup: {
          inline_keyboard: keyboard
        },
        disable_web_page_preview: true,
        parse_mode: 'HTML'
      }
    }
  }
}
