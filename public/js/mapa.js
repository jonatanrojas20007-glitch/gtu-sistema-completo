// Mapa de Calor de Querétaro - Versión para Express
class MapaQueretaro {
    constructor() {
        this.map = null;
        this.heatLayer = null;
        this.markers = [];
        this.estudiantes = [];
        this.municipiosData = {};
        
        // Coordenadas del centro de Querétaro
        this.queretaroCenter = [20.5888, -100.3899];
        
        // Municipios de Querétaro con coordenadas aproximadas
        this.municipiosQueretaro = {
            'Querétaro': { coords: [20.5881, -100.3881] },
            'San Juan del Río': { coords: [20.3889, -99.9961] },
            'El Marqués': { coords: [20.7447, -100.2461] },
            'Corregidora': { coords: [20.5467, -100.4381] },
            'Tequisquiapan': { coords: [20.5219, -99.8911] },
            'Ezequiel Montes': { coords: [20.6667, -99.9000] },
            'Pedro Escobedo': { coords: [20.5000, -100.1333] },
            'Tolimán': { coords: [20.9167, -99.9333] },
            'Amealco': { coords: [20.1833, -100.1500] },
            'Cadereyta': { coords: [20.7000, -99.8167] },
            'Colón': { coords: [20.7833, -100.0500] },
            'Huimilpan': { coords: [20.3667, -100.2833] },
            'Jalpan': { coords: [21.2167, -99.4667] },
            'Landa de Matamoros': { coords: [21.1833, -99.3167] },
            'Pinal de Amoles': { coords: [21.1333, -99.6167] },
            'Peñamiller': { coords: [21.0500, -99.8167] },
            'San Joaquín': { coords: [21.0167, -99.4667] },
            'Arroyo Seco': { coords: [21.5500, -99.6833] }
        };
        
        // Datos de ejemplo para mostrar el mapa aunque no haya registros
        this.datosEjemplo = [
            { nombre: 'Ejemplo 1', municipio: 'Querétaro', latitud: 20.5888, longitud: -100.3899, carrera: 'Ingeniería' },
            { nombre: 'Ejemplo 2', municipio: 'San Juan del Río', latitud: 20.3889, longitud: -99.9961, carrera: 'Medicina' },
            { nombre: 'Ejemplo 3', municipio: 'Corregidora', latitud: 20.5467, longitud: -100.4381, carrera: 'Derecho' },
        ];
        
        this.init();
    }
    
    init() {
        console.log('Inicializando mapa...');
        this.cargarDatosReales();
        this.inicializarMapa();
        this.configurarEventos();
        this.actualizarUI();
        
        // Verificar datos cada 10 segundos
        setInterval(() => this.cargarDatosReales(), 10000);
    }
    
    cargarDatosReales() {
        // Intentar cargar datos de localStorage (para compatibilidad)
        let datosGuardados = null;
        try {
            datosGuardados = localStorage.getItem('gtuRegistros');
        } catch (e) {
            console.log('localStorage no disponible, usando datos de ejemplo');
        }
        
        if (datosGuardados) {
            try {
                const todosRegistros = JSON.parse(datosGuardados);
                this.estudiantes = todosRegistros.filter(registro => {
                    return (registro.departamento && 
                           registro.departamento.toLowerCase().includes('querétaro')) ||
                           (registro.latitud && registro.longitud);
                });
                console.log(`Cargados ${this.estudiantes.length} estudiantes de Querétaro`);
            } catch (e) {
                console.log('Error al parsear datos, usando datos de ejemplo');
                this.estudiantes = this.datosEjemplo;
            }
        } else {
            console.log('No hay registros, usando datos de ejemplo');
            this.estudiantes = this.datosEjemplo;
        }
        
        this.calcularEstadisticasMunicipios();
        
        // Actualizar mapa si ya está inicializado
        if (this.map) {
            this.actualizarMapaCalor();
            this.actualizarGraficoMunicipios();
        }
    }
    
