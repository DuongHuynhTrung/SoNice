const express = require("express");
const voucherUsageRouter = express.Router();

const {
  getAllVoucherUsages,
  getVoucherUsageById,
  createVoucherUsage,
  updateVoucherUsageById,
  deleteVoucherUsageById,
} = require("../app/controllers/VoucherUsageController");

/**
 * @swagger
 * components:
 *   schemas:
 *     VoucherUsage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         voucher_list:
 *           type: array
 *           items:
 *             type: string
 *         discount_amount:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VoucherUsageResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VoucherUsage'
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
 * tags:
 *   name: VoucherUsages
 *   description: Voucher usage management API
 */

/**
 * @swagger
 * /api/voucher-usages:
 *   get:
 *     summary: Get all voucher usages with pagination
 *     tags: [VoucherUsages]
 *     responses:
 *       200:
 *         description: List of voucher usages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VoucherUsageResponse'
 *   post:
 *     summary: Create a new voucher usage
 *     tags: [VoucherUsages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voucher_list:
 *                 type: array
 *                 items:
 *                   type: string
 *               discount_amount:
 *                 type: number
 *             required:
 *               - voucher_list
 *               - discount_amount
 *           example:
 *             voucher_list: [
 *               "6630e2f52f9b3a0012ab44aa",
 *               "6630e3012f9b3a0012ab44bb"
 *             ]
 *             discount_amount: 30000
 *     responses:
 *       201:
 *         description: Voucher usage created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VoucherUsage'
 */
voucherUsageRouter.route("/").get(getAllVoucherUsages).post(createVoucherUsage);
voucherUsageRouter
  .route("/:voucher_usage_id")
  /**
   * @swagger
   * /api/voucher-usages/{voucher_usage_id}:
   *   get:
   *     summary: Get voucher usage by ID
   *     tags: [VoucherUsages]
   *   put:
   *     summary: Update voucher usage by ID
   *     tags: [VoucherUsages]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             discount_amount: 45000
   *   delete:
   *     summary: Delete voucher usage by ID
   *     tags: [VoucherUsages]
   */
  .get(getVoucherUsageById)
  .put(updateVoucherUsageById)
  .delete(deleteVoucherUsageById);

module.exports = voucherUsageRouter;


