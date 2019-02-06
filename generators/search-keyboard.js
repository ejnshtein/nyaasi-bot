const { search } = require('../nyaasi')
const { AllHtmlEntities } = require('html-entities')
const { decode } = new AllHtmlEntities()
module.exports = (query = '', params = {}) => {
  params = {
    page: 1,
    offset: 0,
    history: 'p=1:o=0',
    ...params
  }
  return search(query, {
    params: {
      p: params.page
    }
  })
    .then(response => {
      const keyboard = []
      let line = []
      const offsetted = response.slice(params.offset, params.offset + 10)
      if (offsetted.length > 0) {
        offsetted.forEach(el => {
          const text = el.entry + decode(el.name)
          const callback_data = `t=${el.id}:${params.history}`
          if (line.length < 1) {
            line.push({
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
  return search(query, {
    params: {
      p: params.page
    }
  })
    .then(result => result.slice(params.offset, params.offset + 25))
}
