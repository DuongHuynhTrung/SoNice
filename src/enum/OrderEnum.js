const OrderStatusEnum = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  PAYMENT_FAILED: "payment_failed"
};

const OrderPaymentMethodEnum = {
  BANK: "bank",
  COD: "cod"
};

module.exports = {
  OrderStatusEnum,
  OrderPaymentMethodEnum
};


