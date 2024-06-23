import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
  await prisma.usuario.create({
    data: {
        Rut: '11111111-1',
        Nombres: 'Juan Robinson',
        Apellidos: 'Olivera Bastias',
        Email: 'juan.olivera@inacapmail.cl',
        Tipo_usuario: 'alumno'
    }
  })
  console.log('Nuevo usuario creado')

  const allUsuarios = await prisma.usuario.findMany()
  console.log(allUsuarios)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })