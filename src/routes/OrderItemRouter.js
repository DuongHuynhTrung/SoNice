const express = require("express");
const orderItemRouter = express.Router();

const {
  getAllOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItemById,
  deleteOrderItemById,
} = require("../app/controllers/OrderItemController");

/**
 * @swagger
 * tags:
 *   name: OrderItems
 *   description: Order item management API
 */

/**
 * @swagger
 * /api/order-items:
 *   get:
 *     summary: Get all order items with pagination
 *     tags: [OrderItems]
 *   post:
 *     summary: Create a new order item
 *     tags: [OrderItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *               total_price:
 *                 type: number
 *             required:
 *               - product_id
 *               - quantity
 *               - total_price
 *           example:
 *             product_id: "6630f2f52f9b3a0012ab44cc"
 *             quantity: 2
 *             total_price: 398000
 */
orderItemRouter.route("/").get(getAllOrderItems).post(createOrderItem);
orderItemRouter
  .route("/:order_item_id")
  /**
   * @swagger
   * /api/order-items/{order_item_id}:
   *   get:
   *     summary: Get order item by ID
   *     tags: [OrderItems]
   *   put:
   *     summary: Update order item by ID
   *     tags: [OrderItems]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             quantity: 3
 *             total_price: 597000
   *   delete:
   *     summary: Delete order item by ID
   *     tags: [OrderItems]
   */
  .get(getOrderItemById)
  .put(updateOrderItemById)
  .delete(deleteOrderItemById);

module.exports = orderItemRouter;


