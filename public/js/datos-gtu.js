// Datos de ejemplo para el sistema GTU
const datosGTU = {
    vehiculos: [],
    estadisticas: {
        total: 0,
        activos: 0,
        registrosHoy: 0
    }
};

// Función para inicializar datos de ejemplo
function inicializarDatos() {
    datosGTU.vehiculos = [
        {
            id: 1,
            placa: "ABC-123",
            marca: "Toyota",
            modelo: "Corolla",
            propietario: "Juan Pérez",
            documento: "12345678",
            fecha: "2024-01-15",
            estado: "Activo"
        },
        {
            id: 2,
            placa: "XYZ-789",
            marca: "Honda",
            modelo: "Civic",
            propietario: "María García",
            documento: "87654321",
            fecha: "2024-01-14",
            estado: "Activo"
        }
    ];
    
    actualizarEstadisticas();
}

// Función para actualizar estadísticas
function actualizarEstadisticas() {
    datosGTU.estadisticas.total = datosGTU.vehiculos.length;
    datosGTU.estadisticas.activos = datosGTU.vehiculos.filter(v => v.estado === "Activo").length;
    
    const hoy = new Date().toISOString().split('T')[0];
    datosGTU.estadisticas.registrosHoy = datosGTU.vehiculos.filter(v => v.fecha === hoy).length;
}

// Exportar funciones
export { datosGTU, inicializarDatos, actualizarEstadisticas };