// Please don't change the pre-written code
// Import the necessary modules here

import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
  searchKeywordProduct

  
} from "../model/product.repository.js";
import ProductModel from "../model/product.schema.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id,
    });
    if (product) {
      res.status(201).json({ success: true, product });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getAllProducts = async (req, res, next) => {
  // Implement the functionality for search, filter and pagination this function.
  try{
  const page=req.query.page;
  const skip=(page-1)*5;
  const allPageProduct=await  getAllProductsRepo(skip,5);
  if(allPageProduct.length==0){
    return res.status(404).send("There are no products available on this page. Please try to find products on a different page.")
  }
  res.status(200).json({success:true,allProductOfPage:allPageProduct});
  }catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err));
  }
 
};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      res.status(200).json({ success: true, updatedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ success: true, deletedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      res.status(200).json({ success: true, productDetails });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;
    const review = {
      user,
      name,
      rating: Number(rating),
      comment,
    };
    if (!rating || rating>5 ) {
      return next(new ErrorHandler(400, "rating can't be empty and not greater than 5"));
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const findRevieweIndex = product.reviews.findIndex((rev) => {
      return rev.user.toString() === user.toString();
    });
    if (findRevieweIndex >= 0) {
      product.reviews.splice(findRevieweIndex, 1, review);
    } else {
      product.reviews.push(review);
    }
    let avgRating = 0;
    product.reviews.forEach((rev) => {
      avgRating += rev.rating;
    });
    const updatedRatingOfProduct = Number(avgRating / product.reviews.length).toFixed(1);
    product.rating = updatedRatingOfProduct;
    await product.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ success: true, msg: "thx for rating the product", product });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteReview = async (req, res, next) => {
  // Insert the essential code into this controller wherever necessary to resolve issues related to removing reviews and updating product ratings.
  try {
    const userId=req.user._id;
    const { productId, reviewId } = req.query;
    if (!productId || !reviewId) {
      return next(
        new ErrorHandler(
          400,
          "pls provide productId and reviewId as query params"
        )
      );
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const reviews = product.reviews;

    const isReviewExistIndex = reviews.findIndex((rev) => {
      return rev._id.toString() === reviewId;
    });
    if (isReviewExistIndex < 0) {
      return next(new ErrorHandler(400, "review doesn't exist"));
    }
    if(userId.toString()===reviews[isReviewExistIndex].user){

    const reviewToBeDeleted = reviews[isReviewExistIndex];
    reviews.splice(isReviewExistIndex, 1);
    let avgRating=0;
    reviews.forEach((rev)=>{
      avgRating=avgRating+rev.rating;
    });
    product.rating=Number((avgRating/reviews.length).toFixed(1));
    await product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      msg: "review deleted successfully",
      deletedReview: reviewToBeDeleted,
      product,
    });
  }else{
    return res.status(400).send("You are not authorized to delete reviews written by other users. You can only delete your own reviews.")
  }
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};
export const searchProduct=async (req,res,next)=>{
  try{
    const {keyword,page}=req.query;
    console.log(keyword);
    console.log(page);
    const allKeywordProduct=await searchKeywordProduct(keyword,page);
    if(allKeywordProduct.length==0){
      return res.status(400).send(`There are no products available on this page for keyword ${keyword}. Please try to find products on a different page.`)
    }
    res.status(200).json({success:true,allKeywordProduct});
  }catch(err){
    console.log(err);
    return next(new ErrorHandler(400,err));
  }
}
