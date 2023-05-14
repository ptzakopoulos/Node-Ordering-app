const Product = require("../Models/Product");
const User = require("../Models/User");

let totalProducts = 0;
//The variable role is just for the presentation untill login system will be included
let role = "guest";

exports.getShop = (req, res, next) => {
  let productCollection;
  Product.find()
    .then((products) => {
      productCollection = products;
    })
    .then(() => {
      User.findById("645368d0b74b4aaabb0f41bc")
        .then((user) => {
          const products = req.user.cart.items;
          totalProducts = 0;
          products.forEach((e) => {
            totalProducts += e.quantity;
          });

          res.render("index", {
            pageTitle: "Shop",
            path: "/shop",
            products: productCollection,
            user: user,
            role: role, //This will not be included after login system is set
            total: totalProducts,
          });
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

//This Controller is just for the presentation untill Log in system will be included
exports.postChangeRole = (req, res, next) => {
  role = req.body.role;
  res.redirect("/");
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      totalProducts = 0;

      products.forEach((e) => {
        totalProducts += e.quantity;
      });

      res.render("user/cart", {
        path: "/cart",
        pageTitle: "Your cart",
        products: products,
        user: user,
        role: role,
        total: totalProducts,
      });
    })
    .catch((err) => console.error(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/");
    });
};

exports.postRemoveOne = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .removeOneFromCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

exports.postAddOne = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .addOneToCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

exports.postDeleteItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart([productId])
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

exports.getOrders = (req, res, next) => {
  res.render("user/orders", {
    path: "/orders",
    pageTitle: "Your orders",
    // products: products,
    user: req.user,
    role: role,
    total: totalProducts,
  });
};

exports.getLogin = (req, res, next) => {
  res.render("user/login", {
    pageTitle: "Login",
    total: totalProducts,
  });
};

exports.postLogin = (req, res, next) => {
  res.redirect("/");
};

exports.getRegister = (req, res, next) => {
  res.render("user/register", {
    pageTitle: "Register",
    total: totalProducts,
  });
};

exports.postRegister = (req, res, next) => {
  res.redirect("/");
};
