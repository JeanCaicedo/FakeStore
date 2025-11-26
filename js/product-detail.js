import { FakeStoreAPI } from './api.js';
import { Store } from './store.js';
import { formatCurrency, getUrlParam, renderStars, showToast, setupHeaderListeners, getCategoryEmoji } from './utils.js';

Store.init();

const productContainer = document.querySelector('.product-detail');
const breadcrumbs = document.querySelector('.breadcrumbs');
const cartBadge = document.querySelector('.cart-badge');

let currentProduct = null;

async function init() {
    const productId = getUrlParam('id');

    if (!productId) {
        alert('Producto no especificado');
        window.location.href = 'index.html';
        return;
    }

    try {
        currentProduct = await FakeStoreAPI.getProduct(productId);
        renderProduct(currentProduct);
        setupEventListeners();
        setupHeaderListeners();

        Store.subscribe(updateGlobalUI);
        updateGlobalUI(Store.state);

    } catch (error) {
        console.error('Error cargando producto:', error);
        productContainer.innerHTML = '<p>Error cargando el producto.</p>';
    }
}

function renderProduct(product) {
    breadcrumbs.innerHTML = `
        <a href="index.html">Productos</a> > 
        <span>${capitalize(product.category)}</span> > 
        <span>${truncate(product.title, 20)}</span>
    `;

    productContainer.innerHTML = `
        <div class="product-image-large" style="display: flex; align-items: center; justify-content: center; background-color: #f8f9fa; min-height: 400px;">
            <span style="font-size: 10rem;">${getCategoryEmoji(product.category)}</span>
        </div>

        <div class="product-info-detail">
            <h1 class="product-title">${product.title}</h1>

            <p class="product-description">
                ${product.description}
            </p>

            <div class="rating">
                <div class="stars">
                    ${renderStars(product.rating.rate)}
                </div>
                <span style="color: #666; font-size: 0.9rem;">${product.rating.rate} (${product.rating.count} reseñas)</span>
            </div>

            <div class="price-large">${formatCurrency(product.price)}</div>

            <div class="product-details">
                <h3 class="details-title">Detalles del Producto</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Categoría</span>
                        <span class="detail-value">${capitalize(product.category)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">ID Referencia</span>
                        <span class="detail-value">#${product.id}</span>
                    </div>
                </div>
            </div>

            <div class="action-buttons">
                <button class="btn-add-cart" id="add-to-cart-btn">
                    🛒 Añadir al Carrito
                </button>
                <button class="btn-wishlist">
                    ❤️
                </button>
            </div>
        </div>
    `;
}

function setupEventListeners() {
    const addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            Store.addToCart(currentProduct);
            showToast(`¡${truncate(currentProduct.title, 20)} agregado al carrito!`);
        });
    }

    const wishlistBtn = document.querySelector('.btn-wishlist');
    if (wishlistBtn) {
        if (Store.isInWishlist(currentProduct.id)) {
            wishlistBtn.textContent = '❤️ Guardado';
            wishlistBtn.style.backgroundColor = '#ffebee';
            wishlistBtn.style.color = '#d32f2f';
        }

        // toggle de favoritos: si ya está, lo quita; si no está, lo agrega
        wishlistBtn.addEventListener('click', () => {
            if (Store.isInWishlist(currentProduct.id)) {
                Store.removeFromWishlist(currentProduct.id);
                wishlistBtn.textContent = '❤️';
                wishlistBtn.style.backgroundColor = '';
                wishlistBtn.style.color = '';
                showToast('Eliminado de favoritos');
            } else {
                Store.addToWishlist(currentProduct);
                wishlistBtn.textContent = '❤️ Guardado';
                wishlistBtn.style.backgroundColor = '#ffebee';
                wishlistBtn.style.color = '#d32f2f';
                showToast('¡Agregado a favoritos!');
            }
        });
    }

}


function updateGlobalUI() {
    const count = Store.getCartCount();
    if (cartBadge) {
        cartBadge.setAttribute('data-count', count);

        if (!document.getElementById('badge-style')) {
            const style = document.createElement('style');
            style.id = 'badge-style';
            style.textContent = `
                .cart-badge::after {
                    content: attr(data-count);
                    display: ${count > 0 ? 'flex' : 'none'};
                }
            `;
            document.head.appendChild(style);
        } else {
            document.getElementById('badge-style').textContent = `
                .cart-badge::after {
                    content: "${count}";
                    display: ${count > 0 ? 'flex' : 'none'};
                }
            `;
        }
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, n) {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
}

document.addEventListener('DOMContentLoaded', init);
