const util = require('util')
const Telegraf = require('telegraf')
const { URL } = require('url')

const config = require('./config.json')
const nyaasi = require('./nyaasi')
const database = require('./database')
const middlewares = require('./middlewares')
const generators = require('./generators')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
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
        download: '⬇️ Download',
        magnet: 'Magnet'
    }
}

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
    ctx.reply('I\'m nyaa.si website bot and i can help you to find some content from there.\nJust use command /search or /search <text to search> and i\'ll found it on nyaa.si')
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
                [
                    {
                        text: 'Bot source code',
                        url: 'https://github.com/ejnshtein/nyaasi-bot'
                    }
                ]
            ]
        }
    })
})

bot.command('chat', (ctx) => ctx.reply('༼ つ ◕_◕ ༽つ @nyaasi_chat'))

bot.command('about', ({ reply }) => reply('I\'m <a href="https://nyaa.si">nyaa.si</a> website bot.\nFor now, I can search for torrents on <a href="https://nyaa.si">nyaa.si</a> (＾◡＾)っ.\nMore features will arrive soon! ( ͡~ ͜ʖ ͡°)\n\nI\'m still in beta, so please be patient! ( ﾉ ﾟｰﾟ)ﾉ\n\nMy source code at <a href="https://github.com/ejnshtein/nyaasi-bot">github</a>', {
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
                keyboard.unshift([{
                    text: buttons.page.next(2),
                    callback_data: 'p=2:o=0'
                }])
                keyboard.unshift([{
                    text: buttons.page.refresh,
                    callback_data: 'p=1:o=0'
                }])
                
                const searchUrl = `https://nyaa.si/?p=1&q=${ctx.match[1]}`
                ctx.reply(`<a href="${searchUrl}">${searchUrl}</a>\n\nSearch keyword: ${ctx.match[1]}\nPage: 1\nOffset: 0\n\n<b>🔁 Updated ${new Date().getFullYear()}.${p(new Date().getMonth() + 1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b><a href="${searchUrl}">&#160;</a>`, {
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
            keyboard.unshift([{
                text: buttons.page.next(2),
                callback_data: 'p=2:o=0'
            }])
            keyboard.unshift([{
                text: buttons.page.refresh,
                callback_data: 'p=1:o=0'
            }])
            ctx.reply(`<a href="https://nyaa.si/?p=1">https://nyaa.si/?p=1</a>\n\nPage: 1\nOffset: 0\n\n<b>🔁 Updated: ${new Date().getFullYear()}.${p(new Date().getMonth() + 1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b><a href="https://nyaa.si?p=1">&#160;</a>`, {
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
        if (Number.parseInt(ctx.match[2]) >= 10) {
            keyboard.unshift([{
                text: buttons.offset.minus(10),
                callback_data: `p=${ctx.match[1]}:o=${Number.parseInt(ctx.match[2]) - 10}`
            }, {
                text: buttons.offset.plus(10),
                callback_data: `p=${ctx.match[1]}:o=${Number.parseInt(ctx.match[2]) + 10}`
            }])
        } else {
            keyboard.unshift([{
                text: buttons.offset.plus(10),
                callback_data: `p=${ctx.match[1]}:o=${Number.parseInt(ctx.match[2]) + 10}`
            }])
        }
        if (Number.parseInt(ctx.match[1]) >= 2) {
            keyboard.unshift([{
                text: buttons.page.prev(Number.parseInt(ctx.match[1]) - 1),
                callback_data: `p=${Number.parseInt(ctx.match[1]) - 1}:o=0`
            }, {
                text: buttons.page.next(Number.parseInt(ctx.match[1]) + 1),
                callback_data: `p=${Number.parseInt(ctx.match[1]) + 1}:o=0`
            }])
        } else {
            keyboard.unshift([{
                text: buttons.page.next(Number.parseInt(ctx.match[1]) + 1),
                callback_data: 'p=2:o=0'
            }])
        }
        keyboard.unshift([{
            text: buttons.page.refresh,
            callback_data: `p=${ctx.match[1]}:o=${ctx.match[2]}`
        }])
        const searchUrl = `https://nyaa.si/?p=${ctx.match[1]}${query ? `&q=${query}` : ''}`
        ctx.editMessageText(`<a href="${searchUrl}">${searchUrl}</a>\n\n${query ? `Search keyword: ${query}\n` : '' }Page: ${ctx.match[1]}\nOffset: ${ctx.match[2]}\n\n<b>🔁 Updated ${new Date().getFullYear()}.${p(new Date().getMonth() + 1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b><a href="${searchUrl}">&#160;</a>`, {
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

bot.action(/^v=(\S+?):(\S+)$/ig, ctx => {
    ctx.answerCbQuery('')
    const entities = ctx.callbackQuery.message.entities.filter(el => el.type === 'text_link')
    const entity = entities[entities.length - 1]
    const location = new URL(entity.url)
    let query = ''
    if (location.searchParams.has('q')) {
        query = location.searchParams.get('q')
    }
    const searchUrl = `https://nyaa.si/?p=${ctx.match[1]}${query ? `&q=${query}` : ''}`
    generators.view(ctx.match[1], searchUrl)
        .then((messageText) => {
            const keyboard = []
            keyboard.push([{
                text: buttons.torrent.download,
                callback_data: `d=${ctx.match[1]}`
            }, {
                text: buttons.torrent.magnet,
                callback_data: `magnet=${ctx.match[1]}`
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
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        })
})

// q=search key word;p=page;of=offset;e=empty request?;
// callback_data: `navigate:q=key word;p=2;of=0;e=false`
bot.action(/^navigate:q=([\s\S]*);p=(\S+);of=(\S+?);e=(\S+);/i, (ctx) => {
    ctx.answerCbQuery('Working...')
    const query = ctx.match[4] === 'true' ? '' : ctx.match[1]
    generators.messageKeyboard(ctx.match[4] === 'true' ? '' : ctx.match[1], {
            page: ctx.match[2],
            offset: Number.parseInt(ctx.match[3]),
            empty: ctx.match[4] === 'true',
            history: `p=${ctx.match[2]}:o=${ctx.match[3]}`
        })
        .then(keyboard => {
            if (Number.parseInt(ctx.match[3]) >= 10) {
                keyboard.unshift([{
                    text: buttons.offset.minus(10),
                    callback_data: `p=${ctx.match[2]}:o=${Number.parseInt(ctx.match[3]) - 10}`
                }, {
                    text: buttons.offset.plus(10),
                    callback_data: `p=${ctx.match[2]}:o=${Number.parseInt(ctx.match[3]) + 10}`
                }])
            } else {
                keyboard.unshift([{
                    text: buttons.offset.plus(10),
                    callback_data: `p=${ctx.match[2]}:o=${Number.parseInt(ctx.match[3]) + 10}`
                }])
            }
            if (Number.parseInt(ctx.match[2]) >= 2) {
                keyboard.unshift([{
                    text: buttons.page.prev(Number.parseInt(ctx.match[2]) - 1),
                    callback_data: `p=${Number.parseInt(ctx.match[2]) - 1}:o=0`
                }, {
                    text: buttons.page.next(Number.parseInt(ctx.match[2]) + 1),
                    callback_data: `p=${Number.parseInt(ctx.match[2]) + 1}:o=0`
                }])
            } else {
                keyboard.unshift([{
                    text: buttons.page.next(Number.parseInt(ctx.match[2]) + 1),
                    callback_data: 'p=2:o=0'
                }])
            }
            keyboard.unshift([{
                text: buttons.page.refresh,
                callback_data: `p=${ctx.match[2]}:o=${ctx.match[3]}`
            }])
            const searchUrl = `https://nyaa.si/?p=${ctx.match[1]}${query ? `&q=${query}` : ''}`
            ctx.editMessageText(`<a href="${searchUrl}">${searchUrl}</a>\n\n${query ? `Search keyword: ${query}\n` : '' }Page: ${ctx.match[1]}\nOffset: ${ctx.match[2]}\n\n<b>🔁 Updated ${new Date().getFullYear()}.${p(new Date().getMonth() + 1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b><a href="${searchUrl}">&#160;</a>`, {
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
            const timestamp = new Date(Number.parseInt(response.timestamp) * 1000)
            messageText += `🌐 <a href="https://nyaa.si/view/${ctx.match[1]}">Open on nyaa.si</a>\n\n`
            if (response.entry) {
                messageText += `Torrent entry: <a href="https://nyaa.si/help#torrent-colors">${response.entry}</a> \n`
            }
            messageText += '💬 Category:  '
            const category = []
            response.category.forEach(el => {
                category.push(`<a href="https://nyaa.si/?c=${el.code}">${el.title}</a>`)
            })
            messageText += category.join(' - ') + '\n'
            messageText += `👨 Submitter: ${typeof response.submitter === 'string' ? response.submitter : `<a href="${response.submitter.link}">${response.submitter.name}</a>`}\n`
            messageText += `ℹ️ Info: ${response.info}\n`
            messageText += `💾 File size: ${response.fileSize}\n\n`
            messageText += `📅 Date: ${timestamp.getFullYear()}-${p(timestamp.getMonth() + 1)}-${p(timestamp.getDate())} ${p(timestamp.getHours())}:${p(timestamp.getMinutes())}\n`
            messageText += `⬆️ Seeders: <b>${response.seeders}</b>\n`
            messageText += `⬇️ Leechers: <b>${response.leechers}</b>\n`
            messageText += `☑️ Completed: <b>${response.completed}</b>\n`
            messageText += `Info hash: <code>${response.infoHash}</code>\n\n`
            messageText += `<a href="${response.links.torrent}">Download Torrent</a>\n\n`
            messageText += `🔁 <b>Updated: ${new Date().getFullYear()}.${p(new Date().getMonth() + 1)}.${p(new Date().getDate())} ${p(new Date().getHours())}:${p(new Date().getMinutes())}:${p(new Date().getSeconds())}.${new Date().getMilliseconds()}</b>`
            const keyboard = []
            keyboard.push([{
                text: buttons.torrent.download,
                callback_data: `d=${ctx.match[1]}`
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

bot.action(/download:(\S+);/, (ctx) => {
    ctx.answerCbQuery('')
    ctx.replyWithDocument({
        url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
        filename: ctx.match[1] + '.torrent'
    })
})
bot.action(/d=(\S+)/, (ctx) => {
    ctx.answerCbQuery('')
    ctx.replyWithDocument({
        url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
        filename: ctx.match[1] + '.torrent'
    })
})

bot.action(/^magnet=([0-9]+)/i, ctx => {
    ctx.answerCbQuery('')
    nyaasi.getView(ctx.match[1])
        .then(response => {
            ctx.reply(`<code>${response.links.magnet}</code>`, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
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
                messageText += `🌐 <a href="https://nyaa.si${el.links.page}">Open on nyaa.si</a>\n\n`
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
                    url: `https://nyaa.si${el.links.page}`,
                    description: `${el.fileSize} · ⬆️ ${el.seeders} · ⬇️ ${el.leechers} · ☑️ ${el.nbDownload}`,
                    input_message_content: {
                        message_text: messageText,
                        disable_web_page_preview: false,
                        parse_mode: 'HTML'
                    },
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: buttons.torrent.download,
                                    url: `https://t.me/${bot.options.username}?start=${Buffer.from(`download:${el.links.page.replace('/view/', '')}`).toString('base64')}`
                                }, {
                                    text: '👁 Show full view',
                                    url: `https://t.me/${bot.options.username}?start=${Buffer.from(`view:${el.links.page.replace('/view/', '')}`).toString('base64')}`
                                }
                            ]
                        ]
                    }
                }
                return result
            })
            ctx.answerInlineQuery(results, {
                cache_time: 5
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
Number.prototype.normalizeZero = function () {
    return this.valueOf().toString().length > 1 ? this.valueOf() : `0${this.valueOf()}`
}

bot.catch((err) => util.log(err))
bot.startPolling()
util.log('Bot started')