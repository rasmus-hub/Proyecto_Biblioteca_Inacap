const prisma = require('../../../database/dbConexion');

// Renderizar pagina gestion de prestamos
const renderGestionPrestamos = async (req, res) => {
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
};

// Obtener todos los préstamos
const getPrestamos = async (req, res) => {
    try {
        const prestamos = await prisma.prestamos.findMany();
        res.json(prestamos);
    } catch (error) {
        console.error('Error fetching prestamos:', error);
        res.status(500).json({ error: 'Error fetching prestamos' });
    }
};

// Renderizar pagina de detalle prestamos
const renderDetallePrestamos = async (req, res) => {
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
};

// Obtener todos los detalle prestamos
const getDetallePrestamos = async (req, res) => {
    try {
        const detallePrestamos = await prisma.detallePrestamo.findMany();
        res.json(detallePrestamos);
    } catch (error) {
        console.error('Error fetching detallePrestamos: ', error);
        res.status(500).json({ error: 'Error fetching detallePrestamos ' });
    }
};

// Agregar un préstamo
const addPrestamo = async (req, res) => {
    try {
        const { rut, cantidadLibros } = req.body;

        const chileTimeZone = 'America/Santiago';
        const now = new Date();
        const chileDate = new Date(now.toLocaleDateString('en-US', { timeZone: chileTimeZone }));

        let tipoUsuario;
        const tipoUsuarioResult = await prisma.usuario.findFirst({
            where: {
                Rut: rut
            },
            select: {
                Tipo_usuario: true
            }
        });

        tipoUsuario = tipoUsuarioResult.Tipo_usuario;

        if (tipoUsuario == "alumno" && cantidadLibros <= 4) {
            const nuevoPrestamo = await prisma.prestamos.create({
                data: {
                    Fecha_Prestamo: chileDate,
                    Cantidad_Libros: cantidadLibros,
                    Estado_Prestamo: 'pendiente',
                    Usuario_Rut: rut,
                },
            });

            res.json(nuevoPrestamo);
        } else {
            if (tipoUsuario == "docente") {
                const nuevoPrestamo = await prisma.prestamos.create({
                    data: {
                        Fecha_Prestamo: chileDate,
                        Cantidad_Libros: cantidadLibros,
                        Estado_Prestamo: 'pendiente',
                        Usuario_Rut: rut,
                    },
                });

                res.json(nuevoPrestamo);
            } else {
                console.error('No se puede crear un prestamo para alumno de más de 4 libros');
            }
        }

    } catch (error) {
        console.error('Error creating prestamo:', error);
        res.status(500).json({ error: 'Error creating prestamo' });
    }
};

// Agregar un detalle prestamo al mismo tiempo que se crea un prestamo
const addDetallePrestamo = async (req, res) => {
    try {
        const { prestamoID, libro_id } = req.body;

        let tipoUsuario;

        const rutResult = await prisma.prestamos.findFirst({
            where: {
                PrestamoID: prestamoID
            },
            select: {
                Usuario_Rut: true
            }
        });

        if (rutResult) {
            const rut = rutResult.Usuario_Rut;

            const tipoUsuarioResult = await prisma.usuario.findFirst({
                where: {
                    Rut: rut
                },
                select: {
                    Tipo_usuario: true
                }
            });

            if (tipoUsuarioResult) {
                tipoUsuario = tipoUsuarioResult.Tipo_usuario;
            } else {
                console.log("Usuario no encontrado.");
            }
        } else {
            console.log("Préstamo no encontrado.");
        }

        const chileTimeZone = 'America/Santiago';
        const now = new Date();
        const chileDate = new Date(now.toLocaleDateString('en-US', { timeZone: chileTimeZone }));

        // Se le agregan 7 días más a la fecha
        let chileDatePlus;
        if (tipoUsuario == "alumno") {
            chileDatePlus = new Date(chileDate);
            chileDatePlus.setDate(chileDatePlus.getDate() + 7);
        } else {
            chileDatePlus = new Date(chileDate);
            chileDatePlus.setDate(chileDatePlus.getDate() + 20);
        }

        const nuevoDetallePrestamo = await prisma.detallePrestamo.create({
            data: {
                Prestamos_PrestamoID: prestamoID,
                Libro_LibroID: libro_id,
                Estado_Detalle: 'pendiente',
                Fecha_Devolucion: chileDatePlus,
                Dias_Atraso: 0,
            },
        });

        res.json(nuevoDetallePrestamo);

    } catch (error) {
        console.error('Error creating detalle prestamo:', error);
        res.status(500).json({ error: 'Error creating detalle prestamo' });
    }
};

// Actualizar un préstamo
const updatePrestamo = async (req, res) => {
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
};

// Eliminar un préstamo
const deletePrestamo = async (req, res) => {
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
};

// Obtener detalle prestamos segun el prestamo que se quiera ver
const getDetallePrestamosForPrestamo = async (req, res) => {
    try {
        const prestamoID = parseInt(req.params.id);

        // Buscar los detalle prestamos de ese prestamo
        const detallePrestamos = await prisma.detallePrestamo.findMany({
            where: { Prestamos_PrestamoID: prestamoID }
        });

        res.json(detallePrestamos);
    } catch (error) {
        console.error('Error fetching detallePrestamos: ', error);
        res.status(500).json({ error: 'Error fetching detallePrestamos ' });
    }
};

module.exports = {
    renderGestionPrestamos,
    getPrestamos,
    renderDetallePrestamos,
    getDetallePrestamos,
    addPrestamo,
    addDetallePrestamo,
    updatePrestamo,
    deletePrestamo,
    getDetallePrestamosForPrestamo,
};