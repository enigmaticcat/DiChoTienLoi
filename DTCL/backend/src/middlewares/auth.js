const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    code: '00052',
                    message: 'Không thể tìm thấy người dùng.',
                });
            }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    code: '00011',
                    message: 'Phiên của bạn đã hết hạn, vui lòng đăng nhập lại.',
                });
            }
            return res.status(401).json({
                code: '00012',
                message: 'Token không hợp lệ. Token có thể đã hết hạn.',
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            code: '00006',
            message: 'Truy cập bị từ chối. Không có token được cung cấp.',
        });
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            code: '00017',
            message: 'Truy cập bị từ chối. Bạn không có quyền truy cập.',
        });
    }
};

// Check if user belongs to a group
const requireGroup = async (req, res, next) => {
    if (!req.user.group) {
        return res.status(400).json({
            code: '00096',
            message: 'Bạn không thuộc về nhóm nào.',
        });
    }
    next();
};

// Check if user is group admin
const groupAdminOnly = async (req, res, next) => {
    const Group = require('../models/Group');
    const group = await Group.findById(req.user.group);

    if (!group) {
        return res.status(400).json({
            code: '00096',
            message: 'Bạn không thuộc về nhóm nào.',
        });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            code: '00104',
            message: 'Bạn không phải admin, không thể thực hiện thao tác này.',
        });
    }

    req.group = group;
    next();
};

module.exports = { protect, adminOnly, requireGroup, groupAdminOnly };
