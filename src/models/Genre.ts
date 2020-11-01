import { prop, modelOptions, getModelForClass } from '@typegoose/typegoose'
import { ModelOptions } from '.'

@modelOptions(ModelOptions)
export class Genre {
  @prop({ unique: true })
  public genre_id: number

  @prop({ required: true })
  public name: string
}

export const GenreModel = getModelForClass(Genre)
