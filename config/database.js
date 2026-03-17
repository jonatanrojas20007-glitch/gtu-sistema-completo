const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Para desarrollo local
        const conn = await mongoose.connect('mongodb://localhost:27017/gtu_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
