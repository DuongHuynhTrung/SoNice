const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// Lấy tất cả product với phân trang, filter theo category, search theo tên, filter theo range giá min-max
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    // Lấy các tham số filter
    const { category_id, search, min_price, max_price } = req.query;

    // Xây dựng query filter
    let filter = {};

    // Filter theo category
    if (category_id) {
      filter.category_id = category_id;
    }

    // Search theo tên (không phân biệt hoa thường)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Filter theo range giá
    if (min_price !== undefined || max_price !== undefined) {
      filter.price = {};
      if (min_price !== undefined) {
        filter.price.$gte = parseFloat(min_price);
      }
      if (max_price !== undefined) {
        filter.price.$lte = parseFloat(max_price);
      }
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category_id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: products,
      pagination: {
        pageIndex: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
    });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Lấy product theo ID
const getProductById = asyncHandler(async (req, res) => {
  try {
    const { product_id } = req.params;
    const product = await Product.findById(product_id).populate("category_id").exec();
    if (!product) {
      res.status(404);
      throw new Error("Không tìm thấy product với ID đã cho");
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Tạo mới product
const createProduct = asyncHandler(async (req, res) => {
  try {
    const product = new Product(req.body);
    const created = await product.save();
    res.status(201).json(created);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật product theo ID
const updateProductById = asyncHandler(async (req, res) => {
  try {
    const { product_id } = req.params;
    const updated = await Product.findByIdAndUpdate(product_id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) {
      res.status(404);
      throw new Error("Không tìm thấy product để cập nhật");
    }
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Xóa product theo ID
const deleteProductById = asyncHandler(async (req, res) => {
  try {
    const { product_id } = req.params;
    const deleted = await Product.findByIdAndDelete(product_id).exec();
    if (!deleted) {
      res.status(404);
      throw new Error("Không tìm thấy product để xóa");
    }
    res.status(200).json({ message: "Đã xóa product thành công", product: deleted });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};


