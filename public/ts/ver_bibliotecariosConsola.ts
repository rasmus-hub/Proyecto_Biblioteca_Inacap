import { PrismaClient } from '@prisma/client';
const pc = require('picocolors')

const prisma = new PrismaClient();

async function main() {
  //const usuarioIngresado = (<HTMLInputElement>document.getElementById('inputUsuario')).value
  //const contrasenaIngresada = (<HTMLInputElement>document.getElementById('inputPassword')).value
  const usuarioIngresado = 'ugonzales12'
  const contrasenaIngresada = 'IaGh@73#93'
  try {
    const bibliotecario = await prisma.bibliotecario.findFirst({
      where: {
        Usuario: usuarioIngresado,
      },
    });
    if (bibliotecario && bibliotecario.Contrasena === contrasenaIngresada) {
      console.log(`✅ Usuario "${usuarioIngresado}" bienvenido!`)
      //alert(`Usuario "${usuarioIngresado}" bienvenido!`)
      //window.open('index.html', '_blank')
    } else {
      //alert(`Usuario "${usuarioIngresado}" no encontrado o contraseña incorrecta ❌`)
      console.log(`Usuario "${usuarioIngresado}" no encontrado o contraseña incorrecta ❌`)
    }
    
  } catch (err) {
    console.error('Error al verificar el usuario: ', err)
  } finally {
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
