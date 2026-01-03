const express = require('express');
const router = express.Router();
const shoppingController = require('../controllers/shopping.controller');
const { protect, requireGroup, groupAdminOnly } = require('../middlewares/auth');

// All routes are protected
router.use(protect);
router.use(requireGroup);

// Shopping List routes
router.get('/list', shoppingController.getShoppingLists);
router.post('/list', shoppingController.createShoppingList);
router.delete('/list', groupAdminOnly, shoppingController.deleteShoppingList);

// Shopping Task routes
router.get('/task/:listId', shoppingController.getTasks);
router.post('/task', groupAdminOnly, shoppingController.createTask);
router.put('/task', groupAdminOnly, shoppingController.updateTask);
router.delete('/task', groupAdminOnly, shoppingController.deleteTask);

module.exports = router;
