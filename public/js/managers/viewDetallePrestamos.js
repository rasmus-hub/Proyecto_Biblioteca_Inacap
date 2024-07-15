const itemsPerPage = 10; // Número de elementos por página
let currentPage = 1; // Página actual
let detallePrestamos = []; // Array de datos de detalle prestamos

// Fetch de datos desde el servidor
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/detallePrestamos')
        .then(response => response.json())
        .then(data => {
            detallePrestamos = data;
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
    const prestamosMostrar = detallePrestamos.slice(start, end);

    prestamosMostrar.forEach(detallePrestamo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${detallePrestamo.Prestamos_PrestamoID}</td>
            <td>${detallePrestamo.Libro_LibroID}</td>
            <td>${new Date(detallePrestamo.Fecha_Devolucion).toLocaleDateString('es-CL')}</td>
            <td>${detallePrestamo.Estado_Detalle}</td>
            <td>${detallePrestamo.Dias_Atraso}</td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
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
    const totalPages = Math.ceil(detallePrestamos.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// Actualizar la paginación
function updatePagination() {
    const totalItems = detallePrestamos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentStart = (currentPage - 1) * itemsPerPage + 1;
    const currentEnd = Math.min(currentPage * itemsPerPage, totalItems);

    document.querySelector('.pagination .page-link').innerText = `${currentStart}-${currentEnd} de ${totalItems}`;
}

// Iniciar la tabla y la paginación
renderTable()