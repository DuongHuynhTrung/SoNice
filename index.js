const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config({ path: "./config.env" });
const path = require("path");
const errorHandler = require("./src/app/middleware/errorHandler");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = process.env.PORT || 5000;

// Behind a proxy (e.g., Render), allow Express to trust X-Forwarded-* headers
app.set("trust proxy", 1);

// Socket Config
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
global._io = io;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.set("view engine", "ejs");

// Thiết lập tiêu đề cho Access-Control
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Connect to DB
const db = require("./src/config/dbConnection");
db.connect();

// Removed subscription monitoring (cameraman-specific)

// Định nghĩa các routes
const userRouter = require("./src/routes/UserRouter");
const authRouter = require("./src/routes/AuthRouter");
const payOsRouter = require("./src/routes/PayOsRouter");
const blogRouter = require("./src/routes/BlogRouter");
const statisticRouter = require("./src/routes/StatisticRouter");
const notificationRouter = require("./src/routes/NotificationRouter");
const productRouter = require("./src/routes/ProductRouter");
const orderRouter = require("./src/routes/OrderRouter");
const orderItemRouter = require("./src/routes/OrderItemRouter");
const cartItemRouter = require("./src/routes/CartItemRouter");
const voucherUsageRouter = require("./src/routes/VoucherUsageRouter");
const voucherRouter = require("./src/routes/VoucherRouter");
const categoryRouter = require("./src/routes/CategoryRouter");

app.use(express.static(path.resolve(__dirname, "public")));

// Đăng ký routers
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/payOs", payOsRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/statistics", statisticRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/order-items", orderItemRouter);
app.use("/api/cart-items", cartItemRouter);
app.use("/api/voucher-usages", voucherUsageRouter);
app.use("/api/vouchers", voucherRouter);
app.use("/api/categories", categoryRouter);

// Xử lý lỗi
app.use(errorHandler);

// Cấu hình Swagger
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Sonice API Documentation",
    version: "1.0.0",
    description: "API documentation for managing Sonices",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development server",
    },
    {
      url: `${process.env.API_URL}`,
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    "./src/routes/*.js", // Chỉ cần định nghĩa một lần để load tất cả route
  ],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Khởi động server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
