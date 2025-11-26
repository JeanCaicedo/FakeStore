import { FakeStoreAPI } from './api.js';
import { Store } from './store.js';
import { formatCurrency, showToast, setupHeaderListeners, getCategoryEmoji } from './utils.js';

Store.init();

const productsGrid = document.querySelector('.products-grid');
const categoryFilters = document.querySelector('.category-filters');
const searchInput = document.querySelector('.search-bar input');
const sortButton = document.querySelector('.filter-btn:last-child');

let currentCategory = 'all';
let currentSort = 'asc';
let allProducts = [];

async function init() {
    try {
        await loadCategories();
        await loadProducts();
        setupEventListeners();
        setupHeaderListeners();
        updateCartUI(Store.state);
        Store.subscribe(updateCartUI);
    } catch (error) {
        console.error('Error inicializando home:', error);
        showToast('Error cargando productos. Por favor recarga la página.');
    }
}

async function loadCategories() {
    const categories = await FakeStoreAPI.getCategories();

    const allBtn = categoryFilters.querySelector('.filter-btn.active');
    categoryFilters.innerHTML = '';
    categoryFilters.appendChild(allBtn);

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = capitalize(cat);
        btn.dataset.category = cat;
        btn.addEventListener('click', () => handleCategoryFilter(cat, btn));
        categoryFilters.appendChild(btn);
    });

    categoryFilters.appendChild(sortButton);
}

async function loadProducts() {
    productsGrid.innerHTML = '<div class="loader">Cargando productos...</div>';

    try {
        let products;
        if (currentCategory === 'all') {
            products = await FakeStoreAPI.getProducts(null, currentSort);
        } else {
            products = await FakeStoreAPI.getProductsByCategory(currentCategory, currentSort);
        }

        allProducts = products;
        renderProducts(products);
    } catch (error) {
        productsGrid.innerHTML = '<p>Error cargando productos.</p>';
        console.error(error);
    }
}

function renderProducts(products) {
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = (e) => {
            window.location.href = `producto-detalle.html?id=${product.id}`;
        };

        card.innerHTML = `
            <div class="product-image" style="display: flex; align-items: center; justify-content: center; background-color: #f8f9fa;">
                <span style="font-size: 4rem;">${getCategoryEmoji(product.category)}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name" title="${product.title}">${truncate(product.title, 40)}</h3>
                <p class="product-price">${formatCurrency(product.price)}</p>
                <p style="font-size: 0.8rem; color: #666;">${capitalize(product.category)}</p>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function handleCategoryFilter(category, btnElement) {
    currentCategory = category;

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    loadProducts();
}

function setupEventListeners() {
    // búsqueda en tiempo real: filtra los productos mientras escribes
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => p.title.toLowerCase().includes(term));
        renderProducts(filtered);
    });

    sortButton.addEventListener('click', () => {
        currentSort = currentSort === 'asc' ? 'desc' : 'asc';
        sortButton.textContent = `Ordenar por ${currentSort === 'asc' ? '↓' : '↑'}`;
        loadProducts();
    });

    const allBtn = categoryFilters.querySelector('.filter-btn:first-child');
    allBtn.addEventListener('click', () => handleCategoryFilter('all', allBtn));
}

function updateCartUI(state) {
    const badge = document.querySelector('.cart-badge');
    const count = Store.getCartCount();

    badge.setAttribute('data-count', count);

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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, n) {
    return (str.length > n) ? str.substr(0, n - 1) + '&hellip;' : str;
}

document.addEventListener('DOMContentLoaded', init);
