import { prop, modelOptions, getModelForClass } from '@typegoose/typegoose'
import { MangaData } from 'mangadex-api/typings/mangadex'
import { ModelOptions } from '@models/index'

export type DBMangaData = Omit<MangaData, 'genres'> & {
  genres: number[]
}

@modelOptions(ModelOptions)
export class Manga {
  @prop({ unique: true })
  public manga_id: number

  @prop({ required: true })
  public manga: DBMangaData

  public updated_at?: number
  public created_at?: number
}

export const MangaModel = getModelForClass(Manga)

export const MangaKeys = [
  'title',
  'alt_names',
  'artist',
  'author',
  'cover_url',
  'covers',
  'description',
  'genres',
  'hentai',
  'lang_flag',
  'lang_name',
  'last_chapter',
  'last_updated',
  'last_volume',
  'links',
  'rating',
  'related',
  'status',
  'views'
]
