document.addEventListener('DOMContentLoaded', () => {
    const btnReservar = document.getElementById('btn-reservar');
    
    btnReservar.addEventListener('click', () => {
        // Aquí puedes colocar el código para manejar la acción de reservar
        alert('¡Reserva realizada con éxito!');
        // Por ejemplo, redireccionar a una página de confirmación de reserva
        window.location.href = 'confirmacion_reserva.html';
    });
});
