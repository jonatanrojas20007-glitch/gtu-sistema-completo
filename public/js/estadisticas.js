// Sistema de Estadísticas GTU - Con datos dinámicos del formulario
class EstadisticasGTU {
    constructor() {
        this.registros = [];
        this.estadisticas = {
            total: 0,
            escuelasUnicas: 0,
            carrerasUnicas: 0,
            departamentosUnicos: 0,
            registrosHoy: 0
        };
        this.charts = {};
        this.map = null;
        
        // Colores para gráficos (tema naranja)
        this.colores = [
            '#FF6B35', // Naranja principal
            '#FFA62B', // Naranja claro
            '#FFD166', // Amarillo-naranja
            '#06D6A0', // Verde para contraste
            '#118AB2', // Azul para contraste
            '#EF476F', // Rosa para contraste
            '#073B4C'  // Azul oscuro
        ];
        
        this.init();
    }
    
    init() {
        this.cargarDatos();
        this.actualizarVista();
        this.configurarEventos();
        
        // Cargar datos cada 5 segundos (para actualización en tiempo real)
        setInterval(() => this.cargarDatos(), 5000);
    }
    
    cargarDatos() {
        // Cargar registros de localStorage
        const datosGuardados = localStorage.getItem('gtuRegistros');
        
        if (datosGuardados) {
            this.registros = JSON.parse(datosGuardados);
            this.calcularEstadisticas();
            this.actualizarUI();
        }
    }
    
    calcularEstadisticas() {
        this.estadisticas.total = this.registros.length;
        
        // Escuelas únicas
        const escuelas = new Set();
        const tiposEscuela = {};
        
        // Carreras únicas
        const carreras = new Set();
        const carrerasPorArea = {
            'Ingeniería': 0,
            'Ciencias de la Salud': 0,
            'Ciencias Sociales': 0,
            'Negocios': 0,
            'Artes y Humanidades': 0,
            'Ciencias Básicas': 0,
            'Otros': 0
        };
        
        // Departamentos
        const departamentos = new Set();
        const departamentosCount = {};
        
        // Género
        const generoCount = {
            'Masculino': 0,
            'Femenino': 0,
            'Otro': 0,
            'No especificado': 0
        };
        
        // Fechas para tendencia
        const registrosPorFecha = {};
        const hoy = new Date().toISOString().split('T')[0];
        
        this.registros.forEach(registro => {
            // Escuelas
            if (registro.escuela) {
                escuelas.add(registro.escuela);
                
                // Tipos de escuela
                const tipo = registro.tipoEscuela || 'No especificado';
                tiposEscuela[tipo] = (tiposEscuela[tipo] || 0) + 1;
            }
            
            // Carreras
            if (registro.carrera && registro.carrera !== 'No especificada') {
                carreras.add(registro.carrera);
                
                // Clasificar por área
                const area = this.clasificarCarrera(registro.carrera);
                carrerasPorArea[area]++;
            }
            
            // Departamentos
            if (registro.departamento) {
                departamentos.add(registro.departamento);
                departamentosCount[registro.departamento] = 
                    (departamentosCount[registro.departamento] || 0) + 1;
            }
            
            // Género
            if (registro.genero && generoCount[registro.genero] !== undefined) {
                generoCount[registro.genero]++;
            }
            
            // Fecha
            if (registro.fechaRegistro) {
                const fecha = registro.fechaRegistro.split('T')[0];
                registrosPorFecha[fecha] = (registrosPorFecha[fecha] || 0) + 1;
                
                // Registros hoy
                if (fecha === hoy) {
                    this.estadisticas.registrosHoy++;
                }
            }
        });
        
        this.estadisticas.escuelasUnicas = escuelas.size;
        this.estadisticas.carrerasUnicas = carreras.size;
        this.estadisticas.departamentosUnicos = departamentos.size;
        
        // Guardar datos para gráficos
        this.datosGraficos = {
            tiposEscuela,
            carrerasPorArea,
            departamentosCount,
            generoCount,
            registrosPorFecha,
            topCarreras: this.getTopCarreras(5),
            topEscuelas: this.getTopEscuelas(5)
        };
    }
    
