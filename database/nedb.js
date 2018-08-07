const Datastore = require('nedb')
const nedb = {}
nedb.users = new Datastore({
    filename: './database/db/users.db',
    autoload: true
})
nedb.chats = new Datastore({
    filename: './database/db/chats.db',
    autoload: true
})
nedb.admins = new Datastore({
    filename: './database/db/admins.db',
    autoload: true
})

module.exports = class {
    constructor(name) {
        this.name = name
    }
    insert(data) {
        return new Promise((res, rej) => {
            nedb[this.name].insert(data, (err, newdata) => err ? rej(err) : res(newdata))
        })
    }
    find(query) {
        return new Promise((res, rej) => {
            nedb[this.name].find(query, (err, docs) => err ? rej(err) : res(docs))
        })
    }
    findOne(query) {
        return new Promise((res, rej) => {
            nedb[this.name].findOne(query, (err, doc) => err ? rej(err) : res(doc))
        })
    }
    update(query, update, options = {}) {
        return new Promise((res, rej) => {
            const params = {}
            for (const key in options) {
                params[key] = options[key]
            }
            nedb[this.name].update(query, update, params, (err, num) => err ? rej(err) : res(num))
        })
    }
    /**
     * @param {Object} options
     * @param {Boolean} [options.multi=false] Allows the removal of multiple documents if set to true. 
     * 
     * Default is false
     */
    remove(query, options = {}) {
        return new Promise((res, rej) => {
            const params = {}
            for (const key in options) {
                params[key] = options[key]
            }
            nedb[this.name].remove(query, params, (err, num) => err ? rej(err) : res(num))
        })
    }
    count(query) {
        return new Promise((res, rej) => {
            nedb[this.name].count(query, (err, count) => err ? rej(err) : res(count))
        })
    }

}