const express = require("express");
const orderRouter = express.Router();

const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderById,
  deleteOrderById,
} = require("../app/controllers/OrderController");

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
 *     responses:
 *       201:
 *         description: Order created
 */
// Orders allow anonymous creation; protect updates/deletes with admin if desired later
orderRouter.route("/").get(getAllOrders).post(createOrder);
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


