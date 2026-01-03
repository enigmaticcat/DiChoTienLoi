const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: [true, 'Group is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

shoppingListSchema.index({ group: 1, date: 1 }, { unique: true });
shoppingListSchema.index({ group: 1 });

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

module.exports = ShoppingList;
