const BASE_URL = 'https://fakestoreapi.com';

export class FakeStoreAPI {
    static async getProducts(limit = null, sort = 'asc') {
        let url = `${BASE_URL}/products?sort=${sort}`;
        if (limit) {
            url += `&limit=${limit}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        return data.map(transformProduct);
    }

    static async getProduct(id) {
        const response = await fetch(`${BASE_URL}/products/${id}`);
        const data = await response.json();
        return transformProduct(data);
    }

    static async getCategories() {
        const response = await fetch(`${BASE_URL}/products/categories`);
        const data = await response.json();
        return data.map(translateCategory);
    }

    static async getProductsByCategory(category, sort = 'asc') {
        const response = await fetch(`${BASE_URL}/products/category/${category}?sort=${sort}`);
        const data = await response.json();
        return data.map(transformProduct);
    }

    static async login(username, password) {
        // usuario especial para pruebas, esto es un hack para el demo
        if (username === 'jean' && password === 'jean123') {
            return { token: 'fake_token_jean_123' };
        }

        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    }

    static async register(userData) {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    }

    static async getUser(id) {
        const response = await fetch(`${BASE_URL}/users/${id}`);
        return response.json();
    }

    static async getCart(userId) {
        const response = await fetch(`${BASE_URL}/carts/user/${userId}`);
        return response.json();
    }

    static async createCart(cartData) {
        const response = await fetch(`${BASE_URL}/carts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartData)
        });
        return response.json();
    }

    static async addProduct(productData) {
        const response = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        return response.json();
    }

    static async updateProduct(id, productData) {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        return response.json();
    }

    static async deleteProduct(id) {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
}

// tasa de cambio para convertir USD a COP (1 USD = 4000 COP)
const EXCHANGE_RATE = 4000;

const CATEGORY_TRANSLATIONS = {
    "men's clothing": "Ropa de Hombre",
    "jewelery": "Joyería",
    "electronics": "Electrónica",
    "women's clothing": "Ropa de Mujer"
};

const PRODUCT_TRANSLATIONS = {
    1: { title: "Mochila Fjallraven", desc: "Mochila perfecta para el día a día. Diseño clásico y duradero." },
    2: { title: "Camiseta Casual Hombre", desc: "Camiseta de algodón suave, corte slim fit ideal para cualquier ocasión." },
    3: { title: "Chaqueta de Algodón", desc: "Chaqueta ligera y cómoda, perfecta para climas templados." },
    4: { title: "Camisa Slim Fit", desc: "Camisa casual ajustada, estilo moderno y elegante." },
    5: { title: "Brazalete de Plata", desc: "Brazalete con diseño de dragón, hecho a mano en plata y bronce." },
    6: { title: "Anillo de Oro Sólido", desc: "Anillo delicado de oro sólido con micropavé de diamantes." },
    7: { title: "Anillo Princesa Chapado", desc: "Anillo chapado en oro blanco, diseño clásico de princesa." },
    8: { title: "Aretes de Búho", desc: "Aretes de acero inoxidable con diseño de búho, chapados en oro rosa." },
    9: { title: "Disco Duro WD 2TB", desc: "Disco duro externo USB 3.0, compatible con PC y consolas." },
    10: { title: "SSD SanDisk 1TB", desc: "Unidad de estado sólido interna de alto rendimiento." },
    11: { title: "SSD Silicon Power", desc: "SSD de 256GB con tecnología 3D NAND para mayor velocidad." },
    12: { title: "Disco Gaming WD 4TB", desc: "Disco duro diseñado para gamers, gran capacidad y velocidad." },
    13: { title: "Monitor Acer 21.5\"", desc: "Monitor Full HD ultra delgado, ideal para oficina y hogar." },
    14: { title: "Monitor Curvo Samsung 49\"", desc: "Monitor gaming ultra ancho de 49 pulgadas, experiencia inmersiva." },
    15: { title: "Chaqueta Invierno Mujer", desc: "Chaqueta 3 en 1 para nieve, impermeable y térmica." },
    16: { title: "Chaqueta Biker Mujer", desc: "Chaqueta de cuero sintético estilo motociclista con capucha removible." },
    17: { title: "Impermeable Mujer", desc: "Chaqueta ligera para lluvia, cortavientos y transpirable." },
    18: { title: "Camiseta Cuello V Mujer", desc: "Camiseta básica de manga corta, tela suave y elástica." },
    19: { title: "Camiseta Deportiva Mujer", desc: "Camiseta técnica para running y entrenamiento, secado rápido." },
    20: { title: "Camiseta Casual Mujer", desc: "Camiseta de algodón con estampado casual." }
};

function translateCategory(cat) {
    return CATEGORY_TRANSLATIONS[cat] || cat;
}

// transforma los productos de la API: convierte precios a COP y traduce todo al español
function transformProduct(product) {
    product.price = Math.round(product.price * EXCHANGE_RATE);
    product.category = translateCategory(product.category);

    if (PRODUCT_TRANSLATIONS[product.id]) {
        product.title = PRODUCT_TRANSLATIONS[product.id].title;
        product.description = PRODUCT_TRANSLATIONS[product.id].desc;
    }

    return product;
}
