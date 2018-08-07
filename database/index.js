const Collection = require('./nedb')
const chatCollection = new Collection('chats')
const userCollection = new Collection('users')
const adminCollection = new Collection('admins')
module.exports = {
    async logger(ctx, next) {
        const message = ctx.message || ctx.update.callback_query.message
        const local = {}
        const chat = await chatCollection.findOne({ 'id': message.chat.id })
        if (!chat) {
            const newChat = message.chat
            newChat.active = { date: new Date().toJSON() }
            local.chat = await chatCollection.insert(newChat)
        } else {
            local.chat = chat
            await chatCollection.update({ _id: chat._id }, { $set: { active: { date: new Date().toJSON() } } })
        }
        if (message.chat.type !== 'private') {
            const user = await userCollection.findOne({ 'id': message.from.id })
            if (!user) {
                const newUser = message.from
                newUser.active = { date: new Date().toJSON() }
                local.user = await userCollection.insert(newUser)
            } else {
                local.user = user
                await userCollection.update({ _id: user._id }, { $set: { active: { date: new Date().toJSON() } } })
            }
        }
        if (message.chat.type == 'private'){
            const admin = await adminCollection.findOne({ id: message.chat.id })
            if (admin){
                local.admin = admin
            }
        }
        ctx.local = local
        next(ctx)
    },
    chats: chatCollection,
    users: userCollection,
    admins: adminCollection
}