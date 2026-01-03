const ShoppingList = require('../models/ShoppingList');
const ShoppingTask = require('../models/ShoppingTask');
const Food = require('../models/Food');

// ==================== SHOPPING LIST ====================

// @desc    Create shopping list for a day
// @route   POST /api/shopping/list/
// @access  Private (requires group)
exports.createShoppingList = async (req, res) => {
    try {
        const { date } = req.body;

        if (!req.user.group) {
            return res.status(400).json({
                code: '00286',
                message: 'Người dùng này chưa thuộc nhóm nào.',
            });
        }

        // Normalize date to start of day
        const listDate = date ? new Date(date) : new Date();
        listDate.setHours(0, 0, 0, 0);

        // Check if list already exists for this date
        const existingList = await ShoppingList.findOne({
            group: req.user.group,
            date: listDate,
        });

        if (existingList) {
            return res.status(200).json({
                code: '00098',
                message: 'Danh sách đã tồn tại.',
                data: existingList,
            });
        }

        const shoppingList = await ShoppingList.create({
            group: req.user.group,
            date: listDate,
            createdBy: req.user._id,
        });

        res.status(201).json({
            code: '00098',
            message: 'Thành công.',
            data: shoppingList,
        });
    } catch (error) {
        console.error('Create shopping list error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get shopping lists
// @route   GET /api/shopping/list/
// @access  Private (requires group)
exports.getShoppingLists = async (req, res) => {
    try {
        if (!req.user.group) {
            return res.status(400).json({
                code: '00286',
                message: 'Người dùng này chưa thuộc nhóm nào.',
            });
        }

        const lists = await ShoppingList.find({ group: req.user.group })
            .sort('-date')
            .limit(30);

        res.status(200).json({
            code: '00287',
            message: 'Lấy danh sách các shopping list thành công.',
            data: lists,
        });
    } catch (error) {
        console.error('Get shopping lists error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete shopping list
// @route   DELETE /api/shopping/list/
// @access  Private (Group Admin)
exports.deleteShoppingList = async (req, res) => {
    try {
        const { listId } = req.body;

        if (!listId) {
            return res.status(400).json({
                code: '00293',
                message: 'Vui lòng cung cấp tất cả các trường bắt buộc.',
            });
        }

        const list = await ShoppingList.findById(listId);
        if (!list) {
            return res.status(404).json({
                code: '00296',
                message: 'Không tìm thấy danh sách.',
            });
        }

        // Delete all tasks in this list
        await ShoppingTask.deleteMany({ shoppingList: list._id });
        await ShoppingList.deleteOne({ _id: list._id });

        res.status(200).json({
            code: '00299',
            message: 'Xóa thành công.',
        });
    } catch (error) {
        console.error('Delete shopping list error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// ==================== SHOPPING TASK ====================

// @desc    Create shopping task
// @route   POST /api/shopping/task/
// @access  Private (Group Admin)
exports.createTask = async (req, res) => {
    try {
        const { listId, foodName, quantity, assignedTo } = req.body;

        if (!listId || !foodName) {
            return res.status(400).json({
                code: '00278',
                message: 'Vui lòng cung cấp tất cả các trường bắt buộc.',
            });
        }

        // Check if user has group
        if (!req.user.group) {
            return res.status(400).json({
                code: '00286',
                message: 'Người dùng này chưa thuộc nhóm nào.',
            });
        }

        // Find shopping list
        const list = await ShoppingList.findById(listId);
        if (!list) {
            return res.status(404).json({
                code: '00296',
                message: 'Không tìm thấy danh sách.',
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

        // Check if task for this food already exists in list
        const existingTask = await ShoppingTask.findOne({
            shoppingList: list._id,
            food: food._id,
        });

        if (existingTask) {
            return res.status(400).json({
                code: '00283',
                message: 'Thực phẩm này đã có trong danh sách rồi.',
            });
        }

        const task = await ShoppingTask.create({
            shoppingList: list._id,
            food: food._id,
            quantity: quantity || 1,
            assignedTo: assignedTo || null,
        });

        const populatedTask = await ShoppingTask.findById(task._id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            })
            .populate('assignedTo', 'name username');

        res.status(201).json({
            code: '00284',
            message: 'Thêm nhiệm vụ thành công.',
            data: populatedTask,
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get tasks in a shopping list
// @route   GET /api/shopping/task/:listId
// @access  Private (requires group)
exports.getTasks = async (req, res) => {
    try {
        const { listId } = req.params;

        const tasks = await ShoppingTask.find({ shoppingList: listId })
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            })
            .populate('assignedTo', 'name username');

        res.status(200).json({
            code: '00287',
            message: 'Lấy danh sách các shopping list thành công.',
            data: tasks,
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Update shopping task
// @route   PUT /api/shopping/task/
// @access  Private (Group Admin)
exports.updateTask = async (req, res) => {
    try {
        const { taskId, newFoodName, newQuantity, isCompleted } = req.body;

        if (!taskId) {
            return res.status(400).json({
                code: '00301',
                message: 'Vui lòng cung cấp một ID nhiệm vụ trong trường taskId.',
            });
        }

        const task = await ShoppingTask.findById(taskId);
        if (!task) {
            return res.status(404).json({
                code: '00306',
                message: 'Không tìm thấy nhiệm vụ với ID đã cung cấp.',
            });
        }

        // Update fields
        if (newFoodName) {
            const food = await Food.findOne({ name: newFoodName, group: req.user.group });
            if (!food) {
                return res.status(404).json({
                    code: '00308',
                    message: 'Không tìm thấy nhiệm vụ với tên đã cung cấp.',
                });
            }

            // Check if this food already exists in the list
            const existingTask = await ShoppingTask.findOne({
                shoppingList: task.shoppingList,
                food: food._id,
                _id: { $ne: task._id },
            });

            if (existingTask) {
                return res.status(400).json({
                    code: '00309',
                    message: 'Thực phẩm này đã tồn tại trong danh sách mua hàng hiện tại.',
                });
            }

            task.food = food._id;
        }

        if (newQuantity !== undefined) {
            task.quantity = newQuantity;
        }

        if (isCompleted !== undefined) {
            task.isCompleted = isCompleted;
            if (isCompleted) {
                task.completedAt = new Date();
            } else {
                task.completedAt = null;
            }
        }

        await task.save();

        const updatedTask = await ShoppingTask.findById(task._id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            })
            .populate('assignedTo', 'name username');

        res.status(200).json({
            code: '00312',
            message: 'Cập nhật nhiệm vụ thành công.',
            data: updatedTask,
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete shopping task
// @route   DELETE /api/shopping/task/
// @access  Private (Group Admin)
exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.body;

        if (!taskId) {
            return res.status(400).json({
                code: '00294',
                message: 'Vui lòng cung cấp một ID nhiệm vụ trong trường taskId.',
            });
        }

        const task = await ShoppingTask.findById(taskId);
        if (!task) {
            return res.status(404).json({
                code: '00296',
                message: 'Không tìm thấy nhiệm vụ với ID đã cung cấp.',
            });
        }

        await ShoppingTask.deleteOne({ _id: task._id });

        res.status(200).json({
            code: '00299',
            message: 'Xóa nhiệm vụ thành công.',
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
