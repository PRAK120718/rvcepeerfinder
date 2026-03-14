// Neopeer PWA Initialization
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = window.location.pathname.includes('/wireframes/') ? '../sw.js' : './sw.js';
        navigator.serviceWorker.register(swPath)
            .then(reg => console.log('Neopeer Service Worker registered', reg.scope))
            .catch(err => console.log('Neopeer Service Worker registration failed', err));
    });
}
