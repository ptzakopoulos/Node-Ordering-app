const Product = require('../Models/Product')

exports.postAddProduct = (req,res,next) => {
    const user = req.user
    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const price = req.body.price
    const description = req.body.description

    const newProduct = new Product({
        title : title,
        price : price,
        description : description,
        imageUrl : imageUrl,
        userId : user.id
    })

    newProduct
    .save()
    .then(() => {
        res.redirect('/')
    })
}

exports.postDeleteProduct = (req,res,next) => {
    const prodId = req.body.deletedProdId

    Product.findByIdAndRemove(prodId)
    .then(() => {
        res.redirect('/')
    })
}

exports.postEditProduct = (req,res,next) => {
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

}