// La Floristería — prototipo local. Sin backend, sin cuentas: todo vive en el móvil.
"use strict";

/* ---------- almacenamiento ---------- */
const guardar = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };

let encargos = leer("encargos", []);

// Catálogo por defecto: flores habituales de una floristería de barrio en Madrid.
// Precio = coste aproximado POR TALLO para la florista (rango de-a, en €), fuera de
// campaña. ORIENTATIVO: sale de catálogos de mayoristas y precios de mercado de 2026,
// no de un albarán real. Belén lo corrige desde "Tus flores". En San Valentín o el
// Día de la Madre la rosa puede doblar o triplicar.
const CATALOGO_POR_DEFECTO = [
  // rosas
  { id: 1,  nombre: "rosa", grupo: "rosas",              alias: ["rosas"],                          precioMin: 0.9, precioMax: 1.8 },
  { id: 2,  nombre: "rosa roja", grupo: "rosas",         alias: [],                                 precioMin: 1.0, precioMax: 2.0 },
  { id: 3,  nombre: "rosa blanca", grupo: "rosas",       alias: [],                                 precioMin: 0.9, precioMax: 1.8 },
  { id: 4,  nombre: "rosa rosa", grupo: "rosas",         alias: ["rosa rosada"],                    precioMin: 0.9, precioMax: 1.8 },
  { id: 5,  nombre: "rosa ramificada", grupo: "rosas",   alias: ["rosa spray", "rosa pitiminí", "pitimini"], precioMin: 1.5, precioMax: 2.5 },
  // flor de foco
  { id: 6,  nombre: "hortensia", grupo: "flor de foco",         alias: ["ortensia", "hortencia", "urtencia"], precioMin: 3.0, precioMax: 6.0 },
  { id: 7,  nombre: "peonía", grupo: "flor de foco",            alias: ["peonia", "peonias"],              precioMin: 3.0, precioMax: 6.0 },
  { id: 8,  nombre: "lilium", grupo: "flor de foco",            alias: ["lilio", "lirio", "liliums"],      precioMin: 1.8, precioMax: 3.5 },
  { id: 9,  nombre: "gerbera", grupo: "flor de foco",           alias: ["gerberas"],                       precioMin: 0.7, precioMax: 1.3 },
  { id: 10, nombre: "girasol", grupo: "flor de foco",           alias: ["girasoles"],                      precioMin: 1.2, precioMax: 2.2 },
  { id: 11, nombre: "tulipán", grupo: "flor de foco",           alias: ["tulipan", "tulipanes", "tulipans"], precioMin: 0.6, precioMax: 1.2 },
  { id: 12, nombre: "anémona", grupo: "flor de foco",           alias: ["anemona", "anemonas"],            precioMin: 1.2, precioMax: 2.2 },
  { id: 13, nombre: "ranúnculo", grupo: "flor de foco",         alias: ["ranunculo", "ranunculos"],        precioMin: 1.5, precioMax: 3.0 },
  { id: 14, nombre: "fresia", grupo: "flor de foco",            alias: ["freesia", "fresias"],             precioMin: 0.7, precioMax: 1.3 },
  { id: 15, nombre: "lisianthus", grupo: "flor de foco",        alias: ["lisiantus", "lisianto"],          precioMin: 1.2, precioMax: 2.2 },
  { id: 16, nombre: "alstroemeria", grupo: "flor de foco",      alias: ["astromelia", "alstromeria", "astromelias"], precioMin: 0.6, precioMax: 1.2 },
  { id: 17, nombre: "orquídea", grupo: "flor de foco",          alias: ["orquidea", "orquideas", "cymbidium"], precioMin: 3.0, precioMax: 7.0 },
  { id: 18, nombre: "anturio", grupo: "flor de foco",           alias: ["anthurium", "anturios"],          precioMin: 2.0, precioMax: 4.0 },
  { id: 19, nombre: "dalia", grupo: "flor de foco",             alias: ["dalias"],                         precioMin: 1.5, precioMax: 3.0 },
  { id: 20, nombre: "protea", grupo: "flor de foco",            alias: ["proteas"],                        precioMin: 3.5, precioMax: 7.0 },
  // clavel y crisantemo (funeral, cementerio, básicos)
  { id: 21, nombre: "clavel", grupo: "clavel y funeral",            alias: ["claveles"],                       precioMin: 0.3, precioMax: 0.6 },
  { id: 22, nombre: "clavel blanco", grupo: "clavel y funeral",     alias: [],                                 precioMin: 0.3, precioMax: 0.6 },
  { id: 23, nombre: "clavelina", grupo: "clavel y funeral",         alias: ["clavelinas", "mini clavel"],      precioMin: 0.4, precioMax: 0.8 },
  { id: 24, nombre: "crisantemo", grupo: "clavel y funeral",        alias: ["crisantemos", "margarita"],       precioMin: 0.8, precioMax: 1.6 },
  { id: 25, nombre: "gladiolo", grupo: "clavel y funeral",          alias: ["gladiolos"],                      precioMin: 0.8, precioMax: 1.5 },
  { id: 26, nombre: "calla", grupo: "clavel y funeral",             alias: ["cala", "calas", "callas"],        precioMin: 1.5, precioMax: 3.0 },
  { id: 27, nombre: "delphinium", grupo: "clavel y funeral",        alias: ["delfinium", "espuela"],           precioMin: 1.5, precioMax: 2.5 },
  { id: 28, nombre: "antirrhinum", grupo: "clavel y funeral",       alias: ["boca de dragon", "dragonaria"],   precioMin: 1.0, precioMax: 1.8 },
  // relleno
  { id: 29, nombre: "paniculata", grupo: "relleno",        alias: ["gypsophila", "gipsofila", "velo de novia"], precioMin: 1.5, precioMax: 3.0 },
  { id: 30, nombre: "limonium", grupo: "relleno",          alias: ["limonio", "estatice", "statice"], precioMin: 1.0, precioMax: 2.0 },
  { id: 31, nombre: "solidago", grupo: "relleno",          alias: [],                                 precioMin: 0.8, precioMax: 1.5 },
  { id: 32, nombre: "lavanda", grupo: "relleno",           alias: [],                                 unidad: "manojo", precioMin: 2.0, precioMax: 4.0 },
  { id: 33, nombre: "wax", grupo: "relleno",               alias: ["waxflower", "flor de cera"],      precioMin: 1.2, precioMax: 2.2 },
  // verdes (suelen ir por manojo o rama)
  { id: 34, nombre: "eucalipto", grupo: "verdes",         alias: ["eucaliptus"],                     unidad: "manojo", precioMin: 2.0, precioMax: 4.0 },
  { id: 35, nombre: "ruscus", grupo: "verdes",            alias: ["rusco"],                          unidad: "manojo", precioMin: 1.5, precioMax: 3.0 },
  { id: 36, nombre: "aspidistra", grupo: "verdes",        alias: ["aspidistras"],                    precioMin: 0.5, precioMax: 1.0 },
  { id: 37, nombre: "helecho", grupo: "verdes",           alias: ["helechos", "esparraguera"],       unidad: "manojo", precioMin: 1.5, precioMax: 3.0 },
  { id: 38, nombre: "monstera", grupo: "verdes",          alias: ["hoja de monstera"],               precioMin: 1.0, precioMax: 2.0 },
  { id: 39, nombre: "pistacho", grupo: "verdes",          alias: ["lentisco", "pistacia"],           unidad: "manojo", precioMin: 2.0, precioMax: 3.5 },
  { id: 40, nombre: "beargrass", grupo: "verdes",         alias: ["bear grass"],                     unidad: "manojo", precioMin: 1.5, precioMax: 3.0 },
  // materiales
  { id: 41, nombre: "espuma", grupo: "materiales",            alias: ["oasis", "esponja"],               precioMin: 1.2, precioMax: 2.5 },
  { id: 42, nombre: "base", grupo: "materiales",              alias: ["base de centro", "recipiente", "cuenco"], precioMin: 2.0, precioMax: 6.0 },
  { id: 43, nombre: "cinta", grupo: "materiales",             alias: ["cinta de raso", "lazo"],          unidad: "metro", precioMin: 0.3, precioMax: 0.8 },
  { id: 44, nombre: "papel", grupo: "materiales",             alias: ["papel de envolver", "celofán", "celofan"], precioMin: 0.5, precioMax: 1.5 },
  { id: 45, nombre: "alambre", grupo: "materiales",           alias: ["alambres"],                       precioMin: 0.1, precioMax: 0.3 },
];
let catalogo = leer("catalogo", CATALOGO_POR_DEFECTO);

