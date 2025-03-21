const Ingredient = require("../models/ingredient.js");

async function handleIngredients(req, res, next) {
  try {
    if (!req.body.ingredients) {
      req.processedIngredients = [];
      return next();
    }

    // Ensure ingredients is an array, split on commas, line breaks, and periods
    const rawIngredients = Array.isArray(req.body.ingredients)
      ? req.body.ingredients
      : [req.body.ingredients];

    const ingredients = rawIngredients
      .flatMap((ing) => ing.split(/[\n,.\r]+/)) // Split on delimiters
      .map((ing) => ing.trim()) // Trim spaces
      .filter((ing) => ing.length > 0); // Remove empty values

    // Check if ingredients exist in DB or create them
    const ingredientIds = await Promise.all(
      ingredients.map(async (ingredientName) => {
        let ingredient = await Ingredient.findOne({ name: ingredientName });
        if (!ingredient) {
          ingredient = new Ingredient({ name: ingredientName });
          await ingredient.save();
        }
        return ingredient._id;
      })
    );

    req.processedIngredients = ingredientIds; // Attach processed ingredients to request object
    next();
  } catch (error) {
    console.error("Error processing ingredients:", error);
    res.status(500).send("Error processing ingredients");
  }
}

module.exports = handleIngredients;