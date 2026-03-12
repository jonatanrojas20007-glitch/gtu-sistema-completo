// Sistema de Autenticación Multi-Rol GTU
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = {
            superadmin: [
                { username: 'admin', password: 'admin123', name: 'Super Admin', role: 'superadmin' },
                { username: 'developer', password: 'dev123', name: 'Desarrollador', role: 'superadmin' }
            ],
            admin: [
                { username: 'directora', password: 'escuela123', name: 'Directora García', role: 'admin' },
                { username: 'coordinador', password: 'coord123', name: 'Coordinador López', role: 'admin' }
            ],
            asesor: [
                { username: 'asesor', password: 'ver123', name: 'Asesor Pérez', role: 'asesor' },
                { username: 'consultor', password: 'view123', name: 'Consultor Martínez', role: 'asesor' }
            ]
        };
        
        // PERMISOS ACTUALIZADOS CON ANÁLISIS
        this.permissions = {
            superadmin: ['dashboard', 'registros', 'estadisticas', 'mapa', 'analisis', 'admin', 'reportes', 'config', 'backup', 'delete'],
            admin: ['dashboard', 'registros', 'estadisticas', 'mapa', 'analisis', 'reportes', 'export'],
            asesor: ['dashboard', 'estadisticas', 'mapa', 'view']
        };
        
        this.init();
    }
    
    init() {
        this.checkLogin();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            // Show password toggle
            const showPasswordBtn = document.getElementById('show-password-btn');
            if (showPasswordBtn) {
                showPasswordBtn.addEventListener('click', () => {
                    const passwordInput = document.getElementById('password');
                    const type = passwordInput.type === 'password' ? 'text' : 'password';
                    passwordInput.type = type;
                    showPasswordBtn.innerHTML = type === 'password' ? 
                        '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
                });
            }
            
            // Tab switching
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    const role = e.target.dataset.role;
                    const radio = document.querySelector(`input[value="${role}"]`);
                    if (radio) radio.checked = true;
                });
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }
    
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.querySelector('input[name="role"]:checked').value;
        
        // Find user
        const user = this.users[role]?.find(u => 
            u.username === username && u.password === password
        );
        
        if (user) {
            this.login(user);
        } else {
            this.showError('Credenciales incorrectas. Verifique usuario, contraseña y rol.');
        }
    }
    
    login(user) {
        // Save to localStorage
        localStorage.setItem('gtu_user', JSON.stringify(user));
        localStorage.setItem('gtu_logged_in', 'true');
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }
    
    logout() {
        localStorage.removeItem('gtu_user');
        localStorage.removeItem('gtu_logged_in');
        window.location.href = 'login.html';
    }
    
    checkLogin() {
        const isLoggedIn = localStorage.getItem('gtu_logged_in');
        const userData = localStorage.getItem('gtu_user');
        
        if (isLoggedIn && userData) {
            this.currentUser = JSON.parse(userData);
            
            // If on login page, redirect to dashboard
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'dashboard.html';
            }
            
            // Apply permissions on dashboard
            this.applyPermissions();
        } else {
            // If not logged in and not on login page, redirect to login
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    }
    
    applyPermissions() {
        if (!this.currentUser) return;
        
        const role = this.currentUser.role;
        const permissions = this.permissions[role];
        
        // Update UI based on role
        this.updateUIForRole(role);
        
        // Apply permission restrictions
        if (role === 'asesor') {
            this.applyAsesorRestrictions();
        } else if (role === 'admin') {
            this.applyAdminRestrictions();
        }
    }
    
    updateUIForRole(role) {
        // Update welcome message
        const welcomeMsg = document.getElementById('welcome-message');
        const userName = document.getElementById('current-user');
        const userRole = document.getElementById('current-role');
        const userAvatar = document.getElementById('user-avatar');
        const roleBadge = document.getElementById('role-badge');
        
        if (this.currentUser && welcomeMsg) {
            welcomeMsg.textContent = `¡Bienvenido de nuevo, ${this.currentUser.name}!`;
            userName.textContent = this.currentUser.name;
            userRole.textContent = this.capitalizeRole(role);
            userAvatar.textContent = this.currentUser.name.charAt(0);
            
            // Update role badge
            if (roleBadge) {
                roleBadge.innerHTML = `
                    <i class="fas fa-${this.getRoleIcon(role)}"></i>
                    <span>${this.getRoleTitle(role)}</span>
                `;
            }
        }
        
        // Update body class for role-specific styling
        document.body.className = `role-${role}`;
    }
    
    applyAsesorRestrictions() {
        // Show permissions notice
        const notice = document.getElementById('permissions-notice');
        if (notice) notice.style.display = 'flex';
        
        // Hide sections that asesor cannot access
        const adminBtn = document.getElementById('admin-section-btn');
        const analisisBtn = document.getElementById('analisis-section-btn');
        if (adminBtn) adminBtn.style.display = 'none';
        if (analisisBtn) analisisBtn.style.display = 'none';
        
        // Disable admin-only actions
        document.querySelectorAll('.admin-only').forEach(el => {
            el.classList.add('disabled');
            el.title = 'Requiere permisos de administrador';
        });
        
        // Make form fields read-only if they exist
        document.querySelectorAll('input, select, textarea').forEach(el => {
            if (!el.id.includes('search') && !el.id.includes('filter')) {
                el.readOnly = true;
                el.disabled = true;
            }
        });
    }
    
    applyAdminRestrictions() {
        // Hide super admin only features
        const superAdminFeatures = document.querySelectorAll('.superadmin-only');
        superAdminFeatures.forEach(el => {
            el.style.display = 'none';
        });
    }
    
    capitalizeRole(role) {
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
    
    getRoleIcon(role) {
        const icons = {
            superadmin: 'crown',
            admin: 'user-shield',
            asesor: 'chart-line'
        };
        return icons[role] || 'user';
    }
    
    getRoleTitle(role) {
        const titles = {
            superadmin: 'Super Administrador - Acceso Completo',
            admin: 'Administrador - Gestión de Registros',
            asesor: 'Asesor - Solo Visualización'
        };
        return titles[role] || 'Usuario';
    }
    
    showError(message) {
        // Remove existing error
        const existingError = document.querySelector('.login-error');
        if (existingError) existingError.remove();
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin-top: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideDown 0.3s ease;
        `;
        
        // Add before form
        const form = document.getElementById('login-form');
        if (form) {
            form.appendChild(errorDiv);
            
            // Remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.style.animation = 'slideUp 0.3s ease';
                    setTimeout(() => errorDiv.remove(), 300);
                }
            }, 5000);
        }
        
        // Add animations if not exist
        if (!document.querySelector('#error-animations')) {
            const style = document.createElement('style');
            style.id = 'error-animations';
            style.textContent = `
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(-20px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    hasPermission(permission) {
        if (!this.currentUser) return false;
        return this.permissions[this.currentUser.role]?.includes(permission) || false;
    }
    
    // Static method to get current user
    static getCurrentUser() {
        const userData = localStorage.getItem('gtu_user');
        return userData ? JSON.parse(userData) : null;
    }
    
    // Static method to check permission
    static checkPermission(permission) {
        const userData = localStorage.getItem('gtu_user');
        if (!userData) return false;
        
        const user = JSON.parse(userData);
        const auth = new AuthSystem();
        return auth.permissions[user.role]?.includes(permission) || false;
    }
}

// Initialize auth system when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});