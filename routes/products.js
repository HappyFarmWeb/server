const { Category } = require("../models/category.js");
const { Product } = require("../models/products.js");
const { MyList } = require("../models/myList");
const { Cart } = require("../models/cart");
const { RecentlyViewd } = require("../models/recentlyViewd.js");
const { ImageUpload } = require("../models/imageUpload.js");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var imagesArr = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
    //imagesArr.push(`${Date.now()}_${file.originalname}`)
    //console.log(file.originalname)
  },
});

const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
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
  }
});

// router.get(`/`, async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const perPage = parseInt(req.query.perPage);
//   const totalPosts = await Product.countDocuments();
//   const totalPages = Math.ceil(totalPosts / perPage);

//   if (page > totalPages) {
//     return res.status(404).json({ message: "Page not found" });
//   }

//   let productList = [];

//   if (req.query.page !== undefined && req.query.perPage !== undefined) {
//     if (req.query.location !== undefined) {
//       const productListArr = await Product.find()
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();

//       for (let i = 0; i < productListArr.length; i++) {
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = await Product.find()
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();
//     }
//   } else {
//     productList = await Product.find();
//   }
//   return res.status(200).json({
//     products: productList,
//     totalPages: totalPages,
//     page: page,
//   });
// });

router.get(`/`, async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number, defaults to 1 if not provided
  const perPage = parseInt(req.query.perPage); // Number of items per page
  const totalPosts = await Product.countDocuments(); // Total number of products
  const totalPages = Math.ceil(totalPosts / perPage); // Total number of pages

  // Handle case where the requested page exceeds total available pages
  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  let productList = [];

  // Pagination logic
  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    productList = await Product.find()
      .populate("category") // Populate the category details for each product
      .skip((page - 1) * perPage) // Skip products for previous pages
      .limit(perPage) // Limit to the number of products per page
      .exec();
  } else {
    // Fetch all products without pagination if page and perPage are not specified
    productList = await Product.find().populate("category");
  }

  // Return the product list, total pages, and current page in the response
  return res.status(200).json({
    products: productList,
    totalPages: totalPages,
    page: page,
  });
});


// router.get(`/catName`, async (req, res) => {
//   let productList = [];

//   const page = parseInt(req.query.page) || 1;
//   const perPage = parseInt(req.query.perPage);
//   const totalPosts = await Product.countDocuments();
//   const totalPages = Math.ceil(totalPosts / perPage);

//   if (page > totalPages) {
//     return res.status(404).json({ message: "Page not found" });
//   }

//   if (req.query.page !== undefined && req.query.perPage !== undefined) {
//     const productListArr = await Product.find({ catName: req.query.catName })
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .exec();

//     return res.status(200).json({
//       products: productListArr,
//       totalPages: totalPages,
//       page: page,
//     });
//   } else {
//     const productListArr = await Product.find({ catName: req.query.catName })
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .exec();

//     for (let i = 0; i < productListArr.length; i++) {
//       for (let j = 0; j < productListArr[i].location.length; j++) {
//         if (productListArr[i].location[j].value === req.query.location) {
//           productList.push(productListArr[i]);
//         }
//       }
//     }

//     if (req.query.location !== "All") {
//       return res.status(200).json({
//         products: productList,
//         totalPages: totalPages,
//         page: page,
//       });
//     } else {
//       return res.status(200).json({
//         products: productListArr,
//         totalPages: totalPages,
//         page: page,
//       });
//     }
//   }
// });

router.get(`/catName`, async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const perPage = parseInt(req.query.perPage); // Items per page
  const totalPosts = await Product.countDocuments({ catName: req.query.catName }); // Count of products matching catName
  const totalPages = Math.ceil(totalPosts / perPage); // Total pages for pagination

  // Handle case where requested page exceeds total pages
  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  // Fetch products filtered by catName with pagination
  const productList = await Product.find({ catName: req.query.catName })
    .populate("category")
    .skip((page - 1) * perPage) // Skip products for previous pages
    .limit(perPage) // Limit the number of products returned
    .exec();

  // Respond with the filtered and paginated product list
  return res.status(200).json({
    products: productList,
    totalPages: totalPages,
    page: page,
  });
});


// router.get(`/catId`, async (req, res) => {
//   let productList = [];
//   let productListArr = [];

