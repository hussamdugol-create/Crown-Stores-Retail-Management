function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
}

function generateDirectorReport() {
    return {
        title: 'Company Performance Report',
        createdAt: new Date().toLocaleString(),
        totalSales: 184320,
        inventoryValue: 308900,
        topProduct: 'Coca-Cola 500ml',
        branchPerformance: [
            { branch: 'Main Branch', revenue: 92000 },
            { branch: 'West Branch', revenue: 58000 },
            { branch: 'North Branch', revenue: 36320 }
        ]
    };
}

function generateManagerReport() {
    return {
        title: 'Branch Summary Report',
        createdAt: new Date().toLocaleString(),
        branchSales: 18240,
        inventoryValue: 54800,
        lowStockCount: 4,
        procurementPending: 3,
        notes: 'Monitor low-stock items and approve procurement orders.'
    };
}

function renderDirectorReport(report) {
    const output = document.getElementById('directorReportOutput');
    if (!output) return;
    output.innerHTML = `
        <div class="card mt-3 shadow-sm">
            <div class="card-body">
                <h6 class="card-title">${report.title}</h6>
                <p><strong>Generated:</strong> ${report.createdAt}</p>
                <p><strong>Total Sales:</strong> ${formatCurrency(report.totalSales)}</p>
                <p><strong>Inventory Value:</strong> ${formatCurrency(report.inventoryValue)}</p>
                <p><strong>Top Product:</strong> ${report.topProduct}</p>
                <h6 class="mt-3">Branch Revenue</h6>
                <ul>${report.branchPerformance.map(item => `<li>${item.branch}: ${formatCurrency(item.revenue)}</li>`).join('')}</ul>
            </div>
        </div>`;
}

function renderManagerReport(report) {
    const output = document.getElementById('managerReportOutput');
    if (!output) return;
    output.innerHTML = `
        <div class="card mt-3 shadow-sm">
            <div class="card-body">
                <h6 class="card-title">${report.title}</h6>
                <p><strong>Generated:</strong> ${report.createdAt}</p>
                <p><strong>Branch Sales:</strong> ${formatCurrency(report.branchSales)}</p>
                <p><strong>Inventory Value:</strong> ${formatCurrency(report.inventoryValue)}</p>
                <p><strong>Low Stock Items:</strong> ${report.lowStockCount}</p>
                <p><strong>Pending Procurements:</strong> ${report.procurementPending}</p>
                <p>${report.notes}</p>
            </div>
        </div>`;
}

function exportReport(report) {
    const element = document.createElement('a');
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(blob);
    element.download = `${report.title.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

document.addEventListener('DOMContentLoaded', () => {
    const directorMakeBtn = document.getElementById('directorMakeReportBtn');
    const directorExportBtn = document.getElementById('directorExportReportBtn');
    const managerMakeBtn = document.getElementById('managerMakeReportBtn');
    const managerExportBtn = document.getElementById('managerExportReportBtn');

    if (directorMakeBtn) {
        directorMakeBtn.addEventListener('click', () => {
            const report = generateDirectorReport();
            renderDirectorReport(report);
            directorExportBtn.dataset.report = JSON.stringify(report);
        });
    }

    if (directorExportBtn) {
        directorExportBtn.addEventListener('click', () => {
            const reportData = directorExportBtn.dataset.report;
            if (!reportData) {
                alert('Please generate a report first.');
                return;
            }
            exportReport(JSON.parse(reportData));
        });
    }

    if (managerMakeBtn) {
        managerMakeBtn.addEventListener('click', () => {
            const report = generateManagerReport();
            renderManagerReport(report);
            managerExportBtn.dataset.report = JSON.stringify(report);
        });
    }

    if (managerExportBtn) {
        managerExportBtn.addEventListener('click', () => {
            const reportData = managerExportBtn.dataset.report;
            if (!reportData) {
                alert('Please generate a report first.');
                return;
            }
            exportReport(JSON.parse(reportData));
        });
    }
});