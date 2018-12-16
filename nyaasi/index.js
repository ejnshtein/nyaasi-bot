const nyaa = require('axios').default.create({
  baseURL: 'https://nyaa.si',
  responseType: 'document'
})
const scrap = require('./scrap')

module.exports = {
  getPage (url) {
    return nyaa.get(url)
      .then(response => scrap.parseTorrentsList(response.data))
  },
  getView (id) {
    return nyaa.get(`/view/${id}`)
      .then(response => scrap.parseViewPage(response.data))
  }
}
