const express = require('express');
const router = express.Router();
const prisma = require('/Users/olive/Desktop/Proyectos INACAP/Taller de Desarrollo de Aplicaciones/Actividad 4/Proyecto_Biblioteca_Inacap/database/dbConexion');

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

// Renderizar pagina gestion de prestamos
router.get('/gestionPrestamos', async (req, res) => {
    try {
        const prestamos = await prisma.prestamos.findMany();
        res.render('gestionPrestamos', {
            prestamos,
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los préstamos');
    }
});

// Obtener todos los préstamos
router.get('/api/prestamos', async (req, res) => {
    try {
        const prestamos = await prisma.prestamos.findMany();
        res.json(prestamos);
    } catch (error) {
        console.error('Error fetching prestamos:', error);
        res.status(500).json({ error: 'Error fetching prestamos' });
    }
});

// Renderizar pagina de detalle prestamos
router.get('/detallePrestamos', async (req, res) => {
    try {
        const detallePrestamos = await prisma.detallePrestamo.findMany();
        res.render('detallePrestamos', {
            detallePrestamos,
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los detalles de préstamos')
    }
})

// Obtener todos los detalle prestamos
router.get('/api/detallePrestamos', async (req, res) => {
    try {
        const detallePrestamos = await prisma.detallePrestamo.findMany();
        res.json(detallePrestamos);
    } catch (error) {
        console.error('Error fetching detallePrestamos: ', error);
        res.status(500).json({ error: 'Error fetching detallePrestamos ' });
    }
})

// Agregar un préstamo
router.post('/api/prestamos', async (req, res) => {
    try {
        const { rut, cantidadLibros } = req.body;

        const chileTimeZone = 'America/Santiago';
        const now = new Date();
        const chileDate = new Date(now.toLocaleDateString('en-US', { timeZone: chileTimeZone }));

        const nuevoPrestamo = await prisma.prestamos.create({
            data: {
                Fecha_Prestamo: chileDate,
                Cantidad_Libros: cantidadLibros,
                Estado_Prestamo: 'pendiente',
                Usuario_Rut: rut,
            },
        });

        res.json(nuevoPrestamo);
    } catch (error) {
        console.error('Error creating prestamo:', error);
        res.status(500).json({ error: 'Error creating prestamo' });
    }
});

router.post('/api/detallePrestamos', async (req, res) => {
    try {
        const { prestamoID, libro_id } = req.body;

        const chileTimeZone = 'America/Santiago';
        const now = new Date();
        const chileDate = new Date(now.toLocaleDateString('en-US', { timeZone: chileTimeZone }));

        // Se le agregan 7 días más a la fecha
        const chileDatePlus7 = new Date(chileDate);
        chileDatePlus7.setDate(chileDatePlus7.getDate() + 7);

        const nuevoDetallePrestamo = await prisma.detallePrestamo.create({
            data: {
                Prestamos_PrestamoID: prestamoID,
                Libro_LibroID: libro_id,
                Estado_Detalle: 'pendiente',
                Fecha_Devolucion: chileDatePlus7,
                Dias_Atraso: 0,
            },
        });

        res.json(nuevoDetallePrestamo);
    } catch (error) {
        console.error('Error creating detalle prestamo:', error);
        res.status(500).json({ error: 'Error creating detalle prestamo' });
    }
});

// Actualizar un préstamo
router.put('/api/prestamos/:id', async (req, res) => {
    try {
        const prestamoID = parseInt(req.params.id);
        const { cantidadLibros, estadoPrestamo } = req.body;

        const updatedPrestamo = await prisma.prestamos.update({
            where: { PrestamoID: prestamoID },
            data: {
                Cantidad_Libros: cantidadLibros,
                Estado_Prestamo: estadoPrestamo,
            },
        });

        res.json(updatedPrestamo);
    } catch (error) {
        console.error('Error updating prestamo:', error);
        res.status(500).json({ error: 'Error updating prestamo' });
    }
});

// Eliminar un préstamo
router.delete('/api/prestamos/:id', async (req, res) => {
    try {
        const prestamoID = parseInt(req.params.id);

        // Primero, eliminar los registros en detalleprestamo para evitar errores
        await prisma.detallePrestamo.deleteMany({
            where: { Prestamos_PrestamoID: prestamoID },
        });

        // Luego, eliminar el registro en prestamos
        await prisma.prestamos.delete({
            where: { PrestamoID: prestamoID },
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting prestamo:', error);
        res.status(500).json({ error: 'Error deleting prestamo' });
    }
});

module.exports = router;
