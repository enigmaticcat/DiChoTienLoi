const express = require('express');
const router = express.Router();
const fridgeController = require('../controllers/fridge.controller');
const { protect, requireGroup } = require('../middlewares/auth');

// All routes are protected
router.use(protect);
router.use(requireGroup);

router.get('/', fridgeController.getFridgeItems);
router.get('/:id', fridgeController.getFridgeItem);
router.post('/', fridgeController.createFridgeItem);
router.put('/', fridgeController.updateFridgeItem);
router.delete('/', fridgeController.deleteFridgeItem);

module.exports = router;