//   const page = parseInt(req.query.page) || 1;
//   const perPage = parseInt(req.query.perPage);
//   const totalPosts = await Product.countDocuments();
//   const totalPages = Math.ceil(totalPosts / perPage);

//   if (page > totalPages) {
//     return res.status(404).json({ message: "Page not found" });
//   }

//   if (req.query.page !== undefined && req.query.perPage !== undefined) {
//     const productListArr = await Product.find({ catId: req.query.catId })
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .exec();

//     return res.status(200).json({
//       products: productListArr,
//       totalPages: totalPages,
//       page: page,
//     });
//   } else {
//     productListArr = await Product.find({ catId: req.query.catId });

//     for (let i = 0; i < productListArr.length; i++) {
//       //console.log(productList[i].location)
//       for (let j = 0; j < productListArr[i].location.length; j++) {
//         if (productListArr[i].location[j].value === req.query.location) {
//           productList.push(productListArr[i]);
//         }
//       }
//     }

//     if (req.query.location !== "All" && req.query.location!==undefined) {
//       return res.status(200).json({
//         products: productList,
//         totalPages: totalPages,
//         page: page,
//       });
//     } else {
//       return res.status(200).json({
//         products: productListArr,
//         totalPages: totalPages,
//         page: page,
//       });
//     }


   

//   }
// });

// router.get(`/catId/:catId`, async (req, res) => {
//   const { catId } = req.params; // Extract catId from URL params
//   const page = parseInt(req.query.page) || 1; // Page number from query
//   const perPage = parseInt(req.query.perPage) || 10; // Items per page

//   try {
//     // Dynamic query
//     const query = catId === "all" ? {} : { catId };

