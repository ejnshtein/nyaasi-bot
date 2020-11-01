import * as mongoose from 'mongoose'

const { createConnection } = mongoose

const { DATABASE_URL } = process.env

export const connection = createConnection(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})

connection.then(() => {
  console.log('DB connected')
})

connection.catch((e) => {
  console.log('DB error', e)
})
