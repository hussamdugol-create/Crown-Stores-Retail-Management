const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // استدعاء موديل المنتجات

// 1. أمر إضافة منتج جديد (POST request)
router.post('/add', async (req, res) => {
    try {
        const { name, barcode, price, stock, category } = req.body;

        // إنشاء منتج جديد بناءً على البيانات القادمة من الشاشة
        const newProduct = new Product({
            name,
            barcode,
            price,
            stock,
            category
        });

        // حفظ المنتج في قاعدة البيانات
        await newProduct.save();
        res.status(201).json({ success: true, message: "Product added successfully!", product: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding product", error: error.message });
    }
});

// 2. أمر جلب جميع المنتجات لعرضها للكاشير (GET request)
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find(); // جلب كل المنتجات من القاعدة
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
});

module.exports = router;