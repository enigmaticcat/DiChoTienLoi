const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Recipe name is required'],
            trim: true,
        },
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: [true, 'Food is required'],
        },
        description: {
            type: String,
            trim: true,
        },
        htmlContent: {
            type: String, // HTML content for recipe instructions
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
recipeSchema.index({ food: 1 });
recipeSchema.index({ name: 'text', description: 'text' }); // Text search index

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
