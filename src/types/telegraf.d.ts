import * as tt from 'telegraf/typings/telegram-types'
import { TelegrafContext as TC } from 'telegraf/typings/context'
import { Composer as C, Middleware } from 'telegraf/typings/index'
import { User } from '../models/User'
import I18n from 'telegraf-i18n'
import { InlineQuery } from 'telegraf/typings/telegram-types'
export * from 'telegraf'

type HearsTriggers<TContext> = string[] | string | RegExp | RegExp[] | ((value: string, ctx: TContext) => RegExpExecArray | null)
declare module 'telegraf' {
  export interface TelegrafContext extends TC {
    state: {
      user: User
    }
    replyWithAnimation(
      animation: tt.InputFile,
      extra?: ExtraAnimation
    ): Promise<tt.MessageAnimation>
    startPayload?: string
    i18n: I18n
  }

  export interface ExtraAnimation extends tt.ExtraReplyMessage {
    duration?: number
    width?: number
    height?: number
    thumb?: tt.InputFile
    caption?: string
  }

  export class Composer<TContext extends TelegrafContext> extends C {
    url (
      triggers: HearsTriggers<TContext>,
      ...middlewares: ReadonlyArray<Middleware<TContext>>
    ): this

    inlineQuery(
      triggers: HearsTriggers<TContext>,
      ...middleware: ReadonlyArray<Middleware<TContext>>
    ): this
  }
}
