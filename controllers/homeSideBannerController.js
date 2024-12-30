const { HomeSideBanners } = require("../models/homeSideBanner");
const { ImageUpload } = require("../models/imageUpload");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

let imagesArr = [];

// Controller functions
const uploadImages = async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req?.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(req.files[i].path, options, (error, result) => {
        imagesArr.push(result.secure_url);
        fs.unlinkSync(`uploads/${req.files[i].filename}`);
      });
    }

    let imagesUploaded = new ImageUpload({
      images: imagesArr,
    });

    imagesUploaded = await imagesUploaded.save();
    return res.status(200).json(imagesArr);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Image upload failed" });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const bannerList = await HomeSideBanners.find();

    if (!bannerList) {
      return res.status(500).json({ success: false });
    }

    res.status(200).json(bannerList);
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getBannerById = async (req, res) => {
  const slide = await HomeSideBanners.findById(req.params.id);

  if (!slide) {
    return res.status(500).json({ message: "The Banner with the given ID was not found." });
  }
  res.status(200).send(slide);
};

const createBanner = async (req, res) => {
  let newEntry = new HomeSideBanners({
    images: imagesArr,
    catId: req.body.catId,
    catName: req.body.catName,
    subCatId: req.body.subCatId,
    subCatName: req.body.subCatName,
  });

  try {
    newEntry = await newEntry.save();
    imagesArr = [];
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create a banner",
      success: false,
    });
  }
};

const deleteImage = async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(imageName);

  if (response) {
    res.status(200).send(response);
  } else {
    res.status(500).json({ message: "Failed to delete image" });
  }
};

const deleteBanner = async (req, res) => {
  const item = await HomeSideBanners.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Banner not found!", success: false });
  }

  const images = item.images;

  for (const img of images) {
    const urlArr = img.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    cloudinary.uploader.destroy(imageName);
  }

  await HomeSideBanners.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Banner Deleted!" });
};

const updateBanner = async (req, res) => {
  const slideItem = await HomeSideBanners.findByIdAndUpdate(
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
    return res.status(500).json({
      message: "Item cannot be updated!",
      success: false,
    });
  }

  imagesArr = [];
  res.send(slideItem);
};

module.exports = {
  uploadImages,
  getAllBanners,
  getBannerById,
  createBanner,
  deleteImage,
  deleteBanner,
  updateBanner,
};
