// Sistema de Configuración GTU
class ConfiguracionGTU {
    constructor() {
        this.configuracion = {};
        this.cambiosSinGuardar = false;
        this.usuarios = [];
        this.backups = [];
        
        this.init();
    }
    
    init() {
        this.cargarConfiguracion();
        this.cargarUsuarios();
        this.cargarBackups();
        this.configurarEventos();
        this.actualizarUI();
        this.verificarPermisos();
        
        // Verificar cambios cada 2 segundos
        setInterval(() => this.verificarCambios(), 2000);
    }
    
    cargarConfiguracion() {
        // Cargar configuración desde localStorage
        const configGuardada = localStorage.getItem('gtuConfiguracion');
        
        if (configGuardada) {
            this.configuracion = JSON.parse(configGuardada);
        } else {
            // Configuración por defecto
            this.configuracion = {
                general: {
                    systemName: 'GTU - Gestión de Talentos Universitarios',
                    systemVersion: '2.0.1',
                    themeColor: '#FF6B35',
                    themeMode: 'light',
                    fontSize: 'medium',
                    language: 'es',
                    timezone: 'America/Mexico_City',
                    dateFormat: 'dd/mm/yyyy'
                },
                dashboard: {
                    layout: '3-columns',
                    refreshInterval: 30,
                    widgets: {
                        stats: true,
                        activity: true,
                        quickActions: true,
                        systemStatus: true,
                        notifications: false,
                        calendar: false
                    },
                    kpiCount: 4,
                    activityItems: 5
                },
                formulario: {
                    fields: {
                        nombre: true,
                        escuela: true,
                        carrera: true,
                        genero: true,
                        municipio: true,
                        estado: true,
                        email: false,
                        telefono: false
                    },
                    validation: 'strict',
                    captcha: false,
                    maxSubmissions: 10,
                    careers: [
                        'Ingeniería en Sistemas',
                        'Medicina',
                        'Derecho',
                        'Administración',
                        'Arquitectura',
                        'Psicología',
                        'Contabilidad',
                        'Ingeniería Civil',
                        'Nutrición',
                        'Diseño Gráfico'
                    ]
                },
                estadisticas: {
                    chartType: 'pie',
                    chartAnimation: true,
                    chartColors: 'default',
                    defaultPeriod: 'week',
                    minDataPoints: 3,
                    exportFormat: 'json',
                    autoExport: false
                },
                mapa: {
                    centerLat: 20.5888,
                    centerLng: -100.3899,
                    zoom: 9,
                    heatRadius: 25,
                    heatBlur: 15,
                    heatMax: 0.8,
                    layers: {
                        heatmap: true,
                        markers: true,
                        boundaries: false,
                        satellite: false
                    }
                },
                seguridad: {
                    sessionTimeout: 30,
                    maxLoginAttempts: 3,
                    passwordPolicy: 'medium',
                    ipRestriction: false,
                    twoFactor: false,
                    auditLog: true
                },
                backup: {
                    autoBackupFrequency: 'daily',
                    autoBackupTime: '02:00',
                    maxBackupFiles: 30
                }
            };
            
            this.guardarConfiguracion();
        }
        
        // Aplicar configuración cargada al UI
        this.aplicarConfiguracionUI();
    }
    
