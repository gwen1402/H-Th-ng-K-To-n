// HỆ THỐNG TÀI KHOẢN KẾ TOÁN THEO CHUẨN VIỆT NAM

const CHART_OF_ACCOUNTS = {
    // TÀI SẢN
    '111': { name: 'Tiền mặt', type: 'asset', level: 1 },
    '112': { name: 'Tiền gửi không kỳ hạn', type: 'asset', level: 1 },
    '113': { name: 'Tiền đang chuyển', type: 'asset', level: 1 },
    '121': { name: 'Chứng khoán kinh doanh', type: 'asset', level: 1 },
    '128': { name: 'Đầu tư nắm giữ đến ngày đáo hạn', type: 'asset', level: 1 },
    '1281': { name: 'Tiền gửi có kỳ hạn', type: 'asset', level: 2 },
    '1282': { name: 'Trái phiếu', type: 'asset', level: 2 },
    '1283': { name: 'Cho vay', type: 'asset', level: 2 },
    '1288': { name: 'Các khoản đầu tư khác nắm giữ đến ngày đáo hạn', type: 'asset', level: 2 },
    '131': { name: 'Phải thu của khách hàng', type: 'asset', level: 1 },
    '133': { name: 'Thuế GTGT được khấu trừ', type: 'asset', level: 1 },
    '1331': { name: 'Thuế GTGT được khấu trừ của hàng hóa, dịch vụ', type: 'asset', level: 2 },
    '1332': { name: 'Thuế GTGT được khấu trừ của TSCĐ', type: 'asset', level: 2 },
    '136': { name: 'Phải thu nội bộ', type: 'asset', level: 1 },
    '138': { name: 'Phải thu khác', type: 'asset', level: 1 },
    '1381': { name: 'Tài sản thiếu chờ xử lý', type: 'asset', level: 2 },
    '1388': { name: 'Phải thu khác', type: 'asset', level: 2 },
    '141': { name: 'Tạm ứng', type: 'asset', level: 1 },
    '151': { name: 'Hàng mua đang đi đường', type: 'asset', level: 1 },
    '152': { name: 'Nguyên liệu, vật liệu', type: 'asset', level: 1 },
    '153': { name: 'Công cụ, dụng cụ', type: 'asset', level: 1 },
    '154': { name: 'Chi phí sản xuất, kinh doanh dở dang', type: 'asset', level: 1 },
    '155': { name: 'Sản phẩm', type: 'asset', level: 1 },
    '156': { name: 'Hàng hóa', type: 'asset', level: 1 },
    '157': { name: 'Hàng gửi đi bán', type: 'asset', level: 1 },
    '211': { name: 'Tài sản cố định hữu hình', type: 'asset', level: 1 },
    '212': { name: 'Tài sản cố định thuê tài chính', type: 'asset', level: 1 },
    '213': { name: 'Tài sản cố định vô hình', type: 'asset', level: 1 },
    '214': { name: 'Hao mòn tài sản cố định', type: 'asset', level: 1 },
    '2141': { name: 'Hao mòn TSCĐ hữu hình', type: 'asset', level: 2 },
    '2142': { name: 'Hao mòn TSCĐ thuê tài chính', type: 'asset', level: 2 },
    '2143': { name: 'Hao mòn TSCĐ vô hình', type: 'asset', level: 2 },
    '241': { name: 'Xây dựng cơ bản dở dang', type: 'asset', level: 1 },
    '2411': { name: 'Mua sắm TSCĐ', type: 'asset', level: 2 },
    '2412': { name: 'Xây dựng cơ bản', type: 'asset', level: 2 },
    
    // NỢ PHẢI TRẢ
    '331': { name: 'Phải trả cho người bán', type: 'liability', level: 1 },
    '332': { name: 'Phải trả cổ tức, lợi nhuận', type: 'liability', level: 1 },
    '333': { name: 'Thuế và các khoản phải nộp Nhà nước', type: 'liability', level: 1 },
    '3331': { name: 'Thuế giá trị gia tăng phải nộp', type: 'liability', level: 2 },
    '33311': { name: 'Thuế GTGT đầu ra', type: 'liability', level: 3 },
    '33312': { name: 'Thuế GTGT hàng nhập khẩu', type: 'liability', level: 3 },
    '3332': { name: 'Thuế tiêu thụ đặc biệt', type: 'liability', level: 2 },
    '3333': { name: 'Thuế xuất, nhập khẩu', type: 'liability', level: 2 },
    '3334': { name: 'Thuế thu nhập doanh nghiệp', type: 'liability', level: 2 },
    '3335': { name: 'Thuế thu nhập cá nhân', type: 'liability', level: 2 },
    '3336': { name: 'Thuế tài nguyên', type: 'liability', level: 2 },
    '3337': { name: 'Thuế nhà đất, tiền thuê đất', type: 'liability', level: 2 },
    '3338': { name: 'Thuế bảo vệ môi trường và các loại thuế khác', type: 'liability', level: 2 },
    '334': { name: 'Phải trả người lao động', type: 'liability', level: 1 },
    '335': { name: 'Chi phí phải trả', type: 'liability', level: 1 },
    '336': { name: 'Phải trả nội bộ', type: 'liability', level: 1 },
    '338': { name: 'Phải trả, phải nộp khác', type: 'liability', level: 1 },
    '3381': { name: 'Tài sản thừa chờ giải quyết', type: 'liability', level: 2 },
    '3382': { name: 'Kinh phí công đoàn', type: 'liability', level: 2 },
    '3383': { name: 'Bảo hiểm xã hội', type: 'liability', level: 2 },
    '3384': { name: 'Bảo hiểm y tế', type: 'liability', level: 2 },
    '3386': { name: 'Bảo hiểm thất nghiệp', type: 'liability', level: 2 },
    '3388': { name: 'Phải trả, phải nộp khác', type: 'liability', level: 2 },
    '341': { name: 'Vay và nợ thuê tài chính', type: 'liability', level: 1 },
    '3411': { name: 'Các khoản đi vay', type: 'liability', level: 2 },
    '3412': { name: 'Nợ thuê tài chính', type: 'liability', level: 2 },
    
    // VỐN CHỦ SỞ HỮU
    '411': { name: 'Vốn đầu tư của chủ sở hữu', type: 'equity', level: 1 },
    '4111': { name: 'Vốn góp của chủ sở hữu', type: 'equity', level: 2 },
    '4112': { name: 'Thặng dư vốn', type: 'equity', level: 2 },
    '412': { name: 'Chênh lệch đánh giá lại tài sản', type: 'equity', level: 1 },
    '413': { name: 'Chênh lệch tỷ giá hối đoái', type: 'equity', level: 1 },
    '414': { name: 'Quỹ đầu tư phát triển', type: 'equity', level: 1 },
    '418': { name: 'Các quỹ khác thuộc vốn chủ sở hữu', type: 'equity', level: 1 },
    '421': { name: 'Lợi nhuận sau thuế chưa phân phối', type: 'equity', level: 1 },
    '4211': { name: 'Lợi nhuận sau thuế chưa phân phối lũy kế đến cuối năm trước', type: 'equity', level: 2 },
    '4212': { name: 'Lợi nhuận sau thuế chưa phân phối năm nay', type: 'equity', level: 2 },
    
    // DOANH THU
    '511': { name: 'Doanh thu bán hàng và cung cấp dịch vụ', type: 'revenue', level: 1 },
    '515': { name: 'Doanh thu hoạt động tài chính', type: 'revenue', level: 1 },
    '521': { name: 'Các khoản giảm trừ doanh thu', type: 'revenue', level: 1 },
    
    // CHI PHÍ
    '621': { name: 'Chi phí nguyên liệu, vật liệu trực tiếp', type: 'expense', level: 1 },
    '622': { name: 'Chi phí nhân công trực tiếp', type: 'expense', level: 1 },
    '623': { name: 'Chi phí sử dụng máy thi công', type: 'expense', level: 1 },
    '6231': { name: 'Chi phí nhân công', type: 'expense', level: 2 },
    '6232': { name: 'Chi phí vật liệu', type: 'expense', level: 2 },
    '6234': { name: 'Chi phí khấu hao máy thi công', type: 'expense', level: 2 },
    '627': { name: 'Chi phí sản xuất chung', type: 'expense', level: 1 },
    '6271': { name: 'Chi phí nhân viên phân xưởng', type: 'expense', level: 2 },
    '6272': { name: 'Chi phí vật liệu', type: 'expense', level: 2 },
    '6274': { name: 'Chi phí khấu hao TSCĐ', type: 'expense', level: 2 },
    '632': { name: 'Giá vốn hàng bán', type: 'expense', level: 1 },
    '635': { name: 'Chi phí tài chính', type: 'expense', level: 1 },
    '641': { name: 'Chi phí bán hàng', type: 'expense', level: 1 },
    '6411': { name: 'Chi phí nhân viên', type: 'expense', level: 2 },
    '6412': { name: 'Chi phí vật liệu, bao bì', type: 'expense', level: 2 },
    '6414': { name: 'Chi phí khấu hao TSCĐ', type: 'expense', level: 2 },
    '642': { name: 'Chi phí quản lý doanh nghiệp', type: 'expense', level: 1 },
    '6421': { name: 'Chi phí nhân viên quản lý', type: 'expense', level: 2 },
    '6422': { name: 'Chi phí vật liệu quản lý', type: 'expense', level: 2 },
    '6424': { name: 'Chi phí khấu hao TSCĐ', type: 'expense', level: 2 },
    '6426': { name: 'Chi phí dự phòng', type: 'expense', level: 2 },
    
    // THU NHẬP KHÁC
    '711': { name: 'Thu nhập khác', type: 'other_income', level: 1 },
    
    // CHI PHÍ KHÁC
    '811': { name: 'Chi phí khác', type: 'other_expense', level: 1 },
    '821': { name: 'Chi phí thuế thu nhập doanh nghiệp', type: 'other_expense', level: 1 },
    '8211': { name: 'Chi phí thuế TNDN hiện hành', type: 'other_expense', level: 2 },
    '8212': { name: 'Chi phí thuế TNDN hoãn lại', type: 'other_expense', level: 2 },
    
    // XÁC ĐỊNH KẾT QUẢ
    '911': { name: 'Xác định kết quả kinh doanh', type: 'result', level: 1 }
};

// Hàm lấy danh sách tài khoản theo loại
function getAccountsByType(type) {
    return Object.entries(CHART_OF_ACCOUNTS)
        .filter(([code, account]) => account.type === type)
        .map(([code, account]) => ({ code, ...account }));
}

// Hàm lấy tài khoản cấp 1
function getLevel1Accounts() {
    return Object.entries(CHART_OF_ACCOUNTS)
        .filter(([code, account]) => account.level === 1)
        .map(([code, account]) => ({ code, ...account }));
}

// Hàm tìm kiếm tài khoản
function searchAccounts(keyword) {
    keyword = keyword.toLowerCase();
    return Object.entries(CHART_OF_ACCOUNTS)
        .filter(([code, account]) => 
            code.includes(keyword) || 
            account.name.toLowerCase().includes(keyword)
        )
        .map(([code, account]) => ({ code, ...account }));
}

// Hàm lấy tên tài khoản
function getAccountName(code) {
    return CHART_OF_ACCOUNTS[code]?.name || code;
}

// Hàm lấy loại tài khoản
function getAccountType(code) {
    return CHART_OF_ACCOUNTS[code]?.type || 'unknown';
}
