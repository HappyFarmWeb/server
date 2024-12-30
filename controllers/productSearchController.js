const { Product } = require("../models/products.js");

const getProducts = async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);
    let totalPosts = 0;
    let totalPages = 0;

    if (!query) {
      return res.status(400).json({ msg: "Query is required" });
    }

    // Pagination logic
    if (req.query.page && req.query.perPage) {
      const items = await Product.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
          { catName: { $regex: query, $options: "i" } },
        ],
      })
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage);

      totalPosts = await Product.countDocuments({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
          { catName: { $regex: query, $options: "i" } },
        ],
      });
      totalPages = Math.ceil(totalPosts / perPage);

      return res.status(200).json({
        products: items,
        totalPages,
        page,
      });
    } else {
      const items = await Product.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
          { catName: { $regex: query, $options: "i" } },
        ],
      });

      return res.status(200).json(items);
    }
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { getProducts };
