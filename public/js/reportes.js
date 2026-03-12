// Sistema de Reportes GTU - Con datos reales del formulario
class ReportesGTU {
    constructor() {
        this.registros = [];
        this.reportesGuardados = [];
        this.filtrosActuales = {};
        this.init();
    }
    
    init() {
        this.cargarDatos();
        this.cargarReportesGuardados();
        this.configurarEventos();
        this.actualizarUI();
        this.actualizarUsuarioInfo();
        
        // Verificar datos cada 5 segundos
        setInterval(() => this.cargarDatos(), 5000);
    }
    
    cargarDatos() {
        // Cargar datos REALES del formulario
        const datosGuardados = localStorage.getItem('gtuRegistros');
        
        if (datosGuardados) {
            this.registros = JSON.parse(datosGuardados);
            console.log(`Cargados ${this.registros.length} registros para reportes`);
            
            // Actualizar filtros con datos reales
            this.actualizarOpcionesFiltros();
            
            // Mostrar sección de reportes si hay datos
            this.mostrarEstadoDatos();
        } else {
            this.registros = [];
        }
    }
    
    cargarReportesGuardados() {
        const reportesGuardados = localStorage.getItem('gtuReportesGuardados');
        
        if (reportesGuardados) {
            this.reportesGuardados = JSON.parse(reportesGuardados);
        } else {
            this.reportesGuardados = [];
        }
        
        this.actualizarGridReportes();
    }
    
    mostrarEstadoDatos() {
        const tieneDatos = this.registros.length > 0;
        const emptyState = document.getElementById('empty-state-main');
        const reportsSection = document.getElementById('reports-section');
        
        if (emptyState) emptyState.style.display = tieneDatos ? 'none' : 'flex';
        if (reportsSection) reportsSection.style.display = tieneDatos ? 'block' : 'none';
        
        if (tieneDatos) {
            this.actualizarEstadisticas();
        }
    }
    
    actualizarEstadisticas() {
        // Calcular estadísticas básicas
        const totalEstudiantes = this.registros.length;
        
        // Escuelas únicas
        const escuelasUnicas = new Set(
            this.registros.map(r => r.escuela).filter(e => e && e !== 'No especificada')
        ).size;
        
        // Carreras únicas
        const carrerasUnicas = new Set(
            this.registros.map(r => r.carrera).filter(c => c && c !== 'No especificada')
        ).size;
        
        // Ubicaciones únicas
        const ubicacionesUnicas = new Set(
            this.registros.map(r => `${r.municipio || r.ciudad || ''}, ${r.estado || ''}`)
                .filter(u => u && u !== ', ')
        ).size;
        
        // Actualizar UI
        document.getElementById('stat-total').textContent = totalEstudiantes;
        document.getElementById('stat-escuelas').textContent = escuelasUnicas;
        document.getElementById('stat-carreras').textContent = carrerasUnicas;
        document.getElementById('stat-ubicaciones').textContent = ubicacionesUnicas;
        document.getElementById('total-reports').textContent = this.reportesGuardados.length;
    }
    
    actualizarOpcionesFiltros() {
        // Cargar opciones de carrera
        const carreras = [...new Set(
            this.registros.map(r => r.carrera).filter(c => c && c !== 'No especificada')
        )];
        
        const carreraFilter = document.getElementById('carrera-filter');
        if (carreraFilter) {
            carreraFilter.innerHTML = `
                <option value="">Todas las carreras</option>
                ${carreras.map(c => `<option value="${c}">${c}</option>`).join('')}
            `;
        }
        
        // Cargar opciones de escuela
        const escuelas = [...new Set(
            this.registros.map(r => r.escuela).filter(e => e && e !== 'No especificada')
        )];
        
        const escuelaFilter = document.getElementById('escuela-filter');
        if (escuelaFilter) {
            escuelaFilter.innerHTML = `
                <option value="">Todas las escuelas</option>
                ${escuelas.map(e => `<option value="${e}">${e}</option>`).join('')}
            `;
        }
        
        // Cargar opciones de ubicación
        const ubicaciones = [...new Set(
            this.registros.map(r => r.estado || r.departamento || '')
                .filter(u => u && u !== 'No especificado')
        )];
        
        const ubicacionFilter = document.getElementById('ubicacion-filter');
        if (ubicacionFilter) {
            ubicacionFilter.innerHTML = `
                <option value="">Todas las ubicaciones</option>
                ${ubicaciones.map(u => `<option value="${u}">${u}</option>`).join('')}
            `;
        }
    }
    
