const Orders = require("../Models/Orders");
const Product = require("../Models/Product");
const User = require("../Models/User");
require("colors");

//Controller responsible for adding a new product to the database
exports.postAddProduct = (req, res, next) => {
  const user = req.user;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const type = req.body.type;

  console.log(type);

  //Creating new product into the database
  const newProduct = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    type: type,
    userId: user.id,
  });

  newProduct.save().then(() => {
    res.redirect("/");
  });
};

//Controller responsible for deleting a product from the database
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.deletedProdId;

  //Removing a product from the database
  Product.findByIdAndRemove(prodId).then(() => {
    res.redirect("/");
  });
};

//Controller responsible for editting an existing product in the database
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTItle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  //Searching for a specific product based on its id
  Product.findById(prodId)
    .then((product) => {
      product.title = updatedTItle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.error(err));
};

//Controller responsible for getting information about the statistics
exports.getStatistics = (req, res, next) => {
  let i = 0;
  let productArray = [];

  req.products.forEach((product, index) => {
    productArray[index] = {
      title: product.title,
      quantity: 0,
    };
  });

  req.orders.forEach((order) => {
    order.products.forEach((product) => {
      const index = productArray.findIndex((prod) => {
        return prod?.title === product.product.title;
      });

      if (index > -1) {
        return (productArray[index].quantity += product.quantity);
      }
      i++;
    });
  });

  res.render("admin/statistics", {
    pageTitle: "Statistics",
    total: req.totalProducts,
    isLoggedIn: req.isLoggedIn,
    products: productArray,
    users: req.users,
    orders: req.orders,
    role: req.user.role,
  });
};

//Controller responsible for collecting all registered users
//It is used as middleware for getStatistics
exports.allUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      req.users = users;
      next();
    })
    .catch((err) => console.error(err));
};

//Controller responsible for collecting all orders
//It is used as middleware for getStatistics
exports.allOrders = (req, res, next) => {
  Orders.find()
    .then((orders) => {
      req.orders = orders;
      next();
    })
    .catch((err) => console.error(err));
};

//Controller responsible for collecting all products
//It is used as middleware for getStatistics
exports.allProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      req.products = products;
      next();
    })
    .catch((err) => console.error(err));
};
