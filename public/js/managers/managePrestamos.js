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
            <td>
                <button class="btn btn-danger btn-sm" onclick="loadDetallePrestamo(${prestamo.PrestamoID})">Ver Detalle</button>
                <button class="btn btn-danger btn-sm" onclick="updatePrestamo(${prestamo.PrestamoID})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deletePrestamo(${prestamo.PrestamoID})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

function loadDetallePrestamo(prestamoID) {
    fetch(`/api/prestamos/${prestamoID}`)
        .then(response => response.json())
        .then(data => {
            detallePrestamos = data;
            renderDetalleTable();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function renderDetalleTable() {
    const tableBody = document.getElementById('detallePrestamoTabla');
    tableBody.innerHTML = '';

    detallePrestamos.forEach(detallePrestamo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${detallePrestamo.Prestamos_PrestamoID}</td>
            <td>${detallePrestamo.Libro_LibroID}</td>
            <td>${new Date(detallePrestamo.Fecha_Devolucion).toLocaleDateString('es-CL')}</td>
            <td>${detallePrestamo.Estado_Detalle}</td>
        `;
        tableBody.appendChild(row);
    });
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

async function insertarDetallePrestamo() {
    const prestamoID = prompt("Ingrese el ID del préstamo:");
    const libroID = prompt("Ingrese el ID del libro a agregar:");

    if (!prestamoID || !libroID) {
        alertify.error("Debe ingresar ambos ID.");
        return;
    }

    try {
        const response = await fetch('/api/detallePrestamo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prestamoID: parseInt(prestamoID),
                libro_id: parseInt(libroID),
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alertify.success("Detalle de préstamo agregado con éxito.");
            // Actualizar la tabla de detalles de préstamos
            actualizarTablaDetalles(data);
            // Actualizar la cantidad de libros en la tabla de préstamos
            actualizarCantidadLibrosPrestamo(prestamoID);
        } else {
            alertify.error(data.error);
        }
    } catch (error) {
        console.error('Error al agregar el detalle del préstamo:', error);
        alertify.error('Error al agregar el detalle del préstamo');
    }
}

function actualizarTablaDetalles(detalle) {
    const tabla = document.getElementById('detallePrestamoTabla');
    const nuevaFila = document.createElement('tr');

    nuevaFila.innerHTML = `
        <td>${detalle.Prestamos_PrestamoID}</td>
        <td>${detalle.Libro_LibroID}</td>
        <td>${new Date(detalle.Fecha_Devolucion).toLocaleDateString('es-CL')}</td>
        <td>${detalle.Estado_Detalle}</td>
    `;

    tabla.appendChild(nuevaFila);
}

async function actualizarCantidadLibrosPrestamo(prestamoID) {
    try {
        const response = await fetch(`/api/prestamos/${prestamoID}`);
        const prestamo = await response.json();

        if (response.ok) {
            // Obtener todas las filas de la tabla de préstamos
            const filasPrestamos = document.querySelectorAll('#prestamoTabla tbody tr');

            // Iterar sobre las filas para encontrar el préstamo con el ID correspondiente
            let filaEncontrada = null;
            filasPrestamos.forEach(fila => {
                const idPrestamo = fila.querySelector('td:first-child').innerText.trim();
                if (idPrestamo === prestamoID.toString()) {
                    filaEncontrada = fila;
                }
            });

            if (filaEncontrada) {
                // Actualizar la columna de Cantidad de Libros
                filaEncontrada.querySelector('td:nth-child(4)').innerText = prestamo.Cantidad_Libros;
            } else {
                alertify.error('No se encontró la fila del préstamo en la tabla');
            }
        } else {
            alertify.error('Error al actualizar la cantidad de libros del préstamo');
        }
    } catch (error) {
        console.error('Error al actualizar la cantidad de libros del préstamo:', error);
        alertify.error('Error al actualizar la cantidad de libros del préstamo');
    }
}

function updatePrestamo(prestamoID) {
    alertify.dialog('prompt').set({
        labels: { ok: 'Actualizar', cancel: 'Cancelar' },
        title: 'Actualizar Préstamo',
        onok: function () {
            const cantidadLibros = parseInt(this.elements.content.querySelector('#cantidadLibros').value);
            const estadoPrestamo = this.elements.content.querySelector('#estadoPrestamo').value;

            fetch(`/api/prestamos/${prestamoID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cantidadLibros, estadoPrestamo }),
            })
                .then(response => response.json())
                .then(updatedPrestamo => {
                    const index = prestamos.findIndex(p => p.PrestamoID === prestamoID);
                    prestamos[index] = updatedPrestamo;
                    renderTable();
                })
                .catch(error => console.error('Error updating prestamo:', error));
        },
        onshow: function () {
            this.elements.content.innerHTML = `
                <div>
                    <label for="cantidadLibros">Cantidad Libros:</label>
                    <input type="number" id="cantidadLibros" class="form-control" min="1" max="10">
                </div>
                <br>
                <div>
                    <label for="estadoPrestamo">Estado Préstamo:</label>
                    <input type="text" id="estadoPrestamo" class="form-control">
                </div>
            `;
        }
    }).show();
}

