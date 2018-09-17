const axios = require('axios')
const scrap = require('./scrap')
const origin = 'https://nyaa.si'

module.exports = {
    getPage(url) {
        return new Promise((res, rej) => {
            axios.get(origin + url, {
                    responseType: 'document'
                })
                .then((response) => res(scrap.parseTorrentsList(response.data)))
                .catch(rej)
        })
    },
    getView(id) {
        return new Promise((res, rej) => {
            axios.get(`${origin}/view/${id}`, {
                    responseType: 'document'
                })
                .then((response) => res(scrap.parseViewPage(response.data)))
                .catch(rej)
        })
    }
}