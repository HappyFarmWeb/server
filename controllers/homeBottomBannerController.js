const { HomeBottomBanners } = require("../models/homeBottomBanner");
const { ImageUpload } = require("../models/imageUpload");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

let imagesArr = [];

const uploadImages = async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req?.files?.length; i++) {
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
    console.error(error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const bannerList = await HomeBottomBanners.find();
    if (!bannerList) {
      return res.status(404).json({ success: false });
    }
    return res.status(200).json(bannerList);
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getBannerById = async (req, res) => {
  try {
    const slide = await HomeBottomBanners.findById(req.params.id);
    if (!slide) {
      return res
        .status(404)
        .json({ message: "The Banner with the given ID was not found." });
    }
    return res.status(200).send(slide);
  } catch (error) {
    res.status(500).json({ message: "Error fetching banner" });
  }
};

const createBanner = async (req, res) => {
  try {
    let newEntry = new HomeBottomBanners({
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
    res.status(500).json({ message: "Error creating banner" });
  }
};

const deleteImage = async (req, res) => {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    const response = await cloudinary.uploader.destroy(imageName);
    if (response) {
      res.status(200).send(response);
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting image" });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const item = await HomeBottomBanners.findById(req.params.id);
    const images = item.images;

    for (let img of images) {
      const urlArr = img.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      await cloudinary.uploader.destroy(imageName);
    }

    const deletedItem = await HomeBottomBanners.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Banner not found!" });
    }

    res.status(200).json({ success: true, message: "Banner Deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting banner" });
  }
};

const updateBanner = async (req, res) => {
  try {
    const slideItem = await HomeBottomBanners.findByIdAndUpdate(
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
      return res.status(500).json({ message: "Item cannot be updated!" });
    }

    imagesArr = [];
    res.status(200).send(slideItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating banner" });
  }
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
