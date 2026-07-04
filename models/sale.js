const mongoose = require('mongoose');

// تحديد هيكل بيانات فاتورة البيع
const saleSchema = new mongoose.Schema({
    cashierName: {
        type: String,
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // ربط العنصر بنموذج المنتجات الأصلي
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            priceAtSale: {
                type: Number,
                required: true // سعر المنتج وقت البيع
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card'], // طرق الدفع المتاحة فقط
        default: 'cash'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);