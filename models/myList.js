const mongoose = require('mongoose');


const myListSchema = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Product"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
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
