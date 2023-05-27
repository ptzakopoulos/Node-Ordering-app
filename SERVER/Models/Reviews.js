const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema([
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      requiredd: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
]);

reviewSchema.methods.postReview = function ({
  productId,
  userId,
  title,
  content,
  score,
}) {
  this.productId = productId;
  this.userId = userId;
  this.title = title;
  this.content = content;
  this.score = score;

  return this.save();
};

module.exports = mongoose.model("Review", reviewSchema);
