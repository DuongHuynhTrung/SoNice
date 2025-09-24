const express = require("express");
const voucherRouter = express.Router();
const { validateTokenAdmin } = require("../app/middleware/validateTokenHandler");

const {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucherById,
  deleteVoucherById,
} = require("../app/controllers/VoucherController");

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Voucher management API
 */

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     summary: Get all vouchers with pagination
 *     tags: [Vouchers]
 *   post:
 *     summary: Create a new voucher (Admin only)
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed_amount]
 *               value:
 *                 type: number
 *               usage_limit:
 *                 type: number
 *               can_stack:
 *                 type: boolean
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               is_active:
 *                 type: boolean
 *             required:
 *               - code
 *               - name
 *               - type
 *               - value
 *           example:
 *             code: "SONICE10"
 *             name: "Giảm 10%"
 *             description: "Áp dụng cho đơn hàng trên 200k"
 *             type: "percentage"
 *             value: 10
 *             usage_limit: 100
 *             can_stack: false
 *             start_date: "2025-01-01T00:00:00.000Z"
 *             end_date: "2025-02-01T00:00:00.000Z"
 *             is_active: true
 */
/**
 * @swagger
 * security:
 *   - bearerAuth: []
 */
voucherRouter.route("/").get(getAllVouchers).post(validateTokenAdmin, createVoucher);
voucherRouter
  .route("/:voucher_id")
  /**
   * @swagger
   * /api/vouchers/{voucher_id}:
   *   get:
   *     summary: Get voucher by ID
   *     tags: [Vouchers]
   *   put:
   *     summary: Update voucher by ID
   *     tags: [Vouchers]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             description: "Áp dụng cho mọi đơn hàng"
 *             value: 50000
   *   delete:
   *     summary: Delete voucher by ID
   *     tags: [Vouchers]
   */
  .get(getVoucherById)
  .put(validateTokenAdmin, updateVoucherById)
  .delete(validateTokenAdmin, deleteVoucherById);

module.exports = voucherRouter;


