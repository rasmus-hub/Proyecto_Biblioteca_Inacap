const deudasController = require('../controllers/deudasController');

async function handleCheckMultas(req, res) {
    const rut = req.body.rut;
    const tieneMultas = await deudasController.checkUserMultas(rut);
    res.send({ tieneMultas });
}

async function handleCheckRetraso(req, res) {
    const rut = req.body.rut;
    const tieneRetraso = await deudasController.checkUserRetraso(rut);
    res.send({ tieneRetraso });
}

async function handleCalcularMultas(req, res) {
    await deudasController.calcularMultas();
    res.send({ message: 'Multas calculadas correctamente' });
}

async function handlePagarMulta(req, res) {
    const rut = req.body.rut;
    await deudasController.pagarMulta(rut);
    res.send({ message: 'Multas pagadas correctamente' });
}

module.exports = {
    handleCheckMultas,
    handleCheckRetraso,
    handleCalcularMultas,
    handlePagarMulta
};
