const stripe = require("stripe")(
  "sk_test_51NLTrKGzfhJ9pxzsgBP95lf4zluS7STVrSyTpFp8jkuEWsuThARZRgTOkSGS0rXu1CkU0wwNiE8BQp9TrhqiXEtO00Y7uxLFGT"
);

const Product = require("../Models/Product");
const User = require("../Models/User");
const Review = require("../Models/Reviews");
const Orders = require("../Models/Orders");
require("dotenv").config();
const emailDOmain = process.env.EMAIL_DOMAIN;
const emainApiKey = process.env.EMAIL_API_KEY;
const mailgun = require("mailgun-js")({
  apiKey: emainApiKey,
  domain: emailDOmain,
});

const crypto = require("crypto");

exports.getShop = (req, res, next) => {
  // console.log(req.user);
  // console.log(req.isLoggedIn);
  Product.find()
    .populate("reviews")
    .then((products) => {
      productCollection = products;
      //Na to oloklirwsw | Na fainontai ta reviews sto home / shop
    })
    .then(() => {
      if (req.isLoggedIn) {
        res.render("index", {
          pageTitle: "Shop",
          path: "/shop",
          products: productCollection,
          user: req.user,
          role: req.user.role,
          total: req.totalProducts,
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

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
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

      res.render("user/cart", {
        path: "/cart",
        pageTitle: "Your cart",
        products: products,
        user: user,
        role: req.user.role,
        total: req.totalProducts,
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
  let userOrders;
  Orders.find()
    .populate("user.userId")
    .then((orders) => {
      userOrders = orders.filter((order) => {
        return order.user.userId._id.toString() === req.user._id.toString();
      });
      res.render("user/orders", {
        pageTitle: "Your Orders",
        total: req.totalProducts,
        orders: userOrders,
        isLoggedIn: req.isLoggedIn,
        role: req.user.role,
      });
    })
    .catch((err) => console.error(err));
};

exports.postOrders = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const cart = [...req.user.cart.items];
      const date = new Date().toLocaleString();

      const products = cart.map((product) => {
        return {
          quantity: product.quantity,
          product: { ...product.productId },
        };
      });

      const newOrder = new Orders({
        products: products,
        user: {
          name: req.user.name,
          userId: req.user,
        },
        date: date,
      });

      newOrder
        .save()
        .then(() => {
          req.user.clearCart();
        })
        .then(() => {
          res.redirect("/orders");
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

exports.getLogin = (req, res, next) => {
  res.render("user/login", {
    pageTitle: "Login",
    total: req.totalProducts,
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
        req.session.user = user;
        req.session.isLoggedIn = true;
      } else {
        return res.redirect("/login");
      }
      res.redirect("/");
    })
    .catch((err) => console.error(err));
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    err && console.log(err);
    res.redirect("/");
  });
};

exports.getRegister = (req, res, next) => {
  res.render("user/register", {
    pageTitle: "Register",
    total: req.totalProducts,
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

  let hasOrdered = false;
  let hasReviewd = false;

  Orders.find()
    .populate("user.userId")
    .then((orders) => {
      //Checking if the user has ordered this product
      orders.forEach((order) => {
        if (
          req.user &&
          order.user.userId._id.toString() === req.user.id.toString()
        ) {
          const validation = order.products.some((products) => {
            return products.product._id.toString() === productId.toString();
          });

          validation && (hasOrdered = true);
        }
      });

      Review.find()
        .populate("productId")
        .populate("userId")
        .then((reviews) => {
          //Taking the reviews of the current product
          const currentReviews = reviews.filter((review) => {
            return review.productId
              ? review.productId.id.toString() === productId.toString()
              : "";
          });

          //Checking if the user has posted review
          hasReviewd = currentReviews.some((review) => {
            return req.user
              ? review.userId._id.toString() === req.user.id.toString()
              : false;
          });

          Product.findById(productId)
            .then((product) => {
              res.render("includes/productsReviews", {
                pageTitle: "Reviews",
                total: req.totalProducts,
                product: product,
                reviews: currentReviews,
                isLoggedIn: req.isLoggedIn,
                hasPosted: hasReviewd,
                hasOrdered: hasOrdered,
                role: req.isLoggedIn ? req.user.role : "guest",
              });
            })
            .catch((err) => console.error(err));
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

exports.getCheckout = (req, res, next) => {
  let products;
  let totalPrice = 0;

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      totalPrice = 0;
      products.forEach((product) => {
        totalPrice += product.quantity * product.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: products.map((p) => {
          return {
            quantity: p.quantity,
            price_data: {
              currency: "eur",
              unit_amount: p.productId.price * 100,
              product_data: {
                name: p.productId.title,
                description: p.productId.description,
              },
            },
          };
        }),
        customer_email: req.user.email,
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("user/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        total: req.totalProducts,
        products: products,
        sessionId: session.id,
        totalSum: totalPrice,
        isLoggedIn: req.isLoggedIn,
        role: req.user.role,
      });
    })
    .catch((err) => console.error(err));
};
