const { Category } = require("../models/category.js");
const { Product } = require("../models/products.js");
const { MyList } = require("../models/myList");
const { Cart } = require("../models/cart");
const { RecentlyViewd } = require("../models/recentlyViewd.js");
const { ImageUpload } = require("../models/imageUpload.js");
const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

let imagesArr = [];

exports.uploadImages = async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      const img = await cloudinary.uploader.upload(
        req.files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    let imagesUploaded = new ImageUpload({
      images: imagesArr,
    });

    imagesUploaded = await imagesUploaded.save();

    return res.status(200).json(imagesArr);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Product.countDocuments();
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  let productList = [];

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    productList = await Product.find()
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
  } else {
    productList = await Product.find().populate("category");
  }

  return res.status(200).json({
    products: productList,
    totalPages: totalPages,
    page: page,
  });
};

exports.getProductsByCatName = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Product.countDocuments({ catName: req.query.catName });
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  const productList = await Product.find({ catName: req.query.catName })
    .populate("category")
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();

  return res.status(200).json({
    products: productList,
    totalPages: totalPages,
    page: page,
  });
};

exports.getProductsByCatId = async (req, res) => {
  const { catId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;

  try {
    const query = catId === "all" ? {} : { catId };
    const totalPosts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res.status(404).json({ message: "Page not found" });
    }

    const productList = await Product.find(query)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      products: productList,
      totalPages: totalPages,
      page: page,
      totalPosts: totalPosts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error });
  }
};

exports.getProductsBySubCatId = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Product.countDocuments({ subCatId: req.query.subCatId });
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  const productList = await Product.find({ subCatId: req.query.subCatId })
    .populate("category")
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();

  return res.status(200).json({
    products: productList,
    totalPages: totalPages,
    page: page,
  });
};

exports.filterByPrice = async (req, res) => {
  try {
    let { minPrice, maxPrice, catId, subCatId } = req.query;

    if (catId && !mongoose.isValidObjectId(catId)) {
      return res.status(400).json({ message: 'Invalid catId' });
    }
    if (subCatId && !mongoose.isValidObjectId(subCatId)) {
      return res.status(400).json({ message: 'Invalid subCatId' });
    }

    let productList = [];

    if (catId) {
      productList = await Product.find({ catId }).populate("category");
    } else if (subCatId) {
      productList = await Product.find({ subCatId }).populate("category");
    }

    const filteredProducts = productList.filter((product) => {
      const prices = product.prices;
      return prices.some((priceObj) => {
        const actualPrice = priceObj.actualPrice;
        if (minPrice && actualPrice < parseInt(minPrice)) return false;
        if (maxPrice && actualPrice > parseInt(maxPrice)) return false;
        return true;
      });
    });

    return res.status(200).json({
      products: filteredProducts,
      totalPages: 0,
      page: 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductsByRating = async (req, res) => {
  let productList = [];

  if (req.query.catId !== "" && req.query.catId !== undefined) {
    productList = await Product.find({
      catId: req.query.catId,
      rating: req.query.rating,
    }).populate("category");
  } 
  else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
    productList = await Product.find({
      subCatId: req.query.subCatId,
      rating: req.query.rating,
    }).populate("category");
  }

  return res.status(200).json({
    products: productList,
    totalPages: 0,
    page: 0,
  });
};

exports.getProductCount = async (req, res) => {
  const productsCount = await Product.countDocuments();

  if (!productsCount) {
    res.status(500).json({ success: false });
  } else {
    res.send({
      productsCount: productsCount,
    });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const productList = await Product.find({ isFeatured: true }).populate("category");

    if (!productList || productList.length === 0) {
      return res.status(404).json({ success: false, message: "No featured products found" });
    }

    return res.status(200).json(productList);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRecentlyViewed = async (req, res) => {
  let productList = await RecentlyViewd.find(req.query).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }

  return res.status(200).json(productList);
};

exports.addRecentlyViewed = async (req, res) => {
  let findProduct = await RecentlyViewd.find({ prodId: req.body.id });

  if (findProduct.length === 0) {
    let product = new RecentlyViewd({
      prodId: req.body.id,
      name: req.body.name,
      description: req.body.description,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      oldPrice: req.body.oldPrice,
      subCatId: req.body.subCatId,
      catName: req.body.catName,
      subCat: req.body.subCat,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      discount: req.body.discount,
      productRam: req.body.productRam,
      size: req.body.size,
      productWeight: req.body.productWeight,
    });

    product = await product.save();

    if (!product) {
      res.status(500).json({
        error: err,
        success: false,
      });
    }

    res.status(201).json(product);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const category = await Category.findById(req.body.catId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category!"
      });
    }

    if (!req.body.name || !req.body.description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required!"
      });
    }

    const images_Array = req.body.images || [];
    
    const prices = req.body.prices?.map(price => ({
      quantity: Number(price.quantity) || 0,
      actualPrice: Number(price.actualPrice) || 0,
      oldPrice: Number(price.oldPrice) || 0,
      discount: Number(price.discount) || 0,
      countInStock: Number(price.countInStock) || 0,
      type: price.type || ''
    })) || [];

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      images: images_Array,
      catName: req.body.catName,
      subCat: req.body.subCat,
      prices: prices,
      catId: req.body.catId || '',
      subCatId: req.body.subCatId || '',
      subCatName: req.body.subCatName || '',
      category: req.body.category,
      rating: Number(req.body.rating) || 0,
      isFeatured: Boolean(req.body.isFeatured),
    });

    product = await product.save();

    if (!product) {
      return res.status(500).json({
        success: false,
        message: "The product cannot be created!"
      });
    }

    return res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully!"
    });

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res
      .status(500)
      .json({ message: "The product with the given ID was not found." });
  }
  return res.status(200).send(product);
};

