// Parser determinista de dictado para la cuenta del centro.
// Sin LLM: vocabulario cerrado (numeros + flores + comandos). Todo local.
"use strict";

const NUMEROS = {
  un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
  siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13,
  catorce: 14, quince: 15, veinte: 20, treinta: 30,
};

const UNIDADES = ["manojo", "manojos", "ramas", "rama", "metros", "metro", "tallos", "tallo"];

function normalizar(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zñ0-9\s,]/g, " ") // la coma se conserva: separa trozos al teclear
    .replace(/\s+/g, " ")
    .trim();
}

// Singulariza de forma tosca pero suficiente: rosas->rosa, claveles->clavel
function singular(p) {
  if (p.endsWith("es") && p.length > 4) return p.slice(0, -2);
  if (p.endsWith("s") && p.length > 3) return p.slice(0, -1);
  return p;
}

function distancia(a, b) {
  // Levenshtein acotado, para errores de transcripcion (ortensia/hortensia)
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return d[m][n];
}

// Busca la flor del catalogo que mejor casa con las palabras dadas.
// Devuelve {flor, resto} o null. Prefiere el nombre mas largo que case.
function casarFlor(palabras, catalogo) {
  const texto = palabras.join(" ");
  let mejor = null;
  for (const flor of catalogo) {
    const candidatos = [flor.nombre, ...(flor.alias || [])].map(normalizar);
    for (const cand of candidatos) {
      const candSing = cand.split(" ").map(singular).join(" ");
      const textoSing = palabras.map(singular).join(" ");
      // casa si el candidato aparece al principio del texto (tolerancia 1 por palabra)
      const cp = candSing.split(" ");
      const tp = textoSing.split(" ");
      if (cp.length > tp.length) continue;
      let ok = true, distTotal = 0;
      for (let i = 0; i < cp.length; i++) {
        const dist = distancia(cp[i], tp[i]);
        if (dist > (cp[i].length > 4 ? 2 : 1)) { ok = false; break; }
        distTotal += dist;
      }
      if (ok) {
        const puntos = cp.length * 10 - distTotal;
        if (!mejor || puntos > mejor.puntos) {
          mejor = { flor, puntos, consumidas: cp.length };
        }
      }
    }
  }
  return mejor;
}

// ¿En la posicion i empieza una cantidad? (para saber donde acaba un articulo desconocido)
function empiezaCantidad(palabras, i) {
  const p = palabras[i], s = palabras[i + 1];
  return /^\d+$/.test(p) || NUMEROS[p] != null || p === "docena" || p === "par" ||
    (p === "media" && s === "docena") || ((p === "un" || p === "una") && (s === "par" || s === "poco" || s === "pizca" || s === "docena"));
}

// Extrae [cantidad, unidad, resto] del principio de un trozo
function leerCantidad(palabras) {
  let cantidad = null, unidad = null, i = 0, indeterminado = false;
  if (i < palabras.length) {
    const p = palabras[i], s = palabras[i + 1];
    // "un poco", "una pizca" ANTES que el numero "un/una"
    if ((p === "un" || p === "una") && (s === "poco" || s === "pizca")) { indeterminado = true; i += 2; }
    else if (p === "poco" || p === "pizca") { indeterminado = true; i++; }
    else if ((p === "un" || p === "una") && s === "par") { cantidad = 2; i += 2; }
    else if (p === "par") { cantidad = 2; i++; }
    else if (p === "media" && s === "docena") { cantidad = 6; i += 2; }
    else if (p === "una" && s === "docena") { cantidad = 12; i += 2; }
    else if (p === "docena") { cantidad = 12; i++; }
    else if (/^\d+$/.test(p)) { cantidad = parseInt(p, 10); i++; }
    else if (NUMEROS[p] != null) { cantidad = NUMEROS[p]; i++; }
  }
  if (i < palabras.length && palabras[i] === "de") i++;
  if (i < palabras.length && UNIDADES.includes(palabras[i])) {
    unidad = singular(palabras[i]); i++;
  }
  if (i < palabras.length && palabras[i] === "de") i++;
  return { cantidad, unidad, resto: palabras.slice(i), indeterminado };
}

/**
 * Procesa una frase dictada contra el estado actual de la cuenta.
 * @param {string} frase - texto tal cual sale del reconocimiento de voz
 * @param {Array} lineas - estado actual: [{cantidad, unidad, articulo, florId, precioMin, precioMax}]
 * @param {Array} catalogo - [{id, nombre, alias, unidad, precioMin, precioMax}]
 * @returns {{accion, lineas?, pregunta?, aviso?}}
 */
