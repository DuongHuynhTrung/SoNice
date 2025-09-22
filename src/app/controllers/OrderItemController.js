const asyncHandler = require("express-async-handler");
const OrderItem = require("../models/OrderItem");

// Lấy tất cả order item với phân trang
const getAllOrderItems = asyncHandler(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    const total = await OrderItem.countDocuments();
    const items = await OrderItem.find()
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

// Lấy order item theo ID
const getOrderItemById = asyncHandler(async (req, res) => {
  try {
    const { order_item_id } = req.params;
    const item = await OrderItem.findById(order_item_id).exec();
    if (!item) {
      res.status(404);
      throw new Error("Không tìm thấy order item với ID đã cho");
    }
    res.status(200).json(item);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Tạo mới order item
const createOrderItem = asyncHandler(async (req, res) => {
  try {
    const item = new OrderItem(req.body);
    const created = await item.save();
    res.status(201).json(created);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật order item theo ID
const updateOrderItemById = asyncHandler(async (req, res) => {
  try {
    const { order_item_id } = req.params;
    const updated = await OrderItem.findByIdAndUpdate(order_item_id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) {
      res.status(404);
      throw new Error("Không tìm thấy order item để cập nhật");
    }
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Xóa order item theo ID
const deleteOrderItemById = asyncHandler(async (req, res) => {
  try {
    const { order_item_id } = req.params;
    const deleted = await OrderItem.findByIdAndDelete(order_item_id).exec();
    if (!deleted) {
      res.status(404);
      throw new Error("Không tìm thấy order item để xóa");
    }
    res.status(200).json({ message: "Đã xóa order item thành công", orderItem: deleted });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  getAllOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItemById,
  deleteOrderItemById,
};


