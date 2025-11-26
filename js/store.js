export const Store = {
    state: {
        user: null,
        cart: [],
        wishlist: [],
        products: [],
        categories: []
    },
    listeners: [],

    init() {
        const savedUser = localStorage.getItem('fakeStore_user');
        const savedCart = localStorage.getItem('fakeStore_cart');
        const savedWishlist = localStorage.getItem('fakeStore_wishlist');

        if (savedUser) {
            this.state.user = JSON.parse(savedUser);
        }

        if (savedCart) {
            this.state.cart = JSON.parse(savedCart);
        }

        if (savedWishlist) {
            this.state.wishlist = JSON.parse(savedWishlist);
        }

        this.notify();
    },

    // patrón Observer: cualquier componente se puede suscribir a cambios del estado
    subscribe(listener) {
        this.listeners.push(listener);
        listener(this.state);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },

    // cada vez que cambia el estado, notifica a todos los listeners y guarda en localStorage
    notify() {
        this.listeners.forEach(listener => listener(this.state));
        localStorage.setItem('fakeStore_cart', JSON.stringify(this.state.cart));
        localStorage.setItem('fakeStore_wishlist', JSON.stringify(this.state.wishlist));
        if (this.state.user) {
            localStorage.setItem('fakeStore_user', JSON.stringify(this.state.user));
        } else {
            localStorage.removeItem('fakeStore_user');
        }
    },

    setUser(user) {
        this.state.user = user;
        this.notify();
    },

    logout() {
        this.state.user = null;
        this.notify();
    },

    // si el producto ya está en el carrito, solo aumenta la cantidad
    // si no, lo agrega como nuevo item
    addToCart(product, quantity = 1) {
        const existingItem = this.state.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.state.cart.push({ ...product, quantity });
        }

        console.log(`Agregado al carrito: ${product.title}`);
        this.notify();
    },

    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item.id !== productId);
        this.notify();
    },

    updateCartQuantity(productId, change) {
        const item = this.state.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.notify();
            }
        }
    },

    clearCart() {
        this.state.cart = [];
        this.notify();
    },

    getCartTotal() {
        return this.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCartCount() {
        return this.state.cart.reduce((count, item) => count + item.quantity, 0);
    },

    addToWishlist(product) {
        if (!this.isInWishlist(product.id)) {
            this.state.wishlist.push(product);
            this.notify();
        }
    },

    removeFromWishlist(productId) {
        this.state.wishlist = this.state.wishlist.filter(item => item.id !== productId);
        this.notify();
    },

    isInWishlist(productId) {
        return this.state.wishlist.some(item => item.id === productId);
    }
};
