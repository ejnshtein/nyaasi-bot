const util = require('util')
const Telegraf = require('telegraf')
// const rateLimit = require('telegraf-ratelimit') // maybe in future...
const { URL } = require('url')

const config = require('./config.json')
const nyaasi = require('./nyaasi')
const database = require('./database')
const middlewares = require('./middlewares')
const generators = require('./generators')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
const bot = new Telegraf(config.bot.token)
bot.telegram.getMe()
    .then(botInfo => {
        bot.options.username = botInfo.username
    })

Number.prototype.normalizeZero = function () {
    return this.valueOf().toString().length > 1 ? this.valueOf() : `0${this.valueOf()}`
}
const buttons = {
    offset: {
        plus: (plus = 10) => `↓ ${plus}`,
        minus: (minus = 10) => `↑ ${minus}`
    },
    page: {
        next: (page = 1) => `${page} ›`,
        nextDub: (page) => `${page} »`,
        prev: (page = 1) => `‹ ${page}`,
        prevDub: (page = 0) => `« ${page}`,
        locate: (page) => `· ${page} ·`,
        refresh: '🗘 Refresh'
    },
    back: '🡄 Back',
    torrent: {
        download: '🡇 Torrent',
        magnet: '🔗 Magnet'
    }
}
const templateStrings = {
    updated: () => `🗘 Updated ${new Date().getFullYear()}.${(new Date().getMonth() + 1).normalizeZero()}.${new Date().getDate().normalizeZero()} ${new Date().getHours().normalizeZero()}:${new Date().getMinutes().normalizeZero()}:${new Date().getSeconds().normalizeZero()}.${new Date().getMilliseconds()}`,
    searchText: (url, query, page, offset) => `<a href="${url}">${url}</a>\n\n${query ? `Search keyword: ${query}\n` : '' }Page: ${page}\nOffset: ${offset}\n\n<b>${templateStrings.updated()}</b><a href="${url}">&#160;</a>`
}

// const limitConfig = {
//     window: 5000,
//     limit: 5,
//     onLimitExceeded: (ctx) => ctx.reply('Please, try again later')
// }

// bot.use(rateLimit(limitConfig))

bot.use(database.logger())
bot.use(database.middleware())

bot.start((ctx) => {
    if (/\/start (\S*)/i.test(ctx.message.text)) {
        const buffer = ctx.message.text.match(/\/start (\S*)/i)[1]
        const text = Buffer.from(buffer, 'base64').toString('ascii')
        if (/download:[0-9]+/i.test(text)) {
            const id = text.match(/download:([0-9]+)/i)[1]
            return ctx.replyWithDocument({
                url: `https://nyaa.si/download/${id}.torrent`,
                filename: `${id}.torrent`
            })
        } else if (/view:[0-9]+/i.test(text)) {
            const id = text.match(/view:([0-9]+)/i)[1]
            const searchUrl = 'https://nyaa.si/?p=1'
            return generators.view(id, searchUrl)
                .then((messageText) => {
                    const keyboard = []
                    keyboard.push([{
                        text: buttons.torrent.download,
                        callback_data: `d=${id}`
                    }, {
                        text: buttons.torrent.magnet,
                        callback_data: `magnet=${id}:p=1:o=0`
                    }])
                    keyboard.push([{
                        text: buttons.page.refresh,
                        callback_data: `v=${id}:p=1:o=0`
                    }])
                    keyboard.push([{
                        text: buttons.back,
                        callback_data: 'p=1:o=0'
                    }])
                    ctx.reply(messageText, {
                        reply_markup: {
                            inline_keyboard: keyboard
                        },
                        parse_mode: 'HTML'
                    })
                })
                .catch((err) => {
                    util.log(err)
                    ctx.reply(errMessage(`/view/${ctx.match[1]}`), {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    })
                })
        }
    }
    ctx.reply('I\'m nyaa.si website bot and i can help you to find some content from there.\nJust use command /index or /search <text to search> and i\'ll found it on nyaa.si')
})

