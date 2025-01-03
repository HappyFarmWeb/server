const mongoose = require("mongoose");

const priceSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    actualPrice: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        default: ''
    },
    countInStock:{
        type: Number,
        default: 0
    }
});

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    prices: [priceSchema],
    
    catName:{
        type: String,
        default: ''
    },
    catId:{
        type: String,
        default: ''
    },
    subCatId:{
        type: String,
        default: ''
    },
    subCat:{
        type: String,
        default: ''
    },
    subCatName:{
        type: String,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    rating: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    }
});

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});

exports.Product = mongoose.model('Product', productSchema);
exports.Price=mongoose.model('Price', priceSchema);