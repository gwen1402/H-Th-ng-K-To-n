// ===== XUẤT KHO NGUYÊN VẬT LIỆU =====

// Load materials vào select xuất kho
function loadMaterialsForExport() {
    const select = document.getElementById('exportMaterial');
    if (!select) return;
    select.innerHTML = '<option value="">Chọn nguyên vật liệu</option>';
    materials.forEach(material => {
        const option = document.createElement('option');
        option.value = material.id;
        option.textContent = `${material.code} - ${material.name} (Tồn: ${material.stock} ${material.unit})`;
        select.appendChild(option);
    });
}

// Thay đổi mục đích xuất
document.getElementById('exportPurpose')?.addEventListener('change', function() {
    const purpose = this.value;
    const targetSelect = document.getElementById('exportTarget');
    
    if (!targetSelect) return;
    
    targetSelect.innerHTML = '<option value="">Chọn đối tượng</option>';
    
    if (purpose === 'sale') {
        // Load khách hàng
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.code} - ${customer.name}`;
            targetSelect.appendChild(option);
        });
    } else if (purpose === 'return') {
        // Load nhà cung cấp
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = `${supplier.code} - ${supplier.name}`;
            targetSelect.appendChild(option);
        });
    } else if (purpose === 'internal' || purpose === 'production') {
        // Không cần đối tượng
        targetSelect.disabled = true;
        targetSelect.innerHTML = '<option value="">Không áp dụng</option>';
        return;
    }
    
    targetSelect.disabled = false;
});

// Chọn NVL để xuất - tự động điền giá
document.getElementById('exportMaterial')?.addEventListener('change', function() {
    const materialId = this.value;
    const material = materials.find(m => m.id == materialId);
    
    if (material) {
        document.getElementById('exportPrice').value = material.price;
        calculateExportTotal();
    }
});

// Tính thành tiền xuất
document.getElementById('exportQuantity')?.addEventListener('input', calculateExportTotal);

function calculateExportTotal() {
    const quantity = parseFloat(document.getElementById('exportQuantity')?.value) || 0;
    const price = parseFloat(document.getElementById('exportPrice')?.value) || 0;
    const total = quantity * price;
    const totalEl = document.getElementById('exportTotal');
    if (totalEl) totalEl.value = total.toFixed(0);
}

// Form Xuất Kho
document.getElementById('materialExportForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const materialId = document.getElementById('exportMaterial').value;
    const material = materials.find(m => m.id == materialId);
    const quantity = parseFloat(document.getElementById('exportQuantity').value);
    const purpose = document.getElementById('exportPurpose').value;
    const targetId = document.getElementById('exportTarget').value;
    
    if (!material) {
        alert('Vui lòng chọn nguyên vật liệu!');
        return;
    }
    
    // Kiểm tra tồn kho
    if (material.stock < quantity) {
        alert(`Không đủ tồn kho! Tồn hiện tại: ${material.stock} ${material.unit}`);
        return;
    }
    
    // Lấy thông tin đối tượng
    let targetName = '';
    if (purpose === 'sale') {
        const customer = customers.find(c => c.id == targetId);
        targetName = customer ? customer.name : '';
    } else if (purpose === 'return') {
        const supplier = suppliers.find(s => s.id == targetId);
        targetName = supplier ? supplier.name : '';
    } else if (purpose === 'internal') {
        targetName = 'Sử dụng nội bộ';
    } else if (purpose === 'production') {
        targetName = 'Sản xuất';
    }
    
    const exportRecord = {
        id: Date.now(),
        code: document.getElementById('exportCode').value,
        date: document.getElementById('exportDate').value,
        materialId: materialId,
        materialCode: material.code,
        materialName: material.name,
        materialUnit: material.unit,
        quantity: quantity,
        price: parseFloat(document.getElementById('exportPrice').value),
        total: parseFloat(document.getElementById('exportTotal').value),
        purpose: purpose,
        targetId: targetId,
        targetName: targetName,
        note: document.getElementById('exportNote').value
    };
    
    // Trừ tồn kho
    material.stock -= quantity;
    saveData('materials', materials);
    
    // Lưu phiếu xuất
    materialExports.push(exportRecord);
    saveData('materialExports', materialExports);
    
    // Tạo bút toán kế toán
    createExportAccountingEntry(exportRecord);
    
    // Cập nhật giao diện
    displayMaterials();
    displayMaterialExports();
    loadMaterialsForExport();
    
    this.reset();
    setDefaultDates();
    alert('Xuất kho thành công!');
});

// Hiển thị lịch sử xuất kho
function displayMaterialExports() {
    const tbody = document.getElementById('exportList');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const purposeText = {
        'sale': 'Bán hàng',
        'return': 'Hoàn trả NCC',
        'internal': 'Nội bộ',
        'production': 'Sản xuất'
    };
    
    materialExports.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(exp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${exp.code}</td>
            <td>${formatDate(exp.date)}</td>
            <td>${exp.materialName} (${exp.materialUnit})</td>
            <td>${exp.quantity}</td>
            <td>${purposeText[exp.purpose]}</td>
            <td>${exp.targetName || '-'}</td>
            <td class="amount-negative">${formatMoney(exp.total)}</td>
            <td><button class="btn-delete" onclick="deleteMaterialExport(${exp.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Xóa phiếu xuất
function deleteMaterialExport(id) {
    if (confirm('Bạn có chắc muốn xóa phiếu xuất này?')) {
        const exp = materialExports.find(e => e.id === id);
        if (exp) {
            // Cộng lại tồn kho
            const material = materials.find(m => m.id == exp.materialId);
            if (material) {
                material.stock += exp.quantity;
                saveData('materials', materials);
            }
        }
        materialExports = materialExports.filter(e => e.id !== id);
        saveData('materialExports', materialExports);
        displayMaterials();
        displayMaterialExports();
        loadMaterialsForExport();
    }
}

// Tạo bút toán kế toán cho xuất kho
function createExportAccountingEntry(exportRecord) {
    let debitAccount = '';
    let creditAccount = '152'; // TK 152 - Nguyên vật liệu (Có)
    let description = '';
    
    switch(exportRecord.purpose) {
        case 'sale':
            // Bán hàng: Nợ 131 (Phải thu KH) / Có 152 (NVL)
            debitAccount = '131';
            description = `Xuất bán NVL cho ${exportRecord.targetName}`;
            break;
        case 'return':
            // Hoàn trả: Nợ 331 (Phải trả NCC) / Có 152 (NVL)
            debitAccount = '331';
            description = `Hoàn trả NVL cho ${exportRecord.targetName}`;
            break;
        case 'internal':
            // Nội bộ: Nợ 642 (Chi phí quản lý) / Có 152 (NVL)
            debitAccount = '642';
            description = `Xuất NVL sử dụng nội bộ`;
            break;
        case 'production':
            // Sản xuất: Nợ 621 (Chi phí NVL) / Có 152 (NVL)
            debitAccount = '621';
            description = `Xuất NVL cho sản xuất`;
            break;
    }
    
    const entry = {
        id: Date.now(),
        voucherNo: exportRecord.code,
        date: exportRecord.date,
        debitAccount: debitAccount,
        creditAccount: creditAccount,
        amount: exportRecord.total,
        type: 'material_export',
        description: `${description} - ${exportRecord.materialName} (${exportRecord.quantity} ${exportRecord.materialUnit})`
    };
    
    accountingEntries.push(entry);
    saveData('accountingEntries', accountingEntries);
    
    // Cập nhật hiển thị nếu đang ở trang hạch toán
    if (typeof displayAccountingEntries === 'function') {
        displayAccountingEntries();
    }
}

// Xuất Excel lịch sử xuất kho
function exportMaterialExports() {
    if (materialExports.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const purposeText = {
        'sale': 'Bán hàng',
        'return': 'Hoàn trả NCC',
        'internal': 'Nội bộ',
        'production': 'Sản xuất'
    };
    
    const data = materialExports.map((e, index) => ({
        'STT': index + 1,
        'Mã Phiếu Xuất': e.code,
        'Ngày': formatDate(e.date),
        'Mã NVL': e.materialCode,
        'Tên NVL': e.materialName,
        'Đơn Vị': e.materialUnit,
        'Số Lượng': e.quantity,
        'Đơn Giá (VNĐ)': e.price,
        'Thành Tiền (VNĐ)': e.total,
        'Mục Đích': purposeText[e.purpose],
        'Đối Tượng': e.targetName || '',
        'Ghi Chú': e.note || ''
    }));
    
    data.push({
        'STT': '',
        'Mã Phiếu Xuất': '',
        'Ngày': '',
        'Mã NVL': '',
        'Tên NVL': '',
        'Đơn Vị': '',
        'Số Lượng': '',
        'Đơn Giá (VNĐ)': '',
        'Thành Tiền (VNĐ)': materialExports.reduce((sum, e) => sum + e.total, 0),
        'Mục Đích': 'TỔNG CỘNG',
        'Đối Tượng': '',
        'Ghi Chú': ''
    });
    
    exportToExcel(data, 'PhieuXuatKho');
}

// Báo cáo xuất nhập tồn
function generateInventoryReport() {
    const reportData = materials.map(material => {
        // Tính tổng nhập
        const totalImport = materialImports
            .filter(i => i.materialId == material.id)
            .reduce((sum, i) => sum + i.quantity, 0);
        
        // Tính tổng xuất
        const totalExport = materialExports
            .filter(e => e.materialId == material.id)
            .reduce((sum, e) => sum + e.quantity, 0);
        
        // Giá trị tồn
        const stockValue = material.stock * material.price;
        
        return {
            code: material.code,
            name: material.name,
            unit: material.unit,
            totalImport: totalImport,
            totalExport: totalExport,
            currentStock: material.stock,
            price: material.price,
            stockValue: stockValue
        };
    });
    
    return reportData;
}

function exportInventoryReport() {
    const reportData = generateInventoryReport();
    
    if (reportData.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = reportData.map((item, index) => ({
        'STT': index + 1,
        'Mã NVL': item.code,
        'Tên NVL': item.name,
        'Đơn Vị': item.unit,
        'Tổng Nhập': item.totalImport,
        'Tổng Xuất': item.totalExport,
        'Tồn Kho': item.currentStock,
        'Đơn Giá (VNĐ)': item.price,
        'Giá Trị Tồn (VNĐ)': item.stockValue
    }));
    
    const totalStockValue = reportData.reduce((sum, item) => sum + item.stockValue, 0);
    
    data.push({
        'STT': '',
        'Mã NVL': '',
        'Tên NVL': '',
        'Đơn Vị': '',
        'Tổng Nhập': '',
        'Tổng Xuất': '',
        'Tồn Kho': '',
        'Đơn Giá (VNĐ)': 'TỔNG GIÁ TRỊ',
        'Giá Trị Tồn (VNĐ)': totalStockValue
    });
    
    exportToExcel(data, 'BaoCaoXuatNhapTon');
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    loadMaterialsForExport();
    displayMaterialExports();
    
    // Set ngày mặc định cho xuất kho
    const exportDateEl = document.getElementById('exportDate');
    if (exportDateEl) {
        exportDateEl.value = new Date().toISOString().split('T')[0];
    }
});
