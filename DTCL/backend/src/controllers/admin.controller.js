const Category = require('../models/Category');
const Unit = require('../models/Unit');
const User = require('../models/User');
const Group = require('../models/Group');

// ==================== CATEGORY ====================

// @desc    Get all categories
// @route   GET /api/admin/category/
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

// @desc    Create a category
// @route   POST /api/admin/category/
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                code: '00131',
                message: 'Thiếu thông tin tên của category.',
            });
        }

        // Check if category exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                code: '00132',
                message: 'Đã tồn tại category có tên này.',
            });
        }

        const category = await Category.create({ name });

        res.status(201).json({
            code: '00135',
            message: 'Tạo category thành công.',
            data: category,
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            code: '00133',
            message: 'Server error.',
        });
    }
};

// @desc    Edit category by name
// @route   PUT /api/admin/category/
// @access  Private (Admin)
exports.editCategory = async (req, res) => {
    try {
        const { oldName, newName } = req.body;

        if (!oldName || !newName) {
            return res.status(400).json({
                code: '00136',
                message: 'Thiếu thông tin name cũ, name mới.',
            });
        }

        if (oldName === newName) {
            return res.status(400).json({
                code: '00137',
                message: 'Tên cũ trùng với tên mới.',
            });
        }

        // Check if old category exists
        const category = await Category.findOne({ name: oldName });
        if (!category) {
            return res.status(404).json({
                code: '00138',
                message: 'Không tìm thấy category với tên cung cấp.',
            });
        }

        // Check if new name exists
        const existingCategory = await Category.findOne({ name: newName });
        if (existingCategory) {
            return res.status(400).json({
                code: '00138x',
                message: 'Tên mới đã tồn tại.',
            });
        }

        category.name = newName;
        await category.save();

        res.status(200).json({
            code: '00141',
            message: 'Sửa đổi category thành công.',
            data: category,
        });
    } catch (error) {
        console.error('Edit category error:', error);
        res.status(500).json({
            code: '00139',
            message: 'Server error.',
        });
    }
};

// @desc    Delete category by name
// @route   DELETE /api/admin/category/
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                code: '00142',
                message: 'Thiếu thông tin tên của category.',
            });
        }

        const category = await Category.findOne({ name });
        if (!category) {
            return res.status(404).json({
                code: '00143',
                message: 'Không tìm thấy category với tên cung cấp.',
            });
        }

        await Category.deleteOne({ _id: category._id });

        res.status(200).json({
            code: '00146',
            message: 'Xóa category thành công.',
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            code: '00144',
            message: 'Server error.',
        });
    }
};

// ==================== UNIT ====================

// @desc    Get all units
// @route   GET /api/admin/unit/
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

// @desc    Create a unit
// @route   POST /api/admin/unit/
// @access  Private (Admin)
exports.createUnit = async (req, res) => {
    try {
        const { unitName } = req.body;

        if (!unitName) {
            return res.status(400).json({
                code: '00112',
                message: 'Thiếu thông tin tên của đơn vị.',
            });
        }

        // Check if unit exists
        const existingUnit = await Unit.findOne({ name: unitName });
        if (existingUnit) {
            return res.status(400).json({
                code: '00113',
                message: 'Đã tồn tại đơn vị có tên này.',
            });
        }

        const unit = await Unit.create({ name: unitName });

        res.status(201).json({
            code: '00116',
            message: 'Tạo đơn vị thành công.',
            data: unit,
        });
    } catch (error) {
        console.error('Create unit error:', error);
        res.status(500).json({
            code: '00114',
            message: 'Server error.',
        });
    }
};

// @desc    Edit unit by name
// @route   PUT /api/admin/unit/
// @access  Private (Admin)
exports.editUnit = async (req, res) => {
    try {
        const { oldName, newName } = req.body;

        if (!oldName || !newName) {
            return res.status(400).json({
                code: '00117',
                message: 'Thiếu thông tin name cũ, name mới.',
            });
        }

        if (oldName === newName) {
            return res.status(400).json({
                code: '00118',
                message: 'Tên cũ trùng với tên mới.',
            });
        }

        const unit = await Unit.findOne({ name: oldName });
        if (!unit) {
            return res.status(404).json({
                code: '00119',
                message: 'Không tìm thấy đơn vị với tên cung cấp.',
            });
        }

        unit.name = newName;
        await unit.save();

        res.status(200).json({
            code: '00122',
            message: 'Sửa đổi đơn vị thành công.',
            data: unit,
        });
    } catch (error) {
        console.error('Edit unit error:', error);
        res.status(500).json({
            code: '00120',
            message: 'Server error.',
        });
    }
};

