const express = require("express");
const voucherRouter = express.Router();

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
 */
voucherRouter.route("/").get(getAllVouchers).post(createVoucher);
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
   *   delete:
   *     summary: Delete voucher by ID
   *     tags: [Vouchers]
   */
  .get(getVoucherById)
  .put(updateVoucherById)
  .delete(deleteVoucherById);

module.exports = voucherRouter;


