const axios = require('axios').default
const nyaa = axios.create({
  baseURL: 'https://nyaa.si',
  responseType: 'document'
})
const { parseTorrentsList, parseViewPage } = require('./scrap')

module.exports = {
  getPage (url) {
    return nyaa.get(url)
      .then(({ data }) => parseTorrentsList(data))
  },
  getView (id) {
    return nyaa.get(`/view/${id}`)
      .then(({ data }) => parseViewPage(data))
  }
}
