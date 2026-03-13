import { getUserByEmail, createUser, updateUser } from './api.js';
import { showMessage } from './ui.js';
import { MESSAGES } from '../config/constants.js';

// ==================== STATE ====================

let currentUser = null;

// ==================== AUTENTISERING ====================

export async function login(email, password) {
    try {
        const users = await getUserByEmail(email);

        if (users?.length > 0 && users[0].password === password) {
            currentUser = users[0];
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMessage(MESSAGES.LOGIN_SUCCESS, 'success');
            updateAuthUI();
            return true;
        }

        showMessage(MESSAGES.LOGIN_FAILED, 'error');
        return false;
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Technical error during login', 'error');
        return false;
    }
}

export async function register(userData) {
    try {
        const existingUsers = await getUserByEmail(userData.email);
        if (existingUsers?.length > 0) {
            showMessage('Email address is already registered', 'error');
            return false;
        }

        if (userData.password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return false;
        }

        const newUser = await createUser({
            ...userData,
            bookedCourses:    [],
            purchasedCourses: [],
            wishlist:         [],
            createdAt:        new Date().toISOString().split('T')[0],
            newsletter:       false,
        });

        if (newUser) {
            showMessage(MESSAGES.REGISTER_SUCCESS, 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Register error:', error);
        showMessage(MESSAGES.REGISTER_FAILED, 'error');
        return false;
    }
}

export function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    updateAuthUI();
    showMessage('You are logged out', 'info');
    window.location.href = 'index.html';
}

export function getCurrentUser() {
    if (!currentUser) {
        const stored = sessionStorage.getItem('currentUser');
        if (stored) currentUser = JSON.parse(stored);
    }
    return currentUser;
}

export async function updateProfile(updatedData) {
    const user = getCurrentUser();
    if (!user) {
        showMessage('Log in to update profile', 'error');
        return false;
    }

    try {
        const updatedUser = await updateUser(user.id, updatedData);
        if (updatedUser) {
            currentUser = updatedUser;
            sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
            showMessage('Profile updated!', 'success');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Profile update error:', error);
        showMessage('Could not update profile', 'error');
        return false;
    }
}

// ==================== UI ====================

function buildAuthLinks(user) {
    const isAdmin = user?.id === 1 || user?.id === '1';

    if (user) {
        return `
            <span class="welcome-text">Welcome, ${user.name}!</span>
            <a href="profile.html" class="profile-link">My Profile</a>
            ${isAdmin ? '<a href="admin.html" class="admin-link">Admin</a>' : ''}
            <a href="#" id="logout-link" class="logout-link">Logout</a>
        `;
    }

    return `
        <a href="login.html" class="login-link">Login</a>
        <a href="register.html" class="register-link">Register</a>
    `;
}

function attachLogoutListener(linkId) {
    document.getElementById(linkId)?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

export function updateAuthUI() {
    const user = getCurrentUser();

    const authLinks = document.getElementById('auth-links');
    if (authLinks) {
        authLinks.innerHTML = buildAuthLinks(user);
        attachLogoutListener('logout-link');
    }

    const drawerAuth = document.getElementById('drawer-auth-links');
    if (drawerAuth) {
        drawerAuth.innerHTML = buildAuthLinks(user);
        attachLogoutListener('logout-link');
    }
}

document.addEventListener('DOMContentLoaded', updateAuthUI);