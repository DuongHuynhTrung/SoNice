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
 * components:
 *   schemas:
 *     Voucher:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [percentage, fixed_amount]
 *         value:
 *           type: number
 *         usage_limit:
 *           type: number
 *         used_count:
 *           type: number
 *         can_stack:
 *           type: boolean
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         is_active:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VoucherResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Voucher'
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
 *   name: Vouchers
 *   description: Voucher management API
 */

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     summary: Get all vouchers with pagination
 *     tags: [Vouchers]
 *     responses:
 *       200:
 *         description: List of vouchers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VoucherResponse'
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
 *     responses:
 *       201:
 *         description: Voucher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Voucher'
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


