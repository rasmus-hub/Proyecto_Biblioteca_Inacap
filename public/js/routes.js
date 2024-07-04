const express = require('express');
const router = express.Router();
const prestamosController = require('./prestamosController')

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

module.exports = router;