function procesarDictado(frase, lineas, catalogo) {
  const norm = normalizar(frase);
  if (!norm) return { accion: "ignorar", aviso: "No te he entendido, ¿lo repites?" };

  // consulta
  if (/\b(cuanto llevo|cuanto va|cuanto es|que llevo|como voy)\b/.test(norm)) {
    return { accion: "consulta" };
  }

  const resultado = [...lineas.map((l) => ({ ...l }))];
  const avisos = [];
  let cambio = false;

  // limpia muletillas ANTES de trocear (para que "no espera quita una" quede "quita una").
  // Los articulos "la/el/las/los" solo se quitan cuando NO van detras de "de" (para no
  // romper "dos mas de las blancas", que necesita el "las" para detectar la ambiguedad).
  // "mas" solo se conserva en "mas de las blancas"; al final ("tres rosas mas") es ruido.
  // "no" suelto ("pon dos, no, quita una") tambien es ruido: en un dictado de flores no
  // niega nada, separa una correccion. "otras dos hortensias" = "dos hortensias".
  const limpio = norm
    .replace(/\b(no espera|espera|pon|ponme|mete|meto|anade|anado|apunta|apunto|he puesto|puse|vale|eh|em|pues|venga|a ver|que no me pegan?|de siempre|otras?|otros?)\b/g, " ")
    .replace(/\bmas\b(?!\s+de\b)/g, " ")
    .replace(/(^|\s|,)no(\s|,|$)/g, "$1 $2")
    .replace(/(^|\s)(?<!de\s)(la|el|las|los)\s+(?!de\b)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  // trocea por conectores Y por palabras de comando (cada comando abre trozo nuevo).
  // OJO: "mas" NO es separador ("dos mas de las blancas").
  const trozos = limpio
    .split(/\b(?=quita|quitame|fuera|saca|elimina|borra|deja)\b|\b(?:y|luego|despues|tambien)\b|,/)
    .map((t) => t.trim())
    .filter(Boolean);

  // La ultima linea que esta frase ha tocado: es a la que se refieren "quita una" o
  // "deja una sola" cuando no nombran flor ("pon dos rosas, no, quita una").
  let ultimaTocada = null;

  for (const trozo of trozos) {

    // QUITAR: "quita las hortensias", "quita una rosa", "fuera el eucalipto", "quita una"
    // OJO: solo se descartan los articulos la/las/el/los; "una/un" es una cantidad.
    const mQuitar = trozo.match(/^(?:quita|quitame|fuera|saca|elimina|borra)\s*(?:la |las |el |los )?(.*)$/);
    if (mQuitar) {
      const { cantidad, resto } = leerCantidad(mQuitar[1].split(" ").filter(Boolean));
      let linea = null;
      if (resto.length) {
        const casa = casarFlor(resto, catalogo);
        const objetivo = casa
          ? resultado.filter((l) => l.florId === casa.flor.id)
          : resultado.filter((l) => normalizar(l.articulo).includes(singular(resto[0])));
        linea = objetivo[objetivo.length - 1] || null;
      } else {
        linea = ultimaTocada || resultado[resultado.length - 1] || null; // "quita una" sin flor
      }
      if (!linea) {
        avisos.push(resto.length ? `No tienes ${resto.join(" ")} en la cuenta.` : "¿Quitar qué?");
        continue;
      }
      if (cantidad == null || linea.cantidad == null || cantidad >= linea.cantidad) {
        resultado.splice(resultado.indexOf(linea), 1);
        ultimaTocada = null;
      } else {
        linea.cantidad -= cantidad;
        ultimaTocada = linea;
      }
      cambio = true;
      continue;
    }

    // DEJAR EN: "deja una sola", "deja dos" -> fija cantidad de la ULTIMA linea tocada o unica candidata
    const mDejar = trozo.match(/^deja(?:me|lo|las?)?\s+(?:en\s+)?(.*)$/);
    if (mDejar) {
      const { cantidad, resto } = leerCantidad(mDejar[1].replace(/\bsolas?\b|\bsolo\b/g, "").trim().split(" ").filter(Boolean));
      if (cantidad == null) { avisos.push("¿Dejar cuántas?"); continue; }
      let linea = null;
      if (resto.length) {
        const casa = casarFlor(resto, catalogo);
        if (casa) linea = resultado.filter((l) => l.florId === casa.flor.id).pop();
      }
      if (!linea) linea = ultimaTocada || resultado[resultado.length - 1];
      if (!linea) { avisos.push("No hay nada en la cuenta todavía."); continue; }
      linea.cantidad = cantidad;
      ultimaTocada = linea;
      cambio = true;
      continue;
    }

    // "dos mas de las blancas" -> ambiguedad si varias lineas casan por raiz ("blanc-")
    const mMasDe = trozo.match(/^(.+?)\s+mas\s+de\s+(?:la|las|los|el)\s+(.+)$/) ||
                   trozo.match(/^(.+?)\s+de\s+(?:la|las|los|el)\s+(.+)$/);
    if (mMasDe && !casarFlor(trozo.split(" "), catalogo)) {
      const { cantidad } = leerCantidad(mMasDe[1].split(" "));
      const raiz = singular(mMasDe[2].split(" ").pop()).replace(/[ao]$/, "");
      const candidatas = resultado.filter((l) =>
        normalizar(l.articulo).split(" ").some((w) => singular(w).replace(/[ao]$/, "") === raiz)
      );
      if (candidatas.length > 1) {
        return {
          accion: "pregunta",
          pregunta: `¿${candidatas.map((c) => c.articulo).join(" o ")}?`,
          lineas: resultado,
        };
      }
      if (candidatas.length === 1 && cantidad != null) {
        candidatas[0].cantidad += cantidad;
        ultimaTocada = candidatas[0];
        cambio = true;
        continue;
      }
    }

    // ANADIR (caso general), iterativo: "[cant] [unidad] [flor] [cant] [unidad] [flor] ..."
    let palabras = trozo.split(" ").filter(Boolean);
    let guarda = 0;
    while (palabras.length && guarda++ < 10) {
      const { cantidad, unidad, resto, indeterminado } = leerCantidad(palabras);
      if (!resto.length) break;
      const casa = casarFlor(resto, catalogo);
      if (casa) {
        const u = unidad || casa.flor.unidad || null;
        const existente = resultado.find((l) => l.florId === casa.flor.id && l.unidad === u);
        if (existente && cantidad != null) { existente.cantidad += cantidad; ultimaTocada = existente; }
        else {
          const nueva = {
            cantidad: indeterminado ? null : cantidad,
            unidad: u,
            articulo: casa.flor.nombre,
            florId: casa.flor.id,
            precioMin: casa.flor.precioMin ?? null,
            precioMax: casa.flor.precioMax ?? null,
          };
          resultado.push(nueva); ultimaTocada = nueva;
        }
        cambio = true;
        palabras = resto.slice(casa.consumidas); // sigue con lo que quede del trozo
      } else {
        // fuera de catalogo: el articulo desconocido llega SOLO hasta donde empieza
        // la siguiente cantidad ("5 rosas 3 hortensias" son dos lineas, no una) o la
        // siguiente flor conocida ("cosa rara espuma" -> "cosa rara" + espuma)
        let corte = resto.length;
        for (let j = 1; j < resto.length; j++) {
          if (empiezaCantidad(resto, j) || casarFlor(resto.slice(j), catalogo)) { corte = j; break; }
        }
        const articulo = resto.slice(0, corte).join(" ");
        const nueva = {
          cantidad: indeterminado ? null : cantidad, unidad: unidad || null,
          articulo, florId: null, precioMin: null, precioMax: null,
        };
        resultado.push(nueva); ultimaTocada = nueva;
        avisos.push(`"${articulo}" no está en tus flores: apuntado sin precio.`);
        cambio = true;
        palabras = resto.slice(corte);
      }
    }
  }

  if (!cambio && !avisos.length) {
    return { accion: "ignorar", aviso: "No te he entendido, ¿lo repites?" };
  }
  return { accion: "actualizar", lineas: resultado, aviso: avisos.join(" ") || null };
}

function totalCuenta(lineas) {
  let min = 0, max = 0, sinPrecio = 0;
  for (const l of lineas) {
    const n = l.cantidad ?? 1;
    if (l.precioMin != null) { min += n * l.precioMin; max += n * (l.precioMax ?? l.precioMin); }
    else sinPrecio++;
  }
  return { min, max, sinPrecio };
}

if (typeof module !== "undefined") module.exports = { procesarDictado, totalCuenta, normalizar };
