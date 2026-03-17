const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    usuario: { type: String, required: true },
    accion: { type: String, required: true },
    modulo: { type: String, required: true },
    ip: { type: String },
    estado: { 
        type: String, 
        enum: ['success', 'error', 'warning', 'info'],
        default: 'info'
    },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
