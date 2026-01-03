/**
 * Seed Script - Thêm dữ liệu mẫu cho Categories và Units
 * Chạy: node src/scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Unit = require('../models/Unit');

// Dữ liệu mẫu cho Categories
const categoriesData = [
    { name: 'Thịt' },
    { name: 'Cá & Hải sản' },
    { name: 'Rau củ' },
    { name: 'Trái cây' },
    { name: 'Trứng & Sữa' },
    { name: 'Đồ khô' },
    { name: 'Đồ hộp' },
    { name: 'Gia vị' },
    { name: 'Đồ uống' },
    { name: 'Bánh kẹo' },
    { name: 'Đồ đông lạnh' },
    { name: 'Mì & Bún & Phở' },
    { name: 'Dầu ăn' },
    { name: 'Ngũ cốc' },
    { name: 'Khác' },
];

// Dữ liệu mẫu cho Units
const unitsData = [
    { name: 'kg' },
    { name: 'g' },
    { name: 'lít' },
    { name: 'ml' },
    { name: 'quả' },
    { name: 'trái' },
    { name: 'củ' },
    { name: 'bó' },
    { name: 'gói' },
    { name: 'hộp' },
    { name: 'chai' },
    { name: 'lon' },
    { name: 'túi' },
    { name: 'miếng' },
    { name: 'con' },
    { name: 'cái' },
    { name: 'chục' },
    { name: 'vỉ' },
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - comment out if you want to keep existing)
        // await Category.deleteMany({});
        // await Unit.deleteMany({});
        // console.log('🗑️  Cleared existing categories and units');

        // Seed Categories
        let categoriesCreated = 0;
        for (const cat of categoriesData) {
            try {
                await Category.create(cat);
                categoriesCreated++;
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`⏭️  Category "${cat.name}" already exists, skipping...`);
                } else {
                    throw error;
                }
            }
        }
        console.log(`✅ Created ${categoriesCreated} categories`);

        // Seed Units
        let unitsCreated = 0;
        for (const unit of unitsData) {
            try {
                await Unit.create(unit);
                unitsCreated++;
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`⏭️  Unit "${unit.name}" already exists, skipping...`);
                } else {
                    throw error;
                }
            }
        }
        console.log(`✅ Created ${unitsCreated} units`);

        // Display summary
        const totalCategories = await Category.countDocuments();
        const totalUnits = await Unit.countDocuments();
        console.log('\n📊 Database Summary:');
        console.log(`   Categories: ${totalCategories}`);
        console.log(`   Units: ${totalUnits}`);

        console.log('\n🎉 Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedDatabase();
