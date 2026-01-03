const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const groupRoutes = require('./group.routes');
const adminRoutes = require('./admin.routes');
const foodRoutes = require('./food.routes');
const fridgeRoutes = require('./fridge.routes');
const shoppingRoutes = require('./shopping.routes');
const mealPlanRoutes = require('./mealPlan.routes');
const recipeRoutes = require('./recipe.routes');

// Mount routes
router.use('/user', authRoutes);
router.use('/user', userRoutes);
router.use('/user/group', groupRoutes);
router.use('/admin', adminRoutes);
router.use('/food', foodRoutes);
router.use('/fridge', fridgeRoutes);
router.use('/shopping', shoppingRoutes);
router.use('/meal-plan', mealPlanRoutes);
router.use('/recipe', recipeRoutes);

module.exports = router;
