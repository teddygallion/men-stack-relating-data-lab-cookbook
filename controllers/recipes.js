const express = require("express");
const router = express.Router();
const Recipe = require("../models/recipe.js");
const Ingredient = require("../models/ingredient.js");


const isSignedIn = require("../middleware/is-signed-in.js");
const passUserToView = require("../middleware/pass-user-to-view.js")
const handleIngredients = require("../middleware/handle-ingredients.js");


router.get("/", isSignedIn, passUserToView, async (req, res) => {
	try {
		const recipes = await Recipe.find({ owner: req.session.user._id });
		res.render("recipes/index.ejs", { recipes });
	} catch (error) {
		console.log(error);
		res.redirect("/");
	}
});


router.get("/new", isSignedIn, passUserToView, (req, res) => {
	res.render("recipes/new.ejs");
});

router.post("/", isSignedIn, async (req, res) => {
  try {
   const ingredients = Array.isArray(req.body.ingredients) ? req.body.ingredients : [req.body.ingredients];

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

    const newRecipe = new Recipe({
      name: req.body.name,
      instructions: req.body.instructions,
      owner: req.session.user._id,
      ingredients: ingredientIds,
    });

    await newRecipe.save();
    res.redirect("/");
  } catch (error) {
    console.log("Error creating recipe:", error);
    res.render("recipes/new.ejs", { error: "Error creating recipe, please try again." });
  }
});

router.get("/:recipeId", isSignedIn, async(req,res) =>{
	try{
		const recipe = await Recipe.findById(req.params.recipeId);
		if (!recipe){
			return res.redirect("/recipes")
		}
		res.render('recipes/show.ejs', { recipe });
	}catch(error){
		console.log(error);
		res.redirect("/recipes")
	}

});


router.get("/:recipeId/edit", isSignedIn, async (req, res) => {
	try {
		const recipe = await Recipe.findById(req.params.recipeId);
		if (!recipe) {
			return res.redirect("/recipes");
		}
		res.render("recipes/edit.ejs", { recipe });
	} catch (error) {
		console.log(error);
		res.redirect("/recipes");
	}
});


router.put("/:recipeId", isSignedIn, async (req, res) => {
	try {
		const recipe = await Recipe.findById(req.params.recipeId);
		if (!recipe) {
			return res.redirect("/recipes");
		}


		recipe.name = req.body.name;
		recipe.instructions = req.body.instructions;
		recipe.ingredients = req.body.ingredients || recipe.ingredients;

		await recipe.save();
		res.redirect(`/recipes/${recipe._id}`);
	} catch (error) {
		console.log(error);
		res.redirect("/");
	}
});

router.delete("/:recipeId", isSignedIn, async (req, res) => {
	try {
		const recipe = await Recipe.findByIdAndDelete(req.params.recipeId);
		if (!recipe) {
			return res.redirect("/recipes");
		}
		res.redirect("/recipes");
	} catch (error) {
		console.log(error);
		res.redirect("/recipes");
	}
});

module.exports = router;
