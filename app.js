const util = require('util')
const Telegraf = require('telegraf')

const config = require('./config.json')
const nyaasi = require('./nyaasi')
const nedb = require('./database')
const middlewares = require('./middlewares')
const generators = require('./generators')
const bot = new Telegraf(config.bot.token)

bot.telegram.getMe().then(botInfo => {
    bot.options.username = botInfo.username
})

const buttons = {
    offset: {
        plus: (plus = 10) => `⬇️ Offset +${plus}`,
        minus: (minus = 10) => `⬆️ Offset -${minus}`
    },
    page: {
        next: (page = 1) => `Page ${page} ➡️`,
        prev: (page = 1) => `⬅️ Page ${page}`,
        refresh: '🔄 Refresh'
    },
    back: '⬅️ Back',
    torrent: {
        download: '⬇️ Download torrent file here'
    }
}

bot.start((ctx) => ctx.reply('I\'m nyaa.si website bot and i can help you to find some content from there.\nJust use command /search or /search <text to search> and i\'ll found it on nyaa.si'))

bot.use(nedb.logger())

bot.command('count', async (ctx) => {
    if (ctx.local.admin) { // optional
        const chatCount = await nedb.chats.count()
        const usersCount = await nedb.users.count()
        ctx.reply(`I'm working in ${chatCount} chat(s)!\nAlso for ${usersCount} user(s)!`)
    }
})

bot.command('about', (ctx) => ctx.reply('I\'m <a href="https://nyaa.si">nyaa.si</a> website bot.\nFor now, I can search for torrents on <a href="https://nyaa.si">nyaa.si</a> (＾◡＾)っ.\nMore features will arrive soon! ( ͡~ ͜ʖ ͡°)\n\nI\'m still in beta, so please be patient! ( ﾉ ﾟｰﾟ)ﾉ\n\nMy source code at <a href="https://github.com/ejnshtein/nyaasi-bot">github</a>', {
    parse_mode: 'HTML'
}))

bot.hears(/\/search ([\s\S]*)/i, middlewares.onlyPrivate, (ctx, next) => {
    if (ctx.match && ctx.match[1]) {
        generators.messageKeyboard(ctx.match[1], {
                history: `navigate:q=${ctx.match[1]};p=1;of=0;e=false;`
            })
            .then(keyboard => {
                keyboard.unshift([{
                    text: buttons.offset.plus(10),
                    callback_data: `navigate:q=${ctx.match[1]};p=1;of=10;e=false;`
                }])
                keyboard.unshift([{
                    text: buttons.page.next(2),
                    callback_data: `navigate:q=${ctx.match[1]};p=2;of=0;e=false;`
                }])
                keyboard.unshift([{
                    text: buttons.page.refresh,
                    callback_data: `navigate:q=${ctx.match[1]};p=1;of=0;e=false;`
                }])
                ctx.reply(`<a href="https://nyaa.si?p=1&q=${ctx.match[1]}">nyaa.si?p=1&q=${ctx.match[1]}</a>\n\nPage: 1\nOffset: 0\n\nUpdated ${new Date().getFullYear()}.${p(new Date().getMonth()+1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}`, {
                    reply_markup: {
                        inline_keyboard: keyboard
                    },
                    disable_web_page_preview: true,
                    parse_mode: 'HTML'
                })
            })
            .catch((err) => {
                util.log(err)
                ctx.reply(errMessage('/', '1', ctx.match[1]), {
                    parse_mode: 'HTML'
                })
            })
    } else {
        next(ctx)
    }
})

