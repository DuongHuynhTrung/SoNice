const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");
const { UserRoleEnum } = require("../../enum/UserEnum");

// Lấy tất cả category với phân trang
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    const total = await Category.countDocuments();
    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: categories,
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

// Lấy category theo ID
const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const { category_id } = req.params;
    const category = await Category.findById(category_id).exec();
    if (!category) {
      res.status(404);
      throw new Error("Không tìm thấy category với ID đã cho");
    }
    res.status(200).json(category);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Tạo mới category (Admin-only)
const createCategory = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role_name !== UserRoleEnum.ADMIN) {
      res.status(403);
      throw new Error("Chi có Admin có quyền thực hiện chức năng này");
    }
    const { name, is_active } = req.body;
    if (!name) {
      res.status(400);
      throw new Error("Vui lòng cung cấp tên danh mục");
    }
    const category = new Category({ name, is_active });
    const created = await category.save();
    res.status(201).json(created);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật category (Admin-only)
const updateCategoryById = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role_name !== UserRoleEnum.ADMIN) {
      res.status(403);
      throw new Error("Chi có Admin có quyền thực hiện chức năng này");
    }
    const { category_id } = req.params;
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;

    const updated = await Category.findByIdAndUpdate(category_id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
    if (!updated) {
      res.status(404);
      throw new Error("Không tìm thấy category để cập nhật");
    }
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Xóa category (Admin-only)
const deleteCategoryById = asyncHandler(async (req, res) => {
  try {
    if (!req.user || req.user.role_name !== UserRoleEnum.ADMIN) {
      res.status(403);
      throw new Error("Chi có Admin có quyền thực hiện chức năng này");
    }
    const { category_id } = req.params;
    const deleted = await Category.findByIdAndDelete(category_id).exec();
    if (!deleted) {
      res.status(404);
      throw new Error("Không tìm thấy category để xóa");
    }
    res.status(200).json({ message: "Đã xóa category thành công", category: deleted });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};


