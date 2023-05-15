require("colors");
//Importing dotenv
require("dotenv").config();
const dataBaseUrl = process.env.DATABASE;
//App requirements
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

//Importing Schemas / Models
const User = require("./Models/User");

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

//Default User
app.use((req, res, next) => {
  User.findById("645368d0b74b4aaabb0f41bc")
    .then((user) => {
      req.user = user;
      req.isLoggedIn = false;
      next();
    })
    .catch((err) => console.error(err));
});

//Listening to routes
app.use(shopRoutes);
app.use(adminRoutes);

//Calling 404 Controllet in case of error 404
app.use(errorController.get404);

//Connecting Mongoose to MongoDB Database | Creating a dummy user if not exists
mongoose
  .connect(dataBaseUrl)
  .then((result) => {
    User.findOne()
      .then((user) => {
        if (!user) {
          const user = new User({
            name: "Panos",
            email: "panos@panos.panos",
            role: "admin",
            cart: {
              items: [],
            },
          });
          user.save();
        }
      })
      .catch((err) => console.error(err));
    app.listen(3000);
    console.log(`Server is listening to : `.blue, "3000".yellow);
  })
  .catch((err) => console.log(err));
