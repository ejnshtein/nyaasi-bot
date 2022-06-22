import { Context } from 'grammy'

export const onlyAdmin = async (ctx: Context): Promise<boolean> => {
  if (!ctx.from) {
    return false
  }

  const { status } = await ctx.getChatMember(ctx.from.id)

  return ['creator', 'administrator'].includes(status)
}
