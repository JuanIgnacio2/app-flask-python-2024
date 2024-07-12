new Vue({
    el: '#app',
    data: {
        nombre: '',
        email: '',
        mensaje: '',
        errores: []
    },
    methods: {
        validarFormulario() {
            this.errores = [];
            if (!this.nombre) {
                this.errores.push('El nombre es obligatorio.');
            }
            if (!this.email) {
                this.errores.push('El email es obligatorio.');
            } else if (!this.validarEmail(this.email)) {
                this.errores.push('El email no es válido.');
            }
            if (!this.mensaje) {
                this.errores.push('El mensaje es obligatorio.');
            }
            if (!this.errores.length) {
                alert('Formulario enviado correctamente.');
                this.resetFormulario();
            }
        },
        validarEmail(email) {
            var re = /\S+@\S+\.\S+/;
            return re.test(email);
        },
        resetFormulario() {
            this.nombre = '';
            this.email = '';
            this.mensaje = '';
        }
    }
});
