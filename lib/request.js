// docs: https://nodejs.org/dist/latest-v10.x/docs/api/https.html#https_https_request_url_options_callback
// all methods working, but post only with x-form-urlencoded. return promise with resolved object on line 64.
// extra options parameters: json=[bool], params=[object]
const querystring = require('querystring')
const https = require('https')
const http = require('http')

const cleanObject = (object, filterKeys) => Object
  .keys(object)
  .reduce((acc, key) => {
    if (filterKeys.includes(key)) {
      return {
        ...acc,
        [key]: object[key]
      }
    }
    return acc
  }, {})

const mergeUrl = (url, searchParams) => {
  const urlInst = new URL(url)
  const params = new URLSearchParams(searchParams)
  params.forEach((val, key) => {
    urlInst.searchParams.set(key, val)
  })
  return urlInst.toString()
}

/**
 *
 * @param {string} url Url for request
 * @param {object} options Request options
 * @param {object} [formData] Request formdata
 */
function request (url, options, formData) {
  if (formData) {
    var data = querystring.stringify(formData)
  }
  if (options.params && typeof options.params === 'object') {
    url = mergeUrl(url, options.params)
  }
  if (options.header && data) {
    options.headers = Object.assign(options.headers, { 'Content-Length': Buffer.byteLength(data) })
  }
  return new Promise((resolve, reject) => {
    function resHanlder (res) {
      res.setEncoding('utf8')
      let data = ''

      const onData = chunk => {
        data += chunk
      }
      const onError = err => {
        res.removeListener('error', onError)
        res.removeListener('data', onData)
        reject(err)
      }
      const onClose = () => {
        res.removeListener('error', onError)
        res.removeListener('data', onData)
        res.removeListener('close', onClose)
        if (options.json) {
          try {
            data = JSON.parse(data)
          } catch (e) {
            return reject(new Error(`JSON parsing error: ${e.message}: ${data}`))
          }
        }
        resolve({
          data,
          headers: res.headers,
          status: res.statusCode,
          statusText: res.statusMessage
        })
        data = null
      }
      res.on('data', onData)
      res.on('error', onError)
      res.on('close', onClose)
    }
    const req = url.startsWith('https') ? https.request(
      url,
      cleanObject(options, ['protocol', 'host', 'hostname', 'family', 'port', 'localAddres', 'socketPath', 'method', 'path', 'auth', 'agent', 'createConnection', 'timeout']),
      resHanlder
    ) : http.request(
      url,
      cleanObject(options, ['protocol', 'host', 'hostname', 'family', 'port', 'localAddres', 'socketPath', 'method', 'path', 'auth', 'agent', 'createConnection', 'timeout']),
      resHanlder
    )
    if (options.headers) {
      Object.keys(options.headers).forEach(header => {
        req.setHeader(header, options.headers[header])
      })
    }
    const onError = err => {
      req.removeListener('error', onError)
      reject(err)
    }
    req.on('error', onError)
    if (data) {
      req.write(data)
    }
    req.end()
  })
}
module.exports = request