bot.command('count', async (ctx) => {
    if (ctx.local && ctx.local.admin) { // optional
        const usersCount = await database.nedb.collection('users').count()
        ctx.reply(`I'm working for ${usersCount} user(s)!`)
    }
})
bot.command('source', (ctx) => {
    ctx.reply('My source code at <a href="https://github.com/ejnshtein/nyaasi-bot">Github</a>', {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Bot source code',
                    url: 'https://github.com/ejnshtein/nyaasi-bot'
                }]
            ]
        }
    })
})

bot.command('chat', (ctx) => ctx.reply('༼ つ ◕_◕ ༽つ @nyaasi_chat'))

bot.command('about', ({
    reply
}) => reply('I\'m <a href="https://nyaa.si">nyaa.si</a> website bot.\nFor now, I can search for torrents on <a href="https://nyaa.si">nyaa.si</a> (＾◡＾)っ.\nMore features will arrive soon! ( ͡~ ͜ʖ ͡°)\n\nI\'m still in beta, so please be patient! ( ﾉ ﾟｰﾟ)ﾉ\n\nMy source code at <a href="https://github.com/ejnshtein/nyaasi-bot">github</a>', {
    parse_mode: 'HTML'
}))

bot.hears(/\/search ([\s\S]*)/i, middlewares.onlyPrivate, (ctx, next) => {
    if (ctx.match && ctx.match[1]) {
        generators.messageKeyboard(ctx.match[1], {
                history: 'p=1:o=0'
            })
            .then(keyboard => { // p=1:o=1
                keyboard.unshift([{
                    text: buttons.offset.plus(10),
                    callback_data: 'p=1:o=10'
                }])
                const pageLine = [{
                    text: buttons.page.locate(1),
                    callback_data: 'p=1:o=0'
                }, {
                    text: buttons.page.next(2),
                    callback_data: 'p=2:o=0'
                }, {
                    text: buttons.page.nextDub(3),
                    callback_data: 'p=3:o=0'
                }]
                keyboard.unshift(pageLine)
                const searchUrl = `https://nyaa.si/?p=1&q=${ctx.match[1]}`
                ctx.reply(templateStrings.searchText(searchUrl, ctx.match[1], 1, 0), {
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
            history: 'p=1:o=0'
        })
        .then(keyboard => {
            keyboard.unshift([{
                text: buttons.offset.plus(10),
                callback_data: 'p=1:o=10'
            }])
            const pageLine = [{
                text: buttons.page.locate(1),
                callback_data: 'p=1:o=0'
            }, {
                text: buttons.page.next(2),
                callback_data: 'p=2:o=0'
            }, {
                text: buttons.page.nextDub(3),
                callback_data: 'p=3:o=0'
            }]
            keyboard.unshift(pageLine)
            ctx.reply(templateStrings.searchText('https://nyaa.si/', null, 1, 0), {
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

bot.action(/^p=(\S+):o=(\S+)$/ig, ctx => {
    ctx.answerCbQuery('')
    const entities = ctx.callbackQuery.message.entities.filter(el => el.type === 'text_link')
    const entity = entities[entities.length - 1]
    const page = Number.parseInt(ctx.match[1])
    const offset = Number.parseInt(ctx.match[2])
    const location = new URL(entity.url)
    let query = ''
    if (location.searchParams.has('q')) {
        query = location.searchParams.get('q')
    }
    generators.messageKeyboard(query, {
            history: `p=${ctx.match[1]}:o=${ctx.match[2]}`,
            page: ctx.match[1],
            offset: Number.parseInt(ctx.match[2])
        })
        .then(keyboard => {
            if (offset >= 10) {
                if (offset < 70) {
                    keyboard.unshift([{
                        text: buttons.offset.minus(10),
                        callback_data: `p=${page}:o=${offset - 10}`
                    }, {
                        text: buttons.offset.plus(10),
                        callback_data: `p=${page}:o=${offset + 10}`
                    }])
                } else {
                    keyboard.unshift([{
                        text: buttons.offset.minus(10),
                        callback_data: `p=${page}:o=${offset - 10}`
                    }])
                }
            } else {
                keyboard.unshift([{
                    text: buttons.offset.plus(10),
                    callback_data: `p=${page}:o=${offset + 10}`
                }])
            }
            const pageLine = []
            if (page >= 2) {
                pageLine.push({
                    text: buttons.page.prev(page - 1),
                    callback_data: `p=${page - 1}:o=0`
                })
                pageLine.push({
                    text: buttons.page.locate(page),
                    callback_data: `p=${page}:o=${offset}`
                })
            } else {
                pageLine.push({
                    text: buttons.page.locate(page),
                    callback_data: `p=${page}:o=${offset}`
                })
            }
            pageLine.push({
                text: buttons.page.next(page + 1),
                callback_data: `p=${page + 1}:o=0`
            })
            pageLine.push({
                text: buttons.page.nextDub(page + 2),
                callback_data: `p=${page + 2}:o=0`
            })
            if (page >= 3) {
                pageLine.unshift({
                    text: buttons.page.prevDub(1),
                    callback_data: 'p=1:o=0'
                })
            }
            keyboard.unshift(pageLine)
            const searchUrl = `https://nyaa.si/?p=${page}${query ? `&q=${query}` : ''}`
            ctx.editMessageText(templateStrings.searchText(searchUrl, query, page, offset), {
                reply_markup: {
                    inline_keyboard: keyboard
                },
                disable_web_page_preview: true,
                parse_mode: 'HTML'
            })
        })
        .catch((err) => {
            util.log(err)
            ctx.reply(errMessage('/', ctx.match[1], query), {
                parse_mode: 'HTML'
            })
        })
})

bot.action(/^v=(\S+?):p=(\S+):o=(\S+)$/ig, ctx => {
    ctx.answerCbQuery('')
    const entities = ctx.callbackQuery.message.entities.filter(el => el.type === 'text_link')
    const entity = entities[entities.length - 1]
    const location = new URL(entity.url)
    let query = ''
    if (location.searchParams.has('q')) {
        query = location.searchParams.get('q')
    }
    const searchUrl = `https://nyaa.si/?p=${ctx.match[2]}${query ? `&q=${query}` : ''}`
    generators.view(ctx.match[1], searchUrl)
        .then((messageText) => {
            const keyboard = []
            keyboard.push([{
                text: buttons.torrent.download,
                callback_data: `d=${ctx.match[1]}`
            }, {
                text: buttons.torrent.magnet,
                callback_data: `magnet=${ctx.match[1]}:p=${ctx.match[2]}:o=${ctx.match[3]}`
            }])
            keyboard.push([{
                text: buttons.page.refresh,
                callback_data: ctx.match[0]
            }])
            keyboard.push([{
                text: buttons.back,
                callback_data: `p=${ctx.match[2]}:o=${ctx.match[3]}`
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
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        })
})

bot.action(/download:(\S+);/, (ctx) => {
    ctx.answerCbQuery('')
    ctx.replyWithDocument({
        url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
        filename: ctx.match[1] + '.torrent'
    })
})
bot.action(/d=(\S+)/, (ctx) => {
    ctx.answerCbQuery('')
    const caption = `<a href="https://nyaa.si/view/${ctx.match[1]}">nyaa.si/view/${ctx.match[1]}</a>`
    ctx.replyWithDocument({
        url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
        filename: ctx.match[1] + '.torrent'
    }, {
        caption: caption,
        reply_to_message_id: ctx.callbackQuery.message.message_id,
        parse_mode: 'HTML'
    })
})

bot.action(/^magnet=([0-9]+):p=(\S+):o=(\S+)/i, ctx => {
    ctx.answerCbQuery('')
    const entities = ctx.callbackQuery.message.entities.filter(el => el.type === 'text_link')
    const entity = entities[entities.length - 1]
    const location = new URL(entity.url)
    let query = ''
    if (location.searchParams.has('q')) {
        query = location.searchParams.get('q')
    }
    const searchUrl = `https://nyaa.si/?p=${ctx.match[2]}${query ? `&q=${query}` : ''}`
    nyaasi.getView(ctx.match[1])
        .then(response => {
            let messageText = `<a href="${searchUrl}">&#160;</a>${response.title}\n`
            messageText += `<code>${response.links.magnet}</code>`
            ctx.editMessageText(messageText, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: buttons.back,
                            callback_data: `v=${ctx.match[1]}:p=${ctx.match[2]}:o=${ctx.match[3]}`
                        }]
                    ]
                },
                reply_to_message_id: ctx.callbackQuery.message.message_id
            })
        })
        .catch((err) => {
            util.log(err)
            ctx.reply(errMessage('/view/' + ctx.match[1]), {
                parse_mode: 'HTML'
            })
        })
})

bot.on('inline_query', ctx => {
    const query = ctx.inlineQuery.query
    const page = 1
    const offset = 0
    const searchUrl = `https://nyaa.si/?p=${page}&q=${query}`
    generators.messageKeyboard.inlineMode(query, {
            page: page,
            offset: offset,
        }).then(response => {
            const results = response.map(el => {
                el.timestamp = new Date(el.timestamp * 1000)
                let messageText = `\n${entities.decode(el.name)}\n\n`
                messageText += `<a href="https://nyaa.si${el.links.page}">🌐 Open on nyaa.si</a>\n\n`
                if (el.entry) {
                    messageText += `Torrent entry: <a href="https://nyaa.si/help#torrent-colors">${el.entry}</a> \n`
                }
                messageText += `💬 Category: <a href="https://nyaa.si/?c=${el.category.code}">${el.category.label}</a>\n`
                messageText += `💾 File size: ${el.fileSize}\n\n`
                messageText += `📅 Date: ${el.timestamp.getFullYear()}-${p(el.timestamp.getMonth() + 1)}-${p(el.timestamp.getDate())} ${p(el.timestamp.getHours())}:${p(el.timestamp.getMinutes())}\n`
                messageText += `⬆️ Seeders: <b>${el.seeders}</b>\n`
                messageText += `⬇️ Leechers: <b>${el.leechers}</b>\n`
                messageText += `☑️ Completed: <b>${el.nbDownload}</b>\n\n`
                messageText += `<a href="https://nyaa.si${el.links.file}">Download Torrent</a>\n\n`
                messageText += `<b>🔁 Updated ${new Date().getFullYear()}.${p(new Date().getMonth() + 1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b><a href="${searchUrl}">&#160;</a>`
                const result = {
                    type: 'article',
                    id: el.links.page.replace('/view/', ''),
                    title: entities.decode(el.name),
                    description: `${el.fileSize} · ⬆️ ${el.seeders} · ⬇️ ${el.leechers} · ☑️ ${el.nbDownload}`,
                    input_message_content: {
                        message_text: messageText,
                        disable_web_page_preview: false,
                        parse_mode: 'HTML'
                    },
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: buttons.torrent.download,
                                url: `https://t.me/${bot.options.username}?start=${Buffer.from(`download:${el.links.page.replace('/view/', '')}`).toString('base64')}`
                            }, {
                                text: '👁 Show full view',
                                url: `https://t.me/${bot.options.username}?start=${Buffer.from(`view:${el.links.page.replace('/view/', '')}`).toString('base64')}`
                            }]
                        ]
                    }
                }
                return result
            })
            ctx.answerInlineQuery(results, {
                    cache_time: 5,
                    switch_pm_text: 'Open chat with bot'
                })
                .catch(util.log)
            // ctx.reply(`<a href="https://nyaa.si?p=1&q=${ctx.match[1]}}">&#160;</a><a href="https://nyaa.si?p=1&q=${ctx.match[1]}">nyaa.si?p=1&q=${ctx.match[1]}</a>\n\nPage: 1\nOffset: 0\n\nUpdated ${new Date().getFullYear()}.${p(new Date().getMonth() + 1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}`, {
            //     reply_markup: {
            //         inline_keyboard: keyboard
            //     },
            //     disable_web_page_preview: true,
            //     parse_mode: 'HTML'
            // })
        })
        .catch((err) => {
            util.log(err)
            ctx.reply(errMessage('/', page, query), {
                parse_mode: 'HTML'
            })
        })
})

/**
 * @param {String} [path='/'] path 
 * @param {String} q search key
 * @param {String} p search page
 */
function errMessage(path = '/', p, q) {
    return `Something went wrong.\nTry to open manually on <a href="https://nyaa.si${path}?${p ? `p=${p}` : ''}${q ? `q=${q}` : ''}">https://nyaa.si${path}?${p ? `p=${p}` : ''}${q ? `q=${q}` : ''}</a>`
}

/**
 * Normalize date 
 * @param {Date} data 
 */
function p(data) {
    return data.toString().length > 1 ? data : `0${data}`
}

bot.catch((err) => util.log(err))
bot.startPolling()
util.log('Bot started')