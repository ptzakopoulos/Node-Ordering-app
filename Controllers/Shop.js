//Setting up Stripe
const stripe = require("stripe")(
  "sk_test_51NLTrKGzfhJ9pxzsgBP95lf4zluS7STVrSyTpFp8jkuEWsuThARZRgTOkSGS0rXu1CkU0wwNiE8BQp9TrhqiXEtO00Y7uxLFGT"
);

//Calling bcrypt
const bcrypt = require("bcryptjs");

//Calling schemas
const Product = require("../Models/Product");
const User = require("../Models/User");
const Review = require("../Models/Reviews");
const Orders = require("../Models/Orders");
//Extracting .end data
require("dotenv").config();
const emailDOmain = process.env.EMAIL_DOMAIN;
const emainApiKey = process.env.EMAIL_API_KEY;
//Setting up mailgun
const mailgun = require("mailgun-js")({
  apiKey: emainApiKey,
  domain: emailDOmain,
});

//Controller responsible for displaying the home page of the website
exports.getShop = (req, res, next) => {
  Product.find()
    .populate("reviews")
    .then((products) => {
      productCollection = products;
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

//Controller responsible for getting the user's cart
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

//Controller responsible for sending the new data from user's cart to the database
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

//Controller responsible for removing one item from the user's cart
exports.postRemoveOne = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .removeOneFromCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

//Controller responsible for adding one item to the user's cart
exports.postAddOne = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .addOneToCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

//Controller responsible for removing an item from the user's cart
exports.postDeleteItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart([productId])
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.error(err));
};

//Controller responsible for getting the user's order
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

//Controller responsible for sending the user's order and updating the data into the database
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

//Controller responsible for getting the login page
exports.getLogin = (req, res, next) => {
  res.render("user/login", {
    pageTitle: "Login",
    total: req.totalProducts,
    isLoggedIn: req.isLoggedIn,
    role: "guest",
  });
};

//Controller responsible for user's loggin
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  //Searching for the user
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      //Decrypting the user's password to compare with the database
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            //Setting up the sessions
            req.session.user = user;
            req.session.isLoggedIn = true;
            return res.redirect("/");
          }
          res.redirect("/login");
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

//Controller responsible for user's loggin out
exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    err && console.log(err);
    res.redirect("/");
  });
};

//Controller responsible for getting the register page
exports.getRegister = (req, res, next) => {
  res.render("user/register", {
    pageTitle: "Register",
    total: req.totalProducts,
    isLoggedIn: req.isLoggedIn,
    role: "guest",
  });
};

//Controller responsible for new user's registration
//Sending the new user's data to the database
exports.postRegister = (req, res, next) => {
  const member = "member";
  const email = req.body.email;
  const password = req.body.password;

  if (!email.trim() || !password.trim()) {
    res.redirect("/register");
  }

  User.findOne({ email: email })
    .then((user) => {
      //Checking if the user's email already exists
      if (user) {
        return res.redirect("/register");
      }
      //Encrypting user's password
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: member,
          });

          //Preparing email for the user's mail
          const emailData = {
            from: "Food Delivery App <tzakopoulosp@gmail.com>",
            to: email,
            subject: "Verification Code",
            html: '<h1> Hello </h1> <a href="http://localhost:3000/login">You are ready to login </a>',
          };

          //Email provider package should be changed.
          mailgun.messages().send(emailData, function (error, body) {
            console.log(body);
          });

          //Creating new User into the database
          newUser
            .save()
            .then(() => {
              res.redirect("/login");
            })
            .catch((err) => console.error(err));
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
          order?.user.userId._id.toString() === req.user.id.toString()
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

//Controller responsible for posting a user's review into a product
exports.postReview = (req, res, next) => {
  const reviewInfo = {
    productId: req.body.productId,
    userId: req.user.id,
    title: req.body.title.trim(),
    content: req.body.content.trim(),
    score: req.body.score,
  };

  //Creating new review into the database
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

//Controller responsible for user's checkotut
exports.getCheckout = (req, res, next) => {
  let products;
  let totalPrice = 0;

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      //Getting user's cart and calculating the total price
      products = user.cart.items;
      totalPrice = 0;
      products.forEach((product) => {
        totalPrice += product.quantity * product.productId.price;
      });

      //Connecting with stripe with user cart's details
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
