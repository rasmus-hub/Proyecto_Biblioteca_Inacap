const express = require('express');
const router = express.Router();
const prestamosController = require('../controllers/prestamosController')
const usuariosController = require('../controllers/usuariosController')
const deudasController = require('../controllers/deudasController');

// Renderizar el login
router.get('/login', (req, res) => {
    res.render('login');
});

// Renderizar la pagina de raiz
router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('index', {
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
        });
    } else {
        res.render('indexNotLogin', {
            login: false,
        });
    }
});

// Renderizar pagina de inicio
router.get('/index', (req, res) => {
    res.render('index', {
        login: true,
        name: req.session.name,
        lastname: req.session.lastname,
        email: req.session.email,
    });
});

// Renderizar pagina de usuarios
router.get('/buscadorUsuarios', (req, res) => {
    res.render('buscadorUsuarios', {
        login: true,
        name: req.session.name,
        lastname: req.session.lastname,
        email: req.session.email,
    });
});

// Renderizar pagina de multas
router.get('/gestionMultas', (req, res) => {
    res.render('gestionMultas', {
        login: true,
        name: req.session.name,
        lastname: req.session.lastname,
        email: req.session.email,
    });
});

// Rutas Gestion Prestamos

router.get('/gestionPrestamos', prestamosController.renderGestionPrestamos);
router.get('/api/prestamos', prestamosController.getPrestamos);
router.post('/api/prestamos', prestamosController.addPrestamo);
router.post('/api/detallePrestamos', prestamosController.addDetallePrestamo);
router.put('/api/prestamos/:id', prestamosController.updatePrestamo);
router.delete('/api/prestamos/:id', prestamosController.deletePrestamo);
router.get('/api/prestamos/:id', prestamosController.getDetallePrestamosForPrestamo);

// Rutas Detalle Prestamos

router.get('/detallePrestamos', prestamosController.renderDetallePrestamos);
router.get('/api/detallePrestamos', prestamosController.getDetallePrestamos);

// Rutas Buscador Usuarios

router.get('/buscadorUsuarios/:rut', usuariosController.renderBuscadorUsuarios);

// Rutas Gestion Deudas

router.post('/check-multas', async (req, res) => {
    const rut = req.body.rut;
    const tieneMultas = await deudasController.checkUserMultas(rut);
    res.send({ tieneMultas });
});

router.post('/check-retraso', async (req, res) => {
    const rut = req.body.rut;
    const tieneRetraso = await deudasController.checkUserRetraso(rut);
    res.send({ tieneRetraso });
});

router.post('/calcular-multas', async (req, res) => {
    await deudasController.calcularMultas();
    res.send({ message: 'Multas calculadas correctamente' });
});

router.post('/pagar-multas', async (req, res) => {
    const rut = req.body.rut;
    await deudasController.pagarMulta(rut);
    res.send({ message: 'Multas pagadas correctamente' });
});

module.exports = router;
