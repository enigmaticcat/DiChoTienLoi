
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (prompt) => {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
};

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('An admin user already exists:');
            console.log(`Email: ${existingAdmin.email}`);
            console.log(`Name: ${existingAdmin.name}`);

            const proceed = await question('\nDo you want to create another admin? (y/n): ');
            if (proceed.toLowerCase() !== 'y') {
                console.log('Cancelled.');
                process.exit(0);
            }
        }

        console.log('Create Admin Account\n');

        // Get admin details
        const email = await question('Email: ');
        const password = await question('Password (min 6 chars): ');
        const name = await question('Name: ');
        const username = await question('Username (optional, press Enter to skip): ');

        // Validate
        if (!email || !password || !name) {
            console.log('Email, password, and name are required!');
            process.exit(1);
        }

        if (password.length < 6) {
            console.log('Password must be at least 6 characters!');
            process.exit(1);
        }

        // Check if email exists
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            console.log('An account with this email already exists!');
            process.exit(1);
        }

        // Create admin user
        const adminData = {
            email: email.toLowerCase(),
            password,
            name,
            role: 'admin',
            isVerified: true, // Admin is auto-verified
        };

        if (username && username.trim()) {
            adminData.username = username.trim();
        }

        const admin = await User.create(adminData);

        console.log('\nAdmin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`ID: ${admin._id}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Name: ${admin.name}`);
        console.log(`Role: ${admin.role}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nYou can now login at POST /api/user/login');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
