// Cache-first: una vez abierta, la app funciona sin cobertura.
var CACHE = 'milan-e480e64fee73';
var ACTIVOS = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ACTIVOS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;   // los enlaces a Apple Maps salen a la red
  e.respondWith(
    caches.match(e.request).then(function(hit){
      var red = fetch(e.request).then(function(res){
        if(res && res.status === 200){
          var copia = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
        }
        return res;
      }).catch(function(){ return hit; });
      return hit || red;
    })
  );
});
