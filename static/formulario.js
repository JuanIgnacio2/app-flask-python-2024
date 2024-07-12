document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.getElementById('formulario');

    formulario.addEventListener('submit', function (event) {
        event.preventDefault(); 
    
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const mensaje = document.getElementById('mensaje').value;

        
        if (nombre.trim() === '' || email.trim() === '' || mensaje.trim() === '') {
            alert('Por favor completa todos los campos.');
            return;
        }


        console.log('Nombre:', nombre);
        console.log('Email:', email);
        console.log('Mensaje:', mensaje);

        formulario.reset();

    
        mostrarMensajeExito();
    });


    function mostrarMensajeExito() {
       
        const mensajeExito = document.createElement('div');
        mensajeExito.textContent = '¡El formulario fue enviado con éxito!';
        mensajeExito.classList.add('alert', 'alert-success', 'mt-3');
        formulario.parentNode.insertBefore(mensajeExito, formulario.nextSibling);

     
        setTimeout(function () {
            mensajeExito.remove();
        }, 5000);
    }
});
