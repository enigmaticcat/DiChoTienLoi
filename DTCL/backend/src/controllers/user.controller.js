const User = require('../models/User');
const Group = require('../models/Group');

// @desc    Get user profile
// @route   GET /api/user/
// @access  Private
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('group');

        res.status(200).json({
            code: '00089',
            message: 'Thông tin người dùng đã được lấy thành công.',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                language: user.language,
                group: user.group,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/
// @access  Private
exports.updateUser = async (req, res) => {
    try {
        const { username, name, gender, dateOfBirth, language } = req.body;
        const updates = {};

        // Validate username
        if (username) {
            if (username.length < 3 || username.length > 15) {
                return res.status(400).json({
                    code: '00081',
                    message: 'Vui lòng cung cấp một tên người dùng dài hơn 3 ký tự và ngắn hơn 15 ký tự.',
                });
            }

            // Check if username exists
            const existingUser = await User.findOne({ username, _id: { $ne: req.user._id } });
            if (existingUser) {
                return res.status(400).json({
                    code: '00084',
                    message: 'Đã có một người dùng với tên người dùng này, vui lòng nhập tên khác.',
                });
            }
            updates.username = username;
        }

        // Validate name
        if (name) {
            if (name.length < 3 || name.length > 30) {
                return res.status(400).json({
                    code: '00077',
                    message: 'Vui lòng cung cấp một tên dài hơn 3 ký tự và ngắn hơn 30 ký tự.',
                });
            }
            updates.name = name;
        }

        // Validate gender
        if (gender) {
            if (!['male', 'female', 'other'].includes(gender)) {
                return res.status(400).json({
                    code: '00078',
                    message: 'Các tùy chọn giới tính hợp lệ, female-male-other, vui lòng cung cấp một trong số chúng.',
                });
            }
            updates.gender = gender;
        }

        // Validate language
        if (language) {
            if (!['vi', 'en'].includes(language)) {
                return res.status(400).json({
                    code: '00079',
                    message: 'Các tùy chọn ngôn ngữ hợp lệ, vi-en, vui lòng cung cấp một trong số chúng.',
                });
            }
            updates.language = language;
        }

        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            if (isNaN(dob.getTime())) {
                return res.status(400).json({
                    code: '00080',
                    message: 'Vui lòng cung cấp một ngày sinh hợp lệ.',
                });
            }
            updates.dateOfBirth = dob;
        }

        // Handle image upload
        if (req.file) {
            updates.avatar = `/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            code: '00086',
            message: 'Thông tin hồ sơ của bạn đã được thay đổi thành công.',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                language: user.language,
            },
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Delete user account
// @route   DELETE /api/user/
// @access  Private
exports.deleteUser = async (req, res) => {
    try {
        // Remove user from group if in one
        if (req.user.group) {
            await Group.findByIdAndUpdate(req.user.group, {
                $pull: { members: req.user._id },
            });
        }

        await User.findByIdAndDelete(req.user._id);

        res.status(200).json({
            code: '00092',
            message: 'Tài khoản của bạn đã bị xóa thành công.',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Change password
// @route   POST /api/user/change-password/
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Validate
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                code: '00069',
                message: 'Vui lòng cung cấp mật khẩu cũ và mới dài hơn 6 ký tự và ngắn hơn 20 ký tự.',
            });
        }

        if (newPassword.length < 6 || newPassword.length > 20) {
            return res.status(400).json({
                code: '00068',
                message: 'Vui lòng cung cấp một mật khẩu dài hơn 6 và ngắn hơn 20 ký tự.',
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check old password
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({
                code: '00072',
                message: 'Mật khẩu cũ của bạn không khớp với mật khẩu bạn nhập, vui lòng nhập mật khẩu đúng.',
            });
        }

        // Check if new password is same as old
        const isSame = await user.comparePassword(newPassword);
        if (isSame) {
            return res.status(400).json({
                code: '00073',
                message: 'Mật khẩu mới của bạn không nên giống với mật khẩu cũ, vui lòng thử một mật khẩu khác.',
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            code: '00076',
            message: 'Mật khẩu của bạn đã được thay đổi thành công.',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
