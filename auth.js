// ===== HỆ THỐNG XÁC THỰC =====

// Tài khoản mặc định
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123',
    fullName: 'Quản Trị Viên',
    email: 'admin@example.com',
    role: 'admin'
};

// Lưu tài khoản vào localStorage
function initializeAuth() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.length === 0) {
        users.push(DEFAULT_ADMIN);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Kiểm tra đăng nhập
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showLoginScreen();
        return false;
    }
    return true;
}

// Hiển thị màn hình đăng nhập
function showLoginScreen() {
    const loginHTML = `
        <div class="login-container">
            <div class="login-box">
                <div class="login-header">
                    <i class="fas fa-chart-line"></i>
                    <h1>Hệ Thống Kế Toán</h1>
                    <p>Đăng nhập để tiếp tục</p>
                </div>
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Tên đăng nhập</label>
                        <input type="text" id="loginUsername" required autofocus>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Mật khẩu</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="rememberMe">
                            <span>Ghi nhớ đăng nhập</span>
                        </label>
                    </div>
                    <button type="submit" class="btn-login">
                        <i class="fas fa-sign-in-alt"></i> Đăng Nhập
                    </button>
                </form>
                <div class="login-footer">
                    <p>Tài khoản mặc định:</p>
                    <p><strong>Username:</strong> admin | <strong>Password:</strong> admin123</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.innerHTML = loginHTML;
}

// Xử lý đăng nhập
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const currentUser = {
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Reload trang để hiển thị app
        location.reload();
    } else {
        alert('❌ Tên đăng nhập hoặc mật khẩu không đúng!');
    }
}

// Đăng xuất
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        location.reload();
    }
}

// Hiển thị thông tin user
function displayUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const userInfoHTML = `
        <div class="user-info">
            <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-details">
                <div class="user-name">${currentUser.fullName}</div>
                <div class="user-role">${currentUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</div>
            </div>
            <button class="btn-logout" onclick="logout()" title="Đăng xuất">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>
    `;
    
    const logo = document.querySelector('.logo');
    if (logo && !document.querySelector('.user-info')) {
        logo.insertAdjacentHTML('afterend', userInfoHTML);
    }
}

// Đổi mật khẩu
function changePassword() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const oldPassword = prompt('Nhập mật khẩu hiện tại:');
    if (!oldPassword) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === currentUser.username);
    
    if (!user || user.password !== oldPassword) {
        alert('❌ Mật khẩu hiện tại không đúng!');
        return;
    }
    
    const newPassword = prompt('Nhập mật khẩu mới:');
    if (!newPassword || newPassword.length < 6) {
        alert('❌ Mật khẩu mới phải có ít nhất 6 ký tự!');
        return;
    }
    
    const confirmPassword = prompt('Xác nhận mật khẩu mới:');
    if (newPassword !== confirmPassword) {
        alert('❌ Mật khẩu xác nhận không khớp!');
        return;
    }
    
    user.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert('✅ Đổi mật khẩu thành công!');
}

// Quản lý người dùng (chỉ admin)
function showUserManagement() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('❌ Bạn không có quyền truy cập!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    let html = '<h2>Quản Lý Người Dùng</h2>';
    html += '<button onclick="addNewUser()" class="btn-primary" style="margin-bottom: 20px;"><i class="fas fa-user-plus"></i> Thêm Người Dùng</button>';
    html += '<table><thead><tr><th>Username</th><th>Họ Tên</th><th>Email</th><th>Vai Trò</th><th>Thao Tác</th></tr></thead><tbody>';
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.username}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td>
                <td>
                    ${user.username !== 'admin' ? `<button class="btn-delete" onclick="deleteUser('${user.username}')">Xóa</button>` : '-'}
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            ${html}
            <button onclick="this.closest('.modal-overlay').remove()" class="btn-primary" style="margin-top: 20px;">Đóng</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Thêm người dùng mới
function addNewUser() {
    const username = prompt('Nhập tên đăng nhập:');
    if (!username) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
        alert('❌ Tên đăng nhập đã tồn tại!');
        return;
    }
    
    const fullName = prompt('Nhập họ tên:');
    if (!fullName) return;
    
    const email = prompt('Nhập email:');
    const password = prompt('Nhập mật khẩu:');
    if (!password || password.length < 6) {
        alert('❌ Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }
    
    const role = confirm('Đặt làm quản trị viên?') ? 'admin' : 'user';
    
    users.push({
        username,
        password,
        fullName,
        email: email || '',
        role
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    alert('✅ Thêm người dùng thành công!');
    
    // Refresh modal
    document.querySelector('.modal-overlay')?.remove();
    showUserManagement();
}

// Xóa người dùng
function deleteUser(username) {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${username}"?`)) return;
    
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.username !== username);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('✅ Đã xóa người dùng!');
    
    // Refresh modal
    document.querySelector('.modal-overlay')?.remove();
    showUserManagement();
}

// Khởi tạo khi load trang
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    
    if (checkAuth()) {
        displayUserInfo();
    }
});
