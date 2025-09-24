const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { UserRoleEnum } = require("../../enum/UserEnum");

const validateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Missing Access Token!"));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401);
    return next(new Error("User is not Authorized or token is missing"));
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401);
      return next(new Error("Sai email hoặc mật khẩu!"));
    }
    req.user = decoded.user;
    return next();
  });
});

const validateTokenAdmin = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Missing Access Token!"));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401);
    return next(new Error("User is not Authorized or token is missing"));
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401);
      return next(new Error("Sai email hoặc mật khẩu!"));
    }
    if (decoded.user.role_name !== UserRoleEnum.ADMIN) {
      res.status(403);
      return next(new Error("Chỉ có Admin có quyền thực hiện chức năng này"));
    }
    req.user = decoded.user;
    return next();
  });
});

const validateTokenCustomer = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Missing Access Token!"));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401);
    return next(new Error("User is not Authorized or token is missing"));
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401);
      return next(new Error("Sai email hoặc mật khẩu!"));
    }
    if (decoded.user.role_name !== UserRoleEnum.CUSTOMER) {
      res.status(403);
      return next(new Error("Chỉ có Customer có quyền thực hiện chức năng này"));
    }
    req.user = decoded.user;
    return next();
  });
});

const validateTokenCameraman = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Missing Access Token!"));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401);
    return next(new Error("User is not Authorized or token is missing"));
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401);
      return next(new Error("Sai email hoặc mật khẩu!"));
    }
    if (decoded.user.role_name !== UserRoleEnum.CAMERAMAN) {
      res.status(403);
      return next(new Error("Chỉ có Cameraman có quyền thực hiện chức năng này"));
    }
    req.user = decoded.user;
    return next();
  });
});

module.exports = {
  validateToken,
  validateTokenAdmin,
  validateTokenCustomer,
  validateTokenCameraman,
};