// Si Belén ya tiene catálogo guardado de una versión anterior, le añadimos las flores
// nuevas que no tenga (por nombre) y el grupo a las que ya tenía, sin tocar sus precios.
(function completarCatalogo() {
  const porNombre = new Map(CATALOGO_POR_DEFECTO.map((f) => [f.nombre, f]));
  let cambios = 0;
  for (const f of catalogo) {
    const ref = porNombre.get(f.nombre);
    if (!f.grupo) { f.grupo = ref ? ref.grupo : "mías"; cambios++; }
    if (ref) {
      // une alias: los suyos + los nuevos que no tuviera
      const suyos = new Set(f.alias || []);
      const nuevos = ref.alias.filter((a) => !suyos.has(a));
      if (nuevos.length) { f.alias = [...(f.alias || []), ...nuevos]; cambios++; }
      if (!f.unidad && ref.unidad) { f.unidad = ref.unidad; cambios++; }
      // si no tenía precio, coge el orientativo; si ya puso uno, ni tocarlo
      if (f.precioMin == null && f.precioMax == null && ref.precioMin != null) {
        f.precioMin = ref.precioMin; f.precioMax = ref.precioMax; cambios++;
      }
    }
  }
  const tengo = new Set(catalogo.map((f) => f.nombre));
  for (const f of CATALOGO_POR_DEFECTO) {
    if (!tengo.has(f.nombre)) { catalogo.push({ ...f, id: Date.now() + cambios }); cambios++; }
  }
  if (cambios) guardar("catalogo", catalogo);
})();
let tirado = leer("tirado", []); // [{ts, florId, nombre, cantidad}] — lo que se va a la basura
let cuenta = leer("cuenta-abierta", null); // {presupuesto, lineas, abierta}
let editandoId = null;
let detalleId = null;

/* ---------- navegación ---------- */
// Pantallas de primer nivel: tienen barra inferior y en ellas es seguro recargar
// para instalar una versión nueva (no hay nada a medio escribir).
const PRINCIPALES = ["pantalla-inicio", "pantalla-flores", "pantalla-historico", "pantalla-ajustes"];
let actualizacionPendiente = false; // hay un service worker nuevo esperando a que sea buen momento
function recargarSinPerderNada() {
  // un input enfocado con onchange aún no ha guardado: soltar el foco antes de recargar
  document.activeElement?.blur?.();
  setTimeout(() => location.reload(), 30);
}
function ir(id) {
  if (PRINCIPALES.includes(id) && actualizacionPendiente) { recargarSinPerderNada(); return; }
  if (document.querySelector(".pantalla.activa")?.id === "pantalla-encargo" && id !== "pantalla-encargo") editandoId = null;
  document.querySelectorAll(".pantalla").forEach((p) => p.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");
  const barra = document.getElementById("barra");
  barra.classList.toggle("oculto", !PRINCIPALES.includes(id));
  barra.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.p === id));
  if (id === "pantalla-inicio") pintarInicio();
  if (id === "pantalla-flores") pintarFlores();
  if (id === "pantalla-historico") pintarHistorico();
  if (id === "pantalla-tirar") pintarTirar();
  if (id === "pantalla-ajustes") pintarAjustes();
  window.scrollTo(0, 0);
}
// Atajo: desde una línea "sin precio" de la cuenta a Tus flores con la búsqueda hecha.
function irAFlorId(id) { const f = catalogo.find((x) => x.id === id); if (f) irAFlor(f.nombre); }
function irAFlor(nombre) {
  if (actualizacionPendiente) { ir("pantalla-flores"); return; } // ir() recarga; la búsqueda se perdería igual
  grupoActivo = "todas";
  ir("pantalla-flores");
  const b = document.getElementById("buscar-flor"); b.value = nombre; pintarFlores();
  setTimeout(() => document.querySelector("#lista-flores input.precio")?.focus(), 80);
}

