const Product = require("../Models/Product");
const User = require("../Models/User");

exports.getShop = (req, res, next) => {
  let productCollection;
  Product.find()
    .then((products) => {
      productCollection = products;
    })
    .then(() => {
      User.findById("645368d0b74b4aaabb0f41bc")
        .then((user) => {
            const products = req.user.cart.items;
            let totalProducts = 0
            console.log(user.role)
            products.forEach(e => {
              totalProducts+= e.quantity
            })
          res.render("index", {
            pageTitle: "Shop",
            path: "/shop",
            products: productCollection,
            user: user,
            total : totalProducts
          });
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

exports.getCart = (req, res, next) => {
    req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      let totalProducts = 0

      products.forEach(e => {
        totalProducts+= e.quantity
      })

      res.render("user/cart", {
        path: "/cart",
        pageTitle: "Your cart",
        products: products,
        user : user,
        total : totalProducts
      });
    })
    .catch((err) => console.error(err));
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId
    
    Product.findById(productId)
    .then(product => {
        return req.user.addToCart(product)
    })
    .then(() => {
        res.redirect('/')
    })
};

exports.postDeleteItem = (req,res,next) => {
  const productId = req.body.productId
  req.user.removeFromCart([productId])
  .then(() => {
    res.redirect('/cart')
  })
  .catch(err => console.error(err))
}