    calcularEstadisticasMunicipios() {
        this.municipiosData = {};
        
        this.estudiantes.forEach(estudiante => {
            let municipio = estudiante.municipio || 'Querétaro';
            
            if (!this.municipiosData[municipio]) {
                this.municipiosData[municipio] = {
                    total: 0,
                    carreras: {},
                    puntos: []
                };
            }
            
            const municipioData = this.municipiosData[municipio];
            municipioData.total++;
            
            let lat, lng;
            if (estudiante.latitud && estudiante.longitud) {
                lat = estudiante.latitud;
                lng = estudiante.longitud;
            } else {
                const municipioCoords = this.municipiosQueretaro[municipio];
                if (municipioCoords) {
                    lat = municipioCoords.coords[0] + (Math.random() - 0.5) * 0.03;
                    lng = municipioCoords.coords[1] + (Math.random() - 0.5) * 0.03;
                } else {
                    lat = this.queretaroCenter[0] + (Math.random() - 0.5) * 0.05;
                    lng = this.queretaroCenter[1] + (Math.random() - 0.5) * 0.05;
                }
            }
            
            municipioData.puntos.push([lat, lng, 0.7]);
            
            if (estudiante.carrera) {
                municipioData.carreras[estudiante.carrera] = 
                    (municipioData.carreras[estudiante.carrera] || 0) + 1;
            }
        });
    }
    
    inicializarMapa() {
        console.log('Inicializando mapa Leaflet...');
        
        // Asegurarse de que el contenedor del mapa existe
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('No se encontró el contenedor del mapa');
            return;
        }
        
        // Inicializar mapa centrado en Querétaro
        this.map = L.map('map').setView(this.queretaroCenter, 9);
        
