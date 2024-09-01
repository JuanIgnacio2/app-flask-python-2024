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
                body: `cantidad=${cantidad}&estado=Pendiente`
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
                        <div class="card mb-3 reserva-item">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <img src="${reserva.imagen_url}" alt="${reserva.nombre_evento}" class="img-fluid rounded me-3" style="width : 400px">
                                    <div>
                                        <h5 class="card-title">${reserva.nombre_evento}</h5>
                                        <p class="card-text">Fecha: ${reserva.fecha_evento}</p>
                                        <p class="card-text">Hora: ${reserva.hora_evento}</p>
                                        <p class="card-text">Estado: ${reserva.estado}</p>
                                        <p class="card-text">Cantidad: ${reserva.cantidad}</p>
                                        <p class="card-text">Total: ${reserva.total}</p>
                                        <p class="card-text">Descripción: ${reserva.descripcion}</p>
                                    </div>
                                </div>
                                <button class="btn btn-danger cancelar-reserva mt-3" data-id="${reserva.id_reserva}">Cancelar Reserva</button>
                            </div>
                        </div>
                    `;
                    reservasModalBody.innerHTML += reservaHTML;
                });
            }

            // Añadir event listener a los botones de cancelar
            document.querySelectorAll('.cancelar-reserva').forEach(button => {
                button.addEventListener('click', function () {
                    const idReserva = this.getAttribute('data-id');
                    cancelarReserva(idReserva, this);
                });
            });

            const reservasModal = new bootstrap.Modal(document.getElementById('reservasModal'));
            reservasModal.show(); //Mostramos el modal

            // Añadir listener para el cierre del modal
            document.getElementById('reservasModal').addEventListener('hidden.bs.modal', function () {
            // Eliminar cualquier overlay residual
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            });
        })
        .catch(error => {
            console.error('Error al obtener las reservas:', error);
            alert('Hubo un problema al obtener las reservas. Por favor, inténtalo nuevamente.');
        });
    });

    // Función para cancelar una reserva
    function cancelarReserva(idReserva, buttonElement) {
        fetch(`/cancelar-reserva/${idReserva}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Reserva cancelada exitosamente') {
                alert(data.message);
                // Actualizar la lista de reservas eliminando el elemento
                const reservaItem = buttonElement.closest('.reserva-item');
                if (reservaItem) {
                    reservaItem.remove();
                }
            } else {
                alert('Error al cancelar la reserva: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error al cancelar la reserva:', error);
            alert('Error al cancelar la reserva. Por favor, inténtalo de nuevo más tarde.');
        });
    }
});