    aplicarConfiguracionUI() {
        // Aplicar configuración general
        document.getElementById('system-name').value = this.configuracion.general.systemName;
        document.getElementById('system-version').value = this.configuracion.general.systemVersion;
        document.getElementById('theme-color').value = this.configuracion.general.themeColor;
        document.getElementById('theme-mode').value = this.configuracion.general.themeMode;
        document.getElementById('font-size').value = this.configuracion.general.fontSize;
        document.getElementById('system-language').value = this.configuracion.general.language;
        document.getElementById('timezone').value = this.configuracion.general.timezone;
        document.getElementById('date-format').value = this.configuracion.general.dateFormat;
        
        // Aplicar configuración del dashboard
        document.getElementById('dashboard-layout').value = this.configuracion.dashboard.layout;
        document.getElementById('refresh-interval').value = this.configuracion.dashboard.refreshInterval;
        document.getElementById('widget-stats').checked = this.configuracion.dashboard.widgets.stats;
        document.getElementById('widget-activity').checked = this.configuracion.dashboard.widgets.activity;
        document.getElementById('widget-quick-actions').checked = this.configuracion.dashboard.widgets.quickActions;
        document.getElementById('widget-system-status').checked = this.configuracion.dashboard.widgets.systemStatus;
        document.getElementById('widget-notifications').checked = this.configuracion.dashboard.widgets.notifications;
        document.getElementById('widget-calendar').checked = this.configuracion.dashboard.widgets.calendar;
        document.getElementById('kpi-count').value = this.configuracion.dashboard.kpiCount;
        document.getElementById('activity-items').value = this.configuracion.dashboard.activityItems;
        document.getElementById('kpi-count-value').textContent = this.configuracion.dashboard.kpiCount;
        document.getElementById('activity-items-value').textContent = this.configuracion.dashboard.activityItems;
        
        // Aplicar configuración del formulario
        document.getElementById('field-nombre').checked = this.configuracion.formulario.fields.nombre;
        document.getElementById('field-escuela').checked = this.configuracion.formulario.fields.escuela;
        document.getElementById('field-carrera').checked = this.configuracion.formulario.fields.carrera;
        document.getElementById('field-genero').checked = this.configuracion.formulario.fields.genero;
        document.getElementById('field-municipio').checked = this.configuracion.formulario.fields.municipio;
        document.getElementById('field-estado').checked = this.configuracion.formulario.fields.estado;
        document.getElementById('field-email').checked = this.configuracion.formulario.fields.email;
        document.getElementById('field-telefono').checked = this.configuracion.formulario.fields.telefono;
        document.getElementById('form-validation').value = this.configuracion.formulario.validation;
        document.getElementById('captcha-enabled').value = this.configuracion.formulario.captcha;
        document.getElementById('max-submissions').value = this.configuracion.formulario.maxSubmissions;
        document.getElementById('career-list').value = this.configuracion.formulario.careers.join('\n');
        
        // Aplicar configuración de estadísticas
        document.getElementById('chart-type').value = this.configuracion.estadisticas.chartType;
        document.getElementById('chart-animation').value = this.configuracion.estadisticas.chartAnimation;
        document.getElementById('chart-colors').value = this.configuracion.estadisticas.chartColors;
        document.getElementById('default-period').value = this.configuracion.estadisticas.defaultPeriod;
        document.getElementById('min-data-points').value = this.configuracion.estadisticas.minDataPoints;
        document.getElementById('export-format').value = this.configuracion.estadisticas.exportFormat;
        document.getElementById('auto-export').value = this.configuracion.estadisticas.autoExport;
        
        // Aplicar configuración del mapa
        document.getElementById('map-center-lat').value = this.configuracion.mapa.centerLat;
        document.getElementById('map-center-lng').value = this.configuracion.mapa.centerLng;
        document.getElementById('map-zoom').value = this.configuracion.mapa.zoom;
        document.getElementById('heat-radius').value = this.configuracion.mapa.heatRadius;
        document.getElementById('heat-blur').value = this.configuracion.mapa.heatBlur;
        document.getElementById('heat-max').value = this.configuracion.mapa.heatMax;
        document.getElementById('layer-heatmap').checked = this.configuracion.mapa.layers.heatmap;
        document.getElementById('layer-markers').checked = this.configuracion.mapa.layers.markers;
        document.getElementById('layer-boundaries').checked = this.configuracion.mapa.layers.boundaries;
        document.getElementById('layer-satellite').checked = this.configuracion.mapa.layers.satellite;
        document.getElementById('map-zoom-value').textContent = this.configuracion.mapa.zoom;
        document.getElementById('heat-radius-value').textContent = this.configuracion.mapa.heatRadius;
        document.getElementById('heat-blur-value').textContent = this.configuracion.mapa.heatBlur;
        document.getElementById('heat-max-value').textContent = this.configuracion.mapa.heatMax;
        
        // Aplicar configuración de seguridad
        document.getElementById('session-timeout').value = this.configuracion.seguridad.sessionTimeout;
        document.getElementById('max-login-attempts').value = this.configuracion.seguridad.maxLoginAttempts;
        document.getElementById('password-policy').value = this.configuracion.seguridad.passwordPolicy;
        document.getElementById('access-ip-restriction').checked = this.configuracion.seguridad.ipRestriction;
        document.getElementById('access-two-factor').checked = this.configuracion.seguridad.twoFactor;
        document.getElementById('access-audit-log').checked = this.configuracion.seguridad.auditLog;
        
        // Aplicar configuración de backup
        document.getElementById('auto-backup-frequency').value = this.configuracion.backup.autoBackupFrequency;
        document.getElementById('auto-backup-time').value = this.configuracion.backup.autoBackupTime;
        document.getElementById('max-backup-files').value = this.configuracion.backup.maxBackupFiles;
    }
    
