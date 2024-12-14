// Please don't change the pre-written code
// Import the necessary modules here

import { ObjectId } from "mongodb";
import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";
// import {ObjectId} from "mongoose";

export const createNewUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await createNewUserRepo(req.body);
    await sendToken(newUser, res, 200);

    // Implement sendWelcomeEmail function to send welcome message
    await sendWelcomeEmail(newUser);
  } catch (err) {
    //  handle error for duplicate email
    if(err.code===11000){
      return res.status(400).json({success:false,error:"email already registered"});
    }
    return next(new ErrorHandler(400, err));
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passswor!"));
    }
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};

export const forgetPassword = async (req, res, next) => {
  // Implement feature for forget password
  try{
    const {email}=req.body;
    const userFound=await findUserRepo({email});
    if(!userFound){
      return res.status(404).json({success:false,message:"The email you entered is not registered. Please sign up or try a different email."});
    }
    const resetToken=await userFound.getResetPasswordToken();
    console.log(resetToken);
    await userFound.save();
    sendPasswordResetEmail(userFound,resetToken);
    res.status(200).send("A password reset token has been sent to your email. Please check your email.")
  }catch(err){
    console.log(err);
    return next(new ErrorHandler(500,"Internal server error"))
  }
};

export const resetUserPassword = async (req, res, next) => {
  // Implement feature for reset password
  const {password,confirmPassword}=req.body;
  const token=req.params.token;
  const hashedToken=crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
      console.log(hashedToken);
  const userFound=await findUserForPasswordResetRepo(hashedToken);
  console.log(userFound);
  userFound.password=confirmPassword;
  userFound.resetPasswordToken=undefined;
  userFound.resetPasswordExpire=undefined;
  await userFound.save();
  res.status(200).json({success:true,message:"Your password has been successfully reset. You can now log in with your new password."});
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!currentPassword) {
      return next(new ErrorHandler(401, "pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(401, "mismatch new password and confirm password!")
      );
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, {
      name,
      email,
    });
    res.status(201).json({ success: true, updatedUserDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// admin controllers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }

    res
      .status(200)
      .json({ success: true, msg: "user deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {
  // Write your code here for updating the roles of other users by admin
  try{
  const {name,email,role}=req.body;
  console.log(req.body);
  const userId=req.params.userId;
  // const userObj={name,email,role};
  const userFound=await findUserRepo({_id:new ObjectId(userId)});
  console.log(userFound);
  if(!userFound){
   return res.status(404).json({success:false,message:"The email you entered is not registered. Please sign up or try a different email."})
  }
  const updatedUser=await updateUserRoleAndProfileRepo(userId,role);
  res.status(200).json({success:true,message:"The user's role has been successfully updated. They now have the new permissions associated with their role."});
  }catch(err){
    console.log(err);
    return next(new ErrorHandler(400, err));
  }
};
