const MealPlan = require('../models/MealPlan');
const Food = require('../models/Food');

// @desc    Create meal plan
// @route   POST /api/meal-plan/
// @access  Private (Group Admin)
exports.createMealPlan = async (req, res) => {
    try {
        const { foodName, timestamp, name } = req.body;

        if (!foodName || !timestamp || !name) {
            return res.status(400).json({
                code: '00313',
                message: 'Vui lòng cung cấp tất cả các trường bắt buộc.',
            });
        }

        // Validate food name
        if (typeof foodName !== 'string' || foodName.length < 1) {
            return res.status(400).json({
                code: '00314',
                message: 'Vui lòng cung cấp một tên thực phẩm hợp lệ.',
            });
        }

        // Validate timestamp
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return res.status(400).json({
                code: '00315',
                message: 'Vui lòng cung cấp một dấu thời gian hợp lệ.',
            });
        }

        // Validate meal type
        const validMealTypes = ['sáng', 'trưa', 'tối'];
        if (!validMealTypes.includes(name)) {
            return res.status(400).json({
                code: '00316',
                message: 'Vui lòng cung cấp một tên hợp lệ cho bữa ăn, sáng, trưa, tối.',
            });
        }

        // Find or create food
        let food = await Food.findOne({ name: foodName, group: req.user.group });
        if (!food) {
            // Auto-create food if not exists
            food = await Food.create({
                name: foodName,
                group: req.user.group,
            });
        }

        const mealPlan = await MealPlan.create({
            group: req.user.group,
            food: food._id,
            date,
            mealType: name,
            createdBy: req.user._id,
        });

        const populatedPlan = await MealPlan.findById(mealPlan._id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            });

        res.status(201).json({
            code: '00322',
            message: 'Thêm kế hoạch bữa ăn thành công.',
            data: populatedPlan,
        });
    } catch (error) {
        console.error('Create meal plan error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get meal plans by date
// @route   GET /api/meal-plan/
// @access  Private (requires group)
exports.getMealPlans = async (req, res) => {
    try {
        if (!req.user.group) {
            return res.status(400).json({
                code: '00348',
                message: 'Bạn chưa vào nhóm nào.',
            });
        }

        const { date } = req.query;

        let query = { group: req.user.group };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.date = { $gte: startDate, $lte: endDate };
        }

        const mealPlans = await MealPlan.find(query)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            })
            .sort('date mealType');

        res.status(200).json({
            code: '00349',
            message: 'Lấy danh sách thành công.',
            data: mealPlans,
        });
    } catch (error) {
        console.error('Get meal plans error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Update meal plan
// @route   PUT /api/meal-plan/
// @access  Private (Group Admin)
exports.updateMealPlan = async (req, res) => {
    try {
        const { planId, newFoodName, newTimestamp, newName } = req.body;

        if (!planId) {
            return res.status(400).json({
                code: '00332',
                message: 'Vui lòng cung cấp một ID kế hoạch!',
            });
        }

        if (!newFoodName && !newTimestamp && !newName) {
            return res.status(400).json({
                code: '00333',
                message: 'Vui lòng cung cấp ít nhất một trong các trường sau, newFoodName, newTimestamp, newName.',
            });
        }

        const mealPlan = await MealPlan.findById(planId);
        if (!mealPlan) {
            return res.status(404).json({
                code: '00339',
                message: 'Không tìm thấy kế hoạch với ID đã cung cấp.',
            });
        }

        // Check if plan belongs to user's group
        if (mealPlan.group.toString() !== req.user.group.toString()) {
            return res.status(403).json({
                code: '00341',
                message: 'Người dùng không phải là quản trị viên nhóm.',
            });
        }

        // Update fields
        if (newFoodName) {
            const food = await Food.findOne({ name: newFoodName, group: req.user.group });
            if (!food) {
                return res.status(404).json({
                    code: '00344',
                    message: 'Tên thực phẩm mới không tồn tại.',
                });
            }
            mealPlan.food = food._id;
        }

        if (newTimestamp) {
            const date = new Date(newTimestamp);
            if (isNaN(date.getTime())) {
                return res.status(400).json({
                    code: '00335',
                    message: 'Vui lòng cung cấp một dấu thời gian hợp lệ!',
                });
            }
            mealPlan.date = date;
        }

        if (newName) {
            const validMealTypes = ['sáng', 'trưa', 'tối'];
            if (!validMealTypes.includes(newName)) {
                return res.status(400).json({
                    code: '00337',
                    message: 'Vui lòng cung cấp một tên hợp lệ, sáng, trưa, tối!',
                });
            }
            mealPlan.mealType = newName;
        }

        await mealPlan.save();

        const updatedPlan = await MealPlan.findById(mealPlan._id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            });

        res.status(200).json({
            code: '00345',
            message: 'Cập nhật kế hoạch bữa ăn thành công.',
            data: updatedPlan,
        });
    } catch (error) {
        console.error('Update meal plan error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete meal plan
// @route   DELETE /api/meal-plan/
// @access  Private (Group Admin)
exports.deleteMealPlan = async (req, res) => {
    try {
        const { planId } = req.body;

        if (!planId) {
            return res.status(400).json({
                code: '00324',
                message: 'Vui lòng cung cấp một ID kế hoạch hợp lệ.',
            });
        }

        const mealPlan = await MealPlan.findById(planId);
        if (!mealPlan) {
            return res.status(404).json({
                code: '00325',
                message: 'Không tìm thấy kế hoạch với ID đã cung cấp.',
            });
        }

        // Check if plan belongs to user's group
        if (mealPlan.group.toString() !== req.user.group.toString()) {
            return res.status(403).json({
                code: '00327',
                message: 'Người dùng không phải là quản trị viên nhóm.',
            });
        }

        await MealPlan.deleteOne({ _id: mealPlan._id });

        res.status(200).json({
            code: '00330',
            message: 'Kế hoạch bữa ăn của bạn đã được xóa thành công.',
        });
    } catch (error) {
        console.error('Delete meal plan error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
