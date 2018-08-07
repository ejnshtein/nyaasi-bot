const axios = require('axios'),
    util = require('util'),
    scrap = require('./scrap'),
    origin = 'https://nyaa.si'
function getPage(url){
    return new Promise((res,rej)=>{
        axios(origin + url,{
            responseType:'document'
        })
            .then((response)=>{
                res(scrap.parseTorrentsList(response.data))
            })
            .catch(rej)
    })
}
function getView(url){
    return new Promise((res,rej)=>{
        axios(origin + url,{
            responseType:'document'
        })
            .then((response)=>{
                res(scrap.parseViewPage(response.data))
            })
            .catch(rej)
    })
}
//getPage()
module.exports = {
    getPage,
    getView
}