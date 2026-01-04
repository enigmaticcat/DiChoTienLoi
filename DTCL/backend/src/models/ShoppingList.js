const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: [true, 'Group is required'],
        },
        name: {
            type: String,
            trim: true,
            default: '',
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

// Only index for faster queries, no unique constraint
shoppingListSchema.index({ group: 1 });
shoppingListSchema.index({ group: 1, date: -1 });

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

// Drop old unique index if exists (run once on startup)
ShoppingList.collection.dropIndex('group_1_date_1').catch(() => {
    // Index doesn't exist, ignore
});

module.exports = ShoppingList;
