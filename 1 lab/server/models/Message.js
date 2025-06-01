const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    chatId: String,
    senderId: String,
    senderName: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', MessageSchema);