bot.command(['index', 'search'], middlewares.onlyPrivate, (ctx) => {
    generators.messageKeyboard('', {
            empty: true,
            history: 'navigate:q=f;p=1;of=0;e=true;'
        })
        .then(keyboard => {
            keyboard.unshift([{
                text: buttons.page.next(2),
                callback_data: 'navigate:q=f;p=2;of=0;e=true;'
            }])
            keyboard.unshift([{
                text: buttons.offset.plus(10),
                callback_data: 'navigate:q=f;p=1;of=10;e=true;'
            }])
            keyboard.unshift([{
                text: buttons.page.refresh,
                callback_data: 'navigate:q=f;p=1;of=0;e=true;'
            }])
            ctx.reply(`<a href="https://nyaa.si/?p=1">nyaa.si/p=1</a>\n\nPage: 1\nOffset: 0\n\n<b>🔁 Updated: ${new Date().getFullYear()}.${p(new Date().getMonth()+1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b>`, {
                reply_markup: {
                    inline_keyboard: keyboard
                },
                disable_web_page_preview: true,
                parse_mode: 'HTML'
            })
        })
        .catch((err) => {
            util.log(err)
            ctx.reply(errMessage('/'), {
                parse_mode: 'HTML'
            })
        })
})
// q=search key word;p=page;of=offset;e=empty request?;
// callback_data: `navigate:q=key word;p=2;of=0;e=false`
bot.action(/^navigate:q=([\s\S]*);p=(\S+);of=(\S+?);e=(\S+);/i, (ctx) => {
    ctx.answerCbQuery('Working...')
    generators.messageKeyboard(ctx.match[4] == 'true' ? '' : ctx.match[1], {
            page: ctx.match[2],
            offset: Number.parseInt(ctx.match[3]),
            empty: ctx.match[4] == 'true',
            history: ctx.match[0]
        })
        .then(keyboard => {
            if (Number.parseInt(ctx.match[3]) >= 10) {
                keyboard.unshift([{
                    text: buttons.offset.minus(10),
                    callback_data: `navigate:q=${ctx.match[1]};p=${ctx.match[2]};of=${Number.parseInt(ctx.match[3])-10};e=${ctx.match[4]};`
                }, {
                    text: buttons.offset.plus(10),
                    callback_data: `navigate:q=${ctx.match[1]};p=${ctx.match[2]};of=${Number.parseInt(ctx.match[3])+10};e=${ctx.match[4]};`
                }])
            } else {
                keyboard.unshift([{
                    text: buttons.offset.plus(10),
                    callback_data: `navigate:q=${ctx.match[1]};p=${ctx.match[2]};of=${Number.parseInt(ctx.match[3])+10};e=${ctx.match[4]};`
                }])
            }
            if (Number.parseInt(ctx.match[2]) >= 2) {
                keyboard.unshift([{
                    text: buttons.page.prev(Number.parseInt(ctx.match[2]) - 1),
                    callback_data: `navigate:q=${ctx.match[1]};p=${Number.parseInt(ctx.match[2])-1};of=0;e=${ctx.match[4]};`
                }, {
                    text: buttons.page.next(Number.parseInt(ctx.match[2]) + 1),
                    callback_data: `navigate:q=${ctx.match[1]};p=${Number.parseInt(ctx.match[2])+1};of=0;e=${ctx.match[4]};`
                }])
            } else {
                keyboard.unshift([{
                    text: buttons.page.next(Number.parseInt(ctx.match[2]) + 1),
                    callback_data: `navigate:q=${ctx.match[1]};p=2;of=0;e=${ctx.match[4]};`
                }])
            }
            keyboard.unshift([{
                text: buttons.page.refresh,
                callback_data: `navigate:q=${ctx.match[1]};p=${ctx.match[2]};of=${ctx.match[3]};e=${ctx.match[4]};`
            }])
            let searchUrl = `https://nyaa.si/?p=${ctx.match[2]}${ctx.match[4] == 'true' ? '':`&q=${ctx.match[1]}`}`
            ctx.editMessageText(`<a href="${searchUrl}">${searchUrl}</a>\n\n${ctx.match[4] ? '' :`Search keyword: ${ctx.match[1]}\n`}Page: ${ctx.match[2]}\nOffset: ${ctx.match[3]}\n\n<b>🔁 Updated ${new Date().getFullYear()}.${p(new Date().getMonth()+1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b>`, {
                reply_markup: {
                    inline_keyboard: keyboard
                },
                disable_web_page_preview: true,
                parse_mode: 'HTML'
            })
        })
        .catch((err) => {
            util.log(err)
            ctx.reply(errMessage('/', ctx.match[2], ctx.match[1]), {
                parse_mode: 'HTML'
            })
        })
})

