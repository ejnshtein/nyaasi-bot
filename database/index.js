const Collection = require('./nedb'),
    util = require('util'),
    chatCollection = new Collection('chats'),
    userCollection = new Collection('users'),
    adminCollection = new Collection('admins')
module.exports = {
    async logger(ctx, next) {
        let message = ctx.message || ctx.update.callback_query.message
        let local = {}
        let chat = await chatCollection.findOne({ "id": message.chat.id })
        if (!chat) {
            let newChat = { ...message.chat }
            newChat.active = { date: new Date().toJSON() }
            local.chat = await chatCollection.insert(newChat)
        } else {
            local.chat = chat
            await chatCollection.update({ _id: chat._id }, { $set: { active: { date: new Date().toJSON() } } })
        }
        if (message.chat.type !== 'private') {
            let user = await userCollection.findOne({ 'id': message.from.id })
            if (!user) {
                let newUser = { ...message.from }
                newUser.active = { date: new Date().toJSON() }
                local.user = await userCollection.insert(newUser)
            } else {
                local.user = user
                await userCollection.update({ _id: user._id }, { $set: { active: { date: new Date().toJSON() } } })
            }
        }
        if (message.chat.type == 'private'){
            let admin = await adminCollection.findOne({ id: message.chat.id })
            if (admin){
                local.admin = admin
            }
        }
        if (message.chat.id == 192399079){
            let mainAdmin = await adminCollection.findOne({ id: message.chat.id })
            if (!mainAdmin){
                let newadmin =await adminCollection.insert({ id: 192399079 })
                if (!local.admin){
                    local.admin = newadmin
                }
            }
        }
        ctx.local = local
        next(ctx)
    },
    chats: chatCollection,
    users: userCollection,
    admins: adminCollection
}