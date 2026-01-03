const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const { protect, requireGroup } = require('../middlewares/auth');

// All routes are protected
router.use(protect);
router.use(requireGroup);

router.get('/', recipeController.getRecipes);
router.post('/', recipeController.createRecipe);
router.put('/', recipeController.updateRecipe);
router.delete('/', recipeController.deleteRecipe);

module.exports = router;
