const Telegraf = require('telegraf').default
const bot = new Telegraf(process.env.BOT_TOKEN)
const logger = require('./database/logger')
const collection = require('./database')

bot.telegram.getMe()
  .then(botInfo => {
    bot.options.username = botInfo.username
  })

bot.context.db = collection

bot.use(logger())

module.exports = {
  bot
}

bot.startPolling()

console.log('Bot started')
