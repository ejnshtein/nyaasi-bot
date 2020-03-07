export default {
  encode (text, encoding = 'hex') {
    return Buffer.from(text).toString(encoding)
  },
  decode (buffer, encoding = 'hex') {
    return Buffer.from(buffer, encoding).toString('ascii')
  }
}
