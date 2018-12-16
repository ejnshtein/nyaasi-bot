const messageKeyboard = require('./message-keyboard')
const buttons = require('../buttons')
const template = require('../template')
module.exports = {
  messageKeyboard,
  view: require('./view'),
  async keyboardPage (query = '', params = {}) {
    const keyboard = await messageKeyboard(query, params)
    keyboard.unshift([{
      text: buttons.offset.plus(10),
      callback_data: 'p=1:o=10'
    }])
    keyboard.unshift([{
      text: buttons.page.locate(1),
      callback_data: 'p=1:o=0'
    }, {
      text: buttons.page.next(2),
      callback_data: 'p=2:o=0'
    }, {
      text: buttons.page.nextDub(3),
      callback_data: 'p=3:o=0'
    }])
    const searchUrl = `https://nyaa.si/?p=1&q=${query}`
    return {
      message: template.searchText(searchUrl, query, 1, 0),
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
