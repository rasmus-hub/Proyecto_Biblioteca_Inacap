import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Obtener la fecha actual en la zona horaria de Chile
  const chileTimeZone = 'America/Santiago';
  const now = new Date();

  // Convertir la fecha actual a la zona horaria de Chile sin la hora
  const chileDate = new Date(now.toLocaleDateString('en-US', { timeZone: chileTimeZone }));

  const nuevoPrestamo = await prisma.prestamos.create({
    data: {
      Fecha_Prestamo: chileDate,
      Cantidad_Libros: 3,
      Estado_Prestamo: 'pendiente',
      Usuario_Rut: '11111111-1',
    },
  });
  console.log('Nuevo préstamo creado:', nuevoPrestamo);

  let libro_id = 1
  const chileDatePlus7 = new Date(chileDate)
  chileDatePlus7.setDate(chileDatePlus7.getDate() + 7)

  for (let i = 1; i <= nuevoPrestamo.Cantidad_Libros; i++) {
    const nuevoDetallePrestamo = await prisma.detallePrestamo.create({
      data: {
        Prestamos_PrestamoID: nuevoPrestamo.PrestamoID,
        Libro_LibroID: libro_id,
        Estado_Detalle: 'pendiente',
        Fecha_Devolucion: chileDatePlus7,
        Dias_Atraso: 0,
      }
    })
    libro_id++;
    console.log('Nuevo detalle creado: ', nuevoDetallePrestamo)
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
