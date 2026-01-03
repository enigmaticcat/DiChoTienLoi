const Recipe = require('../models/Recipe');
const Food = require('../models/Food');

// @desc    Create recipe
// @route   POST /api/recipe/
// @access  Private (requires group)
exports.createRecipe = async (req, res) => {
    try {
        const { foodName, name, description, htmlContent } = req.body;

        if (!foodName || !name) {
            return res.status(400).json({
                code: '00350',
                message: 'Vui lòng cung cấp tất cả các trường bắt buộc.',
            });
        }

        // Validate food name
        if (typeof foodName !== 'string' || foodName.length < 1) {
            return res.status(400).json({
                code: '00351',
                message: 'Vui lòng cung cấp một tên thực phẩm hợp lệ.',
            });
        }

        // Validate recipe name
        if (typeof name !== 'string' || name.length < 1) {
            return res.status(400).json({
                code: '00352',
                message: 'Vui lòng cung cấp một tên công thức hợp lệ.',
            });
        }

        // Validate description
        if (description && typeof description !== 'string') {
            return res.status(400).json({
                code: '00353',
                message: 'Vui lòng cung cấp một mô tả công thức hợp lệ.',
            });
        }

        // Validate HTML content
        if (htmlContent && typeof htmlContent !== 'string') {
            return res.status(400).json({
                code: '00354',
                message: 'Vui lòng cung cấp nội dung HTML công thức hợp lệ.',
            });
        }

        // Find food
        const food = await Food.findOne({ name: foodName, group: req.user.group });
        if (!food) {
            return res.status(404).json({
                code: '00354',
                message: 'Không tìm thấy thực phẩm với tên đã cung cấp.',
            });
        }

        const recipe = await Recipe.create({
            name,
            food: food._id,
            description: description || '',
            htmlContent: htmlContent || '',
            createdBy: req.user._id,
        });

        const populatedRecipe = await Recipe.findById(recipe._id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            });

        res.status(201).json({
            code: '00357',
            message: 'Thêm công thức nấu ăn thành công.',
            data: populatedRecipe,
        });
    } catch (error) {
        console.error('Create recipe error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get recipes by food
// @route   GET /api/recipe/
// @access  Private (requires group)
exports.getRecipes = async (req, res) => {
    try {
        const { foodId } = req.query;

        let query = {};

        if (foodId) {
            query.food = foodId;
        }

        const recipes = await Recipe.find(query)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            })
            .sort('-createdAt');

        res.status(200).json({
            code: '00378',
            message: 'Lấy các công thức thành công.',
            data: recipes,
        });
    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Update recipe
// @route   PUT /api/recipe/
// @access  Private
exports.updateRecipe = async (req, res) => {
    try {
        const { recipeId, newFoodName, newDescription, newHtmlContent, newName } = req.body;

        if (!recipeId) {
            return res.status(400).json({
                code: '00359',
                message: 'Vui lòng cung cấp một ID công thức!',
            });
        }

        if (!newFoodName && !newDescription && !newHtmlContent && !newName) {
            return res.status(400).json({
                code: '00360',
                message: 'Vui lòng cung cấp ít nhất một trong các trường sau, newFoodName, newDescription, newHtmlContent, newName.',
            });
        }

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({
                code: '00365',
                message: 'Không tìm thấy công thức với ID đã cung cấp.',
            });
        }

        // Update fields
        if (newFoodName) {
            const food = await Food.findOne({ name: newFoodName, group: req.user.group });
            if (!food) {
                return res.status(404).json({
                    code: '00367',
                    message: 'Tên thực phẩm mới không tồn tại.',
                });
            }
            recipe.food = food._id;
        }

        if (newName) {
            if (typeof newName !== 'string' || newName.length < 1) {
                return res.status(400).json({
                    code: '00364',
                    message: 'Vui lòng cung cấp một tên công thức mới hợp lệ!',
                });
            }
            recipe.name = newName;
        }

        if (newDescription !== undefined) {
            if (typeof newDescription !== 'string') {
                return res.status(400).json({
                    code: '00362',
                    message: 'Vui lòng cung cấp một mô tả mới hợp lệ!',
                });
            }
            recipe.description = newDescription;
        }

        if (newHtmlContent !== undefined) {
            if (typeof newHtmlContent !== 'string') {
                return res.status(400).json({
                    code: '00363',
                    message: 'Vui lòng cung cấp nội dung HTML mới hợp lệ!',
                });
            }
            recipe.htmlContent = newHtmlContent;
        }

        await recipe.save();

        const updatedRecipe = await Recipe.findById(recipe._id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            });

        res.status(200).json({
            code: '00370',
            message: 'Cập nhật công thức nấu ăn thành công.',
            data: updatedRecipe,
        });
    } catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete recipe
// @route   DELETE /api/recipe/
// @access  Private
exports.deleteRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;

        if (!recipeId) {
            return res.status(400).json({
                code: '00372',
                message: 'Vui lòng cung cấp một ID công thức hợp lệ.',
            });
        }

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({
                code: '00373',
                message: 'Không tìm thấy công thức với ID đã cung cấp.',
            });
        }

        await Recipe.deleteOne({ _id: recipe._id });

        res.status(200).json({
            code: '00376',
            message: 'Công thức của bạn đã được xóa thành công.',
        });
    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
