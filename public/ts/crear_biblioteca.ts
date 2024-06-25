import { PrismaClient } from '@prisma/client';
const pc = require('picocolors')

const prisma = new PrismaClient();

async function main() {
  const nuevaBiblioteca = await prisma.biblioteca.create({
    data: {
      Nombre: 'Biblioteca Puerto Montt',
      Direccion: 'Av. Padre Harter 125, Puerto Montt.',
      Telefono: '+56 65 2364735',
      Email: 'jumeza@inacap.cl',
    },
  });
  console.log('✅ Nueva biblioteca creada: ', pc.green(nuevaBiblioteca));

  const allBibliotecas = await prisma.biblioteca.findMany()
  console.log(allBibliotecas)
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
