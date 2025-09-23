const asyncHandler = require("express-async-handler");
const VoucherUsage = require("../models/VoucherUsage");
const Voucher = require("../models/Voucher");
const { VoucherTypeEnum } = require("../../enum/VoucherEnum");
const OrderItem = require("../models/OrderItem");

// Lấy tất cả voucher usage với phân trang
const getAllVoucherUsages = asyncHandler(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    const total = await VoucherUsage.countDocuments();
    const usages = await VoucherUsage.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: usages,
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

// Lấy voucher usage theo ID
const getVoucherUsageById = asyncHandler(async (req, res) => {
  try {
    const { voucher_usage_id } = req.params;
    const usage = await VoucherUsage.findById(voucher_usage_id).exec();
    if (!usage) {
      res.status(404);
      throw new Error("Không tìm thấy voucher usage với ID đã cho");
    }
    res.status(200).json(usage);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Tạo mới voucher usage
const createVoucherUsage = asyncHandler(async (req, res) => {
  try {
    const usage = new VoucherUsage(req.body);
    const created = await usage.save();
    res.status(201).json(created);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật voucher usage theo ID
const updateVoucherUsageById = asyncHandler(async (req, res) => {
  try {
    const { voucher_usage_id } = req.params;
    const updated = await VoucherUsage.findByIdAndUpdate(voucher_usage_id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) {
      res.status(404);
      throw new Error("Không tìm thấy voucher usage để cập nhật");
    }
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Xóa voucher usage theo ID
const deleteVoucherUsageById = asyncHandler(async (req, res) => {
  try {
    const { voucher_usage_id } = req.params;
    const deleted = await VoucherUsage.findByIdAndDelete(voucher_usage_id).exec();
    if (!deleted) {
      res.status(404);
      throw new Error("Không tìm thấy voucher usage để xóa");
    }
    res.status(200).json({ message: "Đã xóa voucher usage thành công", voucherUsage: deleted });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Validate vouchers against an order_item_list and create VoucherUsage
const validateAndCreateVoucherUsage = asyncHandler(async (req, res) => {
  try {
    const { voucher_list = [], order_item_list = [] } = req.body || {};
    if (!Array.isArray(order_item_list) || order_item_list.length === 0) {
      res.status(400);
      throw new Error("order_item_list bắt buộc và phải có ít nhất 1 mục");
    }

    const items = await OrderItem.find({ _id: { $in: order_item_list } })
      .select("total_price")
      .lean();
    const orderItemTotal = items.reduce((s, it) => s + (Number(it.total_price) || 0), 0);

    if (!Array.isArray(voucher_list) || voucher_list.length === 0) {
      const usage = await new VoucherUsage({ voucher_list: [], discount_amount: 0 }).save();
      return res.status(201).json({
        voucherUsage: usage,
        summary: { total_before: orderItemTotal, discount: 0, total_after: orderItemTotal, applied_vouchers: [] }
      });
    }

    const vouchers = await Voucher.find({ _id: { $in: voucher_list }, is_active: true }).lean();
    const now = new Date();
    let discount = 0;
    const appliedIds = [];
    let hasPercentage = false;
    for (const v of vouchers) {
      if ((v.start_date && now < new Date(v.start_date)) || (v.end_date && now > new Date(v.end_date))) {
        continue;
      }
      if (v.usage_limit !== undefined && v.used_count !== undefined && v.used_count >= v.usage_limit) {
        continue;
      }
      if (!v.can_stack && appliedIds.length > 0) {
        continue;
      }
      if (v.type === VoucherTypeEnum.PERCENTAGE) {
        if (hasPercentage) continue;
        const d = Math.floor((orderItemTotal * Number(v.value)) / 100);
        discount += d;
        hasPercentage = true;
        appliedIds.push(v._id);
      } else if (v.type === VoucherTypeEnum.FIXED_AMOUNT) {
        discount += Number(v.value);
        appliedIds.push(v._id);
      }
    }
    discount = Math.max(0, Math.min(discount, orderItemTotal));

    const usage = await new VoucherUsage({ voucher_list: appliedIds, discount_amount: discount }).save();
    res.status(201).json({
      voucherUsage: usage,
      summary: { total_before: orderItemTotal, discount, total_after: orderItemTotal - discount, applied_vouchers: appliedIds }
    });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  getAllVoucherUsages,
  getVoucherUsageById,
  createVoucherUsage,
  updateVoucherUsageById,
  deleteVoucherUsageById,
  validateAndCreateVoucherUsage,
};


