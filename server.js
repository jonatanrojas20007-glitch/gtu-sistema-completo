
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// CONFIGURACIÓN BÁSICA - NO TOCAR
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

// ===========================================
// DATOS DE USUARIOS - IGUAL QUE EN auth.js
// ===========================================
const users = {
    superadmin: [
        { username: 'admin', password: 'admin123', name: 'Super Admin', role: 'superadmin' }
    ],
    admin: [
        { username: 'directora', password: 'escuela123', name: 'Directora García', role: 'admin' }
    ],
    asesor: [
        { username: 'asesor', password: 'ver123', name: 'Asesor Pérez', role: 'asesor' }
    ]
};

// ===========================================
// MIDDLEWARE DE AUTENTICACIÓN - NO TOCAR
// ===========================================
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/pages/login');
    }
    next();
};

// ===========================================
// RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
// ===========================================

// Ruta raíz
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>GTU</title></head>
        <body style="font-family: Arial; text-align: center; margin-top: 100px;">
            <h1>🚀 Sistema GTU</h1>
            <a href="/pages/login">Ir a Login</a>
        </body>
        </html>
    `);
});

// Login
app.get('/pages/login', (req, res) => {
    res.render('pages/login', { title: 'GTU Dashboard - Login' });
});

// API Login
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;
    const user = users[role]?.find(u => u.username === username && u.password === password);
    
    if (user) {
        req.session.user = user;
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
});

// Logout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/pages/login');
});

// Rutas de prueba
app.get('/test', (req, res) => {
    res.send('✅ Servidor funcionando');
});

// ===========================================
// RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ===========================================

// Dashboard
app.get('/pages/dashboard', requireAuth, (req, res) => {
    res.render('pages/dashboard', { 
        title: 'Dashboard GTU',
        user: req.session.user 
    });
});

// ========== FORMULARIO (YA CONVERTIDO) ==========
app.get('/pages/formulario', requireAuth, (req, res) => {
    res.render('pages/formulario', { 
        title: 'Formulario de Registro',
        user: req.session.user 
    });
});

// ========== ESTADÍSTICAS (YA CONVERTIDO) ==========
app.get('/pages/estadisticas', requireAuth, (req, res) => {
    res.render('pages/estadisticas', { 
        title: 'Estadísticas GTU',
        user: req.session.user 
    });
});

// ========== REGISTROS (PENDIENTE DE CONVERTIR) ==========
app.get('/pages/registros', requireAuth, (req, res) => {
    res.render('pages/registros', { 
        title: 'Registros GTU',
        user: req.session.user 
    });
});

// ========== MAPA (PENDIENTE DE CONVERTIR) ==========
app.get('/pages/mapa', requireAuth, (req, res) => {
    res.render('pages/mapa', { 
        title: 'Mapa de Calor GTU',
        user: req.session.user 
    });
});

// ========== ANÁLISIS (PENDIENTE DE CONVERTIR) ==========
app.get('/pages/analisis', requireAuth, (req, res) => {
    res.render('pages/analisis', { 
        title: 'Análisis GTU',
        user: req.session.user 
    });
});

// ========== ADMIN (PENDIENTE DE CONVERTIR) ==========
app.get('/pages/admin', requireAuth, (req, res) => {
    res.render('pages/admin', { 
        title: 'Panel de Administración',
        user: req.session.user 
    });
});

// ========== REPORTES (PENDIENTE DE CONVERTIR) ==========
app.get('/pages/reportes', requireAuth, (req, res) => {
    res.render('pages/reportes', { 
        title: 'Reportes GTU',
        user: req.session.user 
    });
});

// ========== FILTROS (PENDIENTE DE CONVERTIR) ==========
app.get('/pages/filtros', requireAuth, (req, res) => {
    res.render('pages/filtros', { 
        title: 'Filtros Avanzados',
        user: req.session.user 
    });
});

// ========== CONFIGURACIÓN (PENDIENTE DE CONVERTIR) ==========
app.get('/pages/configuracion', requireAuth, (req, res) => {
    res.render('pages/configuracion', { 
        title: 'Configuración GTU',
        user: req.session.user 
    });
});

// ========== QR (PENDIENTE DE CONVERTIR) ==========
app.get('/pages/qr', requireAuth, (req, res) => {
    res.render('pages/qr', { 
        title: 'Generador QR',
        user: req.session.user 
    });
});

// ========== PÁGINAS DE ERROR ==========
app.get('/pages/403', (req, res) => {
    res.status(403).render('pages/403');
});

// ===========================================
// MANEJO DE ERROR 404 - SIEMPRE AL FINAL
// ===========================================
app.use((req, res) => {
    res.status(404).render('pages/404');
});

// ===========================================
// INICIAR SERVIDOR
// ===========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log(`🚀 Servidor GTU corriendo en:`);
    console.log(`📌 http://localhost:${PORT}`);
    console.log(`📌 Login: http://localhost:${PORT}/pages/login`);
    console.log(`📌 Dashboard: http://localhost:${PORT}/pages/dashboard`);
    console.log('=================================');
    console.log('✅ Páginas convertidas:');
    console.log('   - login.ejs ✓');
    console.log('   - dashboard.ejs ✓');
    console.log('   - formulario.ejs ✓');
    console.log('   - estadisticas.ejs ✓');
    console.log('=================================');
    console.log('⏳ Páginas pendientes:');
    console.log('   - registros.ejs');
    console.log('   - mapa.ejs');
    console.log('   - analisis.ejs');
    console.log('   - admin.ejs');
    console.log('   - reportes.ejs');
    console.log('   - filtros.ejs');
    console.log('   - configuracion.ejs');
    console.log('   - qr.ejs');
    console.log('=================================');
});
