import { registerSW } from 'virtual:pwa-register';

// Log any errors during registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(error => {
    console.error('Service worker registration failed:', error);
  });
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(registration) {
    console.log('Service Worker registered', registration);
  },
  onRegisterError(error) {
    console.error('Service Worker registration failed:', error);
  }
});
