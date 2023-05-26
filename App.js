require("colors");
//Importing dotenv
require("dotenv").config();
const dataBaseUrl = process.env.DATABASE;
//App requirements
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

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
//Listening to routes
app.use(middleWare.validation, shopRoutes);
app.use(middleWare.validation, adminRoutes);

//Calling 404 Controllet in case of error 404
app.use(errorController.get404);

//Connecting Mongoose to MongoDB Database | Creating a dummy user if not exists
mongoose
  .connect(dataBaseUrl)
  .then((result) => {
    app.listen(3000);
    console.log(`Server is listening to : `.blue, "3000".yellow);
  })
  .catch((err) => console.log(err));
