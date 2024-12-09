const mongoose = require('mongoose');


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
    }
});

const myListSchema = mongoose.Schema({
    productTitle:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    priceDetails:{
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
        }
    },
    productId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    }
})

myListSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

myListSchema.set('toJSON', {
    virtuals: true,
});

exports.MyList = mongoose.model('MyList', myListSchema);
exports.myListSchema = myListSchema;
