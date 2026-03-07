import Product from "../models/Product.model.js";
import ValidationResult from "../models/ValidationResult.model.js";
import runBusinessValidation from "../../services/businessEngine.js";
import logActivity from "../../services/activityLogger.js";



const validateProductController = async (req, res, next) => {
  try {
    console.log("SESSION OBJECT:", req.session);
    console.log("SESSION USER ID:", req.user._id);


    const { name, category, costPrice, sellingPrice, targetMarket, adCost } = req.body;


// 1️⃣ Check if product already exists for this user (by name)
let product = await Product.findOne({
  owner: req.user._id,
  name: name
});

// 2️⃣ If not found, create new
if (!product) {
  product = await Product.create({
    owner: req.user._id,
    name,
    category,
    costPrice,
    sellingPrice,
    targetMarket,
    adCost: adCost || 0
  });

  await logActivity({
    userId: req.user._id,
    action: "PRODUCT_CREATED",
    metadata: { productId: product._id }
  });

} else {
  // 3️⃣ If exists, update latest business inputs
  product.costPrice = costPrice;
  product.sellingPrice = sellingPrice;
  product.targetMarket = targetMarket;
  product.adCost = adCost || 0;

  await product.save();
}


    const engineResult = await runBusinessValidation({ product });


    const validation = await ValidationResult.create({
      owner: req.user._id,
      productId: product._id,
      category: req.body.category,
      demandScore: engineResult.demandScore,
      competitionScore: engineResult.competitionScore,   // 🔴 FIX
      validationScore: engineResult.validationScore,     // 🔴 FIX
      recommendation: engineResult.recommendation,
      grossProfit: engineResult.grossProfit,
      netProfit: engineResult.netProfit,
      rawMarginPercent: engineResult.rawMarginPercent,
      netMarginPercent: engineResult.netMarginPercent,
      breakEvenROAS: engineResult.breakEvenROAS,
      productScore: engineResult.productScore,
      executionScore: engineResult.executionScore,
      configVersion: "v1.0"
    });


    await logActivity({
      userId: req.user._id,
      action: "VALIDATION_RUN",
      metadata: {
        validationId: validation._id,
        recommendation: validation.recommendation
      }
    });


    res.status(201).json({ product, validation });
  } catch (err) {
    next(err);
  }
};

export default validateProductController;

export const getUserValidations = async (req, res, next) => {
  try {
    const validations = await ValidationResult.find({
      owner: req.user._id
    }).sort({ createdAt: -1 });

    res.json(validations);
  } catch (err) {
    next(err);
  }
};
