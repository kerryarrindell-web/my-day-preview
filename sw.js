const CACHE = 'myday-v131-colour-lists';
const FILES = ['./', 'index.html', 'my-day-v11.js', 'my-day-v11.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(cache =>
    cache.match(e.request, {ignoreSearch:true}).then(hit => {
      const net = fetch(e.request).then(res => {if(res && res.ok)cache.put(e.request,res.clone());return res}).catch(() => hit);
      return hit || net;
    })
  ));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
    for(const c of list){if('focus' in c)return c.focus()}
    return self.clients.openWindow('./');
  }));
});
