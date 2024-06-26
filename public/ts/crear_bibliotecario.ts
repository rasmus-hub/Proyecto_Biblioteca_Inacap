import { PrismaClient } from '@prisma/client';
const pc = require('picocolors')

const prisma = new PrismaClient();

async function main() {
  const nuevoBibliotecario = await prisma.bibliotecario.create({
    data: {
        Rut: '55555555-5',
        Nombre: 'Ulises',
        Apellido: 'Gonzales',
        Usuario: 'ugonzales12',
        Contrasena: 'IaGh@73#93',
        Email: 'ulises.gonzales@inacapmail.cl',
        BibliotecaID: 1,
    },
  });
  console.log('✅ Nuevo bibliotecario creado: ', pc.green(nuevoBibliotecario));

  const allBibliotecarios = await prisma.bibliotecario.findMany()
  console.log(allBibliotecarios)
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
