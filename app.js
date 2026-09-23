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
  { id: 1,  nombre: "rosa",              alias: ["rosas"],                          precioMin: 0.9, precioMax: 1.8 },
  { id: 2,  nombre: "rosa roja",         alias: [],                                 precioMin: 1.0, precioMax: 2.0 },
  { id: 3,  nombre: "rosa blanca",       alias: [],                                 precioMin: 0.9, precioMax: 1.8 },
  { id: 4,  nombre: "rosa rosa",         alias: ["rosa rosada"],                    precioMin: 0.9, precioMax: 1.8 },
  { id: 5,  nombre: "rosa ramificada",   alias: ["rosa spray", "rosa pitiminí", "pitimini"], precioMin: 1.5, precioMax: 2.5 },
  // flor de foco
  { id: 6,  nombre: "hortensia",         alias: ["ortensia", "hortencia", "urtencia"], precioMin: 3.0, precioMax: 6.0 },
  { id: 7,  nombre: "peonía",            alias: ["peonia", "peonias"],              precioMin: 3.0, precioMax: 6.0 },
  { id: 8,  nombre: "lilium",            alias: ["lilio", "lirio", "liliums"],      precioMin: 1.8, precioMax: 3.5 },
  { id: 9,  nombre: "gerbera",           alias: ["gerberas"],                       precioMin: 0.7, precioMax: 1.3 },
  { id: 10, nombre: "girasol",           alias: ["girasoles"],                      precioMin: 1.2, precioMax: 2.2 },
  { id: 11, nombre: "tulipán",           alias: ["tulipan", "tulipanes", "tulipans"], precioMin: 0.6, precioMax: 1.2 },
  { id: 12, nombre: "anémona",           alias: ["anemona", "anemonas"],            precioMin: 1.2, precioMax: 2.2 },
  { id: 13, nombre: "ranúnculo",         alias: ["ranunculo", "ranunculos"],        precioMin: 1.5, precioMax: 3.0 },
  { id: 14, nombre: "fresia",            alias: ["freesia", "fresias"],             precioMin: 0.7, precioMax: 1.3 },
  { id: 15, nombre: "lisianthus",        alias: ["lisiantus", "lisianto"],          precioMin: 1.2, precioMax: 2.2 },
  { id: 16, nombre: "alstroemeria",      alias: ["astromelia", "alstromeria", "astromelias"], precioMin: 0.6, precioMax: 1.2 },
  { id: 17, nombre: "orquídea",          alias: ["orquidea", "orquideas", "cymbidium"], precioMin: 3.0, precioMax: 7.0 },
  { id: 18, nombre: "anturio",           alias: ["anthurium", "anturios"],          precioMin: 2.0, precioMax: 4.0 },
  { id: 19, nombre: "dalia",             alias: ["dalias"],                         precioMin: 1.5, precioMax: 3.0 },
  { id: 20, nombre: "protea",            alias: ["proteas"],                        precioMin: 3.5, precioMax: 7.0 },
  // clavel y crisantemo (funeral, cementerio, básicos)
  { id: 21, nombre: "clavel",            alias: ["claveles"],                       precioMin: 0.3, precioMax: 0.6 },
  { id: 22, nombre: "clavel blanco",     alias: [],                                 precioMin: 0.3, precioMax: 0.6 },
  { id: 23, nombre: "clavelina",         alias: ["clavelinas", "mini clavel"],      precioMin: 0.4, precioMax: 0.8 },
  { id: 24, nombre: "crisantemo",        alias: ["crisantemos", "margarita"],       precioMin: 0.8, precioMax: 1.6 },
  { id: 25, nombre: "gladiolo",          alias: ["gladiolos"],                      precioMin: 0.8, precioMax: 1.5 },
  { id: 26, nombre: "calla",             alias: ["cala", "calas", "callas"],        precioMin: 1.5, precioMax: 3.0 },
  { id: 27, nombre: "delphinium",        alias: ["delfinium", "espuela"],           precioMin: 1.5, precioMax: 2.5 },
  { id: 28, nombre: "antirrhinum",       alias: ["boca de dragon", "dragonaria"],   precioMin: 1.0, precioMax: 1.8 },
  // relleno
  { id: 29, nombre: "paniculata",        alias: ["gypsophila", "gipsofila", "velo de novia"], precioMin: 1.5, precioMax: 3.0 },
  { id: 30, nombre: "limonium",          alias: ["limonio", "estatice", "statice"], precioMin: 1.0, precioMax: 2.0 },
  { id: 31, nombre: "solidago",          alias: [],                                 precioMin: 0.8, precioMax: 1.5 },
  { id: 32, nombre: "lavanda",           alias: [],                                 unidad: "manojo", precioMin: 2.0, precioMax: 4.0 },
  { id: 33, nombre: "wax",               alias: ["waxflower", "flor de cera"],      precioMin: 1.2, precioMax: 2.2 },
  // verdes (suelen ir por manojo o rama)
  { id: 34, nombre: "eucalipto",         alias: ["eucaliptus"],                     unidad: "manojo", precioMin: 2.0, precioMax: 4.0 },
  { id: 35, nombre: "ruscus",            alias: ["rusco"],                          unidad: "manojo", precioMin: 1.5, precioMax: 3.0 },
  { id: 36, nombre: "aspidistra",        alias: ["aspidistras"],                    precioMin: 0.5, precioMax: 1.0 },
  { id: 37, nombre: "helecho",           alias: ["helechos", "esparraguera"],       unidad: "manojo", precioMin: 1.5, precioMax: 3.0 },
  { id: 38, nombre: "monstera",          alias: ["hoja de monstera"],               precioMin: 1.0, precioMax: 2.0 },
  { id: 39, nombre: "pistacho",          alias: ["lentisco", "pistacia"],           unidad: "manojo", precioMin: 2.0, precioMax: 3.5 },
  { id: 40, nombre: "beargrass",         alias: ["bear grass"],                     unidad: "manojo", precioMin: 1.5, precioMax: 3.0 },
  // materiales
  { id: 41, nombre: "espuma",            alias: ["oasis", "esponja"],               precioMin: 1.2, precioMax: 2.5 },
  { id: 42, nombre: "base",              alias: ["base de centro", "recipiente", "cuenco"], precioMin: 2.0, precioMax: 6.0 },
  { id: 43, nombre: "cinta",             alias: ["cinta de raso", "lazo"],          unidad: "metro", precioMin: 0.3, precioMax: 0.8 },
  { id: 44, nombre: "papel",             alias: ["papel de envolver", "celofán", "celofan"], precioMin: 0.5, precioMax: 1.5 },
  { id: 45, nombre: "alambre",           alias: ["alambres"],                       precioMin: 0.1, precioMax: 0.3 },
];
let catalogo = leer("catalogo", CATALOGO_POR_DEFECTO);

