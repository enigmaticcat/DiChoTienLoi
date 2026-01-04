const FridgeItem = require('../models/FridgeItem');
const Food = require('../models/Food');

// @desc    Create fridge item
// @route   POST /api/fridge/
// @access  Private (requires group)
exports.createFridgeItem = async (req, res) => {
    try {
        const { foodName, quantity, useWithin, note, location, category, unit } = req.body;

        // Validate required fields
        if (!foodName) {
            return res.status(400).json({
                code: '00190',
                message: 'Vui lòng cung cấp một tên thực phẩm hợp lệ!',
            });
        }

        if (useWithin !== undefined && (isNaN(useWithin) || useWithin < 0)) {
            return res.status(400).json({
                code: '00191',
                message: "Vui lòng cung cấp một giá trị 'sử dụng trong khoảng' hợp lệ!",
            });
        }

        if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
            return res.status(400).json({
                code: '00192',
                message: 'Vui lòng cung cấp một số lượng hợp lệ!',
            });
        }

        // Check if user has group
        if (!req.user.group) {
            return res.status(400).json({
                code: '00196',
                message: 'Người dùng không có quyền do không thuộc nhóm.',
            });
        }

        // Find or create food
        let food = await Food.findOne({ name: foodName, group: req.user.group });

        // Lookup category ObjectId if category name provided
        let categoryId = null;
        if (category) {
            const Category = require('../models/Category');
            const categoryDoc = await Category.findOne({ name: category });
            if (categoryDoc) {
                categoryId = categoryDoc._id;
            }
        }

        // Lookup unit ObjectId if unit name provided
        let unitId = null;
        if (unit) {
            const Unit = require('../models/Unit');
            const unitDoc = await Unit.findOne({ name: unit });
            if (unitDoc) {
                unitId = unitDoc._id;
            }
        }

        if (!food) {
            // Auto-create food if not exists
            // Only pass categoryId/unitId if they are valid ObjectIds (not strings)
            const foodData = {
                name: foodName,
                group: req.user.group,
            };
            if (categoryId) foodData.category = categoryId;
            if (unitId) foodData.unit = unitId;

            food = await Food.create(foodData);
        } else if (categoryId && !food.category) {
            // Update category if food exists but has no category
            food.category = categoryId;
            await food.save();
        }

        // Check if fridge item already exists - if so, update quantity
        const existingItem = await FridgeItem.findOne({ food: food._id, group: req.user.group });
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 0) + (quantity || 1);
            if (useWithin) {
                existingItem.expiryDate = new Date();
                existingItem.expiryDate.setDate(existingItem.expiryDate.getDate() + parseInt(useWithin));
            }
            await existingItem.save();

            const updatedItem = await FridgeItem.findById(existingItem._id)
                .populate({
                    path: 'food',
                    populate: [
                        { path: 'category', select: 'name' },
                        { path: 'unit', select: 'name' },
                    ],
                });

            return res.status(200).json({
                code: '00202',
                message: 'Đã cập nhật số lượng thực phẩm.',
                data: updatedItem,
            });
        }

        // Calculate expiry date
        let expiryDate = null;
        if (useWithin) {
            expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(useWithin));
        }

        const fridgeItem = await FridgeItem.create({
            food: food._id,
            group: req.user.group,
            quantity: quantity || 1,
            useWithin: useWithin || null,
            expiryDate,
            note: note || '',
            location: location || 'chiller',
            addedBy: req.user._id,
        });

        const populatedItem = await FridgeItem.findById(fridgeItem._id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            });

        res.status(201).json({
            code: '00202',
            message: 'Mục trong tủ lạnh được tạo thành công.',
            data: populatedItem,
        });
    } catch (error) {
        console.error('Create fridge item error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Update fridge item
// @route   PUT /api/fridge/
// @access  Private (requires group)
exports.updateFridgeItem = async (req, res) => {
    try {
        const { itemId, newQuantity, newNote, newUseWithin, newLocation } = req.body;

        if (!itemId) {
            return res.status(400).json({
                code: '00204',
                message: 'Vui lòng cung cấp id của item tủ lạnh.',
            });
        }

        if (newQuantity === undefined && newNote === undefined && newUseWithin === undefined && newLocation === undefined) {
            return res.status(400).json({
                code: '00204x',
                message: 'Vui lòng cung cấp ít nhất một trong các trường sau, newQuantity, newNote, newUseWithin, newLocation.',
            });
        }

        // Validate
        if (newUseWithin !== undefined && (isNaN(newUseWithin) || newUseWithin < 0)) {
            return res.status(400).json({
                code: '00205',
                message: "Vui lòng cung cấp một giá trị 'sử dụng trong' hợp lệ!",
            });
        }

        if (newQuantity !== undefined && (isNaN(newQuantity) || newQuantity < 0)) {
            return res.status(400).json({
                code: '00206',
                message: 'Vui lòng cung cấp một lượng hợp lệ!',
            });
        }

        // Check if user has group
        if (!req.user.group) {
            return res.status(400).json({
                code: '00210',
                message: 'Người dùng không thuộc bất kỳ nhóm nào.',
            });
        }

        // Find fridge item
        const fridgeItem = await FridgeItem.findById(itemId);
        if (!fridgeItem) {
            return res.status(404).json({
                code: '00213',
                message: 'Mục tủ lạnh không tồn tại.',
            });
        }

        // Check if item belongs to user's group
        if (fridgeItem.group.toString() !== req.user.group.toString()) {
            return res.status(403).json({
                code: '00212',
                message: 'Tủ lạnh không thuộc quản trị viên nhóm.',
            });
        }

        // Update fields
        if (newQuantity !== undefined) {
            fridgeItem.quantity = newQuantity;
        }

        if (newNote !== undefined) {
            fridgeItem.note = newNote;
        }

        if (newUseWithin !== undefined) {
            fridgeItem.useWithin = newUseWithin;
            fridgeItem.expiryDate = new Date();
            fridgeItem.expiryDate.setDate(fridgeItem.expiryDate.getDate() + parseInt(newUseWithin));
        }

        if (newLocation !== undefined) {
            fridgeItem.location = newLocation;
        }

        await fridgeItem.save();

        const updatedItem = await FridgeItem.findById(fridgeItem._id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            });

        res.status(200).json({
            code: '00178',
            message: 'Thành công.',
            data: updatedItem,
        });
    } catch (error) {
        console.error('Update fridge item error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete fridge item
// @route   DELETE /api/fridge/
// @access  Private (requires group)
exports.deleteFridgeItem = async (req, res) => {
    try {
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({
                code: '00204',
                message: 'Vui lòng cung cấp id của item tủ lạnh.',
            });
        }

        // Check if user has group
        if (!req.user.group) {
            return res.status(400).json({
                code: '00210',
                message: 'Người dùng không thuộc bất kỳ nhóm nào.',
            });
        }

        const fridgeItem = await FridgeItem.findById(itemId);
        if (!fridgeItem) {
            return res.status(404).json({
                code: '00213',
                message: 'Mục tủ lạnh không tồn tại.',
            });
        }

        // Check if item belongs to user's group
        if (fridgeItem.group.toString() !== req.user.group.toString()) {
            return res.status(403).json({
                code: '00212',
                message: 'Tủ lạnh không thuộc quản trị viên nhóm.',
            });
        }

        await FridgeItem.deleteOne({ _id: fridgeItem._id });

        res.status(200).json({
            code: '00184',
            message: 'Xóa thành công.',
        });
    } catch (error) {
        console.error('Delete fridge item error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get all fridge items in group
// @route   GET /api/fridge/
// @access  Private (requires group)
exports.getFridgeItems = async (req, res) => {
    try {
        if (!req.user.group) {
            return res.status(400).json({
                code: '00185',
                message: 'Bạn chưa vào nhóm nào.',
            });
        }

        const fridgeItems = await FridgeItem.find({ group: req.user.group })
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            })
            .sort('expiryDate');

        res.status(200).json({
            code: '00188',
            message: 'Lấy danh sách thực phẩm thành công.',
            data: fridgeItems,
        });
    } catch (error) {
        console.error('Get fridge items error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get specific fridge item
// @route   GET /api/fridge/:id
// @access  Private (requires group)
exports.getFridgeItem = async (req, res) => {
    try {
        const fridgeItem = await FridgeItem.findById(req.params.id)
            .populate({
                path: 'food',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' },
                ],
            });

        if (!fridgeItem) {
            return res.status(404).json({
                code: '00213',
                message: 'Mục tủ lạnh không tồn tại.',
            });
        }

        res.status(200).json({
            code: '00178',
            message: 'Thành công.',
            data: fridgeItem,
        });
    } catch (error) {
        console.error('Get fridge item error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
