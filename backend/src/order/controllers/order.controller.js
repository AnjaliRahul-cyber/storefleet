// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo,getOneOrder,allMyOrders,allOrdersPlaced,updateOrderStatus,orderFind } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try{
    const user=req.user._id;
    const orderObj=req.body;
    orderObj.userId=user;
    console.log(orderObj);
    const newOrder=await createNewOrderRepo(orderObj);
    res.status(201).json({success:true,newOrder});
  }catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err));
  }
};
export const getSingleOrder=async (req,res,next)=>{
  try{
    const orderId=req.params.orderId;
    const orderFound=await getOneOrder(orderId);
    if(!orderFound){
      return res.status(400).json({success:false,message:"Order not found. Please check the Order ID and try again."});
    }
    res.status(200).json({success:true,order:orderFound});
  }catch(err){
    return next(new ErrorHandler(400,err));
  }
}
export const myOrders=async (req,res,next)=>{
  try{
    const userId=req.user._id;
    const allOrders=await allMyOrders(userId);
    if(allOrders.length==0){
      return res.status(404).send("You have no orders at the moment. Start shopping to place your first order!")
    }
    res.status(200).json({success:true,myOrders:allOrders});

  }catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err));
  }
}
export const allPlacedOrders=async (req,res,next)=>{
  try{
    const userId=req.user._id;
    const allPlacedOrders=await allOrdersPlaced(userId);
    if(allPlacedOrders.length==0){
      return res.status(404).send("You haven’t placed any orders yet. Start shopping today!");
    }
    res.status(200).json({success:true,allPlacedOrders});
  }catch(err){
    return next(new ErrorHandler(400,err));
  }
}
export const updateOrderDetails=async (req,res,next)=>{
  try{
    const orderId=req.params.orderId;
    const {orderStatus}=req.body;
    const orderFound=await orderFind(orderId);
    if(!orderFound){
      res.status(404).send("Sorry, we couldn't find an order with that ID. Please check the order ID and try again.");
    }
    const updatedOrder=await updateOrderStatus(orderStatus,orderId);
    res.status(200).json({success:true,updatedOrder});
  }catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err));
  }
}
