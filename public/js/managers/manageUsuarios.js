let deudas = []; // Array de datos de deudas
let prestamos = []; // Array de datos de prestamos

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/prestamos')
        .then(response => response.json())
        .then(data => {
            prestamos = data;
        })
        .catch(error => console.error('Error fetching prestamos data:', error));
});

function renderTable() {
    // Renderizar la tabla de prestamos
    const prestamosTable = document.getElementById('prestamosTabla');
    if (prestamosTable) {
        prestamosTable.innerHTML = '';
        prestamos.forEach(prestamo => {
            if (prestamo.DetallePrestamos) {
                prestamo.DetallePrestamos.forEach(detalle => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${detalle.Libro.Titulo}</td>
                        <td>${new Date(prestamo.Fecha_Prestamo).toLocaleDateString('es-CL')}</td>
                        <td>${new Date(detalle.Fecha_Devolucion).toLocaleDateString('es-CL')}</td>
                        <td>${detalle.Estado_Detalle}</td>
                        <td>
                            <button class="btn btn-danger" onclick="devolverLibro(${detalle.Libro_LibroID}, ${prestamo.PrestamoID})">Devolver</button>
                            ${detalle.Renovado ? '' : tipoUsuario === 'estudiante' ?
                            `<button class="btn btn-primary" onclick="solicitarProrroga(${detalle.Libro_LibroID}, ${prestamo.PrestamoID}, 'estudiante')">Solicitar Prórroga</button>` :
                            tipoUsuario === 'docente' ?
                                `<button class="btn btn-primary" onclick="solicitarProrroga(${detalle.Libro_LibroID}, ${prestamo.PrestamoID}, 'docente')">Solicitar Prórroga</button>` : ''}
                        </td>
                    `;
                    prestamosTable.appendChild(row);
                });
            }
        });
    }

    // Renderizar la tabla de deudas
    const deudasTable = document.getElementById('deudasTabla');
    if (deudasTable) {
        deudasTable.innerHTML = '';
        if (deudas.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="3">No hay deudas.</td>
            `;
            deudasTable.appendChild(row);
        } else {
            deudas.forEach(deuda => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${deuda.libro}</td>
                    <td>${deuda.montoDeuda / 1000}</td>
                    <td>${deuda.montoDeuda}</td>
                `;
                deudasTable.appendChild(row);
            });
        }
    }
}

// Función para buscar usuario
function buscarUsuario() {
    alertify.dialog('prompt').set({
        labels: { ok: 'Buscar', cancel: 'Cancelar' },
        title: 'Buscar Usuario',
        onok: function () {
            const rut = this.elements.content.querySelector('#rutUsuario').value;
            window.location.href = `/buscadorUsuarios/${rut}`;
        },
        onshow: function () {
            this.elements.content.innerHTML = `
                <div>
                    <label for="rutUsuario">Rut Usuario:</label>
                    <input type="text" id="rutUsuario" class="form-control">
                </div>
            `;
        }
    }).show();
}

function devolverLibro(libroID, prestamoID) {
    fetch(`/api/prestamos/${prestamoID}/${libroID}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message) });
            }
            return response.json();
        })
        .then(data => {
            alertify.success('Libro devuelto con éxito');
            // Filtrar el préstamo específico y su detalle de libros
            prestamos = prestamos.map(prestamo => {
                if (prestamo.PrestamoID === prestamoID && prestamo.DetallePrestamos) {
                    prestamo.DetallePrestamos = prestamo.DetallePrestamos.filter(detalle => detalle.Libro_LibroID !== libroID);
                }
                return prestamo;
            }).filter(prestamo => prestamo.DetallePrestamos && prestamo.DetallePrestamos.length > 0); // Filtrar los préstamos vacíos o sin detalles
            renderTable();
        })
        .catch(error => {
            console.error('Error returning libro:', error);
            alertify.error('Error devolviendo el libro: ' + error.message);
        });
}

function solicitarProrroga(libroID, prestamoID, tipoUsuario) {
    fetch(`/api/solicitarProrroga`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ libroID, prestamoID, tipoUsuario })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message) });
            }
            return response.json();
        })
        .then(data => {
            alertify.success('Prórroga solicitada con éxito');
            prestamos = prestamos.map(prestamo => {
                if (prestamo.PrestamoID === prestamoID) {
                    prestamo.DetallePrestamos = prestamo.DetallePrestamos.map(detalle => {
                        if (detalle.Libro_LibroID === libroID) {
                            detalle.Fecha_Devolucion = new Date(data.nuevaFechaDevolucion).toLocaleDateString('es-CL');
                            detalle.Renovado = 'Si';
                            if (tipoUsuario === 'docente') {
                                detalle.NumeroRenovaciones++;
                            }
                        }
                        return detalle;
                    });
                }
                return prestamo;
            });
            renderTable();
        })
        .catch(error => {
            console.error('Error solicitando prórroga:', error);
            alertify.error('Error solicitando prórroga: ' + error.message);
        });
}