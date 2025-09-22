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
 *   post:
 *     summary: Create a new voucher usage
 *     tags: [VoucherUsages]
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
   *   delete:
   *     summary: Delete voucher usage by ID
   *     tags: [VoucherUsages]
   */
  .get(getVoucherUsageById)
  .put(updateVoucherUsageById)
  .delete(deleteVoucherUsageById);

module.exports = voucherUsageRouter;


