const Datastore = require('nedb')
const config = require('../../config.json')
const nedb = {}
config.database.nedb.collections.forEach(collection => {
  nedb[collection] = new Datastore({
    filename: `./database/nedb/collections/${collection}.db`
  })
})
for (const key in nedb) {
  nedb[key].loadDatabase(err => err ? console.log('Nedb err - ', err) : console.log(`${key} loaded!`))
}

module.exports = {
  collection (collectionName) {
    return {
      insert (document) {
        return new Promise((resolve, reject) => {
          nedb[collectionName].insert(document, (err, newdocument) => err ? reject(err) : resolve(newdocument))
        })
      },
      find (query = {}) {
        return new Promise((resolve, reject) => {
          nedb[collectionName].find(query, (err, docs) => err ? reject(err) : resolve(docs))
        })
      },
      findOne (query = {}) {
        return new Promise((resolve, reject) => {
          nedb[collectionName].findOne(query, (err, doc) => err ? reject(err) : resolve(doc))
        })
      },
      update (query, update, options = {}) {
        return new Promise((resolve, reject) => {
          nedb[collectionName].update(query, update, options, (err, num) => err ? reject(err) : resolve(num))
        })
      },

      /**
       * @param {Object} options
       * @param {Boolean} [options.multi=false] Allows the removal of multiple documents if set to true.
       *
       * Default is false
       */
      remove (query, options = {}) {
        return new Promise((resolve, reject) => {
          nedb[collectionName].remove(query, options, (err, num) => err ? reject(err) : resolve(num))
        })
      },
      count (query) {
        return new Promise((resolve, reject) => {
          nedb[collectionName].count(query, (err, count) => err ? reject(err) : resolve(count))
        })
      }
    }
  }
}