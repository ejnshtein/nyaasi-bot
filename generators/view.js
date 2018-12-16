const nyaasi = require('../nyaasi')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

/* eslint no-extend-native: 0 */
Number.prototype.normalizeZero = function () {
  return this.valueOf().toString().length > 1 ? this.valueOf() : `0${this.valueOf()}`
}
module.exports = (id, history) => {
  return nyaasi.getView(id)
    .then((response) => {
      let messageText = `\n${entities.decode(response.title)}\n`
      const date = new Date()
      const timestamp = new Date(Number.parseInt(response.timestamp) * 1000)
      messageText += `<a href="https://nyaa.si/view/${id}">🌐 Open on nyaa.si</a>\n\n`
      if (response.entry) {
        messageText += `Torrent entry: <a href="https://nyaa.si/help#torrent-colors">${response.entry}</a> \n`
      }
      messageText += `💬 Category:  ${response.category.map(el => `<a href="https://nyaa.si/?c=${el.code}">${el.title}</a>`).join(' - ')}\n`
      messageText += `👨 Submitter: ${typeof response.submitter === 'string' ? response.submitter : `<a href="${response.submitter.link}">${response.submitter.name}</a>`}\n`
      messageText += `ℹ️ Info: ${response.info}\n`
      messageText += `💾 File size: ${response.fileSize}\n\n`
      messageText += `📅 Date: ${timestamp.getFullYear()}-${(timestamp.getMonth() + 1).normalizeZero()}-${timestamp.getDate().normalizeZero()} ${timestamp.getHours().normalizeZero()}:${timestamp.getMinutes().normalizeZero()}\n`
      messageText += `⬆️ Seeders: <b>${response.seeders}</b>\n`
      messageText += `⬇️ Leechers: <b>${response.leechers}</b>\n`
      messageText += `☑️ Completed: <b>${response.completed}</b>\n`
      messageText += `Info hash: <code>${response.infoHash}</code>\n\n`
      messageText += `<a href="${response.links.torrent}">Download Torrent</a>\n\n`
      messageText += `🗘 <b>Updated: ${date.getFullYear()}.${(date.getMonth() + 1).normalizeZero()}.${date.getDate().normalizeZero()} ${date.getHours().normalizeZero()}:${date.getMinutes().normalizeZero()}:${date.getSeconds().normalizeZero()}.${date.getMilliseconds().normalizeZero()}</b><a href="${history}">&#160;</a>`
      return messageText
    })
}