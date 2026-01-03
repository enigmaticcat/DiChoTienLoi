const Food = require('../models/Food');
const Category = require('../models/Category');
const Unit = require('../models/Unit');

// @desc    Create food
// @route   POST /api/food/
// @access  Private (requires group)
exports.createFood = async (req, res) => {
    try {
        const { name, foodCategoryName, unitName } = req.body;

        // Validate required fields
        if (!name || !foodCategoryName || !unitName) {
            return res.status(400).json({
                code: '00147',
                message: 'Vui lòng cung cấp tất cả các trường bắt buộc!',
            });
        }

        // Validate name
        if (name.length < 1) {
            return res.status(400).json({
                code: '00148',
                message: 'Vui lòng cung cấp tên của thực phẩm hợp lệ!',
            });
        }

        // Check if user has group
        if (!req.user.group) {
            return res.status(400).json({
                code: '00156x',
                message: 'Hãy vào nhóm trước để tạo thực phẩm.',
            });
        }

        // Find category
        const category = await Category.findOne({ name: foodCategoryName });
        if (!category) {
            return res.status(404).json({
                code: '00155',
                message: 'Không tìm thấy category với tên cung cấp.',
            });
        }

        // Find unit
        const unit = await Unit.findOne({ name: unitName });
        if (!unit) {
            return res.status(404).json({
                code: '00153',
                message: 'Không tìm thấy đơn vị với tên cung cấp.',
            });
        }

        // Check if food already exists in group
        const existingFood = await Food.findOne({ name, group: req.user.group });
        if (existingFood) {
            return res.status(400).json({
                code: '00151',
                message: 'Đã tồn tại thức ăn với tên này.',
            });
        }

        // Handle image
        let image = '';
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }

        const food = await Food.create({
            name,
            category: category._id,
            unit: unit._id,
            image,
            group: req.user.group,
            createdBy: req.user._id,
        });

        const populatedFood = await Food.findById(food._id)
            .populate('category', 'name')
            .populate('unit', 'name');

        res.status(201).json({
            code: '00160',
            message: 'Tạo thực phẩm thành công.',
            data: populatedFood,
        });
    } catch (error) {
        console.error('Create food error:', error);
        res.status(500).json({
            code: '00157',
            message: 'Server error.',
        });
    }
};

// @desc    Update food
// @route   PUT /api/food/
// @access  Private (requires group)
exports.updateFood = async (req, res) => {
    try {
        const { name, newName, newCategory, newUnit } = req.body;

        if (!name) {
            return res.status(400).json({
                code: '00161',
                message: 'Vui lòng cung cấp tất cả các trường bắt buộc!',
            });
        }

        if (!newName && !newCategory && !newUnit) {
            return res.status(400).json({
                code: '00163',
                message: 'Vui lòng cung cấp ít nhất một trong các trường sau, newName, newCategory, newUnit.',
            });
        }

        // Find food
        const food = await Food.findOne({ name, group: req.user.group });
        if (!food) {
            return res.status(404).json({
                code: '00167',
                message: 'Thực phẩm với tên đã cung cấp không tồn tại.',
            });
        }

        // Update fields
        if (newName) {
            // Check if new name exists
            const existingFood = await Food.findOne({ name: newName, group: req.user.group });
            if (existingFood && existingFood._id.toString() !== food._id.toString()) {
                return res.status(400).json({
                    code: '00173',
                    message: 'Một thực phẩm với tên này đã tồn tại.',
                });
            }
            food.name = newName;
        }

        if (newCategory) {
            const category = await Category.findOne({ name: newCategory });
            if (!category) {
                return res.status(404).json({
                    code: '00171',
                    message: 'Không tìm thấy danh mục với tên đã cung cấp.',
                });
            }
            food.category = category._id;
        }

        if (newUnit) {
            const unit = await Unit.findOne({ name: newUnit });
            if (!unit) {
                return res.status(404).json({
                    code: '00169',
                    message: 'Không tìm thấy đơn vị với tên đã cung cấp.',
                });
            }
            food.unit = unit._id;
        }

        await food.save();

        const updatedFood = await Food.findById(food._id)
            .populate('category', 'name')
            .populate('unit', 'name');

        res.status(200).json({
            code: '00178',
            message: 'Thành công.',
            data: updatedFood,
        });
    } catch (error) {
        console.error('Update food error:', error);
        res.status(500).json({
            code: '00168',
            message: 'Server error.',
        });
    }
};

// @desc    Delete food
// @route   DELETE /api/food/
// @access  Private (requires group)
exports.deleteFood = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                code: '00179',
                message: 'Vui lòng cung cấp tên thực phẩm.',
            });
        }

        const food = await Food.findOne({ name, group: req.user.group });
        if (!food) {
            return res.status(404).json({
                code: '00180',
                message: 'Không tìm thấy thực phẩm với tên đã cung cấp.',
            });
        }

        await Food.deleteOne({ _id: food._id });

        res.status(200).json({
            code: '00184',
            message: 'Xóa thực phẩm thành công.',
        });
    } catch (error) {
        console.error('Delete food error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get all foods in group
// @route   GET /api/food/
// @access  Private (requires group)
exports.getFoods = async (req, res) => {
    try {
        if (!req.user.group) {
            return res.status(400).json({
                code: '00185',
                message: 'Bạn chưa vào nhóm nào.',
            });
        }

        const foods = await Food.find({ group: req.user.group })
            .populate('category', 'name')
            .populate('unit', 'name')
            .sort('name');

        res.status(200).json({
            code: '00188',
            message: 'Lấy danh sách thực phẩm thành công.',
            data: foods,
        });
    } catch (error) {
        console.error('Get foods error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get categories for food
// @route   GET /api/food/categories
// @access  Private
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort('name');

        res.status(200).json({
            code: '00129',
            message: 'Lấy các category thành công.',
            data: categories,
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get units for food
// @route   GET /api/food/units
// @access  Private
exports.getUnits = async (req, res) => {
    try {
        const units = await Unit.find().sort('name');

        res.status(200).json({
            code: '00110',
            message: 'Lấy các unit thành công.',
            data: units,
        });
    } catch (error) {
        console.error('Get units error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
