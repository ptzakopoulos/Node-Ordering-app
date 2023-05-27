require("colors");
//Importing dotenv
require("dotenv").config();
const dataBaseUrl = process.env.DATABASE;
//App requirements
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

//Calling the routes | And 404 Controller
const errorController = require("./Controllers/error404");
//Routes
const shopRoutes = require("./Routes/Shop");
const adminRoutes = require("./Routes/Admin");

const middleWare = require("./Controllers/Shop");

app.get("/test", (req, res, next) => {
  console.log("____");
  res.json({
    test: 5,
  });
});

//Listening to routes
app.use(shopRoutes);
// app.use(middleWare.validation, adminRoutes);

//Calling 404 Controllet in case of error 404
app.use(errorController.get404);

//Connecting Mongoose to MongoDB Database | Creating a dummy user if not exists
mongoose
  .connect(dataBaseUrl)
  .then((result) => {
    app.listen(5000);
    console.log(`Server is listening to : `.blue, "5000".yellow);
  })
  .catch((err) => console.log(err));
