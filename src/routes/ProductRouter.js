const express = require("express");
const productRouter = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
} = require("../app/controllers/ProductController");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Product created successfully
 */
productRouter.route("/").get(getAllProducts).post(createProduct);
productRouter
  .route("/:product_id")
  /**
   * @swagger
   * /api/products/{product_id}:
   *   get:
   *     summary: Get product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: product_id
   *         schema:
   *           type: string
   *         required: true
   *   put:
   *     summary: Update product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: product_id
   *         schema:
   *           type: string
   *         required: true
   *   delete:
   *     summary: Delete product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: product_id
   *         schema:
   *           type: string
   *         required: true
   */
  .get(getProductById)
  .put(updateProductById)
  .delete(deleteProductById);

module.exports = productRouter;


