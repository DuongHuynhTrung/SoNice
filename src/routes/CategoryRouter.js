const express = require("express");
const categoryRouter = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
} = require("../app/controllers/CategoryController");

const { validateTokenAdmin } = require("../app/middleware/validateTokenHandler");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management API
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories with pagination
 *     tags: [Categories]
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 */
categoryRouter.route("/").get(getAllCategories).post(validateTokenAdmin, createCategory);
categoryRouter
  .route("/:category_id")
  /**
   * @swagger
   * /api/categories/{category_id}:
   *   get:
   *     summary: Get category by ID
   *     tags: [Categories]
   *   put:
   *     summary: Update category by ID (Admin only)
   *     tags: [Categories]
   *   delete:
   *     summary: Delete category by ID (Admin only)
   *     tags: [Categories]
   */
  .get(getCategoryById)
  .put(validateTokenAdmin, updateCategoryById)
  .delete(validateTokenAdmin, deleteCategoryById);

module.exports = categoryRouter;


