const axios = require('axios')
const scrap = require('./scrap')
const origin = 'https://nyaa.si'

module.exports = {
    getPage(url) {
        return new Promise((res, rej) => {
            axios(origin + url, {
                    responseType: 'document'
                })
                .then((response) => res(scrap.parseTorrentsList(response.data)))
                .catch(rej)
        })
    },
    getView(url) {
        return new Promise((res, rej) => {
            axios(origin + url, {
                    responseType: 'document'
                })
                .then((response) => res(scrap.parseViewPage(response.data)))
                .catch(rej)
        })
    }
}