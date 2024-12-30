const { Category } = require("../models/category");
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

exports.uploadImages = async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req?.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(
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

const createCategories = (categories, parentId = null) => {
  const categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }
  
  for (let cat of category) {
    categoryList.push({
      _id: cat._id,
      id: cat._id,
      name: cat.name,
      images: cat.images,
      color: cat.color,
      children: createCategories(categories, cat._id)
    });
  }

  return categoryList;
};

exports.getCategories = async (req, res) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList) {
      return res.status(500).json({ success: false });
    }

    const categoryData = createCategories(categoryList);
    return res.status(200).json({ categoryList: categoryData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCategoryCount = async (req, res) => {
  try {
    const categoryCount = await Category.countDocuments({parentId: undefined});
    if (!categoryCount) {
      return res.status(500).json({ success: false });
    }
    res.send({ categoryCount: categoryCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubCategoryCount = async (req, res) => {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res.status(500).json({ success: false });
    }
    const subCatList = categories.filter(cat => cat.parentId !== undefined);
    res.send({ categoryCount: subCatList.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const categoryList = await Category.find();
    const category = await Category.findById(req.params.id);
  
    if (!category) {
      return res.status(500).json({ message: "The category with the given ID was not found." });
    }

    const categoryData = createCat(categoryList, category._id, category);
    return res.status(200).json({ categoryData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  let catObj = {
    name: req.body.name,
    images: imagesArr.length > 0 ? imagesArr : undefined,
    color: req.body.color,
  };

  if (req.body.parentId) {
    catObj.parentId = req.body.parentId;
  }

  let category = new Category(catObj);

  try {
    category = await category.save();
    imagesArr = [];
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  const imgUrl = req.query.img;
  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  try {
    const response = await cloudinary.uploader.destroy(imageName);
    if (response) {
      res.status(200).send(response);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found!", success: false });
    }

    for (let img of category.images) {
      const urlArr = img.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      await cloudinary.uploader.destroy(imageName);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Category Deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        images: req.body.images,
        color: req.body.color,
      },
      { new: true }
    );

    if (!category) {
      return res.status(500).json({ message: "Category cannot be updated!", success: false });
    }

    imagesArr = [];
    res.send(category);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createCat = (categories, parentId = null, cat) => {
  const categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }
  categoryList.push({
    _id: cat._id,
    id: cat._id,
    name: cat.name,
    images: cat.images,
    color: cat.color,
    children: category
  });

  return categoryList;
};