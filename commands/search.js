const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPrivate } = require('../middlewares')
const { searchTorrentView } = require('../generators')

composer.hears(
  /\/search ([\s\S]*)/i,
  onlyPrivate,
  async ({ reply, match }) => {
    const query = match[1]
    try {
      var { text, extra } = await searchTorrentView(query)
    } catch (e) {
      return reply(`Something went wrong...\n\n${e.message}`)
    }
    reply(text, extra)
  })

composer.command(
  ['index', 'search'],
  onlyPrivate,
  async ({ reply }) => {
    try {
      var { text, extra } = await searchTorrentView()
    } catch (e) {
      return reply(`Something went wrong...\n\n${e.message}`)
    }
    reply(text, extra)
  })

module.exports = app => {
  app.use(composer.middleware())
}
