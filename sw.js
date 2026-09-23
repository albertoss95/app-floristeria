// Service worker: la app abre sin cobertura, pero SIEMPRE intenta traer lo nuevo primero.
// Estrategia "red primero, caché de respaldo": con red se sirve la versión más reciente
// (y se actualiza la caché); sin red, se sirve lo último que se cacheó.
// Subir el número de versión en cada despliegue fuerza la limpieza de cachés viejas.
const CACHE = "floristeria-v11";
const FICHEROS = ["./", "./index.html", "./styles.css", "./app.js", "./parser.js", "./manifest.json"];
// Los iconos no hacen falta sin cobertura (el sistema los copia al instalar): se cachean aparte
// y sin que un fallo suyo impida activar la version nueva.
const OPCIONALES = ["./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHEROS).then(() => Promise.allSettled(OPCIONALES.map((f) => c.add(f))))));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then((r) => {
        if (r.ok) caches.open(CACHE).then((c) => c.put(e.request, r.clone()));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
