const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');


app.use(cors());
app.options('*', cors())


//middleware
app.use(bodyParser.json());
app.use(express.json());


//Routes

const imageUploadRoutes = require('./helper/imageUpload.js');
const bannerRoutes = require('./routes/baannerRoutes.js');
const cartRoutes=require('./routes/cartRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const homeBannerRoutes = require('./routes/homeBannerRoutes.js');
const homeBottomBannerRoutes = require('./routes/homeBottomBannerRoutes.js');
const homeSideBannerRoutes = require('./routes/homeSideBannerRoutes.js');
const myListRoutes = require('./routes/myListRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const productReviewRoutes = require('./routes/productReviewRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const productSearchRoutes = require('./routes/productSearchRoutes.js');
const subcategoryRoutes = require('./routes/subcategoryRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

app.use("/api/user",userRoutes);
app.use("/uploads",express.static("uploads"));
app.use(`/api/category`, categoryRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/imageUpload`, imageUploadRoutes);
app.use(`/api/productReviews`, productReviewRoutes);
app.use(`/api/cart`, cartRoutes);
app.use(`/api/my-list`, myListRoutes);
app.use(`/api/orders`, orderRoutes);
app.use(`/api/homeBanner`, homeBannerRoutes);
app.use(`/api/search`, productSearchRoutes);
app.use(`/api/banners`, bannerRoutes);
app.use(`/api/homeSideBanners`, homeSideBannerRoutes);
app.use(`/api/homeBottomBanners`, homeBottomBannerRoutes);
app.use(`/api/subcategory`, subcategoryRoutes);


// Database
mongoose.connect(process.env.CONNECTION_STRING, {
})
    .then(() => {``
        console.log('Database Connection is ready...');
        //Server
        app.listen(process.env.PORT, () => {
            console.log(`server is running http://localhost:${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        process.exit(1); // Optionally, exit the process if critical
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });