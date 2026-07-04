const mongoose = require('mongoose');

// تحديد كتالوج أو هيكل بيانات المنتج
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // خانة إجبارية
        trim: true
    },
    barcode: {
        type: String,
        required: true,
        unique: true // لا يمكن لمنتجين امتلاك نفس الباركود
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0 // الكمية المتوفرة في المخزن
    },
    category: {
        type: String,
        required: true
    }
}, {
    timestamps: true // يقوم بتسجيل وقت إضافة المنتج ووقت تحديثه تلقائياً
});

// تصدير النموذج لكي نستخدمه في السيرفر لاحقاً
module.exports = mongoose.model('Product', productSchema);