// Si Belén ya tiene catálogo guardado de una versión anterior, le añadimos las flores
// nuevas que no tenga (por nombre), sin tocar las suyas ni sus precios.
(function completarCatalogo() {
  const tengo = new Set(catalogo.map((f) => f.nombre));
  let anadidas = 0;
  for (const f of CATALOGO_POR_DEFECTO) {
    if (!tengo.has(f.nombre)) { catalogo.push({ ...f, id: Date.now() + anadidas }); anadidas++; }
  }
  if (anadidas) guardar("catalogo", catalogo);
})();
let cuenta = leer("cuenta-abierta", null); // {presupuesto, lineas, abierta}
let editandoId = null;
let detalleId = null;

/* ---------- navegación ---------- */
function ir(id) {
  document.querySelectorAll(".pantalla").forEach((p) => p.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");
  if (id === "pantalla-inicio") pintarInicio();
  if (id === "pantalla-flores") pintarFlores();
  if (id === "pantalla-historico") pintarHistorico();
  window.scrollTo(0, 0);
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
          <div class="sub">${fechaCorta(c.cerrada)} · ${c.lineas.map((l) => `${l.cantidad ?? "~"} ${l.articulo}`).join(", ")}</div>
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
}

/* ---------- utilidades de fecha ---------- */
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fechaLarga(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`.toUpperCase();
}
const hoyISO = () => new Date().toISOString().slice(0, 10);
function mananaISO() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }

/* ---------- INICIO ---------- */
function pintarInicio() {
  // aviso de cuenta abierta
  const aviso = document.getElementById("aviso-cuenta-abierta");
  if (cuenta) {
    const min = Math.round((Date.now() - cuenta.abierta) / 60000);
    aviso.textContent = `▲ Tienes una cuenta abierta${cuenta.presupuesto ? ` de ${cuenta.presupuesto} €` : ""} · hace ${min < 60 ? min + " min" : Math.round(min / 60) + " h"} · toca para seguir`;
    aviso.classList.remove("oculto");
  } else aviso.classList.add("oculto");

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
      const etiqueta = !e.fecha ? "⚠ Sin fecha" : e.fecha === hoyISO() ? `Hoy, ${fechaLarga(e.fecha).toLowerCase()}` : e.fecha === mananaISO() ? `Mañana, ${fechaLarga(e.fecha).toLowerCase()}` : fechaLarga(e.fecha).toLowerCase();
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
  const urgente = e.fecha === hoyISO() && e.estado !== "hecho";
  return `<div class="tarjeta-encargo ${urgente ? "urgente" : ""} ${e.estado === "hecho" ? "hecho" : ""}" onclick="verEncargo(${e.id})">
    <div class="titulo">${e.que || "Encargo"}${e.importe ? " · " + e.importe + " €" : ""}${e.hora ? " · antes de las " + e.hora : ""}</div>
    <div class="sub">${[e.entrega, e.quien, e.direccion].filter(Boolean).join(" · ") || "&nbsp;"}</div>
    ${f.length ? `<div class="falta">⚠ Falta: ${f.join(" ")}</div>` : ""}
  </div>`;
}

/* ---------- APUNTAR ENCARGO ---------- */
function nuevoEncargo() {
  editandoId = null;
  ["texto", "que", "importe", "fecha", "hora", "direccion", "quien", "dedicatoria", "cliente"].forEach((c) => (document.getElementById("enc-" + c).value = ""));
  document.getElementById("enc-entrega").value = "";
  document.getElementById("enc-sorpresa").value = "";
  document.getElementById("enc-fecha-larga").textContent = "";
  ir("pantalla-encargo");
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("enc-fecha").addEventListener("change", (ev) => {
    document.getElementById("enc-fecha-larga").textContent = fechaLarga(ev.target.value);
  });
  // borrador que sobrevive a cerrar la app
  document.querySelectorAll("#pantalla-encargo input, #pantalla-encargo textarea, #pantalla-encargo select").forEach((el) => {
    el.addEventListener("input", guardarBorrador);
  });
  const borrador = leer("borrador-encargo", null);
  if (borrador && Object.values(borrador).some((v) => v)) {
    Object.entries(borrador).forEach(([k, v]) => { const el = document.getElementById("enc-" + k); if (el) el.value = v; });
    document.getElementById("enc-fecha-larga").textContent = fechaLarga(borrador.fecha);
  }
  pintarInicio();
});
function guardarBorrador() {
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
  guardar("borrador-encargo", null);
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
    campos.filter(([, val]) => val).map(([k, val, cls]) => `<div class="detalle-campo"><div class="k">${k}</div><div class="v ${cls || ""}">${val}</div></div>`).join("") +
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
  let texto = e.dedicatoria;
  if (!texto) { texto = prompt("No hay dedicatoria apuntada. Escríbela:"); if (!texto) return; e.dedicatoria = texto; guardar("encargos", encargos); }
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
  pintarCuenta(); ir("pantalla-cuenta");
}
function reabrirCuenta() { pintarCuenta(); ir("pantalla-cuenta"); }
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
function lineasConPrecios() {
  return cuenta.lineas.map((l) => {
    const f = l.florId != null ? catalogo.find((x) => x.id === l.florId) : null;
    return { ...l, precioMin: f?.precioMin ?? l.precioMin ?? null, precioMax: f?.precioMax ?? l.precioMax ?? null };
  });
}
function pintarCuenta() {
  document.getElementById("cuenta-titulo").textContent = cuenta.presupuesto ? `Centro de ${cuenta.presupuesto} €` : "Centro";
  const cont = document.getElementById("cuenta-lineas");
  const lineas = lineasConPrecios();
  if (!lineas.length) {
    cont.innerHTML = '<p class="vacio">Nada todavía. Mantén pulsado el botón y di lo que metes.</p>';
  } else {
    cont.innerHTML = lineas.map((l, i) =>
      `<div class="linea"><span class="cant">${l.cantidad ?? "~"}</span><span class="arti">${l.articulo}${l.unidad ? " (" + l.unidad + ")" : ""}${l.precioMin == null ? ' <span class="sinprecio">sin precio</span>' : ""}</span><button onclick="quitarLinea(${i})">✕</button></div>`
    ).join("");
  }
  // barra
  const barra = document.getElementById("cuenta-barra");
  const t = totalCuenta(lineas);
  if (cuenta.presupuesto && (t.min > 0 || t.max > 0)) {
    barra.classList.remove("oculto");
    const medio = (t.min + t.max) / 2;
    const pct = Math.min(100, (medio / cuenta.presupuesto) * 100);
    const relleno = document.getElementById("cuenta-barra-relleno");
    relleno.style.width = pct + "%";
    relleno.classList.toggle("pasado", medio > cuenta.presupuesto);
    document.getElementById("cuenta-barra-texto").textContent =
      `≈ ${Math.round(t.min)}–${Math.round(t.max)} € de ${cuenta.presupuesto} €` + (t.sinPrecio ? ` (+${t.sinPrecio} sin precio)` : "");
  } else barra.classList.add("oculto");
}
function quitarLinea(i) { cuenta.lineas.splice(i, 1); guardar("cuenta-abierta", cuenta); pintarCuenta(); }

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
function pintarFlores() {
  document.getElementById("lista-flores").innerHTML = catalogo.map((f, i) =>
    `<div class="flor-fila">
      <input class="nombre" value="${f.nombre}" onchange="catalogo[${i}].nombre=this.value;guardar('catalogo',catalogo)">
      <input class="precio" inputmode="decimal" placeholder="de" value="${f.precioMin ?? ""}" onchange="catalogo[${i}].precioMin=parseFloat(this.value)||null;guardar('catalogo',catalogo)">
      <input class="precio" inputmode="decimal" placeholder="a" value="${f.precioMax ?? ""}" onchange="catalogo[${i}].precioMax=parseFloat(this.value)||null;guardar('catalogo',catalogo)">
      <button onclick="catalogo.splice(${i},1);guardar('catalogo',catalogo);pintarFlores()">✕</button>
    </div>`).join("");
}
function anadirFlor() {
  const nombre = prompt("Nombre de la flor:");
  if (!nombre) return;
  catalogo.push({ id: Date.now(), nombre: nombre.toLowerCase().trim(), alias: [], precioMin: null, precioMax: null });
  guardar("catalogo", catalogo); pintarFlores();
}
function exportarTodo() {
  const datos = { encargos, catalogo, cuentasCerradas: leer("cuentas-cerradas", []), exportado: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `floristeria-copia-${hoyISO()}.json`;
  a.click();
}

/* ---------- service worker (funciona sin cobertura) ---------- */
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
