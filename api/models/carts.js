// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const cartSchema = new Schema ({

//     menuItemId:String,
//     name:{
//         type:String,
//         required:true
//     },
//     recipe:String,
//     image:String,
//     price:Number,
//     quantity:Number,
//     email:{
//         type:String,
//         required:true
//     }

//   });

// const Carts = mongoose.model('Cart',cartSchema);
// module.exports = Carts;


const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
    menuItemId:String,
        name:{
            type:String,
            required:true
        },
        recipe:String,
        image:String,
        price:Number,
        quantity:Number,
        email:{
            type:String,
            required:true,        
        }
    });

  const Carts = mongoose.model('cartsItem',cartItemSchema);
  module.exports = Carts;   