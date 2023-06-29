const Orders = require("../Models/Orders");
const Product = require("../Models/Product");
const User = require("../Models/User");
require("colors");

exports.postAddProduct = (req, res, next) => {
  const user = req.user;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const type = req.body.type;

  console.log(type);

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

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.deletedProdId;

  Product.findByIdAndRemove(prodId).then(() => {
    res.redirect("/");
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTItle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

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

exports.getStatistics = (req, res, next) => {
  const displayedProduct = {};
  const productNames = [];
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
  console.log(productArray);

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

exports.allUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      req.users = users;
      next();
    })
    .catch((err) => console.error(err));
};

exports.allOrders = (req, res, next) => {
  Orders.find()
    .then((orders) => {
      req.orders = orders;
      next();
    })
    .catch((err) => console.error(err));
};

exports.allProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      req.products = products;
      next();
    })
    .catch((err) => console.error(err));
};