/* ---------- SE TIRA (instrumento, no función: convierte la merma en euros) ---------- */
// El precio se lee del catálogo al pintar, como en la cuenta: si Belén pone precios
// más tarde, lo tirado de antes también se valora.
function precioDe(t) {
  const f = catalogo.find((x) => x.id === t.florId) || catalogo.find((x) => x.nombre === t.nombre);
  return { precioMin: f?.precioMin ?? null, precioMax: f?.precioMax ?? null, unidad: f?.unidad || "tallos" };
}
function textoEuros(t) {
  return (t.min || t.max) ? `≈ ${Math.round(t.min)}–${Math.round(t.max)} €` : "";
}
function abrirTirar() {
  const b = document.getElementById("buscar-tirar"); if (b) b.value = "";
  ir("pantalla-tirar");
  setTimeout(() => b?.focus(), 50);
}
function pintarTirar() {
  const q = normalizar(document.getElementById("buscar-tirar")?.value || "").replace(/,/g, "");
  // sin búsqueda: primero lo que más se tira (lo tendrá a un toque), luego el resto por grupo
  const veces = new Map();
  for (const t of tirado) veces.set(t.florId, (veces.get(t.florId) || 0) + 1);
  const orden = (f) => GRUPOS.indexOf(f.grupo || "mías");
  const visibles = catalogo
    .filter((f) => !q || normalizar(f.nombre).includes(q) || (f.alias || []).some((a) => normalizar(a).includes(q)))
    .sort((a, b) => (veces.get(b.id) || 0) - (veces.get(a.id) || 0) || orden(a) - orden(b) || a.nombre.localeCompare(b.nombre, "es"))
    .slice(0, q ? 20 : 12);

  const cantidades = [1, 2, 3, 5, 10];
  document.getElementById("lista-tirar").innerHTML = visibles.length
    ? visibles.map((f) => `<div class="tirar-fila">
        <span class="nombre">${esc(f.nombre)}${f.unidad ? ` <small>(${f.unidad})</small>` : ""}</span>
        <div class="cantidades">${cantidades.map((n) => `<button class="chip" onclick="apuntarTirado(${f.id}, ${n})">${n}</button>`).join("")}<button class="chip" onclick="apuntarTirado(${f.id}, null)">otra</button></div>
      </div>`).join("")
    : `<p class="vacio">Nada con "${esc(q)}". <a href="#" onclick="anadirFlorDesdeTirar();return false">Añadir "${esc(q)}"</a></p>`;

  // lo de hoy, con deshacer
  const hoy = hoyISO();
  const deHoy = tirado.map((t, i) => ({ t, i })).filter(({ t }) => isoLocal(new Date(t.ts)) === hoy).reverse();
  const total = totalCuenta(deHoy.map(({ t }) => ({ cantidad: t.cantidad, ...precioDe(t) })));
  document.getElementById("tirado-hoy").innerHTML = deHoy.length
    ? `<p class="ayuda" style="margin:0 0 6px">${deHoy.reduce((s, { t }) => s + t.cantidad, 0)} en total ${textoEuros(total) ? "· " + textoEuros(total) : ""}</p>` +
      deHoy.map(({ t, i }) => `<div class="flor-fila"><span class="nombre" style="flex:2;padding:8px;font-weight:600">${t.cantidad} ${esc(t.nombre)}</span><button onclick="tirado.splice(${i},1);guardar('tirado',tirado);pintarTirar()" title="deshacer">✕</button></div>`).join("")
    : '<p class="vacio">Hoy nada, bien.</p>';
}
function apuntarTirado(florId, cantidad) {
  const f = catalogo.find((x) => x.id === florId); if (!f) return;
  if (cantidad == null) {
    const v = parseInt(prompt(`¿Cuántas ${f.nombre} se tiran?`, ""), 10);
    if (!v || v < 1) return; cantidad = v;
  }
  tirado.push({ ts: new Date().toISOString(), florId, nombre: f.nombre, cantidad });
  guardar("tirado", tirado);
  const ok = document.getElementById("tirar-ok");
  const e = textoEuros(totalCuenta([{ cantidad, ...precioDe({ florId }) }]));
  ok.textContent = `✓ ${cantidad} ${f.nombre} → se tira ${e ? "(" + e + ")" : ""}`;
  ok.classList.remove("oculto");
  clearTimeout(ok._t); ok._t = setTimeout(() => ok.classList.add("oculto"), 2200);
  document.getElementById("buscar-tirar").value = "";
  pintarTirar();
}
function anadirFlorDesdeTirar() {
  const nombre = (document.getElementById("buscar-tirar")?.value || "").toLowerCase().replace(/,/g, "").trim(); if (!nombre) return;
  catalogo.push({ id: Date.now(), nombre, alias: [], grupo: "mías", precioMin: null, precioMax: null });
  guardar("catalogo", catalogo);
  pintarTirar();
}
function pintarHistoricoTirado() {
  // por mes, el más reciente primero: cuántos tallos y cuántos euros, y qué es lo que más se tira
  const meses = new Map();
  for (const t of tirado) {
    const k = isoLocal(new Date(t.ts)).slice(0, 7);
    if (!meses.has(k)) meses.set(k, []);
    meses.get(k).push(t);
  }
  const claves = [...meses.keys()].sort().reverse();
  const cont = document.getElementById("historico-tirado");
  if (!claves.length) { cont.innerHTML = '<p class="vacio">Nada apuntado. Está en "se tira algo", en la pantalla de inicio.</p>'; return; }
  cont.innerHTML = claves.map((k) => {
    const items = meses.get(k);
    const [y, m] = k.split("-");
    const total = totalCuenta(items.map((t) => ({ cantidad: t.cantidad, ...precioDe(t) })));
    const n = items.reduce((s, t) => s + t.cantidad, 0);
    const porFlor = new Map();
    for (const t of items) porFlor.set(t.nombre, (porFlor.get(t.nombre) || 0) + t.cantidad);
    const top = [...porFlor.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([nom, c]) => `${c} ${nom}`).join(", ");
    const tallosSinPrecio = items.filter((t) => precioDe(t).precioMin == null).reduce((s, t) => s + t.cantidad, 0);
    const sinPrecio = tallosSinPrecio ? ` · <a href="#" onclick="ir('pantalla-flores');return false">${tallosSinPrecio} sin precio en Tus flores</a>` : "";
    return `<div class="tarjeta-encargo hecho" style="opacity:1">
      <div class="titulo">${MESES[parseInt(m, 10) - 1]} ${y} · ${n} tirados ${textoEuros(total) ? "· " + textoEuros(total) : ""}</div>
      <div class="sub">${esc(top)}${sinPrecio}</div>
    </div>`;
  }).join("");
}

/* ---------- HISTÓRICO ---------- */
function fechaCorta(ts) {
  const d = new Date(ts);
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}
function pintarHistorico() {
  // centros montados (cuentas cerradas), el más reciente primero
  const cuentas = leer("cuentas-cerradas", []).slice().reverse();
  document.getElementById("historico-cuentas").innerHTML = cuentas.length
    ? cuentas.map((c) => {
        const t = totalCuenta(c.lineas);
        const importe = (t.min || t.max) ? `≈ ${Math.round(t.min)}–${Math.round(t.max)} €` : "";
        return `<div class="tarjeta-encargo hecho" style="opacity:1">
          <div class="titulo">${c.presupuesto ? "Centro de " + c.presupuesto + " €" : "Centro"} ${importe ? "· " + importe : ""}</div>
          <div class="sub">${fechaCorta(c.cerrada)} · ${esc(c.lineas.map((l) => `${l.cantidad ?? "~"} ${l.articulo}`).join(", "))}</div>
        </div>`;
      }).join("")
    : '<p class="vacio">Todavía ninguno.</p>';

  // encargos ya hechos, el más reciente primero (los pendientes, aunque sean de
  // fecha pasada, siguen en el inicio: un olvido no se archiva solo)
  const pasados = encargos
    .filter((e) => e.estado === "hecho")
    .sort((a, b) => ((b.fecha || "") + b.creado > (a.fecha || "") + a.creado ? 1 : -1));
  document.getElementById("historico-encargos").innerHTML = pasados.length
    ? pasados.map(tarjetaEncargo).join("")
    : '<p class="vacio">Todavía ninguno.</p>';

  pintarHistoricoTirado();
}

