const nyaa = require('axios').default.create({
  baseURL: 'https://nyaa.si',
  responseType: 'document'
})
const {
  parseSearch,
  parseTorrent
} = require('./scrap')

class Nyassi {
  static search (query = '', params = {}) {
    return nyaa.get('/',
      {
        params: Object.assign({
          q: query
        }, params)
      }
    ).then(({ data }) => parseSearch(data))
  }

  static getTorrent (id, params = {}) {
    return nyaa.get(`/view/${id}`, params)
      .then(({ data }) => parseTorrent(data))
  }
}

module.exports = Nyassi
