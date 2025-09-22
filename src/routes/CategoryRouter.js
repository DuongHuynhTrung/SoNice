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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *             required:
 *               - name
 *           example:
 *             name: "Trang sức"
 *             is_active: true
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             name: "Phụ kiện"
 *             is_active: false
   *   delete:
   *     summary: Delete category by ID (Admin only)
   *     tags: [Categories]
   */
  .get(getCategoryById)
  .put(validateTokenAdmin, updateCategoryById)
  .delete(validateTokenAdmin, deleteCategoryById);

module.exports = categoryRouter;


