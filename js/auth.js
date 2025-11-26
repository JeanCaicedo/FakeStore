import { FakeStoreAPI } from './api.js';
import { Store } from './store.js';
import { showToast, setupHeaderListeners } from './utils.js';

Store.init();

const loginForm = document.querySelector('.form-card:last-child form');
const registerForm = document.querySelector('.form-card:first-child form');

async function init() {
    setupHeaderListeners();
    setupEventListeners();

    // si ya está logueado, mostramos opción de cerrar sesión en vez de redirigir automáticamente
    // esto es para que el usuario pueda cerrar sesión si quiere
    if (Store.state.user) {
        const container = document.querySelector('.form-container');
        if (container) {
            container.innerHTML = `
                <div class="form-card" style="max-width: 400px; margin: 0 auto; text-align: center;">
                    <h2 class="form-title">¡Hola, ${capitalize(Store.state.user.name.firstname)}!</h2>
                    <p style="margin-bottom: 2rem;">Ya has iniciado sesión correctamente.</p>
                    <div style="font-size: 4rem; margin-bottom: 2rem;">👋</div>
                    <button id="btn-logout" class="btn" style="background-color: #dc3545;">Cerrar Sesión</button>
                    <button id="btn-home" class="btn" style="margin-top: 1rem; background-color: #6c757d;">Ir al Inicio</button>
                </div>
            `;

            document.getElementById('btn-logout').addEventListener('click', () => {
                Store.logout();
                window.location.reload();
            });

            document.getElementById('btn-home').addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }
}

function setupEventListeners() {
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const btn = loginForm.querySelector('button');

            try {
                btn.textContent = 'Cargando...';
                btn.disabled = true;

                const { token } = await FakeStoreAPI.login(username, password);
                localStorage.setItem('fakeStore_token', token);

                // la API de FakeStore no devuelve info del usuario después del login
                // así que tenemos que buscarlo manualmente o usar el usuario especial "jean"
                let user;
                if (username === 'jean') {
                    // usuario especial para pruebas del proyecto
                    user = {
                        id: 999,
                        username: 'jean',
                        email: 'jean@example.com',
                        name: { firstname: 'Jean', lastname: 'Caicedo' },
                        address: { city: 'Bogotá', street: 'Calle Falsa 123' },
                        phone: '3001234567'
                    };
                } else {
                    // buscamos el usuario en la lista de usuarios de la API
                    const users = await fetch('https://fakestoreapi.com/users').then(res => res.json());
                    user = users.find(u => u.username === username) || users[0];
                }

                Store.setUser(user);

                try {
                    const userCart = await FakeStoreAPI.getCart(user.id);
                    console.log('Carrito del usuario cargado:', userCart);
                } catch (err) {
                    console.log('Usuario sin carrito previo');
                }

                showToast(`¡Bienvenido de nuevo, ${capitalize(user.name.firstname)}!`);
                setTimeout(() => window.location.href = 'index.html', 1500);

            } catch (error) {
                console.error(error);
                showToast('Error de inicio de sesión. Verifica tus credenciales.');
                btn.textContent = 'Iniciar Sesión';
                btn.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userData = {
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                name: {
                    firstname: document.getElementById('fullname').value.split(' ')[0],
                    lastname: document.getElementById('fullname').value.split(' ')[1] || ''
                },
                address: {
                    city: 'Bogotá',
                    street: document.getElementById('address').value,
                    number: 0,
                    zipcode: '00000',
                    geolocation: { lat: '0', long: '0' }
                },
                phone: document.getElementById('phone').value
            };

            const btn = registerForm.querySelector('button');

            try {
                btn.textContent = 'Registrando...';
                btn.disabled = true;

                const newUser = await FakeStoreAPI.register(userData);
                console.log('Usuario registrado:', newUser);

                showToast('¡Registro exitoso! Por favor inicia sesión.');

                registerForm.reset();
                document.getElementById('login-username').focus();

            } catch (error) {
                console.error(error);
                showToast('Error en el registro. Intenta nuevamente.');
            } finally {
                btn.textContent = 'Registrarse';
                btn.disabled = false;
            }
        });
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

document.addEventListener('DOMContentLoaded', init);
