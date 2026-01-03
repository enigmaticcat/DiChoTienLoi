const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { sendVerificationEmail } = require('../services/email.service');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
    });
};

// Generate verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/user/
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, password, name, language, timezone, deviceId } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                code: '00025',
                message: 'Vui lòng cung cấp tất cả các trường bắt buộc!',
            });
        }

        // Validate email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                code: '00026',
                message: 'Vui lòng cung cấp một địa chỉ email hợp lệ!',
            });
        }

        // Validate password
        if (password.length < 6 || password.length > 20) {
            return res.status(400).json({
                code: '00027',
                message: 'Vui lòng cung cấp mật khẩu dài hơn 6 ký tự và ngắn hơn 20 ký tự.',
            });
        }

        // Validate name
        if (name.length < 3 || name.length > 30) {
            return res.status(400).json({
                code: '00028',
                message: 'Vui lòng cung cấp một tên dài hơn 3 ký tự và ngắn hơn 30 ký tự.',
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({
                code: '00032',
                message: 'Một tài khoản với địa chỉ email này đã tồn tại.',
            });
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();
        const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password,
            name,
            language: language || 'vi',
            timezone: timezone || 'Asia/Ho_Chi_Minh',
            deviceId,
            verificationCode,
            verificationExpiry,
            isVerified: false,
        });

        // Send verification email (non-blocking)
        sendVerificationEmail(user.email, verificationCode, user.name)
            .then(result => {
                if (result.success) {
                    console.log(`📧 Verification email sent to ${user.email}`);
                }
            })
            .catch(err => console.error('Email error:', err));

        res.status(201).json({
            code: '00035',
            message: 'Bạn đã đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                // verificationCode, // Uncomment for testing without email
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Login user
// @route   POST /api/user/login/
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                code: '00038',
                message: 'Vui lòng cung cấp tất cả các trường bắt buộc!',
            });
        }

        // Validate email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                code: '00039',
                message: 'Vui lòng cung cấp một địa chỉ email hợp lệ!',
            });
        }

        // Check for user
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(400).json({
                code: '00042',
                message: 'Không tìm thấy tài khoản với địa chỉ email này.',
            });
        }

        // Check if email is verified (temporarily disabled for testing)
        // TODO: Re-enable this after setting up email service
        // if (!user.isVerified) {
        //     return res.status(400).json({
        //         code: '00044',
        //         message: 'Email của bạn chưa được xác minh, vui lòng xác minh email của bạn.',
        //     });
        // }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                code: '00045',
                message: 'Bạn đã nhập một email hoặc mật khẩu không hợp lệ.',
            });
        }

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            code: '00047',
            message: 'Bạn đã đăng nhập thành công.',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                group: user.group,
                token,
                refreshToken,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Logout user
// @route   POST /api/user/logout/
// @access  Private
exports.logout = async (req, res) => {
    try {
        req.user.refreshToken = undefined;
        await req.user.save({ validateBeforeSave: false });

        res.status(200).json({
            code: '00050',
            message: 'Đăng xuất thành công.',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Refresh token
// @route   POST /api/user/refresh-token/
// @access  Public
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                code: '00059',
                message: 'Vui lòng cung cấp token làm mới.',
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                code: '00063',
                message: 'Token đã hết hạn, vui lòng đăng nhập.',
            });
        }

        // Find user with refresh token
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                code: '00061',
                message: 'Token được cung cấp không khớp với người dùng, vui lòng đăng nhập.',
            });
        }

        // Generate new tokens
        const newToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Save new refresh token
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            code: '00066',
            message: 'Token đã được làm mới thành công.',
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Send verification code
// @route   POST /api/user/send-verification-code/
// @access  Public
exports.sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                code: '00005',
                message: 'Vui lòng cung cấp đầy đủ thông tin để gửi mã.',
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                code: '00036',
                message: 'Không tìm thấy tài khoản với địa chỉ email này.',
            });
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        user.verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        // Send verification email (non-blocking)
        sendVerificationEmail(user.email, verificationCode, user.name)
            .then(result => {
                if (result.success) {
                    console.log(`📧 Verification email sent to ${user.email}`);
                }
            })
            .catch(err => console.error('Email error:', err));

        res.status(200).json({
            code: '00048',
            message: 'Mã đã được gửi đến email của bạn thành công.',
            data: {
                // verificationCode, // Uncomment for testing without email
            },
        });
    } catch (error) {
        console.error('Send verification code error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};

// @desc    Verify email
// @route   POST /api/user/verify-email/
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { code, token } = req.body;

        if (!code) {
            return res.status(400).json({
                code: '00053',
                message: 'Vui lòng gửi một mã xác nhận.',
            });
        }

        // Find user by verification code
        const user = await User.findOne({
            verificationCode: code,
            verificationExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                code: '00054',
                message: 'Mã bạn nhập không khớp với mã chúng tôi đã gửi đến email của bạn. Vui lòng kiểm tra lại.',
            });
        }

        // Mark as verified
        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            code: '00058',
            message: 'Địa chỉ email của bạn đã được xác minh thành công.',
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            code: '00008',
            message: 'Đã xảy ra lỗi máy chủ nội bộ, vui lòng thử lại.',
        });
    }
};
