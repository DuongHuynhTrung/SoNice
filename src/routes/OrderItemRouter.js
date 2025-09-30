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
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product_id:
 *           type: string
 *         quantity:
 *           type: number
 *         total_price:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrderItemResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         pagination:
 *           type: object
 *           properties:
 *             pageIndex:
 *               type: integer
 *             pageSize:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalResults:
 *               type: integer
 */

/**
 * @swagger
 * /api/order-items:
 *   get:
 *     summary: Get all order items with pagination
 *     tags: [OrderItems]
 *     responses:
 *       200:
 *         description: List of order items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderItemResponse'
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
 *     responses:
 *       201:
 *         description: Order item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderItem'
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


