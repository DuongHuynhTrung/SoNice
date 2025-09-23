const express = require("express");
const payOsRouter = express.Router();

const {
  payOsCallBack,
} = require("../app/controllers/PayOsController");
const { validateToken } = require("../app/middleware/validateTokenHandler");

// Health-check endpoints for PayOS webhook verification
payOsRouter.get("/callback", (req, res) => res.status(200).send("OK"));
payOsRouter.head("/callback", (req, res) => res.status(200).end());

payOsRouter.post("/callback", payOsCallBack);

module.exports = payOsRouter;
