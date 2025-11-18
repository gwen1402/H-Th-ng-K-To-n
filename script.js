// Dữ liệu lưu trữ
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
let receipts = JSON.parse(localStorage.getItem('receipts')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let materials = JSON.parse(localStorage.getItem('materials')) || [];
let materialImports = JSON.parse(localStorage.getItem('materialImports')) || [];
let openingBalances = JSON.parse(localStorage.getItem('openingBalances')) || [];
let receivables = JSON.parse(localStorage.getItem('receivables')) || [];
let payables = JSON.parse(localStorage.getItem('payables')) || [];
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let attendances = JSON.parse(localStorage.getItem('attendances')) || [];
let accountingEntries = JSON.parse(localStorage.getItem('accountingEntries')) || [];
let materialExports = JSON.parse(localStorage.getItem('materialExports')) || [];

// Tỷ lệ bảo hiểm theo luật Việt Nam 2024
const INSURANCE_RATES = {
    bhxh_company: 0.175,    // 17.5% công ty đóng
    bhxh_employee: 0.08,    // 8% nhân viên đóng
    bhyt_company: 0.03,     // 3% công ty đóng
    bhyt_employee: 0.015,   // 1.5% nhân viên đóng
    bhtn_company: 0.01,     // 1% công ty đóng
    bhtn_employee: 0.01,    // 1% nhân viên đóng
    total_company: 0.215,   // 21.5% tổng công ty
    total_employee: 0.105   // 10.5% tổng nhân viên
};

// Mức lương tối thiểu vùng 2024
const MIN_WAGE = {
    region1: 4960000,  // Vùng I
    region2: 4410000,  // Vùng II
    region3: 3860000,  // Vùng III
    region4: 3450000   // Vùng IV
};

// Bậc thuế TNCN 2024
const TAX_BRACKETS = [
    { limit: 5000000, rate: 0.05 },      // Đến 5 triệu: 5%
    { limit: 10000000, rate: 0.10 },     // Trên 5-10 triệu: 10%
    { limit: 18000000, rate: 0.15 },     // Trên 10-18 triệu: 15%
    { limit: 32000000, rate: 0.20 },     // Trên 18-32 triệu: 20%
    { limit: 52000000, rate: 0.25 },     // Trên 32-52 triệu: 25%
    { limit: 80000000, rate: 0.30 },     // Trên 52-80 triệu: 30%
    { limit: Infinity, rate: 0.35 }      // Trên 80 triệu: 35%
];

const FAMILY_DEDUCTION = 11000000;  // Giảm trừ bản thân
const DEPENDENT_DEDUCTION = 4400000; // Giảm trừ người phụ thuộc

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
    updateDashboard();
    loadCustomers();
    loadSuppliers();
    loadMaterials();
    displayReceipts();
    displayPayments();
    displayInvoices();
    displayCustomers();
    displaySuppliers();
    displayMaterials();
    displayMaterialImports();
    displayReceivables();
    displayPayables();
    updateOpeningSummary();
    updateSystemInfo();
    setDefaultDates();
    
    // Load cho xuất kho
    if (typeof loadMaterialsForExport === 'function') {
        loadMaterialsForExport();
    }
    if (typeof displayMaterialExports === 'function') {
        displayMaterialExports();
    }
});

// Chuyển đổi section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    event.target.closest('.menu-item').classList.add('active');
}

// Set ngày mặc định
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const inputs = ['receiptDate', 'paymentDate', 'invoiceDate', 'importDate'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today;
    });
    
    // Set tháng hiện tại cho số dư đầu kỳ
    const currentMonth = new Date().toISOString().slice(0, 7);
    const periodEl = document.getElementById('openingPeriod');
    if (periodEl) periodEl.value = currentMonth;
}

// Khởi tạo forms
function initializeForms() {
    // Form Khách Hàng
    document.getElementById('customerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const customer = {
            id: Date.now(),
            code: document.getElementById('customerCode').value,
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            address: document.getElementById('customerAddress').value
        };
        
        if (customers.find(c => c.code === customer.code)) {
            alert('Mã khách hàng đã tồn tại!');
            return;
        }
        
        customers.push(customer);
        saveData('customers', customers);
        displayCustomers();
        loadCustomers();
        this.reset();
        alert('Thêm khách hàng thành công!');
    });

    // Form Nhà Cung Cấp
    document.getElementById('supplierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const supplier = {
            id: Date.now(),
            code: document.getElementById('supplierCode').value,
            name: document.getElementById('supplierName').value,
            phone: document.getElementById('supplierPhone').value,
            email: document.getElementById('supplierEmail').value,
            address: document.getElementById('supplierAddress').value
        };
        
        if (suppliers.find(s => s.code === supplier.code)) {
            alert('Mã nhà cung cấp đã tồn tại!');
            return;
        }
        
        suppliers.push(supplier);
        saveData('suppliers', suppliers);
        displaySuppliers();
        loadSuppliers();
        this.reset();
        alert('Thêm nhà cung cấp thành công!');
    });

    // Form Phiếu Thu
    document.getElementById('receiptForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const customerId = document.getElementById('receiptCustomer').value;
        const customer = customers.find(c => c.id == customerId);
        
        const receipt = {
            id: Date.now(),
            code: document.getElementById('receiptCode').value,
            date: document.getElementById('receiptDate').value,
            customerId: customerId,
            customerName: customer ? customer.name : '',
            amount: parseFloat(document.getElementById('receiptAmount').value),
            description: document.getElementById('receiptDescription').value
        };
        
        receipts.push(receipt);
        saveData('receipts', receipts);
        displayReceipts();
        updateDashboard();
        this.reset();
        setDefaultDates();
        alert('Lưu phiếu thu thành công!');
    });

    // Form Phiếu Chi
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const supplierId = document.getElementById('paymentSupplier').value;
        const supplier = suppliers.find(s => s.id == supplierId);
        
        const payment = {
            id: Date.now(),
            code: document.getElementById('paymentCode').value,
            date: document.getElementById('paymentDate').value,
            supplierId: supplierId,
            supplierName: supplier ? supplier.name : '',
            amount: parseFloat(document.getElementById('paymentAmount').value),
            description: document.getElementById('paymentDescription').value
        };
        
        payments.push(payment);
        saveData('payments', payments);
        displayPayments();
        updateDashboard();
        this.reset();
        setDefaultDates();
        alert('Lưu phiếu chi thành công!');
    });

    // Form Hóa Đơn
    document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const customerId = document.getElementById('invoiceCustomer').value;
        const customer = customers.find(c => c.id == customerId);
        const amount = parseFloat(document.getElementById('invoiceAmount').value);
        const vat = parseFloat(document.getElementById('invoiceVAT').value);
        
        const invoice = {
            id: Date.now(),
            number: document.getElementById('invoiceNumber').value,
            date: document.getElementById('invoiceDate').value,
            customerId: customerId,
            customerName: customer ? customer.name : '',
            amount: amount,
            vat: vat,
            total: amount * (1 + vat / 100),
            note: document.getElementById('invoiceNote').value
        };
        
        invoices.push(invoice);
        saveData('invoices', invoices);
        displayInvoices();
        updateDashboard();
        this.reset();
        setDefaultDates();
        alert('Lưu hóa đơn thành công!');
    });

    // Tính tổng tiền hóa đơn
    document.getElementById('invoiceAmount').addEventListener('input', calculateInvoiceTotal);
    document.getElementById('invoiceVAT').addEventListener('input', calculateInvoiceTotal);

    // Form Nguyên Vật Liệu
    document.getElementById('materialForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const material = {
            id: Date.now(),
            code: document.getElementById('materialCode').value,
            name: document.getElementById('materialName').value,
            unit: document.getElementById('materialUnit').value,
            price: parseFloat(document.getElementById('materialPrice').value),
            stock: parseFloat(document.getElementById('materialStock').value) || 0,
            supplierId: document.getElementById('materialSupplier').value,
            note: document.getElementById('materialNote').value
        };
        
        if (materials.find(m => m.code === material.code)) {
            alert('Mã nguyên vật liệu đã tồn tại!');
            return;
        }
        
        materials.push(material);
        saveData('materials', materials);
        displayMaterials();
        loadMaterials();
        this.reset();
        alert('Thêm nguyên vật liệu thành công!');
    });

    // Form Nhập Kho
    document.getElementById('materialImportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const materialId = document.getElementById('importMaterial').value;
        const material = materials.find(m => m.id == materialId);
        const quantity = parseFloat(document.getElementById('importQuantity').value);
        const price = parseFloat(document.getElementById('importPrice').value);
        
        const importRecord = {
            id: Date.now(),
            code: document.getElementById('importCode').value,
            date: document.getElementById('importDate').value,
            materialId: materialId,
            materialName: material ? material.name : '',
            materialUnit: material ? material.unit : '',
            quantity: quantity,
            price: price,
            total: quantity * price,
            note: document.getElementById('importNote').value
        };
        
        // Cập nhật tồn kho
        if (material) {
            material.stock += quantity;
            material.price = price; // Cập nhật giá mới nhất
            saveData('materials', materials);
        }
        
        materialImports.push(importRecord);
        saveData('materialImports', materialImports);
        displayMaterials();
        displayMaterialImports();
        this.reset();
        setDefaultDates();
        alert('Nhập kho thành công!');
    });

    // Tính thành tiền nhập kho
    document.getElementById('importQuantity').addEventListener('input', calculateImportTotal);
    document.getElementById('importPrice').addEventListener('input', calculateImportTotal);

    // Tự động điền giá khi chọn NVL
    document.getElementById('importMaterial').addEventListener('change', function() {
        const materialId = this.value;
        const material = materials.find(m => m.id == materialId);
        if (material) {
            document.getElementById('importPrice').value = material.price;
            calculateImportTotal();
        }
    });

    // Form Số Dư Đầu Kỳ
    document.getElementById('openingBalanceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const cash = parseFloat(document.getElementById('openingCash').value);
        const bank = parseFloat(document.getElementById('openingBank').value) || 0;
        
        const opening = {
            id: Date.now(),
            period: document.getElementById('openingPeriod').value,
            cash: cash,
            bank: bank,
            total: cash + bank,
            note: document.getElementById('openingNote').value
        };
        
        openingBalances.push(opening);
        saveData('openingBalances', openingBalances);
        updateOpeningSummary();
        updateDashboard();
        this.reset();
        setDefaultDates();
        alert('Lưu số dư đầu kỳ thành công!');
    });

    // Tính tổng số dư
    document.getElementById('openingCash').addEventListener('input', calculateOpeningTotal);
    document.getElementById('openingBank').addEventListener('input', calculateOpeningTotal);

    // Form Công Nợ Phải Thu
    document.getElementById('receivableForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const customerId = document.getElementById('receivableCustomer').value;
        const customer = customers.find(c => c.id == customerId);
        
        const receivable = {
            id: Date.now(),
            customerId: customerId,
            customerName: customer ? customer.name : '',
            amount: parseFloat(document.getElementById('receivableAmount').value),
            note: document.getElementById('receivableNote').value
        };
        
        receivables.push(receivable);
        saveData('receivables', receivables);
        displayReceivables();
        updateOpeningSummary();
        this.reset();
        alert('Thêm công nợ phải thu thành công!');
    });

    // Form Công Nợ Phải Trả
    document.getElementById('payableForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const supplierId = document.getElementById('payableSupplier').value;
        const supplier = suppliers.find(s => s.id == supplierId);
        
        const payable = {
            id: Date.now(),
            supplierId: supplierId,
            supplierName: supplier ? supplier.name : '',
            amount: parseFloat(document.getElementById('payableAmount').value),
            note: document.getElementById('payableNote').value
        };
        
        payables.push(payable);
        saveData('payables', payables);
        displayPayables();
        updateOpeningSummary();
        this.reset();
        alert('Thêm công nợ phải trả thành công!');
    });
}

function calculateInvoiceTotal() {
    const amount = parseFloat(document.getElementById('invoiceAmount').value) || 0;
    const vat = parseFloat(document.getElementById('invoiceVAT').value) || 0;
    const total = amount * (1 + vat / 100);
    document.getElementById('invoiceTotal').value = total.toFixed(0);
}

function calculateImportTotal() {
    const quantity = parseFloat(document.getElementById('importQuantity').value) || 0;
    const price = parseFloat(document.getElementById('importPrice').value) || 0;
    const total = quantity * price;
    document.getElementById('importTotal').value = total.toFixed(0);
}

function calculateOpeningTotal() {
    const cash = parseFloat(document.getElementById('openingCash').value) || 0;
    const bank = parseFloat(document.getElementById('openingBank').value) || 0;
    const total = cash + bank;
    document.getElementById('openingTotal').value = total.toFixed(0);
}

// Load danh sách vào select
function loadCustomers() {
    const selects = ['receiptCustomer', 'invoiceCustomer'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Chọn khách hàng</option>';
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.code} - ${customer.name}`;
            select.appendChild(option);
        });
    });
}

function loadSuppliers() {
    const selects = ['paymentSupplier', 'materialSupplier', 'payableSupplier'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = '<option value="">Chọn nhà cung cấp</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = `${supplier.code} - ${supplier.name}`;
            select.appendChild(option);
        });
    });
}

function loadMaterials() {
    const select = document.getElementById('importMaterial');
    if (!select) return;
    select.innerHTML = '<option value="">Chọn nguyên vật liệu</option>';
    materials.forEach(material => {
        const option = document.createElement('option');
        option.value = material.id;
        option.textContent = `${material.code} - ${material.name} (${material.unit})`;
        select.appendChild(option);
    });
}

// Hiển thị dữ liệu
function displayCustomers() {
    const tbody = document.getElementById('customerList');
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${customer.code}</td>
            <td>${customer.name}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.email || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td><button class="btn-delete" onclick="deleteCustomer(${customer.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function displaySuppliers() {
    const tbody = document.getElementById('supplierList');
    tbody.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${supplier.code}</td>
            <td>${supplier.name}</td>
            <td>${supplier.phone || '-'}</td>
            <td>${supplier.email || '-'}</td>
            <td>${supplier.address || '-'}</td>
            <td><button class="btn-delete" onclick="deleteSupplier(${supplier.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function displayReceipts() {
    const tbody = document.getElementById('receiptList');
    tbody.innerHTML = '';
    
    receipts.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(receipt => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${receipt.code}</td>
            <td>${formatDate(receipt.date)}</td>
            <td>${receipt.customerName}</td>
            <td class="amount-positive">${formatMoney(receipt.amount)}</td>
            <td>${receipt.description || '-'}</td>
            <td><button class="btn-delete" onclick="deleteReceipt(${receipt.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function displayPayments() {
    const tbody = document.getElementById('paymentList');
    tbody.innerHTML = '';
    
    payments.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(payment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${payment.code}</td>
            <td>${formatDate(payment.date)}</td>
            <td>${payment.supplierName}</td>
            <td class="amount-negative">${formatMoney(payment.amount)}</td>
            <td>${payment.description || '-'}</td>
            <td><button class="btn-delete" onclick="deletePayment(${payment.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function displayInvoices() {
    const tbody = document.getElementById('invoiceList');
    tbody.innerHTML = '';
    
    invoices.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(invoice => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${invoice.number}</td>
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.customerName}</td>
            <td>${formatMoney(invoice.amount)}</td>
            <td>${invoice.vat}%</td>
            <td class="amount-positive">${formatMoney(invoice.total)}</td>
            <td><button class="btn-delete" onclick="deleteInvoice(${invoice.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Cập nhật Dashboard
function updateDashboard() {
    // Tính số dư đầu kỳ
    const openingBalance = openingBalances.reduce((sum, ob) => sum + ob.total, 0);
    
    const totalRevenue = receipts.reduce((sum, r) => sum + r.amount, 0) + 
                        invoices.reduce((sum, i) => sum + i.total, 0);
    const totalExpense = payments.reduce((sum, p) => sum + p.amount, 0) +
                        materialImports.reduce((sum, i) => sum + i.total, 0);
    const totalProfit = totalRevenue - totalExpense;
    const currentBalance = openingBalance + totalProfit;
    
    document.getElementById('totalRevenue').textContent = formatMoney(totalRevenue);
    document.getElementById('totalExpense').textContent = formatMoney(totalExpense);
    document.getElementById('totalProfit').textContent = formatMoney(totalProfit);
    document.getElementById('currentBalance').textContent = formatMoney(currentBalance);
    
    // Giao dịch gần đây
    const allTransactions = [
        ...receipts.map(r => ({...r, type: 'Phiếu Thu', amount: r.amount})),
        ...payments.map(p => ({...p, type: 'Phiếu Chi', amount: -p.amount})),
        ...invoices.map(i => ({...i, type: 'Hóa Đơn', amount: i.total, description: i.note}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
    
    const tbody = document.getElementById('recentTransactions');
    tbody.innerHTML = '';
    
    allTransactions.forEach(trans => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(trans.date)}</td>
            <td>${trans.type}</td>
            <td>${trans.description || trans.customerName || trans.supplierName || '-'}</td>
            <td class="${trans.amount >= 0 ? 'amount-positive' : 'amount-negative'}">
                ${formatMoney(Math.abs(trans.amount))}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Tạo báo cáo
function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    let filteredReceipts = receipts;
    let filteredPayments = payments;
    let filteredInvoices = invoices;
    
    if (startDate) {
        filteredReceipts = filteredReceipts.filter(r => r.date >= startDate);
        filteredPayments = filteredPayments.filter(p => p.date >= startDate);
        filteredInvoices = filteredInvoices.filter(i => i.date >= startDate);
    }
    
    if (endDate) {
        filteredReceipts = filteredReceipts.filter(r => r.date <= endDate);
        filteredPayments = filteredPayments.filter(p => p.date <= endDate);
        filteredInvoices = filteredInvoices.filter(i => i.date <= endDate);
    }
    
    const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.amount, 0) + 
                        filteredInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalExpense = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalProfit = totalRevenue - totalExpense;
    
    document.getElementById('reportRevenue').textContent = formatMoney(totalRevenue);
    document.getElementById('reportExpense').textContent = formatMoney(totalExpense);
    document.getElementById('reportProfit').textContent = formatMoney(totalProfit);
    document.getElementById('reportProfit').className = totalProfit >= 0 ? 'amount-positive' : 'amount-negative';
    
    // Chi tiết giao dịch
    const allTransactions = [
        ...filteredReceipts.map(r => ({
            date: r.date,
            type: 'Phiếu Thu',
            code: r.code,
            partner: r.customerName,
            revenue: r.amount,
            expense: 0,
            description: r.description
        })),
        ...filteredPayments.map(p => ({
            date: p.date,
            type: 'Phiếu Chi',
            code: p.code,
            partner: p.supplierName,
            revenue: 0,
            expense: p.amount,
            description: p.description
        })),
        ...filteredInvoices.map(i => ({
            date: i.date,
            type: 'Hóa Đơn',
            code: i.number,
            partner: i.customerName,
            revenue: i.total,
            expense: 0,
            description: i.note
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = document.getElementById('reportDetails');
    tbody.innerHTML = '';
    
    allTransactions.forEach(trans => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(trans.date)}</td>
            <td>${trans.type}</td>
            <td>${trans.code}</td>
            <td>${trans.partner}</td>
            <td class="amount-positive">${trans.revenue ? formatMoney(trans.revenue) : '-'}</td>
            <td class="amount-negative">${trans.expense ? formatMoney(trans.expense) : '-'}</td>
            <td>${trans.description || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Xóa dữ liệu
function deleteCustomer(id) {
    if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
        customers = customers.filter(c => c.id !== id);
        saveData('customers', customers);
        displayCustomers();
        loadCustomers();
    }
}

function deleteSupplier(id) {
    if (confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
        suppliers = suppliers.filter(s => s.id !== id);
        saveData('suppliers', suppliers);
        displaySuppliers();
        loadSuppliers();
    }
}

function deleteReceipt(id) {
    if (confirm('Bạn có chắc muốn xóa phiếu thu này?')) {
        receipts = receipts.filter(r => r.id !== id);
        saveData('receipts', receipts);
        displayReceipts();
        updateDashboard();
    }
}

function deletePayment(id) {
    if (confirm('Bạn có chắc muốn xóa phiếu chi này?')) {
        payments = payments.filter(p => p.id !== id);
        saveData('payments', payments);
        displayPayments();
        updateDashboard();
    }
}

function deleteInvoice(id) {
    if (confirm('Bạn có chắc muốn xóa hóa đơn này?')) {
        invoices = invoices.filter(i => i.id !== id);
        saveData('invoices', invoices);
        displayInvoices();
        updateDashboard();
    }
}

// Xuất Excel
function exportReceipts() {
    if (receipts.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = receipts.map(r => ({
        'Mã Phiếu Thu': r.code,
        'Ngày': formatDate(r.date),
        'Khách Hàng': r.customerName,
        'Số Tiền': r.amount,
        'Diễn Giải': r.description || ''
    }));
    
    exportToExcel(data, 'PhieuThu');
}

function exportPayments() {
    if (payments.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = payments.map(p => ({
        'Mã Phiếu Chi': p.code,
        'Ngày': formatDate(p.date),
        'Nhà Cung Cấp': p.supplierName,
        'Số Tiền': p.amount,
        'Diễn Giải': p.description || ''
    }));
    
    exportToExcel(data, 'PhieuChi');
}

function exportInvoices() {
    if (invoices.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = invoices.map(i => ({
        'Số Hóa Đơn': i.number,
        'Ngày': formatDate(i.date),
        'Khách Hàng': i.customerName,
        'Tổng Tiền': i.amount,
        'VAT (%)': i.vat,
        'Thành Tiền': i.total,
        'Ghi Chú': i.note || ''
    }));
    
    exportToExcel(data, 'HoaDon');
}

function exportReport() {
    const tbody = document.getElementById('reportDetails');
    if (tbody.children.length === 0) {
        alert('Vui lòng tạo báo cáo trước khi xuất!');
        return;
    }
    
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    let filteredReceipts = receipts;
    let filteredPayments = payments;
    let filteredInvoices = invoices;
    
    if (startDate) {
        filteredReceipts = filteredReceipts.filter(r => r.date >= startDate);
        filteredPayments = filteredPayments.filter(p => p.date >= startDate);
        filteredInvoices = filteredInvoices.filter(i => i.date >= startDate);
    }
    
    if (endDate) {
        filteredReceipts = filteredReceipts.filter(r => r.date <= endDate);
        filteredPayments = filteredPayments.filter(p => p.date <= endDate);
        filteredInvoices = filteredInvoices.filter(i => i.date <= endDate);
    }
    
    const data = [
        ...filteredReceipts.map(r => ({
            'Ngày': formatDate(r.date),
            'Loại': 'Phiếu Thu',
            'Mã': r.code,
            'Đối Tượng': r.customerName,
            'Thu': r.amount,
            'Chi': 0,
            'Diễn Giải': r.description || ''
        })),
        ...filteredPayments.map(p => ({
            'Ngày': formatDate(p.date),
            'Loại': 'Phiếu Chi',
            'Mã': p.code,
            'Đối Tượng': p.supplierName,
            'Thu': 0,
            'Chi': p.amount,
            'Diễn Giải': p.description || ''
        })),
        ...filteredInvoices.map(i => ({
            'Ngày': formatDate(i.date),
            'Loại': 'Hóa Đơn',
            'Mã': i.number,
            'Đối Tượng': i.customerName,
            'Thu': i.total,
            'Chi': 0,
            'Diễn Giải': i.note || ''
        }))
    ].sort((a, b) => new Date(b['Ngày'].split('/').reverse().join('-')) - 
                     new Date(a['Ngày'].split('/').reverse().join('-')));
    
    exportToExcel(data, 'BaoCaoTaiChinh');
}

function exportToExcel(data, sheetName) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    const fileName = `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Utility functions
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Hiển thị Nguyên Vật Liệu
function displayMaterials() {
    const tbody = document.getElementById('materialList');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    materials.forEach(material => {
        const stockValue = material.stock * material.price;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${material.code}</td>
            <td>${material.name}</td>
            <td>${material.unit}</td>
            <td>${formatMoney(material.price)}</td>
            <td>${material.stock}</td>
            <td class="amount-positive">${formatMoney(stockValue)}</td>
            <td><button class="btn-delete" onclick="deleteMaterial(${material.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function displayMaterialImports() {
    const tbody = document.getElementById('importList');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    materialImports.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(imp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${imp.code}</td>
            <td>${formatDate(imp.date)}</td>
            <td>${imp.materialName} (${imp.materialUnit})</td>
            <td>${imp.quantity}</td>
            <td>${formatMoney(imp.price)}</td>
            <td class="amount-negative">${formatMoney(imp.total)}</td>
            <td><button class="btn-delete" onclick="deleteMaterialImport(${imp.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function displayReceivables() {
    const tbody = document.getElementById('receivableList');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Load customers vào select
    const select = document.getElementById('receivableCustomer');
    if (select) {
        select.innerHTML = '<option value="">Chọn khách hàng</option>';
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.code} - ${customer.name}`;
            select.appendChild(option);
        });
    }
    
    receivables.forEach(rec => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rec.customerName}</td>
            <td class="amount-positive">${formatMoney(rec.amount)}</td>
            <td>${rec.note || '-'}</td>
            <td><button class="btn-delete" onclick="deleteReceivable(${rec.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function displayPayables() {
    const tbody = document.getElementById('payableList');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    payables.forEach(pay => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pay.supplierName}</td>
            <td class="amount-negative">${formatMoney(pay.amount)}</td>
            <td>${pay.note || '-'}</td>
            <td><button class="btn-delete" onclick="deletePayable(${pay.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateOpeningSummary() {
    const totalBalance = openingBalances.reduce((sum, ob) => sum + ob.total, 0);
    const totalReceivable = receivables.reduce((sum, r) => sum + r.amount, 0);
    const totalPayable = payables.reduce((sum, p) => sum + p.amount, 0);
    const totalAssets = totalBalance + totalReceivable - totalPayable;
    
    const balanceEl = document.getElementById('summaryBalance');
    const receivableEl = document.getElementById('summaryReceivable');
    const payableEl = document.getElementById('summaryPayable');
    const totalEl = document.getElementById('summaryTotal');
    
    if (balanceEl) balanceEl.textContent = formatMoney(totalBalance);
    if (receivableEl) receivableEl.textContent = formatMoney(totalReceivable);
    if (payableEl) payableEl.textContent = formatMoney(totalPayable);
    if (totalEl) {
        totalEl.textContent = formatMoney(totalAssets);
        totalEl.className = totalAssets >= 0 ? 'amount-positive' : 'amount-negative';
    }
}

// Xóa dữ liệu mới
function deleteMaterial(id) {
    if (confirm('Bạn có chắc muốn xóa nguyên vật liệu này?')) {
        materials = materials.filter(m => m.id !== id);
        saveData('materials', materials);
        displayMaterials();
        loadMaterials();
    }
}

function deleteMaterialImport(id) {
    if (confirm('Bạn có chắc muốn xóa phiếu nhập này?')) {
        const imp = materialImports.find(i => i.id === id);
        if (imp) {
            // Trừ lại số lượng tồn kho
            const material = materials.find(m => m.id == imp.materialId);
            if (material) {
                material.stock -= imp.quantity;
                saveData('materials', materials);
            }
        }
        materialImports = materialImports.filter(i => i.id !== id);
        saveData('materialImports', materialImports);
        displayMaterials();
        displayMaterialImports();
    }
}

function deleteReceivable(id) {
    if (confirm('Bạn có chắc muốn xóa công nợ này?')) {
        receivables = receivables.filter(r => r.id !== id);
        saveData('receivables', receivables);
        displayReceivables();
        updateOpeningSummary();
    }
}

function deletePayable(id) {
    if (confirm('Bạn có chắc muốn xóa công nợ này?')) {
        payables = payables.filter(p => p.id !== id);
        saveData('payables', payables);
        displayPayables();
        updateOpeningSummary();
    }
}

// Xuất Excel mới
function exportMaterials() {
    if (materials.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = materials.map(m => ({
        'Mã NVL': m.code,
        'Tên Nguyên Vật Liệu': m.name,
        'Đơn Vị': m.unit,
        'Đơn Giá': m.price,
        'Tồn Kho': m.stock,
        'Giá Trị Tồn': m.stock * m.price,
        'Ghi Chú': m.note || ''
    }));
    
    exportToExcel(data, 'NguyenVatLieu');
}

function exportImports() {
    if (materialImports.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = materialImports.map(i => ({
        'Mã Phiếu Nhập': i.code,
        'Ngày': formatDate(i.date),
        'Nguyên Vật Liệu': i.materialName,
        'Đơn Vị': i.materialUnit,
        'Số Lượng': i.quantity,
        'Đơn Giá': i.price,
        'Thành Tiền': i.total,
        'Ghi Chú': i.note || ''
    }));
    
    exportToExcel(data, 'PhieuNhapKho');
}

// ===== BACKUP & RESTORE =====
function backupData() {
    const backupData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {
            customers,
            suppliers,
            receipts,
            payments,
            invoices,
            materials,
            materialImports,
            materialExports,
            openingBalances,
            receivables,
            payables,
            employees,
            attendances,
            accountingEntries
        }
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MISA_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Sao lưu dữ liệu thành công!');
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm('⚠️ Khôi phục dữ liệu sẽ ghi đè lên dữ liệu hiện tại. Bạn có chắc chắn?')) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (!backup.data) {
                throw new Error('File backup không hợp lệ');
            }
            
            // Khôi phục dữ liệu
            customers = backup.data.customers || [];
            suppliers = backup.data.suppliers || [];
            receipts = backup.data.receipts || [];
            payments = backup.data.payments || [];
            invoices = backup.data.invoices || [];
            materials = backup.data.materials || [];
            materialImports = backup.data.materialImports || [];
            materialExports = backup.data.materialExports || [];
            openingBalances = backup.data.openingBalances || [];
            receivables = backup.data.receivables || [];
            payables = backup.data.payables || [];
            employees = backup.data.employees || [];
            attendances = backup.data.attendances || [];
            accountingEntries = backup.data.accountingEntries || [];
            
            // Lưu vào localStorage
            saveData('customers', customers);
            saveData('suppliers', suppliers);
            saveData('receipts', receipts);
            saveData('payments', payments);
            saveData('invoices', invoices);
            saveData('materials', materials);
            saveData('materialImports', materialImports);
            saveData('materialExports', materialExports);
            saveData('openingBalances', openingBalances);
            saveData('receivables', receivables);
            saveData('payables', payables);
            saveData('employees', employees);
            saveData('attendances', attendances);
            saveData('accountingEntries', accountingEntries);
            
            // Cập nhật giao diện
            loadCustomers();
            loadSuppliers();
            loadMaterials();
            if (typeof loadEmployees === 'function') loadEmployees();
            if (typeof loadMaterialsForExport === 'function') loadMaterialsForExport();
            
            displayCustomers();
            displaySuppliers();
            displayReceipts();
            displayPayments();
            displayInvoices();
            displayMaterials();
            displayMaterialImports();
            if (typeof displayMaterialExports === 'function') displayMaterialExports();
            displayReceivables();
            displayPayables();
            if (typeof displayEmployees === 'function') displayEmployees();
            if (typeof displayAttendances === 'function') displayAttendances();
            if (typeof displayAccountingEntries === 'function') displayAccountingEntries();
            
            updateDashboard();
            updateOpeningSummary();
            updateSystemInfo();
            
            alert('✅ Khôi phục dữ liệu thành công!');
        } catch (error) {
            alert('❌ Lỗi: ' + error.message);
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

// ===== RESET DATA =====
function resetTransactions() {
    if (!confirm('⚠️ Bạn có chắc muốn xóa tất cả giao dịch?\n\n✅ Sẽ xóa: Phiếu thu, Phiếu chi, Hóa đơn, Phiếu nhập/xuất kho\n❌ Giữ lại: Khách hàng, NCC, Nguyên vật liệu, Số dư đầu kỳ')) {
        return;
    }
    
    // Backup trước khi xóa
    backupData();
    
    // Xóa giao dịch
    receipts = [];
    payments = [];
    invoices = [];
    materialImports = [];
    materialExports = [];
    
    // Reset tồn kho về 0
    materials.forEach(m => m.stock = 0);
    
    saveData('receipts', receipts);
    saveData('payments', payments);
    saveData('invoices', invoices);
    saveData('materialImports', materialImports);
    saveData('materialExports', materialExports);
    saveData('materials', materials);
    
    displayReceipts();
    displayPayments();
    displayInvoices();
    displayMaterialImports();
    if (typeof displayMaterialExports === 'function') {
        displayMaterialExports();
    }
    displayMaterials();
    updateDashboard();
    updateSystemInfo();
    
    alert('✅ Đã xóa tất cả giao dịch và backup dữ liệu!');
}

function resetAllData() {
    if (!confirm('⚠️⚠️⚠️ CẢNH BÁO ⚠️⚠️⚠️\n\nBạn có CHẮC CHẮN muốn xóa TẤT CẢ dữ liệu?\n\nHệ thống sẽ tự động backup trước khi xóa.')) {
        return;
    }
    
    if (!confirm('Xác nhận lần cuối: XÓA TẤT CẢ DỮ LIỆU?')) {
        return;
    }
    
    // Backup trước khi xóa
    backupData();
    
    // Xóa tất cả
    customers = [];
    suppliers = [];
    receipts = [];
    payments = [];
    invoices = [];
    materials = [];
    materialImports = [];
    materialExports = [];
    openingBalances = [];
    receivables = [];
    payables = [];
    employees = [];
    attendances = [];
    accountingEntries = [];
    
    localStorage.clear();
    
    loadCustomers();
    loadSuppliers();
    loadMaterials();
    if (typeof loadEmployees === 'function') loadEmployees();
    if (typeof loadMaterialsForExport === 'function') loadMaterialsForExport();
    
    displayCustomers();
    displaySuppliers();
    displayReceipts();
    displayPayments();
    displayInvoices();
    displayMaterials();
    displayMaterialImports();
    if (typeof displayMaterialExports === 'function') displayMaterialExports();
    displayReceivables();
    displayPayables();
    if (typeof displayEmployees === 'function') displayEmployees();
    if (typeof displayAttendances === 'function') displayAttendances();
    if (typeof displayAccountingEntries === 'function') displayAccountingEntries();
    
    updateDashboard();
    updateOpeningSummary();
    updateSystemInfo();
    
    alert('✅ Đã xóa tất cả dữ liệu và tạo backup!');
}

// ===== SYSTEM INFO =====
function updateSystemInfo() {
    const infoEls = {
        infoCustomers: customers.length,
        infoSuppliers: suppliers.length,
        infoReceipts: receipts.length,
        infoPayments: payments.length,
        infoInvoices: invoices.length,
        infoMaterials: materials.length,
        infoImports: materialImports.length
    };
    
    Object.keys(infoEls).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = infoEls[id];
    });
}

// ===== ENHANCED EXCEL EXPORT =====
function exportToExcel(data, sheetName) {
    // Tạo worksheet với dữ liệu
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Lấy range của worksheet
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Định dạng header
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;
        
        ws[address].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }
    
    // Tự động điều chỉnh độ rộng cột
    const colWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
            const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell && cell.v) {
                const cellValue = cell.v.toString();
                maxWidth = Math.max(maxWidth, cellValue.length);
            }
        }
        colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
    }
    ws['!cols'] = colWidths;
    
    // Tạo workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Thêm thông tin metadata
    wb.Props = {
        Title: sheetName,
        Subject: "Báo cáo tài chính",
        Author: "Hệ Thống Kế Toán",
        CreatedDate: new Date()
    };
    
    // Xuất file
    const fileName = `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName, { bookType: 'xlsx', bookSST: false, type: 'binary' });
}

// Cập nhật các hàm export với định dạng đẹp hơn
function exportReceipts() {
    if (receipts.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = receipts.map((r, index) => ({
        'STT': index + 1,
        'Mã Phiếu Thu': r.code,
        'Ngày': formatDate(r.date),
        'Khách Hàng': r.customerName,
        'Số Tiền (VNĐ)': r.amount,
        'Diễn Giải': r.description || ''
    }));
    
    // Thêm dòng tổng
    data.push({
        'STT': '',
        'Mã Phiếu Thu': '',
        'Ngày': '',
        'Khách Hàng': 'TỔNG CỘNG',
        'Số Tiền (VNĐ)': receipts.reduce((sum, r) => sum + r.amount, 0),
        'Diễn Giải': ''
    });
    
    exportToExcel(data, 'PhieuThu');
}

function exportPayments() {
    if (payments.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = payments.map((p, index) => ({
        'STT': index + 1,
        'Mã Phiếu Chi': p.code,
        'Ngày': formatDate(p.date),
        'Nhà Cung Cấp': p.supplierName,
        'Số Tiền (VNĐ)': p.amount,
        'Diễn Giải': p.description || ''
    }));
    
    data.push({
        'STT': '',
        'Mã Phiếu Chi': '',
        'Ngày': '',
        'Nhà Cung Cấp': 'TỔNG CỘNG',
        'Số Tiền (VNĐ)': payments.reduce((sum, p) => sum + p.amount, 0),
        'Diễn Giải': ''
    });
    
    exportToExcel(data, 'PhieuChi');
}

function exportInvoices() {
    if (invoices.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = invoices.map((i, index) => ({
        'STT': index + 1,
        'Số Hóa Đơn': i.number,
        'Ngày': formatDate(i.date),
        'Khách Hàng': i.customerName,
        'Tổng Tiền (VNĐ)': i.amount,
        'VAT (%)': i.vat,
        'Thành Tiền (VNĐ)': i.total,
        'Ghi Chú': i.note || ''
    }));
    
    data.push({
        'STT': '',
        'Số Hóa Đơn': '',
        'Ngày': '',
        'Khách Hàng': 'TỔNG CỘNG',
        'Tổng Tiền (VNĐ)': invoices.reduce((sum, i) => sum + i.amount, 0),
        'VAT (%)': '',
        'Thành Tiền (VNĐ)': invoices.reduce((sum, i) => sum + i.total, 0),
        'Ghi Chú': ''
    });
    
    exportToExcel(data, 'HoaDon');
}

function exportMaterials() {
    if (materials.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = materials.map((m, index) => ({
        'STT': index + 1,
        'Mã NVL': m.code,
        'Tên Nguyên Vật Liệu': m.name,
        'Đơn Vị': m.unit,
        'Đơn Giá (VNĐ)': m.price,
        'Tồn Kho': m.stock,
        'Giá Trị Tồn (VNĐ)': m.stock * m.price,
        'Ghi Chú': m.note || ''
    }));
    
    data.push({
        'STT': '',
        'Mã NVL': '',
        'Tên Nguyên Vật Liệu': '',
        'Đơn Vị': '',
        'Đơn Giá (VNĐ)': '',
        'Tồn Kho': '',
        'Giá Trị Tồn (VNĐ)': materials.reduce((sum, m) => sum + (m.stock * m.price), 0),
        'Ghi Chú': ''
    });
    
    exportToExcel(data, 'NguyenVatLieu');
}

function exportImports() {
    if (materialImports.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = materialImports.map((i, index) => ({
        'STT': index + 1,
        'Mã Phiếu Nhập': i.code,
        'Ngày': formatDate(i.date),
        'Nguyên Vật Liệu': i.materialName,
        'Đơn Vị': i.materialUnit,
        'Số Lượng': i.quantity,
        'Đơn Giá (VNĐ)': i.price,
        'Thành Tiền (VNĐ)': i.total,
        'Ghi Chú': i.note || ''
    }));
    
    data.push({
        'STT': '',
        'Mã Phiếu Nhập': '',
        'Ngày': '',
        'Nguyên Vật Liệu': '',
        'Đơn Vị': '',
        'Số Lượng': '',
        'Đơn Giá (VNĐ)': '',
        'Thành Tiền (VNĐ)': materialImports.reduce((sum, i) => sum + i.total, 0),
        'Ghi Chú': ''
    });
    
    exportToExcel(data, 'PhieuNhapKho');
}

function exportReport() {
    const tbody = document.getElementById('reportDetails');
    if (tbody.children.length === 0) {
        alert('Vui lòng tạo báo cáo trước khi xuất!');
        return;
    }
    
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    let filteredReceipts = receipts;
    let filteredPayments = payments;
    let filteredInvoices = invoices;
    
    if (startDate) {
        filteredReceipts = filteredReceipts.filter(r => r.date >= startDate);
        filteredPayments = filteredPayments.filter(p => p.date >= startDate);
        filteredInvoices = filteredInvoices.filter(i => i.date >= startDate);
    }
    
    if (endDate) {
        filteredReceipts = filteredReceipts.filter(r => r.date <= endDate);
        filteredPayments = filteredPayments.filter(p => p.date <= endDate);
        filteredInvoices = filteredInvoices.filter(i => i.date <= endDate);
    }
    
    const data = [
        ...filteredReceipts.map(r => ({
            'Ngày': formatDate(r.date),
            'Loại': 'Phiếu Thu',
            'Mã': r.code,
            'Đối Tượng': r.customerName,
            'Thu (VNĐ)': r.amount,
            'Chi (VNĐ)': 0,
            'Diễn Giải': r.description || ''
        })),
        ...filteredPayments.map(p => ({
            'Ngày': formatDate(p.date),
            'Loại': 'Phiếu Chi',
            'Mã': p.code,
            'Đối Tượng': p.supplierName,
            'Thu (VNĐ)': 0,
            'Chi (VNĐ)': p.amount,
            'Diễn Giải': p.description || ''
        })),
        ...filteredInvoices.map(i => ({
            'Ngày': formatDate(i.date),
            'Loại': 'Hóa Đơn',
            'Mã': i.number,
            'Đối Tượng': i.customerName,
            'Thu (VNĐ)': i.total,
            'Chi (VNĐ)': 0,
            'Diễn Giải': i.note || ''
        }))
    ].sort((a, b) => new Date(b['Ngày'].split('/').reverse().join('-')) - 
                     new Date(a['Ngày'].split('/').reverse().join('-')));
    
    const totalRevenue = data.reduce((sum, item) => sum + item['Thu (VNĐ)'], 0);
    const totalExpense = data.reduce((sum, item) => sum + item['Chi (VNĐ)'], 0);
    
    data.push({
        'Ngày': '',
        'Loại': '',
        'Mã': '',
        'Đối Tượng': 'TỔNG CỘNG',
        'Thu (VNĐ)': totalRevenue,
        'Chi (VNĐ)': totalExpense,
        'Diễn Giải': `Lợi nhuận: ${formatMoney(totalRevenue - totalExpense)}`
    });
    
    exportToExcel(data, 'BaoCaoTaiChinh');
}


// Cập nhật trạng thái email
function updateEmailStatus() {
    const statusEl = document.getElementById('emailStatus');
    if (statusEl) {
        if (emailConfig && emailConfig.isConfigured) {
            statusEl.textContent = 'Đã cấu hình';
            statusEl.style.color = '#27ae60';
        } else {
            statusEl.textContent = 'Chưa cấu hình';
            statusEl.style.color = '#e74c3c';
        }
    }
}

// Gọi khi load trang
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateEmailStatus, 500);
});
