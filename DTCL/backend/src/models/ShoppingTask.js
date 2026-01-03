const mongoose = require('mongoose');

const shoppingTaskSchema = new mongoose.Schema(
    {
        shoppingList: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ShoppingList',
            required: [true, 'Shopping list is required'],
        },
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: [true, 'Food is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
shoppingTaskSchema.index({ shoppingList: 1 });
shoppingTaskSchema.index({ food: 1 });
shoppingTaskSchema.index({ assignedTo: 1 });
shoppingTaskSchema.index({ isCompleted: 1 });

const ShoppingTask = mongoose.model('ShoppingTask', shoppingTaskSchema);

module.exports = ShoppingTask;
