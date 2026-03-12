// Sistema de Filtros Avanzados GTU
class FiltrosGTU {
    constructor() {
        this.registros = [];
        this.filtrosAplicados = {};
        this.presetsGuardados = {};
        this.init();
    }
    
    init() {
        this.cargarDatos();
        this.cargarPresets();
        this.configurarEventos();
        this.actualizarOpcionesFiltros();
        this.actualizarUsuarioInfo();
    }
    
    cargarDatos() {
        // Cargar datos REALES del formulario
        const datosGuardados = localStorage.getItem('gtuRegistros');
        
        if (datosGuardados) {
            this.registros = JSON.parse(datosGuardados);
            console.log(`Cargados ${this.registros.length} registros para filtrado`);
        } else {
            this.registros = [];
            console.log('No hay registros para filtrar');
        }
        
        this.actualizarVistaPrevia();
        this.actualizarEstadisticas();
    }
    
    cargarPresets() {
        // Cargar presets guardados
        const presets = localStorage.getItem('gtuFiltrosPresets');
        if (presets) {
            this.presetsGuardados = JSON.parse(presets);
            this.actualizarListaPresets();
        }
    }
    
    configurarEventos() {
        // Filtros rápidos
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.id === 'clear-all-filters') {
                    this.limpiarTodosFiltros();
                } else {
                    const filtro = e.target.closest('.quick-filter-btn').dataset.filter;
                    this.aplicarFiltroRapido(filtro);
                }
            });
        });
        
        // Toggle filtros avanzados
        document.querySelectorAll('.toggle-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.filter-card');
                card.classList.toggle('active');
            });
        });
        
        // Preset de fechas
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.aplicarPresetFechas(preset);
            });
        });
        
        // Búsqueda de escuela
        document.querySelector('.search-btn').addEventListener('click', () => {
            this.buscarEscuela();
        });
        
        document.getElementById('escuela-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.buscarEscuela();
            }
        });
        
        // Tags de carreras
        document.getElementById('carrera-tags').addEventListener('click', (e) => {
            if (e.target.classList.contains('carrera-tag')) {
                e.target.classList.toggle('active');
                this.actualizarFiltroCarrera();
            }
        });
        
        // Botones de acción
        document.getElementById('apply-filters-btn').addEventListener('click', () => {
            this.aplicarFiltrosAvanzados();
        });
        
        document.getElementById('reset-filters-btn').addEventListener('click', () => {
            this.limpiarTodosFiltros();
        });
        
        document.getElementById('export-results-btn').addEventListener('click', () => {
            this.exportarResultados();
        });
        
        document.getElementById('save-preset-btn').addEventListener('click', () => {
            this.mostrarFormularioPreset();
        });
        
        document.getElementById('save-preset-confirm').addEventListener('click', () => {
            this.guardarPreset();
        });
        
        document.getElementById('cancel-preset').addEventListener('click', () => {
            this.ocultarFormularioPreset();
        });
        
        // Eliminar filtros aplicados
        document.getElementById('applied-tags').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-filter')) {
                const filtro = e.target.dataset.filter;
                this.eliminarFiltro(filtro);
            }
        });
        
        // Cargar datos cada 5 segundos
        setInterval(() => this.cargarDatos(), 5000);
    }
    
    actualizarOpcionesFiltros() {
        // Actualizar opciones de filtros basadas en datos reales
        this.actualizarOpcionesEscuelas();
        this.actualizarOpcionesCarreras();
        this.actualizarOpcionesMunicipios();
        this.actualizarTagsCarreras();
    }
    
    actualizarOpcionesEscuelas() {
        const select = document.getElementById('escuela-filter');
        const escuelasSet = new Set();
        
        this.registros.forEach(registro => {
            if (registro.escuela && registro.escuela !== 'No especificada') {
                escuelasSet.add(registro.escuela);
            }
        });
        
        const opciones = Array.from(escuelasSet).sort();
        
        select.innerHTML = `
            <option value="">Todas las escuelas</option>
            ${opciones.map(escuela => 
                `<option value="${escuela}">${escuela}</option>`
            ).join('')}
        `;
    }
    
    actualizarOpcionesCarreras() {
        const select = document.getElementById('carrera-filter');
        const carrerasSet = new Set();
        
        this.registros.forEach(registro => {
            if (registro.carrera && registro.carrera !== 'No especificada') {
                carrerasSet.add(registro.carrera);
            }
        });
        
        const opciones = Array.from(carrerasSet).sort();
        
        select.innerHTML = `
            <option value="">Todas las carreras</option>
            ${opciones.map(carrera => 
                `<option value="${carrera}">${carrera}</option>`
            ).join('')}
        `;
    }
    
    actualizarOpcionesMunicipios() {
        const select = document.getElementById('municipio-filter');
        const municipiosSet = new Set();
        
        this.registros.forEach(registro => {
            if (registro.municipio && registro.municipio !== 'No especificado') {
                municipiosSet.add(registro.municipio);
            } else if (registro.ciudad && registro.ciudad !== 'No especificado') {
                municipiosSet.add(registro.ciudad);
            }
        });
        
        const opciones = Array.from(municipiosSet).sort();
        
        select.innerHTML = `
            <option value="">Todos los municipios</option>
            ${opciones.map(municipio => 
                `<option value="${municipio}">${municipio}</option>`
            ).join('')}
        `;
    }
    
    actualizarTagsCarreras() {
        const container = document.getElementById('carrera-tags');
        const carrerasCount = {};
        
        // Contar carreras populares
        this.registros.forEach(registro => {
            if (registro.carrera && registro.carrera !== 'No especificada') {
                carrerasCount[registro.carrera] = (carrerasCount[registro.carrera] || 0) + 1;
            }
        });
        
        // Ordenar por frecuencia y tomar top 6
        const topCarreras = Object.entries(carrerasCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
        
        container.innerHTML = topCarreras.map(([carrera, count]) => `
            <span class="carrera-tag" data-carrera="${carrera}">
                ${carrera} <small>(${count})</small>
            </span>
        `).join('');
    }
    
    aplicarFiltroRapido(filtro) {
        // Limpiar filtros anteriores
        this.limpiarFiltrosFormulario();
        
        switch(filtro) {
            case 'hoy':
                this.aplicarPresetFechas('today');
                break;
                
            case 'semana':
                this.aplicarPresetFechas('last7');
                break;
                
            case 'mes':
                this.aplicarPresetFechas('last30');
                break;
                
            case 'queretaro':
                document.getElementById('estado-filter').value = 'Querétaro';
                break;
                
            case 'sistemas':
                const tag = document.querySelector('.carrera-tag[data-carrera*="Sistemas"]');
                if (tag) tag.classList.add('active');
                this.actualizarFiltroCarrera();
                break;
                
            case 'nacional':
                document.getElementById('tipo-escuela-filter').value = 'Nacional';
                break;
        }
        
        this.aplicarFiltrosAvanzados();
    }
    
    aplicarPresetFechas(preset) {
        const hoy = new Date();
        let inicio = new Date();
        let fin = new Date();
        
        switch(preset) {
            case 'today':
                inicio.setHours(0, 0, 0, 0);
                fin.setHours(23, 59, 59, 999);
                break;
                
            case 'yesterday':
                inicio.setDate(hoy.getDate() - 1);
                inicio.setHours(0, 0, 0, 0);
                fin.setDate(hoy.getDate() - 1);
                fin.setHours(23, 59, 59, 999);
                break;
                
            case 'last7':
                inicio.setDate(hoy.getDate() - 7);
                break;
                
            case 'last30':
                inicio.setDate(hoy.getDate() - 30);
                break;
                
            case 'thisMonth':
                inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                fin.setHours(23, 59, 59, 999);
                break;
        }
        
        // Formatear fechas para input type="date"
        document.getElementById('start-date').value = inicio.toISOString().split('T')[0];
        document.getElementById('end-date').value = fin.toISOString().split('T')[0];
        
        // Actualizar botones de preset
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.preset === preset) {
                btn.classList.add('active');
            }
        });
    }
    
    buscarEscuela() {
        const busqueda = document.getElementById('escuela-search').value.toLowerCase();
        const select = document.getElementById('escuela-filter');
        let encontrada = false;
        
        for (let option of select.options) {
            if (option.value.toLowerCase().includes(busqueda)) {
                select.value = option.value;
                encontrada = true;
                break;
            }
        }
        
        if (!encontrada && busqueda) {
            alert('No se encontró ninguna escuela con ese nombre');
        }
    }
    
    actualizarFiltroCarrera() {
        const tagsActivas = document.querySelectorAll('.carrera-tag.active');
        const carrerasSeleccionadas = Array.from(tagsActivas).map(tag => 
            tag.dataset.carrera.split(' ')[0] // Tomar solo el nombre sin el conteo
        );
        
        if (carrerasSeleccionadas.length > 0) {
            document.getElementById('carrera-filter').value = '';
        }
    }
    
    aplicarFiltrosAvanzados() {
        this.filtrosAplicados = {};
        
        // Filtro por fechas
        const inicio = document.getElementById('start-date').value;
        const fin = document.getElementById('end-date').value;
        
        if (inicio && fin) {
            this.filtrosAplicados.fechas = { inicio, fin };
        }
        
        // Filtro por ubicación
        const estado = document.getElementById('estado-filter').value;
        const municipio = document.getElementById('municipio-filter').value;
        const conUbicacion = document.getElementById('has-location').checked;
        
        if (estado) this.filtrosAplicados.estado = estado;
        if (municipio) this.filtrosAplicados.municipio = municipio;
        if (conUbicacion) this.filtrosAplicados.conUbicacion = true;
        
        // Filtro por escuela
        const escuela = document.getElementById('escuela-filter').value;
        const tipoEscuela = document.getElementById('tipo-escuela-filter').value;
        
        if (escuela) this.filtrosAplicados.escuela = escuela;
        if (tipoEscuela) this.filtrosAplicados.tipoEscuela = tipoEscuela;
        
        // Filtro por carrera
        const carrera = document.getElementById('carrera-filter').value;
        const area = document.getElementById('area-filter').value;
        const tagsActivas = document.querySelectorAll('.carrera-tag.active');
        const carrerasTags = Array.from(tagsActivas).map(tag => tag.dataset.carrera.split(' ')[0]);
        
        if (carrera) this.filtrosAplicados.carrera = carrera;
        if (area) this.filtrosAplicados.area = area;
        if (carrerasTags.length > 0) {
            this.filtrosAplicados.carrerasTags = carrerasTags;
        }
        
        // Filtro demográfico
        const genero = document.getElementById('genero-filter').value;
        const edadMin = document.getElementById('edad-min').value;
        const edadMax = document.getElementById('edad-max').value;
        
        if (genero) this.filtrosAplicados.genero = genero;
        if (edadMin) this.filtrosAplicados.edadMin = parseInt(edadMin);
        if (edadMax) this.filtrosAplicados.edadMax = parseInt(edadMax);
        
        // Aplicar filtros y actualizar vista
        this.filtrarRegistros();
        this.actualizarFiltrosAplicados();
        this.actualizarVistaPrevia();
        this.actualizarEstadisticas();
        
        this.mostrarNotificacion('Filtros aplicados correctamente', 'success');
    }
    
    filtrarRegistros() {
        let registrosFiltrados = [...this.registros];
        
        // Aplicar cada filtro
        if (this.filtrosAplicados.fechas) {
            const inicio = new Date(this.filtrosAplicados.fechas.inicio);
            const fin = new Date(this.filtrosAplicados.fechas.fin);
            fin.setHours(23, 59, 59, 999);
            
            registrosFiltrados = registrosFiltrados.filter(registro => {
                if (!registro.fechaRegistro) return false;
                const fechaReg = new Date(registro.fechaRegistro);
                return fechaReg >= inicio && fechaReg <= fin;
            });
        }
        
        if (this.filtrosAplicados.estado) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.estado === this.filtrosAplicados.estado ||
                registro.departamento === this.filtrosAplicados.estado
            );
        }
        
        if (this.filtrosAplicados.municipio) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.municipio === this.filtrosAplicados.municipio ||
                registro.ciudad === this.filtrosAplicados.municipio
            );
        }
        
        if (this.filtrosAplicados.conUbicacion) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.latitud && registro.longitud
            );
        }
        
        if (this.filtrosAplicados.escuela) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.escuela === this.filtrosAplicados.escuela
            );
        }
        
        if (this.filtrosAplicados.tipoEscuela) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.tipoEscuela === this.filtrosAplicados.tipoEscuela
            );
        }
        
        if (this.filtrosAplicados.carrera) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.carrera === this.filtrosAplicados.carrera
            );
        }
        
        if (this.filtrosAplicados.area) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                this.clasificarCarreraArea(registro.carrera) === this.filtrosAplicados.area
            );
        }
        
        if (this.filtrosAplicados.carrerasTags) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                this.filtrosAplicados.carrerasTags.some(tag => 
                    registro.carrera?.includes(tag)
                )
            );
        }
        
        if (this.filtrosAplicados.genero) {
            registrosFiltrados = registrosFiltrados.filter(registro => 
                registro.genero === this.filtrosAplicados.genero
            );
        }
        
        if (this.filtrosAplicados.edadMin || this.filtrosAplicados.edadMax) {
            // Nota: Los datos actuales no incluyen edad, esto es para futuras expansiones
            console.log('Filtro de edad configurado pero no aplicado (falta dato de edad)');
        }
        
        this.registrosFiltrados = registrosFiltrados;
        return registrosFiltrados;
    }
    
    clasificarCarreraArea(carrera) {
        if (!carrera) return 'Otros';
        
        carrera = carrera.toLowerCase();
        
        if (carrera.includes('ingeniería') || carrera.includes('sistemas') || 
            carrera.includes('civil') || carrera.includes('industrial')) {
            return 'Ingeniería';
        }
        
        if (carrera.includes('medicina') || carrera.includes('enfermería') || 
            carrera.includes('psicología') || carrera.includes('nutrición')) {
            return 'Ciencias de la Salud';
        }
        
        if (carrera.includes('derecho') || carrera.includes('sociología') || 
            carrera.includes('comunicación') || carrera.includes('educación')) {
            return 'Ciencias Sociales';
        }
        
        if (carrera.includes('administración') || carrera.includes('contabilidad') || 
            carrera.includes('economía') || carrera.includes('marketing')) {
            return 'Negocios';
        }
        
        if (carrera.includes('arquitectura') || carrera.includes('diseño') || 
            carrera.includes('arte') || carrera.includes('música')) {
            return 'Artes y Humanidades';
        }
        
        return 'Otros';
    }
    
    actualizarFiltrosAplicados() {
        const container = document.getElementById('applied-tags');
        
        if (Object.keys(this.filtrosAplicados).length === 0) {
            container.innerHTML = '<span class="no-filters">No hay filtros aplicados</span>';
            return;
        }
        
        const tags = [];
        
        if (this.filtrosAplicados.fechas) {
            tags.push(`
                <span class="filter-tag">
                    <i class="fas fa-calendar"></i>
                    ${this.filtrosAplicados.fechas.inicio} → ${this.filtrosAplicados.fechas.fin}
                    <button class="remove-filter" data-filter="fechas">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `);
        }
        
        if (this.filtrosAplicados.estado) {
            tags.push(`
                <span class="filter-tag">
                    <i class="fas fa-map-marker-alt"></i>
                    ${this.filtrosAplicados.estado}
                    <button class="remove-filter" data-filter="estado">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `);
        }
        
        if (this.filtrosAplicados.municipio) {
            tags.push(`
                <span class="filter-tag">
                    <i class="fas fa-city"></i>
                    ${this.filtrosAplicados.municipio}
                    <button class="remove-filter" data-filter="municipio">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `);
        }
        
        if (this.filtrosAplicados.escuela) {
            tags.push(`
                <span class="filter-tag">
                    <i class="fas fa-school"></i>
                    ${this.filtrosAplicados.escuela}
                    <button class="remove-filter" data-filter="escuela">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `);
        }
        
        if (this.filtrosAplicados.carrera) {
            tags.push(`
                <span class="filter-tag">
                    <i class="fas fa-graduation-cap"></i>
                    ${this.filtrosAplicados.carrera}
                    <button class="remove-filter" data-filter="carrera">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `);
        }
        
        if (this.filtrosAplicados.genero) {
            tags.push(`
                <span class="filter-tag">
                    <i class="fas fa-venus-mars"></i>
                    ${this.filtrosAplicados.genero}
                    <button class="remove-filter" data-filter="genero">
                        <i class="fas fa-times"></i>
                    </button>
                </span>
            `);
        }
        
        container.innerHTML = tags.join('');
    }
    
    eliminarFiltro(filtro) {
        delete this.filtrosAplicados[filtro];
        
        // Actualizar formulario
        switch(filtro) {
            case 'fechas':
                document.getElementById('start-date').value = '';
                document.getElementById('end-date').value = '';
                break;
            case 'estado':
                document.getElementById('estado-filter').value = '';
                break;
            case 'municipio':
                document.getElementById('municipio-filter').value = '';
                break;
            case 'escuela':
                document.getElementById('escuela-filter').value = '';
                break;
            case 'carrera':
                document.getElementById('carrera-filter').value = '';
                break;
            case 'genero':
                document.getElementById('genero-filter').value = '';
                break;
        }
        
        this.aplicarFiltrosAvanzados();
    }
    
    actualizarVistaPrevia() {
        const tbody = document.getElementById('preview-table-body');
        const registrosFiltrados = this.registrosFiltrados || this.registros;
        
        if (registrosFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-data">
                        <i class="fas fa-database"></i>
                        <span>No hay registros que coincidan con los filtros</span>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Mostrar primeros 10 registros
        const previewRegistros = registrosFiltrados.slice(0, 10);
        
        tbody.innerHTML = previewRegistros.map(registro => `
            <tr>
                <td>${registro.nombre || 'No especificado'}</td>
                <td>${registro.escuela || 'No especificada'}</td>
                <td>${registro.carrera || 'No especificada'}</td>
                <td>${registro.municipio || registro.ciudad || 'No especificado'}</td>
                <td>${this.formatearFecha(registro.fechaRegistro)}</td>
            </tr>
        `).join('');
    }
    
    actualizarEstadisticas() {
        const total = this.registros.length;
        const filtrados = this.registrosFiltrados?.length || total;
        const porcentaje = total > 0 ? ((filtrados / total) * 100).toFixed(1) : 0;
        
        document.getElementById('total-resultados').textContent = total;
        document.getElementById('filtrados-resultados').textContent = filtrados;
        document.getElementById('porcentaje-resultados').textContent = `${porcentaje}%`;
        
        // Actualizar resumen por filtro
        this.actualizarResumenEstadistico();
    }
    
    actualizarResumenEstadistico() {
        const registrosFiltrados = this.registrosFiltrados || this.registros;
        
        // Estadísticas por ubicación
        const ubicacionStats = this.calcularEstadisticasUbicacion(registrosFiltrados);
        document.getElementById('stats-ubicacion').innerHTML = `
            <div>${ubicacionStats.topMunicipio || 'N/A'}: ${ubicacionStats.topCount || 0}</div>
            <small>${ubicacionStats.totalMunicipios || 0} municipios</small>
        `;
        
        // Estadísticas por escuela
        const escuelaStats = this.calcularEstadisticasEscuela(registrosFiltrados);
        document.getElementById('stats-escuela').innerHTML = `
            <div>${escuelaStats.topEscuela || 'N/A'}: ${escuelaStats.topCount || 0}</div>
            <small>${escuelaStats.totalEscuelas || 0} escuelas</small>
        `;
        
        // Estadísticas por carrera
        const carreraStats = this.calcularEstadisticasCarrera(registrosFiltrados);
        document.getElementById('stats-carrera').innerHTML = `
            <div>${carreraStats.topCarrera || 'N/A'}: ${carreraStats.topCount || 0}</div>
            <small>${carreraStats.totalCarreras || 0} carreras</small>
        `;
    }
    
    calcularEstadisticasUbicacion(registros) {
        const municipios = {};
        
        registros.forEach(registro => {
            const municipio = registro.municipio || registro.ciudad || 'No especificado';
            municipios[municipio] = (municipios[municipio] || 0) + 1;
        });
        
        const top = Object.entries(municipios).sort((a, b) => b[1] - a[1])[0];
        
        return {
            topMunicipio: top?.[0],
            topCount: top?.[1],
            totalMunicipios: Object.keys(municipios).length
        };
    }
    
    calcularEstadisticasEscuela(registros) {
        const escuelas = {};
        
        registros.forEach(registro => {
            const escuela = registro.escuela || 'No especificada';
            escuelas[escuela] = (escuelas[escuela] || 0) + 1;
        });
        
        const top = Object.entries(escuelas).sort((a, b) => b[1] - a[1])[0];
        
        return {
            topEscuela: top?.[0],
            topCount: top?.[1],
            totalEscuelas: Object.keys(escuelas).length
        };
    }
    
    calcularEstadisticasCarrera(registros) {
        const carreras = {};
        
        registros.forEach(registro => {
            const carrera = registro.carrera || 'No especificada';
            carreras[carrera] = (carreras[carrera] || 0) + 1;
        });
        
        const top = Object.entries(carreras).sort((a, b) => b[1] - a[1])[0];
        
        return {
            topCarrera: top?.[0],
            topCount: top?.[1],
            totalCarreras: Object.keys(carreras).length
        };
    }
    
    limpiarFiltrosFormulario() {
        // Limpiar todos los campos del formulario
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        document.getElementById('estado-filter').value = '';
        document.getElementById('municipio-filter').value = '';
        document.getElementById('escuela-filter').value = '';
        document.getElementById('tipo-escuela-filter').value = '';
        document.getElementById('carrera-filter').value = '';
        document.getElementById('area-filter').value = '';
        document.getElementById('genero-filter').value = '';
        document.getElementById('edad-min').value = '';
        document.getElementById('edad-max').value = '';
        document.getElementById('has-location').checked = false;
        
        // Limpiar tags activas
        document.querySelectorAll('.carrera-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });
        
        // Limpiar presets activos
        document.querySelectorAll('.preset-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    limpiarTodosFiltros() {
        this.filtrosAplicados = {};
        this.limpiarFiltrosFormulario();
        this.actualizarFiltrosAplicados();
        this.actualizarVistaPrevia();
        this.actualizarEstadisticas();
        
        this.mostrarNotificacion('Todos los filtros han sido limpiados', 'info');
    }
    
    exportarResultados() {
        const registrosFiltrados = this.registrosFiltrados || this.registros;
        
        if (registrosFiltrados.length === 0) {
            this.mostrarNotificacion('No hay datos para exportar', 'warning');
            return;
        }
        
        const datosExportar = {
            fechaExportacion: new Date().toISOString(),
            totalRegistros: registrosFiltrados.length,
            filtrosAplicados: this.filtrosAplicados,
            registros: registrosFiltrados
        };
        
        const blob = new Blob([JSON.stringify(datosExportar, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filtros-gtu-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion('Resultados exportados exitosamente', 'success');
    }
    
    mostrarFormularioPreset() {
        document.getElementById('preset-save').style.display = 'block';
        document.getElementById('preset-name').focus();
    }
    
    ocultarFormularioPreset() {
        document.getElementById('preset-save').style.display = 'none';
        document.getElementById('preset-name').value = '';
    }
    
    guardarPreset() {
        const nombre = document.getElementById('preset-name').value.trim();
        
        if (!nombre) {
            this.mostrarNotificacion('Ingresa un nombre para el preset', 'warning');
            return;
        }
        
        const preset = {
            nombre: nombre,
            fechaCreacion: new Date().toISOString(),
            filtros: { ...this.filtrosAplicados }
        };
        
        // Guardar preset
        this.presetsGuardados[nombre] = preset;
        localStorage.setItem('gtuFiltrosPresets', JSON.stringify(this.presetsGuardados));
        
        // Actualizar lista
        this.actualizarListaPresets();
        this.ocultarFormularioPreset();
        
        this.mostrarNotificacion(`Preset "${nombre}" guardado exitosamente`, 'success');
    }
    
    actualizarListaPresets() {
        const container = document.getElementById('presets-grid');
        
        if (Object.keys(this.presetsGuardados).length === 0) {
            container.innerHTML = `
                <div class="no-presets">
                    <i class="fas fa-sliders-h"></i>
                    <span>No hay presets guardados</span>
                </div>
            `;
            return;
        }
        
        const presetsArray = Object.values(this.presetsGuardados);
        
        container.innerHTML = presetsArray.map(preset => `
            <div class="preset-item" data-preset="${preset.nombre}">
                <h6>${preset.nombre}</h6>
                <p>Creado: ${this.formatearFecha(preset.fechaCreacion)}</p>
                <p>Filtros: ${Object.keys(preset.filtros).length}</p>
                <div class="preset-actions">
                    <button class="preset-btn-small aplicar-preset" data-preset="${preset.nombre}">
                        <i class="fas fa-play"></i> Aplicar
                    </button>
                    <button class="preset-btn-small eliminar-preset" data-preset="${preset.nombre}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
        
        // Agregar eventos a los botones
        document.querySelectorAll('.aplicar-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nombre = e.target.dataset.preset;
                this.aplicarPreset(nombre);
            });
        });
        
        document.querySelectorAll('.eliminar-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nombre = e.target.dataset.preset;
                this.eliminarPreset(nombre);
            });
        });
    }
    
    aplicarPreset(nombre) {
        const preset = this.presetsGuardados[nombre];
        
        if (!preset) {
            this.mostrarNotificacion('Preset no encontrado', 'error');
            return;
        }
        
        // Limpiar filtros actuales
        this.limpiarTodosFiltros();
        
        // Aplicar filtros del preset
        this.filtrosAplicados = { ...preset.filtros };
        
        // Actualizar formulario con los filtros del preset
        this.actualizarFormularioDesdePreset();
        
        // Aplicar filtros
        this.aplicarFiltrosAvanzados();
        
        this.mostrarNotificacion(`Preset "${nombre}" aplicado`, 'success');
    }
    
    actualizarFormularioDesdePreset() {
        // Esta función debería actualizar el formulario basado en los filtros aplicados
        // Por simplicidad, aquí solo aplicamos los filtros directamente
        console.log('Aplicando preset:', this.filtrosAplicados);
    }
    
    eliminarPreset(nombre) {
        if (confirm(`¿Estás seguro de eliminar el preset "${nombre}"?`)) {
            delete this.presetsGuardados[nombre];
            localStorage.setItem('gtuFiltrosPresets', JSON.stringify(this.presetsGuardados));
            this.actualizarListaPresets();
            
            this.mostrarNotificacion(`Preset "${nombre}" eliminado`, 'info');
        }
    }
    
    formatearFecha(fechaString) {
        if (!fechaString) return 'Fecha no válida';
        
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Fecha no válida';
        }
    }
    
    actualizarUsuarioInfo() {
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser) {
            document.getElementById('current-user').textContent = currentUser.name;
            document.getElementById('current-role').textContent = currentUser.role;
            
            // Aplicar permisos según rol
            if (currentUser.role === 'asesor') {
                document.querySelectorAll('.btn-success, .preset-btn-small').forEach(btn => {
                    btn.style.display = 'none';
                });
            }
        }
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `filtros-notification ${tipo}`;
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

// Inicializar sistema de filtros
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const currentUser = AuthSystem.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    window.filtrosGTU = new FiltrosGTU();
});