    clasificarCarrera(carrera) {
        const ingenierias = ['Ingeniería', 'Sistemas', 'Civil', 'Industrial', 'Mecánica', 'Eléctrica'];
        const salud = ['Medicina', 'Enfermería', 'Odontología', 'Psicología', 'Nutrición'];
        const sociales = ['Derecho', 'Sociología', 'Antropología', 'Comunicación', 'Educación'];
        const negocios = ['Administración', 'Contabilidad', 'Economía', 'Marketing', 'Finanzas'];
        const artes = ['Arquitectura', 'Diseño', 'Arte', 'Música', 'Literatura'];
        const ciencias = ['Biología', 'Química', 'Física', 'Matemáticas', 'Estadística'];
        
        carrera = carrera.toLowerCase();
        
        if (ingenierias.some(palabra => carrera.includes(palabra.toLowerCase()))) {
            return 'Ingeniería';
        } else if (salud.some(palabra => carrera.includes(palabra.toLowerCase()))) {
            return 'Ciencias de la Salud';
        } else if (sociales.some(palabra => carrera.includes(palabra.toLowerCase()))) {
            return 'Ciencias Sociales';
        } else if (negocios.some(palabra => carrera.includes(palabra.toLowerCase()))) {
            return 'Negocios';
        } else if (artes.some(palabra => carrera.includes(palabra.toLowerCase()))) {
            return 'Artes y Humanidades';
        } else if (ciencias.some(palabra => carrera.includes(palabra.toLowerCase()))) {
            return 'Ciencias Básicas';
        }
        
        return 'Otros';
    }
    
    getTopCarreras(limit) {
        const carrerasCount = {};
        this.registros.forEach(registro => {
            if (registro.carrera && registro.carrera !== 'No especificada') {
                carrerasCount[registro.carrera] = (carrerasCount[registro.carrera] || 0) + 1;
            }
        });
        
        return Object.entries(carrerasCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }
    
    getTopEscuelas(limit) {
        const escuelasCount = {};
        this.registros.forEach(registro => {
            if (registro.escuela) {
                escuelasCount[registro.escuela] = (escuelasCount[registro.escuela] || 0) + 1;
            }
        });
        
        return Object.entries(escuelasCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }
    
    actualizarUI() {
        // Actualizar contadores
        document.getElementById('total-alumnos').textContent = this.estadisticas.total;
        document.getElementById('total-escuelas').textContent = this.estadisticas.escuelasUnicas;
        document.getElementById('total-carreras').textContent = this.estadisticas.carrerasUnicas;
        document.getElementById('total-departamentos').textContent = this.estadisticas.departamentosUnicos;
        document.getElementById('registros-hoy').textContent = this.estadisticas.registrosHoy;
        
        // Mostrar/ocultar secciones según datos
        const tieneDatos = this.registros.length > 0;
        document.getElementById('empty-state').style.display = tieneDatos ? 'none' : 'flex';
        document.getElementById('stats-section').style.display = tieneDatos ? 'block' : 'none';
        
        if (tieneDatos) {
            this.actualizarGraficos();
            this.actualizarTabla();
            
            if (this.registros.length >= 3) {
                this.inicializarMapa();
            }
        }
    }
    
    actualizarVista() {
        this.cargarDatos();
        
        // Configurar pestañas de visualización
        this.configurarTabs();
        
        // Inicializar fecha de actualización
        this.actualizarFecha();
    }
    
    configurarTabs() {
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabType = e.target.dataset.tab;
                const chartType = e.target.dataset.chart;
                
                // Actualizar pestañas activas
                e.target.closest('.tabs-container').querySelectorAll('.chart-tab').forEach(t => {
                    t.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Actualizar gráfico según pestaña
                if (chartType && this.charts[chartType]) {
                    this.actualizarVistaGrafico(chartType, tabType);
                }
            });
        });
    }
    
