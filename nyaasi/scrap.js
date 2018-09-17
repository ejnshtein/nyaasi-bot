const cheerio = require('cheerio')
const origin = 'https://nyaa.si'

function parseTorrentsList(html) {
    const table = cheerio.load(html)('body > div.container > div.table-responsive > table > tbody')
    const files = []
    table.children('tr').each((i, el) => {
        const element = cheerio.load(el)
        const torrent = {}
        torrent.category = {
            label: element('td:nth-child(1) a').attr('title'),
            code: element('td:nth-child(1) a').attr('href').match(/c=(\S+)/i)[1]
        }
        switch(el.attribs['class']){
            case 'danger':
                torrent.entry = '[Remake] '
                break
            case 'success':
                torrent.entry = '[Trusted] '
                break
            default:
                torrent.entry = ''
                break
        }
        torrent.name = element('td:nth-child(2) a:last-of-type').html()
        torrent.links = {
            page: element('td:nth-child(2) a:last-of-type').attr('href'),
            file: element('td:nth-child(3) a:first-of-type').attr('href'),
            magnet: element('td:nth-child(3) a:last-of-type').attr('href')
        }
        torrent.fileSize = element('td:nth-child(4)').html()
        torrent.timestamp = element('td:nth-child(5)').attr('data-timestamp')
        torrent.seeders = element('td:nth-child(6)').html()
        torrent.leechers = element('td:nth-child(7)').html()
        torrent.nbDownload = element('td:nth-child(8)').html()

        files.push(torrent)
    })
    
    return files
}

function parseViewPage(html) {
    const view = cheerio.load(html)
    const torrent = {}
    torrent.title = view('body > div.container > div:nth-child(1) > div.panel-heading > h3').text()
    torrent.fileSize = view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(4) > div:nth-child(2)').html()
    torrent.category = []
    view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(1) > div:nth-child(2)').children('a').each((i,el)=>{
        torrent.category.push({
            title: el.children[0].data,
            code: el.attribs['href'].match(/c=(\S+)/i)[1]
        })
    })
    switch(view('body > div.container > div:nth-child(1)').attr('class').match(/panel-(\S+)/i)[1]){
        case 'danger':
            torrent.entry = '[Remake] '
            break
        case 'success':
            torrent.entry = '[Trusted] '
            break
        default:
            torrent.entry = ''
            break
    }
    torrent.links = {
        torrent: origin + view('body > div.container > div:nth-child(1) > div:last-of-type > a:first-of-type').attr('href'),
        magnet: view('body > div.container > div:nth-child(1) > div:last-of-type > a:last-of-type').attr('href')
    }
    torrent.timestamp = view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(1) > div:nth-child(4)').attr('data-timestamp')
    torrent.submitter = {}
    if (view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').html()){
        torrent.submitter.name = view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').html(),
        torrent.submitter.link = origin + view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').attr('href')
    } else {
        torrent.submitter = 'Anonymous'
    }
    torrent.info = view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(3) > div:nth-child(2) a').attr('href') || 'No information'
    torrent.infoHash = view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(5) > div.col-md-5 > kbd').html()
    torrent.seeders = view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(2) > div:nth-child(4) > span').html()
    torrent.leechers = view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(3) > div:nth-child(4) > span').html()
    torrent.completed = view('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(4) > div:nth-child(4)').html()

    return torrent
}

module.exports = {
    parseTorrentsList,
    parseViewPage
}