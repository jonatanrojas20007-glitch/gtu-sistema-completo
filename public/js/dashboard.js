// Dashboard GTU - Funcionalidades principales
class DashboardGTU {
    constructor() {
        this.registros = [];
        this.registrosFiltrados = [];
        this.currentSection = 'dashboard';
        this.filtrosActivos = {};
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDashboard();
        this.startClock();
        this.applyPermissions();
        this.configurarNavegacionFiltros();
        this.cargarTablaRegistros();
        
        // Verificar filtros en URL
        this.checkUrlFilters();
    }
    
    loadData() {
        // Cargar registros del localStorage
        const datos = localStorage.getItem('gtuRegistros');
        if (datos) {
            this.registros = JSON.parse(datos);
            console.log(`Cargados ${this.registros.length} registros`);
        }
        
        // Cargar filtros activos si existen
        const filtrosGuardados = localStorage.getItem('gtuFiltrosActivos');
        if (filtrosGuardados) {
            this.filtrosActivos = JSON.parse(filtrosGuardados);
            this.aplicarFiltrosGuardados();
        }
        
        // Actualizar cada 10 segundos
        setTimeout(() => this.loadData(), 10000);
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.target.closest('.nav-item').dataset.section;
                this.switchSection(section);
            });
        });
        
        // Quick actions
        document.getElementById('action-reporte')?.addEventListener('click', () => {
            this.generateReport();
        });
        
        document.getElementById('action-backup')?.addEventListener('click', () => {
            this.backupData();
        });
        
        document.getElementById('action-config')?.addEventListener('click', () => {
            if (AuthSystem.checkPermission('config')) {
                window.location.href = 'admin.html';
            } else {
                this.showNotification('No tienes permisos para acceder a la configuración', 'warning');
            }
        });
        
        // Botones de filtros
        document.getElementById('action-filtros')?.addEventListener('click', () => {
            this.irAFiltros();
        });
        
        document.getElementById('action-limpiar-filtros')?.addEventListener('click', () => {
            this.limpiarFiltrosDashboard();
        });
        
        document.getElementById('action-actualizar')?.addEventListener('click', () => {
            this.refreshDashboard();
        });
        
        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
        
        // Tabla de registros
        document.getElementById('refresh-table')?.addEventListener('click', () => {
            this.cargarTablaRegistros();
        });
        
        document.getElementById('export-table')?.addEventListener('click', () => {
            this.exportarTabla();
        });
        
        // Filtros rápidos en el menú
        document.getElementById('action-filtros-rapidos')?.addEventListener('click', () => {
            window.location.href = 'filtros.html';
        });
        
        // Análisis
        document.getElementById('action-analisis')?.addEventListener('click', () => {
            window.location.href = 'analisis.html';
        });
        
        // Mapa
        document.getElementById('action-mapa')?.addEventListener('click', () => {
            window.location.href = 'mapa.html';
        });
    }
    
    checkUrlFilters() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('filter')) {
            const filterType = urlParams.get('filter');
            const filterValue = urlParams.get('value');
            
            if (filterType && filterValue) {
                this.aplicarFiltroUrl(filterType, filterValue);
            }
        }
    }
    
    aplicarFiltroUrl(tipo, valor) {
        switch(tipo) {
            case 'escuela':
                this.filtrosActivos.escuela = valor;
                break;
            case 'carrera':
                this.filtrosActivos.carrera = valor;
                break;
            case 'municipio':
                this.filtrosActivos.municipio = valor;
                break;
            case 'estado':
                this.filtrosActivos.estado = valor;
                break;
            case 'genero':
                this.filtrosActivos.genero = valor;
                break;
        }
        
        this.aplicarFiltrosGuardados();
        this.updateDashboard();
        this.cargarTablaRegistros();
        this.showNotification(`Filtro aplicado desde URL: ${tipo} = ${valor}`, 'info');
    }
    
    switchSection(section) {
        this.currentSection = section;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[data-section="${section}"]`)?.classList.add('active');
        
        // Load section content
        this.loadSectionContent(section);
    }
    
    loadSectionContent(section) {
        const sectionNames = {
            dashboard: 'Dashboard',
            registros: 'Registros',
            estadisticas: 'Estadísticas',
            mapa: 'Mapa de Calor',
            analisis: 'Análisis Avanzado',
            admin: 'Administración',
            reportes: 'Reportes',
            filtros: 'Filtros Avanzados'
        };
        
        if (section !== 'dashboard') {
            setTimeout(() => {
                // Guardar filtros activos antes de redirigir
                if (Object.keys(this.filtrosActivos).length > 0) {
                    localStorage.setItem('gtuFiltrosActivos', JSON.stringify(this.filtrosActivos));
                }
                window.location.href = `${section}.html`;
            }, 300);
        }
    }
    
    updateDashboard() {
        // Update stats
        this.updateStats();
        
        // Update recent activity
        this.updateRecentActivity();
        
        // Check permissions for actions
        this.updateActionPermissions();
        
        // Mostrar estado de filtros
        this.mostrarEstadoFiltros();
    }
    
    applyPermissions() {
        const currentUser = AuthSystem.getCurrentUser();
        if (!currentUser) return;
        
        const role = currentUser.role;
        
        // Actualizar información del usuario
        document.getElementById('current-user').textContent = currentUser.name;
        document.getElementById('current-role').textContent = role.charAt(0).toUpperCase() + role.slice(1);
        document.getElementById('user-avatar').textContent = currentUser.name.charAt(0);
        
        // Actualizar mensaje de bienvenida
        document.getElementById('welcome-message').textContent = `¡Bienvenido de nuevo, ${currentUser.name}!`;
        
        // Actualizar badge de rol
        const roleBadge = document.getElementById('role-badge');
        if (roleBadge) {
            const icon = role === 'superadmin' ? 'fa-crown' : 
                        role === 'admin' ? 'fa-user-shield' : 'fa-chart-line';
            const text = role === 'superadmin' ? 'Super Administrador - Acceso Completo' :
                        role === 'admin' ? 'Administrador - Gestión de Registros' :
                        'Asesor - Solo Visualización';
            
            roleBadge.innerHTML = `<i class="fas ${icon}"></i><span>${text}</span>`;
        }
        
        // Ocultar secciones según permisos
        if (role === 'asesor') {
            // Asesor solo puede ver dashboard, estadísticas y mapa
            document.getElementById('admin-section-btn').style.display = 'none';
            document.getElementById('analisis-section-btn').style.display = 'none';
            
            // Mostrar notificación de permisos limitados
            document.getElementById('permissions-notice').style.display = 'flex';
            
            // Ocultar acciones de administración
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
    
    // ============= FUNCIONES DE FILTROS =============
    
    configurarNavegacionFiltros() {
        // Si hay filtros activos, mostrar botón para limpiar
        if (Object.keys(this.filtrosActivos).length > 0) {
            document.getElementById('action-limpiar-filtros').style.display = 'block';
            this.crearBotonFiltrosActivos();
        }
    }
    
    aplicarFiltrosGuardados() {
        if (Object.keys(this.filtrosActivos).length === 0) {
            this.registrosFiltrados = [...this.registros];
            return;
        }
        
        let registrosFiltrados = [...this.registros];
        
        // Aplicar cada filtro guardado
        if (this.filtrosActivos.fechas) {
            const inicio = new Date(this.filtrosActivos.fechas.inicio);
            const fin = new Date(this.filtrosActivos.fechas.fin);
            fin.setHours(23, 59, 59, 999);
            
            registrosFiltrados = registrosFiltrados.filter(registro => {
                if (!registro.fechaRegistro) return false;
                const fechaReg = new Date(registro.fechaRegistro);
                return fechaReg >= inicio && fechaReg <= fin;
            });
        }
        
        if (this.filtrosActivos.estado) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.estado === this.filtrosActivos.estado ||
                registro.departamento === this.filtrosActivos.estado
            );
        }
        
        if (this.filtrosActivos.municipio) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.municipio === this.filtrosActivos.municipio ||
                registro.ciudad === this.filtrosActivos.municipio
            );
        }
        
        if (this.filtrosActivos.escuela) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.escuela === this.filtrosActivos.escuela
            );
        }
        
        if (this.filtrosActivos.carrera) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.carrera === this.filtrosActivos.carrera
            );
        }
        
        if (this.filtrosActivos.genero) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.genero === this.filtrosActivos.genero
            );
        }
        
        this.registrosFiltrados = registrosFiltrados;
    }
    
    mostrarEstadoFiltros() {
        const filtrosActivos = Object.keys(this.filtrosActivos).length > 0;
        
        if (filtrosActivos) {
            // Mostrar badge con cantidad de filtros
            const filtrosCount = Object.keys(this.filtrosActivos).length;
            document.getElementById('filtros-count').textContent = `(${filtrosCount} filtros)`;
            document.getElementById('filtros-count').style.display = 'inline';
            
            // Actualizar información de filtros
            const totalRegistros = this.registros.length;
            const porcentaje = totalRegistros > 0 ? 
                ((this.registrosFiltrados.length / totalRegistros) * 100).toFixed(1) : 0;
            
            document.getElementById('filtros-info').innerHTML = `
                <i class="fas fa-filter"></i>
                <span>Mostrando ${this.registrosFiltrados.length} de ${totalRegistros} registros (${porcentaje}%)</span>
            `;
            document.getElementById('filtros-info').style.display = 'flex';
            
            // Actualizar estado del sistema
            document.getElementById('filtros-status').textContent = `${filtrosCount} filtro${filtrosCount !== 1 ? 's' : ''} aplicado${filtrosCount !== 1 ? 's' : ''}`;
            document.getElementById('filtros-status').style.color = '#FF6B35';
            
            // Mostrar botón para limpiar filtros
            document.getElementById('action-limpiar-filtros').style.display = 'block';
        } else {
            document.getElementById('filtros-count').style.display = 'none';
            document.getElementById('filtros-info').style.display = 'none';
            document.getElementById('filtros-status').textContent = 'No hay filtros aplicados';
            document.getElementById('filtros-status').style.color = '';
            document.getElementById('action-limpiar-filtros').style.display = 'none';
        }
    }
    
    crearBotonFiltrosActivos() {
        // Verificar si el botón ya existe
        if (document.getElementById('filtros-activos-btn')) return;
        
        // Crear botón para mostrar filtros activos
        const filtrosBtn = document.createElement('button');
        filtrosBtn.id = 'filtros-activos-btn';
        filtrosBtn.className = 'action-btn filtros-activos';
        filtrosBtn.innerHTML = '<i class="fas fa-filter"></i> Ver Filtros';
        filtrosBtn.addEventListener('click', () => {
            this.mostrarDetallesFiltros();
        });
        
        // Agregar al header de acciones
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            headerActions.insertBefore(filtrosBtn, headerActions.firstChild);
        }
        
        // Agregar estilo para el botón de filtros activos
        const style = document.createElement('style');
        style.textContent = `
            .filtros-activos {
                background: linear-gradient(135deg, #ff9a44 0%, #ff6b35 100%) !important;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    mostrarDetallesFiltros() {
        const modal = document.createElement('div');
        modal.className = 'filtros-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-filter"></i> Filtros Activos</h3>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="filtros-lista" id="filtros-lista">
                        ${this.generarListaFiltros()}
                    </div>
                    <div class="filtros-actions">
                        <button class="btn-primary" id="ir-filtros-detalles">
                            <i class="fas fa-external-link-alt"></i> Ir a Filtros Avanzados
                        </button>
                        <button class="btn-warning" id="limpiar-filtros-detalles">
                            <i class="fas fa-broom"></i> Limpiar Todos los Filtros
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Estilos del modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        `;
        
        // Eventos del modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#ir-filtros-detalles').addEventListener('click', () => {
            window.location.href = 'filtros.html';
        });
        
        modal.querySelector('#limpiar-filtros-detalles').addEventListener('click', () => {
            this.limpiarFiltrosDashboard();
            modal.remove();
        });
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Agregar animaciones si no existen
        if (!document.querySelector('#filtros-modal-animations')) {
            const style = document.createElement('style');
            style.id = 'filtros-modal-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #f0f0f0;
                }
                
                .modal-header h3 {
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    color: #666;
                    cursor: pointer;
                    padding: 5px;
                }
                
                .filtros-lista {
                    margin-bottom: 25px;
                }
                
                .filtro-item {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    border-left: 4px solid #FF6B35;
                }
                
                .filtro-tipo {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .filtro-valor {
                    color: #666;
                    font-size: 0.95rem;
                }
                
                .filtros-actions {
                    display: flex;
                    gap: 15px;
                }
                
                .no-filtros {
                    text-align: center;
                    padding: 20px;
                    color: #999;
                    font-style: italic;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    generarListaFiltros() {
        if (Object.keys(this.filtrosActivos).length === 0) {
            return '<div class="no-filtros">No hay filtros activos</div>';
        }
        
        let html = '';
        
        if (this.filtrosActivos.fechas) {
            html += `
                <div class="filtro-item">
                    <div class="filtro-tipo">
                        <i class="fas fa-calendar"></i>
                        Rango de Fechas
                    </div>
                    <div class="filtro-valor">
                        ${this.filtrosActivos.fechas.inicio} → ${this.filtrosActivos.fechas.fin}
                    </div>
                </div>
            `;
        }
        
        if (this.filtrosActivos.estado) {
            html += `
                <div class="filtro-item">
                    <div class="filtro-tipo">
                        <i class="fas fa-map-marker-alt"></i>
                        Estado
                    </div>
                    <div class="filtro-valor">
                        ${this.filtrosActivos.estado}
                    </div>
                </div>
            `;
        }
        
        if (this.filtrosActivos.municipio) {
            html += `
                <div class="filtro-item">
                    <div class="filtro-tipo">
                        <i class="fas fa-city"></i>
                        Municipio
                    </div>
                    <div class="filtro-valor">
                        ${this.filtrosActivos.municipio}
                    </div>
                </div>
            `;
        }
        
        if (this.filtrosActivos.escuela) {
            html += `
                <div class="filtro-item">
                    <div class="filtro-tipo">
                        <i class="fas fa-school"></i>
                        Escuela
                    </div>
                    <div class="filtro-valor">
                        ${this.filtrosActivos.escuela}
                    </div>
                </div>
            `;
        }
        
        if (this.filtrosActivos.carrera) {
            html += `
                <div class="filtro-item">
                    <div class="filtro-tipo">
                        <i class="fas fa-graduation-cap"></i>
                        Carrera
                    </div>
                    <div class="filtro-valor">
                        ${this.filtrosActivos.carrera}
                    </div>
                </div>
            `;
        }
        
        if (this.filtrosActivos.genero) {
            html += `
                <div class="filtro-item">
                    <div class="filtro-tipo">
                        <i class="fas fa-venus-mars"></i>
                        Género
                    </div>
                    <div class="filtro-valor">
                        ${this.filtrosActivos.genero}
                    </div>
                </div>
            `;
        }
        
        return html;
    }
    
    irAFiltros() {
        // Guardar estado actual para regresar después
        localStorage.setItem('gtuDashboardState', JSON.stringify({
            section: this.currentSection,
            timestamp: Date.now()
        }));
        
        window.location.href = 'filtros.html';
    }
    
    limpiarFiltrosDashboard() {
        this.filtrosActivos = {};
        this.registrosFiltrados = [];
        
        // Limpiar localStorage
        localStorage.removeItem('gtuFiltrosActivos');
        
        // Limpiar URL si tiene parámetros de filtro
        if (window.location.search) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Actualizar dashboard
        this.updateDashboard();
        this.cargarTablaRegistros();
        
        // Ocultar botón de filtros activos
        const filtrosBtn = document.getElementById('filtros-activos-btn');
        if (filtrosBtn) {
            filtrosBtn.remove();
        }
        
        this.showNotification('Todos los filtros han sido limpiados', 'success');
    }
    
    refreshDashboard() {
        this.loadData();
        this.updateDashboard();
        this.cargarTablaRegistros();
        this.showNotification('Dashboard actualizado', 'success');
    }
    
    logout() {
        // Confirmar antes de cerrar sesión
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('gtu_user');
            localStorage.removeItem('gtu_logged_in');
            localStorage.removeItem('gtuFiltrosActivos');
            window.location.href = 'login.html';
        }
    }
    
    // ============= FUNCIONES DE TABLA DE REGISTROS =============
    
    cargarTablaRegistros() {
        const tbody = document.getElementById('recent-table-body');
        if (!tbody) return;
        
        const datosUsar = this.registrosFiltrados.length > 0 ? this.registrosFiltrados : this.registros;
        
        if (datosUsar.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        <i class="fas fa-database"></i>
                        <span>No hay registros disponibles</span>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Ordenar por fecha más reciente
        const registrosOrdenados = [...datosUsar]
            .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
            .slice(0, 10); // Mostrar solo 10 registros
        
        tbody.innerHTML = registrosOrdenados.map(registro => `
            <tr>
                <td>${registro.id ? registro.id.toString().slice(-4) : 'N/A'}</td>
                <td><strong>${registro.nombre || 'No especificado'}</strong></td>
                <td>${registro.escuela || 'No especificada'}</td>
                <td><span class="badge">${registro.carrera || 'No especificada'}</span></td>
                <td>${registro.municipio || registro.ciudad || 'No especificado'}</td>
                <td>${this.formatearFecha(registro.fechaRegistro)}</td>
                <td>
                    <button class="btn-small" onclick="window.dashboard.verDetallesRegistro('${registro.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-small" onclick="window.dashboard.editarRegistro('${registro.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    exportarTabla() {
        const datosUsar = this.registrosFiltrados.length > 0 ? this.registrosFiltrados : this.registros;
        
        if (datosUsar.length === 0) {
            this.showNotification('No hay datos para exportar', 'warning');
            return;
        }
        
        const datosExportar = {
            fecha: new Date().toISOString(),
            totalRegistros: datosUsar.length,
            filtrosAplicados: this.filtrosActivos,
            registros: datosUsar.slice(0, 50) // Limitar a 50 registros
        };
        
        const blob = new Blob([JSON.stringify(datosExportar, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registros-gtu-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Datos exportados exitosamente', 'success');
    }
    
    verDetallesRegistro(id) {
        const registro = this.registros.find(r => r.id == id);
        if (!registro) return;
        
        const modal = document.createElement('div');
        modal.className = 'registro-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-graduate"></i> Detalles del Registro</h3>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    ${this.generarDetallesRegistro(registro)}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cerrar-modal">Cerrar</button>
                    <button class="btn-primary" id="editar-registro-modal" onclick="window.dashboard.editarRegistro('${registro.id}')">
                        <i class="fas fa-edit"></i> Editar Registro
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#cerrar-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Ocultar botón de edición si no tiene permisos
        if (!AuthSystem.checkPermission('admin') && AuthSystem.getCurrentUser()?.role !== 'superadmin') {
            modal.querySelector('#editar-registro-modal').style.display = 'none';
        }
    }
    
    editarRegistro(id) {
        // Solo superadmin y admin pueden editar
        const currentUser = AuthSystem.getCurrentUser();
        if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'admin')) {
            this.showNotification('No tienes permisos para editar registros', 'warning');
            return;
        }
        
        const registro = this.registros.find(r => r.id == id);
        if (!registro) return;
        
        // Aquí podrías redirigir a una página de edición o abrir un modal complejo
        // Por ahora solo mostramos un modal simple
        const modal = document.createElement('div');
        modal.className = 'editar-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Editar Registro</h3>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <p>Funcionalidad de edición en desarrollo.</p>
                    <p>ID del registro: ${registro.id}</p>
                    <p>Nombre: ${registro.nombre}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancelar-edicion">Cancelar</button>
                    <button class="btn-primary" id="guardar-cambios">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#cancelar-edicion').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#guardar-cambios').addEventListener('click', () => {
            this.showNotification('Funcionalidad en desarrollo', 'info');
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    generarDetallesRegistro(registro) {
        return `
            <div class="registro-detalles">
                <div class="detail-row">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">${registro.id || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Nombre:</span>
                    <span class="detail-value">${registro.nombre || 'No especificado'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Escuela:</span>
                    <span class="detail-value">${registro.escuela || 'No especificada'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Tipo de Escuela:</span>
                    <span class="detail-value">${registro.tipoEscuela || 'No especificado'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Carrera de Interés:</span>
                    <span class="detail-value">${registro.carrera || 'No especificada'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Ubicación:</span>
                    <span class="detail-value">${registro.municipio || 'No especificado'}, ${registro.estado || 'No especificado'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Género:</span>
                    <span class="detail-value">${registro.genero || 'No especificado'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Fecha de Registro:</span>
                    <span class="detail-value">${this.formatearFechaCompleta(registro.fechaRegistro)}</span>
                </div>
                ${registro.latitud && registro.longitud ? `
                    <div class="detail-row">
                        <span class="detail-label">Coordenadas:</span>
                        <span class="detail-value">${registro.latitud.toFixed(6)}, ${registro.longitud.toFixed(6)}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // ============= FUNCIONES PRINCIPALES =============
    
    updateStats() {
        const datosUsar = this.registrosFiltrados.length > 0 ? this.registrosFiltrados : this.registros;
        const totalAlumnos = datosUsar.length;
        const escuelasUnicas = [...new Set(datosUsar.map(r => r.escuela))].length;
        const departamentosUnicos = [...new Set(datosUsar.filter(r => r.departamento || r.estado).map(r => r.departamento || r.estado))].length;
        
        // Registros hoy
        const hoy = new Date().toISOString().split('T')[0];
        const registrosHoy = datosUsar.filter(r => 
            r.fechaRegistro && r.fechaRegistro.split('T')[0] === hoy
        ).length;
        
        // Update DOM
        document.getElementById('total-alumnos').textContent = totalAlumnos;
        document.getElementById('total-escuelas').textContent = escuelasUnicas;
        document.getElementById('registros-hoy').textContent = registrosHoy;
        document.getElementById('total-departamentos').textContent = departamentosUnicos;
    }
    
    updateRecentActivity() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        // Usar registros filtrados si existen
        const datosUsar = this.registrosFiltrados.length > 0 ? this.registrosFiltrados : this.registros;
        
        // Ordenar registros por fecha (más reciente primero)
        const registrosRecientes = [...datosUsar]
            .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
            .slice(0, 5);
        
        if (registrosRecientes.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">No hay actividad reciente</div>
                        <div class="activity-desc">Comienza registrando nuevos alumnos</div>
                    </div>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = registrosRecientes.map(registro => {
            const fecha = new Date(registro.fechaRegistro);
            const tiempo = this.formatTimeAgo(fecha);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Nuevo registro de alumno</div>
                        <div class="activity-desc">${registro.nombre} - ${registro.escuela}</div>
                        <div class="activity-time">${tiempo}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateActionPermissions() {
        const currentUser = AuthSystem.getCurrentUser();
        if (!currentUser) return;
        
        // Disable admin-only actions for asesores
        if (currentUser.role === 'asesor') {
            document.querySelectorAll('.admin-only').forEach(btn => {
                btn.classList.add('disabled');
                btn.title = 'Requiere permisos de administrador';
            });
        }
    }
    
    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }
    
    updateClock() {
        const now = new Date();
        
        // Update time
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('es-ES', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        // Update date
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateElement.textContent = now.toLocaleDateString('es-ES', options);
        }
    }
    
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Hace unos segundos';
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        
        return date.toLocaleDateString('es-ES');
    }
    
    formatearFecha(fechaString) {
        if (!fechaString) return 'Fecha no válida';
        
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Fecha no válida';
        }
    }
    
    formatearFechaCompleta(fechaString) {
        if (!fechaString) return 'Fecha no válida';
        
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha no válida';
        }
    }
    
    generateReport() {
        if (!AuthSystem.checkPermission('export')) {
            this.showNotification('No tienes permisos para generar reportes', 'warning');
            return;
        }
        
        const datosUsar = this.registrosFiltrados.length > 0 ? this.registrosFiltrados : this.registros;
        
        const reportData = {
            fecha: new Date().toISOString(),
            totalRegistros: datosUsar.length,
            filtrosAplicados: this.filtrosActivos,
            registrosPorEscuela: this.getRegistrosPorEscuela(datosUsar),
            registrosPorCarrera: this.getRegistrosPorCarrera(datosUsar),
            registrosPorDepartamento: this.getRegistrosPorDepartamento(datosUsar),
            registrosUltimaSemana: this.getRegistrosUltimaSemana(datosUsar),
            resumenEstadisticas: {
                escuelasUnicas: [...new Set(datosUsar.map(r => r.escuela))].length,
                carrerasUnicas: [...new Set(datosUsar.map(r => r.carrera))].length,
                municipiosUnicos: [...new Set(datosUsar.map(r => r.municipio || r.ciudad))].length
            }
        };
        
        // Crear y descargar reporte
        const blob = new Blob([JSON.stringify(reportData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-gtu-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Reporte generado exitosamente', 'success');
    }
    
    backupData() {
        if (!AuthSystem.checkPermission('backup')) {
            this.showNotification('No tienes permisos para realizar backups', 'warning');
            return;
        }
        
        const backup = {
            fecha: new Date().toISOString(),
            registros: this.registros,
            filtrosActivos: this.filtrosActivos,
            totalRegistros: this.registros.length,
            usuario: AuthSystem.getCurrentUser()?.name,
            rol: AuthSystem.getCurrentUser()?.role
        };
        
        // Descargar backup
        const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-gtu-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Backup realizado exitosamente', 'success');
    }
    
    getRegistrosPorEscuela(registros) {
        const escuelas = {};
        registros.forEach(registro => {
            const escuela = registro.escuela || 'No especificada';
            escuelas[escuela] = (escuelas[escuela] || 0) + 1;
        });
        return escuelas;
    }
    
    getRegistrosPorCarrera(registros) {
        const carreras = {};
        registros.forEach(registro => {
            const carrera = registro.carrera || 'No especificada';
            carreras[carrera] = (carreras[carrera] || 0) + 1;
        });
        return carreras;
    }
    
    getRegistrosPorDepartamento(registros) {
        const departamentos = {};
        registros.forEach(registro => {
            const departamento = registro.departamento || registro.estado || 'No especificado';
            departamentos[departamento] = (departamentos[departamento] || 0) + 1;
        });
        return departamentos;
    }
    
    getRegistrosUltimaSemana(registros) {
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
        
        return registros.filter(registro => {
            const fechaRegistro = new Date(registro.fechaRegistro);
            return fechaRegistro >= unaSemanaAtras;
        }).length;
    }
    
    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Add animations if not exist
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    getNotificationColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
            error: 'linear-gradient(135deg, #e74c3c 0%, #ff6b6b 100%)',
            warning: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)',
            info: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
        };
        return colors[type] || '#3498db';
    }
}

// Inicializar dashboard cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize dashboard
    window.dashboard = new DashboardGTU();
});