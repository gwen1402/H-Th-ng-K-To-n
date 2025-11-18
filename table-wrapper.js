// Tự động wrap các bảng vào div có scrollbar
document.addEventListener('DOMContentLoaded', function() {
    // Đợi một chút để các bảng được render
    setTimeout(function() {
        // Tìm tất cả các bảng trong data-table và recent-transactions
        const tables = document.querySelectorAll('.data-table > table, .recent-transactions > table, .form-card > table');
        
        tables.forEach(table => {
            // Kiểm tra xem đã được wrap chưa
            if (table.parentElement.classList.contains('table-wrapper')) {
                return;
            }
            
            // Tạo wrapper div
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            
            // Wrap table
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }, 100);
});

// Cập nhật lại wrapper mỗi khi có thay đổi dữ liệu
const originalDisplayFunctions = [
    'displayReceipts',
    'displayPayments', 
    'displayInvoices',
    'displayCustomers',
    'displaySuppliers',
    'displayMaterials',
    'displayMaterialImports',
    'displayReceivables',
    'displayPayables'
];

// Wrap lại sau khi display
window.addEventListener('load', function() {
    originalDisplayFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            const originalFunc = window[funcName];
            window[funcName] = function() {
                originalFunc.apply(this, arguments);
                setTimeout(wrapTables, 50);
            };
        }
    });
});

function wrapTables() {
    const tables = document.querySelectorAll('.data-table > table:not(.table-wrapper > table), .recent-transactions > table:not(.table-wrapper > table), .form-card > table:not(.table-wrapper > table)');
    
    tables.forEach(table => {
        if (table.parentElement.classList.contains('table-wrapper')) {
            return;
        }
        
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}