//     // Count total products
//     const totalPosts = await Product.countDocuments(query);
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if (page > totalPages) {
//       return res.status(404).json({ message: "Page not found" });
//     }

//     // Fetch paginated products
//     const productList = await Product.find(query)
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .exec();

//     return res.status(200).json({
//       products: productList,
//       totalPages: totalPages,
//       page: page,
//       totalPosts: totalPosts,
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Error fetching products", error });
//   }
// });
router.get("/catId/:catId", async (req, res) => {
  const { catId } = req.params; // Extract catId from URL params
  const page = parseInt(req.query.page) || 1; // Page number from query
  console.log(catId)
  const perPage = parseInt(req.query.perPage) || 10; // Items per page

  try {
    // Dynamic query
    const query = catId === "all" ? {} : { catId };

    // Count total products
    const totalPosts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Fetch paginated products
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
});


router.get("/category", async (req, res) => {
  const { catId } = req.body; // Extract catId from URL params
  
  const page = parseInt(req.query.page) || 1; // Page number from query
  console.log(catId)
  const perPage = parseInt(req.query.perPage) || 10; // Items per page

  try {
    // Dynamic query
    const query = catId === "all" ? {} : { catId };

    // Count total products
    const totalPosts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Fetch paginated products
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
});




// router.get(`/subCatId`, async (req, res) => {
//   let productList = [];

//   const page = parseInt(req.query.page) || 1;
//   const perPage = parseInt(req.query.perPage);
//   const totalPosts = await Product.countDocuments();
//   const totalPages = Math.ceil(totalPosts / perPage);

//   if (page > totalPages) {
//     return res.status(404).json({ message: "Page not found" });
//   }

//   if (req.query.page !== undefined && req.query.perPage !== undefined) {
//     const productListArr = await Product.find({ subCatId: req.query.subCatId })
//       .populate("category")
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .exec();

//     return res.status(200).json({
//       products: productListArr,
//       totalPages: totalPages,
//       page: page,
//     });
//   } else {
//     const productListArr = await Product.find({ subCatId: req.query.subCatId });

//     for (let i = 0; i < productListArr.length; i++) {
//       //console.log(productList[i].location)
//       for (let j = 0; j < productListArr[i].location.length; j++) {
//         if (productListArr[i].location[j].value === req.query.location) {
//           productList.push(productListArr[i]);
//         }
//       }
//     }

//     if (req.query.location !== "All") {
//       return res.status(200).json({
//         products: productList,
//         totalPages: totalPages,
//         page: page,
//       });
//     } else {
//       return res.status(200).json({
//         products: productListArr,
//         totalPages: totalPages,
//         page: page,
//       });
//     }
//   }
// });

router.get(`/subCatId`, async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const perPage = parseInt(req.query.perPage); // Items per page

  // Count total products matching the subCatId
  const totalPosts = await Product.countDocuments({ subCatId: req.query.subCatId });
  const totalPages = Math.ceil(totalPosts / perPage); // Calculate total pages

  // Handle case where requested page exceeds total pages
  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  // Fetch products filtered by subCatId with pagination
  const productList = await Product.find({ subCatId: req.query.subCatId })
    .populate("category") // Populate the category field
    .skip((page - 1) * perPage) // Skip products for previous pages
    .limit(perPage) // Limit the number of products returned
    .exec();

  // Respond with the filtered and paginated product list
  return res.status(200).json({
    products: productList,
    totalPages: totalPages,
    page: page,
  });
});


// router.get(`/fiterByPrice`, async (req, res) => {
//   let productList = [];

//   if (req.query.catId !== "" && req.query.catId !== undefined) {
//     const productListArr = await Product.find({
//       catId: req.query.catId,
//     }).populate("category");

//     if (req.query.location !== "All") {
//       for (let i = 0; i < productListArr.length; i++) {
//         //console.log(productList[i].location)
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = productListArr;
//     }
//   } else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
//     const productListArr = await Product.find({
//       subCatId: req.query.subCatId,
//     }).populate("category");

//     if (req.query.location !== "All") {
//       for (let i = 0; i < productListArr.length; i++) {
//         //console.log(productList[i].location)
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = productListArr;
//     }
//   }

//   const filteredProducts = productList.filter((product) => {
//     if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
//       return false;
//     }
//     if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
//       return false;
//     }
//     return true;
//   });

//   return res.status(200).json({
//     products: filteredProducts,
//     totalPages: 0,
//     page: 0,
//   });
// });

router.get(`/filterByPrice`, async (req, res) => {
  let productList = [];

  // Check if `catId` is provided and fetch products accordingly
  if (req.query.catId !== "" && req.query.catId !== undefined) {
    productList = await Product.find({ catId: req.query.catId }).populate("category");
  } 
  // Check if `subCatId` is provided and fetch products accordingly
  else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
    productList = await Product.find({ subCatId: req.query.subCatId }).populate("category");
  }

  // Filter products based on price range
  const filteredProducts = productList.filter((product) => {
    if (req.query.minPrice && product.price < parseInt(req.query.minPrice)) {
      return false;
    }
    if (req.query.maxPrice && product.price > parseInt(req.query.maxPrice)) {
      return false;
    }
    return true;
  });

  // Return the filtered products
  return res.status(200).json({
    products: filteredProducts,
    totalPages: 0, // Assuming pagination is not applicable here
    page: 0,
  });
});


// router.get(`/rating`, async (req, res) => {
//   let productList = [];

//   if (req.query.catId !== "" && req.query.catId !== undefined) {
//     const productListArr = await Product.find({
//       catId: req.query.catId,
//       rating: req.query.rating,
//     }).populate("category");

//     if (req.query.location !== "All") {
//       for (let i = 0; i < productListArr.length; i++) {
//         //console.log(productList[i].location)
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = productListArr;
//     }
//   } else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
//     const productListArr = await Product.find({
//       subCatId: req.query.subCatId,
//       rating: req.query.rating,
//     }).populate("category");

//     if (req.query.location !== "All") {
//       for (let i = 0; i < productListArr.length; i++) {
//         //console.log(productList[i].location)
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = productListArr;
//     }
//   }

//   return res.status(200).json({
//     products: productList,
//     totalPages: 0,
//     page: 0,
//   });
// });

router.get(`/rating`, async (req, res) => {
  let productList = [];

  // Check if `catId` is provided and fetch products with the specified rating
  if (req.query.catId !== "" && req.query.catId !== undefined) {
    productList = await Product.find({
      catId: req.query.catId,
      rating: req.query.rating,
    }).populate("category");
  } 
  // Check if `subCatId` is provided and fetch products with the specified rating
  else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
    productList = await Product.find({
      subCatId: req.query.subCatId,
      rating: req.query.rating,
    }).populate("category");
  }

  // Return the filtered products
  return res.status(200).json({
    products: productList,
    totalPages: 0, // Assuming pagination is not applicable here
    page: 0,
  });
});


