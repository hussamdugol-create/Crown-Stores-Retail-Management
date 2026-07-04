const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 

// 📥 ربط مسارات المنتجات بالسيرفر هنا
const productRoutes = require('./Routes/productRoutes');
const authRoutes = require('./Routes/authRoutes');
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// كود الاتصال بقاعدة البيانات
if (!process.env.MONGO_URI) {
    console.log('❌ MONGO_URI is missing. Please add it to the .env file.');
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('========================================');
            console.log('🎉 Database Connected Successfully to MongoDB!');
            console.log('========================================');
        })
        .catch((err) => {
            console.log('❌ DATABASE CONNECTION ERROR DETECTED:', err.message);
        });
}

// تشغيل الواجهة الأمامية (الصفحة الرئيسية)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});