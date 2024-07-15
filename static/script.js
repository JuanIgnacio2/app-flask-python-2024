document.addEventListener('DOMContentLoaded', () => {
    const cart = [];
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    let pedidosModal;

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const productElement = this.closest('.product');
            const productId = parseInt(productElement.getAttribute('data-id'));
            const productName = productElement.getAttribute('data-name');
            const productPrice = parseFloat(productElement.getAttribute('data-price'));
            const productQuantity = parseInt(productElement.querySelector('.quantity').innerText);

            productElement.querySelector('.quantity').innerText = '1';

            if (isNaN(productId)) {
                console.error("ID del producto es inválido");
                return;
            }

            const productInCart = cart.find(item => item.id === productId);

            if (productInCart) {
                productInCart.quantity += productQuantity;
            } else {
                cart.push({ id: productId, name: productName, price: productPrice, quantity: productQuantity });
            }

            updateCartModal();
            updateCartIcon();
        });
    });

    // Funciones de incremento y decremento
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', function () {
            const quantityElement = this.closest('.quantity-controls').querySelector('.quantity');
            let quantity = parseInt(quantityElement.innerText);
            quantityElement.innerText = ++quantity;
        });
    });

    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function () {
            const quantityElement = this.closest('.quantity-controls').querySelector('.quantity');
            let quantity = parseInt(quantityElement.innerText);
            if (quantity > 1) {
                quantityElement.innerText = --quantity;
            }
        });
    });

    document.getElementById('cartIcon').addEventListener('click', function () {
        updateCartModal();
        cartModal.show();
    });

    document.getElementById('checkout').addEventListener('click', async function () {
        if (cart.length === 0) {
            alert('El carrito está vacío.');
            return;
        }

        try {
            const vinos = cart.map(item => ({
                id_vino: item.id,
                cantidad: item.quantity
            }));

            const response = await fetch('/pedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vinos })
            });

            if (!response.ok) {
                throw new Error('Error al realizar el pedido.');
            }

            const result = await response.json();
            alert('Pedido realizado con éxito. ID del pedido: ' + result.order_id);
            cart.length = 0;
            updateCartModal();
            updateCartIcon();
            cartModal.hide();
        } catch (error) {
            alert(error.message);
        }
    });

    function updateCartModal() {
        const cartItemsList = document.getElementById('cartItems');
        cartItemsList.innerHTML = '';

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${item.name} - $${item.price.toFixed(2)}
                <div class="quantity-controls">
                    <button class="btn btn-sm btn-secondary decrease" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="btn btn-sm btn-secondary increase" data-index="${index}">+</button>
                </div>
                <button class="btn btn-sm btn-danger remove" data-index="${index}">Eliminar</button>
            `;
            cartItemsList.appendChild(li);
        });

        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                cart[index].quantity++;
                updateCartModal();
                updateCartIcon();
            });
        });

        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                }
                updateCartModal();
                updateCartIcon();
            });
        });

        document.querySelectorAll('.remove').forEach(button => {
            button.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                updateCartModal();
                updateCartIcon();
            });
        });
    }

    function updateCartIcon() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartIcon').innerHTML = `<i class="fas fa-shopping-cart"></i> Ver Carrito (${totalItems})`;
    }

    const searchBar = document.getElementById('searchBar');
    const products = document.querySelectorAll('.product');
    const closeModal = document.querySelector('.btn-close');
    const cartItemsList = document.getElementById('cartItems');

    searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase();
        products.forEach(product => {
            const productName = product.getAttribute('data-name').toLowerCase();
            product.style.display = productName.includes(searchTerm) ? 'block' : 'none';
        });
    });

    document.getElementById('verPedidos').addEventListener('click', function () {
        fetch('/mis-pedidos')
            .then(response => response.json())
            .then(pedidos => {
                console.log('Pedidos:', pedidos);
                const modalBody = document.getElementById('pedidosModalBody');
                modalBody.innerHTML = ''; // Limpiamos el modal

                pedidos.forEach(pedido => {
                    const pedidoItem = document.createElement('div');
                    pedidoItem.classList.add('pedido-item');
                    
                    /*const detallesHtml = pedido.detalles.map(detalle => `
                        <li>${detalle.nombre_vino} - Cantidad: ${detalle.cantidad} - Precio Unitario: $${detalle.precio_unitario.toFixed(2)}</li>
                    `).join('');    */

                    pedidoItem.innerHTML = `
                        <h5>Código pedido: ${pedido.id_pedido}</h5>
                        <p>Fecha del Pedido: ${pedido.fecha_pedido}</p>
                        <p>Total: $${pedido.total}</p>
                        <p>Estado: ${pedido.estado}</p>
                        <button class="btn btn-danger cancelar-pedido" data-id="${pedido.id_pedido}">Cancelar Pedido</button>`
                        //<ul>${detallesHtml}</ul>`
                    ;
                    modalBody.appendChild(pedidoItem);
                });

                // Cancelar pedido
                document.querySelectorAll('.cancelar-pedido').forEach(button => {
                    button.addEventListener('click', function () {
                        const idPedido = this.getAttribute('data-id');
                        cancelarPedido(idPedido);
                    });
                });

                // Mostrar el modal de pedidos
                if (!pedidosModal) {
                    pedidosModal = new bootstrap.Modal(document.getElementById('pedidosModal'));
                }
                pedidosModal.show(); // Mostrar el modal
            })
            .catch(error => {
                console.error('Error al obtener los pedidos:', error);
                alert('Error al cargar los pedidos. Por favor, inténtalo de nuevo más tarde.');
            });
    });

    function cancelarPedido(idPedido) {
        fetch(`/pedido/${idPedido}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                alert(result.error);
            } else {
                alert(result.message);
                document.getElementById('verPedidos').click();
            }
        })
        .catch(error => {
            console.error('Error al cancelar el pedido:', error);
            alert('Error al cancelar el pedido. Por favor, inténtalo de nuevo más tarde.');
        });
    }

    updateCartIcon();
});