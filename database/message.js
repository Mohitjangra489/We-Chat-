const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageschema = new Schema({
    message: String,
    sentby: String,
    groupid: String,
    time: String
});

const messagemodel = mongoose.model('message', messageschema);
module.exports = messagemodel;