router.get(`/get/count`, async (req, res) => {
  const productsCount = await Product.countDocuments();

  if (!productsCount) {
    res.status(500).json({ success: false });
  } else {
    res.send({
      productsCount: productsCount,
    });
  }
});

// router.get(`/featured`, async (req, res) => {
//   let productList = [];
//   if (req.query.location !== undefined && req.query.location !== null) {
//     const productListArr = await Product.find({ isFeatured: true }).populate(
//       "category"
//     );

//     for (let i = 0; i < productListArr.length; i++) {
//       for (let j = 0; j < productListArr[i].location.length; j++) {
//         if (productListArr[i].location[j].value === req.query.location) {
//           productList.push(productListArr[i]);
//         }
//       }
//     }
//   } else {
//     productList = await Product.find({ isFeatured: true }).populate("category");
//   }

//   if (!productList) {
//     res.status(500).json({ success: false });
//   }

//   return res.status(200).json(productList);
// });


router.get(`/featured`, async (req, res) => {
  try {
    // Fetch all featured products and populate the "category" field
    const productList = await Product.find({ isFeatured: true }).populate("category");

    // Check if the query returned any results
    if (!productList || productList.length === 0) {
      return res.status(404).json({ success: false, message: "No featured products found" });
    }

    // Return the featured products
    return res.status(200).json(productList);
  } catch (error) {
    // Handle potential errors
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});



router.get(`/recentlyViewd`, async (req, res) => {
  let productList = [];
  productList = await RecentlyViewd.find(req.query).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }

  return res.status(200).json(productList);
});

router.post(`/recentlyViewd`, async (req, res) => {
  let findProduct = await RecentlyViewd.find({ prodId: req.body.id });

  var product;

  if (findProduct.length === 0) {
    product = new RecentlyViewd({
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
});

// router.post(`/create`, async (req, res) => {
//   const category = await Category.findById(req.body.category);
//   if (!category) {
//     return res.status(404).send("invalid Category!");
//   }

//   const images_Array = [];
//   const uploadedImages = await ImageUpload.find();

//   const images_Arr = uploadedImages?.map((item) => {
//     item.images?.map((image) => {
//       images_Array.push(image);
//       console.log(image);
//     });
//   });

//   product = new Product({
//     name: req.body.name,
//     description: req.body.description,
//     images: images_Array,
//     brand: req.body.brand,
//     price: req.body.price,
//     oldPrice: req.body.oldPrice,
//     catId: req.body.catId,
//     catName: req.body.catName,
//     subCat: req.body.subCat,
//     subCatId: req.body.subCatId,
//     subCatName: req.body.subCatName,
//     category: req.body.category,
//     countInStock: req.body.countInStock,
//     rating: req.body.rating,
//     isFeatured: req.body.isFeatured,
//     discount: req.body.discount,
//     productRam: req.body.productRam,
//     size: req.body.size,
//     productWeight: req.body.productWeight,
//     // location: req.body.location !== "" ? req.body.location : "All",
//   });

//   product = await product.save();

//   if (!product) {
//     res.status(500).json({
//       error: err,
//       success: false,
//     });
//   }

//   imagesArr = [];

//   res.status(201).json(product);
// });

router.post(`/create`, async (req, res) => {
  try {
      // Validate category
      const category = await Category.findById(req.body.category);
      if (!category) {
          return res.status(400).json({
              success: false,
              message: "Invalid Category!"
          });
      }

      // Validate required fields
      if (!req.body.name || !req.body.description) {
          return res.status(400).json({
              success: false,
              message: "Name and description are required!"
          });
      }

      // Handle images
      const images_Array = req.body.images || [];
      
      // Validate prices array
      const prices = req.body.prices?.map(price => ({
          quantity: Number(price.quantity) || 0,
          actualPrice: Number(price.actualPrice) || 0,
          oldPrice: Number(price.oldPrice) || 0,
          discount: Number(price.discount) || 0,
          type: price.type || ''
      })) || [];

      // Create product with all fields
      let product = new Product({
          name: req.body.name,
          description: req.body.description,
          images: images_Array,
          prices: prices,
          brand: req.body.brand || '',
          price: Number(req.body.price) || 0,
          oldPrice: Number(req.body.oldPrice) || 0,
          catId: req.body.catId || '',
          catName: req.body.catName || '',
          subCat: req.body.subCat || '',
          subCatId: req.body.subCatId || '',
          subCatName: req.body.subCatName || '',
          category: req.body.category,
          countInStock: Number(req.body.countInStock) || 0,
          rating: Number(req.body.rating) || 0,
          isFeatured: Boolean(req.body.isFeatured),
          discount: Number(req.body.discount) || 0,
          productRam: Array.isArray(req.body.productRam) ? req.body.productRam : [],
          size: Array.isArray(req.body.size) ? req.body.size : [],
          productWeight: Array.isArray(req.body.productWeight) ? req.body.productWeight : []
      });

      // Save the product
      product = await product.save();

      if (!product) {
          return res.status(500).json({
              success: false,
              message: "The product cannot be created!"
          });
      }

      // Return success response
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
});

router.get("/:id", async (req, res) => {
  productEditId = req.params.id;

  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res
      .status(500)
      .json({ message: "The product with the given ID was not found." });
  }
  return res.status(200).send(product);
});

router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;

  // console.log(imgUrl)

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
});

router.delete("/:id", async (req, res) => {
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

    //  console.log(imageName)
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
});

router.put("/:id", async (req, res) => {
  try {
      // Validate category
      const category = await Category.findById(req.body.category);
      if (!category) {
          return res.status(400).json({
              success: false,
              message: "Invalid Category!"
          });
      }

      // Validate required fields
      if (!req.body.name || !req.body.description) {
          return res.status(400).json({
              success: false,
              message: "Name and description are required!"
          });
      }

      // Handle images
      const images_Array = req.body.images || [];

      // Validate prices array
      const prices = req.body.prices?.map(price => ({
          quantity: Number(price.quantity) || 0,
          actualPrice: Number(price.actualPrice) || 0,
          oldPrice: Number(price.oldPrice) || 0,
          discount: Number(price.discount) || 0,
          type: price.type || ''
      })) || [];

      // Find product by ID and update
      let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          description: req.body.description,
          images: images_Array,
          prices: prices,
          // brand: req.body.brand || '',
          // price: Number(req.body.price) || 0,
          // oldPrice: Number(req.body.oldPrice) || 0,
          catId: req.body.catId || '',
          catName: req.body.catName || '',
          subCat: req.body.subCat || '',
          subCatId: req.body.subCatId || '',
          subCatName: req.body.subCatName || '',
          category: req.body.category,
          countInStock: Number(req.body.countInStock) || 0,
          rating: Number(req.body.rating) || 0,
          isFeatured: Boolean(req.body.isFeatured),
          // discount: Number(req.body.discount) || 0,
          // productRam: Array.isArray(req.body.productRam) ? req.body.productRam : [],
          // size: Array.isArray(req.body.size) ? req.body.size : [],
          // productWeight: Array.isArray(req.body.productWeight) ? req.body.productWeight : []
        },
        { new: true }
      );

      if (!product) {
          return res.status(404).json({
              success: false,
              message: "The product cannot be updated!"
          });
      }

      // Return success response
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
});


// router.get(`/`, async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const perPage = parseInt(req.query.perPage);
//   const totalPosts = await Product.countDocuments();
//   const totalPages = Math.ceil(totalPosts / perPage);

//   if (page > totalPages) {
//     return res.status(404).json({ message: "Page not found" });
//   }

//   let productList = [];

//   if (req.query.minPrice !== undefined && req.query.maxPrice !== undefined) {
//     if (
//       req.query.subCatId !== undefined &&
//       req.query.subCatId !== null &&
//       req.query.subCatId !== ""
//     ) {
//       if (
//         req.query.location !== undefined &&
//         req.query.location !== null &&
//         req.query.location !== "All"
//       ) {
//         productList = await Product.find({
//           subCatId: req.query.subCatId,
//           location: req.query.location,
//         })
//           .populate("category")
//           .skip((page - 1) * perPage)
//           .limit(perPage)
//           .exec();
//       } else {
//         productList = await Product.find({
//           subCatId: req.query.subCatId,
//         })
//           .populate("category")
//           .skip((page - 1) * perPage)
//           .limit(perPage)
//           .exec();
//       }
//     }

