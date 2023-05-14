const express = require("express");
const router = express.Router();

const controllers = require("../Controllers/Shop");

router.get("/", controllers.getShop);

router.post("/changeRole", controllers.postChangeRole);

router.get("/login", controllers.getLogin);

router.post("/login", controllers.postLogin);

router.get("/register", controllers.getRegister);

router.post("/register", controllers.postRegister);

router.get("/cart", controllers.getCart);

router.post("/cart", controllers.postCart);

router.post("/cartDeleteItem", controllers.postDeleteItem);

router.post("/cartRemoveOne", controllers.postRemoveOne);

router.post("/cartAddOne", controllers.postAddOne);

router.get("/orders", controllers.getOrders);

module.exports = router;
