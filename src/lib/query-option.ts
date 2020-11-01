import { ExtraAnswerInlineQuery } from 'telegraf/typings/telegram-types'
import buffer from './buffer'

export interface QueryOptionsArguments {
  switchPmText?: string
  offset?: string
  cacheTime?: number
  isPersonal?: boolean
}

export function queryOptions({
  switchPmText = 'Search in bot',
  offset = '1',
  cacheTime = 5,
  isPersonal = false
}: QueryOptionsArguments = {}): ExtraAnswerInlineQuery {
  return Object.assign(
    {},
    switchPmText
      ? {
          switch_pm_text: switchPmText,
          switch_pm_parameter: `${buffer.encode('query')}`
        }
      : {},
    offset
      ? {
          next_offset: offset
        }
      : {},
    cacheTime
      ? {
          cache_time: cacheTime
        }
      : {},
    isPersonal
      ? {
          is_personal: isPersonal
        }
      : {}
  )
}
