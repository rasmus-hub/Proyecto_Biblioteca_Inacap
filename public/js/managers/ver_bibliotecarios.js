async function VerificarUsuario() {
  const usuarioIngresado = document.getElementById('inputUsuario').value;
  const contrasenaIngresada = document.getElementById('inputPassword').value;

  const response = await fetch('/verificar-usuario', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ usuarioIngresado, contrasenaIngresada }),
  });

  const result = await response.json();

  if (result.success) {
    alert(result.message);
    window.open('index.html', '_blank');
  } else {
    alert(result.message);
  }
}
