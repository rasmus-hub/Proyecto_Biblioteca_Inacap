const prisma = require('../../../database/dbConexion');

// Renderizar pagina gestion de prestamos
const renderGestionLibros = async (req, res) => {
    try {
        const libros = await prisma.libro.findMany();
        res.render('gestionLibros', {
            libros,
            login: true,
            name: req.session.name,
            lastname: req.session.lastname,
            email: req.session.email,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los libros');
    }
};

// Obtener todos los libros
const getLibros = async (req, res) => {
    try {
        const libros = await prisma.libro.findMany()
        res.json(libros);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo libro
const createLibro = async (req, res) => {
    const { titulo, autor, editorial, anoPublicacion, copias } = req.body;

    try {
        const nuevoLibro = await prisma.libro.create({
            data: {
                Titulo: titulo,
                Autor: autor,
                Editorial: editorial,
                Ano_Publicacion: anoPublicacion,
                Copias: copias,
                BibliotecaID: 1
            }
        });

        res.status(201).json(nuevoLibro);
    } catch (error) {
        console.error('Error creating libro:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Actualizar un libro
const updateLibro = async (req, res) => {
    const { libroID } = req.params;
    const { titulo, autor, editorial, anoPublicacion, copias } = req.body;

    try {
        const libro = await prisma.libro.findFirst({
            where: {
                LibroID: parseInt(libroID)
            }
        });
        if (libro) {
            const updatedLibro = await prisma.libro.update({
                where: {
                    LibroID: parseInt(libroID)
                },
                data: {
                    Titulo: titulo,
                    Autor: autor,
                    Editorial: editorial,
                    Ano_Publicacion: anoPublicacion,
                    Copias: copias
                }
            });

            res.json(updatedLibro);
        } else {
            res.status(404).json({ message: 'Libro no encontrado' });
        }
    } catch (error) {
        console.error('Error updating libro:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Eliminar un libro
const deleteLibro = async (req, res) => {
    const libroID = parseInt(req.params.libroID, 10); // Asegúrate de que sea un número entero

    try {
        const libro = await prisma.libro.findUnique({
            where: {
                LibroID: libroID,
            },
        });

        if (libro) {
            await prisma.libro.delete({
                where: { LibroID: libroID },
            });

            res.json({ message: 'Libro eliminado con éxito' });
        } else {
            res.status(404).json({ message: 'Libro no encontrado' });
        }
    } catch (error) {
        console.error('Error deleting libro:', error);
        res.status(500).json({ message: error.message });
    }
};

// Desactivar un libro
const deactivateLibro = async (req, res) => {
    const { libroID } = req.params;

    try {
        const libro = await prisma.libro.findFirst({
            where: { LibroID: parseInt(libroID) }
        });

        if (libro) {
            const libroDesactivado = await prisma.libro.update({
                where: { LibroID: parseInt(libroID) },
                data: { Estado: 'Desactivado' }
            });

            res.json(libroDesactivado);
        } else {
            res.status(404).json({ message: 'Libro no encontrado' });
        }
    } catch (error) {
        console.error('Error desactivando libro:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

module.exports = {
    renderGestionLibros,
    getLibros,
    createLibro,
    updateLibro,
    deleteLibro,
    deactivateLibro
};
