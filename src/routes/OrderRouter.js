const express = require("express");
const orderRouter = express.Router();

const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderById,
  deleteOrderById,
} = require("../app/controllers/OrderController");
const { validateToken } = require("../app/middleware/validateTokenHandler");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management API
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders with pagination
 *     tags: [Orders]
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
 *         description: List of orders
 *   post:
 *     summary: Create a new order and return checkoutUrl
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 nullable: true
 *                 description: User ID (nullable for anonymous orders)
 *               order_item_list:
 *                 type: array
 *                 description: List of OrderItem IDs
 *                 items:
 *                   type: string
 *               payment_method:
 *                 type: string
 *                 enum: [bank, cod]
 *               shipping_address:
 *                 type: string
 *               customer_name:
 *                 type: string
 *               customer_phone:
 *                 type: string
 *               customer_email:
 *                 type: string
 *               notes:
 *                 type: string
 *               voucher_usage_id:
 *                 type: string
 *             required:
 *               - order_item_list
 *               - payment_method
 *               - shipping_address
 *               - customer_name
 *               - customer_phone
 *           example:
 *             user_id: "662f1c9b2f9b3a0012ab34cd"
 *             order_item_list: [
 *               "6630d2f52f9b3a0012ab44ef",
 *               "6630d3012f9b3a0012ab44f0"
 *             ]
 *             payment_method: "bank"
 *             shipping_address: "123 Nguyen Trai, Q.5, TP.HCM"
 *             customer_name: "Nguyen Van A"
 *             customer_phone: "0912345678"
 *             customer_email: "a.nguyen@example.com"
 *             notes: "Giao giờ hành chính"
 *             voucher_usage_id: "6630d3aa2f9b3a0012ab4501"
 *     responses:
 *       201:
 *         description: Order created
 */
// Orders allow anonymous creation; protect updates/deletes with admin if desired later
orderRouter.route("/").post(createOrder);

orderRouter.use(validateToken);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders with pagination
 *     tags: [Orders]
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
 *         description: List of orders
 */
orderRouter.route("/").get(getAllOrders)
orderRouter
  .route("/:order_id")
  /**
   * @swagger
   * /api/orders/{order_id}:
   *   get:
   *     summary: Get order by ID
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: order_id
   *         schema:
   *           type: string
   *         required: true
   *   put:
   *     summary: Update order by ID
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: order_id
   *         schema:
   *           type: string
   *         required: true
   *   delete:
   *     summary: Delete order by ID
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: order_id
   *         schema:
   *           type: string
   *         required: true
   */
  .get(getOrderById)
  .put(updateOrderById)
  .delete(deleteOrderById);

module.exports = orderRouter;


