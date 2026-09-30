/* =========================================================
   DB QUEST — BIBLIOTECA DE DIAGRAMAS ("dbdiagrams.js")
   -----------------------------------------------------------
   Este archivo es, junto con dbquestions.js, la otra mitad
   específica-de-materia de Study Quest. El motor del juego
   (ST_Quest.html) es genérico: no sabe dibujar un diagrama ER
   ni una tabla — sólo sabe que existe una función global
   llamada buildDiagramSVG(spec) que, dado el objeto guardado
   en q.diagram de una pregunta, le devuelve un string <svg>...
   listo para inyectar con innerHTML.

   CONTRATO QUE EL MOTOR ESPERA (no cambiar los nombres):
   -----------------------------------------------------------
   function buildDiagramSVG(spec)
     spec = { kind: "erdiagram" | "table" | ..., data: {...} }
     Devuelve SIEMPRE un string HTML/SVG (nunca null/undefined).
     Si spec.kind no se reconoce, devolver algo razonable como
     "<p>Diagrama no reconocido.</p>" en vez de tirar error.

   El resto de las funciones de este archivo (drawEntity,
   drawTable, entityGroup, etc.) son de uso INTERNO: el motor
   nunca las llama directamente, sólo pasan por buildDiagramSVG.
   Podés renombrarlas o reestructurarlas libremente siempre que
   buildDiagramSVG(spec) siga funcionando igual desde afuera.

   CÓMO ARMAR EL DIAGRAMA DE UNA MATERIA NUEVA:
   -----------------------------------------------------------
   1. Copiá este archivo como punto de partida (ej. "algdiagrams.js").
   2. Los "kind" que reconoce buildDiagramSVG son los que vos
      definas en el switch de más abajo — no hay una lista fija
      impuesta por el motor. Si tu materia no necesita diagramas
      de tipo ER/tabla, borrá esas funciones y armá las tuyas
      (ej. drawNumberLine, drawGraphDiagram, drawVennDiagram...),
      pero el switch final SIEMPRE debe llamarse buildDiagramSVG.
   3. En tus preguntas (dentro de tu *questions.js), el campo
      q.diagram = { kind: "...", data: {...} } es lo único que
      las conecta con esta biblioteca — el motor sólo hace
      buildDiagramSVG(q.diagram).
   4. Registrá el archivo en ST_Quest.html, dentro de BUILTINS,
      agregando "diagrams: 'algdiagrams.js'" a la materia
      correspondiente (ver comentario en el bootstrap del HTML).
      Si una materia no define "diagrams", el motor simplemente
      no muestra diagramas para ella (no hace falta este archivo
      si tus preguntas no son de tipo "diagram"/"diagram-click").
   ========================================================= */

// escapeHtml(): función de escape mínima, sólo para que este
// archivo sea autosuficiente si se lo usa/prueba por separado.
// Si ST_Quest.html ya define una global escapeHtml (que sí lo
// hace), se respeta esa y no se pisa.
if (typeof window !== 'undefined' && typeof window.escapeHtml !== 'function') {
  window.escapeHtml = function (str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  };
}

/***************************************************************************
                            UTILIDADES COMPARTIDAS
***************************************************************************/

// clickAttrs(): si el elemento trae "clickId", lo marca como clickeable
// (data-click-answer + clase .clickable) para que renderDiagramClickQuestion
// pueda resolver la respuesta al tocarlo. Si no trae clickId, el elemento
// es puramente decorativo, como hasta ahora.
function clickAttrs(clickId){
  return clickId ? ` data-click-answer="${escapeHtml(String(clickId))}"` : '';
}
// Clase(s) CSS de un grupo: agrega "clickable" cuando el elemento tiene clickId,
// sin pisar la clase base (er-entity / er-attribute / er-relationship / db-table-col).
function groupClass(base, clickId){
  return clickId ? `${base} clickable` : base;
}

function connectorLine(x1, y1, x2, y2, label){
  const labelSvg = label
      ? `<text x="${(x1+x2)/2}" y="${(y1+y2)/2 - 6}" text-anchor="middle" font-size="11" fill="#cfd6ff">${escapeHtml(String(label))}</text>`
      : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8892b0" stroke-width="1.5"/>${labelSvg}`;
}

/***************************************************************************
                            ENTIDAD-RELACIÓN
***************************************************************************/

