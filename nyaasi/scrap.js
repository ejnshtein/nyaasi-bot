const cheerio = require('cheerio')
const origin = 'https://nyaa.si'

function parseSearch (html) {
  const table = cheerio.load(html)('body > div.container > div.table-responsive > table > tbody')
  const files = table.children('tr').map((i, el) => {
    const select = cheerio.load(el)
    return {
      id: Number.parseInt(
        select('td:nth-child(2) a:last-of-type')
          .attr('href')
          .replace('/view/', '')
      ),
      category: {
        label: select('td:nth-child(1) a').attr('title'),
        code: select('td:nth-child(1) a')
          .attr('href')
          .match(/c=(\S+)/i)[1]
      },
      name: select('td:nth-child(2) a:last-of-type').html(),
      title: select('td:nth-child(2) a:last-of-type').html(),
      links: {
        page: select('td:nth-child(2) a:last-of-type').attr('href'),
        file: select('td:nth-child(3) a:first-of-type').attr('href'),
        magnet: select('td:nth-child(3) a:last-of-type').attr('href')
      },
      fileSize: select('td:nth-child(4)').html(),
      timestamp: Number.parseInt(
        select('td:nth-child(5)')
          .attr('data-timestamp')
      ),
      seeders: select('td:nth-child(6)').html(),
      leechers: select('td:nth-child(7)').html(),
      completed: select('td:nth-child(8)').html(),
      entry: getEntry(el.attribs['class'])
    }
  }).get()

  return files
}

function parseTorrent (html) {
  const select = cheerio.load(html)
  return {
    title: select('body > div.container > div:nth-child(1) > div.panel-heading > h3').text(),
    fileSize: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(4) > div:nth-child(2)').html(),
    category: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(1) > div:nth-child(2)')
      .children('a')
      .map((i, el) => (
        {
          title: el.children[0].data,
          code: el.attribs['href'].match(/c=(\S+)/i)[1]
        }
      )
      ).get(),
    entry: getEntry(
      select('body > div.container > div:nth-child(1)')
        .attr('class')
        .match(/panel-(\S+)/i)[1]
    ),
    links: {
      torrent: origin + select('body > div.container > div:nth-child(1) > div:last-of-type > a:first-of-type').attr('href'),
      magnet: select('body > div.container > div:nth-child(1) > div:last-of-type > a:last-of-type').attr('href')
    },
    timestamp: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(1) > div:nth-child(4)').attr('data-timestamp'),
    submitter: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').html()
      ? {
        name: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').html(),
        link: origin + select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').attr('href')
      }
      : 'Anonymous',
    info: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(3) > div:nth-child(2) a').attr('href') || 'No information',
    infoHash: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(5) > div.col-md-5 > kbd').html(),
    seeders: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(2) > div:nth-child(4) > span').html(),
    leechers: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(3) > div:nth-child(4) > span').html(),
    completed: select('body > div.container > div:nth-child(1) > div.panel-body > div:nth-child(4) > div:nth-child(4)').html()
  }
}

module.exports = {
  parseSearch,
  parseTorrent
}

function getEntry (entry) {
  switch (entry) {
    case 'danger':
      return '[Remake] '
    case 'success':
      return '[Trusted] '
    default:
      return ''
  }
}
