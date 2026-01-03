const User = require('../models/User');
const Group = require('../models/Group');

// @desc    Create a group
// @route   POST /api/user/group/
// @access  Private
exports.createGroup = async (req, res) => {
    try {
        // Check if user already in a group
        if (req.user.group) {
            return res.status(400).json({
                code: '00093',
                message: 'Không thể tạo nhóm, bạn đã thuộc về một nhóm rồi.',
            });
        }

        // Create group
        const group = await Group.create({
            name: req.body.name || 'Nhóm gia đình',
            admin: req.user._id,
            members: [req.user._id],
        });

        // Update user with group
        await User.findByIdAndUpdate(req.user._id, { group: group._id });

        res.status(201).json({
            code: '00095',
            message: 'Tạo nhóm thành công.',
            data: {
                id: group._id,
                name: group.name,
                admin: req.user._id,
                members: [req.user._id],
            },
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Get group members
// @route   GET /api/user/group/
// @access  Private
exports.getGroupMembers = async (req, res) => {
    try {
        if (!req.user.group) {
            return res.status(400).json({
                code: '00096',
                message: 'Bạn không thuộc về nhóm nào.',
            });
        }

        const group = await Group.findById(req.user.group)
            .populate('admin', 'name email username avatar')
            .populate('members', 'name email username avatar');

        res.status(200).json({
            code: '00098',
            message: 'Thành công.',
            data: {
                id: group._id,
                name: group.name,
                admin: group.admin,
                members: group.members,
            },
        });
    } catch (error) {
        console.error('Get group members error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Add member to group
// @route   POST /api/user/group/add/
// @access  Private (Group Admin)
exports.addMember = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                code: '00100',
                message: 'Thiếu username hoặc email.',
            });
        }

        // Find user by username or email
        const userToAdd = await User.findOne({
            $or: [
                { username: username },
                { email: username.toLowerCase() }
            ]
        });
        if (!userToAdd) {
            return res.status(404).json({
                code: '00099x',
                message: 'Không tìm thấy người dùng với username/email này.',
            });
        }

        // Check if user already in a group
        if (userToAdd.group) {
            return res.status(400).json({
                code: '00099',
                message: 'Người này đã thuộc về một nhóm.',
            });
        }

        // Add user to group
        await Group.findByIdAndUpdate(req.group._id, {
            $push: { members: userToAdd._id },
        });

        // Update user with group
        await User.findByIdAndUpdate(userToAdd._id, { group: req.group._id });

        res.status(200).json({
            code: '00102',
            message: 'Người dùng thêm vào nhóm thành công.',
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete member from group
// @route   DELETE /api/user/group/
// @access  Private (Group Admin)
exports.deleteMember = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                code: '00107',
                message: 'Thiếu username hoặc email.',
            });
        }

        // Find user by username or email
        const userToRemove = await User.findOne({
            $or: [
                { username: username },
                { email: username.toLowerCase() }
            ]
        });
        if (!userToRemove) {
            return res.status(404).json({
                code: '00099x',
                message: 'Không tìm thấy người dùng với username/email này.',
            });
        }

        // Check if user is in the group
        if (!userToRemove.group || userToRemove.group.toString() !== req.group._id.toString()) {
            return res.status(400).json({
                code: '00103',
                message: 'Người này chưa vào nhóm nào.',
            });
        }

        // Cannot remove admin
        if (userToRemove._id.toString() === req.group.admin.toString()) {
            return res.status(400).json({
                code: '00104',
                message: 'Không thể xóa admin khỏi nhóm.',
            });
        }

        // Remove user from group
        await Group.findByIdAndUpdate(req.group._id, {
            $pull: { members: userToRemove._id },
        });

        // Remove group from user
        await User.findByIdAndUpdate(userToRemove._id, { $unset: { group: 1 } });

        res.status(200).json({
            code: '00106',
            message: 'Xóa thành công.',
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Leave group (for members)
// @route   POST /api/user/group/leave
// @access  Private
exports.leaveGroup = async (req, res) => {
    try {
        if (!req.user.group) {
            return res.status(400).json({
                code: '00096',
                message: 'Bạn không thuộc về nhóm nào.',
            });
        }

        const group = await Group.findById(req.user.group);
        if (!group) {
            return res.status(404).json({
                code: '00110',
                message: 'Không tìm thấy nhóm.',
            });
        }

        // Admin cannot leave, must delete group instead
        if (group.admin.toString() === req.user._id.toString()) {
            return res.status(400).json({
                code: '00111',
                message: 'Admin không thể rời nhóm. Hãy chuyển quyền admin hoặc xóa nhóm.',
            });
        }

        // Remove user from group
        await Group.findByIdAndUpdate(req.user.group, {
            $pull: { members: req.user._id },
        });

        // Remove group from user
        await User.findByIdAndUpdate(req.user._id, { $unset: { group: 1 } });

        res.status(200).json({
            code: '00112',
            message: 'Bạn đã rời khỏi nhóm.',
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete group (admin only)
// @route   DELETE /api/user/group/delete
// @access  Private (Group Admin)
exports.deleteGroup = async (req, res) => {
    try {
        if (!req.user.group) {
            return res.status(400).json({
                code: '00096',
                message: 'Bạn không thuộc về nhóm nào.',
            });
        }

        const group = await Group.findById(req.user.group);
        if (!group) {
            return res.status(404).json({
                code: '00110',
                message: 'Không tìm thấy nhóm.',
            });
        }

        // Only admin can delete
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                code: '00115',
                message: 'Chỉ trưởng nhóm mới có thể xóa nhóm.',
            });
        }

        // Remove group from all members
        await User.updateMany(
            { group: group._id },
            { $unset: { group: 1 } }
        );

        // Delete the group
        await Group.findByIdAndDelete(group._id);

        res.status(200).json({
            code: '00116',
            message: 'Đã xóa nhóm thành công.',
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
