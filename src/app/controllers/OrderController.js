const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Voucher = require("../models/Voucher");
const VoucherUsage = require("../models/VoucherUsage");
const { VoucherTypeEnum } = require("../../enum/VoucherEnum");
const User = require("../models/User");
const { UserRoleEnum } = require("../../enum/UserEnum");
const NotificationTypeEnum = require("../../enum/NotificationEnum");
const { createAndEmitNotification } = require("./NotificationController");
const PayOS = require("@payos/node");
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUMS_KEY
);

// Lấy tất cả order với phân trang (Admin xem tất cả, user chỉ xem của mình)
const getAllOrders = asyncHandler(async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    if (!req.user) {
      res.status(401);
      throw new Error("Missing Access Token!");
    }

    const role = req.user.role_name || req.user.roleName;
    const isAdmin = role === UserRoleEnum.ADMIN;

    const filter = isAdmin ? {} : { user_id: req.user.id };

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      data: orders,
      pagination: {
        pageIndex: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
    });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Lấy order theo ID (Admin xem bất kỳ, user chỉ xem order của mình)
const getOrderById = asyncHandler(async (req, res) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error("Missing Access Token!");
    }
    const { order_id } = req.params;
    const order = await Order.findById(order_id).exec();
    if (!order) {
      res.status(404);
      throw new Error("Không tìm thấy order với ID đã cho");
    }
    const role = req.user.role_name || req.user.roleName;
    const isAdmin = role === UserRoleEnum.ADMIN;
    if (!isAdmin) {
      if (!order.user_id || order.user_id.toString() !== req.user.id) {
        res.status(403);
        throw new Error("Bạn không có quyền xem đơn hàng này");
      }
    }
    res.status(200).json(order);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Helper: validate voucher list and compute discount amount
async function validateVouchersAndComputeDiscount(voucherIds, orderItemTotal) {
  if (!voucherIds || voucherIds.length === 0) return { discount: 0, appliedIds: [] };
  const vouchers = await Voucher.find({ _id: { $in: voucherIds }, is_active: true }).lean();
  const now = new Date();
  let discount = 0;
  const appliedIds = [];
  let hasPercentage = false;
  for (const v of vouchers) {
    if ((v.start_date && now < new Date(v.start_date)) || (v.end_date && now > new Date(v.end_date))) {
      continue;
    }
    if (v.usage_limit !== undefined && v.used_count !== undefined && v.used_count >= v.usage_limit) {
      continue;
    }
    if (!v.can_stack && appliedIds.length > 0) {
      // If non-stackable and already applied something, skip
      continue;
    }
    if (v.type === VoucherTypeEnum.PERCENTAGE) {
      // avoid multiple percentage stacking
      if (hasPercentage) continue;
      const d = Math.floor((orderItemTotal * Number(v.value)) / 100);
      discount += d;
      hasPercentage = true;
      appliedIds.push(v._id);
    } else if (v.type === VoucherTypeEnum.FIXED_AMOUNT) {
      discount += Number(v.value);
      appliedIds.push(v._id);
    }
  }
  discount = Math.max(0, Math.min(discount, orderItemTotal));
  return { discount, appliedIds };
}

