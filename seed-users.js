const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crown-stores-rms');
        console.log('📦 Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Create test users
        const users = [
            {
                username: 'cashier',
                password: '123456',
                email: 'cashier@crownstores.com',
                name: 'John Cashier',
                role: 'agent'
            },
            {
                username: 'manager',
                password: '123456',
                email: 'manager@crownstores.com',
                name: 'Sarah Manager',
                role: 'manager'
            },
            {
                username: 'director',
                password: '123456',
                email: 'director@crownstores.com',
                name: 'Ahmed Director',
                role: 'director'
            }
        ];

        // Hash passwords before inserting because insertMany bypasses save hooks
        const hashedUsers = await Promise.all(users.map(async u => ({
            ...u,
            password: await bcrypt.hash(u.password, 10),
            isActive: true // seeded users should be active for testing
        })));

        await User.insertMany(hashedUsers);
        console.log('✅ Test users created successfully');

        const createdUsers = await User.find({});
        console.log('\n📋 Created Users:');
        createdUsers.forEach(user => {
            console.log(`  - ${user.username} (${user.role}): ${user.email}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seedUsers();
