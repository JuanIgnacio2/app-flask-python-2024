document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.reserva-form').forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const eventoId = form.getAttribute('data-evento-id');
            const cantidad = form.querySelector('input[name="cantidad"]').value;

            fetch(`/reservar/${eventoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `cantidad=${cantidad}`
            })
            .then(response => {
                if (response.ok) {
                    alert('Reserva realizada con éxito!');
                    window.location.reload();
                } else {
                    throw new Error('Hubo un problema al hacer la reserva.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un problema al hacer la reserva. Por favor, intenta nuevamente.');
            });
        });
    });

    const verReservasBtn = document.getElementById('verReservasBtn');
    const reservasModalBody = document.getElementById('reservasModalBody');

    verReservasBtn.addEventListener('click', function() {
        fetch(`/mis-reservas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo obtener las reservas');
            }
            return response.json();
        })
        .then(data => {
            reservasModalBody.innerHTML = '';

            if (data.length === 0) {
                reservasModalBody.innerHTML = '<p>No tienes reservas pendientes.</p>';
            } else {
                data.forEach(reserva => {
                    let reservaHTML = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${reserva.nombre_evento}</h5>
                                <p class="card-text">Fecha: ${reserva.fecha_evento}</p>
                                <p class="card-text">Hora: ${reserva.hora_evento}</p>
                                <p class="card-text">Cantidad: ${reserva.cantidad}</p>
                                <p class="card-text">Total: ${reserva.total}</p>
                                <p class="card-text">Descripción: ${reserva.descripcion}</p>
                            </div>
                        </div>
                    `;
                    reservasModalBody.innerHTML += reservaHTML;
                });
            }

            const reservasModal = new bootstrap.Modal(document.getElementById('reservasModal'));
            reservasModal.show();
        })
        .catch(error => {
            console.error('Error al obtener las reservas:', error);
            alert('Hubo un problema al obtener las reservas. Por favor, inténtalo nuevamente.');
        });
    });
});