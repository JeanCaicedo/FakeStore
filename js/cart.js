import { FakeStoreAPI } from './api.js';
import { Store } from './store.js';
import { formatCurrency, showToast, setupHeaderListeners, getCategoryEmoji } from './utils.js';

Store.init();

const cartTableBody = document.querySelector('.cart-table tbody');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('envio');
const taxEl = document.getElementById('impuestos');
const totalEl = document.getElementById('total-final');
const checkoutBtn = document.querySelector('.btn-checkout');

function init() {
    setupHeaderListeners();
    renderCart();
    updateSummary();

    Store.subscribe(() => {
        renderCart();
        updateSummary();
    });

    checkoutBtn.addEventListener('click', handleCheckout);
}

function renderCart() {
    cartTableBody.innerHTML = '';
    const cart = Store.state.cart;

    if (cart.length === 0) {
        cartTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Tu carrito está vacío</td></tr>';
        return;
    }

    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="cart-item">
                    <div class="cart-item-image" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background-color: #f0f0f0; border-radius: 4px;">
                        <span style="font-size: 1.5rem;">${getCategoryEmoji(item.category)}</span>
                    </div>
                    <span>${item.title}</span>
                </div>
            </td>
            <td>${formatCurrency(item.price)}</td>
            <td>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" readonly>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </td>
            <td>${formatCurrency(item.price * item.quantity)}</td>
            <td>
                <button class="delete-btn" data-id="${item.id}">🗑️</button>
            </td>
        `;

        row.querySelector('.minus').addEventListener('click', () => Store.updateCartQuantity(item.id, -1));
        row.querySelector('.plus').addEventListener('click', () => Store.updateCartQuantity(item.id, 1));
        row.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('¿Eliminar producto?')) Store.removeFromCart(item.id);
        });

        cartTableBody.appendChild(row);
    });
}

function updateSummary() {
    const subtotal = Store.getCartTotal();
    // envío fijo de 15k COP solo si hay productos, impuestos del 8%
    const shipping = subtotal > 0 ? 15000 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    subtotalEl.textContent = formatCurrency(subtotal);
    shippingEl.textContent = formatCurrency(shipping);
    taxEl.textContent = formatCurrency(tax);
    totalEl.textContent = formatCurrency(total);
}

async function handleCheckout() {
    if (Store.state.cart.length === 0) {
        showToast('El carrito está vacío');
        return;
    }

    // verificación básica: si no está logueado, lo mandamos al login
    if (!Store.state.user) {
        showToast('Debes iniciar sesión para comprar');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    try {
        checkoutBtn.textContent = 'Procesando...';
        checkoutBtn.disabled = true;

        const orderData = {
            userId: Store.state.user.id,
            date: new Date().toISOString().split('T')[0],
            products: Store.state.cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        const result = await FakeStoreAPI.createCart(orderData);
        console.log('Orden creada:', result);

        Store.clearCart();

        window.location.href = 'confirmacion-compra.html';

    } catch (error) {
        console.error('Error en checkout:', error);
        showToast('Error procesando la compra');
        checkoutBtn.textContent = 'Proceder al pago';
        checkoutBtn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', init);
