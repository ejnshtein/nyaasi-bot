import Telegraf from '@telegraf/core'
import env from '../env.js'
import logger from './database/logger.js'
import collection from './database/index.js'

export const bot = new Telegraf(env.BOT_TOKEN)

bot.telegram.getMe().then(({ username }) => {
  bot.options.username = username
})

bot.context.db = collection

bot.use(logger)

bot.startPolling()
