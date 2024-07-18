const prisma = require('../../../database/dbConexion');

const getDeudasByUsuario = async (rutUsuario) => {
    return await prisma.usuario.findUnique({
        where: { Rut: rutUsuario },
        include: {
            Prestamos: {
                include: {
                    Multa: true,
                    DetallePrestamos: {
                        include: {
                            Libro: true
                        }
                    }
                }
            }
        }
    });
};

const renderBuscadorUsuarios = async (req, res) => {
    try {
        const rutUsuario = req.params.rut;

        // Obtener los datos del usuario
        const usuarioData = await getDeudasByUsuario(rutUsuario);

        if (!usuarioData) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Obtener todos los prestamos del usuario, sin importar las deudas
        const prestamos = await prisma.prestamos.findMany({
            where: {
                Usuario_Rut: rutUsuario,
            },
            include: {
                DetallePrestamos: {
                    include: {
                        Libro: true
                    }
                }
            }
        });

        // Obtener las deudas del usuario
        const deudas = usuarioData.Prestamos.flatMap(prestamo =>
            prestamo.DetallePrestamos.map(detalle => {
                const diasRetraso = Math.ceil((new Date() - new Date(detalle.Fecha_Devolucion)) / (1000 * 60 * 60 * 24));
                const multa = prestamo.Multa ? prestamo.Multa : null;
                if (multa && multa.Deuda > 0) {
                    return {
                        libro: detalle.Libro ? detalle.Libro.Titulo : 'Desconocido',
                        diasAtraso: diasRetraso,
                        montoDeuda: diasRetraso * 1000,
                    };
                }
                return null;
            }).filter(deuda => deuda !== null) // Filtrar los nulos
        );

        res.render('buscadorUsuarios', {
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
            rut_Usuario: usuarioData.Rut,
            nombreUsuario: usuarioData.Nombres,
            emailUsuario: usuarioData.Email,
            tipoUsuario: usuarioData.Tipo_usuario, // Asegúrate de pasar tipoUsuario
            prestamos,
            deudas,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
};



// Devolver un libro (eliminar préstamo)
const devolverLibro = async (req, res) => {
    const { prestamoID, libroID } = req.params;

    try {
        const detalle = await prisma.detallePrestamo.delete({
            where: {
                Prestamos_PrestamoID_Libro_LibroID: {
                    Prestamos_PrestamoID: parseInt(prestamoID),
                    Libro_LibroID: parseInt(libroID)
                }
            }
        });

        // Si no hay más detalles de préstamo para este préstamo, elimina el préstamo también
        const remainingDetalles = await prisma.detallePrestamo.findMany({
            where: {
                Prestamos_PrestamoID: parseInt(prestamoID)
            }
        });

        if (remainingDetalles.length === 0) {
            await prisma.prestamos.delete({
                where: {
                    PrestamoID: parseInt(prestamoID)
                }
            });
        }

        res.json({ message: 'Libro devuelto con éxito' });
    } catch (error) {
        console.error('Error returning libro:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Añadir ruta para manejar la solicitud de prórroga
const solicitarProrroga = async (req, res) => {
    const { libroID, prestamoID, tipoUsuario } = req.body;

    try {
        const prestamo = await prisma.prestamos.findUnique({
            where: { PrestamoID: prestamoID },
            include: { DetallePrestamos: true }
        });

        if (!prestamo) {
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }

        const detalle = prestamo.DetallePrestamos.find(d => d.Libro_LibroID === libroID);

        if (!detalle) {
            return res.status(404).json({ message: 'Detalle de préstamo no encontrado' });
        }

        let nuevaFechaDevolucion;

        if (tipoUsuario === 'estudiante') {
            if (detalle.Renovado === 'Si') {
                return res.status(400).json({ message: 'Solo puede solicitar una renovación' });
            }
            nuevaFechaDevolucion = new Date(detalle.Fecha_Devolucion);
            nuevaFechaDevolucion.setDate(nuevaFechaDevolucion.getDate() + 3);
            detalle.Renovado = 'Si';
        } else if (tipoUsuario === 'docente') {
            if (!detalle.NumeroRenovaciones) {
                detalle.NumeroRenovaciones = 0;
            }
            if (detalle.NumeroRenovaciones >= 3) {
                return res.status(400).json({ message: 'No puede renovar más de 3 veces' });
            }
            nuevaFechaDevolucion = new Date(detalle.Fecha_Devolucion);
            nuevaFechaDevolucion.setDate(nuevaFechaDevolucion.getDate() + 7); // Ejemplo: 7 días para cada renovación
            detalle.NumeroRenovaciones++;
        }

        // Actualizar la base de datos
        await prisma.detallePrestamo.update({
            where: {
                Prestamos_PrestamoID_Libro_LibroID: {
                    Prestamos_PrestamoID: detalle.Prestamos_PrestamoID,
                    Libro_LibroID: detalle.Libro_LibroID,
                }
            },
            data: {
                Fecha_Devolucion: nuevaFechaDevolucion,
                Renovado: detalle.Renovado,
                NumeroRenovaciones: detalle.NumeroRenovaciones
            }
        });

        res.status(200).json({ message: 'Prórroga solicitada con éxito', nuevaFechaDevolucion });
    } catch (error) {
        console.error('Error solicitando prórroga:', error);
        res.status(500).json({ message: 'Error solicitando prórroga' });
    }
};

module.exports = {
    renderBuscadorUsuarios,
    devolverLibro,
    solicitarProrroga
};
