const mongoose = require("mongoose");

const voucherUsageSchema = mongoose.Schema(
  {
    voucher_list: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voucher",
        required: true,
      },
    ],
    discount_amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VoucherUsage", voucherUsageSchema);


