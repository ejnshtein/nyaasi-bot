const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPrivate } = require('../middlewares')
const { searchTorrentKeyboard } = require('../generators')

composer.hears(
  /\/search ([\s\S]*)/i,
  onlyPrivate,
  async ({ reply, match }) => {
    const query = match[1]
    const { text, extra } = await searchTorrentKeyboard(query)
    reply(text, extra)
  })

composer.command(
  ['index', 'search'],
  onlyPrivate,
  async ({ reply }) => {
    const { text, extra } = await searchTorrentKeyboard()
    reply(text, extra)
  })

module.exports = app => {
  app.use(composer.middleware())
}
