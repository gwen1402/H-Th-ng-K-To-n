// ===== QUẢN LÝ NHÂN VIÊN =====
let currentSalaryData = null;

// Form Nhân Viên
document.getElementById('employeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const employee = {
        id: Date.now(),
        code: document.getElementById('empCode').value,
        name: document.getElementById('empName').value,
        phone: document.getElementById('empPhone').value,
        email: document.getElementById('empEmail').value,
        position: document.getElementById('empPosition').value,
        department: document.getElementById('empDepartment').value,
        baseSalary: parseFloat(document.getElementById('empBaseSalary').value),
        region: document.getElementById('empRegion').value,
        dependents: parseInt(document.getElementById('empDependents').value) || 0,
        startDate: document.getElementById('empStartDate').value
    };
    
    if (employees.find(e => e.code === employee.code)) {
        alert('Mã nhân viên đã tồn tại!');
        return;
    }
    
    employees.push(employee);
    saveData('employees', employees);
    displayEmployees();
    loadEmployees();
    this.reset();
    alert('Thêm nhân viên thành công!');
});

function loadEmployees() {
    const select = document.getElementById('attEmployee');
    if (!select) return;
    select.innerHTML = '<option value="">Chọn nhân viên</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.code} - ${emp.name}`;
        select.appendChild(option);
    });
}

