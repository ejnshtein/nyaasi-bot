/* eslint-disable no-undef */
export const encodeBuffer = (
  text: string,
  encoding: BufferEncoding = 'hex'
) => {
  return Buffer.from(text).toString(encoding)
}
export const decodeBuffer = (
  string: string,
  encoding: BufferEncoding = 'hex'
) => {
  return Buffer.from(string, encoding).toString('ascii')
}
