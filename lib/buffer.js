export default {
  encode (text, encoding = 'hex') {
    return Buffer.from(text).toString(encoding)
  },
  decode (string, encoding = 'hex') {
    return Buffer.from(string, encoding).toString('ascii')
  }
}
