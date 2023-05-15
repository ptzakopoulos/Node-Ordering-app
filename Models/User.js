const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  orders: [
    [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        date: {
          type: Object,
          required: true,
        },
      },
    ],
  ],
  orderDate: [
    {
      type: String,
      required: true,
    },
  ],
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((e) => {
    return e.productId.toString() === product._id.toString(); //Apo tin MongoDB
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeOneFromCart = function (productId) {
  const currentCart = [...this.cart.items];
  const index = currentCart.findIndex(
    (e) => e.productId._id.toString() === productId.toString()
  );
  const updatedCart = currentCart.find(
    (e) => e.productId._id.toString() === productId.toString()
  );
  if (updatedCart.quantity > 1) {
    updatedCart.quantity -= 1;
    currentCart.splice(index, 1, updatedCart);
  } else {
    currentCart.splice(index, 1);
  }

  const updated = {
    items: currentCart,
  };
  this.cart = updated;
  return this.save();
};

userSchema.methods.addOneToCart = function (productId) {
  const currentCart = [...this.cart.items];
  const index = currentCart.findIndex(
    (e) => e.productId._id.toString() === productId.toString()
  );
  const updatedCart = currentCart.find(
    (e) => e.productId._id.toString() === productId.toString()
  );

  updatedCart.quantity += 1;
  currentCart.splice(index, 1, updatedCart);

  const updated = {
    items: currentCart,
  };
  this.cart = updated;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId._id.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = {
    items: [],
  };
  return this.save();
};

userSchema.methods.sendOrder = function () {
  const date = new Date().toLocaleString();

  const newOrder = [...this.cart.items];

  this.orders.push(newOrder);
  this.orderDate.push(date);
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
