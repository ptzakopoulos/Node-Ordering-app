const express = require("express");
const router = express.Router();
const auth = require("../Controllers/auth");

const controllers = require("../Controllers/Admin");

router.post("/addProduct", auth.isLoggedIn, controllers.postAddProduct);

router.post("/deleteProduct", auth.isLoggedIn, controllers.postDeleteProduct);

router.post("/editProduct", auth.isLoggedIn, controllers.postEditProduct);

router.get(
  "/statistics",
  auth.isLoggedIn,
  controllers.allUsers,
  controllers.allOrders,
  controllers.allProducts,
  controllers.getStatistics
);

module.exports = router;
