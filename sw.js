const CACHE_NAME = 'neopeer-v1';
const ASSETS = [
  '/',
  '/styles.css',
  '/pwa-init.js',
  '/wireframes/00-landing.html',
  '/wireframes/00-otp-verification.html',
  '/wireframes/01-onboarding-overview.html',
  '/wireframes/02-get-to-know-you.html',
  '/wireframes/04-student-list.html',
  '/wireframes/05-student-summary.html',
  '/wireframes/28-my-profile.html',
  '/wireframes/39-mentor-recommendations.html',
  '/wireframes/42-mentor-success-profile.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
