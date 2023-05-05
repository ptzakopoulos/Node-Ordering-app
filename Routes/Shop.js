const express = require("express");
const router = express.Router();

const controllers = require("../Controllers/Shop");

router.get("/", controllers.getShop);

router.post('/changeRole', controllers.postChangeRole)

router.get("/cart", controllers.getCart);

router.post("/cart", controllers.postCart);

router.post('/cartDeleteItem', controllers.postDeleteItem)

router.get('/orders', controllers.getOrders)

module.exports = router;
