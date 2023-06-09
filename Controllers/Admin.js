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
  let registeredUsers;
  let totalOrders = [];

  let test1, test2, test3;

  Orders.find()
    .then((orders) => {
      test1 = orders;
    })
    .then(() => {
      User.find()
        .then((users) => (test2 = users))
        .then(() => {
          Product.find()
            .then((products) => (test3 = products))
            .then(() => {
              console.log(`Orders : `.green, test1.red);
              console.log(`Users : `.green, test2.red);
              console.log(`Products : `.green, test3.red);
            });
        });
    });

  Product.find()
    .populate("reviews")
    .then((products) => {
      products.forEach((product) => {
        const objectProperty = product.title.split(" ").join("");
        displayedProduct[objectProperty] = {
          title: product.title,
          quantity: 0,
        };
        productNames.push(objectProperty);
      });
    })
    .then(() => {
      User.find()
        // .populate("orders.productId")
        .then((users) => {
          registeredUsers = users;
          users.forEach((user) => {
            if (user.orders && user.orders.length > 0) {
              user.orders.forEach((order) => {
                totalOrders.push(order);
                order.forEach((product) => {
                  const objProp = product.productId.title.split(" ").join("");
                  displayedProduct[objProp].quantity += product.quantity;
                  displayedProduct[objProp]
                    ? (displayedProduct[objProp].quantity += product.quantity)
                    : "";
                });
              });
            }
          });
        })
        .then(() => {
          res.render("admin/statistics", {
            pageTitle: "Statistics",
            total: req.totalProducts,
            isLoggedIn: req.isLoggedIn,
            products: displayedProduct,
            props: productNames,
            users: registeredUsers,
            orders: totalOrders,
            role: req.user.role,
          });
        })
        .catch((err) => console.error(err));
    });
};
