// Sistema de Gestión de Registros GTU
class RegistrosGTU {
    constructor() {
        this.registros = [];
        this.filteredRegistros = [];
        this.currentPage = 1;
        this.rowsPerPage = 25;
        this.sortField = 'fechaRegistro';
        this.sortDirection = 'desc';
        this.filters = {
            search: '',
            carrera: '',
            escuela: '',
            municipio: '',
            fecha: 'all'
        };
        this.selectedIds = new Set();
        
        this.init();
    }
    
    init() {
        this.cargarDatos();
        this.configurarEventos();
        this.actualizarUI();
        this.actualizarUsuarioInfo();
        
        // Actualizar cada 5 segundos
        setInterval(() => this.cargarDatos(), 5000);
    }
    
    cargarDatos() {
        const datosGuardados = localStorage.getItem('gtuRegistros');
        
        if (datosGuardados) {
            this.registros = JSON.parse(datosGuardados);
            console.log(`Cargados ${this.registros.length} registros`);
        } else {
            this.registros = [];
            console.log('No hay registros guardados');
        }
        
        this.aplicarFiltros();
        this.actualizarEstadisticas();
        this.actualizarTabla();
    }
    
    aplicarFiltros() {
        let resultados = [...this.registros];
        
        // Aplicar filtro de búsqueda global
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            resultados = resultados.filter(registro => {
                return Object.values(registro).some(value => 
                    String(value).toLowerCase().includes(searchLower)
                );
            });
        }
        
        // Aplicar filtro de carrera
        if (this.filters.carrera) {
            resultados = resultados.filter(registro => 
                registro.carrera === this.filters.carrera
            );
        }
        
        // Aplicar filtro de escuela
        if (this.filters.escuela) {
            resultados = resultados.filter(registro => 
                registro.escuela === this.filters.escuela
            );
        }
        
        // Aplicar filtro de municipio
        if (this.filters.municipio) {
            resultados = resultados.filter(registro => 
                registro.municipio === this.filters.municipio
            );
        }
        
        // Aplicar filtro de fecha
        if (this.filters.fecha !== 'all') {
            const ahora = new Date();
            let fechaLimite = new Date();
            
            switch(this.filters.fecha) {
                case 'today':
                    fechaLimite.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    fechaLimite.setDate(ahora.getDate() - 7);
                    break;
                case 'month':
                    fechaLimite.setMonth(ahora.getMonth() - 1);
                    break;
            }
            
            resultados = resultados.filter(registro => {
                if (!registro.fechaRegistro) return false;
                const fechaRegistro = new Date(registro.fechaRegistro);
                return fechaRegistro >= fechaLimite;
            });
        }
        
        // Aplicar ordenamiento
        resultados.sort((a, b) => {
            let valueA = a[this.sortField] || '';
            let valueB = b[this.sortField] || '';
            
            if (this.sortField === 'fechaRegistro') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            } else {
                valueA = String(valueA).toLowerCase();
                valueB = String(valueB).toLowerCase();
            }
            
            if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        this.filteredRegistros = resultados;
    }
    
    actualizarEstadisticas() {
        const total = this.registros.length;
        
        // Calcular registros de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const registrosHoy = this.registros.filter(r => 
            r.fechaRegistro && r.fechaRegistro.split('T')[0] === hoy
        ).length;
        
        // Calcular escuelas únicas
        const escuelasSet = new Set();
        this.registros.forEach(r => {
            if (r.escuela && r.escuela !== 'No especificada') {
                escuelasSet.add(r.escuela);
            }
        });
        
        // Calcular carreras únicas
        const carrerasSet = new Set();
        this.registros.forEach(r => {
            if (r.carrera && r.carrera !== 'No especificada') {
                carrerasSet.add(r.carrera);
            }
        });
        
        // Actualizar UI
        document.getElementById('total-registros').textContent = total;
        document.getElementById('registros-hoy').textContent = registrosHoy;
        document.getElementById('escuelas-unicas').textContent = escuelasSet.size;
        document.getElementById('carreras-unicas').textContent = carrerasSet.size;
        document.getElementById('total-in-system').textContent = total;
        
        // Actualizar fecha
        this.actualizarFecha();
        
