const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const { OrderStatusEnum } = require("../../enum/OrderEnum");

// @desc PayOS webhook callback
// @route POST /api/payos/callback
// @access public
const payOsCallBack = asyncHandler(async (req, res) => {
  try {
    const code = req.body?.code;
    const orderCode = req.body?.data?.orderCode;

    // If missing payload (e.g., PayOS verify ping), respond 200 to avoid webhook verification failure
    if (!orderCode) {
      return res.status(200).send("OK");
    }

    const order = await Order.findOne({ order_code: String(orderCode) });
    if (!order) {
      // Avoid 404 during verification or if order not found; just acknowledge
      return res.status(200).send("OK");
    }

    if (code == "00") {
      // Payment successful for order
      const { emitOrderRequested } = require("./OrderController");
      await emitOrderRequested(order);
    } else {
      // Payment failed for order
      try {
        await Order.findByIdAndUpdate(
          order._id,
          { status: OrderStatusEnum.PAYMENT_FAILED },
          { new: true }
        );
      } catch (e) {
        console.error("Failed to mark order payment_failed", e);
      }
    }

    return res.status(200).send("Thành công");
  } catch (error) {
    // Always acknowledge to prevent PayOS from flagging webhook as down
    return res.status(200).send("OK");
  }
});

module.exports = {
  payOsCallBack,
};
