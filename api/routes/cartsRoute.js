const express = require("express");
const Cart = require('../models/carts')
const router = express.Router();



const cartsControler = require("../controllers/cartsControllers");
router.get('/', cartsControler.getcarbyEmail)
router.post('/', cartsControler.addToCart)


module.exports = router;