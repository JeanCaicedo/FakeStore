import { FakeStoreAPI } from './api.js';
import { Store } from './store.js';
import { formatCurrency, showToast, setupHeaderListeners, getCategoryEmoji } from './utils.js';

Store.init();

const productsTableBody = document.getElementById('productos-lista');
const productForm = document.getElementById('form-producto');
const categorySelect = document.getElementById('categoria');

async function init() {
    setupHeaderListeners();
    // protección básica del lado del cliente (en producción esto debería ser en el backend)
    if (!Store.state.user) {
        alert('Acceso denegado. Debes iniciar sesión.');
        window.location.href = 'login.html';
        return;
    }

    try {
        await loadCategories();
        await loadProducts();
        setupEventListeners();
    } catch (error) {
        console.error('Error inicializando dashboard:', error);
    }
}

async function loadCategories() {
    const categories = await FakeStoreAPI.getCategories();

    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = capitalize(cat);
        categorySelect.appendChild(option);
    });
}

async function loadProducts() {
    productsTableBody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    const products = await FakeStoreAPI.getProducts();

    renderProductsTable(products);
}

function renderProductsTable(products) {
    productsTableBody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="product-thumbnail" style="display: flex; align-items: center; justify-content: center; background-color: #f0f0f0; border-radius: 50%; width: 50px; height: 50px;">
                        <span style="font-size: 1.5rem;">${getCategoryEmoji(product.category)}</span>
                    </div>
                    <span>${truncate(product.title, 30)}</span>
                </div>
            </td>
            <td>${formatCurrency(product.price)}</td>
            <td><span class="category-badge">${product.category}</span></td>
            <td>
                <button class="edit-btn" data-id="${product.id}" title="Editar">✏️</button>
                <button class="delete-btn" data-id="${product.id}" title="Eliminar" style="border:none; background:none; cursor:pointer;">🗑️</button>
            </td>
        `;

        row.querySelector('.edit-btn').addEventListener('click', () => handleEdit(product));
        row.querySelector('.delete-btn').addEventListener('click', () => handleDelete(product.id));

        productsTableBody.appendChild(row);
    });
}

function setupEventListeners() {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productData = {
            title: document.getElementById('titulo').value,
            price: parseFloat(document.getElementById('precio').value),
            description: document.getElementById('descripcion').value,
            image: document.getElementById('imagen-url').value || 'https://i.pravatar.cc',
            category: document.getElementById('categoria').value
        };

        const editingId = productForm.dataset.editingId;

        try {
            // el CRUD es simulado porque FakeStoreAPI no persiste cambios reales
            // solo hace la petición pero los cambios no se guardan permanentemente
            if (editingId) {
                await FakeStoreAPI.updateProduct(editingId, productData);
                showToast('Producto actualizado (Simulado)');
                delete productForm.dataset.editingId;
                productForm.querySelector('button[type="submit"]').textContent = 'Añadir Producto';
            } else {
                await FakeStoreAPI.addProduct(productData);
                showToast('Producto creado (Simulado)');
            }

            productForm.reset();

        } catch (error) {
            console.error(error);
            showToast('Error guardando producto');
        }
    });
}

function handleEdit(product) {
    document.getElementById('titulo').value = product.title;
    document.getElementById('precio').value = product.price;
    document.getElementById('descripcion').value = product.description;
    document.getElementById('imagen-url').value = product.image;
    document.getElementById('categoria').value = product.category;

    productForm.dataset.editingId = product.id;
    productForm.querySelector('button[type="submit"]').textContent = 'Actualizar Producto';

    productForm.scrollIntoView({ behavior: 'smooth' });
}

async function handleDelete(id) {
    if (confirm('¿Eliminar producto?')) {
        try {
            await FakeStoreAPI.deleteProduct(id);
            showToast('Producto eliminado (Simulado)');
            const btn = document.querySelector(`.delete-btn[data-id="${id}"]`);
            if (btn) btn.closest('tr').remove();
        } catch (error) {
            console.error(error);
            showToast('Error eliminando producto');
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
