const asyncHandler = require("express-async-handler");
const VoucherUsage = require("../models/VoucherUsage");

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

module.exports = {
  getAllVoucherUsages,
  getVoucherUsageById,
  createVoucherUsage,
  updateVoucherUsageById,
  deleteVoucherUsageById,
};


