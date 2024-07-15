const cron = require('node-cron');
const deudasController = require('../controllers/deudasController');

// Programa el trabajo para que se ejecute todos los días a la medianoche
cron.schedule('0 0 * * *', async () => {
    console.log('Eliminando multas pagadas...');
    await deudasController.eliminarMultasPagadas();
    console.log('Multas pagadas eliminadas.');
});
