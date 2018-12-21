module.exports = {
  encode (text) {
    return Buffer.from(text).toString('base64')
  },
  decode (buffer) {
    return Buffer.from(buffer, 'base64').toString('ascii')
  }
}