    cargarConfiguracionDesdeUI() {
        // Cargar configuración general
        this.configuracion.general.systemName = document.getElementById('system-name').value;
        this.configuracion.general.themeColor = document.getElementById('theme-color').value;
        this.configuracion.general.themeMode = document.getElementById('theme-mode').value;
        this.configuracion.general.fontSize = document.getElementById('font-size').value;
        this.configuracion.general.language = document.getElementById('system-language').value;
        this.configuracion.general.timezone = document.getElementById('timezone').value;
        this.configuracion.general.dateFormat = document.getElementById('date-format').value;
        
        // Cargar configuración del dashboard
        this.configuracion.dashboard.layout = document.getElementById('dashboard-layout').value;
        this.configuracion.dashboard.refreshInterval = parseInt(document.getElementById('refresh-interval').value);
        this.configuracion.dashboard.widgets.stats = document.getElementById('widget-stats').checked;
        this.configuracion.dashboard.widgets.activity = document.getElementById('widget-activity').checked;
        this.configuracion.dashboard.widgets.quickActions = document.getElementById('widget-quick-actions').checked;
        this.configuracion.dashboard.widgets.systemStatus = document.getElementById('widget-system-status').checked;
        this.configuracion.dashboard.widgets.notifications = document.getElementById('widget-notifications').checked;
        this.configuracion.dashboard.widgets.calendar = document.getElementById('widget-calendar').checked;
        this.configuracion.dashboard.kpiCount = parseInt(document.getElementById('kpi-count').value);
        this.configuracion.dashboard.activityItems = parseInt(document.getElementById('activity-items').value);
        
        // Cargar configuración del formulario
        this.configuracion.formulario.fields.nombre = document.getElementById('field-nombre').checked;
        this.configuracion.formulario.fields.escuela = document.getElementById('field-escuela').checked;
        this.configuracion.formulario.fields.carrera = document.getElementById('field-carrera').checked;
        this.configuracion.formulario.fields.genero = document.getElementById('field-genero').checked;
        this.configuracion.formulario.fields.municipio = document.getElementById('field-municipio').checked;
        this.configuracion.formulario.fields.estado = document.getElementById('field-estado').checked;
        this.configuracion.formulario.fields.email = document.getElementById('field-email').checked;
        this.configuracion.formulario.fields.telefono = document.getElementById('field-telefono').checked;
        this.configuracion.formulario.validation = document.getElementById('form-validation').value;
        this.configuracion.formulario.captcha = document.getElementById('captcha-enabled').value === 'true';
        this.configuracion.formulario.maxSubmissions = parseInt(document.getElementById('max-submissions').value);
        
        // Procesar lista de carreras
        const careersText = document.getElementById('career-list').value;
        this.configuracion.formulario.careers = careersText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        // Cargar configuración de estadísticas
        this.configuracion.estadisticas.chartType = document.getElementById('chart-type').value;
        this.configuracion.estadisticas.chartAnimation = document.getElementById('chart-animation').value === 'true';
        this.configuracion.estadisticas.chartColors = document.getElementById('chart-colors').value;
        this.configuracion.estadisticas.defaultPeriod = document.getElementById('default-period').value;
        this.configuracion.estadisticas.minDataPoints = parseInt(document.getElementById('min-data-points').value);
        this.configuracion.estadisticas.exportFormat = document.getElementById('export-format').value;
        this.configuracion.estadisticas.autoExport = document.getElementById('auto-export').value;
        
        // Cargar configuración del mapa
        this.configuracion.mapa.centerLat = parseFloat(document.getElementById('map-center-lat').value);
        this.configuracion.mapa.centerLng = parseFloat(document.getElementById('map-center-lng').value);
        this.configuracion.mapa.zoom = parseInt(document.getElementById('map-zoom').value);
        this.configuracion.mapa.heatRadius = parseInt(document.getElementById('heat-radius').value);
        this.configuracion.mapa.heatBlur = parseInt(document.getElementById('heat-blur').value);
        this.configuracion.mapa.heatMax = parseFloat(document.getElementById('heat-max').value);
        this.configuracion.mapa.layers.heatmap = document.getElementById('layer-heatmap').checked;
        this.configuracion.mapa.layers.markers = document.getElementById('layer-markers').checked;
        this.configuracion.mapa.layers.boundaries = document.getElementById('layer-boundaries').checked;
        this.configuracion.mapa.layers.satellite = document.getElementById('layer-satellite').checked;
        
        // Cargar configuración de seguridad
        this.configuracion.seguridad.sessionTimeout = parseInt(document.getElementById('session-timeout').value);
        this.configuracion.seguridad.maxLoginAttempts = parseInt(document.getElementById('max-login-attempts').value);
        this.configuracion.seguridad.passwordPolicy = document.getElementById('password-policy').value;
        this.configuracion.seguridad.ipRestriction = document.getElementById('access-ip-restriction').checked;
        this.configuracion.seguridad.twoFactor = document.getElementById('access-two-factor').checked;
        this.configuracion.seguridad.auditLog = document.getElementById('access-audit-log').checked;
        
        // Cargar configuración de backup
        this.configuracion.backup.autoBackupFrequency = document.getElementById('auto-backup-frequency').value;
        this.configuracion.backup.autoBackupTime = document.getElementById('auto-backup-time').value;
        this.configuracion.backup.maxBackupFiles = parseInt(document.getElementById('max-backup-files').value);
    }
    
