const { PrismaClient } = require('@prisma/client');
const pc = require('picocolors');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos exitosamente');
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos: ', err);
    await prisma.$disconnect();
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

module.exports = prisma;
