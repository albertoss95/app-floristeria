// Test del parser contra los casos del spike (adaptados a parser sin LLM).
// Correr: node test-parser.js
"use strict";
const { procesarDictado, totalCuenta } = require("./parser.js");

const CATALOGO = [
  { id: 1, nombre: "hortensia", alias: ["ortensia", "urtencia", "hortencia"], precioMin: 3, precioMax: 5 },
  { id: 2, nombre: "rosa roja", alias: [], precioMin: 1.5, precioMax: 2.5 },
  { id: 3, nombre: "rosa blanca", alias: [], precioMin: 1.5, precioMax: 2.5 },
  { id: 4, nombre: "clavel blanco", alias: [], precioMin: 0.8, precioMax: 1.2 },
  { id: 5, nombre: "eucalipto", alias: [], unidad: "manojo", precioMin: 2, precioMax: 3 },
  { id: 6, nombre: "girasol", alias: [], precioMin: 1.8, precioMax: 2.5 },
  { id: 7, nombre: "clavel", alias: ["claveles"], precioMin: 0.8, precioMax: 1.2 },
  { id: 8, nombre: "paniculata", alias: ["gypsophila"], precioMin: 2.5, precioMax: 4 },
  { id: 9, nombre: "ruscus", alias: [], precioMin: 1, precioMax: 2 },
  { id: 10, nombre: "tulipan", alias: ["tulipans", "tulipanes"], precioMin: 1.2, precioMax: 2 },
  { id: 11, nombre: "lilium", alias: ["lilium", "liliums"], precioMin: 2, precioMax: 3.5 },
  { id: 12, nombre: "cinta de raso", alias: ["cinta"], unidad: "metro", precioMin: 0.5, precioMax: 1 },
  { id: 13, nombre: "espuma", alias: [], precioMin: 1.5, precioMax: 2.5 },
];

const ESTADO_BASE = [
  { cantidad: 3, unidad: null, articulo: "hortensia", florId: 1, precioMin: 3, precioMax: 5 },
  { cantidad: 2, unidad: null, articulo: "rosa blanca", florId: 3, precioMin: 1.5, precioMax: 2.5 },
  { cantidad: 1, unidad: null, articulo: "clavel blanco", florId: 4, precioMin: 0.8, precioMax: 1.2 },
];

let pasan = 0, fallan = 0;
function caso(id, desc, frase, estado, comprobar) {
  const r = procesarDictado(frase, estado, CATALOGO);
  const errores = comprobar(r) || [];
  if (errores.length === 0) { pasan++; console.log(`PASA  ${id} ${desc}`); }
  else { fallan++; console.log(`FALLA ${id} ${desc}\n      -> ${errores.join("; ")}\n      resultado: ${JSON.stringify(r)}`); }
}
const linea = (r, art) => (r.lineas || []).find((l) => l.articulo === art);

caso("C01", "normal", "tres hortensias y cinco rosas rojas", [], (r) => {
  const e = [];
  if (r.accion !== "actualizar") e.push("accion != actualizar");
  if (linea(r, "hortensia")?.cantidad !== 3) e.push("hortensias != 3");
  if (linea(r, "rosa roja")?.cantidad !== 5) e.push("rosas rojas != 5");
  return e;
});

caso("C02", "cantidades coloquiales", "un manojo de eucalipto media docena de claveles y dos girasoles", [], (r) => {
  const e = [];
  const eu = linea(r, "eucalipto");
  if (!eu || eu.cantidad !== 1 || eu.unidad !== "manojo") e.push("eucalipto mal");
  if (linea(r, "clavel")?.cantidad !== 6) e.push("claveles != 6");
  if (linea(r, "girasol")?.cantidad !== 2) e.push("girasoles != 2");
  return e;
});

caso("C03", "correccion en vivo -> neto 1", "pon dos rosas rojas no espera quita una deja una sola", [], (r) => {
  const e = [];
  const rr = linea(r, "rosa roja");
  if (!rr || rr.cantidad !== 1) e.push(`rosa roja = ${rr?.cantidad}, esperaba 1`);
  return e;
});