exports.deleteImage = async (req, res) => {
  const imgUrl = req.query.img;

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(
    imageName,
    (error, result) => {}
  );

  if (response) {
    res.status(200).send(response);
  }
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  const images = product.images;

  for (img of images) {
    const imgUrl = img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
      cloudinary.uploader.destroy(imageName, (error, result) => {
        // console.log(error, result);
      });
    }
  }

  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  const myListItems = await MyList.find({ productId: req.params.id });

  for (var i = 0; i < myListItems.length; i++) {
    await MyList.findByIdAndDelete(myListItems[i].id);
  }

  const cartItems = await Cart.find({ productId: req.params.id });

  for (var i = 0; i < cartItems.length; i++) {
    await Cart.findByIdAndDelete(cartItems[i].id);
  }

  if (!deletedProduct) {
    res.status(404).json({
      message: "Product not found!",
      success: false,
    });
  }

  res.status(200).json({
    success: true,
    message: "Product Deleted!",
  });
};

exports.updateProduct = async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category!"
      });
    }

    if (!req.body.name || !req.body.description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required!"
      });
    }

    const images_Array = req.body.images || [];

    const prices = req.body.prices?.map(price => ({
      quantity: Number(price.quantity) || 0,
      actualPrice: Number(price.actualPrice) || 0,
      oldPrice: Number(price.oldPrice) || 0,
      discount: Number(price.discount) || 0,
      countInStock: Number(price.countInStock) || 0,
      type: price.type || ''
    })) || [];

    let product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        images: images_Array,
        prices: prices,
        catId: req.body.catId || '',
        catName: req.body.catName || '',
        subCat: req.body.subCat || '',
        subCatId: req.body.subCatId || '',
        subCatName: req.body.subCatName || '',
        category: req.body.category,
        countInStock: Number(req.body.countInStock) || 0,
        rating: Number(req.body.rating) || 0,
        isFeatured: Boolean(req.body.isFeatured),
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "The product cannot be updated!"
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
      message: "Product updated successfully!"
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

