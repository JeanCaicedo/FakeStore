import { Store } from './store.js';
import { formatCurrency, showToast, setupHeaderListeners, getCategoryEmoji } from './utils.js';

Store.init();

const wishlistGrid = document.getElementById('wishlist-grid');
const emptyMsg = document.getElementById('empty-wishlist');

function init() {
    setupHeaderListeners();
    renderWishlist();

    Store.subscribe(() => {
        renderWishlist();
    });
}

function renderWishlist() {
    const wishlist = Store.state.wishlist;

    if (wishlist.length === 0) {
        wishlistGrid.style.display = 'none';
        emptyMsg.style.display = 'block';
        return;
    }

    wishlistGrid.style.display = 'grid';
    emptyMsg.style.display = 'none';
    wishlistGrid.innerHTML = '';

    wishlist.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        card.innerHTML = `
            <div class="product-image" style="display: flex; align-items: center; justify-content: center; background-color: #f8f9fa;">
                <span style="font-size: 4rem;">${getCategoryEmoji(product.category)}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name" title="${product.title}">${product.title}</h3>
                <p class="product-price">${formatCurrency(product.price)}</p>
                <p style="font-size: 0.8rem; color: #666;">${product.category}</p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn-remove" style="flex: 1; padding: 0.5rem; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Eliminar</button>
                    <button class="btn-view" style="flex: 1; padding: 0.5rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Ver</button>
                </div>
            </div>
        `;

        card.querySelector('.btn-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            Store.removeFromWishlist(product.id);
            showToast('Eliminado de favoritos');
        });

        card.querySelector('.btn-view').addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `producto-detalle.html?id=${product.id}`;
        });

        wishlistGrid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', init);
