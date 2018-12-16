const {
  getPage
} = require('../nyaasi')
const Entities = require('html-entities').AllHtmlEntities
const {
  decode
} = new Entities()

/* eslint no-extend-native: 0 */
Number.prototype.normalizeZero = function () {
  return this.valueOf().toString().length > 1 ? this.valueOf() : `0${this.valueOf()}`
}

module.exports = (query = '', params = {}) => {
  params = {
    page: 1,
    offset: 0,
    history: 'p=1:o=0',
    ...params
  }
  return getPage(query ? `?p=${params.page}&q=${query}` : params.page === '1' ? '/' : `?p=${params.page}`)
    .then(response => {
      const keyboard = []
      let line = []
      const offsetted = response.slice(params.offset, params.offset + 10)
      if (offsetted.length > 0) {
        offsetted.forEach(el => {
          const text = el.entry + decode(el.name)
          const callback_data = `v=${el.id}:${params.history}`
          if (line.length < 1) {
            line.push({ // ^v=(\S+):p=(\S+):o=(\S+)
              text,
              callback_data
            })
          } else {
            keyboard.push(line)
            line = []
            line.push({
              text,
              callback_data
            })
          }
        })
        keyboard.push(line)
      }
      return keyboard
    })
}
module.exports.inlineMode = (query, params = {}) => {
  params = {
    page: 1,
    offset: 0,
    ...params
  }
  return getPage(query ? `?p=${params.page}&q=${query}` : params.page === '1' ? '/' : `?p=${params.page}`)
    .then(result => result.slice(params.offset, params.offset + 25))
}
