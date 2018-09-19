const nyaasi = require('../nyaasi')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

Number.prototype.normalizeZero = function () {
    return this.valueOf().toString().length > 1 ? this.valueOf() : `0${this.valueOf()}`
}

module.exports = (query, params = {}) => {
    const opt = Object.assign({}, {
        page: '1',
        offset: 0
    }, params)
    return nyaasi.getPage(query ? `?p=${opt.page}&q=${query}` : opt.page === '1' ? '/' : `?p=${opt.page}`)
        .then(response => {
            const keyboard = []
            let line = []
            const view = '/view/'
            const offsetted = response.slice(opt.offset, opt.offset + 10)
            if (offsetted.length > 0) {
                offsetted.forEach(el => {
                    const text = el.entry + entities.decode(el.name)
                    const callback_data = `v=${el.links.page.replace(view, '')}:${opt.history}`
                    if (line.length < 1) {
                        line.push({ // ^v=(\S+):p=(\S+):o=(\S+)
                            text: text,
                            callback_data: callback_data
                        })
                    } else {
                        keyboard.push(line)
                        line = []
                        line.push({
                            text: text,
                            callback_data: callback_data
                        })
                    }
                })
                keyboard.push(line)
            }
            return keyboard
        })
}
module.exports.inlineMode = (query, params = {}) => {
    const opt = Object.assign({}, {
        page: '1',
        offset: 0
    }, params)
    return new Promise((resolve, reject) => {
        nyaasi.getPage(query ? `?p=${opt.page}&q=${query}` : opt.page === '1' ? '/' : `?p=${opt.page}`)
            .then(result => {
                resolve(result.slice(opt.offset, opt.offset + 50))
            })
            .catch(reject)
        
    })
}