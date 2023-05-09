const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupschema = new Schema({
   member:Array,
   name:Array,
   groupname:String,
   lastmessage:Object
});

const groupmodel = mongoose.model('group', groupschema);
module.exports =groupmodel;
