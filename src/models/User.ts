import { prop, modelOptions, getModelForClass } from '@typegoose/typegoose'
import { ModelOptions } from '.'

@modelOptions(ModelOptions)
export class User {
  @prop({ unique: true })
  public id: number

  @prop({ required: false })
  public username: string

  @prop({ required: true })
  public first_name: string

  @prop({ required: false })
  public last_name: string

  @prop({ required: true, default: false })
  public private_mode: boolean

  @prop({ required: true, default: true })
  public inline_buttons: boolean
}

export const UserModel = getModelForClass(User)
