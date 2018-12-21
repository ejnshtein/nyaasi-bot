const mongoose = require('mongoose')
const { Schema } = mongoose
const connection = mongoose.createConnection(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}`, {
  useNewUrlParser: true
})
connection.then(() => console.log('DB connected'))

connection.catch(err => {
  console.log('mongodb.connectionError', err)
})

connection.on('error', err => {
  console.log('mongodb.connectionError', err)
})
connection.on('disconnected', () => {
  console.log('mongodb.disconnected')
})

const collections = [
  {
    name: 'users',
    schema: new Schema({
      id: { type: Number },
      last_update: { type: Date, default: () => Date.now() }
    })
  }
]

module.exports = (collectionName) => {
  const collection = collections.find(el => el.name === collectionName)
  if (!collection) {
    throw new Error(`Collection not found: ${collectionName}`)
  }
  return connection.model(collectionName, collection.schema)
}
