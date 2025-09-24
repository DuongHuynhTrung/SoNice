const { constants } = require("../../../constants");
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const isDev = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    code: statusCode,
    ...(isDev ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