function deletePrestamo(prestamoID) {
    alertify.confirm('Eliminar Préstamo', '¿Estás seguro de que deseas eliminar este préstamo?', function () {
        fetch(`/api/prestamos/${prestamoID}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    prestamos = prestamos.filter(p => p.PrestamoID !== prestamoID);
                    renderTable();
                    alertify.success('Préstamo eliminado con éxito');
                } else {
                    alertify.error('Error al eliminar el préstamo');
                }
            })
            .catch(error => console.error('Error deleting prestamo:', error));
    }, function () {
        alertify.error('Acción cancelada');
    });
}

function searchPrestamos() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchType = document.getElementById('searchType').value;

    const filteredPrestamos = prestamos.filter(prestamo => {
        if (searchType === 'prestamoID') {
            return prestamo.PrestamoID.toString().includes(searchInput);
        } else if (searchType === 'rut') {
            return prestamo.Usuario_Rut.toLowerCase().includes(searchInput);
        }
    });

    renderFilteredTable(filteredPrestamos);
}

function renderFilteredTable(filteredPrestamos) {
    const tableBody = document.getElementById('prestamoTabla');
    tableBody.innerHTML = '';

    filteredPrestamos.forEach(prestamo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${prestamo.PrestamoID}</td>
            <td>${prestamo.Usuario_Rut}</td>
            <td>${new Date(prestamo.Fecha_Prestamo).toLocaleDateString('es-CL')}</td>
            <td>${prestamo.Cantidad_Libros}</td>
            <td>${prestamo.Estado_Prestamo}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="loadDetallePrestamo(${prestamo.PrestamoID})">Ver Detalle</button>
                <button class="btn btn-danger btn-sm" onclick="updatePrestamo(${prestamo.PrestamoID})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deletePrestamo(${prestamo.PrestamoID})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination(filteredPrestamos.length);
}

function generarReporte() {
    const fecha = document.getElementById('reporteFecha').value;
    const tipoUsuario = document.getElementById('reporteTipoUsuario').value;

    fetch(`/api/reportePrestamos?fecha=${fecha}&tipoUsuario=${tipoUsuario}`)
        .then(response => response.json())
        .then(data => {
            mostrarReporte(data);
        })
        .catch(error => console.error('Error generating report:', error));
}

function mostrarReporte(data) {
    const reporteDiv = document.createElement('div');
    reporteDiv.innerHTML = `
        <div class="tabla-modal">
            <h5>Reporte de Préstamos</h5>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Rut</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Cantidad Libros</th>
                        <th scope="col">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(prestamo => `
                        <tr>
                            <td>${prestamo.PrestamoID}</td>
                            <td>${prestamo.Usuario.Rut}</td>
                            <td>${new Date(prestamo.Fecha_Prestamo).toLocaleDateString('es-CL')}</td>
                            <td>${prestamo.Cantidad_Libros}</td>
                            <td>${prestamo.Estado_Prestamo}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.body.appendChild(reporteDiv);
    const modal = bootstrap.Modal.getInstance(document.getElementById('reporteModal'));
    modal.hide();
}

function updatePagination(filteredCount) {
    const totalItems = filteredCount || prestamos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentStart = (currentPage - 1) * itemsPerPage + 1;
    const currentEnd = Math.min(currentPage * itemsPerPage, totalItems);

    document.querySelector('.pagination .page-link').innerText = `${currentStart}-${currentEnd} de ${totalItems}`;
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
    const currentStart = (currentPage - 1) * itemsPerPage + 1;
    const currentEnd = Math.min(currentPage * itemsPerPage, totalItems);

    document.querySelector('.pagination .page-link').innerText = `${currentStart}-${currentEnd} de ${totalItems}`;
}

// Iniciar la tabla y la paginación
renderTable()