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
 *             properties:
 *               category_id:
 *                 type: string
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               stock_quantity:
 *                 type: number
 *               img_url_list:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_active:
 *                 type: boolean
 *             required:
 *               - category_id
 *               - name
 *               - amount
 *           example:
 *             category_id: "6630d2f52f9b3a0012ab44ef"
 *             name: "Vòng tay handmade"
 *             amount: 199000
 *             description: "Vòng tay đá tự nhiên"
 *             stock_quantity: 50
 *             img_url_list: [
 *               "https://cdn.example.com/img1.jpg",
 *               "https://cdn.example.com/img2.jpg"
 *             ]
 *             is_active: true
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
  *     requestBody:
  *       required: false
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *           example:
  *             name: "Vòng tay handmade bản mới"
  *             amount: 219000
  *             stock_quantity: 40
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


