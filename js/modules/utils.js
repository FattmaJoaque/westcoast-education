export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function formatDate(dateString) {
    if (!dateString) return 'Datum saknas';
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    try {
        return new Date(dateString).toLocaleDateString('sv-SE', options);
    } catch (error) {
        console.error('Date formatting error:', error);
        return dateString;
    }
}

export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function loadResource(url, type) {
    return new Promise((resolve, reject) => {
        let element;
        
        if (type === 'css') {
            element = document.createElement('link');
            element.rel = 'stylesheet';
            element.href = url;
        } else if (type === 'js') {
            element = document.createElement('script');
            element.src = url;
        } else {
            reject(new Error('Invalid resource type'));
            return;
        }
        
        element.onload = () => resolve(url);
        element.onerror = () => reject(new Error(`Failed to load ${url}`));
        
        document.head.appendChild(element);
    });
}
export function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}
