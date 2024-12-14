import OrderModel from "./order.schema.js";
import {ObjectId} from "mongodb";

export const createNewOrderRepo = async (data) => {
  // Write your code here for placing a new order
  const {shippingInfo,orderedItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice,userId}=data;
  const orderArr=orderedItems.map((elm)=>{
   return {name:elm.name,price:elm.price,quantity:elm.quantity,image:elm.image,product:new ObjectId(elm.product)}
  });
  console.log(orderArr);
  return await OrderModel.create({shippingInfo,orderedItems:orderArr,user:userId,paymentInfo,paidAt:Date.now(),itemsPrice,taxPrice,shippingPrice,totalPrice})
};
export const getOneOrder=async (orderId)=>{
  return await OrderModel.findOne({_id:new ObjectId(orderId)});
}
export const allMyOrders=async (userId)=>{
  return await OrderModel.find({user:userId});
}
export const allOrdersPlaced=async (userId)=>{
  return await OrderModel.find({orderStatus:{$in:["Shipped","Delivered"]},user:userId});
}
export const orderFind=async (orderId)=>{
  return await OrderModel.findOne({_id:new ObjectId(orderId)});
}
export const updateOrderStatus=async (orderStatus,orderId)=>{
  return await OrderModel.findOneAndUpdate({_id:new ObjectId(orderId)},{$set:{orderStatus:orderStatus}},{returnDocument:"after"});
}