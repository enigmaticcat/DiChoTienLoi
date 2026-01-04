const mongoose = require('mongoose');

const fridgeItemSchema = new mongoose.Schema(
    {
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: [true, 'Food is required'],
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: [true, 'Group is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
        },
        useWithin: {
            type: Number, // Days until expiry
            min: [0, 'useWithin cannot be negative'],
        },
        expiryDate: {
            type: Date,
        },
        note: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            enum: ['freezer', 'chiller', 'vegetable', 'door'],
            default: 'chiller',
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique food per group in fridge
fridgeItemSchema.index({ food: 1, group: 1 }, { unique: true });
fridgeItemSchema.index({ group: 1 });
fridgeItemSchema.index({ expiryDate: 1 });

const FridgeItem = mongoose.model('FridgeItem', fridgeItemSchema);

module.exports = FridgeItem;