function displayEmployees() {
    const tbody = document.getElementById('employeeList');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    employees.forEach(emp => {
        const tr = document.createElement('tr');
        const regionText = {
            region1: 'Vùng I',
            region2: 'Vùng II',
            region3: 'Vùng III',
            region4: 'Vùng IV'
        };
        tr.innerHTML = `
            <td>${emp.code}</td>
            <td>${emp.name}</td>
            <td>${emp.position}</td>
            <td>${emp.department || '-'}</td>
            <td>${formatMoney(emp.baseSalary)}</td>
            <td>${regionText[emp.region]}</td>
            <td>${emp.dependents}</td>
            <td><button class="btn-delete" onclick="deleteEmployee(${emp.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteEmployee(id) {
    if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
        employees = employees.filter(e => e.id !== id);
        saveData('employees', employees);
        displayEmployees();
        loadEmployees();
    }
}

// ===== CHẤM CÔNG & TÍNH LƯƠNG =====
document.getElementById('attendanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSalary();
});

function calculateSalary() {
    const empId = document.getElementById('attEmployee').value;
    const employee = employees.find(e => e.id == empId);
    
    if (!employee) {
        alert('Vui lòng chọn nhân viên!');
        return;
    }
    
    const month = document.getElementById('attMonth').value;
    const workDays = parseFloat(document.getElementById('attWorkDays').value);
    const overtimeHours = parseFloat(document.getElementById('attOvertimeHours').value) || 0;
    const allowance = parseFloat(document.getElementById('attAllowance').value) || 0;
    const bonus = parseFloat(document.getElementById('attBonus').value) || 0;
    
    // Tính lương
    const baseSalary = employee.baseSalary;
    const workSalary = (baseSalary / 26) * workDays; // 26 ngày công chuẩn
    const overtimeSalary = (baseSalary / 26 / 8) * overtimeHours * 1.5; // 150% lương OT
    const grossIncome = workSalary + overtimeSalary + allowance + bonus;
    
    // Tính bảo hiểm (dựa trên lương cơ bản)
    const bhxh = baseSalary * INSURANCE_RATES.bhxh_employee;
    const bhyt = baseSalary * INSURANCE_RATES.bhyt_employee;
    const bhtn = baseSalary * INSURANCE_RATES.bhtn_employee;
    const totalInsurance = bhxh + bhyt + bhtn;
    
    // Thu nhập trước thuế
    const taxableIncome = grossIncome - totalInsurance;
    
    // Giảm trừ
    const selfDeduction = FAMILY_DEDUCTION;
    const dependentDeduction = employee.dependents * DEPENDENT_DEDUCTION;
    const totalDeduction = selfDeduction + dependentDeduction;
    
    // Thu nhập tính thuế
    const taxBase = Math.max(0, taxableIncome - totalDeduction);
    
    // Tính thuế TNCN theo bậc
    const tax = calculatePersonalIncomeTax(taxBase);
    
    // Lương thực lĩnh
    const netSalary = grossIncome - totalInsurance - tax;
    
    // Lưu dữ liệu tạm
    currentSalaryData = {
        employeeId: empId,
        employeeName: employee.name,
        employeeCode: employee.code,
        month: month,
        workDays: workDays,
        overtimeHours: overtimeHours,
        baseSalary: baseSalary,
        workSalary: workSalary,
        overtimeSalary: overtimeSalary,
        allowance: allowance,
        bonus: bonus,
        grossIncome: grossIncome,
        bhxh: bhxh,
        bhyt: bhyt,
        bhtn: bhtn,
        totalInsurance: totalInsurance,
        taxableIncome: taxableIncome,
        selfDeduction: selfDeduction,
        dependentDeduction: dependentDeduction,
        taxBase: taxBase,
        tax: tax,
        netSalary: netSalary
    };
    
    // Hiển thị preview
    displaySalaryPreview(currentSalaryData);
}

function calculatePersonalIncomeTax(taxBase) {
    let tax = 0;
    let previousLimit = 0;
    
    for (let bracket of TAX_BRACKETS) {
        if (taxBase <= previousLimit) break;
        
        const taxableAmount = Math.min(taxBase, bracket.limit) - previousLimit;
        tax += taxableAmount * bracket.rate;
        previousLimit = bracket.limit;
        
        if (taxBase <= bracket.limit) break;
    }
    
    return Math.round(tax);
}

function displaySalaryPreview(data) {
    document.getElementById('previewBaseSalary').textContent = formatMoney(data.baseSalary);
    document.getElementById('previewWorkSalary').textContent = formatMoney(data.workSalary);
    document.getElementById('previewOvertimeSalary').textContent = formatMoney(data.overtimeSalary);
    document.getElementById('previewAllowance').textContent = formatMoney(data.allowance);
    document.getElementById('previewBonus').textContent = formatMoney(data.bonus);
    document.getElementById('previewGrossIncome').textContent = formatMoney(data.grossIncome);
    
    document.getElementById('previewBHXH').textContent = formatMoney(data.bhxh);
    document.getElementById('previewBHYT').textContent = formatMoney(data.bhyt);
    document.getElementById('previewBHTN').textContent = formatMoney(data.bhtn);
    document.getElementById('previewTotalInsurance').textContent = formatMoney(data.totalInsurance);
    
    document.getElementById('previewTaxableIncome').textContent = formatMoney(data.taxableIncome);
    document.getElementById('previewSelfDeduction').textContent = formatMoney(data.selfDeduction);
    document.getElementById('previewDependentDeduction').textContent = formatMoney(data.dependentDeduction);
    document.getElementById('previewTaxBase').textContent = formatMoney(data.taxBase);
    document.getElementById('previewTax').textContent = formatMoney(data.tax);
    
    document.getElementById('previewNetSalary').textContent = formatMoney(data.netSalary);
    
    document.getElementById('salaryPreview').style.display = 'block';
}

function saveAttendance() {
    if (!currentSalaryData) {
        alert('Vui lòng tính lương trước!');
        return;
    }
    
    const attendance = {
        id: Date.now(),
        ...currentSalaryData
    };
    
    attendances.push(attendance);
    saveData('attendances', attendances);
    displayAttendances();
    
    // Tự động tạo bút toán
    createSalaryAccountingEntry(attendance);
    
    document.getElementById('attendanceForm').reset();
    document.getElementById('salaryPreview').style.display = 'none';
    currentSalaryData = null;
    
    alert('Lưu bảng lương thành công!');
}

function displayAttendances() {
    const tbody = document.getElementById('attendanceList');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    attendances.sort((a, b) => b.month.localeCompare(a.month)).forEach(att => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${att.month}</td>
            <td>${att.employeeName}</td>
            <td>${att.workDays}</td>
            <td class="amount-positive">${formatMoney(att.grossIncome)}</td>
            <td class="amount-negative">${formatMoney(att.totalInsurance)}</td>
            <td class="amount-negative">${formatMoney(att.tax)}</td>
            <td class="amount-positive"><strong>${formatMoney(att.netSalary)}</strong></td>
            <td><button class="btn-delete" onclick="deleteAttendance(${att.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteAttendance(id) {
    if (confirm('Bạn có chắc muốn xóa bảng lương này?')) {
        attendances = attendances.filter(a => a.id !== id);
        saveData('attendances', attendances);
        displayAttendances();
    }
}

// ===== HẠCH TOÁN KẾ TOÁN =====
document.getElementById('accountingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const entry = {
        id: Date.now(),
        voucherNo: document.getElementById('accVoucherNo').value,
        date: document.getElementById('accDate').value,
        debitAccount: document.getElementById('accDebit').value,
        creditAccount: document.getElementById('accCredit').value,
        amount: parseFloat(document.getElementById('accAmount').value),
        type: document.getElementById('accType').value,
        description: document.getElementById('accDescription').value
    };
    
    accountingEntries.push(entry);
    saveData('accountingEntries', accountingEntries);
    displayAccountingEntries();
    this.reset();
    alert('Ghi sổ thành công!');
});

function createSalaryAccountingEntry(attendance) {
    // Nợ 622 - Chi phí nhân công / Có 334 - Phải trả người lao động
    const entry = {
        id: Date.now(),
        voucherNo: `BL${attendance.month.replace('-', '')}`,
        date: new Date().toISOString().split('T')[0],
        debitAccount: '622',
        creditAccount: '334',
        amount: attendance.netSalary,
        type: 'salary',
        description: `Lương tháng ${attendance.month} - ${attendance.employeeName}`
    };
    
    accountingEntries.push(entry);
    saveData('accountingEntries', accountingEntries);
    displayAccountingEntries();
}

function displayAccountingEntries() {
    const tbody = document.getElementById('accountingList');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const typeText = {
        manual: 'Nhập tay',
        receipt: 'Phiếu thu',
        payment: 'Phiếu chi',
        invoice: 'Hóa đơn',
        salary: 'Bảng lương'
    };
    
    accountingEntries.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${entry.voucherNo}</td>
            <td>${entry.description || '-'}</td>
            <td>${entry.debitAccount}</td>
            <td>${entry.creditAccount}</td>
            <td class="amount-positive">${formatMoney(entry.amount)}</td>
            <td>${typeText[entry.type]}</td>
            <td><button class="btn-delete" onclick="deleteAccountingEntry(${entry.id})">Xóa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteAccountingEntry(id) {
    if (confirm('Bạn có chắc muốn xóa bút toán này?')) {
        accountingEntries = accountingEntries.filter(e => e.id !== id);
        saveData('accountingEntries', accountingEntries);
        displayAccountingEntries();
    }
}

function generateAccountReport() {
    const account = document.getElementById('reportAccount').value;
    
    if (!account) {
        alert('Vui lòng chọn tài khoản!');
        return;
    }
    
    const entries = accountingEntries.filter(e => 
        e.debitAccount === account || e.creditAccount === account
    );
    
    let totalDebit = 0;
    let totalCredit = 0;
    
    entries.forEach(entry => {
        if (entry.debitAccount === account) {
            totalDebit += entry.amount;
        }
        if (entry.creditAccount === account) {
            totalCredit += entry.amount;
        }
    });
    
    const balance = totalDebit - totalCredit;
    
    const accountName = getAccountName(account);
    document.getElementById('reportAccountName').textContent = `${account} - ${accountName}`;
    document.getElementById('reportTotalDebit').textContent = formatMoney(totalDebit);
    document.getElementById('reportTotalCredit').textContent = formatMoney(totalCredit);
    document.getElementById('reportBalance').textContent = formatMoney(Math.abs(balance));
    document.getElementById('reportBalance').className = balance >= 0 ? 'amount-positive' : 'amount-negative';
    
    document.getElementById('accountReport').style.display = 'block';
}

// ===== EXPORT EXCEL =====
function exportEmployees() {
    if (employees.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const regionText = {
        region1: 'Vùng I',
        region2: 'Vùng II',
        region3: 'Vùng III',
        region4: 'Vùng IV'
    };
    
    const data = employees.map((e, index) => ({
        'STT': index + 1,
        'Mã NV': e.code,
        'Họ Tên': e.name,
        'Chức Vụ': e.position,
        'Phòng Ban': e.department || '',
        'Lương CB (VNĐ)': e.baseSalary,
        'Vùng': regionText[e.region],
        'Người PT': e.dependents,
        'Ngày Vào': e.startDate || ''
    }));
    
    exportToExcel(data, 'DanhSachNhanVien');
}

function exportSalaries() {
    if (attendances.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = attendances.map((a, index) => ({
        'STT': index + 1,
        'Tháng': a.month,
        'Mã NV': a.employeeCode,
        'Họ Tên': a.employeeName,
        'Ngày Công': a.workDays,
        'Giờ TC': a.overtimeHours,
        'Lương CB (VNĐ)': a.baseSalary,
        'Lương Công (VNĐ)': a.workSalary,
        'Lương TC (VNĐ)': a.overtimeSalary,
        'Phụ Cấp (VNĐ)': a.allowance,
        'Thưởng (VNĐ)': a.bonus,
        'Tổng Thu (VNĐ)': a.grossIncome,
        'BHXH (VNĐ)': a.bhxh,
        'BHYT (VNĐ)': a.bhyt,
        'BHTN (VNĐ)': a.bhtn,
        'Tổng BH (VNĐ)': a.totalInsurance,
        'Thuế TNCN (VNĐ)': a.tax,
        'Thực Lĩnh (VNĐ)': a.netSalary
    }));
    
    exportToExcel(data, 'BangLuong');
}

function exportAccounting() {
    if (accountingEntries.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const typeText = {
        manual: 'Nhập tay',
        receipt: 'Phiếu thu',
        payment: 'Phiếu chi',
        invoice: 'Hóa đơn',
        salary: 'Bảng lương'
    };
    
    const data = accountingEntries.map((e, index) => ({
        'STT': index + 1,
        'Ngày': formatDate(e.date),
        'Số CT': e.voucherNo,
        'Diễn Giải': e.description || '',
        'TK Nợ': e.debitAccount,
        'TK Có': e.creditAccount,
        'Số Tiền (VNĐ)': e.amount,
        'Loại': typeText[e.type]
    }));
    
    exportToExcel(data, 'SoNhatKyChung');
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    displayEmployees();
    displayAttendances();
    displayAccountingEntries();
});


// ===== LOAD HỆ THỐNG TÀI KHOẢN =====
function loadChartOfAccounts() {
    // Load cho form hạch toán
    const debitSelect = document.getElementById('accDebit');
    const creditSelect = document.getElementById('accCredit');
    const reportSelect = document.getElementById('reportAccount');
    
    if (debitSelect && creditSelect) {
        const level1Accounts = getLevel1Accounts();
        
        debitSelect.innerHTML = '<option value="">Chọn TK Nợ</option>';
        creditSelect.innerHTML = '<option value="">Chọn TK Có</option>';
        
        // Nhóm theo loại
        const groups = {
            'asset': 'TÀI SẢN',
            'liability': 'NỢ PHẢI TRẢ',
            'equity': 'VỐN CHỦ SỞ HỮU',
            'revenue': 'DOANH THU',
            'expense': 'CHI PHÍ',
            'other_income': 'THU NHẬP KHÁC',
            'other_expense': 'CHI PHÍ KHÁC'
        };
        
        Object.entries(groups).forEach(([type, label]) => {
            const accounts = level1Accounts.filter(acc => acc.type === type);
            if (accounts.length > 0) {
                // Thêm optgroup
                const optgroupDebit = document.createElement('optgroup');
                optgroupDebit.label = label;
                const optgroupCredit = document.createElement('optgroup');
                optgroupCredit.label = label;
                
                accounts.forEach(acc => {
                    const optionDebit = document.createElement('option');
                    optionDebit.value = acc.code;
                    optionDebit.textContent = `${acc.code} - ${acc.name}`;
                    optgroupDebit.appendChild(optionDebit);
                    
                    const optionCredit = document.createElement('option');
                    optionCredit.value = acc.code;
                    optionCredit.textContent = `${acc.code} - ${acc.name}`;
                    optgroupCredit.appendChild(optionCredit);
                });
                
                debitSelect.appendChild(optgroupDebit);
                creditSelect.appendChild(optgroupCredit);
            }
        });
    }
    
    // Load cho báo cáo tài khoản
    if (reportSelect) {
        reportSelect.innerHTML = '<option value="">Chọn tài khoản</option>';
        const commonAccounts = [
            '111', '112', '131', '152', '331', '334', '511', '621', '622', '627', '632', '641', '642'
        ];
        
        commonAccounts.forEach(code => {
            const account = CHART_OF_ACCOUNTS[code];
            if (account) {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${code} - ${account.name}`;
                reportSelect.appendChild(option);
            }
        });
    }
}

// Gọi khi trang load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof CHART_OF_ACCOUNTS !== 'undefined') {
        loadChartOfAccounts();
    }
});
