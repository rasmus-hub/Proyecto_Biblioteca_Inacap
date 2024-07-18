const itemsPerPage = 10; // Número de elementos por página
let currentPage = 1; // Página actual
let deudas = []; // Array de datos de deudas

// Fetch de datos desde el servidor
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/deudas')
        .then(response => response.json())
        .then(data => {
            deudas = data;
            renderTable();
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Renderizar la tabla con los datos paginados
function renderTable() {
    const tableBody = document.getElementById('deudasTabla');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const deudasMostrar = deudas.slice(start, end);

    deudasMostrar.forEach(deuda => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${deuda.MultaID}</td>
            <td>${deuda.Prestamos_PrestamoID}</td>
            <td>${deuda.Prestamos.Usuario_Rut}</td>
            <td>${deuda.Deuda}</td>
            <td>${deuda.Estado_Multa}</td>
            <td>${new Date(deuda.Fecha_Pago).toLocaleDateString('es-CL')}</td>
            <td>${deuda.Dias_Atraso}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="updateDeuda(${deuda.MultaID})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDeuda(${deuda.MultaID})">Eliminar</button>
                <button class="btn btn-success btn-sm" onclick="payDeuda(${deuda.MultaID})">Pagar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

function updateDeuda(deudaID) {
    alertify.dialog('prompt').set({
        labels: { ok: 'Actualizar', cancel: 'Cancelar' },
        title: 'Actualizar Deuda',
        onok: function () {
            const estadoMulta = this.elements.content.querySelector('#estadoMulta').value;
            const fechaPago = this.elements.content.querySelector('#fechaPago').value;

            fetch(`/api/deudas/${deudaID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estadoMulta, fechaPago }),
            })
                .then(response => response.json())
                .then(updatedDeuda => {
                    const index = deudas.findIndex(d => d.MultaID === deudaID);
                    deudas[index] = updatedDeuda;
                    renderTable();
                })
                .catch(error => console.error('Error updating deuda:', error));
        },
        onshow: function () {
            this.elements.content.innerHTML = `
                <div>
                    <label for="estadoMulta">Estado Multa:</label>
                    <input type="text" id="estadoMulta" class="form-control">
                </div>
                <br>
                <div>
                    <label for="fechaPago">Fecha Pago:</label>
                    <input type="date" id="fechaPago" class="form-control">
                </div>
            `;
        }
    }).show();
}

function deleteDeuda(deudaID) {
    alertify.confirm('Eliminar Deuda', '¿Estás seguro de que deseas eliminar esta deuda?', function () {
        fetch(`/api/deudas/${deudaID}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    deudas = deudas.filter(d => d.MultaID !== deudaID);
                    renderTable();
                    alertify.success('Deuda eliminada con éxito');
                } else {
                    alertify.error('Error al eliminar la deuda');
                }
            })
            .catch(error => console.error('Error deleting deuda:', error));
    }, function () {
        alertify.error('Acción cancelada');
    });
}

function payDeuda(deudaID) {
    fetch(`/api/deudas/${deudaID}/pay`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(updatedDeuda => {
            const index = deudas.findIndex(d => d.MultaID === deudaID);
            deudas[index] = updatedDeuda;
            renderTable();
            alertify.success('Deuda pagada con éxito');
        })
        .catch(error => console.error('Error paying deuda:', error));
}


function searchMultas() {
    const searchType = document.getElementById('searchType').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    const filteredDeudas = deudas.filter(deuda => {
        if (searchType === 'prestamoID') {
            return deuda.Prestamos_PrestamoID.toString().includes(searchInput);
        } else if (searchType === 'rut') {
            return deuda.Prestamos.Usuario_Rut.toLowerCase().includes(searchInput);
        }
    });

    renderFilteredTable(filteredDeudas);
}

function renderFilteredTable(filteredDeudas) {
    const tableBody = document.getElementById('deudasTabla');
    tableBody.innerHTML = '';

    filteredDeudas.forEach(deuda => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${deuda.MultaID}</td>
            <td>${deuda.Prestamos_PrestamoID}</td>
            <td>${deuda.Prestamos.Usuario_Rut}</td>
            <td>${deuda.Deuda}</td>
            <td>${deuda.Estado_Multa}</td>
            <td>${new Date(deuda.Fecha_Pago).toLocaleDateString('es-CL')}</td>
            <td>${deuda.Dias_Atraso}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="updateDeuda(${deuda.MultaID})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDeuda(${deuda.MultaID})">Eliminar</button>
                <button class="btn btn-success btn-sm" onclick="payDeuda(${deuda.MultaID})">Pagar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination(filteredDeudas.length);
}

function updatePagination(filteredCount) {
    const totalItems = filteredCount || deudas.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentStart = (currentPage - 1) * itemsPerPage + 1;
    const currentEnd = Math.min(currentPage * itemsPerPage, totalItems);

    document.querySelector('.pagination .page-link').innerText = `${currentStart}-${currentEnd} de ${totalItems}`;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(deudas.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

renderTable();