    guardarConfiguracion() {
        localStorage.setItem('gtuConfiguracion', JSON.stringify(this.configuracion));
        this.cambiosSinGuardar = false;
        this.actualizarEstadoGuardado();
        this.aplicarConfiguracionGlobal();
        this.mostrarNotificacion('Configuración guardada exitosamente', 'success');
    }
    
    aplicarConfiguracionGlobal() {
        // Aplicar configuración a todo el sistema
        this.aplicarTema();
        this.aplicarIdioma();
        this.actualizarDashboard();
        this.actualizarFormulario();
        this.actualizarEstadisticas();
        this.actualizarMapa();
        
        // Guardar timestamp de última actualización
        localStorage.setItem('gtuConfigLastUpdate', new Date().toISOString());
    }
    
    aplicarTema() {
        // Aplicar color del tema
        const color = this.configuracion.general.themeColor;
        document.documentElement.style.setProperty('--primary-orange', color);
        
        // Aplicar modo de tema
        const themeMode = this.configuracion.general.themeMode;
        if (themeMode === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (themeMode === 'light') {
            document.body.classList.remove('dark-mode');
        } else {
            // Auto: detectar preferencia del sistema
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
        
        // Aplicar tamaño de fuente
        const fontSize = this.configuracion.general.fontSize;
        document.body.style.fontSize = fontSize === 'small' ? '14px' : 
                                      fontSize === 'large' ? '18px' : '16px';
    }
    
    aplicarIdioma() {
        const language = this.configuracion.general.language;
        // Aquí se podrían cargar traducciones
        console.log(`Idioma configurado: ${language}`);
    }
    
    actualizarDashboard() {
        // Guardar configuración del dashboard para que otras páginas la lean
        localStorage.setItem('gtuDashboardConfig', JSON.stringify(this.configuracion.dashboard));
    }
    
    actualizarFormulario() {
        // Guardar configuración del formulario
        localStorage.setItem('gtuFormularioConfig', JSON.stringify(this.configuracion.formulario));
        
        // Actualizar lista de carreras en el formulario
        const careers = this.configuracion.formulario.careers;
        localStorage.setItem('gtuCareersList', JSON.stringify(careers));
    }
    
    actualizarEstadisticas() {
        // Guardar configuración de estadísticas
        localStorage.setItem('gtuEstadisticasConfig', JSON.stringify(this.configuracion.estadisticas));
    }
    
    actualizarMapa() {
        // Guardar configuración del mapa
        localStorage.setItem('gtuMapaConfig', JSON.stringify(this.configuracion.mapa));
    }
    
    cargarUsuarios() {
        // Cargar usuarios del sistema
        const usuariosGuardados = localStorage.getItem('gtuUsuarios');
        
        if (usuariosGuardados) {
            this.usuarios = JSON.parse(usuariosGuardados);
        } else {
            // Usuarios por defecto
            this.usuarios = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@gtu.edu.mx',
                    name: 'Administrador Principal',
                    role: 'superadmin',
                    lastLogin: new Date().toISOString(),
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'directora',
                    email: 'directora@escuela.edu.mx',
                    name: 'Directora García',
                    role: 'admin',
                    lastLogin: new Date(Date.now() - 86400000).toISOString(), // Ayer
                    status: 'active',
                    createdAt: new Date(Date.now() - 2592000000).toISOString() // Hace 30 días
                },
                {
                    id: 3,
                    username: 'asesor',
                    email: 'asesor@gtu.edu.mx',
                    name: 'Asesor Pérez',
                    role: 'asesor',
                    lastLogin: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
                    status: 'active',
                    createdAt: new Date(Date.now() - 604800000).toISOString() // Hace 7 días
                }
            ];
            
            this.guardarUsuarios();
        }
        
        this.actualizarListaUsuarios();
    }
    
