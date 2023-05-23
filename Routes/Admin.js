const express = require("express");
const router = express.Router();

const controllers = require("../Controllers/Admin");

router.post("/addProduct", controllers.postAddProduct);

router.post("/deleteProduct", controllers.postDeleteProduct);

router.post("/editProduct", controllers.postEditProduct);

router.get("/statistics", controllers.getStatistics);

module.exports = router;
