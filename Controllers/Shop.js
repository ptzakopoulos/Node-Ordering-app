const Product = require("../Models/Product");
const User = require("../Models/User");
const Review = require("../Models/Reviews");

let totalProducts = 0;
//The variable role is just for the presentation untill login system will be included

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
            role: req.user.role,
            total: totalProducts,
          });
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

//This Controller is just for the presentation untill Log in system will be included
// exports.postChangeRole = (req, res, next) => {
//   role = req.body.role;
//   res.redirect("/");
// };

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
        role: req.user.role,
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
  req.user
    .populate("orders.productId")
    .then((user) => {
      res.render("user/orders", {
        pageTitle: "Your Orders",
        total: totalProducts,
        orders: user.orders,
        date: user.orderDate,
      });
    })
    .catch((err) => console.error(err));
};

exports.postOrders = (req, res, next) => {
  req.user
    .sendOrder()
    .then(() => {
      totalProducts = 0;
      res.redirect("/orders");
    })
    .catch((err) => console.error(err));
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

//Product Reviews - Details
exports.getReviews = (req, res, next) => {
  const productId = req.params.prodId;

  Product.findById(productId)
    .then((product) => {
      Review.find({ productId: productId })
        .populate("userId")
        .then((reviews) => {
          res.render("includes/productsReviews", {
            pageTitle: "Reviews",
            total: totalProducts,
            product: product,
            reviews: reviews,
          });
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

exports.postReview = (req, res, next) => {
  // const productId = req.body.productId;
  const reviewInfo = {
    productId: req.body.productId,
    userId: req.user.id,
    title: req.body.title.trim(),
    content: req.body.content.trim(),
    score: req.body.score,
  };

  const review = new Review({
    title: reviewInfo.title,
    content: reviewInfo.content,
    score: reviewInfo.score,
    productId: reviewInfo.productId,
    userId: reviewInfo.userId,
  });

  review
    .save()
    .then(() => {
      res.redirect(`/reviews${reviewInfo.productId}`);
    })
    .catch((err) => console.error(err));
};