// ---- Piezas internas reutilizables (devuelven <g>, no <svg>) ----

function entityGroup(data = {}){
  const { name = 'Entidad', x = 0, y = 0, w = 140, h = 50, weak = false, clickId } = data;
  const rx = x - w/2, ry = y - h/2;
  let rect = `<rect x="${rx}" y="${ry}" width="${w}" height="${h}" fill="#eef3ff" stroke="#2c3e70" stroke-width="2"/>`;
  if(weak){
      // Entidad débil: doble rectángulo
      rect += `<rect x="${rx+6}" y="${ry+6}" width="${w-12}" height="${h-12}" fill="none" stroke="#2c3e70" stroke-width="2"/>`;
  }
  return `<g class="${groupClass('er-entity', clickId)}"${clickAttrs(clickId)}>${rect}<text x="${x}" y="${y+5}" text-anchor="middle" font-size="14" fill="#1b2440">${escapeHtml(name)}</text></g>`;
}

function attributeGroup(data = {}){
  const { name = 'atributo', x = 0, y = 0, rx = 50, ry = 26, key = false, multivalued = false, derived = false, clickId } = data;
  let shape = `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff7e6" stroke="#8a6d1d" stroke-width="2" ${derived ? 'stroke-dasharray="5,4"' : ''}/>`;
  if(multivalued){
      shape += `<ellipse cx="${x}" cy="${y}" rx="${rx-6}" ry="${ry-6}" fill="none" stroke="#8a6d1d" stroke-width="2"/>`;
  }
  const underline = key ? ` text-decoration="underline"` : '';
  return `<g class="${groupClass('er-attribute', clickId)}"${clickAttrs(clickId)}>${shape}<text x="${x}" y="${y+5}" text-anchor="middle" font-size="12" fill="#4a3a08"${underline}>${escapeHtml(name)}</text></g>`;
}

function relationshipGroup(data = {}){
  const { name = 'relación', x = 0, y = 0, w = 110, h = 60, identifying = false, clickId } = data;
  const points = `${x},${y-h/2} ${x+w/2},${y} ${x},${y+h/2} ${x-w/2},${y}`;
  let shape = `<polygon points="${points}" fill="#e9fbe9" stroke="#276e27" stroke-width="2"/>`;
  if(identifying){
      // Relación identificante: rombo doble
      const iw = w - 20, ih = h - 16;
      const innerPoints = `${x},${y-ih/2} ${x+iw/2},${y} ${x},${y+ih/2} ${x-iw/2},${y}`;
      shape += `<polygon points="${innerPoints}" fill="none" stroke="#276e27" stroke-width="2"/>`;
  }
  return `<g class="${groupClass('er-relationship', clickId)}"${clickAttrs(clickId)}>${shape}<text x="${x}" y="${y+4}" text-anchor="middle" font-size="12" fill="#173d17">${escapeHtml(name)}</text></g>`;
}

// ---- Funciones públicas de la biblioteca (Entidad-Relación) ----

function drawEntity(data = {}){
  const w = data.w || 160, h = data.h || 70;
  const vbW = w + 40, vbH = h + 40;
  return `<svg viewBox="0 0 ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" font-family="Arial">
      ${entityGroup({ name: data.name || 'Entidad', x: vbW/2, y: vbH/2, w, h, weak: data.weak, clickId: data.clickId })}
  </svg>`;
}

function drawAttribute(data = {}){
  const rx = data.rx || 55, ry = data.ry || 28;
  const vbW = (rx + 30) * 2, vbH = (ry + 30) * 2;
  return `<svg viewBox="0 0 ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" font-family="Arial">
      ${attributeGroup({ name: data.name || 'atributo', x: vbW/2, y: vbH/2, rx, ry, key: data.key, multivalued: data.multivalued, derived: data.derived, clickId: data.clickId })}
  </svg>`;
}

function drawRelationship(data = {}){
  const w = data.w || 120, h = data.h || 70;
  const vbW = w + 60, vbH = h + 60;
  return `<svg viewBox="0 0 ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" font-family="Arial">
      ${relationshipGroup({ name: data.name || 'relación', x: vbW/2, y: vbH/2, w, h, identifying: data.identifying, clickId: data.clickId })}
  </svg>`;
}

