const products = [
    { id: 1, name: 'Coca-Cola 500ml', price: 1.5, stock: 24, barcode: '1001' },
    { id: 2, name: 'Fresh Milk 1L', price: 2.0, stock: 18, barcode: '1002' },
    { id: 3, name: 'White Bread', price: 1.2, stock: 12, barcode: '1003' },
    { id: 4, name: 'Toilet Paper', price: 3.2, stock: 8, barcode: '1004' }
];

let cart = [];

function populateProducts() {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) {
        return;
    }

    productSelect.innerHTML = '<option value="" disabled selected>Choose a product...</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - $${product.price.toFixed(2)} (Stock: ${product.stock})`;
        option.dataset.name = product.name;
        option.dataset.price = product.price;
        option.dataset.stock = product.stock;
        option.dataset.barcode = product.barcode;
        productSelect.appendChild(option);
    });
}

let currentReceipt = null;

function updateCartTable() {
    const tbody = document.getElementById('cartTableBody');
    const grandTotalElement = document.getElementById('grandTotal');
    const stockStatus = document.getElementById('stockStatus');

    if (!tbody || !grandTotalElement) {
        return;
    }

    tbody.innerHTML = '';
    let currentGrandTotal = 0;

    cart.forEach(item => {
        currentGrandTotal += item.total;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.total.toFixed(2)}</td>
            </tr>`;
    });

    grandTotalElement.textContent = `$${currentGrandTotal.toFixed(2)}`;

    if (stockStatus) {
        const lowStock = products.filter(product => product.stock <= 10);
        stockStatus.innerHTML = lowStock.length
            ? `Low stock alerts: ${lowStock.map(product => `${product.name} (${product.stock})`).join(', ')}`
            : 'Inventory is healthy. No low stock alerts.';
    }
}

function buildReceipt() {
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    return {
        receiptNumber: `CSRMS-${Date.now()}`,
        date: new Date().toLocaleString(),
        items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price, total: item.total })),
        total,
        agent: 'Sales Agent'
    };
}

function renderReceipt(receipt) {
    const receiptPreview = document.getElementById('receiptPreview');
    if (!receiptPreview) return;

    receiptPreview.innerHTML = `
        <div>
            <div class="mb-2"><strong>Receipt #:</strong> ${receipt.receiptNumber}</div>
            <div class="mb-2"><strong>Date:</strong> ${receipt.date}</div>
            <table class="table table-sm table-borderless mb-2">
                <thead>
                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                </thead>
                <tbody>${receipt.items.map(i => `
                    <tr>
                        <td>${i.name}</td>
                        <td>${i.qty}</td>
                        <td>$${i.price.toFixed(2)}</td>
                        <td>$${i.total.toFixed(2)}</td>
                    </tr>`).join('')}</tbody>
            </table>
            <div class="text-end"><strong>Grand Total: $${receipt.total.toFixed(2)}</strong></div>
            <div class="text-muted mt-2">Processed by: ${receipt.agent}</div>
        </div>`;
}

function appendReceiptHistory(receipt) {
    const history = document.getElementById('receiptHistoryList');
    if (!history) return;

    const receiptRecord = document.createElement('div');
    receiptRecord.className = 'mb-3 p-3 bg-white rounded-3 border';
    receiptRecord.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
                <strong>Receipt #</strong> ${receipt.receiptNumber}<br>
                <small class="text-muted">${receipt.date}</small>
            </div>
            <div class="text-end">
                <span class="badge bg-warning text-dark">$${receipt.total.toFixed(2)}</span>
            </div>
        </div>
        <div class="text-muted">${receipt.items.map(item => `${item.qty}× ${item.name}`).join(' · ')}</div>
    `;

    if (history.textContent.includes('No receipts yet')) {
        history.innerHTML = '';
    }
    history.prepend(receiptRecord);
}

function exportReceipt(receipt) {
    const element = document.createElement('a');
    const content = `Receipt Number: ${receipt.receiptNumber}\nDate: ${receipt.date}\nAgent: ${receipt.agent}\n\n` +
        receipt.items.map(item => `${item.qty} x ${item.name} @ $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`).join('\n') +
        `\n\nTotal: $${receipt.total.toFixed(2)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = `${receipt.receiptNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function printReceipt(receipt) {
    const printWindow = window.open('', 'PRINT', 'height=600,width=800');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Receipt</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="container mt-3">');
    printWindow.document.write('<h4>Receipt</h4>');
    printWindow.document.write('<p><strong>Receipt #:</strong> ' + receipt.receiptNumber + '</p>');
    printWindow.document.write('<p><strong>Date:</strong> ' + receipt.date + '</p>');
    printWindow.document.write('<table class="table table-sm"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>');
    receipt.items.forEach(item => {
        printWindow.document.write(`<tr><td>${item.name}</td><td>${item.qty}</td><td>$${item.price.toFixed(2)}</td><td>$${item.total.toFixed(2)}</td></tr>`);
    });
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('<p><strong>Grand Total:</strong> $' + receipt.total.toFixed(2) + '</p>');
    printWindow.document.write('<p><em>Processed by: ' + receipt.agent + '</em></p>');
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function addToCart() {
    const productSelect = document.getElementById('productSelect');
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const qty = parseInt(document.getElementById('productQty').value, 10);

    if (!productSelect.value) {
        alert('Please select a product first.');
        return;
    }

    const productName = selectedOption.getAttribute('data-name');
    const productPrice = parseFloat(selectedOption.getAttribute('data-price'));
    const availableStock = parseInt(selectedOption.getAttribute('data-stock'), 10);

    if (qty < 1 || Number.isNaN(qty)) {
        alert('Quantity must be at least 1.');
        return;
    }

    if (qty > availableStock) {
        alert(`Only ${availableStock} units are available in stock.`);
        return;
    }

    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.qty += qty;
        existingItem.total = existingItem.qty * existingItem.price;
    } else {
        cart.push({ name: productName, price: productPrice, qty, total: productPrice * qty });
    }

    updateCartTable();
}

function handleBarcodeLookup() {
    const barcodeInput = document.getElementById('barcodeInput');
    const searchMessage = document.getElementById('searchMessage');

    if (!barcodeInput || !searchMessage) {
        return;
    }

    const barcode = barcodeInput.value.trim();
    const found = products.find(product => product.barcode === barcode);

    if (found) {
        searchMessage.textContent = `${found.name} found. Price: $${found.price.toFixed(2)}. Stock: ${found.stock}`;
        searchMessage.className = 'alert alert-success mt-3 mb-0';
    } else {
        searchMessage.textContent = 'Barcode not found. Please verify the code and try again.';
        searchMessage.className = 'alert alert-warning mt-3 mb-0';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateProducts();
    updateCartTable();

    const addButton = document.getElementById('addToCartBtn');
    const checkoutButton = document.getElementById('checkoutBtn');
    const barcodeButton = document.getElementById('barcodeSearchBtn');

    if (addButton) {
        addButton.addEventListener('click', addToCart);
    }

    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty.');
                return;
            }

            currentReceipt = buildReceipt();
            renderReceipt(currentReceipt);
            appendReceiptHistory(currentReceipt);
            const receiptSection = document.getElementById('receiptsSection');
            if (receiptSection) {
                receiptSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            alert('Sale completed successfully. Receipt generated for the cashier.');
            cart = [];
            updateCartTable();
        });
    }

    const printBtn = document.getElementById('printReceiptBtn');
    const exportBtn = document.getElementById('exportReceiptBtn');

    if (barcodeButton) {
        barcodeButton.addEventListener('click', handleBarcodeLookup);
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            if (!currentReceipt) {
                alert('Please complete a sale first to generate a receipt.');
                return;
            }
            printReceipt(currentReceipt);
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (!currentReceipt) {
                alert('Please complete a sale first to export a receipt.');
                return;
            }
            exportReceipt(currentReceipt);
        });
    }
});