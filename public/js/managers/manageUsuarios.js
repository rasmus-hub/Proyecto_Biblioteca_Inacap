let deudas = []; // Array de datos de deudas
let prestamos = []; // Array de datos de prestamos
let detallePrestamos = []; // Array de datos de detalle prestamos

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/prestamos')
        .then(response => response.json())
        .then(data => {
            prestamos = data;
        })
        .catch(error => console.error('Error fetching prestamos data:', error));
});

function renderTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const librosToRender = libros.slice(start, end);
    const deudasToRender = deudas.slice(start, end);
    const prestamosToRender = prestamos.slice(start, end);

    // Renderizar la tabla de libros
    const librosTable = document.getElementById('librosTabla');
    librosTable.innerHTML = '';
    librosToRender.forEach(libro => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${libro.LibroID}</td>
            <td>${libro.Titulo}</td>
            <td>${libro.Autor}</td>
        `;
        librosTable.appendChild(row);
    });

    // Renderizar la tabla de prestamos
    const prestamosTable = document.getElementById('prestamosTabla');
    prestamosTable.innerHTML = '';
    prestamosToRender.forEach(prestamo => {
        prestamo.DetallePrestamos.forEach(detalle => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${detalle.Libro.Titulo}</td>
                <td>${new Date(prestamo.Fecha_Prestamo).toLocaleDateString('es-CL')}</td>
                <td>${new Date(detalle.Fecha_Devolucion).toLocaleDateString('es-CL')}</td>
                <td>${detalle.Estado_Detalle}</td>
            `;
            prestamosTable.appendChild(row);
        });
    });

    // Renderizar la tabla de deudas
    const deudasTable = document.getElementById('deudasTabla');
    deudasTable.innerHTML = '';
    deudasToRender.forEach(deuda => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${deuda.libro}</td>
            <td>${deuda.diasAtraso}</td>
            <td>${deuda.montoDeuda}</td>
        `;
        deudasTable.appendChild(row);
    });

    updatePagination();
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