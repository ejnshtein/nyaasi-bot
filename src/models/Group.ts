import { prop, modelOptions, getModelForClass } from '@typegoose/typegoose'
import { MangadexGroup, MangaGroup } from 'mangadex-api/typings/mangadex'
import { ModelOptions } from '.'

@modelOptions(ModelOptions)
export class Group {
  @prop({ unique: true })
  public group_id: number

  @prop({ default: 'preview' })
  public type?: string

  public group: MangadexGroup | MangaGroup

  @prop({ required: true, type: Number })
  public manga: number[]

  public updated_at?: number
  public created_at?: number
}

export const GroupModel = getModelForClass(Group)
