const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlan.controller');
const { protect, requireGroup, groupAdminOnly } = require('../middlewares/auth');

// All routes are protected
router.use(protect);
router.use(requireGroup);

router.get('/', mealPlanController.getMealPlans);
router.post('/', groupAdminOnly, mealPlanController.createMealPlan);
router.put('/', groupAdminOnly, mealPlanController.updateMealPlan);
router.delete('/', groupAdminOnly, mealPlanController.deleteMealPlan);

module.exports = router;
