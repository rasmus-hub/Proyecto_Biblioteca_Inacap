const mysql = require('mysql2');
const pc = require('picocolors')

// Crear conexion a la base de datos

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'IaGh@1204',
    database: 'bd_biblioteca'
});

db.connect(err => {
    if (err) {
        console.error(pc.red('❌ Error al conectar a la base de datos:', err.stack));
        return;
    }
    console.log('✅ Conectado a la base de datos con la id: ', db.threadId);
});

// Funciones y conexiones aqui --->

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${pc.green(PORT)}`);
});

