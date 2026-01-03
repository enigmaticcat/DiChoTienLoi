const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middlewares/auth');

// All routes are protected and require admin role
router.use(protect);

// Category routes
router.get('/category', adminController.getCategories);
router.post('/category', adminOnly, adminController.createCategory);
router.put('/category', adminOnly, adminController.editCategory);
router.delete('/category', adminOnly, adminController.deleteCategory);

// Unit routes
router.get('/unit', adminController.getUnits);
router.post('/unit', adminOnly, adminController.createUnit);
router.put('/unit', adminOnly, adminController.editUnit);
router.delete('/unit', adminOnly, adminController.deleteUnit);

// Logs route
router.get('/logs', adminOnly, adminController.getLogs);

// User management routes (Admin only)
router.get('/users', adminOnly, adminController.getAllUsers);
router.get('/users/:id', adminOnly, adminController.getUserById);
router.put('/users/:id/role', adminOnly, adminController.updateUserRole);
router.delete('/users/:id', adminOnly, adminController.deleteUserByAdmin);

// Stats route
router.get('/stats', adminOnly, adminController.getStats);

module.exports = router;
