const express = require("express");
const router = express.Router();

const controllers = require("../Controllers/Shop");

router.get("/", controllers.getShop);

router.get("/cart", controllers.getCart);

router.post("/cart", controllers.postCart);

router.post('/cartDeleteItem', controllers.postDeleteItem)

module.exports = router;