/* ---------- utilidades de fecha ---------- */
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fechaLarga(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`.toUpperCase();
}
// Fecha LOCAL (toISOString es UTC: entre las 0 y las 2 de la madrugada cambiaba el "hoy")
function isoLocal(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
const hoyISO = () => isoLocal(new Date());
function mananaISO() { const d = new Date(); d.setDate(d.getDate() + 1); return isoLocal(d); }
// Números tal y como los escribe Belén: el teclado decimal de Android en español pone coma
function num(v) { const n = parseFloat(String(v ?? "").replace(",", ".")); return isNaN(n) ? null : n; }
// Texto de usuario dentro de HTML/atributos (nombres con comillas, dedicatorias pegadas de WhatsApp)
function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
const salto = (s) => esc(s).replace(/\n/g, "<br>");

/* ---------- INICIO ---------- */
function pintarInicio() {
  // aviso de cuenta abierta
  const aviso = document.getElementById("aviso-cuenta-abierta");
  if (cuenta) {
    const min = Math.round((Date.now() - cuenta.abierta) / 60000);
    aviso.textContent = `▲ Tienes una cuenta abierta${cuenta.presupuesto ? ` de ${cuenta.presupuesto} €` : ""} · hace ${min < 60 ? min + " min" : Math.round(min / 60) + " h"} · toca para seguir`;
    aviso.classList.remove("oculto");
  } else aviso.classList.add("oculto");

  // aviso de encargo a medias (borrador guardado)
  const avB = document.getElementById("aviso-borrador");
  const borrador = leer("borrador-encargo", null);
  const hayBorrador = borrador && Object.values(borrador).some((v) => v);
  if (hayBorrador && editandoId == null) {
    const pista = borrador.que || borrador.texto || borrador.quien || "";
    avB.textContent = `✎ Tienes un encargo a medias${pista ? ` · "${pista.slice(0, 30)}"` : ""} · toca para seguir`;
    avB.classList.remove("oculto");
  } else avB.classList.add("oculto");

  // encargos: pendientes primero por fecha; hechos de hoy al final
  const cont = document.getElementById("lista-encargos");
  const pendientes = encargos.filter((e) => e.estado !== "hecho").sort((a, b) => (a.fecha || "9999") < (b.fecha || "9999") ? -1 : 1);
  const hechosHoy = encargos.filter((e) => e.estado === "hecho" && e.fecha === hoyISO());
  if (!pendientes.length && !hechosHoy.length) {
    cont.innerHTML = '<p class="vacio">Nada apuntado. 🌿</p>';
    return;
  }
  let html = "", ultimoDia = null;
  for (const e of pendientes) {
    const dia = e.fecha || "sin-fecha";
    if (dia !== ultimoDia) {
      const etiqueta = !e.fecha ? "⚠ Sin fecha"
        : e.fecha < hoyISO() ? `⚠ Atrasado · ${fechaLarga(e.fecha).toLowerCase()}`
        : e.fecha === hoyISO() ? `Hoy, ${fechaLarga(e.fecha).toLowerCase()}`
        : e.fecha === mananaISO() ? `Mañana, ${fechaLarga(e.fecha).toLowerCase()}`
        : fechaLarga(e.fecha).toLowerCase();
      html += `<div class="dia-cabecera">${etiqueta}</div>`;
      ultimoDia = dia;
    }
    html += tarjetaEncargo(e);
  }
  if (hechosHoy.length) {
    html += `<div class="dia-cabecera">Hechos hoy</div>` + hechosHoy.map(tarjetaEncargo).join("");
  }
  cont.innerHTML = html;
}

function faltas(e) {
  const f = [];
  if (!e.fecha) f.push("¿para qué día?");
  if (!e.importe) f.push("¿cuánto?");
  if (!e.entrega) f.push("¿recogen o se lleva?");
  if (e.entrega === "Se lleva a domicilio" && !e.direccion) f.push("¿dónde?");
  return f;
}
function tarjetaEncargo(e) {
  const f = faltas(e);
  const urgente = e.fecha && e.fecha <= hoyISO() && e.estado !== "hecho"; // hoy o atrasado
  return `<div class="tarjeta-encargo ${urgente ? "urgente" : ""} ${e.estado === "hecho" ? "hecho" : ""}" onclick="verEncargo(${e.id})">
    <div class="titulo">${esc(e.que || "Encargo")}${e.importe ? " · " + esc(e.importe) + " €" : ""}${e.hora ? " · antes de las " + esc(e.hora) : ""}</div>
    <div class="sub">${[e.entrega, e.quien, e.direccion].filter(Boolean).map(esc).join(" · ") || "&nbsp;"}</div>
    ${f.length ? `<div class="falta">⚠ Falta: ${f.join(" ")}</div>` : ""}
  </div>`;
}

/* ---------- APUNTAR ENCARGO ---------- */
function vaciarFormularioEncargo() {
  ["texto", "que", "importe", "fecha", "hora", "direccion", "quien", "dedicatoria", "cliente"].forEach((c) => (document.getElementById("enc-" + c).value = ""));
  document.getElementById("enc-entrega").value = "";
  document.getElementById("enc-sorpresa").value = "";
  document.getElementById("enc-fecha-larga").textContent = "";
}
function cargarBorrador() {
  const borrador = leer("borrador-encargo", null);
  if (!borrador || !Object.values(borrador).some((v) => v)) return false;
  Object.entries(borrador).forEach(([k, v]) => { const el = document.getElementById("enc-" + k); if (el) el.value = v; });
  document.getElementById("enc-fecha-larga").textContent = fechaLarga(borrador.fecha);
  return true;
}
// "Apuntar encargo": si hay uno a medias, se sigue con él (criterio del 02: "si cierro la
// app a medio apuntar, al volver sigue ahí"). Vaciar es explícito: el botón "descartar".
function nuevoEncargo() {
  editandoId = null;
  vaciarFormularioEncargo();
  cargarBorrador();
  ir("pantalla-encargo");
}
function seguirBorrador() { nuevoEncargo(); }
function descartarEncargo() {
  if (editandoId == null) guardar("borrador-encargo", null);
  editandoId = null;
  vaciarFormularioEncargo();
  ir("pantalla-inicio");
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("enc-fecha").addEventListener("change", (ev) => {
    document.getElementById("enc-fecha-larga").textContent = fechaLarga(ev.target.value);
  });
  // borrador que sobrevive a cerrar la app
  document.querySelectorAll("#pantalla-encargo input, #pantalla-encargo textarea, #pantalla-encargo select").forEach((el) => {
    el.addEventListener("input", guardarBorrador);
  });
  cargarBorrador();
  pintarInicio();
});
function guardarBorrador() {
  if (editandoId != null) return; // editar uno existente no es un borrador nuevo
  const b = {};
  ["texto", "que", "importe", "fecha", "hora", "direccion", "quien", "dedicatoria", "cliente", "entrega", "sorpresa"].forEach((c) => (b[c] = document.getElementById("enc-" + c).value));
  guardar("borrador-encargo", b);
}
function guardarEncargo() {
  const v = (c) => document.getElementById("enc-" + c).value.trim();
  const e = {
    id: editandoId ?? Date.now(),
    texto: v("texto"), que: v("que"), importe: v("importe"), fecha: v("fecha"), hora: v("hora"),
    entrega: v("entrega"), sorpresa: v("sorpresa"), direccion: v("direccion"), quien: v("quien"),
    dedicatoria: v("dedicatoria"), cliente: v("cliente"), estado: "apuntado", creado: Date.now(),
  };
  if (!e.que && !e.texto) { alert("Apunta al menos qué es."); return; }
  if (!e.que && e.texto) e.que = e.texto.slice(0, 40); // algo antes que nada
  if (editandoId != null) {
    const i = encargos.findIndex((x) => x.id === editandoId);
    e.estado = encargos[i].estado; e.creado = encargos[i].creado;
    encargos[i] = e;
  } else encargos.push(e);
  guardar("encargos", encargos);
  if (editandoId == null) guardar("borrador-encargo", null); // editar no toca el borrador del encargo nuevo
  editandoId = null;
  ir("pantalla-inicio");
}

/* ---------- DETALLE ---------- */
function verEncargo(id) {
  detalleId = id;
  const e = encargos.find((x) => x.id === id);
  const campos = [
    ["Qué", e.que], ["Cuánto", e.importe ? e.importe + " €" : null],
    ["Cuándo", e.fecha ? fechaLarga(e.fecha) : null, "grande"], ["Hora tope", e.hora],
    ["Entrega", e.entrega], ["Dónde", e.direccion], ["Para quién", e.quien],
    ["Sorpresa", e.sorpresa], ["Tarjeta", e.dedicatoria], ["Lo pide", e.cliente],
    ["Tal cual llegó", e.texto],
  ];
  const f = faltas(e);
  document.getElementById("detalle-contenido").innerHTML =
    campos.filter(([, val]) => val).map(([k, val, cls]) => `<div class="detalle-campo"><div class="k">${k}</div><div class="v ${cls || ""}">${salto(val)}</div></div>`).join("") +
    (f.length ? `<div class="falta" style="padding:10px 0">⚠ Falta preguntar: ${f.join(" ")}</div>` : "");
  document.getElementById("btn-hecho").classList.toggle("oculto", e.estado === "hecho");
  ir("pantalla-detalle");
}
function marcarHecho() {
  const e = encargos.find((x) => x.id === detalleId);
  e.estado = "hecho"; guardar("encargos", encargos); ir("pantalla-inicio");
}
function editarEncargo() {
  const e = encargos.find((x) => x.id === detalleId);
  editandoId = e.id;
  ["texto", "que", "importe", "fecha", "hora", "direccion", "quien", "dedicatoria", "cliente"].forEach((c) => (document.getElementById("enc-" + c).value = e[c] || ""));
  document.getElementById("enc-entrega").value = e.entrega || "";
  document.getElementById("enc-sorpresa").value = e.sorpresa || "";
  document.getElementById("enc-fecha-larga").textContent = fechaLarga(e.fecha);
  ir("pantalla-encargo");
}
function borrarEncargo() {
  if (!confirm("¿Borrar este encargo?")) return;
  encargos = encargos.filter((x) => x.id !== detalleId);
  guardar("encargos", encargos); ir("pantalla-inicio");
}
function imprimirTarjeta() {
  const e = encargos.find((x) => x.id === detalleId);
  // se puede retocar antes de imprimir (criterio H3 del 02); lo retocado se guarda
  const texto = prompt(e.dedicatoria ? "Texto de la tarjeta (retócalo si hace falta):" : "No hay dedicatoria apuntada. Escríbela:", e.dedicatoria || "");
  if (!texto) return;
  if (texto !== e.dedicatoria) { e.dedicatoria = texto; guardar("encargos", encargos); verEncargo(e.id); }
  let zona = document.getElementById("zona-impresion");
  if (!zona) { zona = document.createElement("div"); zona.id = "zona-impresion"; document.body.appendChild(zona); }
  zona.textContent = texto;
  window.print();
}

/* ---------- LA CUENTA DEL CENTRO ---------- */
function nuevaCuenta() {
  if (cuenta) { reabrirCuenta(); return; }
  ir("pantalla-presupuesto");
}
function abrirCuenta(presupuesto) {
  cuenta = { presupuesto, lineas: [], abierta: Date.now() };
  guardar("cuenta-abierta", cuenta);
  grupoCuenta = "todas"; const b = document.getElementById("buscar-cuenta"); if (b) b.value = "";
  pintarCuenta(); ir("pantalla-cuenta");
}
function reabrirCuenta() { grupoCuenta = "todas"; const b = document.getElementById("buscar-cuenta"); if (b) b.value = ""; pintarCuenta(); ir("pantalla-cuenta"); }
function cerrarCuenta() {
  if (cuenta && cuenta.lineas.length) {
    const historial = leer("cuentas-cerradas", []);
    historial.push({ ...cuenta, cerrada: Date.now() });
    guardar("cuentas-cerradas", historial);
  }
  cuenta = null; guardar("cuenta-abierta", null);
  ir("pantalla-inicio");
}
// El precio se mira en el catálogo AL PINTAR, no al añadir: así, si Belén pone
// precios después de dictar, la cuenta se actualiza sola.
// Si la línea era una palabra desconocida (sin florId) y Belén la añade luego a Tus flores,
// también se resuelve: por nombre o alias.
function florDeLinea(l) {
  if (l.florId != null) { const f = catalogo.find((x) => x.id === l.florId); if (f) return f; }
  // tolerante al plural: "celosias" encuentra "celosia" y al revés
  const raiz = (s) => normalizar(s).replace(/(es|s)$/, "");
  const n = raiz(l.articulo || "");
  return n ? catalogo.find((x) => raiz(x.nombre) === n || (x.alias || []).some((a) => raiz(a) === n)) : null;
}
function lineasConPrecios() {
  return cuenta.lineas.map((l) => {
    const f = florDeLinea(l);
    return { ...l, precioMin: f?.precioMin ?? l.precioMin ?? null, precioMax: f?.precioMax ?? l.precioMax ?? null };
  });
}
function pintarCuenta() {
  document.getElementById("cuenta-titulo").textContent = cuenta.presupuesto ? `Centro de ${cuenta.presupuesto} €` : "Centro";
  const lineas = lineasConPrecios();
  const t = totalCuenta(lineas);
  const nTotal = lineas.reduce((s, l) => s + (l.cantidad ?? 0), 0);

  // barra: siempre visible para que la cabecera no baile; sin presupuesto muestra solo el importe
  const relleno = document.getElementById("cuenta-barra-relleno");
  const hayImporte = t.min > 0 || t.max > 0;
  const rango = hayImporte ? `≈ ${Math.round(t.min)}–${Math.round(t.max)} €` : "";
  const sinPrecio = t.sinPrecio ? ` (+${t.sinPrecio} sin precio)` : "";
  if (cuenta.presupuesto) {
    const medio = (t.min + t.max) / 2;
    relleno.style.width = Math.min(100, (medio / cuenta.presupuesto) * 100) + "%";
    relleno.classList.toggle("pasado", medio > cuenta.presupuesto);
    document.getElementById("cuenta-barra-texto").textContent = (hayImporte ? `${rango} de ${cuenta.presupuesto} €` : `0 € de ${cuenta.presupuesto} €`) + sinPrecio;
  } else {
    relleno.style.width = "0";
    document.getElementById("cuenta-barra-texto").textContent = hayImporte ? `Llevas ${rango}${sinPrecio}` : "Toca + en lo que metas";
  }
  // resumen de lo que lleva
  document.getElementById("cuenta-resumen").innerHTML = lineas.length
    ? lineas.map((l) => `<span class="pastilla">${l.cantidad ?? "~"} ${esc(l.articulo)}</span>`).join("") + (nTotal ? `<span class="pastilla total">${nTotal} en total</span>` : "")
    : '<span class="pastilla vacia">nada todavía</span>';

  // selector: buscador + grupos + filas con − n +
  const q = normalizar(document.getElementById("buscar-cuenta")?.value || "").replace(/,/g, "");
  // cantidad por flor sumando líneas (la voz puede haber creado dos con distinta unidad)
  const enCuenta = new Map();
  for (const l of cuenta.lineas) if (l.florId != null) enCuenta.set(l.florId, (enCuenta.get(l.florId) || 0) + (l.cantidad ?? 1));
  if (grupoCuenta === "en-el-centro" && !enCuenta.size) grupoCuenta = "todas"; // se vació: el chip desaparece, el filtro también
  const presentes = GRUPOS.filter((g) => catalogo.some((f) => (f.grupo || "mías") === g));
  const chip = (g, txt) => `<button class="chip ${grupoCuenta === g ? "on" : ""}" onclick="grupoCuenta='${g}';pintarCuenta()">${txt}</button>`;
  document.getElementById("grupos-cuenta").innerHTML =
    chip("todas", "todas") + (enCuenta.size ? chip("en-el-centro", `en el centro · ${enCuenta.size}`) : "") + presentes.map((g) => chip(g, g)).join("");

  const orden = (f) => GRUPOS.indexOf(f.grupo || "mías");
  const visibles = catalogo
    .slice()
    .sort((a, b) => orden(a) - orden(b) || a.nombre.localeCompare(b.nombre, "es"))
    .filter((f) => grupoCuenta === "todas" || (grupoCuenta === "en-el-centro" ? enCuenta.has(f.id) : (f.grupo || "mías") === grupoCuenta))
    .filter((f) => !q || normalizar(f.nombre).includes(q) || (f.alias || []).some((a) => normalizar(a).includes(q)));

  let html = "", ultimo = null;
  for (const f of visibles) {
    const g = f.grupo || "mías";
    if (grupoCuenta === "todas" && !q && g !== ultimo) { html += `<div class="dia-cabecera">${g}</div>`; ultimo = g; }
    const n = enCuenta.get(f.id) || 0;
    const precio = f.precioMin != null ? `${f.precioMin}–${f.precioMax ?? f.precioMin} €${f.unidad ? "/" + f.unidad : ""}` : `<span class="sinprecio" onclick="irAFlorId(${f.id})">sin precio</span>`;
    html += `<div class="sel-fila ${n ? "en" : ""}">
      <div class="sel-info"><div class="sel-nombre">${esc(f.nombre)}</div><div class="sel-precio">${precio}</div></div>
      <div class="stepper">
        <button onclick="sumarFlor(${f.id}, -1)" aria-label="una menos" ${n ? "" : "disabled"}>−</button>
        <span class="n" onclick="cantidadFlor(${f.id})">${n}</span>
        <button class="mas" onclick="sumarFlor(${f.id}, 1)" aria-label="una más">+</button>
      </div>
    </div>`;
  }
  document.getElementById("cuenta-selector").innerHTML = html
    || (q ? `<p class="vacio">Nada con "${esc(q)}". <a href="#" onclick="anadirFlorDesdeCuenta();return false">Añadir "${esc(q)}"</a></p>` : '<p class="vacio">Nada en este grupo.</p>');

  // cosas dictadas que no están en el catálogo (solo con la voz activada)
  const sueltas = cuenta.lineas.map((l, i) => ({ l, i })).filter(({ l }) => l.florId == null);
  const cont = document.getElementById("cuenta-lineas");
  cont.classList.toggle("oculto", !sueltas.length);
  cont.innerHTML = sueltas.map(({ l, i }) =>
    `<div class="linea"><span class="cant">${l.cantidad ?? "~"}</span><span class="arti">${esc(l.articulo)}${l.unidad ? " (" + l.unidad + ")" : ""}${lineas[i].precioMin == null ? ` <span class="sinprecio" onclick="irAFlor(cuenta.lineas[${i}].articulo)">sin precio · ponerlo</span>` : ""}</span><button onclick="quitarLinea(${i})">✕</button></div>`
  ).join("");
}
let grupoCuenta = "todas";
// Cuántas hay de una flor en la cuenta (sumando líneas; una dictada "un poco" cuenta como 1)
function cantidadEnCuenta(id) {
  return cuenta.lineas.filter((x) => x.florId === id).reduce((s, x) => s + (x.cantidad ?? 1), 0);
}
function sumarFlor(id, delta) {
  const f = catalogo.find((x) => x.id === id); if (!f) return;
  const u = f.unidad || null;
  // si la voz dejó varias líneas de la misma flor, las fundimos en una antes de tocar
  const mias = cuenta.lineas.filter((x) => x.florId === id);
  let l = mias[0];
  if (mias.length > 1) {
    l.cantidad = mias.reduce((s, x) => s + (x.cantidad ?? 1), 0);
    l.unidad = l.unidad || u;
    for (const extra of mias.slice(1)) cuenta.lineas.splice(cuenta.lineas.indexOf(extra), 1);
  }
  if (!l) {
    if (delta <= 0) return;
    l = { cantidad: 0, unidad: u, articulo: f.nombre, florId: id, precioMin: f.precioMin ?? null, precioMax: f.precioMax ?? null };
    cuenta.lineas.push(l);
  }
  l.cantidad = (l.cantidad ?? 1) + delta;
  if (l.cantidad <= 0) cuenta.lineas.splice(cuenta.lineas.indexOf(l), 1);
  guardar("cuenta-abierta", cuenta);
  pintarCuenta();
}
function cantidadFlor(id) {
  const f = catalogo.find((x) => x.id === id); if (!f) return;
  const actual = cantidadEnCuenta(id);
  const v = parseInt(prompt(`¿Cuántas ${f.nombre}?`, actual || ""), 10);
  if (isNaN(v) || v < 0) return;
  sumarFlor(id, v - actual);
}
function anadirFlorDesdeCuenta() {
  const nombre = (document.getElementById("buscar-cuenta")?.value || "").toLowerCase().replace(/,/g, "").trim(); if (!nombre) return;
  const f = { id: Date.now(), nombre, alias: [], grupo: "mías", precioMin: null, precioMax: null };
  catalogo.push(f); guardar("catalogo", catalogo);
  document.getElementById("buscar-cuenta").value = ""; grupoCuenta = "todas";
  sumarFlor(f.id, 1);
}
function quitarLinea(i) { cuenta.lineas.splice(i, 1); guardar("cuenta-abierta", cuenta); pintarCuenta(); }

/* ---------- voz: opcional, se activa en Ajustes ---------- */
function aplicarVoz() {
  const on = !!leer("voz", false);
  document.getElementById("zona-voz").classList.toggle("oculto", !on);
  document.getElementById("pantalla-cuenta").classList.toggle("con-voz", on);
  const cb = document.getElementById("aj-voz"); if (cb) cb.checked = on;
}
document.addEventListener("DOMContentLoaded", aplicarVoz);

function procesarFrase(frase) {
  const r = procesarDictado(frase, cuenta.lineas, catalogo);
  const resp = document.getElementById("cuenta-respuesta");
  resp.classList.add("oculto");
  if (r.accion === "consulta") {
    const t = totalCuenta(lineasConPrecios());
    const msg = cuenta.lineas.length
      ? (t.min || t.max)
        ? `Llevas ≈ ${Math.round(t.min)}–${Math.round(t.max)} €${cuenta.presupuesto ? ` de ${cuenta.presupuesto} €` : ""}${t.sinPrecio ? ` y ${t.sinPrecio} cosas sin precio` : ""}`
        : `Llevas ${cuenta.lineas.length} cosas apuntadas (sin precios aún)`
      : "No llevas nada todavía";
    resp.textContent = msg; resp.classList.remove("oculto");
    if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(msg); u.lang = "es-ES"; speechSynthesis.speak(u); }
    return;
  }
  if (r.accion === "pregunta") { resp.textContent = "🤔 " + r.pregunta; resp.classList.remove("oculto"); return; }
  if (r.accion === "ignorar") { resp.textContent = r.aviso || "No te he entendido, ¿lo repites?"; resp.classList.remove("oculto"); return; }
  cuenta.lineas = r.lineas;
  guardar("cuenta-abierta", cuenta);
  pintarCuenta();
  if (r.aviso) { resp.textContent = r.aviso; resp.classList.remove("oculto"); }
  if (navigator.vibrate) navigator.vibrate(60);
}
function dictadoTecleado() {
  const inp = document.getElementById("cuenta-teclado");
  if (inp.value.trim()) { procesarFrase(inp.value); inp.value = ""; }
}

/* --- pulsar y hablar --- */
(function () {
  const btn = document.getElementById("btn-hablar");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    btn.textContent = "El micro no funciona en este navegador: usa el teclado de abajo";
    btn.disabled = true;
    return;
  }
  let rec = null, resultado = "";
  function empezar(ev) {
    ev.preventDefault();
    resultado = "";
    rec = new SR();
    rec.lang = "es-ES"; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e) => { for (const r of e.results) if (r.isFinal) resultado += " " + r[0].transcript; };
    rec.onerror = () => {};
    try { rec.start(); btn.classList.add("grabando"); btn.innerHTML = "🔴<br>TE ESCUCHO…<br>suelta al acabar"; } catch {}
  }
  function terminar(ev) {
    ev.preventDefault();
    if (!rec) return;
    btn.classList.remove("grabando"); btn.innerHTML = "🎤<br>MANTÉN PULSADO<br>Y HABLA";
    rec.onend = () => { if (resultado.trim()) procesarFrase(resultado); rec = null; };
    try { rec.stop(); } catch { rec = null; }
  }
  btn.addEventListener("touchstart", empezar); btn.addEventListener("touchend", terminar);
  btn.addEventListener("mousedown", empezar); btn.addEventListener("mouseup", terminar);
})();

/* ---------- FLORES ---------- */
const GRUPOS = ["rosas", "flor de foco", "clavel y funeral", "relleno", "verdes", "materiales", "mías"];
let grupoActivo = "todas";

function pintarFlores() {
  const q = normalizar(document.getElementById("buscar-flor")?.value || "").replace(/,/g, "");
  // chips de grupo (solo los que tienen algo)
  const presentes = GRUPOS.filter((g) => catalogo.some((f) => (f.grupo || "mías") === g));
  document.getElementById("grupos-flores").innerHTML =
    [`<button class="chip ${grupoActivo === "todas" ? "on" : ""}" onclick="grupoActivo='todas';pintarFlores()">todas</button>`]
      .concat(presentes.map((g) => `<button class="chip ${grupoActivo === g ? "on" : ""}" onclick="grupoActivo='${g}';pintarFlores()">${g}</button>`))
      .join("");

  const orden = (f) => GRUPOS.indexOf(f.grupo || "mías");
  const visibles = catalogo
    .map((f, i) => ({ f, i }))
    .sort((a, b) => orden(a.f) - orden(b.f) || a.f.nombre.localeCompare(b.f.nombre, "es"))
    .filter(({ f }) => grupoActivo === "todas" || (f.grupo || "mías") === grupoActivo)
    .filter(({ f }) => !q || normalizar(f.nombre).includes(q) || (f.alias || []).some((a) => normalizar(a).includes(q)));

  if (!visibles.length) {
    document.getElementById("lista-flores").innerHTML = `<p class="vacio">Nada con "${esc(q)}". Puedes añadirla abajo.</p>`;
    return;
  }
  // agrupadas con cabecera cuando se ven "todas" sin búsqueda
  let html = "", ultimo = null;
  for (const { f, i } of visibles) {
    const g = f.grupo || "mías";
    if (grupoActivo === "todas" && !q && g !== ultimo) { html += `<div class="dia-cabecera">${g}</div>`; ultimo = g; }
    html += `<div class="flor-fila">
      <input class="nombre" value="${esc(f.nombre)}" onchange="catalogo[${i}].nombre=this.value.toLowerCase().trim();guardar('catalogo',catalogo)">
      <input class="precio" inputmode="decimal" placeholder="de" value="${f.precioMin ?? ""}" onchange="catalogo[${i}].precioMin=num(this.value);guardar('catalogo',catalogo)">
      <span class="guion">–</span>
      <input class="precio" inputmode="decimal" placeholder="a" value="${f.precioMax ?? ""}" onchange="catalogo[${i}].precioMax=num(this.value);guardar('catalogo',catalogo)">
      <button class="quitar" onclick="quitarFlor(${i})" aria-label="quitar ${esc(f.nombre)}">✕</button>
    </div>`;
  }
  document.getElementById("lista-flores").innerHTML = html;
}
function quitarFlor(i) {
  if (!confirm(`¿Quitar ${catalogo[i].nombre}?`)) return;
  catalogo.splice(i, 1); guardar("catalogo", catalogo); pintarFlores();
}
function anadirFlor() {
  const q = document.getElementById("buscar-flor")?.value.trim();
  const nombre = prompt("Nombre de la flor:", q || "");
  if (!nombre) return;
  catalogo.push({ id: Date.now(), nombre: nombre.toLowerCase().trim(), alias: [], grupo: "mías", precioMin: null, precioMax: null });
  guardar("catalogo", catalogo);
  document.getElementById("buscar-flor").value = ""; grupoActivo = "todas";
  pintarFlores();
}
function exportarTodo() {
  const datos = { encargos, catalogo, tirado, cuentasCerradas: leer("cuentas-cerradas", []), cuentaAbierta: cuenta, borradorEncargo: leer("borrador-encargo", null), version: VERSION, exportado: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `floristeria-copia-${hoyISO()}.json`;
  a.click();
}

/* ---------- versión y novedades ---------- */
// Subir VERSION en cada despliegue y contar en NOVEDADES qué cambia, en las palabras de
// Belén: es lo que verá en el aviso al abrir la app tras actualizarse.
const VERSION = "2026-09-23.9";
const NOVEDADES = {
  "2026-09-23.9": "Calcular centro ahora es tocar: buscas la flor, le das a + y la barra de arriba te dice cuánto llevas. El dictado por voz queda apagado; si quieres probarlo, se enciende en Ajustes.",
  "2026-09-23.7": "Arreglos en la cuenta: \"quita una hortensia\" quita una (no todas), \"tres rosas más\" y \"no, quita una\" ya se entienden. Si dejas un encargo a medias, en el inicio sale para seguirlo. Los precios aceptan coma (4,5). Botones más grandes.",
  "2026-09-23.6": "Barra de abajo para ir a Inicio, Flores, Histórico y Ajustes. Las actualizaciones se instalan solas y te avisan. En la cuenta, toca \"sin precio\" para ponérselo a una flor.",
  "2026-09-23.5": "Botón \"se tira algo\" en el inicio: apunta lo que tiras en dos toques y el histórico te dice cuánto dinero se ha ido al mes.",
  "2026-09-23.4": "Buscador y secciones en Tus flores.",
};
function pintarAjustes() {
  document.getElementById("version").textContent = VERSION;
  document.getElementById("ajustes-novedades").textContent = NOVEDADES[VERSION] || "";
}
// Al abrir con una versión distinta de la última vista → aviso en el inicio con lo nuevo.
document.addEventListener("DOMContentLoaded", () => {
  // La versión "vista" se guarda al CERRAR el aviso, no al cargar: justo tras un despliegue
  // la app se recarga dos veces (la segunda la provoca el service worker nuevo) y si se
  // guardara al cargar, el aviso desaparecería antes de que nadie lo viera.
  // "version-vista" no existía antes de la .6: si no está pero ya hay datos guardados, es
  // una usuaria de una versión anterior y también merece el aviso.
  const vista = leer("version-vista", null);
  const yaUsaba = localStorage.getItem("encargos") || localStorage.getItem("catalogo") || localStorage.getItem("cuentas-cerradas");
  if (!vista && !yaUsaba) guardar("version-vista", VERSION); // primera instalación: nada que anunciar
  else if (vista !== VERSION) {
    const av = document.getElementById("aviso-novedades");
    av.innerHTML = `<b>✓ App actualizada</b><br>${NOVEDADES[VERSION] || "Pequeños arreglos."}<br><small>toca para cerrar</small>`;
    av.classList.remove("oculto");
  }
  pintarAjustes();
  document.querySelector('#barra button[data-p="pantalla-inicio"]').classList.add("on");
});

/* ---------- service worker: funciona sin cobertura y se actualiza solo ---------- */
// Cuando el navegador detecta un sw.js nuevo, este toma el control al instante (skipWaiting).
// Entonces: si Belén está en una pantalla principal, recargamos ya; si está a medias
// (dictando un centro, rellenando un encargo), no le cortamos: aviso discreto y se instala
// al volver al inicio. Además comprobamos si hay versión nueva cada vez que la app vuelve
// al frente y cada 20 min, porque una PWA instalada puede pasar días sin "abrirse".
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then((reg) => {
    const vigilar = (nuevo) => {
      if (!nuevo) return;
      nuevo.addEventListener("statechange", () => {
        if (nuevo.state !== "activated" || !navigator.serviceWorker.controller) return;
        const activa = document.querySelector(".pantalla.activa")?.id;
        if (PRINCIPALES.includes(activa)) recargarSinPerderNada();
        else { actualizacionPendiente = true; document.getElementById("aviso-actualizacion").classList.remove("oculto"); }
      });
    };
    // el updatefound de esta misma carga puede haber saltado antes de resolverse register()
    vigilar(reg.installing);
    reg.addEventListener("updatefound", () => vigilar(reg.installing));
    const comprobar = () => reg.update().catch(() => {});
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") comprobar(); });
    setInterval(comprobar, 20 * 60 * 1000);
  }).catch(() => {});
}

async function forzarActualizacion() {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if ("caches" in window) {
    const ks = await caches.keys();
    await Promise.all(ks.map((k) => caches.delete(k)));
  }
  location.reload(true);
}
