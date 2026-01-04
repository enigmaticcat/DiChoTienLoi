// Run this script to drop the old shopping list index
// Usage: node scripts/drop-shopping-index.js

require('dotenv').config();
const mongoose = require('mongoose');

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('shoppinglists');

        // Drop the old unique index
        try {
            await collection.dropIndex('group_1_date_1');
            console.log('✅ Successfully dropped index: group_1_date_1');
        } catch (err) {
            if (err.codeName === 'IndexNotFound') {
                console.log('ℹ️  Index group_1_date_1 does not exist (already dropped)');
            } else {
                throw err;
            }
        }

        // Also try dropping the other unique index if exists
        try {
            await collection.dropIndex('group_1_date_1_name_1');
            console.log('✅ Successfully dropped index: group_1_date_1_name_1');
        } catch (err) {
            if (err.codeName === 'IndexNotFound') {
                console.log('ℹ️  Index group_1_date_1_name_1 does not exist');
            }
        }

        console.log('\n✅ Done! Restart your backend server now.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropIndex();
