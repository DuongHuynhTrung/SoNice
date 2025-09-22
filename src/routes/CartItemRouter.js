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
 * tags:
 *   name: CartItems
 *   description: Cart item management API
 */

/**
 * @swagger
 * /api/cart-items:
 *   get:
 *     summary: Get all cart items with pagination
 *     tags: [CartItems]
 *   post:
 *     summary: Create a new cart item
 *     tags: [CartItems]
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
   *   delete:
   *     summary: Delete cart item by ID
   *     tags: [CartItems]
   */
  .get(getCartItemById)
  .put(updateCartItemById)
  .delete(deleteCartItemById);

module.exports = cartItemRouter;


