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

        let tipoUsuario = "";
        const tipoUsuarioResult = await prisma.usuario.findFirst({
            where: {
                Rut: rut
            },
            select: {
                Tipo_usuario: true
            }
        });

        tipoUsuario = tipoUsuarioResult.Tipo_usuario;

        // Verificar si el usuario tiene multas impagas
        const multasImpagas = await prisma.multa.findFirst({
            where: {
                Prestamos: {
                    Usuario_Rut: rut,
                },
                Estado_Multa: 'Impaga',
            },
        });

        if (multasImpagas) {
            return res.status(400).json({ error: 'El usuario tiene multas impagas' });
        }

        if (tipoUsuario == "alumno" && cantidadLibros <= 4) {
            const nuevoPrestamo = await prisma.prestamos.create({
                data: {
                    Fecha_Prestamo: chileDate,
                    Cantidad_Libros: cantidadLibros,
                    Estado_Prestamo: 'Prestado',
                    Usuario_Rut: rut,
                },
            });

            res.json(nuevoPrestamo);
        } else if (tipoUsuario == "docente") {
            const nuevoPrestamo = await prisma.prestamos.create({
                data: {
                    Fecha_Prestamo: chileDate,
                    Cantidad_Libros: cantidadLibros,
                    Estado_Prestamo: 'Prestado',
                    Usuario_Rut: rut,
                },
            });

            res.json(nuevoPrestamo);
        } else {
            return res.status(400).json({ error: 'No se puede crear un préstamo para alumnos con más de 4 libros' });
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

        // Verificar si el préstamo existe
        const prestamoExistente = await prisma.prestamos.findUnique({
            where: { PrestamoID: prestamoID },
            include: {
                Usuario: true,
            },
        });

        if (!prestamoExistente) {
            return res.status(404).json({ error: 'El préstamo especificado no existe' });
        }

        const rut = prestamoExistente.Usuario_Rut;

        // Verificar si el usuario tiene multas impagas
        const multasImpagas = await prisma.multa.findFirst({
            where: {
                Prestamos: {
                    Usuario_Rut: rut,
                },
                Estado_Multa: 'Impaga',
            },
        });

        if (multasImpagas) {
            throw new Error('El usuario tiene multas impagas');
        }

        // Verificar si el usuario ya ha completado la cuota de libros posibles en préstamo
        const prestamosActivos = await prisma.prestamos.findMany({
            where: {
                Usuario_Rut: rut,
                Estado_Prestamo: 'Prestado',
            },
            include: {
                DetallePrestamos: true,
            },
        });

        let cantidadLibrosPrestados = 0;
        prestamosActivos.forEach(prestamo => {
            cantidadLibrosPrestados += prestamo.DetallePrestamos.length;
        });

        let tipoUsuario = prestamoExistente.Usuario.Tipo_usuario;
        const cuotaMaxima = tipoUsuario === 'alumno' ? 4 : 10; // Asumiendo que los docentes pueden prestar hasta 10 libros

        if (cantidadLibrosPrestados >= cuotaMaxima) {
            throw new Error('El usuario ha alcanzado la cuota máxima de libros en préstamo');
        }

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
                Estado_Detalle: 'Prestado',
                Fecha_Devolucion: chileDatePlus,
                Renovado: "No",
            },
        });

        res.json(nuevoDetallePrestamo);
    } catch (error) {
        console.error('Error creating detalle prestamo:', error);
        res.status(500).json({ error: 'Error creating detalle prestamo' });
    }
};

// Agregar un nuevo detalle prestamo
const addNewDetallePrestamo = async (req, res) => {
    const { prestamoID, libro_id } = req.body;

    // Implementar la lógica de verificación y creación del detalle de préstamo
    try {
        // Lógica existente en `addDetallePrestamo`
        const nuevoDetallePrestamo = await addDetallePrestamo({ prestamoID, libro_id });
        res.json(nuevoDetallePrestamo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getPrestamoID = async (req, res) => {
    const prestamoID = parseInt(req.params.id);

    try {
        const prestamo = await prisma.prestamos.findUnique({
            where: { PrestamoID: prestamoID },
        });

        if (prestamo) {
            res.json(prestamo);
        } else {
            res.status(404).json({ error: 'Préstamo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el préstamo' });
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

// Obtener el reporte de préstamos por fecha y tipo de usuario
const getReportePrestamos = async (req, res) => {
    const { fecha, tipoUsuario } = req.query;

    try {
        const chileTimeZone = 'America/Santiago';
        const now = new Date(fecha);
        const chileDate = new Date(now.toLocaleDateString('en-US', { timeZone: chileTimeZone }));

        const chileDatePlus = new Date(chileDate);
        chileDatePlus.setDate(chileDatePlus.getDate() + 1);

        console.log(chileDatePlus)

        const prestamos = await prisma.prestamos.findMany({
            where: {
                Fecha_Prestamo: chileDatePlus,
                Usuario: {
                    Tipo_usuario: tipoUsuario
                }
            },
            include: {
                Usuario: true // Para obtener la información del usuario
            }
        });

        res.json(prestamos);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Error fetching report' });
    }
};

module.exports = {
    renderGestionPrestamos,
    getPrestamos,
    renderDetallePrestamos,
    getDetallePrestamos,
    addPrestamo,
    addDetallePrestamo,
    addNewDetallePrestamo,
    getPrestamoID,
    updatePrestamo,
    deletePrestamo,
    getDetallePrestamosForPrestamo,
    getReportePrestamos
};