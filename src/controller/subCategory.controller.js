const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const subCategoryModel = require("../models/subCategory.model");
const { validateSubCategory } = require("../validation/subcategory.validation");

//@desc create subcategory
exports.createSubCategory = asyncHandler(async (req, res) => {
  const value = await validateSubCategory(req);
  const subCategory = await subCategoryModel.create(value);
  if (!subCategory) throw new customError(500, "subCategory create Failed !!");
  apiResponse.sendSuccess(
    res,
    200,
    "Subcategory created Sucesfull",
    subCategory
  );
});

//@desc get all subCategory
exports.getAllSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await subCategoryModel
    .find()
    .populate("category")
    .sort({ createdAt: -1 });
  if (!subCategory) throw new customError(500, "subCategory retrive Failed !!");
  apiResponse.sendSuccess(
    res,
    200,
    "Subcategory retrive Sucesfull",
    subCategory
  );
});

//@desc find sc using slug
exports.getSingleSubCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(500, "subCategory slug not found !!");

  const subCategory = await subCategoryModel
    .find({ slug: slug })
    .populate("category")
    .sort({ createdAt: -1 });
  if (!subCategory) throw new customError(500, "subCategory retrive Failed !!");
  apiResponse.sendSuccess(
    res,
    200,
    "Subcategory retrive Sucesfull",
    subCategory
  );
});

//@desc update subcategory

exports.updateSubCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(500, "subCategory slug not found !!");

  const subCategory = await subCategoryModel.findOneAndUpdate(
    { slug: slug },
    { ...req.body },
    { new: true }
  );

  if (!subCategory) throw new customError(500, "subCategory update Failed !!");
  apiResponse.sendSuccess(
    res,
    200,
    "Subcategory retrive Sucesfull",
    subCategory
  );
});

//@desc delete subCatebory
exports.deleteSubCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(500, "subCategory slug not found !!");

  const subCategory = await subCategoryModel.findOneAndDelete({ slug: slug });

  if (!subCategory) throw new customError(500, "subCategory update Failed !!");
  apiResponse.sendSuccess(
    res,
    200,
    "Subcategory delete Sucesfull",
    subCategory
  );
});