        // Actualizar opciones de filtros
        this.actualizarOpcionesFiltros();
    }
    
    actualizarOpcionesFiltros() {
        // Actualizar opciones de carrera
        const carrerasSet = new Set();
        this.registros.forEach(r => {
            if (r.carrera && r.carrera !== 'No especificada') {
                carrerasSet.add(r.carrera);
            }
        });
        
        const carreraSelect = document.getElementById('filter-carrera');
        if (carreraSelect) {
            carreraSelect.innerHTML = `
                <option value="">Todas las carreras</option>
                ${Array.from(carrerasSet).map(carrera => 
                    `<option value="${carrera}">${carrera}</option>`
                ).join('')}
            `;
            
            if (this.filters.carrera) {
                carreraSelect.value = this.filters.carrera;
            }
        }
        
        // Actualizar opciones de escuela
        const escuelasSet = new Set();
        this.registros.forEach(r => {
            if (r.escuela && r.escuela !== 'No especificada') {
                escuelasSet.add(r.escuela);
            }
        });
        
        const escuelaSelect = document.getElementById('filter-escuela');
        if (escuelaSelect) {
            escuelaSelect.innerHTML = `
                <option value="">Todas las escuelas</option>
                ${Array.from(escuelasSet).map(escuela => 
                    `<option value="${escuela}">${escuela}</option>`
                ).join('')}
            `;
            
            if (this.filters.escuela) {
                escuelaSelect.value = this.filters.escuela;
            }
        }
        
        // Actualizar opciones de municipio
        const municipiosSet = new Set();
        this.registros.forEach(r => {
            if (r.municipio && r.municipio !== 'No especificado') {
                municipiosSet.add(r.municipio);
            }
        });
        
        const municipioSelect = document.getElementById('filter-municipio');
        if (municipioSelect) {
            municipioSelect.innerHTML = `
                <option value="">Todos los municipios</option>
                ${Array.from(municipiosSet).map(municipio => 
                    `<option value="${municipio}">${municipio}</option>`
                ).join('')}
            `;
            
            if (this.filters.municipio) {
                municipioSelect.value = this.filters.municipio;
            }
        }
    }
    
    actualizarTabla() {
        const tbody = document.getElementById('registros-body');
        const emptyState = document.getElementById('empty-table');
        const filteredCount = this.filteredRegistros.length;
        const totalCount = this.registros.length;
        
        // Mostrar/ocultar estado vacío
        if (filteredCount === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            
            // Mostrar mensaje específico
            if (totalCount === 0) {
                emptyState.querySelector('h3').textContent = 'No hay registros aún';
                emptyState.querySelector('p').textContent = 'Los registros aparecerán aquí cuando los estudiantes completen el formulario.';
            } else {
                emptyState.querySelector('h3').textContent = 'No se encontraron resultados';
                emptyState.querySelector('p').textContent = 'Intenta con otros términos de búsqueda o filtros.';
            }
        } else {
            emptyState.style.display = 'none';
            
            // Calcular datos para la página actual
            const startIndex = (this.currentPage - 1) * this.rowsPerPage;
            const endIndex = Math.min(startIndex + this.rowsPerPage, filteredCount);
            const pageData = this.filteredRegistros.slice(startIndex, endIndex);
            
            // Generar filas de la tabla
            tbody.innerHTML = pageData.map((registro, index) => {
                const isSelected = this.selectedIds.has(registro.id);
                const rowNumber = startIndex + index + 1;
                
                return `
                    <tr class="${isSelected ? 'selected' : ''}">
                        <td class="select-col">
                            <input type="checkbox" class="row-select" 
                                   data-id="${registro.id}" 
                                   ${isSelected ? 'checked' : ''}>
                        </td>
                        <td>${registro.id}</td>
                        <td>
                            <div class="student-name">${registro.nombre || 'No especificado'}</div>
                        </td>
                        <td>
                            <div class="school-cell">
                                <span class="school-name">${registro.escuela || 'No especificada'}</span>
                                <span class="school-type">${registro.tipoEscuela || ''}</span>
                            </div>
                        </td>
                        <td>
                            <span class="cell-badge">${registro.carrera || 'No especificada'}</span>
                        </td>
                        <td>
                            <span class="cell-badge">${registro.municipio || 'No especificado'}</span>
                        </td>
                        <td>
                            <span class="cell-badge gender-badge ${registro.genero?.toLowerCase() || ''}">
                                ${registro.genero || 'No especificado'}
                            </span>
                        </td>
                        <td class="date-cell">
                            ${this.formatearFecha(registro.fechaRegistro)}
                        </td>
                        <td class="actions-col">
                            <div class="table-actions-cell">
                                <div class="action-icon view" title="Ver detalles" data-id="${registro.id}">
                                    <i class="fas fa-eye"></i>
                                </div>
                                <div class="action-icon edit" title="Editar" data-id="${registro.id}">
                                    <i class="fas fa-edit"></i>
                                </div>
                                <div class="action-icon delete" title="Eliminar" data-id="${registro.id}">
                                    <i class="fas fa-trash"></i>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
        // Actualizar información de paginación
        this.actualizarPaginacion();
        
        // Actualizar contadores
        document.getElementById('table-count').textContent = totalCount;
        document.getElementById('filtered-number').textContent = filteredCount;
        
        const filteredCountElement = document.getElementById('filtered-count');
        if (filteredCount < totalCount && filteredCount > 0) {
            filteredCountElement.style.display = 'inline';
        } else {
            filteredCountElement.style.display = 'none';
        }
    }
    
    actualizarPaginacion() {
        const totalRows = this.filteredRegistros.length;
        const totalPages = Math.ceil(totalRows / this.rowsPerPage);
        
        // Ajustar página actual si es necesario
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        } else if (totalPages === 0) {
            this.currentPage = 1;
        }
        
        // Actualizar información de paginación
        const startRow = totalRows === 0 ? 0 : (this.currentPage - 1) * this.rowsPerPage + 1;
        const endRow = Math.min(this.currentPage * this.rowsPerPage, totalRows);
        
        document.getElementById('showing-from').textContent = startRow;
        document.getElementById('showing-to').textContent = endRow;
        document.getElementById('total-rows').textContent = totalRows;
        document.getElementById('pagination-info').textContent = `Página ${this.currentPage} de ${totalPages}`;
        
        // Actualizar botones de paginación
        document.getElementById('first-page').disabled = this.currentPage === 1;
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages || totalPages === 0;
        document.getElementById('last-page').disabled = this.currentPage === totalPages || totalPages === 0;
        
        // Actualizar números de página
        const pageNumbers = document.getElementById('page-numbers');
        if (pageNumbers) {
            let pageNumbersHTML = '';
            const maxPagesToShow = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
            
            // Ajustar si estamos cerca del final
            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pageNumbersHTML += `
                    <button class="page-number ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            }
            
            pageNumbers.innerHTML = pageNumbersHTML;
        }
    }
    
    actualizarFecha() {
        const fecha = new Date();
        document.getElementById('last-update').textContent = fecha.toLocaleString('es-MX', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    actualizarUsuarioInfo() {
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser) {
            document.getElementById('current-user').textContent = currentUser.name;
            document.getElementById('current-role').textContent = currentUser.role;
            
            // Ocultar acciones según permisos
            if (currentUser.role === 'asesor') {
                document.querySelectorAll('.action-icon.edit, .action-icon.delete, .btn-danger').forEach(el => {
                    el.style.display = 'none';
                });
                document.getElementById('bulk-delete').style.display = 'none';
            }
        }
    }
    
    configurarEventos() {
        // Búsqueda global
        document.getElementById('global-search').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.currentPage = 1;
            this.aplicarFiltros();
            this.actualizarTabla();
        });
        
        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('global-search').value = '';
            this.filters.search = '';
            this.currentPage = 1;
            this.aplicarFiltros();
            this.actualizarTabla();
        });
        
        // Filtros
        document.getElementById('filter-carrera').addEventListener('change', (e) => {
            this.filters.carrera = e.target.value;
        });
        
        document.getElementById('filter-escuela').addEventListener('change', (e) => {
            this.filters.escuela = e.target.value;
        });
        
        document.getElementById('filter-municipio').addEventListener('change', (e) => {
            this.filters.municipio = e.target.value;
        });
        
        document.getElementById('filter-fecha').addEventListener('change', (e) => {
            this.filters.fecha = e.target.value;
        });
        
        // Botones de filtros
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.currentPage = 1;
            this.aplicarFiltros();
            this.actualizarTabla();
            this.mostrarNotificacion('Filtros aplicados', 'success');
        });
        
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetearFiltros();
        });
        
        // Ordenamiento
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.currentTarget.dataset.sort;
                
                if (this.sortField === field) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortField = field;
                    this.sortDirection = 'asc';
                }
                
                // Actualizar iconos
                document.querySelectorAll('.sort-btn i').forEach(icon => {
                    icon.className = 'fas fa-sort';
                });
                
                const icon = e.currentTarget.querySelector('i');
                icon.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
                
                this.aplicarFiltros();
                this.actualizarTabla();
            });
        });
        
        // Selección de filas
        document.getElementById('select-all').addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const checkboxes = document.querySelectorAll('.row-select');
            
            checkboxes.forEach(cb => {
                cb.checked = isChecked;
                const id = parseInt(cb.dataset.id);
                
                if (isChecked) {
                    this.selectedIds.add(id);
                } else {
                    this.selectedIds.delete(id);
                }
            });
            
            this.actualizarSeleccion();
            this.actualizarTabla();
        });
        
        // Paginación
        document.getElementById('first-page').addEventListener('click', () => {
            this.currentPage = 1;
            this.actualizarTabla();
        });
        
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.actualizarTabla();
            }
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredRegistros.length / this.rowsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.actualizarTabla();
            }
        });
        
        document.getElementById('last-page').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredRegistros.length / this.rowsPerPage);
            this.currentPage = totalPages;
            this.actualizarTabla();
        });
        
        // Cambiar filas por página
        document.getElementById('rows-per-page').addEventListener('change', (e) => {
            this.rowsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.actualizarTabla();
        });
        
        // Delegación de eventos para acciones en tabla
        document.getElementById('registros-body').addEventListener('click', (e) => {
            const target = e.target.closest('.action-icon');
            if (!target) return;
            
            const id = parseInt(target.dataset.id);
            const action = target.classList[1]; // view, edit, delete
            
            switch(action) {
                case 'view':
                    this.mostrarDetalles(id);
                    break;
                case 'edit':
                    this.editarRegistro(id);
                    break;
                case 'delete':
                    this.eliminarRegistro(id);
                    break;
            }
        });
        
        // Delegación para selección de filas
        document.getElementById('registros-body').addEventListener('change', (e) => {
            if (e.target.classList.contains('row-select')) {
                const id = parseInt(e.target.dataset.id);
                
                if (e.target.checked) {
                    this.selectedIds.add(id);
                } else {
                    this.selectedIds.delete(id);
                    document.getElementById('select-all').checked = false;
                }
                
                this.actualizarSeleccion();
            }
        });
        
        // Delegación para números de página
        document.getElementById('page-numbers').addEventListener('click', (e) => {
            if (e.target.classList.contains('page-number')) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.actualizarTabla();
            }
        });
        
        // Acciones masivas
        document.getElementById('bulk-export').addEventListener('click', () => {
            this.exportarSeleccionados();
        });
        
        document.getElementById('bulk-delete').addEventListener('click', () => {
            this.eliminarSeleccionados();
        });
        
        document.getElementById('clear-selection').addEventListener('click', () => {
            this.limpiarSeleccion();
        });
        
        // Exportación
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportarCSV();
        });
        
        document.getElementById('export-pdf').addEventListener('click', () => {
            this.exportarPDF();
        });
        
        // Actualizar datos
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.cargarDatos();
            this.mostrarNotificacion('Datos actualizados', 'success');
        });
        
        // Backup
        document.getElementById('backup-data').addEventListener('click', () => {
            this.crearBackup();
        });
        
        // Imprimir
        document.getElementById('print-table').addEventListener('click', () => {
            window.print();
        });
        
        // Modales
        document.getElementById('close-modal').addEventListener('click', () => {
            this.cerrarModal('details-modal');
        });
        
        document.getElementById('close-details').addEventListener('click', () => {
            this.cerrarModal('details-modal');
        });
        
        document.getElementById('close-confirm').addEventListener('click', () => {
            this.cerrarModal('confirm-modal');
        });
        
        document.getElementById('cancel-action').addEventListener('click', () => {
            this.cerrarModal('confirm-modal');
        });
        
        // Cerrar modales al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModal(modal.id);
                }
            });
        });
    }
    
    actualizarSeleccion() {
        const selectedCount = this.selectedIds.size;
        const bulkPanel = document.getElementById('bulk-actions');
        
        if (selectedCount > 0) {
            document.getElementById('selected-count').textContent = selectedCount;
            bulkPanel.style.display = 'flex';
            bulkPanel.style.animation = 'slideDown 0.3s ease';
        } else {
            bulkPanel.style.display = 'none';
            document.getElementById('select-all').checked = false;
        }
    }
    
    limpiarSeleccion() {
        this.selectedIds.clear();
        document.querySelectorAll('.row-select').forEach(cb => {
            cb.checked = false;
        });
        document.getElementById('select-all').checked = false;
        this.actualizarSeleccion();
        this.actualizarTabla();
    }
    
    resetearFiltros() {
        this.filters = {
            search: '',
            carrera: '',
            escuela: '',
            municipio: '',
            fecha: 'all'
        };
        
        document.getElementById('global-search').value = '';
        document.getElementById('filter-carrera').value = '';
        document.getElementById('filter-escuela').value = '';
        document.getElementById('filter-municipio').value = '';
        document.getElementById('filter-fecha').value = 'all';
        
        this.currentPage = 1;
        this.aplicarFiltros();
        this.actualizarTabla();
        this.actualizarOpcionesFiltros();
        
        this.mostrarNotificacion('Filtros limpiados', 'info');
    }
    
    mostrarDetalles(id) {
        const registro = this.registros.find(r => r.id === id);
        if (!registro) return;
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="details-grid">
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="fas fa-id-card"></i> ID
                    </div>
                    <div class="detail-value">${registro.id}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="fas fa-user"></i> Nombre
                    </div>
                    <div class="detail-value">${registro.nombre || 'No especificado'}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="fas fa-graduation-cap"></i> Carrera
                    </div>
                    <div class="detail-value">${registro.carrera || 'No especificada'}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="fas fa-school"></i> Escuela
                    </div>
                    <div class="detail-value">
                        ${registro.escuela || 'No especificada'}
                        ${registro.tipoEscuela ? `(${registro.tipoEscuela})` : ''}
                    </div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="fas fa-map-marker-alt"></i> Ubicación
                    </div>
                    <div class="detail-value">
                        ${registro.municipio || 'No especificado'}, 
                        ${registro.estado || 'No especificado'}
                    </div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="fas fa-venus-mars"></i> Género
                    </div>
                    <div class="detail-value">${registro.genero || 'No especificado'}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="fas fa-calendar-alt"></i> Fecha de Registro
                    </div>
                    <div class="detail-value">${this.formatearFechaCompleta(registro.fechaRegistro)}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">
                        <i class="fas fa-clock"></i> Última Actualización
                    </div>
                    <div class="detail-value">${this.formatearFechaCompleta(registro.timestamp)}</div>
                </div>
            </div>
            
            ${registro.latitud && registro.longitud ? `
                <div class="map-preview">
                    <h4><i class="fas fa-map-pin"></i> Ubicación Geográfica</h4>
                    <div class="coords">
                        Latitud: ${registro.latitud.toFixed(6)} | Longitud: ${registro.longitud.toFixed(6)}
                    </div>
                </div>
            ` : ''}
        `;
        
        this.abrirModal('details-modal');
    }
    
    editarRegistro(id) {
        // Verificar permisos
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser?.role === 'asesor') {
            this.mostrarNotificacion('No tienes permisos para editar registros', 'warning');
            return;
        }
        
        // Redirigir al formulario con el ID para edición
        localStorage.setItem('editRecordId', id);
        window.location.href = 'formulario.html?edit=' + id;
    }
    
    eliminarRegistro(id) {
        // Verificar permisos
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser?.role === 'asesor') {
            this.mostrarNotificacion('No tienes permisos para eliminar registros', 'warning');
            return;
        }
        
        const registro = this.registros.find(r => r.id === id);
        if (!registro) return;
        
        const confirmBody = document.getElementById('confirm-body');
        confirmBody.innerHTML = `
            <p>¿Estás seguro de que deseas eliminar el registro de <strong>${registro.nombre}</strong>?</p>
            <p>Esta acción no se puede deshacer.</p>
            <div class="delete-info">
                <p><i class="fas fa-exclamation-circle"></i> Se eliminarán todos los datos asociados</p>
            </div>
        `;
        
        document.getElementById('confirm-action').onclick = () => {
            this.eliminarRegistroConfirmado(id);
            this.cerrarModal('confirm-modal');
        };
        
        this.abrirModal('confirm-modal');
    }
    
    eliminarRegistroConfirmado(id) {
        this.registros = this.registros.filter(r => r.id !== id);
        this.selectedIds.delete(id);
        
        localStorage.setItem('gtuRegistros', JSON.stringify(this.registros));
        localStorage.setItem('gtuUltimaActualizacion', new Date().toISOString());
        
        this.aplicarFiltros();
        this.actualizarTabla();
        this.actualizarEstadisticas();
        
        this.mostrarNotificacion('Registro eliminado exitosamente', 'success');
    }
    
    eliminarSeleccionados() {
        // Verificar permisos
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser?.role === 'asesor') {
            this.mostrarNotificacion('No tienes permisos para eliminar registros', 'warning');
            return;
        }
        
        if (this.selectedIds.size === 0) return;
        
        const confirmBody = document.getElementById('confirm-body');
        confirmBody.innerHTML = `
            <p>¿Estás seguro de que deseas eliminar <strong>${this.selectedIds.size}</strong> registros?</p>
            <p>Esta acción no se puede deshacer.</p>
            <div class="delete-info">
                <p><i class="fas fa-exclamation-circle"></i> Se eliminarán todos los datos seleccionados</p>
            </div>
        `;
        
        document.getElementById('confirm-action').onclick = () => {
            this.eliminarSeleccionadosConfirmado();
            this.cerrarModal('confirm-modal');
        };
        
        this.abrirModal('confirm-modal');
    }
    
    eliminarSeleccionadosConfirmado() {
        this.registros = this.registros.filter(r => !this.selectedIds.has(r.id));
        this.selectedIds.clear();
        
        localStorage.setItem('gtuRegistros', JSON.stringify(this.registros));
        localStorage.setItem('gtuUltimaActualizacion', new Date().toISOString());
        
        this.aplicarFiltros();
        this.actualizarTabla();
        this.actualizarEstadisticas();
        this.actualizarSeleccion();
        
        this.mostrarNotificacion(`${this.selectedIds.size} registros eliminados`, 'success');
    }
    
    exportarSeleccionados() {
        if (this.selectedIds.size === 0) {
            this.mostrarNotificacion('No hay registros seleccionados para exportar', 'warning');
            return;
        }
        
        const registrosSeleccionados = this.registros.filter(r => this.selectedIds.has(r.id));
        this.exportarDatos(registrosSeleccionados, 'registros-seleccionados');
    }
    
    exportarCSV() {
        const datos = this.filters.search || 
                     this.filters.carrera || 
                     this.filters.escuela || 
                     this.filters.municipio || 
                     this.filters.fecha !== 'all' 
                     ? this.filteredRegistros 
                     : this.registros;
        
        if (datos.length === 0) {
            this.mostrarNotificacion('No hay datos para exportar', 'warning');
            return;
        }
        
        this.exportarDatos(datos, 'registros-completos', 'csv');
    }
    
    exportarPDF() {
        this.mostrarNotificacion('Exportación PDF en desarrollo', 'info');
        // Implementar generación de PDF
    }
    
    exportarDatos(datos, nombreArchivo, tipo = 'json') {
        const datosExportar = {
            fechaExportacion: new Date().toISOString(),
            totalRegistros: datos.length,
            registros: datos,
            filtrosAplicados: this.filters
        };
        
        let contenido, tipoMIME, extension;
        
        if (tipo === 'csv') {
            // Convertir a CSV
            const headers = ['ID', 'Nombre', 'Escuela', 'Carrera', 'Municipio', 'Género', 'Fecha Registro'];
            const rows = datos.map(r => [
                r.id,
                `"${r.nombre || ''}"`,
                `"${r.escuela || ''}"`,
                `"${r.carrera || ''}"`,
                `"${r.municipio || ''}"`,
                `"${r.genero || ''}"`,
                `"${this.formatearFecha(r.fechaRegistro)}"`
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');
            
            contenido = csvContent;
            tipoMIME = 'text/csv';
            extension = 'csv';
        } else {
            contenido = JSON.stringify(datosExportar, null, 2);
            tipoMIME = 'application/json';
            extension = 'json';
        }
        
        const blob = new Blob([contenido], { type: tipoMIME });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion(`Datos exportados (${datos.length} registros)`, 'success');
    }
    
    crearBackup() {
        const backupData = {
            fechaBackup: new Date().toISOString(),
            totalRegistros: this.registros.length,
            registros: this.registros,
            usuario: AuthSystem.getCurrentUser()?.name || 'Sistema'
        };
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-gtu-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion('Backup creado exitosamente', 'success');
    }
    
    abrirModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    cerrarModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
    
    formatearFecha(fechaString) {
        if (!fechaString) return 'No disponible';
        
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    }
    
    formatearFechaCompleta(fechaString) {
        if (!fechaString) return 'No disponible';
        
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha inválida';
        }
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `registros-notification ${tipo}`;
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
    
    actualizarUI() {
        this.actualizarEstadisticas();
        this.actualizarTabla();
    }
}

// Inicializar sistema de registros
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    window.registrosGTU = new RegistrosGTU();
});