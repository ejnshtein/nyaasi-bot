import { templates } from './templates.js'
import buttons from './buttons.js'
import buffer from './buffer.js'
import sleep from './sleep.js'
import argv from './argv.js'
import getArgv from './get-argv.js'
import getXtFromMagnet from './get-torrent-hash-from-magnet.js'
import loadSearchParams from './load-search-params.js'
import sendFile from './send-file.js'

export {
  templates,
  buttons,
  buffer,
  sleep,
  argv,
  getArgv,
  getXtFromMagnet,
  loadSearchParams,
  sendFile
}

// module.exports = {
//   templates: require('./templates'),
//   buttons: require('./buttons'),
//   buffer: require('./buffer'),
//   loadSearchParams: require('./load-search-params'),
//   storeHistory: require('./store-history'),
//   sendFile: require('./send-file'),
//   sleep: require('./sleep'),
//   request: require('./request'),
//   getXtFromMagnet: require('./get-torrent-hash-from-magnet'),
//   getArgv: require('./get-argv'),
//   argv: require('./argv')
// }
