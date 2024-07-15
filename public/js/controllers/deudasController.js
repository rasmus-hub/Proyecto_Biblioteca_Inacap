const prisma = require('/Users/olive/Desktop/Proyectos INACAP/Taller de Desarrollo de Aplicaciones/Actividad 4/Proyecto_Biblioteca_Inacap/database/dbConexion');

async function checkUserMultas(rut) {
    const multas = await prisma.multa.findMany({
        where: {
            Prestamos: {
                Usuario_Rut: rut
            },
            Estado_Multa: 'Impaga'
        }
    });
    return multas.length > 0;
}

async function checkUserRetraso(rut) {
    const retrasos = await prisma.detallePrestamo.findMany({
        where: {
            Prestamos: {
                Usuario_Rut: rut
            },
            Fecha_Devolucion: {
                lt: new Date()
            }
        },
        include: {
            Libro: true
        }
    });
    return retrasos;
}

async function calcularMultas() {
    const prestamos = await prisma.detallePrestamo.findMany({
        where: {
            Fecha_Devolucion: {
                lt: new Date()
            }
        },
        include: {
            Prestamos: true
        }
    });

    for (const detalle of prestamos) {
        const diasRetraso = Math.ceil((new Date() - new Date(detalle.Fecha_Devolucion)) / (1000 * 60 * 60 * 24));
        const multaExistente = await prisma.multa.findFirst({
            where: {
                Prestamos_PrestamoID: detalle.Prestamos_PrestamoID
            }
        });

        if (!multaExistente) {
            await prisma.multa.create({
                data: {
                    Deuda: diasRetraso * 1000,
                    Estado_Multa: 'Impaga',
                    Prestamos_PrestamoID: detalle.Prestamos_PrestamoID
                }
            });
        } else {
            await prisma.multa.update({
                where: {
                    MultaID: multaExistente.MultaID
                },
                data: {
                    Deuda: diasRetraso * 1000
                }
            });
        }
    }
}

async function pagarMulta(rut) {
    await prisma.multa.updateMany({
        where: {
            Prestamos: {
                Usuario_Rut: rut
            },
            Estado_Multa: 'Impaga'
        },
        data: {
            Estado_Multa: 'Pagada',
            Fecha_Pago: new Date() // Assuming you add this column to track the payment date
        }
    });
}

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

async function getUserDeudas(rut) {
    const deudas = await prisma.multa.findMany({
        where: {
            Prestamos: {
                Usuario_Rut: rut
            },
            Estado_Multa: 'Impaga'
        },
        include: {
            Prestamos: {
                include: {
                    DetallePrestamos: {
                        include: {
                            Libro: true
                        }
                    }
                }
            }
        }
    });

    return deudas.map(deuda => {
        const detalle = deuda.Prestamos.DetallePrestamos[0]; // Assuming one detail per loan
        return {
            libro: detalle.Libro.Titulo,
            diasAtraso: Math.ceil((new Date() - new Date(detalle.Fecha_Devolucion)) / (1000 * 60 * 60 * 24)),
            montoDeuda: deuda.Deuda
        };
    });
}

module.exports = {
    getUserDeudas,
    checkUserMultas,
    checkUserRetraso,
    calcularMultas,
    pagarMulta,
    eliminarMultasPagadas
};
