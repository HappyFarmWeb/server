const { Banner } = require("../models/banners");
const { ImageUpload } = require("../models/imageUpload");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var imagesArr = [];

// Upload Images to Cloudinary and Save URLs
const uploadImages = async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req?.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(req.files[i].path, options, function (error, result) {
        imagesArr.push(result.secure_url);
        fs.unlinkSync(`uploads/${req.files[i].filename}`);
      });
    }

    let imagesUploaded = new ImageUpload({ images: imagesArr });
    imagesUploaded = await imagesUploaded.save();

    return res.status(200).json(imagesArr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading images", error });
  }
};

// Get All Banners
const getBanners = async (req, res) => {
  try {
    const bannerList = await Banner.find();

    if (!bannerList) {
      return res.status(500).json({ success: false });
    }

    return res.status(200).json(bannerList);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Get Banner by ID
const getBannerById = async (req, res) => {
  try {
    const slide = await Banner.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({ message: "Banner not found" });
    }

    return res.status(200).json(slide);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Create a New Banner
const createBanner = async (req, res) => {
  try {
    let newEntry = new Banner({
      images: imagesArr,
      catId: req.body.catId,
      catName: req.body.catName,
      subCatId: req.body.subCatId,
      subCatName: req.body.subCatName,
    });

    newEntry = await newEntry.save();

    imagesArr = [];
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: "Error creating banner", error });
  }
};

// Delete an Image from Cloudinary
const deleteImage = async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  try {
    const response = await cloudinary.uploader.destroy(imageName);

    if (response) {
      res.status(200).send(response);
    } else {
      res.status(500).json({ message: "Error deleting image" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Delete a Banner and Its Images
const deleteBanner = async (req, res) => {
  try {
    const item = await Banner.findById(req.params.id);
    const images = item.images;

    for (let img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      await cloudinary.uploader.destroy(imageName);
    }

    const deletedItem = await Banner.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Banner not found!", success: false });
    }

    res.status(200).json({ success: true, message: "Banner Deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// Update Banner Details
const updateBanner = async (req, res) => {
  try {
    const slideItem = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        images: req.body.images,
        catId: req.body.catId,
        catName: req.body.catName,
        subCatId: req.body.subCatId,
        subCatName: req.body.subCatName,
      },
      { new: true }
    );

    if (!slideItem) {
      return res.status(500).json({ message: "Item cannot be updated!", success: false });
    }

    imagesArr = [];
    res.status(200).json(slideItem);
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

module.exports = {
  uploadImages,
  getBanners,
  getBannerById,
  createBanner,
  deleteImage,
  deleteBanner,
  updateBanner,
};
