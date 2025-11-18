// ===== DỊCH VỤ GỬI EMAIL =====

// Cấu hình EmailJS (người dùng cần đăng ký tại emailjs.com)
let emailConfig = {
    serviceId: '',
    templateId: '',
    publicKey: '',
    isConfigured: false
};

// Load cấu hình email từ localStorage
function loadEmailConfig() {
    const saved = localStorage.getItem('emailConfig');
    if (saved) {
        emailConfig = JSON.parse(saved);
    }
}

// Lưu cấu hình email
function saveEmailConfig(serviceId, templateId, publicKey) {
    emailConfig = {
        serviceId,
        templateId,
        publicKey,
        isConfigured: true
    };
    localStorage.setItem('emailConfig', JSON.stringify(emailConfig));
    alert('✅ Đã lưu cấu hình email!');
}

// Kiểm tra cấu hình
function checkEmailConfig() {
    if (!emailConfig.isConfigured) {
        alert('⚠️ Vui lòng cấu hình Email trước!\n\nVào Cài Đặt > Cấu Hình Email');
        return false;
    }
    return true;
}

// Gửi email với file đính kèm
async function sendEmailWithAttachment(recipientEmail, subject, message, fileName, fileContent) {
    if (!checkEmailConfig()) return;
    
    try {
        // Khởi tạo EmailJS
        emailjs.init(emailConfig.publicKey);
        
        // Tham số gửi email
        const templateParams = {
            to_email: recipientEmail,
            subject: subject,
            message: message,
            file_name: fileName,
            file_content: fileContent,
            from_name: 'Hệ Thống Kế Toán'
        };
        
        // Gửi email
        const response = await emailjs.send(
            emailConfig.serviceId,
            emailConfig.templateId,
            templateParams
        );
        
        if (response.status === 200) {
            alert('✅ Đã gửi email thành công!');
            return true;
        }
    } catch (error) {
        console.error('Lỗi gửi email:', error);
        alert('❌ Lỗi gửi email: ' + error.text || error.message);
        return false;
    }
}

