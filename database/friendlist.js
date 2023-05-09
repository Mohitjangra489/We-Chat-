const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendlistSchema = new Schema({
    name: String,
    username: String,
    password: String,
    groupId: Array
});

const friendlistModel = mongoose.model('users', friendlistSchema);
module.exports = friendlistModel;
