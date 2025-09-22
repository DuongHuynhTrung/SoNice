const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const User = require("../models/User");
const { UserRoleEnum } = require("../../enum/UserEnum");
const NotificationTypeEnum = require("../../enum/NotificationEnum");
const { createAndEmitNotification } = require("./NotificationController");
const PayOS = require("@payos/node");
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUMS_KEY
);

// Lấy tất cả order với phân trang
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: orders,
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

// Lấy order theo ID
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const { order_id } = req.params;
    const order = await Order.findById(order_id).exec();
    if (!order) {
      res.status(404);
      throw new Error("Không tìm thấy order với ID đã cho");
    }
    res.status(200).json(order);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Tạo mới order
const createOrder = asyncHandler(async (req, res) => {
  try {
    // Allow anonymous orders: user_id can be null
    const payload = { ...req.body };
    if (!payload.order_code) {
      payload.order_code = `${Date.now()}`;
    }
    const order = new Order(payload);
    const created = await order.save();

    // Create PayOS payment link
    let description = `Thanh toán ${created.order_code}`;
    if (description.length > 25) {
      description = description.slice(0, 25);
    }
    const requestData = {
      orderCode: Number(created.order_code) || Date.now(),
      amount: created.total_amount,
      description,
      cancelUrl: `${process.env.CLIENT_URL}/order-history`,
      returnUrl: `${process.env.CLIENT_URL}/order-history`,
    };
    const paymentLinkData = await payos.createPaymentLink(requestData);

    res.status(201).json({ order: created, checkoutUrl: paymentLinkData.checkoutUrl });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật order theo ID
const updateOrderById = asyncHandler(async (req, res) => {
  try {
    const { order_id } = req.params;
    const prevOrder = await Order.findById(order_id).exec();
    if (!prevOrder) {
      res.status(404);
      throw new Error("Không tìm thấy order để cập nhật");
    }

    const updated = await Order.findByIdAndUpdate(order_id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    
    // Emit notification on status change
    if (updated && req.body.status && req.body.status !== prevOrder.status) {
      try {
        if (updated.user_id) {
          const user = await User.findById(updated.user_id);
          if (user) {
            let type = null;
            let content = null;
            switch (req.body.status) {
              case "confirmed":
                type = NotificationTypeEnum.ORDER_CONFIRMED;
                content = `Đơn hàng mã ${updated.order_code} đã được Sò Nice xác nhận.`;
                break;
              case "processing":
                type = NotificationTypeEnum.ORDER_PROCESSING;
                content = `Đơn hàng mã ${updated.order_code} đang được Sò Nice xử lý.`;
                break;
              case "shipping":
                type = NotificationTypeEnum.ORDER_SHIPPING;
                content = `Đơn hàng mã ${updated.order_code} đang được ship tới.`;
                break;
              case "delivered":
                type = NotificationTypeEnum.ORDER_DELIVERED;
                content = `Đơn hàng mã ${updated.order_code} đã được chuyển giao thành công.`;
                break;
            }
            if (type && content) {
              await createAndEmitNotification(user._id, type, content);
            }
          }
        }
      } catch (notifyErr) {
        console.error("Failed to emit order status notification", notifyErr);
      }
    }
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Helper to emit order requested notification (call from webhook after successful payment)
const emitOrderRequested = async (order) => {
  try {
    const content = `Có Khách hàng đã đặt đơn hàng mã ${order.order_code}.`;
    const admins = await User.find({ role_name: UserRoleEnum.ADMIN }).select("_id");
    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await createAndEmitNotification(
          admin._id,
          NotificationTypeEnum.ORDER_REQUESTED,
          content
        );
      }
    }
  } catch (e) {
    console.error("Failed to emit order requested notification", e);
  }
};

// Xóa order theo ID
const deleteOrderById = asyncHandler(async (req, res) => {
  try {
    const { order_id } = req.params;
    const deleted = await Order.findByIdAndDelete(order_id).exec();
    if (!deleted) {
      res.status(404);
      throw new Error("Không tìm thấy order để xóa");
    }
    res.status(200).json({ message: "Đã xóa order thành công", order: deleted });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderById,
  deleteOrderById,
  emitOrderRequested
};


