document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('check-multas-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const rut = document.getElementById('rut').value;
        const response = await fetch('/deudas/check-multas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rut })
        });

        if (!response.ok) {
            const message = `An error has occurred: ${response.status}`;
            throw new Error(message);
        }

        const result = await response.json();
        document.getElementById('multas-result').innerText = result.tieneMultas ? 'El usuario tiene multas impagas.' : 'El usuario no tiene multas impagas.';
    });

    document.getElementById('check-retraso-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const rut = document.getElementById('rut-retraso').value;
        const response = await fetch('/deudas/check-retraso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rut })
        });

        if (!response.ok) {
            const message = `An error has occurred: ${response.status}`;
            throw new Error(message);
        }

        const result = await response.json();
        const retrasoResultDiv = document.getElementById('retraso-result');
        retrasoResultDiv.innerHTML = '';

        if (result.librosRetrasados.length > 0) {
            result.librosRetrasados.forEach(libro => {
                const libroDiv = document.createElement('div');
                libroDiv.innerText = `Título: ${libro.Libro.Titulo}, Fecha de Devolución: ${new Date(libro.Fecha_Devolucion).toLocaleDateString('es-CL')}`;
                retrasoResultDiv.appendChild(libroDiv);
            });
        } else {
            retrasoResultDiv.innerText = 'El usuario no tiene libros atrasados.';
        }
    });

    document.getElementById('calcular-multas-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const response = await fetch('/deudas/calcular-multas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const message = `An error has occurred: ${response.status}`;
            throw new Error(message);
        }

        const result = await response.json();
        document.getElementById('calcular-result').innerText = result.message;
    });

    document.getElementById('pagar-multas-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const rut = document.getElementById('rut-pago').value;
        const response = await fetch('/deudas/pagar-multas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rut })
        });

        if (!response.ok) {
            const message = `An error has occurred: ${response.status}`;
            throw new Error(message);
        }

        const result = await response.json();
        document.getElementById('pago-result').innerText = result.message;
    });
});
