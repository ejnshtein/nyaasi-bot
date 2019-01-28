const nyaasi = require('../nyaasi')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
const { templates } = require('../lib')

module.exports = (id, history) => {
  return nyaasi.getView(id)
    .then((response) => {
      let messageText = `\n${entities.decode(response.title)}\n`
      messageText += `<a href="https://nyaa.si/view/${id}">🌐 Open on nyaa.si</a>\n\n`
      if (response.entry) {
        messageText += `Torrent entry: <a href="https://nyaa.si/help#torrent-colors">${response.entry}</a> \n`
      }
      messageText += `💬 Category:  ${response.category.map(el => `<a href="https://nyaa.si/?c=${el.code}">${el.title}</a>`).join(' - ')}\n`
      messageText += `👨 Submitter: ${typeof response.submitter === 'string' ? response.submitter : `<a href="${response.submitter.link}">${response.submitter.name}</a>`}\n`
      messageText += `ℹ️ Info: ${response.info}\n`
      messageText += `💾 File size: ${response.fileSize}\n\n`
      messageText += `📅 Date: ${templates.date(new Date(Number.parseInt(response.timestamp) * 1000))}\n`
      messageText += `⬆️ Seeders: <b>${response.seeders}</b>\n`
      messageText += `⬇️ Leechers: <b>${response.leechers}</b>\n`
      messageText += `☑️ Completed: <b>${response.completed}</b>\n`
      messageText += `Info hash: <code>${response.infoHash}</code>\n\n`
      messageText += `<a href="${response.links.torrent}">Download Torrent</a>\n\n`
      messageText += `🗘 <b>Updated: ${templates.date()}</b><a href="${history}">&#160;</a>`
      return messageText
    })
}