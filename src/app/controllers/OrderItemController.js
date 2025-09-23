const asyncHandler = require("express-async-handler");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");

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

// Tạo mới order item (validate tồn kho, set total_price, trừ kho atomically)
const createOrderItem = asyncHandler(async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) {
      res.status(400);
      throw new Error("Thiếu product_id hoặc quantity");
    }

    const product = await Product.findById(product_id).exec();
    if (!product || product.is_active === false) {
      res.status(404);
      throw new Error("Sản phẩm không tồn tại hoặc đã ngừng kinh doanh");
    }
    // Atomically decrease stock if sufficient
    const decResult = await Product.findOneAndUpdate(
      { _id: product_id, stock_quantity: { $gte: quantity } },
      { $inc: { stock_quantity: -quantity } },
      { new: true }
    ).exec();
    if (!decResult) {
      res.status(400);
      throw new Error("Số lượng tồn kho không đủ");
    }

    const total_price = Number(product.amount) * Number(quantity);
    let created;
    try {
      const item = new OrderItem({ product_id, quantity, total_price });
      created = await item.save();
    } catch (e) {
      // Compensation: revert stock decrement on failure
      await Product.findByIdAndUpdate(product_id, { $inc: { stock_quantity: quantity } }).exec();
      throw e;
    }

    res.status(201).json(created);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật order item theo ID (cập nhật giá và điều chỉnh kho atomically)
const updateOrderItemById = asyncHandler(async (req, res) => {
  try {
    const { order_item_id } = req.params;
    const existing = await OrderItem.findById(order_item_id).exec();
    if (!existing) {
      res.status(404);
      throw new Error("Không tìm thấy order item để cập nhật");
    }

    const newProductId = req.body.product_id || existing.product_id;
    const newQuantity = req.body.quantity || existing.quantity;

    const newProduct = await Product.findById(newProductId).exec();
    if (!newProduct || newProduct.is_active === false) {
      res.status(404);
      throw new Error("Sản phẩm không tồn tại hoặc đã ngừng kinh doanh");
    }

    // Return old stock first
    await Product.findByIdAndUpdate(existing.product_id, { $inc: { stock_quantity: existing.quantity } }).exec();

    // Try to deduct new stock atomically
    const decNew = await Product.findOneAndUpdate(
      { _id: newProductId, stock_quantity: { $gte: newQuantity } },
      { $inc: { stock_quantity: -newQuantity } },
      { new: true }
    ).exec();
    if (!decNew) {
      // Revert the old stock return to keep state consistent
      await Product.findByIdAndUpdate(existing.product_id, { $inc: { stock_quantity: -existing.quantity } }).exec();
      res.status(400);
      throw new Error("Số lượng tồn kho không đủ");
    }

    const total_price = Number(newProduct.amount) * Number(newQuantity);

    existing.product_id = newProductId;
    existing.quantity = newQuantity;
    existing.total_price = total_price;
    const updated = await existing.save();

    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Xóa order item theo ID (hoàn lại kho atomically)
const deleteOrderItemById = asyncHandler(async (req, res) => {
  try {
    const { order_item_id } = req.params;
    const existing = await OrderItem.findById(order_item_id).exec();
    if (!existing) {
      res.status(404);
      throw new Error("Không tìm thấy order item để xóa");
    }

    await Product.findByIdAndUpdate(existing.product_id, { $inc: { stock_quantity: existing.quantity } }).exec();

    const deleted = await OrderItem.findByIdAndDelete(order_item_id).exec();
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


