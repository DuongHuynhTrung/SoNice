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
   *   delete:
   *     summary: Delete order item by ID
   *     tags: [OrderItems]
   */
  .get(getOrderItemById)
  .put(updateOrderItemById)
  .delete(deleteOrderItemById);

module.exports = orderItemRouter;


