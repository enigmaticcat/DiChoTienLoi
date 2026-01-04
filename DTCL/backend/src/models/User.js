const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            maxlength: [100, 'Password cannot exceed 100 characters'],
            select: false,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            minlength: [3, 'Name must be at least 3 characters'],
            maxlength: [30, 'Name cannot exceed 30 characters'],
            trim: true,
        },
        username: {
            type: String,
            unique: true,
            sparse: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [15, 'Username cannot exceed 15 characters'],
            trim: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        dateOfBirth: {
            type: Date,
        },
        language: {
            type: String,
            enum: ['vi', 'en'],
            default: 'vi',
        },
        timezone: {
            type: String,
            default: 'Asia/Ho_Chi_Minh',
        },
        deviceId: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationCode: {
            type: String,
        },
        verificationExpiry: {
            type: Date,
        },
        refreshToken: {
            type: String,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
        },
        resetPasswordCode: {
            type: String,
        },
        resetPasswordExpiry: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Index for faster queries (email and username already indexed via unique:true)
userSchema.index({ group: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
