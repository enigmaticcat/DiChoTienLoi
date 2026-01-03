// Export all models from a single entry point
const User = require('./User');
const Group = require('./Group');
const Unit = require('./Unit');
const Category = require('./Category');
const Food = require('./Food');
const FridgeItem = require('./FridgeItem');
const ShoppingList = require('./ShoppingList');
const ShoppingTask = require('./ShoppingTask');
const MealPlan = require('./MealPlan');
const Recipe = require('./Recipe');

module.exports = {
    User,
    Group,
    Unit,
    Category,
    Food,
    FridgeItem,
    ShoppingList,
    ShoppingTask,
    MealPlan,
    Recipe,
};
