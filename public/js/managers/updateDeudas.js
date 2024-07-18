const prisma = require('../../../database/dbConexion');

const updateDeudas = async () => {
    try {
        // Obtener los detalles de préstamos atrasados que no han sido devueltos
        const prestamosAtrasados = await prisma.detallePrestamo.findMany({
            where: {
                Fecha_Devolucion: {
                    lt: new Date(),
                },
                Estado_Detalle: 'No Devuelto',
            },
            include: {
                Prestamos: {
                    include: {
                        Multa: true
                    }
                },
                Libro: true,
            },
        });

        for (const detalle of prestamosAtrasados) {
            const diasRetraso = Math.ceil((new Date() - new Date(detalle.Fecha_Devolucion)) / (1000 * 60 * 60 * 24));
            const prestamoID = detalle.Prestamos.PrestamoID;
            const multaExistente = await prisma.multa.findFirst({
                where: {
                    Prestamos_PrestamoID: prestamoID,
                },
            });

            if (!multaExistente) {
                // Crear nueva multa si no existe
                await prisma.multa.create({
                    data: {
                        Dias_Atraso: diasRetraso,
                        Deuda: diasRetraso * 1000, // Monto de la multa por día de retraso
                        Estado_Multa: 'Impaga',
                        Prestamos_PrestamoID: prestamoID,
                    },
                });
            } else {
                // Actualizar la multa existente
                await prisma.multa.update({
                    where: {
                        MultaID: multaExistente.MultaID,
                    },
                    data: {
                        Dias_Atraso: diasRetraso,
                        Deuda: diasRetraso * 1000, // Actualizar el monto de la multa
                    },
                });
            }
        }

        console.log('Deudas actualizadas y multas aplicadas.');
    } catch (error) {
        console.error('Error al actualizar deudas y aplicar multas:', error);
    }
};

module.exports = updateDeudas;