    configurarEventos() {
        // Generar reporte
        document.getElementById('generate-report')?.addEventListener('click', () => {
            this.generarReporte();
        });
        
        // Exportar reporte
        document.getElementById('export-report')?.addEventListener('click', () => {
            this.exportarReporte();
        });
        
        // Imprimir reporte
        document.getElementById('print-report')?.addEventListener('click', () => {
            this.imprimirReporte();
        });
        
        // Refrescar reportes
        document.getElementById('refresh-reports')?.addEventListener('click', () => {
            this.refrescarDatos();
        });
        
        // Cambio en tipo de reporte
        document.getElementById('report-type')?.addEventListener('change', (e) => {
            this.actualizarFiltrosPorTipo(e.target.value);
        });
        
        // Cambio en rango de fechas
        document.getElementById('date-range')?.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                this.mostrarSelectorFechasPersonalizado();
            }
        });
    }
    
    actualizarFiltrosPorTipo(tipo) {
        // Habilitar/deshabilitar filtros según el tipo de reporte
        const filtrosAvanzados = document.querySelector('.advanced-filters');
        
        switch(tipo) {
            case 'general':
                filtrosAvanzados.style.opacity = '1';
                filtrosAvanzados.style.pointerEvents = 'all';
                break;
                
            case 'academico':
                // Resaltar filtros académicos
                document.getElementById('carrera-filter').parentElement.style.border = '2px solid #3498db';
                document.getElementById('escuela-filter').parentElement.style.border = '2px solid #3498db';
                break;
                
            case 'geografico':
                // Resaltar filtros geográficos
                document.getElementById('ubicacion-filter').parentElement.style.border = '2px solid #2ecc71';
                break;
                
            case 'tendencia':
                // Resaltar filtro de fechas
                document.getElementById('date-range').parentElement.style.border = '2px solid #e74c3c';
                break;
        }
    }
    
    generarReporte() {
        if (this.registros.length === 0) {
            this.mostrarNotificacion('No hay datos para generar el reporte', 'warning');
            return;
        }
        
        // Obtener filtros actuales
        this.obtenerFiltros();
        
        // Filtrar registros
        const registrosFiltrados = this.filtrarRegistros();
        
        if (registrosFiltrados.length === 0) {
            this.mostrarNotificacion('No hay datos que coincidan con los filtros', 'warning');
            return;
        }
        
        // Generar reporte según tipo
        const tipoReporte = document.getElementById('report-type').value;
        let contenidoReporte;
        
        switch(tipoReporte) {
            case 'general':
                contenidoReporte = this.generarReporteGeneral(registrosFiltrados);
                break;
                
            case 'academico':
                contenidoReporte = this.generarReporteAcademico(registrosFiltrados);
                break;
                
            case 'geografico':
                contenidoReporte = this.generarReporteGeografico(registrosFiltrados);
                break;
                
            case 'tendencia':
                contenidoReporte = this.generarReporteTendencia(registrosFiltrados);
                break;
                
            case 'personalizado':
                contenidoReporte = this.generarReportePersonalizado(registrosFiltrados);
                break;
                
            default:
                contenidoReporte = this.generarReporteGeneral(registrosFiltrados);
        }
        
        // Mostrar reporte
        this.mostrarReporte(contenidoReporte);
        
        // Guardar reporte
        this.guardarReporte(contenidoReporte, tipoReporte, registrosFiltrados.length);
        
        this.mostrarNotificacion('Reporte generado exitosamente', 'success');
    }
    
    obtenerFiltros() {
        this.filtrosActuales = {
            tipo: document.getElementById('report-type').value,
            rangoFechas: document.getElementById('date-range').value,
            formato: document.getElementById('format').value,
            carrera: document.getElementById('carrera-filter').value,
            escuela: document.getElementById('escuela-filter').value,
            genero: document.getElementById('genero-filter').value,
            ubicacion: document.getElementById('ubicacion-filter').value
        };
    }
    
    filtrarRegistros() {
        let registrosFiltrados = [...this.registros];
        
        // Filtrar por carrera
        if (this.filtrosActuales.carrera) {
            registrosFiltrados = registrosFiltrados.filter(r => 
                r.carrera === this.filtrosActuales.carrera
            );
        }
        
        // Filtrar por escuela
        if (this.filtrosActuales.escuela) {
            registrosFiltrados = registrosFiltrados.filter(r => 
                r.escuela === this.filtrosActuales.escuela
            );
        }
        
        // Filtrar por género
        if (this.filtrosActuales.genero) {
            registrosFiltrados = registrosFiltrados.filter(r => 
                r.genero === this.filtrosActuales.genero
            );
        }
        
        // Filtrar por ubicación
        if (this.filtrosActuales.ubicacion) {
            registrosFiltrados = registrosFiltrados.filter(r => 
                r.estado === this.filtrosActuales.ubicacion || 
                r.departamento === this.filtrosActuales.ubicacion
            );
        }
        
        // Filtrar por fecha
        if (this.filtrosActuales.rangoFechas && this.filtrosActuales.rangoFechas !== 'all') {
            const fechaLimite = this.obtenerFechaLimite(this.filtrosActuales.rangoFechas);
            registrosFiltrados = registrosFiltrados.filter(r => {
                if (!r.fechaRegistro) return true;
                const fechaRegistro = new Date(r.fechaRegistro);
                return fechaRegistro >= fechaLimite;
            });
        }
        
        return registrosFiltrados;
    }
    
    obtenerFechaLimite(rango) {
        const ahora = new Date();
        const fechaLimite = new Date();
        
        switch(rango) {
            case 'today':
                fechaLimite.setHours(0, 0, 0, 0);
                break;
                
            case 'week':
                fechaLimite.setDate(ahora.getDate() - 7);
                break;
                
            case 'month':
                fechaLimite.setMonth(ahora.getMonth() - 1);
                break;
                
            case 'quarter':
                fechaLimite.setMonth(ahora.getMonth() - 3);
                break;
                
            default:
                return new Date(0); // Todas las fechas
        }
        
        return fechaLimite;
    }
    
    generarReporteGeneral(registros) {
        const total = registros.length;
        const fecha = new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Calcular estadísticas
        const porGenero = this.calcularPorGenero(registros);
        const porCarrera = this.calcularPorCarrera(registros);
        const porEscuela = this.calcularPorEscuela(registros);
        const porUbicacion = this.calcularPorUbicacion(registros);
        
        return `
            <div class="report-content">
                <div class="report-header">
                    <h2>Reporte General GTU</h2>
                    <div class="report-meta">
                        <p>Generado: ${fecha}</p>
                        <p>Total de registros: ${total}</p>
                        <p>Filtros aplicados: ${this.obtenerTextoFiltros()}</p>
                    </div>
                </div>
                
                <div class="report-summary">
                    <h3><i class="fas fa-chart-pie"></i> Resumen Ejecutivo</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <h4>Total Estudiantes</h4>
                            <div class="value">${total}</div>
                        </div>
                        <div class="summary-item">
                            <h4>Por Género</h4>
                            <div class="value">${porGenero.Masculino || 0}M / ${porGenero.Femenino || 0}F</div>
                        </div>
                        <div class="summary-item">
                            <h4>Carreras Únicas</h4>
                            <div class="value">${Object.keys(porCarrera).length}</div>
                        </div>
                        <div class="summary-item">
                            <h4>Escuelas Únicas</h4>
                            <div class="value">${Object.keys(porEscuela).length}</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-graduation-cap"></i> Distribución por Carrera</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Carrera</th>
                                <th>Estudiantes</th>
                                <th>Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generarFilasTabla(porCarrera, total)}
                        </tbody>
                    </table>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-school"></i> Distribución por Escuela</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Escuela</th>
                                <th>Estudiantes</th>
                                <th>Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generarFilasTabla(porEscuela, total)}
                        </tbody>
                    </table>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-map-marker-alt"></i> Distribución Geográfica</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Ubicación</th>
                                <th>Estudiantes</th>
                                <th>Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generarFilasTabla(porUbicacion, total)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    generarReporteAcademico(registros) {
        const total = registros.length;
        const porCarrera = this.calcularPorCarrera(registros);
        const porEscuela = this.calcularPorEscuela(registros);
        const carreraPorEscuela = this.calcularCarreraPorEscuela(registros);
        
        return `
            <div class="report-content">
                <div class="report-header">
                    <h2>Reporte Académico GTU</h2>
                    <div class="report-meta">
                        <p>Análisis de preferencias académicas</p>
                        <p>Total de registros: ${total}</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-trophy"></i> Top 5 Carreras Más Solicitadas</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Carrera</th>
                                <th>Estudiantes</th>
                                <th>Porcentaje</th>
                                <th>Tendencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generarFilasTopCarreras(porCarrera, total)}
                        </tbody>
                    </table>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-university"></i> Carreras por Escuela</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Escuela</th>
                                <th>Carrera Principal</th>
                                <th>Estudiantes</th>
                                <th>Otras Carreras</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generarFilasCarreraPorEscuela(carreraPorEscuela)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    generarReporteGeografico(registros) {
        const total = registros.length;
        const porUbicacion = this.calcularPorUbicacion(registros);
        const porMunicipio = this.calcularPorMunicipio(registros);
        
        return `
            <div class="report-content">
                <div class="report-header">
                    <h2>Reporte Geográfico GTU</h2>
                    <div class="report-meta">
                        <p>Análisis de distribución territorial</p>
                        <p>Total de registros: ${total}</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-globe-americas"></i> Distribución por Estado/Departamento</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Ubicación</th>
                                <th>Estudiantes</th>
                                <th>Porcentaje</th>
                                <th>Densidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generarFilasTablaConDensidad(porUbicacion, total)}
                        </tbody>
                    </table>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-city"></i> Distribución por Municipio</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Municipio</th>
                                <th>Estudiantes</th>
                                <th>Porcentaje</th>
                                <th>Carrera Principal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generarFilasPorMunicipio(porMunicipio, total)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    generarReporteTendencia(registros) {
        const tendenciaMensual = this.calcularTendenciaMensual(registros);
        const tendenciaSemanal = this.calcularTendenciaSemanal(registros);
        
        return `
            <div class="report-content">
                <div class="report-header">
                    <h2>Reporte de Tendencia GTU</h2>
                    <div class="report-meta">
                        <p>Análisis de evolución temporal</p>
                        <p>Período: ${this.filtrosActuales.rangoFechas || 'Todo el período'}</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-chart-line"></i> Registros por Mes</h3>
                    <div class="chart-container">
                        <canvas id="tendenciaMensualChart"></canvas>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-calendar-week"></i> Registros por Semana</h3>
                    <div class="chart-container">
                        <canvas id="tendenciaSemanalChart"></canvas>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-analytics"></i> Métricas de Crecimiento</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Período</th>
                                <th>Registros</th>
                                <th>Crecimiento</th>
                                <th>Tasa de Crecimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generarFilasTendencia(tendenciaMensual)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    generarReportePersonalizado(registros) {
        const total = registros.length;
        
        return `
            <div class="report-content">
                <div class="report-header">
                    <h2>Reporte Personalizado GTU</h2>
                    <div class="report-meta">
                        <p>Configuración personalizada</p>
                        <p>Total de registros: ${total}</p>
                        <p>Filtros: ${this.obtenerTextoFiltros()}</p>
                    </div>
                </div>
                
                <div class="report-section">
                    <h3><i class="fas fa-list"></i> Datos Crudos (Primeros 50 registros)</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Escuela</th>
                                <th>Carrera</th>
                                <th>Ubicación</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${registros.slice(0, 50).map(registro => `
                                <tr>
                                    <td>${registro.nombre || 'N/A'}</td>
                                    <td>${registro.escuela || 'N/A'}</td>
                                    <td>${registro.carrera || 'N/A'}</td>
                                    <td>${registro.municipio || registro.ciudad || 'N/A'}, ${registro.estado || 'N/A'}</td>
                                    <td>${new Date(registro.fechaRegistro).toLocaleDateString('es-MX')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // Métodos de cálculo de estadísticas
    calcularPorGenero(registros) {
        const generos = { Masculino: 0, Femenino: 0, 'No especificado': 0 };
        registros.forEach(r => {
            const genero = r.genero || 'No especificado';
            generos[genero] = (generos[genero] || 0) + 1;
        });
        return generos;
    }
    
    calcularPorCarrera(registros) {
        const carreras = {};
        registros.forEach(r => {
            const carrera = r.carrera || 'No especificada';
            carreras[carrera] = (carreras[carrera] || 0) + 1;
        });
        return carreras;
    }
    
    calcularPorEscuela(registros) {
        const escuelas = {};
        registros.forEach(r => {
            const escuela = r.escuela || 'No especificada';
            escuelas[escuela] = (escuelas[escuela] || 0) + 1;
        });
        return escuelas;
    }
    
    calcularPorUbicacion(registros) {
        const ubicaciones = {};
        registros.forEach(r => {
            const ubicacion = r.estado || r.departamento || 'No especificada';
            ubicaciones[ubicacion] = (ubicaciones[ubicacion] || 0) + 1;
        });
        return ubicaciones;
    }
    
    calcularPorMunicipio(registros) {
        const municipios = {};
        registros.forEach(r => {
            const municipio = r.municipio || r.ciudad || 'No especificada';
            municipios[municipio] = (municipios[municipio] || 0) + 1;
        });
        return municipios;
    }
    
    calcularCarreraPorEscuela(registros) {
        const resultado = {};
        registros.forEach(r => {
            const escuela = r.escuela || 'No especificada';
            const carrera = r.carrera || 'No especificada';
            
            if (!resultado[escuela]) {
                resultado[escuela] = {
                    total: 0,
                    carreras: {}
                };
            }
            
            resultado[escuela].total++;
            resultado[escuela].carreras[carrera] = (resultado[escuela].carreras[carrera] || 0) + 1;
        });
        return resultado;
    }
    
    calcularTendenciaMensual(registros) {
        const meses = {};
        registros.forEach(r => {
            if (r.fechaRegistro) {
                const fecha = new Date(r.fechaRegistro);
                const mes = fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
                meses[mes] = (meses[mes] || 0) + 1;
            }
        });
        return meses;
    }
    
    calcularTendenciaSemanal(registros) {
        const semanas = {};
        registros.forEach(r => {
            if (r.fechaRegistro) {
                const fecha = new Date(r.fechaRegistro);
                const semana = `Semana ${Math.ceil(fecha.getDate() / 7)} - ${fecha.toLocaleDateString('es-MX', { month: 'short' })}`;
                semanas[semana] = (semanas[semana] || 0) + 1;
            }
        });
        return semanas;
    }
    
    // Métodos de generación de HTML
    generarFilasTabla(datos, total) {
        return Object.entries(datos)
            .sort((a, b) => b[1] - a[1])
            .map(([item, cantidad]) => {
                const porcentaje = ((cantidad / total) * 100).toFixed(1);
                return `
                    <tr>
                        <td>${item}</td>
                        <td>${cantidad}</td>
                        <td>${porcentaje}%</td>
                    </tr>
                `;
            }).join('');
    }
    
    generarFilasTopCarreras(carreras, total) {
        return Object.entries(carreras)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([carrera, cantidad], index) => {
                const porcentaje = ((cantidad / total) * 100).toFixed(1);
                const tendencia = index === 0 ? '📈' : '📊';
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${carrera}</td>
                        <td>${cantidad}</td>
                        <td>${porcentaje}%</td>
                        <td>${tendencia}</td>
                    </tr>
                `;
            }).join('');
    }
    
    generarFilasCarreraPorEscuela(datos) {
        return Object.entries(datos).map(([escuela, data]) => {
            const carreras = Object.entries(data.carreras)
                .sort((a, b) => b[1] - a[1]);
            const carreraPrincipal = carreras[0] || ['N/A', 0];
            const otrasCarreras = carreras.slice(1).length;
            
            return `
                <tr>
                    <td>${escuela}</td>
                    <td>${carreraPrincipal[0]} (${carreraPrincipal[1]})</td>
                    <td>${data.total}</td>
                    <td>${otrasCarreras} otras</td>
                </tr>
            `;
        }).join('');
    }
    
    generarFilasTablaConDensidad(datos, total) {
        return Object.entries(datos)
            .sort((a, b) => b[1] - a[1])
            .map(([ubicacion, cantidad]) => {
                const porcentaje = ((cantidad / total) * 100).toFixed(1);
                let densidad = '🟢 Baja';
                if (cantidad > 20) densidad = '🔴 Muy alta';
                else if (cantidad > 10) densidad = '🟠 Alta';
                else if (cantidad > 5) densidad = '🟡 Media';
                
                return `
                    <tr>
                        <td>${ubicacion}</td>
                        <td>${cantidad}</td>
                        <td>${porcentaje}%</td>
                        <td>${densidad}</td>
                    </tr>
                `;
            }).join('');
    }
    
    generarFilasPorMunicipio(municipios, total) {
        return Object.entries(municipios)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([municipio, cantidad]) => {
                const porcentaje = ((cantidad / total) * 100).toFixed(1);
                return `
                    <tr>
                        <td>${municipio}</td>
                        <td>${cantidad}</td>
                        <td>${porcentaje}%</td>
                        <td>Por analizar</td>
                    </tr>
                `;
            }).join('');
    }
    
    generarFilasTendencia(tendenciaMensual) {
        const meses = Object.entries(tendenciaMensual);
        return meses.map(([mes, cantidad], index) => {
            let crecimiento = '→';
            let tasa = '0%';
            
            if (index > 0) {
                const cantidadAnterior = meses[index - 1][1];
                const diferencia = cantidad - cantidadAnterior;
                crecimiento = diferencia > 0 ? '↗' : diferencia < 0 ? '↘' : '→';
                tasa = cantidadAnterior > 0 ? 
                    ((diferencia / cantidadAnterior) * 100).toFixed(1) + '%' : 'N/A';
            }
            
            return `
                <tr>
                    <td>${mes}</td>
                    <td>${cantidad}</td>
                    <td>${crecimiento}</td>
                    <td>${tasa}</td>
                </tr>
            `;
        }).join('');
    }
    
    obtenerTextoFiltros() {
        const filtros = [];
        if (this.filtrosActuales.carrera) filtros.push(`Carrera: ${this.filtrosActuales.carrera}`);
        if (this.filtrosActuales.escuela) filtros.push(`Escuela: ${this.filtrosActuales.escuela}`);
        if (this.filtrosActuales.genero) filtros.push(`Género: ${this.filtrosActuales.genero}`);
        if (this.filtrosActuales.ubicacion) filtros.push(`Ubicación: ${this.filtrosActuales.ubicacion}`);
        if (this.filtrosActuales.rangoFechas && this.filtrosActuales.rangoFechas !== 'all') 
            filtros.push(`Período: ${this.filtrosActuales.rangoFechas}`);
        
        return filtros.length > 0 ? filtros.join(', ') : 'Sin filtros';
    }
    
    mostrarReporte(contenido) {
        const reportContent = document.getElementById('report-content');
        if (reportContent) {
            reportContent.innerHTML = contenido;
            
            // Inicializar gráficos si existen
            setTimeout(() => {
                this.inicializarGraficos();
            }, 100);
        }
    }
    
    inicializarGraficos() {
        // Gráfico de tendencia mensual
        const ctxMensual = document.getElementById('tendenciaMensualChart');
        if (ctxMensual) {
            const tendenciaMensual = this.calcularTendenciaMensual(this.filtrarRegistros());
            const meses = Object.keys(tendenciaMensual);
            const valores = Object.values(tendenciaMensual);
            
            new Chart(ctxMensual.getContext('2d'), {
                type: 'line',
                data: {
                    labels: meses,
                    datasets: [{
                        label: 'Registros por mes',
                        data: valores,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
        
        // Gráfico de tendencia semanal
        const ctxSemanal = document.getElementById('tendenciaSemanalChart');
        if (ctxSemanal) {
            const tendenciaSemanal = this.calcularTendenciaSemanal(this.filtrarRegistros());
            const semanas = Object.keys(tendenciaSemanal);
            const valores = Object.values(tendenciaSemanal);
            
            new Chart(ctxSemanal.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: semanas,
                    datasets: [{
                        label: 'Registros por semana',
                        data: valores,
                        backgroundColor: 'rgba(46, 204, 113, 0.8)',
                        borderColor: 'rgb(46, 204, 113)',
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
    
    guardarReporte(contenido, tipo, totalRegistros) {
        const reporte = {
            id: Date.now(),
            tipo: tipo,
            contenido: contenido,
            totalRegistros: totalRegistros,
            fecha: new Date().toISOString(),
            filtros: this.filtrosActuales
        };
        
        this.reportesGuardados.unshift(reporte);
        
        // Limitar a 10 reportes guardados
        if (this.reportesGuardados.length > 10) {
            this.reportesGuardados.pop();
        }
        
        localStorage.setItem('gtuReportesGuardados', JSON.stringify(this.reportesGuardados));
        this.actualizarGridReportes();
    }
    
    actualizarGridReportes() {
        const grid = document.getElementById('saved-reports-grid');
        if (!grid) return;
        
        if (this.reportesGuardados.length === 0) {
            grid.innerHTML = `
                <div class="no-reports">
                    <i class="fas fa-file-alt"></i>
                    <p>No hay reportes guardados</p>
                    <small>Los reportes que generes aparecerán aquí</small>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.reportesGuardados.map(reporte => {
            const fecha = new Date(reporte.fecha).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            
            const iconos = {
                general: 'fas fa-chart-pie',
                academico: 'fas fa-graduation-cap',
                geografico: 'fas fa-map-marker-alt',
                tendencia: 'fas fa-chart-line',
                personalizado: 'fas fa-cogs'
            };
            
            return `
                <div class="report-card" data-id="${reporte.id}">
                    <div class="report-card-header">
                        <div>
                            <h4><i class="${iconos[reporte.tipo] || 'fas fa-file-alt'}"></i> ${this.getNombreReporte(reporte.tipo)}</h4>
                            <small>Generado: ${fecha}</small>
                        </div>
                        <span class="report-date">${reporte.totalRegistros} reg.</span>
                    </div>
                    <p class="report-desc">${this.getDescripcionReporte(reporte.tipo)}</p>
                    <div class="report-stats">
                        <div class="report-stat">
                            <span class="label">Tipo</span>
                            <span class="value">${reporte.tipo}</span>
                        </div>
                        <div class="report-stat">
                            <span class="label">Registros</span>
                            <span class="value">${reporte.totalRegistros}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Agregar eventos a las tarjetas
        document.querySelectorAll('.report-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.cargarReporteGuardado(id);
            });
        });
    }
    
    getNombreReporte(tipo) {
        const nombres = {
            general: 'Reporte General',
            academico: 'Reporte Académico',
            geografico: 'Reporte Geográfico',
            tendencia: 'Reporte de Tendencia',
            personalizado: 'Reporte Personalizado'
        };
        return nombres[tipo] || 'Reporte';
    }
    
    getDescripcionReporte(tipo) {
        const descripciones = {
            general: 'Estadísticas completas del sistema',
            academico: 'Análisis de preferencias académicas',
            geografico: 'Distribución territorial de estudiantes',
            tendencia: 'Evolución temporal de registros',
            personalizado: 'Configuración personalizada'
        };
        return descripciones[tipo] || 'Reporte del sistema GTU';
    }
    
    cargarReporteGuardado(id) {
        const reporte = this.reportesGuardados.find(r => r.id === id);
        if (reporte) {
            this.mostrarReporte(reporte.contenido);
            this.mostrarNotificacion('Reporte cargado exitosamente', 'success');
        }
    }
    
    exportarReporte() {
        const formato = document.getElementById('format').value;
        const contenido = document.getElementById('report-content').innerText;
        
        switch(formato) {
            case 'pdf':
                this.exportarPDF();
                break;
                
            case 'excel':
                this.exportarExcel();
                break;
                
            case 'json':
                this.exportarJSON();
                break;
                
            default:
                this.mostrarNotificacion('El reporte está listo en la vista web', 'info');
        }
    }
    
    exportarPDF() {
        // En un sistema real, aquí iría la lógica para generar PDF
        this.mostrarNotificacion('Función de PDF en desarrollo', 'info');
    }
    
    exportarExcel() {
        const registros = this.filtrarRegistros();
        const headers = ['Nombre', 'Escuela', 'Carrera', 'Ubicación', 'Género', 'Fecha'];
        const rows = registros.map(r => [
            r.nombre || '',
            r.escuela || '',
            r.carrera || '',
            `${r.municipio || ''}, ${r.estado || ''}`,
            r.genero || '',
            new Date(r.fechaRegistro).toLocaleDateString('es-MX')
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-gtu-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion('Reporte exportado a Excel', 'success');
    }
    
    exportarJSON() {
        const datos = {
            fechaExportacion: new Date().toISOString(),
            totalRegistros: this.registros.length,
            filtros: this.filtrosActuales,
            registros: this.filtrarRegistros().slice(0, 100) // Limitar para archivo manejable
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-gtu-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion('Reporte exportado a JSON', 'success');
    }
    
    imprimirReporte() {
        window.print();
    }
    
    refrescarDatos() {
        this.cargarDatos();
        this.actualizarUI();
        this.actualizarFecha();
        this.mostrarNotificacion('Datos actualizados', 'success');
    }
    
    actualizarUI() {
        this.actualizarEstadisticas();
        this.mostrarEstadoDatos();
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
            
            // Aplicar restricciones según rol
            if (currentUser.role === 'asesor') {
                document.querySelectorAll('#generate-report, #export-report').forEach(btn => {
                    btn.style.display = 'none';
                });
            }
        }
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `report-notification ${tipo}`;
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

// Inicializar sistema de reportes
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay usuario autenticado
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    window.reportesGTU = new ReportesGTU();
});