//     if (
//       req.query.catId !== undefined &&
//       req.query.catId !== null &&
//       req.query.catId !== ""
//     ) {
//       if (
//         req.query.location !== undefined &&
//         req.query.location !== null &&
//         req.query.location !== "All"
//       ) {
//         productList = await Product.find({
//           catId: req.query.catId,
//           location: req.query.location,
//         })
//           .populate("category")
//           .skip((page - 1) * perPage)
//           .limit(perPage)
//           .exec();
//       } else {
//         productList = await Product.find({ catId: req.query.catId })
//           .populate("category")
//           .skip((page - 1) * perPage)
//           .limit(perPage)
//           .exec();
//       }
//     }

//     const filteredProducts = productList.filter((product) => {
//       if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
//         return false;
//       }
//       if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
//         return false;
//       }
//       return true;
//     });

//     if (!productList) {
//       res.status(500).json({ success: false });
//     }
//     return res.status(200).json({
//       products: filteredProducts,
//       totalPages: totalPages,
//       page: page,
//     });
//   } else if (req.query.page !== undefined && req.query.perPage !== undefined) {
//     if (
//       req.query.location !== undefined &&
//       req.query.location !== null &&
//       req.query.location !== "All"
//     ) {
//       productList = await Product.find({ location: req.query.location })
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();
//     } else {
//       productList = await Product.find()
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();
//     }

//     if (!productList) {
//       res.status(500).json({ success: false });
//     }
//     return res.status(200).json({
//       products: productList,
//       totalPages: totalPages,
//       page: page,
//     });
//   } else {
//     if (
//       req.query.location !== undefined &&
//       req.query.location !== null &&
//       req.query.location !== "All"
//     ) {
//       productList = await Product.find(req.query)
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();
//     } else if (
//       req.query.catId !== "" &&
//       req.query.catId !== null &&
//       req.query.catId !== undefined
//     ) {
//       productList = await Product.find({ catId: req.query.catId })
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();
//     } else if (
//       req.query.catName !== "" &&
//       req.query.catName !== null &&
//       req.query.catName !== undefined
//     ) {
//       productList = await Product.find({ catName: req.query.catName })
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();
//     } else if (
//       req.query.subCatId !== "" &&
//       req.query.subCatId !== null &&
//       req.query.subCatId !== undefined
//     ) {
//       productList = await Product.find({
//         subCatId: req.query.subCatId,
//       })
//         .populate("category")
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .exec();
//     }

//     if (
//       req.query.rating !== "" &&
//       req.query.rating !== null &&
//       req.query.rating !== undefined
//     ) {
//       if (
//         req.query.catId !== "" &&
//         req.query.catId !== null &&
//         req.query.catId !== undefined
//       ) {
//         if (
//           req.query.location !== undefined &&
//           req.query.location !== null &&
//           req.query.location !== "All"
//         ) {
//           productList = await Product.find({
//             rating: req.query.rating,
//             catId: req.query.catId,
//             location: req.query.location,
//           }).populate("category").skip((page - 1) * perPage)
//           .limit(perPage)
//           .exec();
//         } else {
//           productList = await Product.find({
//             rating: req.query.rating,
//             catId: req.query.catId,
//           }).populate("category").skip((page - 1) * perPage)
//           .limit(perPage)
//           .exec();
//         }
//       }
//     }

//     if (
//       req.query.rating !== "" &&
//       req.query.rating !== null &&
//       req.query.rating !== undefined
//     ) {
//       if (
//         req.query.subCatId !== "" &&
//         req.query.subCatId !== null &&
//         req.query.subCatId !== undefined
//       ) {
//         if (
//           req.query.location !== undefined &&
//           req.query.location !== null &&
//           req.query.location !== "All"
//         ) {
//           productList = await Product.find({
//             rating: req.query.rating,
//             subCatId: req.query.subCatId,
//             location: req.query.location,
//           }).populate("category").skip((page - 1) * perPage)
//           .limit(perPage)
//           .exec();
//         } else {
//           productList = await Product.find({
//             rating: req.query.rating,
//             subCatId: req.query.subCatId,
//           }).populate("category").skip((page - 1) * perPage)
//           .limit(perPage)
//           .exec();
//         }
//       }
//     }

//     if (!productList) {
//       res.status(500).json({ success: false });
//     }

//     return res.status(200).json({
//       products: productList,
//       totalPages: totalPages,
//       page: page,
//     });
//   }
// });

module.exports = router;
