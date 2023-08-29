require("colors");
//Importing dotenv
require("dotenv").config();
const dataBaseUrl = process.env.DATABASE;
//App requirements
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");

//Session
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const store = new MongoDbStore({
  uri: dataBaseUrl,
  collection: "session",
});

const app = express();

const PORT = 3000;

//Setting up Template engine
app.set("view engine", "ejs");
app.set("views", "views");

//Setting up the body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Setting up the default Path
app.use(express.static(path.join(__dirname, "public")));

//Calling the routes | And 404 Controller
const errorController = require("./Controllers/error404");
//Routes
const shopRoutes = require("./Routes/Shop");
const adminRoutes = require("./Routes/Admin");

const middleWare = require("./Controllers/Shop");
const User = require("./Models/User");

//Session Middleware
app.use(
  session({
    secret: "My secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      let totalProducts = 0;
      req.user = user;
      req.isLoggedIn = true;

      user.cart.items.forEach((item) => {
        totalProducts += item.quantity;
      });

      req.totalProducts = totalProducts;

      next();
    })
    .catch((err) => console.error(err));
});

//Listening to routes
app.use(shopRoutes);
app.use(adminRoutes);
app.use(helmet());

//Calling 404 Controllet in case of error 404
app.use(errorController.get404);

//Connecting Mongoose to MongoDB Database | Creating a dummy user if not exists
mongoose
  .connect(dataBaseUrl)
  .then((result) => {
    app.listen(PORT);
    console.log(`Server is listening to : `.blue, PORT);
  })
  .catch((err) => console.log(err));
