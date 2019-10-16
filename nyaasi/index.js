const { request } = require('../lib')
const merge = require('deepmerge')
const {
  parseSearch,
  parseTorrent
} = require('./scrap')

const userAgent = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
  }
}

class Nyassi {
  static search (query = '', params = {}) {
    return request(`https://${process.env.HOST}/`, merge.all(
      [
        userAgent,
        {
          params: {
            q: query
          }
        },
        params
      ]
    )
    ).then(({ data }) => parseSearch(data))
  }

  static getTorrent (id, params = {}) {
    return request(`https://${process.env.HOST}/view/${id}`, merge.all(
      [
        userAgent,
        params
      ]
    )
    ).then(({ data }) => parseTorrent(data, id))
  }
}

module.exports = Nyassi
