const { HomeBanner } = require('../models/homeBanner');
const { ImageUpload } = require('../models/imageUpload');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

let imagesArr = [];

const uploadImages = async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req.files.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      const img = await cloudinary.uploader.upload(req.files[i].path, options);
      imagesArr.push(img.secure_url);
      fs.unlinkSync(`uploads/${req.files[i].filename}`);
    }

    let imagesUploaded = new ImageUpload({
      images: imagesArr,
    });

    imagesUploaded = await imagesUploaded.save();
    return res.status(200).json(imagesArr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading images" });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const bannerImagesList = await HomeBanner.find();
    if (!bannerImagesList) {
      return res.status(500).json({ success: false });
    }

    res.status(200).json(bannerImagesList);
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getBannerById = async (req, res) => {
  const slide = await HomeBanner.findById(req.params.id);

  if (!slide) {
    return res.status(500).json({ message: "The slide with the given ID was not found." });
  }

  res.status(200).send(slide);
};

const createBanner = async (req, res) => {
  let newEntry = new HomeBanner({
    images: imagesArr,
  });

  if (!newEntry) {
    return res.status(500).json({
      error: "Error creating banner",
      success: false,
    });
  }

  newEntry = await newEntry.save();
  imagesArr = [];

  res.status(201).json(newEntry);
};

const deleteBannerImage = async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(imageName);

  if (response) {
    return res.status(200).send(response);
  }

  res.status(500).json({ message: "Failed to delete image" });
};

const deleteBanner = async (req, res) => {
  const item = await HomeBanner.findById(req.params.id);
  const images = item.images;

  for (const img of images) {
    const imgUrl = img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    await cloudinary.uploader.destroy(imageName);
  }

  const deletedItem = await HomeBanner.findByIdAndDelete(req.params.id);

  if (!deletedItem) {
    return res.status(404).json({
      message: "Slide not found!",
      success: false,
    });
  }

  res.status(200).json({
    success: true,
    message: "Slide Deleted!",
  });
};

const updateBanner = async (req, res) => {
  const slideItem = await HomeBanner.findByIdAndUpdate(
    req.params.id,
    {
      images: req.body.images,
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
  deleteBannerImage,
  deleteBanner,
  updateBanner,
};
