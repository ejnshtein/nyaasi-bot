const Telegraf = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)
const { logger } = require('../database')

bot.telegram.getMe()
  .then(botInfo => {
    bot.options.username = botInfo.username
  })

bot.use(logger())

module.exports = {
  bot
}

bot.startPolling()

console.log('Bot started')
