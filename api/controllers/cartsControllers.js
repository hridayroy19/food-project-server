// fast all email same cart get 

const Carts = require("../models/carts");


const getcarbyEmail = async (req , res)=>{
    try {
        const email = req.body.email;
        const query = { email:email};
        const result = await Carts.find(query).exec()
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// post a cart when add to cart button clicked

const addToCart = async(req,res)=>{
    const { menuItemId,name,recipe,image,quantity,email} = req.body;
    try {
        const existingCartItem = await Carts.findOne({menuItemId});
        if(existingCartItem){
            return res.status(400).json({message:"product already exists in the cart"})
        }
        const cartItem = await Carts.create({
            menuItemId,name,recipe,image,quantity,email
        })
        res.status(201).json(cartItem);      
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}


module.exports = {
    getcarbyEmail,
    addToCart
}