const mongoose = require("mongoose");


const cartSchema = mongoose.Schema({
  productId: {
    type:mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Product"
  },
  priceId: {
    type:mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"Price"
  },
  userId: {
    type:mongoose.Schema.Types.ObjectId,
    required: true,
    ref:"User"
  },
  quantity:{
    type:Number,
    default:1
  },
  subTotal:{
    type:Number
  }

});

cartSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

cartSchema.set("toJSON", {
  virtuals: true,
});

exports.Cart = mongoose.model("Cart", cartSchema);
exports.cartSchema = cartSchema;
