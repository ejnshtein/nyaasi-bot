import { Context } from 'grammy'

export const onlyPrivate = (ctx: Context): boolean =>
  Boolean(ctx.chat && ctx.chat.type === 'private')