// Compone entidades + relaciones + atributos en un único diagrama ER.
// data = {
//   width, height,                         // tamaño del lienzo (opcional)
//   entities:      [{id, name, x, y, w, h, weak}],
//   relationships: [{id, name, x, y, w, h, identifying, connects:[{entityId, cardinality}]}],
//   attributes:    [{id, name, x, y, rx, ry, ownerId, key, multivalued, derived}]
// }
function drawERDiagram(data = {}){
  const entities = data.entities || [];
  const relationships = data.relationships || [];
  const attributes = data.attributes || [];
  const width = data.width || 480;
  const height = data.height || 300;

  const nodeById = {};
  entities.forEach(e => nodeById[e.id] = e);
  relationships.forEach(r => nodeById[r.id] = r);

  let lines = '';
  relationships.forEach(r => {
      (r.connects || []).forEach(c => {
          const ent = nodeById[c.entityId];
          if(!ent) return;
          lines += connectorLine(ent.x, ent.y, r.x, r.y, c.cardinality);
      });
  });
  attributes.forEach(a => {
      const owner = nodeById[a.ownerId];
      if(!owner) return;
      lines += connectorLine(owner.x, owner.y, a.x, a.y);
  });

  const entitiesSvg = entities.map(e => entityGroup({ name: e.name, x: e.x, y: e.y, w: e.w || 140, h: e.h || 50, weak: e.weak, clickId: e.clickId })).join('');
  const relationshipsSvg = relationships.map(r => relationshipGroup({ name: r.name, x: r.x, y: r.y, w: r.w || 110, h: r.h || 60, identifying: r.identifying, clickId: r.clickId })).join('');
  const attributesSvg = attributes.map(a => attributeGroup({ name: a.name, x: a.x, y: a.y, rx: a.rx || 50, ry: a.ry || 26, key: a.key, multivalued: a.multivalued, derived: a.derived, clickId: a.clickId })).join('');

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" font-family="Arial">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#12162a"/>
      ${lines}
      ${entitiesSvg}
      ${relationshipsSvg}
      ${attributesSvg}
  </svg>`;
}

/***************************************************************************
                            TABLAS RELACIONALES
***************************************************************************/

// ---- Pieza interna reutilizable (devuelve <g>, no <svg>) ----

// Dibuja una tabla relacional completa (título + encabezado de columnas +
// filas de ejemplo, opcional) a partir de la esquina superior izquierda
// (x, y) — a diferencia de las piezas ER, que están centradas en (x, y).
// columns: [{name, pk, fk, clickId}]   -> pk/fk se marcan con 🔑 / 🔗
// rows:    [[valor, valor, ...], ...]  -> filas de datos de ejemplo (opcional)
function tableGroup(data = {}){
  const {
      name = 'TABLA', x = 0, y = 0,
      columns = [], rows = [],
      colWidth = 110, rowHeight = 28, headerHeight = 32, titleHeight = 26
  } = data;

  const w = Math.max(columns.length * colWidth, colWidth);

  let svg = '';

  // Barra de título con el nombre de la tabla
  svg += `<rect x="${x}" y="${y}" width="${w}" height="${titleHeight}" fill="#2c3e70" stroke="#1b2440"/>`;
  svg += `<text x="${x + w/2}" y="${y + titleHeight/2 + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff">${escapeHtml(name)}</text>`;

  // Encabezado de columnas (cada una puede ser clickeable vía clickId)
  columns.forEach((col, i) => {
      const cx = x + i * colWidth;
      const cy = y + titleHeight;
      let fill = '#eef3ff';
      if(col.pk) fill = '#fff3c4';
      else if(col.fk) fill = '#e3f3ff';
      const label = `${col.name}${col.pk ? ' 🔑' : ''}${col.fk ? ' 🔗' : ''}`;
      svg += `<g class="${groupClass('db-table-col', col.clickId)}"${clickAttrs(col.clickId)}>`;
      svg += `<rect x="${cx}" y="${cy}" width="${colWidth}" height="${headerHeight}" fill="${fill}" stroke="#555" stroke-width="1.5"/>`;
      svg += `<text x="${cx + colWidth/2}" y="${cy + headerHeight/2 + 4}" text-anchor="middle" font-size="12" font-weight="${col.pk ? 'bold' : 'normal'}" fill="#1b2440">${escapeHtml(label)}</text>`;
      svg += `</g>`;
  });

  // Filas de datos de ejemplo (puramente decorativas, no clickeables)
  rows.forEach((row, r) => {
      row.forEach((val, i) => {
          const cx = x + i * colWidth;
          const cy = y + titleHeight + headerHeight + r * rowHeight;
          svg += `<rect x="${cx}" y="${cy}" width="${colWidth}" height="${rowHeight}" fill="${r % 2 === 0 ? '#ffffff' : '#f2f4fa'}" stroke="#ccc"/>`;
          svg += `<text x="${cx + colWidth/2}" y="${cy + rowHeight/2 + 4}" text-anchor="middle" font-size="11" fill="#333">${escapeHtml(String(val))}</text>`;
      });
  });

  return svg;
}

// Centro (x, y) de una columna dada, usado para conectar tablas por FK.
// Acepta el nombre de columna o su clickId.
function tableColumnCenter(table, columnRef){
  const cols = table.columns || [];
  const idx = cols.findIndex(c => c.name === columnRef || c.clickId === columnRef);
  const colWidth = table.colWidth || 110;
  const titleHeight = table.titleHeight || 26;
  const headerHeight = table.headerHeight || 32;
  const safeIdx = idx === -1 ? 0 : idx;
  return {
      x: table.x + safeIdx * colWidth + colWidth / 2,
      y: table.y + titleHeight + headerHeight / 2
  };
}

// ---- Funciones públicas de la biblioteca (Tablas) ----

function drawTable(data = {}){
  const colWidth = data.colWidth || 110, rowHeight = data.rowHeight || 28;
  const headerHeight = 32, titleHeight = 26;
  const cols = data.columns || [];
  const rows = data.rows || [];
  const w = Math.max(cols.length * colWidth, colWidth);
  const h = titleHeight + headerHeight + rows.length * rowHeight;
  const vbW = w + 20, vbH = h + 20;
  return `<svg viewBox="0 0 ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" font-family="Arial">
      ${tableGroup({ name: data.name || 'TABLA', x: 10, y: 10, columns: cols, rows, colWidth, rowHeight })}
  </svg>`;
}

// Compone varias tablas relacionadas por clave foránea en un mismo lienzo.
// data = {
//   width, height,
//   tables: [{ id, name, x, y, columns, rows, colWidth, rowHeight }],
//   links:  [{ fromTable, fromColumn, toTable, toColumn, label }]  // ej: FK
// }
function drawTableDiagram(data = {}){
  const tables = data.tables || [];
  const links = data.links || [];
  const width = data.width || 560;
  const height = data.height || 320;

  const tableById = {};
  tables.forEach(t => tableById[t.id] = t);

  let lines = '';
  links.forEach(l => {
      const from = tableById[l.fromTable];
      const to = tableById[l.toTable];
      if(!from || !to) return;
      const p1 = tableColumnCenter(from, l.fromColumn);
      const p2 = tableColumnCenter(to, l.toColumn);
      lines += connectorLine(p1.x, p1.y, p2.x, p2.y, l.label || 'FK');
  });

  const tablesSvg = tables.map(t => tableGroup(t)).join('');

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" font-family="Arial">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#12162a"/>
      ${lines}
      ${tablesSvg}
  </svg>`;
}

/***************************************************************************
                            DESPACHADOR
***************************************************************************/

// Traduce el "spec" guardado en q.diagram (kind + data) a un llamado
// concreto de la biblioteca. Agregar un nuevo "kind" (drawJoin,
// drawNormalizationDiagram, drawTransactionDiagram, etc.) es agregar
// un case acá y su función en el módulo correspondiente.
// ESTA es la única función que el motor (ST_Quest.html) invoca.
function buildDiagramSVG(spec = {}){
  switch(spec.kind){
      case 'entity':       return drawEntity(spec.data || {});
      case 'attribute':    return drawAttribute(spec.data || {});
      case 'relationship': return drawRelationship(spec.data || {});
      case 'erdiagram':    return drawERDiagram(spec.data || {});
      case 'table':        return drawTable(spec.data || {});
      case 'tablediagram': return drawTableDiagram(spec.data || {});
      default:
          return "<p>Diagrama no reconocido.</p>";
  }
}
/* ===================== FIN Biblioteca SVG (Base de Datos) ===================== */
