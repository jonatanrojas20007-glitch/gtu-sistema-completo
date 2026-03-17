const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la conexión a PostgreSQL
const sequelize = new Sequelize('gtu_db', 'gtu_admin', 'GTU2024Secure', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Modelo de Usuario
const User = sequelize.define('User', {
    username: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    role: { 
        type: DataTypes.ENUM('superadmin', 'admin', 'asesor'),
        defaultValue: 'asesor'
    },
    email: DataTypes.STRING,
    lastLogin: DataTypes.DATE,
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
});

// Modelo de Estudiante
const Student = sequelize.define('Student', {
    nombre: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    apellidoPaterno: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    apellidoMaterno: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    telefono: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    email: DataTypes.STRING,
    nivelEducativo: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    escuela: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    carrera: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    municipio: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    estado: { 
        type: DataTypes.STRING, 
        defaultValue: 'Querétaro' 
    },
    latitud: DataTypes.FLOAT,
    longitud: DataTypes.FLOAT,
    fechaRegistro: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    }
});

// Modelo de Actividad
const Activity = sequelize.define('Activity', {
    usuario: DataTypes.STRING,
    accion: DataTypes.STRING,
    modulo: DataTypes.STRING,
    ip: DataTypes.STRING,
    estado: {
        type: DataTypes.ENUM('success', 'error', 'warning', 'info'),
        defaultValue: 'info'
    },
    fecha: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    }
});

// Relaciones
Student.belongsTo(User, { as: 'registradoPor', foreignKey: 'registradoPor' });

// Sincronizar modelos
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida');
        
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados');
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error);
    }
};

initDB();

module.exports = { sequelize, User, Student, Activity };
