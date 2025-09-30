const express = require("express");
const cartItemRouter = express.Router();

const {
  getAllCartItems,
  getCartItemById,
  createCartItem,
  updateCartItemById,
  deleteCartItemById,
} = require("../app/controllers/CartItemController");

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         product_list:
 *           type: array
 *           items:
 *             type: string
 *         quantity:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CartItemResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
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
 * /api/cart-items:
 *   get:
 *     summary: Get all cart items with pagination
 *     tags: [CartItems]
 *     responses:
 *       200:
 *         description: List of cart items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemResponse'
 *   post:
 *     summary: Create a new cart item
 *     tags: [CartItems]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               product_list:
 *                 type: array
 *                 items:
 *                   type: string
 *               quantity:
 *                 type: number
 *             required:
 *               - user_id
 *               - product_list
 *               - quantity
 *           example:
 *             user_id: "663102f52f9b3a0012ab44dd"
 *             product_list: [
 *               "663103012f9b3a0012ab44de",
 *               "663103112f9b3a0012ab44df"
 *             ]
 *             quantity: 2
 *     responses:
 *       201:
 *         description: Cart item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 */
cartItemRouter.route("/").get(getAllCartItems).post(createCartItem);
cartItemRouter
  .route("/:cart_item_id")
  /**
   * @swagger
   * /api/cart-items/{cart_item_id}:
   *   get:
   *     summary: Get cart item by ID
   *     tags: [CartItems]
   *   put:
   *     summary: Update cart item by ID
   *     tags: [CartItems]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             quantity: 3
   *   delete:
   *     summary: Delete cart item by ID
   *     tags: [CartItems]
   */
  .get(getCartItemById)
  .put(updateCartItemById)
  .delete(deleteCartItemById);

module.exports = cartItemRouter;


