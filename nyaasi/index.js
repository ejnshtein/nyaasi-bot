const nyaa = require('axios').default.create({
  baseURL: 'https://nyaa.si',
  responseType: 'document',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
  }
})
const merge = require('deepmerge')
const {
  parseSearch,
  parseTorrent
} = require('./scrap')

class Nyassi {
  static search (query = '', params = {}) {
    return nyaa.get('/', merge.all(
      [
        {
          params: {
            q: query
          }
        },
        params
      ]
    )
    ).then(({ data, headers, config }) => {
      // console.log(headers, config.headers)
      return parseSearch(data)
    })
  }

  static getTorrent (id, params = {}) {
    return nyaa.get(`/view/${id}`, params)
      .then(({ data }) => parseTorrent(data, id))
  }
}

module.exports = Nyassi
