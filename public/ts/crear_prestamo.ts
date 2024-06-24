import { PrismaClient } from '@prisma/client';

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
      Estado_Prestamo: 'Pendiente',
      Usuario_Rut: '22222222-2',
    },
  });
  console.log('Nuevo préstamo creado:', nuevoPrestamo);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
