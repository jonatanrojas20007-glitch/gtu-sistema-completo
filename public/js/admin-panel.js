// Panel de Administración GTU
class AdminPanelGTU {
    constructor() {
        this.systemActivity = [];
        this.init();
    }
    
    init() {
        this.cargarDatos();
        this.configurarEventos();
        this.actualizarUI();
        this.iniciarMonitoreo();
        this.actualizarUsuarioInfo();
    }
    
    cargarDatos() {
        // Cargar usuarios
        const usuariosData = localStorage.getItem('gtuUsuarios');
        if (usuariosData) {
            const usuarios = JSON.parse(usuariosData);
            document.getElementById('total-users').textContent = usuarios.length;
        }
        
        // Cargar estudiantes
        const estudiantesData = localStorage.getItem('gtuRegistros');
        if (estudiantesData) {
            const estudiantes = JSON.parse(estudiantesData);
            document.getElementById('total-students').textContent = estudiantes.length;
            
            // Calcular tamaño de datos
            const size = JSON.stringify(estudiantes).length;
            const sizeKB = (size / 1024).toFixed(2);
            document.getElementById('total-size').textContent = `${sizeKB} KB`;
        }
        
        // Cargar actividad del sistema
        this.cargarActividadSistema();
    }
    
    cargarActividadSistema() {
        const actividadData = localStorage.getItem('gtuSystemActivity');
        
        if (actividadData) {
            this.systemActivity = JSON.parse(actividadData);
        } else {
            // Actividad de ejemplo
            this.systemActivity = [
                {
                    id: 1,
                    fecha: new Date().toISOString(),
                    usuario: 'admin',
                    accion: 'Inicio de sesión',
                    modulo: 'Autenticación',
                    ip: '192.168.1.100',
                    estado: 'success'
                },
                {
                    id: 2,
                    fecha: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
                    usuario: 'directora',
                    accion: 'Visualización de estadísticas',
                    modulo: 'Estadísticas',
                    ip: '192.168.1.101',
                    estado: 'success'
                },
                {
                    id: 3,
                    fecha: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
                    usuario: 'asesor',
                    accion: 'Acceso denegado',
                    modulo: 'Configuración',
                    ip: '192.168.1.102',
                    estado: 'error'
                }
            ];
            
            this.guardarActividadSistema();
        }
        
        this.actualizarTablaActividad();
    }
    
