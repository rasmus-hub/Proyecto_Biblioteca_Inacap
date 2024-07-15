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

// Renderizar pagina buscador de usuarios
const renderBuscadorUsuarios = async (req, res) => {
    try {
        const rutUsuario = req.params.rut;

        // Obtener los datos del usuario
        const usuarioData = await getDeudasByUsuario(rutUsuario);

        if (!usuarioData) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Obtener los libros prestados al usuario
        const prestamos = await prisma.prestamos.findMany({
            where: { Usuario_Rut: rutUsuario },
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
            prestamo.DetallePrestamos.map(detalle => ({
                libro: detalle.Libro.Titulo,
                diasAtraso: detalle.Dias_Atraso,
                montoDeuda: prestamo.Multa ? prestamo.Multa.Deuda : 0
            }))
        );

        res.render('buscadorUsuarios', {
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
            rut_Usuario: usuarioData.Rut,
            nombreUsuario: usuarioData.Nombres,
            emailUsuario: usuarioData.Email,
            tipoUsuario: usuarioData.Tipo_usuario,
            prestamos,
            deudas,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
};

module.exports = {
    renderBuscadorUsuarios,
};