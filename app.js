import express from "express";
import dotenv from "dotenv";
import path from "path";
import productRoutes from "./backend/src/product/routes/product.routes.js";
import {
  errorHandlerMiddleware,
  handleUncaughtError,
} from "./backend/middlewares/errorHandlerMiddleware.js";
import userRoutes from "./backend/src/user/routes/user.routes.js";
import cookieParser from "cookie-parser";
import orderRoutes from "./backend/src/order/routes/order.routes.js";

const configPath = path.resolve("backend", "config", "uat.env");
dotenv.config({ path: configPath });

export const server = express();
server.use(express.json());
server.use(cookieParser());

// configure routes
server.use("/api/storefleet/product", productRoutes);
server.use("/api/storefleet/user", userRoutes);
server.use("/api/storefleet/order", orderRoutes);

// errorHandlerMiddleware
server.use(errorHandlerMiddleware);

// export default server;
