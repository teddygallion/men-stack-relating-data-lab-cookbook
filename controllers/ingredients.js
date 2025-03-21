const express = require("express");
const router = express.Router();
const Ingredient = require("../models/ingredient.js");

router.get("/", async (req, res) => {
  try {
    const ingredients = await Ingredient.find({});
    res.render("ingredients/index.ejs", { ingredients });
  } catch (error) {
    console.log(error);
    res.redirect("/recipes");
  }
});

router.post("/", async (req, res) => {
  try {
    let ingredient = await Ingredient.findOne({ name: req.body.name });
    if (!ingredient) {
      ingredient = new Ingredient({ name: req.body.name });
      await ingredient.save();
    }
    res.redirect("/ingredients");
  } catch (error) {
    console.log(error);
    res.redirect("/ingredients");
  }
});

module.exports = router;
