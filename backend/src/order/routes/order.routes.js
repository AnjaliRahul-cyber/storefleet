import express from "express";
import { createNewOrder,getSingleOrder,myOrders,allPlacedOrders,updateOrderDetails } from "../controllers/order.controller.js";
import { auth, authByUserRole } from "../../../middlewares/auth.js";

const router = express.Router();

router.route("/new").post(auth, createNewOrder);
//1)get single order
router.route("/:orderId").get(auth,getSingleOrder);
//2)my orders
router.route("/my/orders").get(auth,myOrders);
//3)allPlacedOrders
router.route("/orders/placed").get(auth,allPlacedOrders);
//4)update updateOrderDetails
router.route("/update/:orderId").put(auth,authByUserRole("admin"),updateOrderDetails);

export default router;
