const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['superadmin', 'admin', 'asesor'],
        default: 'asesor'
    },
    email: { type: String },
    lastLogin: { type: Date },
    status: { 
        type: String, 
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