caso("C04", "quitar con estado", "quita las hortensias que no me pegan", ESTADO_BASE, (r) => {
  const e = [];
  if (r.accion !== "actualizar") e.push("accion != actualizar");
  if (linea(r, "hortensia")) e.push("hortensia sigue en la cuenta");
  if (!linea(r, "rosa blanca")) e.push("rosa blanca desaparecio");
  return e;
});

caso("C05", "ambiguedad -> pregunta, no adivina", "he puesto dos mas de las blancas", ESTADO_BASE, (r) => {
  const e = [];
  if (r.accion !== "pregunta") e.push(`accion = ${r.accion}, esperaba pregunta`);
  if (r.accion === "actualizar") {
    if (linea(r, "rosa blanca")?.cantidad !== 2) e.push("ha adivinado");
  }
  return e;
});

caso("C06", "consulta, no articulo", "cuanto llevo", ESTADO_BASE, (r) => {
  return r.accion === "consulta" ? [] : [`accion = ${r.accion}`];
});

caso("C07", "material no floral", "espuma y un par de metros de cinta de raso", [], (r) => {
  const e = [];
  if (!linea(r, "espuma")) e.push("falta espuma");
  const c = linea(r, "cinta de raso");
  if (!c || c.cantidad !== 2 || c.unidad !== "metro") e.push("cinta mal");
  return e;
});

caso("C08", "'un poco de' -> sin cantidad inventada", "tres paniculatas y un poco de ruscus", [], (r) => {
  const e = [];
  if (linea(r, "paniculata")?.cantidad !== 3) e.push("paniculata != 3");
  const ru = linea(r, "ruscus");
  if (!ru) e.push("falta ruscus");
  else if (ru.cantidad != null) e.push(`ruscus cantidad = ${ru.cantidad}, esperaba null`);
  return e;
});

caso("C09", "voz mal transcrita", "tres ortensias y dos tulipans", [], (r) => {
  const e = [];
  if (linea(r, "hortensia")?.cantidad !== 3) e.push("no normalizo ortensias");
  if (linea(r, "tulipan")?.cantidad !== 2) e.push("no normalizo tulipans");
  return e;
});

caso("C11", "fuera de catalogo -> apuntado sin precio", "dos proteas", [], (r) => {
  const e = [];
  const p = (r.lineas || []).find((l) => l.articulo.includes("protea"));
  if (!p) e.push("no apunto la protea");
  else if (p.precioMin != null) e.push("le puso precio");
  if (!r.aviso) e.push("sin aviso");
  return e;
});

caso("C12", "frase vacia/ruido", "", ESTADO_BASE, (r) => {
  return r.accion === "ignorar" ? [] : [`accion = ${r.accion}`];
});

// bug real de Alber (23/09): sin comas y con flores fuera de catalogo, salia una sola linea
caso("C13", "dictado seguido sin conectores, con desconocidas", "5 rosas 3 hortensias 6 girasoles",
  [], (r) => {
  const e = [];
  if ((r.lineas || []).length !== 3) e.push(`${(r.lineas || []).length} lineas, esperaba 3`);
  const rosas = (r.lineas || []).find((l) => l.articulo.includes("rosa"));
  if (!rosas || rosas.cantidad !== 5) e.push("rosas != 5");
  if (linea(r, "hortensia")?.cantidad !== 3) e.push("hortensias != 3");
  if (linea(r, "girasol")?.cantidad !== 6) e.push("girasoles != 6");
  return e;
});
// misma estructura, todas desconocidas
caso("C14", "varias desconocidas seguidas", "dos proteas cuatro anturios", [], (r) => {
  const e = [];
  if ((r.lineas || []).length !== 2) e.push(`${(r.lineas || []).length} lineas, esperaba 2`);
  return e;
});

// total
const t = totalCuenta(ESTADO_BASE);
if (t.min === 12.8 && t.max === 21.2) { pasan++; console.log("PASA  T01 total con rangos"); }
else { fallan++; console.log(`FALLA T01 total: ${JSON.stringify(t)} (esperaba min 12.8 max 21.2)`); }

console.log(`\n${pasan} pasan, ${fallan} fallan`);
process.exit(fallan ? 1 : 0);
