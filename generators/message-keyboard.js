const nyaasi = require('../nyaasi')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
module.exports = (key, params = {}) => {
    const opt = Object.assign({},{ page: '1', offset: 0 }, params)
    return new Promise((resolve, reject) => {
        if (opt.empty == 'true') {
            nyaasi.getPage(opt.page === '1' ? '/' : `?p=${opt.page}`)
                .then(response => {
                    opt.replaced = '/view/'
                    let keyboard = generateButtons(response, opt)
                    resolve(keyboard)
                })
                .catch(reject)
        } else {
            nyaasi.getPage(`?p=${opt.page}&q=${key}`)
                .then(response => {
                    opt.replaced = '/view/'
                    let keyboard = generateButtons(response, opt)
                    resolve(keyboard)
                })
                .catch(reject)
        }
    })
}
/**
 * @param {Object[]} buttons 
 * @param {Object} opt 
 * @param {Number} opt.offset
 * @param {String} opt.replaced
 * @param {String} opt.history
 */
function generateButtons(buttons, opt) {
    const keyboard = []
    let line = []
    let offsetted = buttons.slice(opt.offset, opt.offset + 10)
    if (offsetted.length > 0) {
        offsetted.forEach(el => {
            //console.log(el)
            //console.log(opt.history)
            if (line.length < 1) {
                line.push({
                    text: el.entry + entities.decode(el.name),
                    callback_data: opt.history ? `view:id=${el.links.page.replace(opt.replaced,'')};` + opt.history : `view:id=${el.links.page.replace(opt.replaced,'')};`
                })
            } else {
                keyboard.push(line)
                line = []
                line.push({
                    text: el.entry + entities.decode(el.name),
                    callback_data: opt.history ? `view:id=${el.links.page.replace(opt.replaced,'')};` + opt.history : `view:id=${el.links.page.replace(opt.replaced,'')};`
                })
            }
        })
        keyboard.push(line)
    }
    return keyboard
}