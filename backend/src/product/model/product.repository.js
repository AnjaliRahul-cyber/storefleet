import ProductModel from "./product.schema.js";

export const addNewProductRepo = async (product) => {
  return await new ProductModel(product).save();
};

export const getAllProductsRepo = async (skip,limit) => {
  return await ProductModel.find({}).skip(skip).limit(limit);
};

export const updateProductRepo = async (_id, updatedData) => {
  return await ProductModel.findByIdAndUpdate(_id, updatedData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });
};

export const deleProductRepo = async (_id) => {
  return await ProductModel.findByIdAndDelete(_id);
};

export const getProductDetailsRepo = async (_id) => {
  return await ProductModel.findById(_id);
};

export const getTotalCountsOfProduct = async () => {
  return await ProductModel.countDocuments();
};

export const findProductRepo = async (productId) => {
  return await ProductModel.findById(productId);
};
export const searchKeywordProduct=async (keyword,page)=>{
  const skip=(page-1)*5;
 return await ProductModel.aggregate([
  //1)skip the first n items
  {$skip:skip},
  //2)limit only five items
  {$limit:5},
  //3)match items
  {$match:{name:new RegExp(keyword,"i")}},
 ]);
}

