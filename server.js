// Importar express, dotenv, bcrypt, session, sweetalert, ruta de conexion a la bd
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const session = require('express-session');
const swal = require('sweetalert2');
const pc = require('picocolors');
const prisma = require('./database/dbConexion');

const PORT = process.argv[2] ?? 3000;

// Capturar datos del formulario por urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup del directorio env
dotenv.config({ path: './.env' });

// Setup del directorio public
app.use('/public', express.static('public'));

// Motor de plantillas ejs
app.set('view engine', 'ejs');

// Setup de express-session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// Establecer rutas
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('index', {
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
        });
    } else {
        res.render('index', {
            login: false,
        });
    }
});

app.get('/index', (req, res) => {
    if (req.session.loggedin) {
        res.render('index', {
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
        });
    } else {
        res.render('index', {
            login: false,
        });
    }
});

// Login
app.post('/auth', async (req, res) => {
    const usuario = req.body.inputUsuario;
    const pass = req.body.inputPassword;

    if (usuario && pass) {
        const bibliotecario = await prisma.bibliotecario.findFirst({
            where: { Usuario: usuario },
        });

        if (bibliotecario && bibliotecario.Contrasena === pass) {
            req.session.loggedin = true;
            req.session.name = bibliotecario.Nombre;
            req.session.lastname = bibliotecario.Apellido;
            req.session.email = bibliotecario.Email;

            res.render('login', {
                alert: true,
                alertTitle: 'Conexión exitosa',
                alertMessage: `Bienvenido ${usuario} ✅`,
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 2000,
                ruta: 'index',
            });
        } else {
            res.render('login', {
                alert: true,
                alertTitle: 'Error',
                alertMessage: 'Usuario y/o contraseña incorrectas',
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'login',
            });
        }
    } else {
        res.render('login', {
            alert: true,
            alertTitle: 'Error',
            alertMessage: 'Por favor, ingrese usuario y contraseña',
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login',
        });
    }
});

// Inicio del servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor alojado en el puerto http://localhost:${pc.green(PORT)}`);
});
