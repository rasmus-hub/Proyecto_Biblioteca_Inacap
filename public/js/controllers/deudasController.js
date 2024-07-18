const prisma = require('../../../database/dbConexion');

// Renderizar pagina gestion de multas
const renderGestionMultas = async (req, res) => {
    try {
        const multas = await prisma.multa.findMany({
            include: {
                Prestamos: true,
            },
        });
        res.render('gestionMultas', {
            multas,
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener las multas');
    }
};

// Obtener todas las multas
const getMultas = async (req, res) => {
    try {
        const multas = await prisma.multa.findMany({
            include: {
                Prestamos: true,
            },
        });
        res.json(multas);
    } catch (error) {
        console.error('Error fetching multas:', error);
        res.status(500).json({ error: 'Error fetching multas' });
    }
};

async function calcularMultas() {
    const prestamos = await prisma.prestamos.findMany({
        where: {
            DetallePrestamos: {
                some: {
                    Fecha_Devolucion: {
                        lt: new Date()
                    }, // Solo prestamos que aún no han sido marcados como devueltos o no devueltos
                }
            }
        },
        include: {
            DetallePrestamos: true
        }
    });

    for (const prestamo of prestamos) {
        let sumMultas = 0;
        let totalDiasRetraso = 0;

        for (const detalle of prestamo.DetallePrestamos) {
            const diasRetraso = Math.ceil((new Date() - new Date(detalle.Fecha_Devolucion)) / (1000 * 60 * 60 * 24));
            if (diasRetraso > 0) {
                sumMultas += diasRetraso * 1000; // Ajusta el monto de la multa por día de retraso
                totalDiasRetraso += diasRetraso;

                // Actualizar Estado_Detalle a 'No Devuelto' si está atrasado
                await prisma.detallePrestamo.update({
                    where: {
                        Prestamos_PrestamoID_Libro_LibroID: {
                            Prestamos_PrestamoID: detalle.Prestamos_PrestamoID,
                            Libro_LibroID: detalle.Libro_LibroID
                        }
                    },
                    data: {
                        Estado_Detalle: 'No Devuelto'
                    }
                });
            }
        }

        await prisma.prestamos.update({
            where: {
                PrestamoID: prestamo.PrestamoID
            },
            data: {
                Estado_Prestamo: 'No Devuelto'
            }
        });

        const multaExistente = await prisma.multa.findFirst({
            where: {
                Prestamos_PrestamoID: prestamo.PrestamoID
            }
        });

        if (!multaExistente) {
            await prisma.multa.create({
                data: {
                    Deuda: sumMultas,
                    Estado_Multa: 'Impaga',
                    Prestamos_PrestamoID: prestamo.PrestamoID,
                    Dias_Atraso: totalDiasRetraso,
                }
            });
        } else {
            await prisma.multa.update({
                where: {
                    MultaID: multaExistente.MultaID
                },
                data: {
                    Deuda: sumMultas,
                    Dias_Atraso: totalDiasRetraso,
                }
            });
        }
    }
}

// Función para actualizar el estado de la deuda
const updateDeuda = async (req, res) => {
    const { deudaID } = req.params;
    const { estadoMulta, fechaPago } = req.body;

    const chileTimeZone = 'America/Santiago';
    const now = new Date();
    const chileDate = new Date(now.toLocaleDateString('en-US', { timeZone: chileTimeZone }));

    try {
        const deuda = await prisma.multa.findFirst({
            where: {
                MultaID: parseInt(deudaID)
            },
            include: {
                Prestamos: true,
            }
        });

        if (!deuda) {
            return res.status(404).json({ message: 'Deuda no encontrada' });
        }

        const updatedDeuda = await prisma.multa.update({
            where: { MultaID: parseInt(deudaID) },
            data: {
                Estado_Multa: estadoMulta,
                Fecha_Pago: chileDate,
            },
            include: {
                Prestamos: true,
            }
        });

        res.json(updatedDeuda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la deuda' });
    }
};

// Función para pagar la deuda (actualizar su estado a "Pagada")
const payDeuda = async (req, res) => {
    const { deudaID } = req.params;

    const chileTimeZone = 'America/Santiago';
    const now = new Date();
    const chileDate = new Date(now.toLocaleDateString('en-US', { timeZone: chileTimeZone }));

    try {
        const deuda = await prisma.multa.findFirst({
            where: {
                MultaID: parseInt(deudaID)
            },
            include: {
                Prestamos: true,
            }
        });
        if (!deuda) {
            return res.status(404).json({ message: 'Deuda no encontrada' });
        }

        // Actualiza el estado de la deuda a "Pagada"
        const updatedDeuda = await prisma.multa.update({
            where: { MultaID: parseInt(deudaID) },
            data: {
                Estado_Multa: "Pagada",
                Fecha_Pago: chileDate
            },
            include: {
                Prestamos: true,
            }
        });

        res.json(updatedDeuda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al pagar la deuda' });
    }
};


async function eliminarMultasPagadas() {
    const unDiaAntes = new Date();
    unDiaAntes.setDate(unDiaAntes.getDate() - 1);

    await prisma.multa.deleteMany({
        where: {
            Estado_Multa: 'Pagada',
            Fecha_Pago: {
                lt: unDiaAntes
            }
        }
    });
}

module.exports = {
    renderGestionMultas,
    getMultas,
    calcularMultas,
    updateDeuda,
    payDeuda,
    eliminarMultasPagadas,
};
