const mongoose = require("mongoose");
const { VoucherTypeEnum } = require("../../enum/VoucherEnum");

const voucherSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      maxLength: 255,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: Object.values(VoucherTypeEnum),
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    usage_limit: {
      type: Number,
      min: 0,
    },
    used_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    can_stack: {
      type: Boolean,
      default: false,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Voucher", voucherSchema);


