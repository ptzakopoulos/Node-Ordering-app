const Product = require("../Models/Product");
const User = require("../Models/User");
const Review = require("../Models/Reviews");

let totalProducts = 0;
let isLoggedIn = false;
let loggedUser;
//The variable role is just for the presentation untill login system will be included

exports.getShop = (req, res, next) => {
  let productCollection;
  console.log(isLoggedIn);
  Product.find()
    .then((products) => {
      productCollection = products;
    })
    .then(() => {
      if (isLoggedIn) {
        const products = loggedUser.cart.items;
        totalProducts = 0;
        products.forEach((e) => {
          totalProducts += e.quantity;
        });

        res.render("index", {
          pageTitle: "Shop",
          path: "/shop",
          products: productCollection,
          user: loggedUser,
          role: loggedUser.role,
          total: totalProducts,
          isLoggedIn: isLoggedIn,
        });
      } else {
        res.render("index", {
          pageTitle: "Shop",
          path: "/shop",
          role: "guest",
          products: productCollection,
          isLoggedIn: isLoggedIn,
        });
      }
    })
    .catch((err) => console.error(err));
};

//This Controller is just for the presentation untill Log in system will be included
// exports.postChangeRole = (req, res, next) => {
//   role = req.body.role;
//   res.redirect("/");
// };

exports.getCart = (req, res, next) => {
  loggedUser
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
        role: loggedUser.role,
        total: totalProducts,
        isLoggedIn: isLoggedIn,
      });
    })
    .catch((err) => console.error(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      return loggedUser.addToCart(product);
    })
    .then(() => {
      res.redirect("/");
    });
};

exports.postRemoveOne = (req, res, next) => {
  const productId = req.body.productId;

  loggedUser
    .removeOneFromCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

exports.postAddOne = (req, res, next) => {
  const productId = req.body.productId;

  loggedUser
    .addOneToCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

exports.postDeleteItem = (req, res, next) => {
  const productId = req.body.productId;
  loggedUser
    .removeFromCart([productId])
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

exports.getOrders = (req, res, next) => {
  loggedUser
    .populate("orders.productId")
    .then((user) => {
      res.render("user/orders", {
        pageTitle: "Your Orders",
        total: totalProducts,
        orders: user.orders,
        date: user.orderDate,
        isLoggedIn: isLoggedIn,
      });
    })
    .catch((err) => console.error(err));
};

exports.postOrders = (req, res, next) => {
  loggedUser
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
    isLoggedIn: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (user && user.password === password) {
        loggedUser = user;
        isLoggedIn = true;
      } else {
        res.redirect("/login");
      }
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.error(err));
};

exports.getRegister = (req, res, next) => {
  res.render("user/register", {
    pageTitle: "Register",
    total: totalProducts,
    isLoggedIn: isLoggedIn,
  });
};

exports.postRegister = (req, res, next) => {
  const member = "member";
  const email = req.body.email;

  User.findOne({ email: email })
    .then((user) => {
      console.log(user);
      if (user) {
        return res.redirect("/register");
      }

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: member,
      });

      newUser
        .save()
        .then(() => {
          res.redirect("/login");
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
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
            isLoggedIn: isLoggedIn,
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
    userId: loggedUser.id,
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
