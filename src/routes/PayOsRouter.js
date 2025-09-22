const express = require("express");
const payOsRouter = express.Router();

const {
  payOsCallBack,
} = require("../app/controllers/PayOsController");
const { validateToken } = require("../app/middleware/validateTokenHandler");

payOsRouter.post("/callback", payOsCallBack);

module.exports = payOsRouter;
