const mongoose = require("mongoose");
const { OrderStatusEnum, OrderPaymentMethodEnum } = require("../../enum/OrderEnum");
const OrderItem = require("./OrderItem");

const orderSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    order_item_list: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    order_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatusEnum),
      default: OrderStatusEnum.PENDING,
    },
    payment_method: {
      type: String,
      enum: Object.values(OrderPaymentMethodEnum),
      required: true,
    },
    shipping_address: {
      type: String,
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
      maxLength: 255,
    },
    customer_phone: {
      type: String,
      required: true,
      maxLength: 15,
    },
    customer_email: {
      type: String,
    },
    notes: {
      type: String,
      maxLength: 1000,
    },
    voucher_usage_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VoucherUsage",
    },
  },
  {
    timestamps: true,
  }
);

// Helper: calculate total amount from order_item_list
async function calculateTotalAmountFromItems(orderItemIds) {
  if (!orderItemIds || !Array.isArray(orderItemIds) || orderItemIds.length === 0) {
    return 0;
  }
  const items = await OrderItem.find({ _id: { $in: orderItemIds } }).select("total_price").lean();
  return items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
}

// Pre-save: set total_amount based on order_item_list
orderSchema.pre("save", async function (next) {
  try {
    const orderItemIds = this.order_item_list || [];
    this.total_amount = await calculateTotalAmountFromItems(orderItemIds);
    next();
  } catch (err) {
    next(err);
  }
});

// Pre findOneAndUpdate: recompute total_amount when order_item_list changes or always ensure correctness
orderSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() || {};
    // In case $set is used
    const $set = update.$set || {};
    const providedIds = update.order_item_list || $set.order_item_list;

    let orderItemIds = providedIds;
    if (!orderItemIds) {
      const doc = await this.model.findOne(this.getQuery()).select("order_item_list").lean();
      orderItemIds = doc ? doc.order_item_list : [];
    }

    const total = await calculateTotalAmountFromItems(orderItemIds);

    if (update.$set) {
      update.$set.total_amount = total;
    } else {
      update.total_amount = total;
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Order", orderSchema);


