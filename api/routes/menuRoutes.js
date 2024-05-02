const express = require("express");
const router = express.Router();

const menuContronler = require ('../controllers/menuControllers')


router.get("/", menuContronler.getAllMenuItems );


module.exports = router;