// @desc    Delete unit by name
// @route   DELETE /api/admin/unit/
// @access  Private (Admin)
exports.deleteUnit = async (req, res) => {
    try {
        const { unitName } = req.body;

        if (!unitName) {
            return res.status(400).json({
                code: '00123',
                message: 'Thiếu thông tin tên của đơn vị.',
            });
        }

        const unit = await Unit.findOne({ name: unitName });
        if (!unit) {
            return res.status(404).json({
                code: '00125',
                message: 'Không tìm thấy đơn vị với tên cung cấp.',
            });
        }

        await Unit.deleteOne({ _id: unit._id });

        res.status(200).json({
            code: '00128',
            message: 'Xóa đơn vị thành công.',
        });
    } catch (error) {
        console.error('Delete unit error:', error);
        res.status(500).json({
            code: '00126',
            message: 'Server error.',
        });
    }
};

// ==================== LOGS ====================

// @desc    Get system logs
// @route   GET /api/admin/logs/
// @access  Private (Admin)
exports.getLogs = async (req, res) => {
    try {
        // TODO: Implement actual logging system
        // For now, return empty logs
        res.status(200).json({
            code: '00109',
            message: 'Lấy log hệ thống thành công.',
            data: [],
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users/
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password -verificationCode -refreshToken')
            .populate('group', 'name')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            code: '00098',
            message: 'Lấy danh sách người dùng thành công.',
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -verificationCode -refreshToken')
            .populate('group', 'name');

        if (!user) {
            return res.status(404).json({
                code: '00052',
                message: 'Không thể tìm thấy người dùng.',
            });
        }

        res.status(200).json({
            code: '00089',
            message: 'Thông tin người dùng đã được lấy thành công.',
            data: user,
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                code: '00025',
                message: 'Vui lòng cung cấp role hợp lệ (user hoặc admin).',
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                code: '00052',
                message: 'Không thể tìm thấy người dùng.',
            });
        }

        // Prevent admin from changing their own role
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                code: '00017',
                message: 'Bạn không thể thay đổi role của chính mình.',
            });
        }

        user.role = role;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            code: '00086',
            message: `Đã cập nhật role thành ${role} thành công.`,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete user by admin
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                code: '00052',
                message: 'Không thể tìm thấy người dùng.',
            });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                code: '00017',
                message: 'Bạn không thể xóa tài khoản của chính mình.',
            });
        }

        // Remove user from group if in one
        if (user.group) {
            const group = await Group.findById(user.group);
            if (group) {
                // If user is group admin, delete the group or transfer ownership
                if (group.admin.toString() === user._id.toString()) {
                    // Remove all members from group
                    await User.updateMany(
                        { group: group._id },
                        { $unset: { group: 1 } }
                    );
                    await Group.deleteOne({ _id: group._id });
                } else {
                    // Just remove user from group members
                    await Group.findByIdAndUpdate(group._id, {
                        $pull: { members: user._id },
                    });
                }
            }
        }

        await User.deleteOne({ _id: user._id });

        res.status(200).json({
            code: '00092',
            message: 'Tài khoản người dùng đã được xóa thành công.',
        });
    } catch (error) {
        console.error('Delete user by admin error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats/
// @access  Private (Admin)
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalGroups = await Group.countDocuments();
        const totalCategories = await Category.countDocuments();
        const totalUnits = await Unit.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });

        res.status(200).json({
            code: '00098',
            message: 'Thống kê hệ thống.',
            data: {
                users: {
                    total: totalUsers,
                    admins: totalAdmins,
                    verified: verifiedUsers,
                },
                groups: totalGroups,
                categories: totalCategories,
                units: totalUnits,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
