const mongoose = require('mongoose');
const { Schema } = mongoose;

const menuSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    recipe:String,
    image:String,
    category:String,
    price:String

  });

  const Menu = mongoose.model('Menu', menuSchema);
  module.exports = Menu;   