    actualizarGraficos() {
        // Destruir gráficos existentes
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        // Crear nuevos gráficos si hay datos
        if (this.registros.length >= 1) {
            this.crearGraficoEscuelas();
            this.crearGraficoCarreras();
            this.crearGraficoGenero();
            this.crearGraficoTendencia();
            this.crearGraficoDepartamentos();
        }
    }
    
    crearGraficoEscuelas() {
        const ctx = document.getElementById('escuelaChart');
        if (!ctx) return;
        
        const tipos = this.datosGraficos.tiposEscuela;
        
        if (Object.keys(tipos).length === 0) {
            document.getElementById('escuela-empty').style.display = 'flex';
            return;
        }
        
        document.getElementById('escuela-empty').style.display = 'none';
        
        this.charts.escuela = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(tipos),
                datasets: [{
                    data: Object.values(tipos),
                    backgroundColor: this.colores.slice(0, Object.keys(tipos).length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    crearGraficoCarreras() {
        const ctx = document.getElementById('carreraChart');
        if (!ctx) return;
        
        // Mostrar por área o top carreras según pestaña activa
        const tabActiva = document.querySelector('.carrera-tabs .chart-tab.active');
        const vista = tabActiva ? tabActiva.dataset.view : 'area';
        
        if (vista === 'area') {
            this.crearGraficoCarrerasArea(ctx);
        } else {
            this.crearGraficoTopCarreras(ctx);
        }
    }
    
    crearGraficoCarrerasArea(ctx) {
        const areas = this.datosGraficos.carrerasPorArea;
        const areasFiltradas = Object.entries(areas).filter(([_, valor]) => valor > 0);
        
        if (areasFiltradas.length === 0) {
            document.getElementById('carrera-empty').style.display = 'flex';
            return;
        }
        
        document.getElementById('carrera-empty').style.display = 'none';
        
        this.charts.carrera = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: areasFiltradas.map(([area, _]) => area),
                datasets: [{
                    label: 'Cantidad de Alumnos',
                    data: areasFiltradas.map(([_, valor]) => valor),
                    backgroundColor: 'rgba(255, 107, 53, 0.8)',
                    borderColor: 'rgb(255, 107, 53)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    crearGraficoTopCarreras(ctx) {
        const topCarreras = this.datosGraficos.topCarreras;
        
        if (topCarreras.length === 0) {
            document.getElementById('carrera-empty').style.display = 'flex';
            return;
        }
        
        document.getElementById('carrera-empty').style.display = 'none';
        
        this.charts.carrera = new Chart(ctx.getContext('2d'), {
            type: 'horizontalBar',
            data: {
                labels: topCarreras.map(([carrera, _]) => carrera),
                datasets: [{
                    label: 'Interesados',
                    data: topCarreras.map(([_, cantidad]) => cantidad),
                    backgroundColor: 'rgba(255, 166, 43, 0.8)',
                    borderColor: 'rgb(255, 166, 43)',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    crearGraficoGenero() {
        const ctx = document.getElementById('generoChart');
        if (!ctx) return;
        
        const generoData = this.datosGraficos.generoCount;
        const generosFiltrados = Object.entries(generoData).filter(([_, valor]) => valor > 0);
        
        if (generosFiltrados.length === 0) {
            document.getElementById('genero-empty').style.display = 'flex';
            return;
        }
        
        document.getElementById('genero-empty').style.display = 'none';
        
        this.charts.genero = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: generosFiltrados.map(([genero, _]) => genero),
                datasets: [{
                    data: generosFiltrados.map(([_, valor]) => valor),
                    backgroundColor: ['#FF6B35', '#118AB2', '#06D6A0', '#EF476F'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    crearGraficoTendencia() {
        const ctx = document.getElementById('tendenciaChart');
        if (!ctx) return;
        
        const fechasData = this.datosGraficos.registrosPorFecha;
        
        if (Object.keys(fechasData).length === 0) {
            document.getElementById('tendencia-empty').style.display = 'flex';
            return;
        }
        
        document.getElementById('tendencia-empty').style.display = 'none';
        
        // Ordenar fechas
        const fechasOrdenadas = Object.keys(fechasData).sort();
        const ultimasFechas = fechasOrdenadas.slice(-15); // Últimos 15 días
        
        this.charts.tendencia = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ultimasFechas.map(fecha => {
                    const d = new Date(fecha);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                }),
                datasets: [{
                    label: 'Registros por día',
                    data: ultimasFechas.map(fecha => fechasData[fecha]),
                    borderColor: '#FF6B35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF6B35',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    crearGraficoDepartamentos() {
        const ctx = document.getElementById('departamentoChart');
        if (!ctx) return;
        
        const deptos = this.datosGraficos.departamentosCount;
        const deptosArray = Object.entries(deptos);
        
        if (deptosArray.length === 0) {
            document.getElementById('departamento-empty').style.display = 'flex';
            return;
        }
        
        document.getElementById('departamento-empty').style.display = 'none';
        
        // Ordenar y tomar top 10
        const topDeptos = deptosArray.sort((a, b) => b[1] - a[1]).slice(0, 10);
        
        this.charts.departamento = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topDeptos.map(([depto, _]) => depto),
                datasets: [{
                    label: 'Alumnos',
                    data: topDeptos.map(([_, cantidad]) => cantidad),
                    backgroundColor: 'rgba(255, 166, 43, 0.8)',
                    borderColor: 'rgb(255, 166, 43)',
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
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    actualizarTabla() {
        const tbody = document.getElementById('table-body');
        const tableCount = document.getElementById('table-count');
        const tableEmpty = document.getElementById('table-empty');
        
        if (this.registros.length === 0) {
            tbody.innerHTML = '';
            tableCount.textContent = '0';
            tableEmpty.style.display = 'flex';
            return;
        }
        
        tableEmpty.style.display = 'none';
        tableCount.textContent = this.registros.length;
        
        // Ordenar registros por fecha (más reciente primero)
        const registrosOrdenados = [...this.registros].sort((a, b) => 
            new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
        );
        
        tbody.innerHTML = registrosOrdenados.map((registro, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="student-info">
                        <div class="student-name">${registro.nombre || 'No especificado'}</div>
                        <div class="student-gender">${registro.genero || 'No especificado'}</div>
                    </div>
                </td>
                <td>
                    <div class="school-info">
                        <div class="school-name">${registro.escuela || 'No especificada'}</div>
                        <div class="school-type">${registro.tipoEscuela || 'No especificado'}</div>
                    </div>
                </td>
                <td>
                    <span class="career-badge">${registro.carrera || 'No especificada'}</span>
                </td>
                <td>
                    <span class="depto-badge">${registro.departamento || 'No especificado'}</span>
                </td>
                <td>${this.formatearFecha(registro.fechaRegistro)}</td>
            </tr>
        `).join('');
    }
    
    inicializarMapa() {
        // Verificar si hay datos de departamento
        const tieneDeptos = this.registros.some(r => r.departamento);
        
        if (!tieneDeptos) {
            document.getElementById('map-empty').style.display = 'flex';
            return;
        }
        
        document.getElementById('map-empty').style.display = 'none';
        
        // Inicializar mapa si no existe
        if (!this.map) {
            this.map = L.map('map').setView([-9.1900, -75.0152], 5);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 8,
                minZoom: 4
            }).addTo(this.map);
        }
        
        // Limpiar marcadores anteriores
        this.map.eachLayer(layer => {
            if (layer instanceof L.CircleMarker) {
                this.map.removeLayer(layer);
            }
        });
        
        // Agregar nuevos marcadores
        const deptosCount = this.datosGraficos.departamentosCount;
        const maxAlumnos = Math.max(...Object.values(deptosCount));
        
        // Coordenadas aproximadas de departamentos peruanos
        const coordenadasDeptos = {
            'Lima': [-12.0464, -77.0428],
            'Arequipa': [-16.4090, -71.5375],
            'La Libertad': [-8.1092, -79.0215],
            'Cusco': [-13.5319, -71.9675],
            'Piura': [-5.1945, -80.6328],
            'Lambayeque': [-6.7710, -79.8440],
            'Junín': [-11.1581, -75.9930],
            'Áncash': [-9.5279, -77.5304],
            'Ica': [-14.0751, -75.7289],
            'Puno': [-15.8402, -70.0219],
            'Tacna': [-18.0066, -70.2463],
            'Moquegua': [-17.1956, -70.9353],
            'Huánuco': [-9.9292, -76.2397],
            'Ayacucho': [-13.1588, -74.2236],
            'Cajamarca': [-7.1617, -78.5178],
            'San Martín': [-6.2925, -76.7083],
            'Amazonas': [-6.2376, -77.8708],
            'Loreto': [-3.7491, -73.2530],
            'Madre de Dios': [-12.6000, -70.0833],
            'Pasco': [-10.6858, -76.2567],
            'Ucayali': [-8.3792, -74.5539],
            'Tumbes': [-3.5669, -80.4515],
            'Huancavelica': [-12.7863, -74.9764],
            'Callao': [-12.0560, -77.1180]
        };
        
        Object.entries(deptosCount).forEach(([depto, cantidad]) => {
            const coords = coordenadasDeptos[depto];
            if (coords) {
                // Calcular tamaño y color basado en cantidad
                const radio = 10 + (cantidad * 0.3);
                const intensidad = cantidad / maxAlumnos;
                const color = this.getColorCalor(intensidad);
                
                const marker = L.circleMarker(coords, {
                    radius: radio,
                    fillColor: color,
                    color: "#333",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.7
                }).addTo(this.map);
                
                marker.bindPopup(`
                    <div class="map-popup">
                        <h4>${depto}</h4>
                        <div class="popup-stats">
                            <div class="popup-stat">
                                <span class="stat-label">Alumnos:</span>
                                <span class="stat-value">${cantidad}</span>
                            </div>
                            <div class="popup-stat">
                                <span class="stat-label">Porcentaje:</span>
                                <span class="stat-value">${((cantidad / this.estadisticas.total) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                `);
            }
        });
        
        // Actualizar leyenda
        this.actualizarLeyendaMapa(maxAlumnos);
    }
    
    getColorCalor(intensidad) {
        // Escala de colores naranja para mapa de calor
        const colores = [
            [255, 237, 160],  // Amarillo claro
            [255, 193, 119],  // Naranja claro
            [255, 149, 73],   // Naranja
            [255, 107, 53],   // Naranja intenso
            [220, 70, 40]     // Naranja-rojo
        ];
        
        const index = Math.min(Math.floor(intensidad * (colores.length - 1)), colores.length - 1);
        const [r, g, b] = colores[index];
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    actualizarLeyendaMapa(maxAlumnos) {
        const leyenda = document.getElementById('map-legend');
        const niveles = [
            { max: Math.ceil(maxAlumnos * 0.2), color: '#ffeda0', label: 'Muy baja' },
            { max: Math.ceil(maxAlumnos * 0.4), color: '#ffc177', label: 'Baja' },
            { max: Math.ceil(maxAlumnos * 0.6), color: '#ff9549', label: 'Media' },
            { max: Math.ceil(maxAlumnos * 0.8), color: '#ff6b35', label: 'Alta' },
            { max: maxAlumnos, color: '#dc4628', label: 'Muy alta' }
        ];
        
        leyenda.innerHTML = niveles.map((nivel, i) => {
            const min = i === 0 ? 1 : niveles[i-1].max + 1;
            return `
                <div class="legend-item">
                    <span class="legend-color" style="background-color: ${nivel.color};"></span>
                    <span>${nivel.label} (${min}-${nivel.max})</span>
                </div>
            `;
        }).join('');
        
        leyenda.style.display = 'flex';
    }
    
    formatearFecha(fechaString) {
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
    
    actualizarFecha() {
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) {
            const ahora = new Date();
            lastUpdate.textContent = ahora.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    configurarEventos() {
        // Botón de actualizar
        document.getElementById('refresh-stats')?.addEventListener('click', () => {
            this.cargarDatos();
            this.actualizarFecha();
            this.mostrarNotificacion('Estadísticas actualizadas', 'success');
        });
        
        // Botón de exportar
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportarDatos();
        });
        
        // Búsqueda en tabla
        document.getElementById('table-search')?.addEventListener('input', (e) => {
            this.filtrarTabla(e.target.value);
        });
        
        // Filtros de fecha
        document.getElementById('date-filter')?.addEventListener('change', (e) => {
            this.filtrarPorFecha(e.target.value);
        });
        
        // Pestañas de visualización
        document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.cambiarVista(view);
            });
        });
    }
    
    filtrarTabla(termino) {
        const filas = document.querySelectorAll('#alumnos-table tbody tr');
        const terminoLower = termino.toLowerCase();
        
        let visibleCount = 0;
        
        filas.forEach(fila => {
            const textoFila = fila.textContent.toLowerCase();
            const visible = textoFila.includes(terminoLower);
            fila.style.display = visible ? '' : 'none';
            if (visible) visibleCount++;
        });
        
        // Actualizar contador
        const counter = document.getElementById('filtered-count');
        if (counter) {
            counter.textContent = visibleCount;
            counter.style.display = termino ? 'inline' : 'none';
        }
    }
    
    filtrarPorFecha(rango) {
        const ahora = new Date();
        let fechaLimite = new Date();
        
        switch(rango) {
            case 'hoy':
                fechaLimite.setHours(0, 0, 0, 0);
                break;
            case 'semana':
                fechaLimite.setDate(ahora.getDate() - 7);
                break;
            case 'mes':
                fechaLimite.setMonth(ahora.getMonth() - 1);
                break;
            default:
                return; // Mostrar todos
        }
        
        const filas = document.querySelectorAll('#alumnos-table tbody tr');
        let visibleCount = 0;
        
        filas.forEach(fila => {
            const fechaTexto = fila.cells[5].textContent;
            try {
                const fecha = new Date(fechaTexto.split(' ')[0].split('/').reverse().join('-'));
                const visible = fecha >= fechaLimite;
                fila.style.display = visible ? '' : 'none';
                if (visible) visibleCount++;
            } catch {
                fila.style.display = 'none';
            }
        });
        
        this.mostrarNotificacion(`Mostrando ${visibleCount} registros de los últimos ${rango}`, 'info');
    }
    
    cambiarVista(vista) {
        // Actualizar pestañas activas
        document.querySelectorAll('.view-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Aquí podrías cambiar entre diferentes vistas de datos
        // Por ahora solo mostramos notificación
        this.mostrarNotificacion(`Cambiando a vista: ${vista}`, 'info');
    }
    
    exportarDatos() {
        const datosExportar = {
            estadisticas: this.estadisticas,
            registros: this.registros,
            datosGraficos: this.datosGraficos,
            fechaExportacion: new Date().toISOString(),
            totalRegistros: this.registros.length
        };
        
        const blob = new Blob([JSON.stringify(datosExportar, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gtu-estadisticas-completas-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion('Datos exportados exitosamente', 'success');
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `stats-notification ${type}`;
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
        
        // Agregar animaciones si no existen
        if (!document.querySelector('#stats-notification-animations')) {
            const style = document.createElement('style');
            style.id = 'stats-notification-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
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

// Inicializar estadísticas cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    window.estadisticasGTU = new EstadisticasGTU();
    
    // Verificar permisos del usuario
    const currentUser = AuthSystem.getCurrentUser();
    if (currentUser) {
        // Actualizar UI con datos del usuario
        document.getElementById('current-user').textContent = currentUser.name;
        document.getElementById('current-role').textContent = currentUser.role;
        
        // Aplicar restricciones según rol
        if (currentUser.role === 'asesor') {
            document.querySelectorAll('.export-btn, .delete-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }
});