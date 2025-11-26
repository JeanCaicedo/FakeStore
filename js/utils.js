export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

export function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// crea notificaciones temporales que desaparecen solas después de 3 segundos
export function showToast(message) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        background-color: #333;
        color: white;
        padding: 1rem 2rem;
        margin-top: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
        opacity: 0;
        animation-fill-mode: forwards;
    `;

    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

export function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let html = '';

    for (let i = 0; i < fullStars; i++) {
        html += '<span class="star" style="background-color: #ffd700;"></span>';
    }
    if (hasHalfStar) {
        html += '<span class="star half" style="background: linear-gradient(90deg, #ffd700 50%, #ddd 50%);"></span>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        html += '<span class="star" style="background-color: #ddd;"></span>';
    }

    return html;
}

// función común para todas las páginas: configura los eventos del header (carrito, usuario, dashboard, favoritos)
export function setupHeaderListeners() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => window.location.href = 'carrito.html');
    }

    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        userIcon.addEventListener('click', () => window.location.href = 'login.html');
    }

    const dashboardIcon = document.querySelector('.dashboard-icon');
    if (dashboardIcon) {
        dashboardIcon.addEventListener('click', () => window.location.href = 'dashboard.html');
    }

    const wishlistIcon = document.querySelector('.wishlist-icon');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', () => window.location.href = 'favoritos.html');
    }

    const logo = document.querySelector('.logo');
    if (logo && !logo.onclick) {
        logo.addEventListener('click', () => window.location.href = 'index.html');
    }
}

// asigna un emoji según la categoría del producto (usamos emojis en vez de imágenes para simplificar)
export function getCategoryEmoji(category) {
    if (!category) return '📦';

    const cat = category.toLowerCase();

    if (cat.includes('clothing') || cat.includes('ropa')) {
        if ((cat.includes('men') || cat.includes('hombre')) && !(cat.includes('women') || cat.includes('mujer'))) return '👕';
        if (cat.includes('women') || cat.includes('mujer')) return '👗';
        return '👚';
    }
    if (cat.includes('jewelery') || cat.includes('jewelry') || cat.includes('joyería') || cat.includes('joyeria')) return '💍';
    if (cat.includes('electronics') || cat.includes('electrónica') || cat.includes('electronica')) return '💻';

    return '📦';
}   
