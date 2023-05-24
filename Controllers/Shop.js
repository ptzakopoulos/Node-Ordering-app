const Product = require("../Models/Product");
const User = require("../Models/User");
const Review = require("../Models/Reviews");
require("dotenv").config();
const emailDOmain = process.env.EMAIL_DOMAIN;
const emainApiKey = process.env.EMAIL_API_KEY;
const mailgun = require("mailgun-js")({
  apiKey: emainApiKey,
  domain: emailDOmain,
});

const crypto = require("crypto");

let totalProducts = 0;
let isLoggedIn = false;
let loggedUser;
//The variable role is just for the presentation untill login system will be included

exports.getShop = (req, res, next) => {
  let productCollection;
  Product.find()
    .populate("reviews")
    .then((products) => {
      productCollection = products;
      //Na to oloklirwsw | Na fainontai ta reviews sto home / shop
    })
    .then(() => {
      if (req.isLoggedIn) {
        const products = req.user.cart.items;
        totalProducts = 0;
        products.forEach((e) => {
          totalProducts += e.quantity;
        });

        res.render("index", {
          pageTitle: "Shop",
          path: "/shop",
          products: productCollection,
          user: req.user,
          role: req.user.role,
          total: totalProducts,
          isLoggedIn: req.isLoggedIn,
        });
      } else {
        res.render("index", {
          pageTitle: "Shop",
          path: "/shop",
          role: "guest",
          products: productCollection,
          isLoggedIn: req.isLoggedIn,
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
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      // const products = [...user.cart.items];
      const products = user.cart.items;
      totalProducts = 0;
      //Checking if any of the cart's products has been removed from the list
      const index = products.findIndex((product) => {
        return product.productId === null;
      });

      if (index >= 0) {
        //Updating products before sending them to Ejs
        products.splice(index, 1);
        //Updating User's Cart in Database
        user.removedItem(index);
      }

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
        isLoggedIn: req.isLoggedIn,
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
  console.log(req.params.token);
  req.user
    .populate("orders.productId")
    .then((user) => {
      res.render("user/orders", {
        pageTitle: "Your Orders",
        total: totalProducts,
        orders: user.orders,
        date: user.orderDate,
        isLoggedIn: req.isLoggedIn,
        role: req.user.role,
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
    isLoggedIn: req.isLoggedIn,
    role: "guest",
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
        return res.redirect("/login");
      }
      res.redirect("/");
    })
    .catch((err) => console.error(err));
};

exports.logout = (req, res, next) => {
  loggedUser = undefined;
  isLoggedIn = false;
  res.redirect("/");
};

exports.getRegister = (req, res, next) => {
  res.render("user/register", {
    pageTitle: "Register",
    total: totalProducts,
    isLoggedIn: req.isLoggedIn,
    role: "guest",
  });
};

exports.postRegister = (req, res, next) => {
  const member = "member";
  const email = req.body.email;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        return res.redirect("/register");
      }

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password, //This should be encrypted
        role: member,
      });

      const emailData = {
        from: "Food Delivery App <tzakopoulosp@gmail.com>",
        to: email,
        subject: "Verification Code",
        html: '<h1> Hello </h1> <a href="http://localhost:3000/">This is the verification code </a>',
      };

      //Email provider package should be changed.
      mailgun.messages().send(emailData, function (error, body) {
        console.log(body);
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
          let hasPosted;
          let hasOrdered;
          if (req.isLoggedIn) {
            hasPosted = reviews.some((e) => {
              return e.userId.id === req.user.id;
            });

            req.user
              .populate("orders.productId")
              .then(() => {
                console.log(req.user.id);
                console.log(req.user._id);
                hasOrdered = req.user.orders.some((order) => {
                  return order.some((product) => {
                    return product.productId.id === productId;
                  });
                });
              })
              .then(() => {
                Render(totalProducts, product, reviews, hasPosted, hasOrdered);
              })
              .catch((err) => console.error(err));
          } else {
            Render(totalProducts, product, reviews);
          }
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));

  const Render = (totalProducts, product, reviews, hasPosted, hasOrdered) => {
    res.render("includes/productsReviews", {
      pageTitle: "Reviews",
      total: totalProducts,
      product: product,
      reviews: reviews,
      isLoggedIn: req.isLoggedIn,
      hasPosted: hasPosted,
      hasOrdered: hasOrdered,
      role: req.isLoggedIn ? req.user.role : "guest",
    });
  };
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

exports.validation = (req, res, next) => {
  req.user = loggedUser;
  req.isLoggedIn = isLoggedIn;
  req.totalProducts = totalProducts;
  next();
};
