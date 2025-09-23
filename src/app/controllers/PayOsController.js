const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const { OrderStatusEnum } = require("../../enum/OrderEnum");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");

// @desc PayOS webhook callback
// @route POST /api/payos/callback
// @access public
const payOsCallBack = asyncHandler(async (req, res) => {
  try {
    const code = req.body?.code;
    const orderCode = req.body?.data?.orderCode;
    const message = req.body?.desc || req.body?.message || "";

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
        // Prevent double-restoration if webhook retries
        const current = await Order.findById(order._id).select("status order_item_list notes").lean();
        if (current && current.status !== OrderStatusEnum.PAYMENT_FAILED) {
          // Restore product stock based on order items
          const items = await OrderItem.find({ _id: { $in: current.order_item_list || [] } })
            .select("product_id quantity")
            .lean();
          if (items && items.length > 0) {
            for (const it of items) {
              if (it.product_id && typeof it.quantity === "number") {
                await Product.findByIdAndUpdate(it.product_id, { $inc: { stock_quantity: it.quantity } });
              }
            }
          }

          const appendedNotes = current.notes
            ? `${current.notes}\n[PayOS] Thanh toán thất bại: ${message}`
            : `[PayOS] Thanh toán thất bại: ${message}`;

          await Order.findByIdAndUpdate(
            order._id,
            { status: OrderStatusEnum.PAYMENT_FAILED, notes: appendedNotes },
            { new: true }
          );
        }
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
