self.addEventListener('push', (event) => {
  event.waitUntil(self.registration.showNotification('Mood Log', {
    body: '¿Cómo va tu día? Tómate un momento para registrar cómo te sientes.',
    icon: '/icons/mood-log-app-192.png',
    tag: 'mood-log-daily',
  }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/mood-flow'));
});