bot.action(/^view:id=(\S+?);([\s\S]*)/i, (ctx) => {
    ctx.answerCbQuery('Working...')
    nyaasi.getView(ctx.match[1])
        .then((response) => {
            let messageText = `\n${response.title}\n`
            let timestamp = new Date(Number.parseInt(response.timestamp) * 1000)
            messageText += `🌐 <a href="https://nyaa.si/view/${ctx.match[1]}">Open on nyaa.si</a>\n\n`
            if (response.entry) {
                messageText += `Torrent entry: <a href="https://nyaa.si/help#torrent-colors">${response.entry}</a> \n`
            }
            messageText += '💬 Category:  '
            let category = []
            response.category.forEach(el => {
                category.push(`<a href="https://nyaa.si/?c=${el.code}">${el.title}</a>`)
            })
            messageText += category.join(' - ') + '\n'
            messageText += `👨 Submitter: ${typeof response.submitter == 'string' ? response.submitter : `<a href="${response.submitter.link}">${response.submitter.name}</a>`}\n`
            messageText += `ℹ️ Info: ${response.info}\n`
            messageText += `💾 File size: ${response.fileSize}\n\n`
            messageText += `📅 Date: ${timestamp.getFullYear()}-${p(timestamp.getMonth()+1)}-${p(timestamp.getDate())} ${p(timestamp.getHours())}:${p(timestamp.getMinutes())}\n`
            messageText += `⬆️ Seeders: <b>${response.seeders}</b>\n`
            messageText += `⬇️ Leechers: <b>${response.leechers}</b>\n`
            messageText += `☑️ Completed: <b>${response.completed}</b>\n`
            messageText += `Info hash: <code>${response.infoHash}</code>\n\n`
            messageText += `<a href="${response.links.torrent}">Download Torrent</a>\n\n`
            messageText += `🔁 <b>Updated: ${new Date().getFullYear()}.${p(new Date().getMonth()+1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b>`
            let keyboard = []
            keyboard.push([{
                text: buttons.torrent.download,
                callback_data: `download:${ctx.match[1]};`
            }])
            keyboard.push([{
                text: buttons.page.refresh,
                callback_data: ctx.match[0]
            }])
            keyboard.push([{
                text: buttons.back,
                callback_data: ctx.match[2]
            }])
            ctx.editMessageText(messageText, {
                reply_markup: {
                    inline_keyboard: keyboard
                },
                parse_mode: 'HTML'
            })
        })
        .catch((err) => {
            util.log(err)
            ctx.reply(errMessage(`/view/${ctx.match[1]}`), {
                parse_mode: 'HTML'
            })
        })
})

bot.action(/download:(\S+);/, (ctx) => ctx.replyWithDocument({
    url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
    filename: ctx.match[1] + '.torrent'
}))

/**
 * @param {String} [path='/'] path 
 * @param {String} q search key
 * @param {String} p search page
 */
function errMessage(path = '/', p, q) {
    return `Something went wrong.\nTry to open manually on <a href="https://nyaa.si${path}?${p?`p=${p}`:''}${q?`q=${q}`:''}">https://nyaa.si${path}?${p?`p=${p}`:''}${q?`q=${q}`:''}</a>`
}

function p(data) {
    return data.toString().length > 1 ? data : `0${data}`
}

bot.catch((err) => util.log(err))
bot.startPolling()
util.log('Bot started')