const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const foodController = require('../controllers/food.controller');
const { protect, requireGroup } = require('../middlewares/auth');

// Configure multer for food image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    },
});

// All routes are protected
router.use(protect);

router.get('/', requireGroup, foodController.getFoods);
router.post('/', requireGroup, upload.single('image'), foodController.createFood);
router.put('/', requireGroup, foodController.updateFood);
router.delete('/', requireGroup, foodController.deleteFood);

// Helper routes
router.get('/categories', foodController.getCategories);
router.get('/units', foodController.getUnits);

module.exports = router;
