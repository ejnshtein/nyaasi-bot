import { connection } from '@src/database'
import { Severity } from '@typegoose/typegoose'
import { IModelOptions } from '@typegoose/typegoose/lib/types'

export const ModelOptions: IModelOptions = {
  existingConnection: connection,
  schemaOptions: {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: 'created_at'
    },
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  },
  options: {
    allowMixed: Severity.ALLOW
  }
}