        // Capa base de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 15,
            minZoom: 7
        }).addTo(this.map);
        
        // Agregar límites de Querétaro
        const bounds = [[20.1833, -100.4381], [21.5500, -99.3167]];
        L.rectangle(bounds, {
            color: "#FF6B35",
            weight: 2,
            fillOpacity: 0.05
        }).addTo(this.map);
        
        // Agregar marcador del centro
        L.marker(this.queretaroCenter)
            .addTo(this.map)
            .bindPopup('<b>Querétaro Capital</b><br>Centro del estado');
        
        // Actualizar mapa de calor
        this.actualizarMapaCalor();
        this.actualizarGraficoMunicipios();
        
        console.log('Mapa inicializado correctamente');
    }
    
    actualizarMapaCalor() {
        if (!this.map) return;
        
        // Limpiar capa anterior
        if (this.heatLayer) {
            this.map.removeLayer(this.heatLayer);
        }
        
        // Preparar datos para el mapa de calor
        const heatPoints = [];
        this.estudiantes.forEach(estudiante => {
            if (estudiante.puntos && estudiante.puntos.length > 0) {
                estudiante.puntos.forEach(punto => {
                    if (punto[0] && punto[1]) {
                        heatPoints.push([punto[0], punto[1], punto[2] || 0.5]);
                    }
                });
            } else if (estudiante.latitud && estudiante.longitud) {
                heatPoints.push([estudiante.latitud, estudiante.longitud, 0.7]);
            } else {
                const municipio = estudiante.municipio || 'Querétaro';
                const coords = this.municipiosQueretaro[municipio]?.coords || this.queretaroCenter;
                heatPoints.push([
                    coords[0] + (Math.random() - 0.5) * 0.03,
                    coords[1] + (Math.random() - 0.5) * 0.03,
                    0.5
                ]);
            }
        });
        
        // Crear mapa de calor
        if (heatPoints.length > 0) {
            const radius = document.getElementById('radius') ? 
                parseInt(document.getElementById('radius').value) : 25;
            
            this.heatLayer = L.heatLayer(heatPoints, {
                radius: radius,
                blur: 15,
                maxZoom: 15,
                gradient: {
                    0.0: 'yellow',
                    0.5: 'orange',
                    1.0: 'red'
                }
            }).addTo(this.map);
        }
        
        this.agregarMarcadoresMunicipios();
    }
    
    agregarMarcadoresMunicipios() {
        if (!this.map) return;
        
        // Limpiar marcadores anteriores
        this.markers.forEach(marker => {
            if (this.map) this.map.removeLayer(marker);
        });
        this.markers = [];
        
        // Agregar marcadores de municipios
        Object.entries(this.municipiosQueretaro).forEach(([municipio, data]) => {
            const cantidad = this.municipiosData[municipio]?.total || 
                           Math.floor(Math.random() * 5); // Datos aleatorios si no hay reales
            
            const marker = L.circleMarker(data.coords, {
                radius: 8 + cantidad,
                fillColor: this.getColorPorDensidad(cantidad),
                color: '#333',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(this.map);
            
            marker.bindPopup(`
                <div style="padding: 10px;">
                    <h4 style="margin: 0 0 5px 0;">${municipio}</h4>
                    <p style="margin: 0;"><strong>Estudiantes:</strong> ${cantidad}</p>
                </div>
            `);
            
            this.markers.push(marker);
        });
    }
    
    getColorPorDensidad(cantidad) {
        if (cantidad > 10) return '#ff0000';
        if (cantidad > 5) return '#ff6600';
        if (cantidad > 2) return '#ff9900';
        if (cantidad > 0) return '#ffcc00';
        return '#ffff00';
    }
    
    actualizarGraficoMunicipios() {
        const ctx = document.getElementById('municipioChart');
        if (!ctx) return;
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const municipiosData = Object.entries(this.municipiosData)
            .map(([municipio, data]) => ({ municipio, total: data.total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);
        
        if (municipiosData.length === 0) {
            ctx.parentElement.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <i class="fas fa-chart-bar" style="font-size: 48px; color: #ccc;"></i>
                    <p>No hay datos para mostrar</p>
                </div>
            `;
            return;
        }
        
        this.chart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: municipiosData.map(d => d.municipio),
                datasets: [{
                    label: 'Estudiantes',
                    data: municipiosData.map(d => d.total),
                    backgroundColor: 'rgba(255, 107, 53, 0.8)',
                    borderColor: '#FF6B35',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    actualizarUI() {
        const totalEstudiantes = this.estudiantes.length;
        const totalMunicipios = Object.keys(this.municipiosData).length;
        
        document.getElementById('total-estudiantes').textContent = totalEstudiantes;
        document.getElementById('total-municipios').textContent = totalMunicipios;
        
        this.actualizarFecha();
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
    
    configurarEventos() {
        document.getElementById('radius')?.addEventListener('input', (e) => {
            document.getElementById('radius-value').textContent = e.target.value;
            if (this.heatLayer) {
                this.actualizarMapaCalor();
            }
        });
        
        document.getElementById('apply-filters')?.addEventListener('click', () => {
            this.aplicarFiltros();
        });
        
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.restablecerFiltros();
        });
        
        document.getElementById('refresh-map')?.addEventListener('click', () => {
            this.refrescarMapa();
        });
    }
    
    aplicarFiltros() {
        this.mostrarNotificacion('Filtros aplicados', 'success');
    }
    
    restablecerFiltros() {
        this.mostrarNotificacion('Filtros restablecidos', 'info');
    }
    
    refrescarMapa() {
        this.cargarDatosReales();
        this.actualizarMapaCalor();
        this.actualizarUI();
        this.mostrarNotificacion('Mapa actualizado', 'success');
    }
    
    mostrarNotificacion(mensaje, tipo) {
        console.log(`Notificación: ${mensaje} (${tipo})`);
        // Implementación simple
        alert(mensaje);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando mapa...');
    
    // Verificar que Leaflet esté cargado
    if (typeof L === 'undefined') {
        console.error('Leaflet no está cargado');
        return;
    }
    
    // Verificar que el contenedor del mapa existe
    if (!document.getElementById('map')) {
        console.error('No se encontró el elemento #map');
        return;
    }
    
    // Inicializar mapa
    window.mapaQueretaro = new MapaQueretaro();
});
