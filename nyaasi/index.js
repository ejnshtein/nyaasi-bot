const { request } = require('../lib')
const merge = require('deepmerge')
const {
  parseSearch,
  parseTorrent
} = require('./scrap')

class Nyassi {
  static search (query = '', params = {}) {
    return request(`https://${process.env.HOST}/`, merge.all(
      [
        {
          params: {
            q: query
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
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
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
          }
        },
        params
      ]
    )
    ).then(({ data }) => parseTorrent(data, id))
  }
}

module.exports = Nyassi
