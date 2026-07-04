const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});

    const sampleProducts = [
      { name: 'Coca-Cola 500ml', barcode: '1001', price: 1.5, stock: 24, category: 'Refreshments' },
      { name: 'Fresh Milk 1L', barcode: '1002', price: 2.0, stock: 18, category: 'Dairy Products' },
      { name: 'White Bread', barcode: '1003', price: 1.2, stock: 12, category: 'Bakery' },
      { name: 'Toilet Paper', barcode: '1004', price: 3.2, stock: 8, category: 'Household' }
    ];

    await Product.insertMany(sampleProducts);
    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
