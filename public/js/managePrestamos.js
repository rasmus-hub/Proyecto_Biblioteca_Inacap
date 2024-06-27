const itemsPerPage = 10; // Número de elementos por página
let currentPage = 1; // Página actual
let prestamos = []; // Array de datos de préstamos
let detallePrestamos = []; // Array de datos de detalle prestamos


// Fetch de datos desde el servidor
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/prestamos')
        .then(response => response.json())
        .then(data => {
            prestamos = data;
            renderTable();
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Renderizar la tabla con los datos paginados
function renderTable() {
    const tableBody = document.getElementById('prestamoTabla');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const prestamosMostrar = prestamos.slice(start, end);

    prestamosMostrar.forEach(prestamo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${prestamo.PrestamoID}</td>
            <td>${prestamo.Usuario_Rut}</td>
            <td>${new Date(prestamo.Fecha_Prestamo).toLocaleDateString('es-CL')}</td>
            <td>${prestamo.Cantidad_Libros}</td>
            <td>${prestamo.Estado_Prestamo}</td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

function addPrestamo() {
    alertify.dialog('prompt').set({
        labels: { ok: 'Añadir', cancel: 'Cancelar' },
        title: 'Agregar Nuevo Préstamo',
        onok: function () {
            const rut = this.elements.content.querySelector('#rutUsuario').value.toString();
            const cantidadLibros = parseInt(this.elements.content.querySelector('#cantidadLibros').value);

            fetch('/api/prestamos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rut, cantidadLibros }),
            })
                .then(response => response.json())
                .then(async nuevoPrestamo => {
                    prestamos.push(nuevoPrestamo);
                    renderTable();

                    for (let i = 1; i <= cantidadLibros; i++) {
                        await addDetallePrestamo(nuevoPrestamo.PrestamoID, i);
                    }

                    alertify.success('Préstamo y detalles agregados con éxito');
                })
                .catch(error => console.error('Error adding prestamo:', error));
        },
        onshow: function () {
            this.elements.content.innerHTML = `
                <div>
                    <label for="rutUsuario">Rut Usuario:</label>
                    <input type="text" id="rutUsuario" class="form-control">
                </div>
                <br>
                <div>
                    <label for="cantidadLibros">Cantidad Libros:</label>
                    <input type="number" id="cantidadLibros" class="form-control" min="1" max="10">
                </div>
            `;
        }
    }).show();
}

async function addDetallePrestamo(prestamoID, index) {
    return new Promise((resolve, reject) => {
        alertify.dialog('prompt').set({
            labels: { ok: 'Añadir', cancel: 'Cancelar' },
            title: `Libro ${index}`,
            onok: function () {
                const libro_id = parseInt(this.elements.content.querySelector('#idLibro').value);

                fetch('/api/detallePrestamos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prestamoID, libro_id }),
                })
                    .then(response => response.json())
                    .then(nuevoDetallePrestamo => {
                        detallePrestamos.push(nuevoDetallePrestamo);
                        resolve();
                    })
                    .catch(error => {
                        console.error('Error adding detalle prestamo:', error);
                        reject(error);
                    });
            },
            onshow: function () {
                this.elements.content.innerHTML = `
                    <div>
                        <label for="idLibro">ID Libro:</label>
                        <input type="number" id="idLibro" class="form-control">
                    </div>
                `;
            }
        }).show();
    });
}

function updatePrestamo() {
    // Lógica para actualizar un préstamo
    // Redirigir a una página de formulario o mostrar un modal
}

function deletePrestamo() {
    // Lógica para eliminar un préstamo
    // Confirmar y eliminar el préstamo
}

function searchPrestamos() {
    // Lógica para buscar préstamos
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#prestamoTabla tr');
    tableRows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const matches = Array.from(cells).some(cell => cell.innerText.toLowerCase().includes(searchInput));
        row.style.display = matches ? '' : 'none';
    });
}

// Paginación anterior
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

// Paginación siguiente
function nextPage() {
    const totalPages = Math.ceil(prestamos.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// Actualizar la paginación
function updatePagination() {
    const totalItems = prestamos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentStart = (currentPage - 1) * itemsPerPage + 1;
    const currentEnd = Math.min(currentPage * itemsPerPage, totalItems);

    document.querySelector('.pagination .page-link').innerText = `${currentStart}-${currentEnd} de ${totalItems}`;
}

// Iniciar la tabla y la paginación
renderTable()