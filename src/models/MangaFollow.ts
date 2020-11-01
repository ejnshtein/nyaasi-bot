import { modelOptions, getModelForClass } from '@typegoose/typegoose'
import { ModelOptions } from '.'

@modelOptions(ModelOptions)
export class MangaFollow {
  public user_id: number

  public manga_id: number

  public status: string
}

export const MangaFollowModel = getModelForClass(MangaFollow)
