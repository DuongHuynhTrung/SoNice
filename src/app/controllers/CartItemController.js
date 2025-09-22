const asyncHandler = require("express-async-handler");
const CartItem = require("../models/CartItem");

// Lấy tất cả cart item với phân trang
const getAllCartItems = asyncHandler(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    const total = await CartItem.countDocuments();
    const items = await CartItem.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: items,
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

// Lấy cart item theo ID
const getCartItemById = asyncHandler(async (req, res) => {
  try {
    const { cart_item_id } = req.params;
    const item = await CartItem.findById(cart_item_id).exec();
    if (!item) {
      res.status(404);
      throw new Error("Không tìm thấy cart item với ID đã cho");
    }
    res.status(200).json(item);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Tạo mới cart item
const createCartItem = asyncHandler(async (req, res) => {
  try {
    const item = new CartItem(req.body);
    const created = await item.save();
    res.status(201).json(created);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật cart item theo ID
const updateCartItemById = asyncHandler(async (req, res) => {
  try {
    const { cart_item_id } = req.params;
    const updated = await CartItem.findByIdAndUpdate(cart_item_id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) {
      res.status(404);
      throw new Error("Không tìm thấy cart item để cập nhật");
    }
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Xóa cart item theo ID
const deleteCartItemById = asyncHandler(async (req, res) => {
  try {
    const { cart_item_id } = req.params;
    const deleted = await CartItem.findByIdAndDelete(cart_item_id).exec();
    if (!deleted) {
      res.status(404);
      throw new Error("Không tìm thấy cart item để xóa");
    }
    res.status(200).json({ message: "Đã xóa cart item thành công", cartItem: deleted });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  getAllCartItems,
  getCartItemById,
  createCartItem,
  updateCartItemById,
  deleteCartItemById,
};