// Tạo mới order
const createOrder = asyncHandler(async (req, res) => {
  try {
    // Parse and validate input
    const {
      user_id = null,
      order_item_list = [],
      payment_method,
      shipping_address,
      customer_name,
      customer_phone,
      customer_email,
      notes,
      order_code,
      voucher_usage_id,
      voucher_list = [],
    } = req.body || {};

    if (!Array.isArray(order_item_list) || order_item_list.length === 0) {
      res.status(400);
      throw new Error("order_item_list bắt buộc và phải có ít nhất 1 mục");
    }
    if (!payment_method) {
      res.status(400);
      throw new Error("payment_method là bắt buộc");
    }
    if (!shipping_address || !customer_name || !customer_phone) {
      res.status(400);
      throw new Error("Thiếu shipping_address, customer_name hoặc customer_phone");
    }

    // Compute order items total (before discount)
    const OrderItem = require("../models/OrderItem");
    const items = await OrderItem.find({ _id: { $in: order_item_list } })
      .select("total_price")
      .lean();
    const orderItemTotal = items.reduce((s, it) => s + (Number(it.total_price) || 0), 0);

    // Prepare voucher usage if provided
    let ensuredVoucherUsageId = voucher_usage_id || null;
    if (voucher_list && voucher_list.length > 0 && !ensuredVoucherUsageId) {
      const { discount, appliedIds } = await validateVouchersAndComputeDiscount(voucher_list, orderItemTotal);
      const usageDoc = await new VoucherUsage({ voucher_list: appliedIds, discount_amount: discount }).save();
      ensuredVoucherUsageId = usageDoc._id;
    }
    if (ensuredVoucherUsageId) {
      const usage = await VoucherUsage.findById(ensuredVoucherUsageId).lean();
      if (!usage) {
        res.status(400);
        throw new Error("voucher_usage_id không hợp lệ");
      }
    }

    // Create order
    const payload = {
      user_id,
      order_item_list,
      order_code: order_code || `${Date.now()}`,
      payment_method,
      shipping_address,
      customer_name,
      customer_phone,
      customer_email,
      notes,
      voucher_usage_id: ensuredVoucherUsageId,
    };

    const order = new Order(payload);
    const created = await order.save();

    // Create PayOS payment link
    let description = `Thanh toán ${created.order_code}`;
    if (description.length > 25) {
      description = description.slice(0, 25);
    }
    const requestData = {
      orderCode: Number(created.order_code) || Date.now(),
      amount: created.total_amount,
      description,
      cancelUrl: `${process.env.CLIENT_URL}/orders`,
      returnUrl: `${process.env.CLIENT_URL}/orders`,
    };
    const paymentLinkData = await payos.createPaymentLink(requestData);

    res.status(201).json({
      order: created,
      checkoutUrl: paymentLinkData.checkoutUrl
    });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Cập nhật order theo ID
const updateOrderById = asyncHandler(async (req, res) => {
  try {
    const { order_id } = req.params;
    const prevOrder = await Order.findById(order_id).exec();
    if (!prevOrder) {
      res.status(404);
      throw new Error("Không tìm thấy order để cập nhật");
    }

    const updated = await Order.findByIdAndUpdate(order_id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    
    // Emit notification on status change
    if (updated && req.body.status && req.body.status !== prevOrder.status) {
      try {
        if (updated.user_id) {
          const user = await User.findById(updated.user_id);
          if (user) {
            let type = null;
            let content = null;
            switch (req.body.status) {
              case "confirmed":
                type = NotificationTypeEnum.ORDER_CONFIRMED;
                content = `Đơn hàng mã ${updated.order_code} đã được Sò Nice xác nhận.`;
                // Increase voucher used_count if any
                if (updated.voucher_usage_id) {
                  const usage = await VoucherUsage.findById(updated.voucher_usage_id).lean();
                  if (usage && Array.isArray(usage.voucher_list) && usage.voucher_list.length > 0) {
                    await Voucher.updateMany(
                      { _id: { $in: usage.voucher_list } },
                      { $inc: { used_count: 1 } }
                    );
                  }
                }
                break;
              case "processing":
                type = NotificationTypeEnum.ORDER_PROCESSING;
                content = `Đơn hàng mã ${updated.order_code} đang được Sò Nice xử lý.`;
                break;
              case "shipping":
                type = NotificationTypeEnum.ORDER_SHIPPING;
                content = `Đơn hàng mã ${updated.order_code} đang được ship tới.`;
                break;
              case "delivered":
                type = NotificationTypeEnum.ORDER_DELIVERED;
                content = `Đơn hàng mã ${updated.order_code} đã được chuyển giao thành công.`;
                break;
            }
            if (type && content) {
              await createAndEmitNotification(user._id, type, content);
            }
          }
        }
      } catch (notifyErr) {
        console.error("Failed to emit order status notification", notifyErr);
      }
    }
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

// Helper to emit order requested notification (call from webhook after successful payment)
const emitOrderRequested = async (order) => {
  try {
    const content = `Có Khách hàng đã đặt đơn hàng mã ${order.order_code}.`;
    const admins = await User.find({ role_name: UserRoleEnum.ADMIN }).select("_id");
    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await createAndEmitNotification(
          admin._id,
          NotificationTypeEnum.ORDER_REQUESTED,
          content
        );
      }
    }
  } catch (e) {
    console.error("Failed to emit order requested notification", e);
  }
};

// Xóa order theo ID
const deleteOrderById = asyncHandler(async (req, res) => {
  try {
    const { order_id } = req.params;
    const deleted = await Order.findByIdAndDelete(order_id).exec();
    if (!deleted) {
      res.status(404);
      throw new Error("Không tìm thấy order để xóa");
    }
    res.status(200).json({ message: "Đã xóa order thành công", order: deleted });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderById,
  deleteOrderById,
  emitOrderRequested
};


