function cargarReservasUsuario() {
    fetch('/api/reservas')
        .then(response => response.json())
        .then(data => {
            const modalBody = document.getElementById('reservasModalBody');
            if (data.length > 0) {
                modalBody.innerHTML = '';
                data.forEach(reserva => {
                    const reservaElemento = document.createElement('p');
                    reservaElemento.textContent = `Evento: ${reserva.nombre_evento}, Cantidad: ${reserva.cantidad}`;
                    modalBody.appendChild(reservaElemento);
                });
            } else {
                modalBody.innerHTML = '<p>No tienes reservas pendientes.</p>';
            }
        })
        .catch(error => {
            console.error('Error al cargar las reservas:', error);
            const modalBody = document.getElementById('reservasModalBody');
            modalBody.innerHTML = '<p>Error al cargar las reservas. Por favor, intenta de nuevo más tarde.</p>';
        });
}

document.getElementById('reservasModal').addEventListener('show.bs.modal', function (event) {
    cargarReservasUsuario();
});
