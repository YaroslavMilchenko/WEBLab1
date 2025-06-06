const mongoose = require('mongoose');
const ChatSchema = new mongoose.Schema({
    users: [String], // userId
    name: String
});
module.exports = mongoose.model('Chat', ChatSchema);