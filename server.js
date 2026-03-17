const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { Sequelize, DataTypes } = require('sequelize');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// CONFIGURACIÓN DE POSTGRESQL
// ===========================================
const sequelize = new Sequelize('gtu_db', 'gtu_admin', 'GTU2024Secure', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

// Definir modelos (sin sincronizar aún)
const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'asesor' },
    email: DataTypes.STRING,
    lastLogin: DataTypes.DATE,
    status: { type: DataTypes.STRING, defaultValue: 'active' }
});

const Student = sequelize.define('Student', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellidoPaterno: { type: DataTypes.STRING, allowNull: false },
    apellidoMaterno: { type: DataTypes.STRING, allowNull: false },
    telefono: { type: DataTypes.STRING, allowNull: false },
    email: DataTypes.STRING,
    nivelEducativo: { type: DataTypes.STRING, allowNull: false },
    escuela: { type: DataTypes.STRING, allowNull: false },
    carrera: { type: DataTypes.STRING, allowNull: false },
    municipio: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.STRING, defaultValue: 'Querétaro' },
    latitud: DataTypes.FLOAT,
    longitud: DataTypes.FLOAT,
    userId: { type: DataTypes.INTEGER }
});

const Activity = sequelize.define('Activity', {
    usuario: DataTypes.STRING,
    accion: DataTypes.STRING,
    modulo: DataTypes.STRING,
    ip: DataTypes.STRING,
    estado: { type: DataTypes.STRING, defaultValue: 'info' }
});

// Relaciones
Student.belongsTo(User, { foreignKey: 'userId', as: 'registrador' });
User.hasMany(Student, { foreignKey: 'userId' });

// ===========================================
// CONFIGURACIÓN BÁSICA
// ===========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'gtu-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/pages/login');
    }
    next();
};

// ===========================================
// RUTAS
// ===========================================

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>GTU</title></head>
        <body style="font-family: Arial; text-align: center; margin-top: 100px;">
            <h1>🚀 Sistema GTU</h1>
            <a href="/pages/login">Ir a Login</a>
            <br><br>
            <a href="/api/init-users">Inicializar DB (SOLO UNA VEZ)</a>
        </body>
        </html>
    `);
});

// SOLUCIÓN DEFINITIVA: Ruta para inicializar la base de datos
app.get('/api/init-users', async (req, res) => {
    try {
        // FORZAR la recreación de tablas (esto borra todo y crea nuevo)
        await sequelize.sync({ force: true });
        console.log('✅ Tablas recreadas desde cero');
        
        const users = [
            { username: 'admin', password: 'admin123', name: 'Super Admin', role: 'superadmin' },
            { username: 'directora', password: 'escuela123', name: 'Directora García', role: 'admin' },
            { username: 'asesor', password: 'ver123', name: 'Asesor Pérez', role: 'asesor' }
        ];
        
        for (let userData of users) {
            await User.create(userData);
        }
        
        res.json({ success: true, message: '✅ Base de datos inicializada correctamente' });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/pages/login', (req, res) => {
    res.render('pages/login', { title: 'GTU Dashboard - Login' });
});

app.post('/api/login', async (req, res) => {
    const { username, password, role } = req.body;
    
    try {
        const user = await User.findOne({ where: { username, password, role } });
        
        if (user) {
            user.lastLogin = new Date();
            await user.save();
            
            req.session.user = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            };
            
            await Activity.create({
                usuario: user.name,
                accion: 'Inicio de sesión',
                modulo: 'Autenticación',
                estado: 'success'
            });
            
            res.json({ success: true, user: req.session.user });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/pages/login');
});

// ===========================================
// RUTAS PROTEGIDAS
// ===========================================

app.get('/pages/dashboard', requireAuth, (req, res) => {
    res.render('pages/dashboard', { 
        title: 'Dashboard GTU',
        user: req.session.user 
    });
});

app.get('/pages/formulario', requireAuth, (req, res) => {
    res.render('pages/formulario', { 
        title: 'Formulario de Registro',
        user: req.session.user 
    });
});

app.post('/api/estudiantes', requireAuth, async (req, res) => {
    try {
        const studentData = {
            ...req.body,
            userId: req.session.user.id
        };
        
        const student = await Student.create(studentData);
        
        await Activity.create({
            usuario: req.session.user.name,
            accion: 'Registró estudiante',
            modulo: 'Formulario',
            estado: 'success'
        });
        
        res.json({ success: true, student });
    } catch (error) {
        console.error('Error guardando estudiante:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/estudiantes', requireAuth, async (req, res) => {
    try {
        const estudiantes = await Student.findAll({ 
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'registrador', attributes: ['name'] }]
        });
        res.json({ success: true, estudiantes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// PÁGINAS RESTANTES
// ===========================================

app.get('/pages/estadisticas', requireAuth, (req, res) => {
    res.render('pages/estadisticas', { 
        title: 'Estadísticas GTU',
        user: req.session.user 
    });
});

app.get('/pages/registros', requireAuth, (req, res) => {
    res.render('pages/registros', { 
        title: 'Registros GTU',
        user: req.session.user 
    });
});

app.get('/pages/mapa', requireAuth, (req, res) => {
    res.render('pages/mapa', { 
        title: 'Mapa de Calor GTU',
        user: req.session.user 
    });
});

app.get('/pages/analisis', requireAuth, (req, res) => {
    res.render('pages/analisis', { 
        title: 'Análisis GTU',
        user: req.session.user 
    });
});

app.get('/pages/admin', requireAuth, (req, res) => {
    res.render('pages/admin', { 
        title: 'Panel de Administración',
        user: req.session.user 
    });
});

app.get('/pages/reportes', requireAuth, (req, res) => {
    res.render('pages/reportes', { 
        title: 'Reportes GTU',
        user: req.session.user 
    });
});

app.get('/pages/filtros', requireAuth, (req, res) => {
    res.render('pages/filtros', { 
        title: 'Filtros Avanzados',
        user: req.session.user 
    });
});

app.get('/pages/configuracion', requireAuth, (req, res) => {
    res.render('pages/configuracion', { 
        title: 'Configuración GTU',
        user: req.session.user 
    });
});

app.get('/pages/qr', requireAuth, (req, res) => {
    res.render('pages/qr', { 
        title: 'Generador QR',
        user: req.session.user 
    });
});

// ===========================================
// ERRORES
// ===========================================
app.get('/pages/403', (req, res) => {
    res.status(403).render('pages/403');
});

app.use((req, res) => {
    res.status(404).render('pages/404');
});

// ===========================================
// INICIAR SERVIDOR
// ===========================================
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        console.log('⚠️  Las tablas NO se han creado aún');
        console.log('👉 Ve a http://localhost:3000/api/init-users para inicializar la BD');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log('=================================');
            console.log(`🚀 Servidor GTU corriendo en:`);
            console.log(`📌 http://localhost:${PORT}`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
    }
};

startServer();
