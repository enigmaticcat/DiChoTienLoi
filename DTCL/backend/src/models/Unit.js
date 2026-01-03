const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Unit name is required'],
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// name is already indexed via unique:true

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
