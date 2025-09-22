const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const { UserRoleEnum } = require("../../enum/UserEnum");
const Order = require("../models/Order");

const statisticSales = asyncHandler(async (req, res) => {
  try {
    const now = new Date();

    let startOfPeriod = new Date(now);
    startOfPeriod.setHours(0, 0, 0, 0);
    let endOfPeriod = new Date(now);
    endOfPeriod.setHours(23, 59, 59, 999);

    let startOfPreviousPeriod = new Date(startOfPeriod);
    startOfPreviousPeriod.setDate(startOfPreviousPeriod.getDate() - 1);
    let endOfPreviousPeriod = new Date(endOfPeriod);
    endOfPreviousPeriod.setDate(endOfPreviousPeriod.getDate() - 1);

    const ordersCurrent = await Order.find({
      createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
    }).select("total_amount");
    let totalIncomeCurrent = ordersCurrent.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

    const ordersPrevious = await Order.find({
      createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod },
    }).select("total_amount");
    let totalIncomePrevious = ordersPrevious.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

    const incomeDifference = totalIncomeCurrent - totalIncomePrevious;

    const totalNewCustomerCurrent = await User.find({
      createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
      role_name: UserRoleEnum.CUSTOMER,
    });

    const totalNewCustomerPrevious = await User.find({
      createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod },
      role_name: UserRoleEnum.CUSTOMER,
    });

    const newCustomerDifference =
      totalNewCustomerCurrent.length - totalNewCustomerPrevious.length;

    // This project uses roles CUSTOMER/ADMIN; no ARTIST role in schema
    const totalNewAdminCurrent = await User.find({
      createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
      role_name: UserRoleEnum.ADMIN,
    });

    const totalNewAdminPrevious = await User.find({
      createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod },
      role_name: UserRoleEnum.ADMIN,
    });

    const newAdminDifference =
      totalNewAdminCurrent.length - totalNewAdminPrevious.length;

    res.status(200).json({
      income: {
        totalIncomeCurrent,
        totalIncomePrevious,
        difference: incomeDifference,
      },
      newCustomers: {
        totalNewCustomerCurrent: totalNewCustomerCurrent.length,
        totalNewCustomerPrevious: totalNewCustomerPrevious.length,
        difference: newCustomerDifference,
      },
      newAdmins: {
        totalNewAdminCurrent: totalNewAdminCurrent.length,
        totalNewAdminPrevious: totalNewAdminPrevious.length,
        difference: newAdminDifference,
      },
    });
  } catch (error) {
    res.status(500).send(error.message || "Lỗi máy chủ nội bộ");
  }
});

const statisticForMonthly = asyncHandler(async (req, res) => {
  try {
    let countOrders = Array(12).fill(0);
    let totalAmount = Array(12).fill(0);
    let countCustomers = Array(12).fill(0);
    let countAdmins = Array(12).fill(0);

    const year = req.params.year;

    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const customers = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
          role_name: UserRoleEnum.CUSTOMER,
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const admins = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
          role_name: UserRoleEnum.ADMIN,
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    orders.forEach((item) => {
      const monthIndex = item._id.month - 1;
      countOrders[monthIndex] = item.count;
      totalAmount[monthIndex] = item.totalAmount;
    });

    customers.forEach((item) => {
      const monthIndex = item._id.month - 1;
      countCustomers[monthIndex] = item.count;
    });

    admins.forEach((item) => {
      const monthIndex = item._id.month - 1;
      countAdmins[monthIndex] = item.count;
    });

    res.status(200).json({
      countOrders,
      totalAmount,
      countCustomers,
      countAdmins,
    });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Lỗi máy chủ nội bộ");
  }
});

const statisticSalesForMonth = asyncHandler(async (req, res) => {
  try {
    const now = new Date();

    let startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    let startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    let endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfPreviousMonth.setHours(23, 59, 59, 999);

    const ordersCurrent = await Order.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    }).select("total_amount");
    let totalIncomeCurrent = ordersCurrent.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

    const ordersPrevious = await Order.find({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
    }).select("total_amount");
    let totalIncomePrevious = ordersPrevious.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

    const incomeDifference = totalIncomeCurrent - totalIncomePrevious;

    const totalNewCustomerCurrent = await User.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
      role_name: UserRoleEnum.CUSTOMER,
    });

    const totalNewCustomerPrevious = await User.find({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      role_name: UserRoleEnum.CUSTOMER,
    });

    const newCustomerDifference =
      totalNewCustomerCurrent.length - totalNewCustomerPrevious.length;

    const totalNewAdminCurrent = await User.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
      role_name: UserRoleEnum.ADMIN,
    });

    const totalNewAdminPrevious = await User.find({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      role_name: UserRoleEnum.ADMIN,
    });

    const newAdminDifference =
      totalNewAdminCurrent.length - totalNewAdminPrevious.length;

    res.status(200).json({
      income: {
        totalIncomeCurrent,
        totalIncomePrevious,
        difference: incomeDifference,
      },
      newCustomers: {
        totalNewCustomerCurrent: totalNewCustomerCurrent.length,
        totalNewCustomerPrevious: totalNewCustomerPrevious.length,
        difference: newCustomerDifference,
      },
      newAdmins: {
        totalNewAdminCurrent: totalNewAdminCurrent.length,
        totalNewAdminPrevious: totalNewAdminPrevious.length,
        difference: newAdminDifference,
      },
    });
  } catch (error) {
    res.status(500).send(error.message || "Lỗi máy chủ nội bộ");
  }
});

const statisticUsers = asyncHandler(async (req, res) => {
  try {
    const totalCustomer = await User.countDocuments({
      role_name: UserRoleEnum.CUSTOMER,
    });
    const totalAdmin = await User.countDocuments({
      role_name: UserRoleEnum.ADMIN,
    });
    res.status(200).json({
      totalCustomer,
      totalAdmin,
    });
  } catch (error) {
    res.status(500).send(error.message || "Lỗi máy chủ nội bộ");
  }
});

module.exports = {
  statisticSales,
  statisticSalesForMonth,
  statisticForMonthly,
  statisticUsers,
};
