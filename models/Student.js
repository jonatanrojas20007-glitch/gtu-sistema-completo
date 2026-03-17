const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Datos personales
    nombre: { type: String, required: true },
    apellidoPaterno: { type: String, required: true },
    apellidoMaterno: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String },
    
    // Datos académicos
    nivelEducativo: { type: String, required: true },
    escuela: { type: String, required: true },
    carrera: { type: String, required: true },
    
    // Ubicación
    municipio: { type: String, required: true },
    estado: { type: String, default: 'Querétaro' },
    latitud: { type: Number },
    longitud: { type: Number },
    
    // Metadatos
    fechaRegistro: { type: Date, default: Date.now },
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Student', studentSchema);
