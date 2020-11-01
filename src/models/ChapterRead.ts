import { modelOptions, getModelForClass } from '@typegoose/typegoose'
import { ModelOptions } from '.'

@modelOptions(ModelOptions)
export class ChapterRead {
  public user_id: number

  public chapter_id: number

  public manga_id: number

  public status: string
}

export const ChapterReadModel = getModelForClass(ChapterRead)
