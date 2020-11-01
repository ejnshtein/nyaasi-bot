import cheerio from 'cheerio'
import bytes from 'bytes-iec'
import env from '../env.js'
const origin = `https://${env.HOST}`

export function parseSearch (html) {
  const page = cheerio.load(html)
  const table = page('body > div.container > div.table-responsive > table > tbody')
  const files = table.children('tr').map((i, el) => {
    const select = cheerio.load(el)
    return {
      id: Number.parseInt(
        select('td:nth-child(2) > a:last-of-type')
          .attr('href')
          .split('/').pop()
      ),
      category: {
        label: select('td:nth-child(1) > a').attr('title'),
        code: new URL(
          select('td:nth-child(1) > a').attr('href'), `https://${env.HOST}`
        ).searchParams.get('c')
      },
      name: select('td:nth-child(2) > a:last-of-type').text(),
      title: select('td:nth-child(2) > a:last-of-type').text().trim(),
      links: {
        page: select('td:nth-child(2) > a:last-of-type').attr('href'),
        file: select('td:nth-child(3) > a').attr('href'),
        magnet: select('td:nth-child(3) > a:last-of-type').attr('href')
      },
      fileSize: select('td:nth-child(4)').text(),
      fileSizeBytes: bytes.parse(select('td:nth-child(4)').text()),
      timestamp: Number.parseInt(
        select('td:nth-child(5)')
          .attr('data-timestamp')
      ),
      seeders: select('td:nth-child(6)').text(),
      leechers: select('td:nth-child(7)').text(),
      completed: select('td:nth-child(8)').text(),
      entry: getEntry(el.attribs['class'])
    }
  }).get()
  const current_page = Number.parseInt(
    page('body > div.container > div.center > nav > ul').html()
      ? new URL(page('body > div.container > div.center > nav > ul > li.active > a').attr('href'), origin).searchParams.get('p')
      : page('body > div.container > div.center > ul > li.active').text()
  ) || 1
  const last_page = Number.parseInt(
    page('body > div.container > div.center > nav > ul').html()
      ? new URL(page('body > div.container > div.center > nav > ul > li:last-of-type').prev().children('a').attr('href'), origin).searchParams.get('p')
      : new URL(page('body > div.container > div.center > ul > li.next').prev().children('a').attr('href'), origin).searchParams.get('p')
  ) || 1
  return {
    current_page,
    last_page,
    files
  }
}

export function parseTorrent (html, id) {
  const select = cheerio.load(html)

  select('.servers-cost-money1').remove()

  const entryMatch = select('body > div.container > div:first-of-type')
    .attr('class')

  return {
    id: typeof id === 'string' ? Number.parseInt(id) : id,
    title: select('body > div.container > div.panel:first-of-type > div.panel-heading > h3').text().trim(),
    fileSize: select('body > div.container > div.panel > div.panel-body > div:nth-child(4) > div:nth-child(2)').html(),
    fileSizeBytes: bytes.parse(select('body > div.container > div.panel > div.panel-body > div:nth-child(4) > div:nth-child(2)').html()),
    category: select('body > div.container > div.panel > div.panel-body > div:nth-child(1) > div:nth-child(2)')
      .children('a')
      .map((i, el) => (
        {
          title: el.children[0].data,
          code: el.attribs['href'].match(/c=(\S+)/i)[1]
        }
      )
      ).get(),
    entry: getEntry(
      entryMatch.match(/panel-(\S+)$/i)[1]
    ),
    links: {
      torrent: origin + select('body > div.container > div.panel > div:last-of-type > a:first-of-type').attr('href'),
      magnet: select('body > div.container > div.panel > div:last-of-type > a:last-of-type').attr('href')
    },
    timestamp: select('body > div.container > div.panel > div.panel-body > div:nth-child(1) > div:nth-child(4)').attr('data-timestamp'),
    submitter: select('body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').html()
      ? {
        name: select('body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').html(),
        link: origin + select('body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a').attr('href')
      }
      : 'Anonymous',
    description: select('#torrent-description').html(),
    info: select('body > div.container > div.panel > div.panel-body > div:nth-child(3) > div:nth-child(2) a').attr('href') || 'No information',
    infoHash: select('body > div.container > div.panel > div.panel-body > div:nth-child(5) > div.col-md-5 > kbd').html(),
    seeders: select('body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(4) > span').html(),
    leechers: select('body > div.container > div.panel > div.panel-body > div:nth-child(3) > div:nth-child(4) > span').html(),
    completed: select('body > div.container > div.panel > div.panel-body > div:nth-child(4) > div:nth-child(4)').html(),
    // files: parseTorrentFiles(select('body > div.container > div:nth-child(3) > div.torrent-file-list.panel-body').html())
    // comments_count: Number.parseInt(
    //   select('#comments > .panel-heading > a > h3')
    //     .text()
    //     .match(/Comments - ([0-9]+)/i)[1]
    // ),
    // comments: select('#collapse-comments > div.panel')
    //   .map((i, el) => {
    //     const commentSelector = cheerio.load(el)
    //     return {
    //       id: Number.parseInt(
    //         commentSelector('.panel-body > .comment > .comment-body > .comment.content')
    //           .attr('id')
    //           .match(/torrent-comment([0-9]+)/i)[1]
    //       ),
    //       from: {
    //         username: commentSelector('.panel-body > .col-md-2 > p > a').text(),
    //         avatar: commentSelector('.panel-body > .col-md-2 > img').attr('src')
    //       },
    //       timestamp: commentSelector('.panel-body > .comment > .comment-details > a > small').attr('data-timestamp'),
    //       publish_date: commentSelector('.panel-body > .comment > .comment-details > a > small').attr('title'),
    //       text: commentSelector('.panel-body > .comment > .comment-body > .comment.content > p').html()
    //     }
    //   })
    //   .get()
  }
}

function getEntry (entry) {
  switch (entry) {
    case 'danger':
      return '[Remake]'
    case 'success':
      return '[Trusted]'
    default:
      return ''
  }
}

function parseTorrentFiles (html) {
  const select = cheerio.load(html)

  return select('ul')
    .find('li')
    .not(function () {
      return cheerio(this).children('a').attr('class') === 'folder'
    })
    .map((i, el) => {
      const element = cheerio(el)
      const size = element.children('span.file-size').text().replace(/\(|\)/ig, '')
      return {
        type: 'file',
        title: element.text().replace(` (${size})`, ''),
        size: size,
        sizeBytes: bytes.parse(size.replace('Bytes', ''))
      }
    }).get()
}
