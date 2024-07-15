const express = require('express');
const router = express.Router();
const deudasController = require('../controllers/deudasController');

router.post('/check-multas', async function (req, res) {
    const rut = req.body.rut;
    const tieneMultas = await deudasController.checkUserMultas(rut);
    res.send({ tieneMultas });
});

router.post('/check-retraso', async function (req, res) {
    const rut = req.body.rut;
    const librosRetrasados = await deudasController.checkUserRetraso(rut);
    res.send({ librosRetrasados });
});

router.post('/calcular-multas', async function (req, res) {
    await deudasController.calcularMultas();
    res.send({ message: 'Multas calculadas correctamente' });
});

router.post('/pagar-multas', async function (req, res) {
    const rut = req.body.rut;
    await deudasController.pagarMulta(rut);
    res.send({ message: 'Multas pagadas correctamente' });
});

module.exports = router;
