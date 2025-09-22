const asyncHandler = require("express-async-handler");
const Voucher = require("../models/Voucher");
const { UserRoleEnum } = require("../../enum/UserEnum");

// Lấy tất cả voucher với phân trang
const getAllVouchers = asyncHandler(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    const total = await Voucher.countDocuments();
    const vouchers = await Voucher.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: vouchers,
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

// Lấy voucher theo ID
const getVoucherById = asyncHandler(async (req, res) => {
  try {
    const { voucher_id } = req.params;
    const voucher = await Voucher.findById(voucher_id).exec();
    if (!voucher) {
      res.status(404);
      throw new Error("Không tìm thấy voucher với ID đã cho");
    }
    res.status(200).json(voucher);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Tạo mới voucher (Admin-only)
const createVoucher = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role_name !== UserRoleEnum.ADMIN) {
      res.status(403);
      throw new Error("Chi có Admin có quyền thực hiện chức năng này");
    }

    const {
      code,
      name,
      description,
      type,
      value,
      usage_limit,
      can_stack,
      start_date,
      end_date,
      is_active,
    } = req.body;

    if (!code || !name || !type || value === undefined) {
      res.status(400);
      throw new Error("Vui lòng cung cấp code, name, type và value");
    }

    const voucher = new Voucher({
      code,
      name,
      description,
      type,
      value,
      usage_limit,
      can_stack,
      start_date,
      end_date,
      is_active,
    });

    const created = await voucher.save();
    res.status(201).json(created);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật voucher theo ID
const updateVoucherById = asyncHandler(async (req, res) => {
  try {
    const { voucher_id } = req.params;

    const updateData = {};
    [
      "code",
      "name",
      "description",
      "type",
      "value",
      "usage_limit",
      "used_count",
      "can_stack",
      "start_date",
      "end_date",
      "is_active",
    ].forEach((key) => {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    });

    const updated = await Voucher.findByIdAndUpdate(voucher_id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) {
      res.status(404);
      throw new Error("Không tìm thấy voucher để cập nhật");
    }
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Xóa voucher theo ID
const deleteVoucherById = asyncHandler(async (req, res) => {
  try {
    const { voucher_id } = req.params;
    const deleted = await Voucher.findByIdAndDelete(voucher_id).exec();
    if (!deleted) {
      res.status(404);
      throw new Error("Không tìm thấy voucher để xóa");
    }
    res.status(200).json({ message: "Đã xóa voucher thành công", voucher: deleted });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucherById,
  deleteVoucherById,
};