    actualizarTablaActividad() {
        const tbody = document.getElementById('activity-table-body');
        const emptyState = document.getElementById('activity-empty');
        
        if (this.systemActivity.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Ordenar por fecha (más reciente primero)
        const actividadOrdenada = [...this.systemActivity].sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        ).slice(0, 10); // Mostrar solo los 10 más recientes
        
        tbody.innerHTML = actividadOrdenada.map(item => {
            const fecha = new Date(item.fecha);
            const statusClass = `status-${item.estado}`;
            const statusText = item.estado === 'success' ? 'Éxito' : 
                              item.estado === 'error' ? 'Error' : 
                              item.estado === 'warning' ? 'Advertencia' : 'Info';
            
            return `
                <tr>
                    <td>${fecha.toLocaleDateString('es-MX')} ${fecha.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}</td>
                    <td><strong>${item.usuario}</strong></td>
                    <td>${item.accion}</td>
                    <td>${item.modulo}</td>
                    <td><code>${item.ip}</code></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
    }
    
    guardarActividadSistema() {
        localStorage.setItem('gtuSystemActivity', JSON.stringify(this.systemActivity));
    }
    
    registrarActividad(usuario, accion, modulo, estado = 'success') {
        const actividad = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            usuario: usuario,
            accion: accion,
            modulo: modulo,
            ip: this.getClientIP(),
            estado: estado
        };
        
        this.systemActivity.unshift(actividad);
        
        // Mantener solo los últimos 100 registros
        if (this.systemActivity.length > 100) {
            this.systemActivity = this.systemActivity.slice(0, 100);
        }
        
        this.guardarActividadSistema();
        this.actualizarTablaActividad();
    }
    
    getClientIP() {
        // En un sistema real, esto vendría del servidor
        // Por ahora, simulamos una IP
        const ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '10.0.0.1'];
        return ips[Math.floor(Math.random() * ips.length)];
    }
    
    configurarEventos() {
        // Botón de logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.registrarActividad('admin', 'Cierre de sesión', 'Autenticación');
            setTimeout(() => {
                const authSystem = window.authSystem;
                if (authSystem) {
                    authSystem.logout();
                } else {
                    window.location.href = 'login.html';
                }
            }, 500);
        });
        
        // Ver logs del sistema
        document.getElementById('view-logs').addEventListener('click', () => {
            this.mostrarLogsSistema();
        });
        
        // Actualizar actividad
        document.getElementById('refresh-activity').addEventListener('click', () => {
            this.cargarActividadSistema();
            this.mostrarNotificacion('Actividad actualizada', 'success');
        });
        
        // Acciones de mantenimiento
        document.getElementById('clear-cache').addEventListener('click', () => {
            this.limpiarCache();
        });
        
        document.getElementById('optimize-db').addEventListener('click', () => {
            this.optimizarBaseDatos();
        });
        
        document.getElementById('reset-system').addEventListener('click', () => {
            this.reiniciarSistema();
        });
        
        document.getElementById('emergency-stop').addEventListener('click', () => {
            this.paradaEmergencia();
        });
        
        // Cargar información de mantenimiento
        this.cargarInfoMantenimiento();
    }
    
    cargarInfoMantenimiento() {
        const lastMaintenance = localStorage.getItem('gtuLastMaintenance');
        const nextMaintenance = localStorage.getItem('gtuNextMaintenance');
        
        if (lastMaintenance) {
            const fecha = new Date(lastMaintenance);
            document.getElementById('last-maintenance').textContent = 
                `${fecha.toLocaleDateString('es-MX')} ${fecha.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}`;
        }
        
        if (nextMaintenance) {
            const fecha = new Date(nextMaintenance);
            document.getElementById('next-maintenance').textContent = 
                `${fecha.toLocaleDateString('es-MX')} ${fecha.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}`;
        }
    }
    
    limpiarCache() {
        if (confirm('¿Estás seguro de limpiar la cache del sistema?')) {
            // Simular limpieza de cache
            localStorage.removeItem('gtuCache');
            
            this.registrarActividad('admin', 'Limpieza de cache', 'Mantenimiento');
            
            // Mostrar notificación
            this.mostrarNotificacion('Cache limpiada exitosamente', 'success');
            
            // Actualizar última fecha de mantenimiento
            localStorage.setItem('gtuLastMaintenance', new Date().toISOString());
            this.cargarInfoMantenimiento();
            
            // Simular progreso
            this.simularProgreso('Limpiando cache...', 2000);
        }
    }
    
    optimizarBaseDatos() {
        if (confirm('¿Optimizar base de datos? Esto puede tomar unos momentos.')) {
            this.registrarActividad('admin', 'Optimización de base de datos', 'Mantenimiento');
            
            // Simular optimización
            this.simularProgreso('Optimizando base de datos...', 3000)
                .then(() => {
                    this.mostrarNotificacion('Base de datos optimizada exitosamente', 'success');
                    
                    // Actualizar última fecha de mantenimiento
                    localStorage.setItem('gtuLastMaintenance', new Date().toISOString());
                    this.cargarInfoMantenimiento();
                });
        }
    }
    
    reiniciarSistema() {
        if (confirm('¿Reiniciar el sistema? Los usuarios activos serán desconectados.')) {
            this.registrarActividad('admin', 'Reinicio del sistema', 'Mantenimiento', 'warning');
            
            this.simularProgreso('Reiniciando servicios del sistema...', 4000)
                .then(() => {
                    this.mostrarNotificacion('Sistema reiniciado exitosamente', 'success');
                    
                    // Actualizar última fecha de mantenimiento
                    localStorage.setItem('gtuLastMaintenance', new Date().toISOString());
                    this.cargarInfoMantenimiento();
                    
                    // Recargar página después de 2 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                });
        }
    }
    
    paradaEmergencia() {
        if (confirm('¡ADVERTENCIA! ¿Ejecutar parada de emergencia? Todo el sistema se detendrá inmediatamente.')) {
            this.registrarActividad('admin', 'Parada de emergencia', 'Mantenimiento', 'error');
            
            this.simularProgreso('Deteniendo todos los servicios...', 2000)
                .then(() => {
                    this.mostrarNotificacion('Sistema detenido por emergencia', 'error');
                    
                    // Mostrar pantalla de emergencia
                    this.mostrarPantallaEmergencia();
                });
        }
    }
    
    simularProgreso(mensaje, duracion) {
        return new Promise((resolve) => {
            // Crear overlay de progreso
            const overlay = document.createElement('div');
            overlay.className = 'progress-overlay';
            overlay.innerHTML = `
                <div class="progress-modal">
                    <div class="progress-icon">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <h3>${mensaje}</h3>
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Animar barra de progreso
            const progressFill = overlay.querySelector('.progress-fill');
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        overlay.remove();
                        resolve();
                    }, 500);
                } else {
                    width += 2;
                    progressFill.style.width = width + '%';
                }
            }, duracion / 50);
        });
    }
    
    mostrarPantallaEmergencia() {
        const emergencyScreen = document.createElement('div');
        emergencyScreen.className = 'emergency-screen';
        emergencyScreen.innerHTML = `
            <div class="emergency-content">
                <div class="emergency-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h1>SISTEMA DETENIDO</h1>
                <p>Parada de emergencia ejecutada</p>
                <p class="emergency-details">Todos los servicios han sido detenidos por razones de seguridad.</p>
                <div class="emergency-actions">
                    <button class="btn-primary" id="restart-system">
                        <i class="fas fa-power-off"></i> Reiniciar Sistema
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(emergencyScreen);
        document.body.style.background = '#2c3e50';
        
        // Agregar evento para reiniciar
        document.getElementById('restart-system').addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    mostrarLogsSistema() {
        // Crear modal para mostrar logs
        const modal = document.createElement('div');
        modal.className = 'logs-modal';
        modal.innerHTML = `
            <div class="logs-content">
                <div class="logs-header">
                    <h3><i class="fas fa-clipboard-list"></i> Logs del Sistema</h3>
                    <button class="close-logs"><i class="fas fa-times"></i></button>
                </div>
                <div class="logs-body">
                    <div class="logs-toolbar">
                        <button class="logs-filter active">Todos</button>
                        <button class="logs-filter">Éxitos</button>
                        <button class="logs-filter">Errores</button>
                        <button class="logs-filter">Advertencias</button>
                        <button class="btn-secondary" id="export-logs">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                    <div class="logs-list">
                        ${this.systemActivity.map(log => `
                            <div class="log-item ${log.estado}">
                                <div class="log-time">${new Date(log.fecha).toLocaleString('es-MX')}</div>
                                <div class="log-user">${log.usuario}</div>
                                <div class="log-action">${log.accion}</div>
                                <div class="log-module">${log.modulo}</div>
                                <div class="log-ip">${log.ip}</div>
                                <div class="log-status">${log.estado}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Estilos para el modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        `;
        
        const logsContent = modal.querySelector('.logs-content');
        logsContent.style.cssText = `
            background: white;
            width: 90%;
            max-width: 1200px;
            height: 80%;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
            animation: slideUp 0.3s ease;
        `;
        
        // Configurar eventos del modal
        modal.querySelector('.close-logs').addEventListener('click', () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        // Exportar logs
        modal.querySelector('#export-logs').addEventListener('click', () => {
            this.exportarLogs();
        });
        
        // Filtrar logs
        modal.querySelectorAll('.logs-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                modal.querySelectorAll('.logs-filter').forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');
                
                const filterType = e.target.textContent.toLowerCase();
                this.filtrarLogs(filterType, modal);
            });
        });
        
        // Agregar animaciones CSS si no existen
        if (!document.querySelector('#modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    filtrarLogs(filterType, modal) {
        const logItems = modal.querySelectorAll('.log-item');
        
        logItems.forEach(item => {
            if (filterType === 'todos') {
                item.style.display = 'flex';
            } else if (filterType === 'éxitos') {
                item.style.display = item.classList.contains('success') ? 'flex' : 'none';
            } else if (filterType === 'errores') {
                item.style.display = item.classList.contains('error') ? 'flex' : 'none';
            } else if (filterType === 'advertencias') {
                item.style.display = item.classList.contains('warning') ? 'flex' : 'none';
            }
        });
    }
    
    exportarLogs() {
        const exportData = {
            fechaExportacion: new Date().toISOString(),
            totalLogs: this.systemActivity.length,
            logs: this.systemActivity
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gtu-system-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion('Logs exportados exitosamente', 'success');
    }
    
    actualizarUI() {
        this.actualizarUptime();
        this.actualizarUsuarioInfo();
    }
    
    actualizarUptime() {
        const startTime = localStorage.getItem('gtuSystemStartTime');
        if (!startTime) {
            localStorage.setItem('gtuSystemStartTime', new Date().toISOString());
            document.getElementById('system-uptime').textContent = '0d 0h 0m';
            return;
        }
        
        const start = new Date(startTime);
        const now = new Date();
        const diff = now - start;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('system-uptime').textContent = `${days}d ${hours}h ${minutes}m`;
    }
    
    actualizarUsuarioInfo() {
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser) {
            document.getElementById('current-user').textContent = currentUser.name;
            document.getElementById('current-role').textContent = currentUser.role;
            
            // Actualizar avatar con iniciales
            const avatar = document.getElementById('user-avatar');
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            avatar.textContent = initials.substring(0, 2);
        }
    }
    
    iniciarMonitoreo() {
        // Monitorear en tiempo real (cada 30 segundos)
        setInterval(() => {
            this.actualizarUptime();
            this.verificarSaludSistema();
        }, 30000);
        
        // Monitoreo inicial
        this.verificarSaludSistema();
    }
    
    verificarSaludSistema() {
        // Aquí se verificaría la salud real del sistema
        // Por ahora, simulamos
        const storage = Math.floor(Math.random() * 100);
        const performance = 70 + Math.floor(Math.random() * 30);
        const security = 80 + Math.floor(Math.random() * 20);
        
        // Actualizar barras de progreso
        this.actualizarBarraProgreso('.storage .progress-fill', storage);
        this.actualizarBarraProgreso('.performance .progress-fill', performance);
        this.actualizarBarraProgreso('.security .progress-fill', security);
        
        // Actualizar textos
        document.querySelector('.storage .progress-text').textContent = `${storage}% utilizado`;
        document.querySelector('.performance .progress-text').textContent = `${performance}% óptimo`;
        document.querySelector('.security .progress-text').textContent = `${security}% seguro`;
        
        // Actualizar valores detallados
        document.querySelectorAll('.storage .detail-item .value')[1].textContent = `${storage}%`;
        document.querySelectorAll('.storage .detail-item .value')[0].textContent = `${100 - storage}%`;
        
        // Simular valores de rendimiento
        const responseTime = 50 + Math.floor(Math.random() * 100);
        const cpuUsage = 10 + Math.floor(Math.random() * 20);
        
        document.querySelectorAll('.performance .detail-item .value')[0].textContent = `${responseTime}ms`;
        document.querySelectorAll('.performance .detail-item .value')[1].textContent = `${cpuUsage}%`;
        
        // Simular valores de seguridad
        const vulnerabilities = Math.floor(Math.random() * 3);
        document.querySelectorAll('.security .detail-item .value')[1].textContent = vulnerabilities;
    }
    
    actualizarBarraProgreso(selector, porcentaje) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.width = `${porcentaje}%`;
        }
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `admin-notification ${tipo}`;
        notificacion.innerHTML = `
            <i class="fas fa-${this.getNotificacionIcono(tipo)}"></i>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }
    
    getNotificacionIcono(tipo) {
        const iconos = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return iconos[tipo] || 'info-circle';
    }
}

// Inicializar panel de administración
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay usuario autenticado
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar permisos de administración
    if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') {
        alert('No tienes permisos para acceder al panel de administración.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Registrar acceso
    const adminPanel = new AdminPanelGTU();
    adminPanel.registrarActividad(currentUser.name, 'Acceso al panel de administración', 'Administración');
    
    // Guardar referencia global
    window.adminPanel = adminPanel;
});