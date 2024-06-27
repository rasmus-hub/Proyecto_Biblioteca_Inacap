let users = [
    { id: 1, rut: '22222222-2', fecha: '26/06/2024', cantidadLibros: 5, estado: 'Pendiente' },
    { id: 2, rut: '33333333-3', fecha: '27/06/2024', cantidadLibros: 2, estado: 'Pendiente' },
    { id: 3, rut: '44444444-4', fecha: '24/06/2024', cantidadLibros: 4, estado: 'Pendiente' },
    { id: 4, rut: '55555555-5', fecha: '10/06/2024', cantidadLibros: 1, estado: 'Atrasado' },
    // son de ejemplo nomas
];

const itemsPerPage = 10;
let currentPage = 1;

function renderTable() {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const usersToDisplay = users.slice(start, end);

    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row">${user.id}</th>
            <td style="color: red;">${user.rut}</td>
            <td>${user.fecha}</td>
            <td>${user.cantidadLibros}</td>
            <td style="color: ${user.estado === 'Atrasado' ? 'red' : 'black'};">${user.estado}</td>
        `;
        tableBody.appendChild(row);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(users.length / itemsPerPage);
    document.querySelector('.pagination .page-link').innerText = `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, users.length)} de ${users.length}`;
}

function addUser() {
    alertify.dialog('prompt').set({
        labels: { ok: 'Añadir', cancel: 'Cancelar' },
        title: 'Agregar Nuevo Préstamo',
        onok: function (closeEvent) {
            const rut = this.elements.content.querySelector('#rutUsuario').value;
            const cantidadLibros = this.elements.content.querySelector('#cantidadLibros').value;
            const newUser = {
                id: users.length + 1,
                rut: rut,
                fecha: new Date().toLocaleDateString('es-ES'),
                cantidadLibros: cantidadLibros,
                estado: 'Pendiente'
            };
            users.push(newUser);
            renderTable();
            alertify.success('Usuario agregado con éxito');
        },
        onshow: function () {
            this.elements.content.innerHTML = `
                <div>
                    <label for="rutUsuario">Rut Usuario:</label>
                    <input type="text" id="rutUsuario" class="form-control">
                </div>
                <div>
                    <label for="cantidadLibros">Cantidad Libros:</label>
                    <input type="number" id="cantidadLibros" class="form-control" min="1" max="10">
                </div>
            `;
        }
    }).show();
}

function updateUser() {
    alertify.dialog('prompt').set({
        labels: { ok: 'Actualizar', cancel: 'Cancelar' },
        title: 'Actualizar Usuario',
        onok: function (closeEvent) {
            const id = this.elements.content.querySelector('#userId').value;
            const user = users.find(u => u.id == id);
            if (user) {
                user.rut = this.elements.content.querySelector('#rutUsuario').value;
                user.cantidadLibros = this.elements.content.querySelector('#cantidadLibros').value;
                renderTable();
                alertify.success('Usuario actualizado con éxito');
            } else {
                alertify.error('Usuario no encontrado');
            }
        },
        onshow: function () {
            this.elements.content.innerHTML = `
                <div>
                    <label for="userId">ID Usuario:</label>
                    <input type="text" id="userId" class="form-control">
                </div>
                <div>
                    <label for="rutUsuario">Nuevo Rut Usuario:</label>
                    <input type="text" id="rutUsuario" class="form-control">
                </div>
                <div>
                    <label for="cantidadLibros">Nueva Cantidad Libros:</label>
                    <input type="number" id="cantidadLibros" class="form-control" min="1" max="10">
                </div>
            `;
        }
    }).show();
}

function deleteUser() {
    alertify.prompt('Eliminar Usuario', 'Ingrese el ID del usuario:', '', function (evt, id) {
        const userIndex = users.findIndex(u => u.id == id);
        if (userIndex >= 0) {
            users.splice(userIndex, 1);
            renderTable();
            alertify.success('Usuario eliminado con éxito');
        } else {
            alertify.error('Usuario no encontrado');
        }
    }, function () {
        alertify.error('Cancelado');
    });
}

function viewUser() {
    alertify.prompt('Ver Detalle de Usuario', 'Ingrese el ID del usuario:', '', function (evt, id) {
        const user = users.find(u => u.id == id);
        if (user) {
            alertify.alert('Detalle del Usuario', `
                <p>Rut: ${user.rut}</p>
                <p>Fecha: ${user.fecha}</p>
                <p>Cantidad Libros: ${user.cantidadLibros}</p>
                <p>Estado: ${user.estado}</p>
            `);
        } else {
            alertify.error('Usuario no encontrado');
        }
    }, function () {
        alertify.error('Cancelado');
    });
}

function searchUsers() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredUsers = users.filter(user => user.rut.toLowerCase().includes(searchInput));
    renderTable(filteredUsers);
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(users.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

renderTable();