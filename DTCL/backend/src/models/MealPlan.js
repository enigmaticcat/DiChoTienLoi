const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: [true, 'Group is required'],
        },
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: [true, 'Food is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        mealType: {
            type: String,
            enum: ['sáng', 'trưa', 'tối'],
            required: [true, 'Meal type is required'],
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

// Index for faster queries
mealPlanSchema.index({ group: 1, date: 1 });
mealPlanSchema.index({ group: 1 });
mealPlanSchema.index({ food: 1 });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan;
