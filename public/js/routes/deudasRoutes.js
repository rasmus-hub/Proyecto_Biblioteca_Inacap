const express = require('express');
const router = express.Router();
const deudasController = require('../controllers/deudasController');

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