// Gửi báo cáo qua email
async function sendReportByEmail(reportType) {
    const email = prompt('Nhập địa chỉ email người nhận:');
    if (!email) return;
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Email không hợp lệ!');
        return;
    }
    
    let fileName, fileContent, subject, message;
    
    try {
        switch(reportType) {
            case 'receipts':
                if (receipts.length === 0) {
                    alert('Không có dữ liệu để gửi!');
                    return;
                }
                fileName = `PhieuThu_${new Date().toISOString().split('T')[0]}.xlsx`;
                fileContent = await generateExcelBase64('receipts');
                subject = 'Báo cáo Phiếu Thu';
                message = `Xin gửi báo cáo Phiếu Thu ngày ${formatDate(new Date().toISOString().split('T')[0])}`;
                break;
                
            case 'payments':
                if (payments.length === 0) {
                    alert('Không có dữ liệu để gửi!');
                    return;
                }
                fileName = `PhieuChi_${new Date().toISOString().split('T')[0]}.xlsx`;
                fileContent = await generateExcelBase64('payments');
                subject = 'Báo cáo Phiếu Chi';
                message = `Xin gửi báo cáo Phiếu Chi ngày ${formatDate(new Date().toISOString().split('T')[0])}`;
                break;
                
            case 'salaries':
                if (attendances.length === 0) {
                    alert('Không có dữ liệu để gửi!');
                    return;
                }
                fileName = `BangLuong_${new Date().toISOString().split('T')[0]}.xlsx`;
                fileContent = await generateExcelBase64('salaries');
                subject = 'Bảng Lương Nhân Viên';
                message = `Xin gửi Bảng Lương tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
                break;
                
            case 'accounting':
                if (accountingEntries.length === 0) {
                    alert('Không có dữ liệu để gửi!');
                    return;
                }
                fileName = `SoNhatKy_${new Date().toISOString().split('T')[0]}.xlsx`;
                fileContent = await generateExcelBase64('accounting');
                subject = 'Sổ Nhật Ký Chung';
                message = `Xin gửi Sổ Nhật Ký Chung ngày ${formatDate(new Date().toISOString().split('T')[0])}`;
                break;
                
            default:
                alert('Loại báo cáo không hợp lệ!');
                return;
        }
        
        // Hiển thị loading
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'emailLoading';
        loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:10px;box-shadow:0 5px 20px rgba(0,0,0,0.3);z-index:10000;text-align:center;';
        loadingMsg.innerHTML = '<h3>📧 Đang gửi email...</h3><p>Vui lòng đợi</p>';
        document.body.appendChild(loadingMsg);
        
        // Gửi email
        await sendEmailWithAttachment(email, subject, message, fileName, fileContent);
        
        // Xóa loading
        document.body.removeChild(loadingMsg);
        
    } catch (error) {
        console.error('Lỗi:', error);
        alert('❌ Có lỗi xảy ra: ' + error.message);
    }
}

// Tạo file Excel dạng Base64
async function generateExcelBase64(type) {
    let data = [];
    
    switch(type) {
        case 'receipts':
            data = receipts.map((r, index) => ({
                'STT': index + 1,
                'Mã Phiếu Thu': r.code,
                'Ngày': formatDate(r.date),
                'Khách Hàng': r.customerName,
                'Số Tiền (VNĐ)': r.amount,
                'Diễn Giải': r.description || ''
            }));
            break;
            
        case 'payments':
            data = payments.map((p, index) => ({
                'STT': index + 1,
                'Mã Phiếu Chi': p.code,
                'Ngày': formatDate(p.date),
                'Nhà Cung Cấp': p.supplierName,
                'Số Tiền (VNĐ)': p.amount,
                'Diễn Giải': p.description || ''
            }));
            break;
            
        case 'salaries':
            data = attendances.map((a, index) => ({
                'STT': index + 1,
                'Tháng': a.month,
                'Mã NV': a.employeeCode,
                'Họ Tên': a.employeeName,
                'Ngày Công': a.workDays,
                'Tổng Thu (VNĐ)': a.grossIncome,
                'Bảo Hiểm (VNĐ)': a.totalInsurance,
                'Thuế TNCN (VNĐ)': a.tax,
                'Thực Lĩnh (VNĐ)': a.netSalary
            }));
            break;
            
        case 'accounting':
            const typeText = {
                manual: 'Nhập tay',
                receipt: 'Phiếu thu',
                payment: 'Phiếu chi',
                invoice: 'Hóa đơn',
                salary: 'Bảng lương'
            };
            data = accountingEntries.map((e, index) => ({
                'STT': index + 1,
                'Ngày': formatDate(e.date),
                'Số CT': e.voucherNo,
                'Diễn Giải': e.description || '',
                'TK Nợ': e.debitAccount,
                'TK Có': e.creditAccount,
                'Số Tiền (VNĐ)': e.amount,
                'Loại': typeText[e.type]
            }));
            break;
    }
    
    // Tạo workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Chuyển sang base64
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    return wbout;
}

// Hiển thị form cấu hình email
function showEmailConfigForm() {
    const modal = document.createElement('div');
    modal.id = 'emailConfigModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    
    modal.innerHTML = `
        <div style="background:white;padding:30px;border-radius:10px;max-width:500px;width:90%;">
            <h2 style="margin-bottom:20px;">⚙️ Cấu Hình Email</h2>
            <p style="color:#666;margin-bottom:20px;">
                Để sử dụng tính năng gửi email, bạn cần đăng ký tài khoản miễn phí tại 
                <a href="https://www.emailjs.com/" target="_blank" style="color:#3498db;">EmailJS.com</a>
            </p>
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-weight:600;">Service ID:</label>
                <input type="text" id="emailServiceId" value="${emailConfig.serviceId || ''}" 
                    style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-weight:600;">Template ID:</label>
                <input type="text" id="emailTemplateId" value="${emailConfig.templateId || ''}"
                    style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;">
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:block;margin-bottom:5px;font-weight:600;">Public Key:</label>
                <input type="text" id="emailPublicKey" value="${emailConfig.publicKey || ''}"
                    style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;">
            </div>
            <div style="display:flex;gap:10px;">
                <button onclick="saveEmailConfigFromForm()" 
                    style="flex:1;padding:12px;background:#27ae60;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:600;">
                    Lưu
                </button>
                <button onclick="closeEmailConfigModal()" 
                    style="flex:1;padding:12px;background:#95a5a6;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:600;">
                    Đóng
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function saveEmailConfigFromForm() {
    const serviceId = document.getElementById('emailServiceId').value.trim();
    const templateId = document.getElementById('emailTemplateId').value.trim();
    const publicKey = document.getElementById('emailPublicKey').value.trim();
    
    if (!serviceId || !templateId || !publicKey) {
        alert('⚠️ Vui lòng điền đầy đủ thông tin!');
        return;
    }
    
    saveEmailConfig(serviceId, templateId, publicKey);
    closeEmailConfigModal();
}

function closeEmailConfigModal() {
    const modal = document.getElementById('emailConfigModal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    loadEmailConfig();
});
