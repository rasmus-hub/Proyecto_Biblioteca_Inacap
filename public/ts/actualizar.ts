import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Obtener la fecha actual en la zona horaria de Chile
  const post = await prisma.usuario.update({
    where: { Rut: '11111111-1' },
    data: { Nombres: 'Matias Robinson' },
  })
  console.log(post)
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