    actualizarListaUsuarios() {
        const tbody = document.getElementById('users-list');
        
        tbody.innerHTML = this.usuarios.map(usuario => {
            const lastLogin = new Date(usuario.lastLogin);
            const statusClass = usuario.status === 'active' ? 'status-active' : 'status-inactive';
            const statusText = usuario.status === 'active' ? 'Activo' : 'Inactivo';
            
            return `
                <tr>
                    <td><strong>${usuario.username}</strong></td>
                    <td>${usuario.name}</td>
                    <td><span class="role-badge">${this.getRoleName(usuario.role)}</span></td>
                    <td>${lastLogin.toLocaleDateString('es-MX')} ${lastLogin.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-icon" data-action="edit" data-user="${usuario.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" data-action="delete" data-user="${usuario.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-icon" data-action="reset" data-user="${usuario.id}" title="Resetear Contraseña">
                            <i class="fas fa-key"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    getRoleName(role) {
        const roles = {
            superadmin: 'Super Admin',
            admin: 'Administrador',
            asesor: 'Asesor'
        };
        return roles[role] || role;
    }
    
    cargarBackups() {
        // Cargar historial de backups
        const backupsGuardados = localStorage.getItem('gtuBackups');
        
        if (backupsGuardados) {
            this.backups = JSON.parse(backupsGuardados);
        } else {
            this.backups = [];
        }
        
        this.actualizarListaBackups();
        this.actualizarEstadisticasBackup();
    }
    
    actualizarListaBackups() {
        const tbody = document.getElementById('backups-list');
        
        if (this.backups.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">
                        <i class="fas fa-database"></i>
                        <span>No hay backups realizados aún</span>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.backups.slice(0, 10).map(backup => {
            const fecha = new Date(backup.fecha);
            const sizeMB = (backup.tamaño / 1024 / 1024).toFixed(2);
            const statusClass = backup.estado === 'completado' ? 'status-success' : 'status-error';
            
            return `
                <tr>
                    <td>${fecha.toLocaleDateString('es-MX')} ${fecha.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}</td>
                    <td>${sizeMB} MB</td>
                    <td>${backup.tipo}</td>
                    <td>${backup.usuario}</td>
                    <td><span class="status-badge ${statusClass}">${backup.estado}</span></td>
                    <td>
                        <button class="btn-icon" data-action="download" data-backup="${backup.id}" title="Descargar">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-icon" data-action="restore" data-backup="${backup.id}" title="Restaurar">
                            <i class="fas fa-undo"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    actualizarEstadisticasBackup() {
        document.getElementById('total-backups').textContent = this.backups.length;
        
        const totalSize = this.backups.reduce((sum, backup) => sum + backup.tamaño, 0);
        const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);
        document.getElementById('total-size').textContent = `${totalSizeMB} MB`;
        
        if (this.backups.length > 0) {
            const lastBackup = new Date(this.backups[0].fecha);
            document.getElementById('last-backup').textContent = 
                `${lastBackup.toLocaleDateString('es-MX')} ${lastBackup.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'})}`;
        } else {
            document.getElementById('last-backup').textContent = 'Nunca';
        }
    }
    
    configurarEventos() {
        // Pestañas
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.closest('.tab-btn').dataset.tab;
                this.cambiarPestaña(tabId);
            });
        });
        
        // Sliders
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueId = e.target.id + '-value';
                const valueElement = document.getElementById(valueId);
                if (valueElement) {
                    valueElement.textContent = e.target.value;
                }
                this.marcarComoCambiado();
            });
        });
        
        // Inputs y selects
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => this.marcarComoCambiado());
        });
        
        // Guardar configuración
        document.getElementById('save-config').addEventListener('click', () => {
            this.guardarConfiguracionParcial();
        });
        
        document.getElementById('save-all-config').addEventListener('click', () => {
            this.guardarConfiguracionCompleta();
        });
        
        // Restablecer configuración
        document.getElementById('reset-config').addEventListener('click', () => {
            this.restablecerConfiguracion();
        });
        
        // Detectar ubicación
        document.getElementById('detect-location').addEventListener('click', () => {
            this.detectarUbicacion();
        });
        
        // Agregar usuario
        document.getElementById('add-user').addEventListener('click', () => {
            this.agregarUsuario();
        });
        
        // Backup
        document.getElementById('backup-now').addEventListener('click', () => {
            this.crearBackup();
        });
        
        document.getElementById('restore-now').addEventListener('click', () => {
            document.getElementById('restore-file').click();
        });
        
        document.getElementById('restore-file').addEventListener('change', (e) => {
            this.restaurarBackup(e.target.files[0]);
        });
        
        // Limpiar sesiones
        document.getElementById('clear-sessions').addEventListener('click', () => {
            this.limpiarHistorialSesiones();
        });
        
        // Delegación de eventos para botones dinámicos
        document.getElementById('users-list')?.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-icon');
            if (button) {
                const action = button.dataset.action;
                const userId = button.dataset.user;
                this.manejarAccionUsuario(action, userId);
            }
        });
        
        document.getElementById('backups-list')?.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-icon');
            if (button) {
                const action = button.dataset.action;
                const backupId = button.dataset.backup;
                this.manejarAccionBackup(action, backupId);
            }
        });
        
        // Actualizar usuario actual
        this.actualizarUsuarioInfo();
    }
    
    cambiarPestaña(tabId) {
        // Actualizar pestañas activas
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        
        // Mostrar contenido de la pestaña
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }
    
    marcarComoCambiado() {
        this.cambiosSinGuardar = true;
        this.actualizarEstadoGuardado();
    }
    
    actualizarEstadoGuardado() {
        const icon = document.getElementById('config-status-icon');
        const text = document.getElementById('config-status-text');
        
        if (this.cambiosSinGuardar) {
            icon.style.color = '#f39c12';
            icon.className = 'fas fa-exclamation-circle';
            text.textContent = 'Cambios sin guardar';
        } else {
            icon.style.color = '#27ae60';
            icon.className = 'fas fa-check-circle';
            text.textContent = 'Todo guardado';
        }
    }
    
    verificarCambios() {
        // Comparar configuración actual con la guardada
        const configGuardada = localStorage.getItem('gtuConfiguracion');
        if (!configGuardada) return;
        
        const configActual = JSON.stringify(this.configuracion);
        this.cambiosSinGuardar = configActual !== configGuardada;
        this.actualizarEstadoGuardado();
    }
    
    guardarConfiguracionParcial() {
        // Guardar solo la configuración de la pestaña actual
        const tabActiva = document.querySelector('.tab-btn.active').dataset.tab;
        
        switch(tabActiva) {
            case 'general':
                this.cargarConfiguracionDesdeUI();
                this.guardarConfiguracion();
                break;
            case 'dashboard':
                // Similar para otras pestañas
                this.cargarConfiguracionDesdeUI();
                this.guardarConfiguracion();
                break;
            default:
                this.guardarConfiguracionCompleta();
        }
    }
    
    guardarConfiguracionCompleta() {
        this.cargarConfiguracionDesdeUI();
        this.guardarConfiguracion();
    }
    
    restablecerConfiguracion() {
        if (confirm('¿Estás seguro de restablecer toda la configuración a los valores predeterminados? Esto no se puede deshacer.')) {
            localStorage.removeItem('gtuConfiguracion');
            this.cargarConfiguracion();
            this.mostrarNotificacion('Configuración restablecida a valores predeterminados', 'success');
        }
    }
    
    detectarUbicacion() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    document.getElementById('map-center-lat').value = position.coords.latitude.toFixed(4);
                    document.getElementById('map-center-lng').value = position.coords.longitude.toFixed(4);
                    this.marcarComoCambiado();
                    this.mostrarNotificacion('Ubicación detectada correctamente', 'success');
                },
                (error) => {
                    this.mostrarNotificacion('No se pudo detectar la ubicación', 'error');
                }
            );
        } else {
            this.mostrarNotificacion('Geolocalización no soportada por tu navegador', 'warning');
        }
    }
    
    agregarUsuario() {
        const username = document.getElementById('new-username').value.trim();
        const email = document.getElementById('new-email').value.trim();
        const role = document.getElementById('new-role').value;
        const password = document.getElementById('new-password').value;
        
        if (!username || !email || !password) {
            this.mostrarNotificacion('Por favor completa todos los campos', 'warning');
            return;
        }
        
        if (password.length < 8) {
            this.mostrarNotificacion('La contraseña debe tener al menos 8 caracteres', 'warning');
            return;
        }
        
        // Verificar que el usuario no exista
        if (this.usuarios.some(u => u.username === username)) {
            this.mostrarNotificacion('El nombre de usuario ya existe', 'error');
            return;
        }
        
        // Crear nuevo usuario
        const nuevoUsuario = {
            id: Date.now(),
            username: username,
            email: email,
            name: username, // Por defecto, se podría agregar campo de nombre
            role: role,
            password: password, // En un sistema real, esto estaría encriptado
            lastLogin: null,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        this.usuarios.push(nuevoUsuario);
        this.guardarUsuarios();
        this.actualizarListaUsuarios();
        
        // Limpiar formulario
        document.getElementById('new-username').value = '';
        document.getElementById('new-email').value = '';
        document.getElementById('new-password').value = '';
        
        this.mostrarNotificacion('Usuario agregado exitosamente', 'success');
    }
    
    guardarUsuarios() {
        localStorage.setItem('gtuUsuarios', JSON.stringify(this.usuarios));
    }
    
    manejarAccionUsuario(action, userId) {
        const usuario = this.usuarios.find(u => u.id == userId);
        if (!usuario) return;
        
        switch(action) {
            case 'edit':
                this.editarUsuario(usuario);
                break;
            case 'delete':
                this.eliminarUsuario(usuario);
                break;
            case 'reset':
                this.resetearPassword(usuario);
                break;
        }
    }
    
    editarUsuario(usuario) {
        // Aquí se abriría un modal de edición
        this.mostrarNotificacion(`Editar usuario: ${usuario.username}`, 'info');
    }
    
    eliminarUsuario(usuario) {
        if (usuario.role === 'superadmin') {
            this.mostrarNotificacion('No se puede eliminar un Super Administrador', 'error');
            return;
        }
        
        if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.username}?`)) {
            this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
            this.guardarUsuarios();
            this.actualizarListaUsuarios();
            this.mostrarNotificacion('Usuario eliminado exitosamente', 'success');
        }
    }
    
    resetearPassword(usuario) {
        if (confirm(`¿Resetear contraseña de ${usuario.username}?`)) {
            // En un sistema real, se enviaría un email para resetear
            this.mostrarNotificacion(`Se ha enviado un enlace para resetear la contraseña a ${usuario.email}`, 'success');
        }
    }
    
    crearBackup() {
        const usuarioActual = AuthSystem.getCurrentUser();
        const fecha = new Date();
        
        // Recolectar todos los datos del sistema
        const backupData = {
            fecha: fecha.toISOString(),
            usuario: usuarioActual?.name || 'Sistema',
            tipo: 'manual',
            datos: {
                configuracion: this.configuracion,
                usuarios: this.usuarios,
                registros: JSON.parse(localStorage.getItem('gtuRegistros') || '[]'),
                estadisticas: JSON.parse(localStorage.getItem('gtuEstadisticas') || '{}')
            }
        };
        
        // Crear backup
        const backup = {
            id: Date.now(),
            fecha: backupData.fecha,
            tamaño: JSON.stringify(backupData).length,
            tipo: backupData.tipo,
            usuario: backupData.usuario,
            estado: 'completado'
        };
        
        this.backups.unshift(backup); // Agregar al inicio
        this.guardarBackups();
        
        // Descargar archivo
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gtu-backup-${fecha.toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.actualizarListaBackups();
        this.actualizarEstadisticasBackup();
        this.mostrarNotificacion('Backup creado y descargado exitosamente', 'success');
    }
    
    guardarBackups() {
        localStorage.setItem('gtuBackups', JSON.stringify(this.backups));
    }
    
    restaurarBackup(file) {
        if (!file) return;
        
        if (!confirm('¿Estás seguro de restaurar desde este backup? Se perderán los datos actuales.')) {
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Restaurar configuración
                if (backupData.datos.configuracion) {
                    localStorage.setItem('gtuConfiguracion', JSON.stringify(backupData.datos.configuracion));
                }
                
                // Restaurar usuarios
                if (backupData.datos.usuarios) {
                    localStorage.setItem('gtuUsuarios', JSON.stringify(backupData.datos.usuarios));
                }
                
                // Restaurar registros
                if (backupData.datos.registros) {
                    localStorage.setItem('gtuRegistros', JSON.stringify(backupData.datos.registros));
                }
                
                // Restaurar estadísticas
                if (backupData.datos.estadisticas) {
                    localStorage.setItem('gtuEstadisticas', JSON.stringify(backupData.datos.estadisticas));
                }
                
                this.mostrarNotificacion('Backup restaurado exitosamente. Recarga la página para ver los cambios.', 'success');
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                this.mostrarNotificacion('Error al leer el archivo de backup', 'error');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    }
    
    manejarAccionBackup(action, backupId) {
        const backup = this.backups.find(b => b.id == backupId);
        if (!backup) return;
        
        switch(action) {
            case 'download':
                this.descargarBackup(backup);
                break;
            case 'restore':
                this.restaurarDesdeLista(backup);
                break;
        }
    }
    
    descargarBackup(backup) {
        // En un sistema real, aquí se descargaría el archivo específico
        this.mostrarNotificacion(`Descargando backup del ${new Date(backup.fecha).toLocaleDateString()}`, 'info');
    }
    
    restaurarDesdeLista(backup) {
        if (confirm(`¿Restaurar backup del ${new Date(backup.fecha).toLocaleDateString()}?`)) {
            this.mostrarNotificacion('Función de restauración desde lista en desarrollo', 'info');
        }
    }
    
    limpiarHistorialSesiones() {
        if (confirm('¿Limpiar historial de sesiones antiguas?')) {
            // Aquí se limpiaría el historial real
            this.mostrarNotificacion('Historial de sesiones limpiado', 'success');
        }
    }
    
    verificarPermisos() {
        const currentUser = AuthSystem.getCurrentUser();
        
        if (!currentUser || currentUser.role !== 'superadmin') {
            // Ocultar o deshabilitar opciones de super admin
            document.querySelectorAll('.superadmin-only').forEach(el => {
                el.style.display = 'none';
            });
            
            // Mostrar advertencia
            const warning = document.createElement('div');
            warning.className = 'permission-warning';
            warning.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <h4>Permisos Limitados</h4>
                    <p>Tu rol (${currentUser?.role || 'Invitado'}) tiene acceso limitado a la configuración.</p>
                    <p>Algunas opciones están ocultas o deshabilitadas.</p>
                </div>
            `;
            
            document.querySelector('.config-content').prepend(warning);
        }
    }
    
    actualizarUsuarioInfo() {
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser) {
            document.getElementById('current-user').textContent = currentUser.name;
            document.getElementById('current-role').textContent = this.getRoleName(currentUser.role);
        }
    }
    
    actualizarUI() {
        this.actualizarEstadoGuardado();
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `config-notification ${tipo}`;
        notificacion.innerHTML = `
            <i class="fas fa-${this.getNotificacionIcono(tipo)}"></i>
            <span>${mensaje}</span>
        `;
        
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificacionColor(tipo)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease';
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
    
    getNotificacionColor(tipo) {
        const colores = {
            success: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
            error: 'linear-gradient(135deg, #e74c3c 0%, #ff6b6b 100%)',
            warning: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)',
            info: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
        };
        return colores[tipo] || '#3498db';
    }
}

// Inicializar configuración cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay usuario autenticado
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Verificar permisos de super admin
    if (currentUser.role !== 'superadmin') {
        alert('Solo los Super Administradores pueden acceder a la configuración.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    window.configuracionGTU = new ConfiguracionGTU();
});