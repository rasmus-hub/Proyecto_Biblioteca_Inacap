const itemsPerPage = 10; // Número de elementos por página
let currentPage = 1; // Página actual
let libros = []; // Array de datos de libros

// Fetch de datos desde el servidor
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/libros')
        .then(response => response.json())
        .then(data => {
            libros = data;
            renderTable();
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Renderizar la tabla con los datos paginados
function renderTable() {
    const tableBody = document.getElementById('libroTabla');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const librosMostrar = libros.slice(start, end);

    librosMostrar.forEach(libro => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${libro.LibroID}</td>
            <td>${libro.Titulo}</td>
            <td>${libro.Autor}</td>
            <td>${libro.Editorial}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="updateLibro(${libro.LibroID})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteLibro(${libro.LibroID})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

function addLibro() {
    alertify.dialog('prompt').set({
        labels: { ok: 'Añadir', cancel: 'Cancelar' },
        title: 'Agregar Nuevo Libro',
        onok: function () {
            const titulo = this.elements.content.querySelector('#titulo').value;
            const autor = this.elements.content.querySelector('#autor').value;
            const editorial = this.elements.content.querySelector('#editorial').value;
            const anoPublicacion = parseInt(this.elements.content.querySelector('#anoPublicacion').value);
            const copias = parseInt(this.elements.content.querySelector('#copias').value);

            fetch('/api/libros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, autor, editorial, anoPublicacion, copias }),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.message) });
                    }
                    return response.json();
                })
                .then(nuevoLibro => {
                    libros.push(nuevoLibro);
                    renderTable();
                    alertify.success('Libro agregado con éxito');
                })
                .catch(error => {
                    console.error('Error adding libro:', error);
                    alertify.error('Error adding libro: ' + error.message);
                });
        },
        onshow: function () {
            this.setContent(`
                <label for="titulo">Título:</label>
                <input id="titulo" type="text" class="form-control">
                <label for="autor">Autor:</label>
                <input id="autor" type="text" class="form-control">
                <label for="editorial">Editorial:</label>
                <input id="editorial" type="text" class="form-control">
                <label for="anoPublicacion">Año de Publicación:</label>
                <input id="anoPublicacion" type="number" class="form-control">
                <label for="copias">Copias:</label>
                <input id="copias" type="number" class="form-control">
            `);
        },
    }).show();
}

function updateLibro(libroID) {
    const libro = libros.find(libro => libro.LibroID === libroID);

    alertify.dialog('prompt').set({
        labels: { ok: 'Actualizar', cancel: 'Cancelar' },
        title: 'Actualizar Libro',
        onok: function () {
            const titulo = this.elements.content.querySelector('#titulo').value;
            const autor = this.elements.content.querySelector('#autor').value;
            const editorial = this.elements.content.querySelector('#editorial').value;
            const anoPublicacion = parseInt(this.elements.content.querySelector('#anoPublicacion').value);
            const copias = parseInt(this.elements.content.querySelector('#copias').value);

            fetch(`/api/libros/${libroID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, autor, editorial, anoPublicacion, copias }),
            })
                .then(response => response.json())
                .then(libroActualizado => {
                    const index = libros.findIndex(libro => libro.LibroID === libroID);
                    libros[index] = libroActualizado;
                    renderTable();
                    alertify.success('Libro actualizado con éxito');
                })
                .catch(error => console.error('Error updating libro:', error));
        },
        onshow: function () {
            this.setContent(`
                <label for="titulo">Título:</label>
                <input id="titulo" type="text" class="form-control" value="${libro.Titulo}">
                <label for="autor">Autor:</label>
                <input id="autor" type="text" class="form-control" value="${libro.Autor}">
                <label for="editorial">Editorial:</label>
                <input id="editorial" type="text" class="form-control" value="${libro.Editorial}">
                <label for="anoPublicacion">Año de Publicación:</label>
                <input id="anoPublicacion" type="number" class="form-control" value="${libro.Ano_Publicacion}">
                <label for="copias">Copias:</label>
                <input id="copias" type="number" class="form-control" value="${libro.Copias}">
            `);
        },
    }).show();
}

function deleteLibro(libroID) {
    alertify.confirm('Eliminar Libro', '¿Estás seguro de que deseas eliminar este libro?', function () {
        fetch(`/api/libros/${libroID}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    libros = libros.filter(libro => libro.LibroID !== libroID);
                    renderTable();
                    alertify.success('Libro eliminado con éxito');
                } else {
                    alertify.error('Error eliminando el libro');
                }
            })
            .catch(error => console.error('Error deleting libro:', error));
    }, function () {
        alertify.error('Cancelado');
    });
}

function deactivateLibro(libroID) {
    alertify.confirm('Desactivar Libro', '¿Estás seguro de que deseas desactivar este libro?', function () {
        fetch(`/api/libros/${libroID}/desactivar`, {
            method: 'PATCH',
        })
            .then(response => {
                if (response.ok) {
                    const libro = libros.find(libro => libro.LibroID === libroID);
                    if (libro) {
                        libro.Estado = 'Desactivado';
                        renderTable();
                        alertify.success('Libro desactivado con éxito');
                    }
                } else {
                    alertify.error('Error desactivando el libro');
                }
            })
            .catch(error => console.error('Error desactivando libro:', error));
    }, function () {
        alertify.error('Cancelado');
    });
}

function updatePagination() {
    const totalPages = Math.ceil(libros.length / itemsPerPage);
    const footer = document.getElementById('footer');
    const currentPageItem = footer.querySelector('.page-link');
    currentPageItem.textContent = `${currentPage}-${totalPages} de ${totalPages}`;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(libros.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function searchLibros() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchType = document.getElementById('searchType').value;

    const filteredLibros = libros.filter(libro => {
        if (searchType === 'libroID') {
            return libro.LibroID.toString().includes(searchInput);
        } else if (searchType === 'titulo') {
            return libro.Titulo.toLowerCase().includes(searchInput);
        }
    });

    const tableBody = document.getElementById('libroTabla');
    tableBody.innerHTML = '';

    filteredLibros.forEach(libro => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${libro.LibroID}</td>
            <td>${libro.Titulo}</td>
            <td>${libro.Autor}</td>
            <td>${libro.Editorial}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="updateLibro(${libro.LibroID})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteLibro(${libro.LibroID})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}
