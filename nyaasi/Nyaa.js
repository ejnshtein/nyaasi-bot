import request from '@ejnshtein/smol-request'
import deepmerge from 'deepmerge'
import { parseSearch, parseTorrent } from './scrap.js'
import env from '../env.js'

export class Nyaa {
  static async search (query = '', params = {}) {
    const result = await request(
      `https://${env.HOST}/`,
      deepmerge.all(
        [
          {
            params: { q: query }
          },
          params
        ]
      )
    )

    return parseSearch(result.data)
  }

  static async getTorrent (id, params = {}) {
    const result = await request(
      `https://${env.HOST}/view/${id}`,
      params
    )

    return parseTorrent(result.data, id)
  }
}
