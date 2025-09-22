const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const { OrderStatusEnum } = require("../../enum/OrderEnum");

// @desc PayOS webhook callback
// @route POST /api/payos/callback
// @access public
const payOsCallBack = asyncHandler(async (req, res) => {
  try {
    const code = req.body.code;
    const { amount, orderCode } = req.body.data;
    
    const order = await Order.findOne({ order_code: String(orderCode) });
    if (order) {
      if (code == "00") {
        // Payment successful for order
        const { emitOrderRequested } = require("./OrderController");
        await emitOrderRequested(order);
      } else {
        // Payment failed for order
        try {
          await Order.findByIdAndUpdate(order._id, { status: OrderStatusEnum.PAYMENT_FAILED }, { new: true });
        } catch (e) {
          console.error("Failed to mark order payment_failed", e);
        }
      }
      return res.status(200).send("Thành công");
    }
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  payOsCallBack,
};
