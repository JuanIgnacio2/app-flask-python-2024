document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const displayCartItems = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
        } else {
            cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item', 'mb-3');
                cartItem.innerHTML = `
                    <h5>${item.title}</h5>
                    <p>${item.price}</p>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Eliminar</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }
    };

    const removeFromCart = (index) => {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartCount();
    };

    const updateCartCount = () => {
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = cart.length;
    };

    const checkout = () => {
        console.log('Checkout button clicked');
        window.location.replace('checkout.html');
    };

    const viewCart = () => {
        displayCartItems();
    };

    const cartButton = document.getElementById('cart-icon');
    cartButton.addEventListener('click', viewCart);

    displayCartItems();
    updateCartCount();
});
