// ===== ELEMENTOS DEL DOM =====
const textareaParticipantes = document.getElementById('textarea-participantes');
const contadorParticipantes = document.getElementById('contador-participantes');
const radioCantidadEquipos  = document.getElementById('radio-cantidad-equipos');
const radioPorEquipo        = document.getElementById('radio-por-equipo');
const selectorDivision      = document.getElementById('selector-division');
const inputTitulo           = document.getElementById('input-titulo');
const btnLimpiar            = document.getElementById('btn-limpiar');
const btnGenerar            = document.getElementById('btn-generar');
const pantallaConfig        = document.getElementById('pantalla-configuracion');
const pantallaResultado     = document.getElementById('pantalla-resultado');
const contenedorEquipos     = document.getElementById('contenedor-equipos');
const tituloResultado       = document.getElementById('titulo-resultado');
const btnVolver             = document.getElementById('btn-volver');
const btnDescargarJpg       = document.getElementById('btn-descargar-jpg');
const btnCopiarImagen       = document.getElementById('btn-copiar-imagen');
const btnCopiarTexto        = document.getElementById('btn-copiar-texto');

const CLAVE_PARTICIPANTES = 'sorteo_participantes';
const CLAVE_TITULO        = 'sorteo_titulo';

// ===== ARRANCAR =====
document.addEventListener('DOMContentLoaded', function() {
  cargarDesdeStorage();
  actualizarContador();
  actualizarSelector();
  registrarEventos();
});

// ===== STORAGE =====
function cargarDesdeStorage() {
  const p = localStorage.getItem(CLAVE_PARTICIPANTES);
  const t = localStorage.getItem(CLAVE_TITULO);
  if (p) textareaParticipantes.value = p;
  if (t) inputTitulo.value = t;
}

function guardarEnStorage() {
  localStorage.setItem(CLAVE_PARTICIPANTES, textareaParticipantes.value);
  localStorage.setItem(CLAVE_TITULO, inputTitulo.value);
}

// ===== PARTICIPANTES =====
function obtenerListaParticipantes() {
  return textareaParticipantes.value
    .split('\n')
    .map(function(l) { return l.trim(); })
    .filter(function(l) { return l.length > 0; })
    .slice(0, 100)
    .map(function(l) { return l.substring(0, 50); });
}

function actualizarContador() {
  var cantidad = obtenerListaParticipantes().length;
  contadorParticipantes.textContent = cantidad + ' participante' + (cantidad !== 1 ? 's' : '');
}

// ===== SELECTOR =====
function actualizarSelector() {
  var participantes = obtenerListaParticipantes();
  var total = participantes.length;
  selectorDivision.innerHTML = '';

  if (radioCantidadEquipos.checked) {
    var maxEq = Math.max(2, total);
    for (var i = 2; i <= maxEq; i++) {
      var op = document.createElement('option');
      op.value = i;
      op.textContent = i + ' equipos';
      selectorDivision.appendChild(op);
    }
    // Si no hay participantes aún, poner opciones por defecto
    if (total === 0) {
      for (var i = 2; i <= 10; i++) {
        var op = document.createElement('option');
        op.value = i;
        op.textContent = i + ' equipos';
        selectorDivision.appendChild(op);
      }
    }
  } else {
    var maxPor = Math.max(2, total);
    for (var i = 1; i <= maxPor; i++) {
      var op = document.createElement('option');
      op.value = i;
      op.textContent = i + ' por equipo';
      selectorDivision.appendChild(op);
    }
    if (total === 0) {
      for (var i = 1; i <= 10; i++) {
        var op = document.createElement('option');
        op.value = i;
        op.textContent = i + ' por equipo';
        selectorDivision.appendChild(op);
      }
    }
  }
}

// ===== MEZCLAR =====
function mezclarAleatorio(arr) {
  var copia = arr.slice();
  for (var i = copia.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = copia[i];
    copia[i] = copia[j];
    copia[j] = tmp;
  }
  return copia;
}

// ===== GENERAR =====
function generarEquipos() {
  var participantes = obtenerListaParticipantes();
  if (participantes.length < 2) {
    alert('Necesitas al menos 2 participantes.');
    return;
  }

  var lideres  = participantes.filter(function(p) { return p.startsWith('*'); });
  var normales = participantes.filter(function(p) { return !p.startsWith('*'); });
  var valor    = parseInt(selectorDivision.value);
  var cantEq;

  if (radioCantidadEquipos.checked) {
    cantEq = valor;
  } else {
    cantEq = Math.ceil(participantes.length / valor);
  }

  cantEq = Math.max(2, Math.min(cantEq, participantes.length));

  var equipos = [];
  for (var i = 0; i < cantEq; i++) {
    equipos.push({ numero: i + 1, miembros: [] });
  }

  var lideresRev = mezclarAleatorio(lideres);
  for (var i = 0; i < lideresRev.length; i++) {
    equipos[i % cantEq].miembros.push({ nombre: lideresRev[i].substring(1), esLider: true });
  }

  var normalesRev = mezclarAleatorio(normales);
  for (var i = 0; i < normalesRev.length; i++) {
    equipos[i % cantEq].miembros.push({ nombre: normalesRev[i], esLider: false });
  }

  mostrarResultado(equipos);
}

// ===== MOSTRAR RESULTADO =====
function mostrarResultado(equipos) {
  tituloResultado.textContent = inputTitulo.value.trim() || 'Sorteo de Equipos';
  contenedorEquipos.innerHTML = '';

  for (var i = 0; i < equipos.length; i++) {
    var equipo  = equipos[i];
    var tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-equipo';
    tarjeta.style.animationDelay = (i * 0.07) + 's';

    var subtitulo = document.createElement('h3');
    subtitulo.textContent = 'Equipo ' + equipo.numero;
    tarjeta.appendChild(subtitulo);

    var lista = document.createElement('ul');
    lista.className = 'lista-miembros';

    for (var j = 0; j < equipo.miembros.length; j++) {
      var m    = equipo.miembros[j];
      var item = document.createElement('li');
      item.className = 'miembro' + (m.esLider ? ' lider' : '');
      item.textContent = m.nombre;
      item.style.animationDelay = (i * 0.07 + j * 0.06) + 's';
      lista.appendChild(item);
    }

    tarjeta.appendChild(lista);
    contenedorEquipos.appendChild(tarjeta);
  }

  pantallaConfig.classList.remove('activa');
  pantallaResultado.classList.add('activa');
}

// ===== EXPORTAR JPG =====
function descargarComoJpg() {
  var canvas = document.createElement('canvas');
  var el     = contenedorEquipos;
  var escala = 2;
  canvas.width  = el.scrollWidth  * escala;
  canvas.height = (el.scrollHeight + 60) * escala;
  var ctx = canvas.getContext('2d');
  ctx.scale(escala, escala);
  ctx.fillStyle = '#0f1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título
  ctx.fillStyle = '#e63946';
  ctx.font = 'bold 20px Segoe UI';
  ctx.fillText(tituloResultado.textContent, 20, 35);

  var tarjetas = contenedorEquipos.querySelectorAll('.tarjeta-equipo');
  var elRect   = el.getBoundingClientRect();

  tarjetas.forEach(function(tarjeta) {
    var r = tarjeta.getBoundingClientRect();
    var x = r.left - elRect.left + 16;
    var y = r.top  - elRect.top  + 50;
    var w = r.width;
    var h = r.height;

    ctx.fillStyle = '#22263a';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();

    ctx.strokeStyle = '#2e3350';
    ctx.lineWidth   = 1;
    ctx.stroke();

    ctx.fillStyle = '#e63946';
    ctx.font      = 'bold 13px Segoe UI';
    ctx.fillText(tarjeta.querySelector('h3').textContent, x + 12, y + 22);

    var miembros = tarjeta.querySelectorAll('.miembro');
    miembros.forEach(function(m, idx) {
      ctx.fillStyle = m.classList.contains('lider') ? '#ffd166' : '#e8eaf0';
      ctx.font      = m.classList.contains('lider') ? 'bold 12px Segoe UI' : '12px Segoe UI';
      ctx.fillText(m.textContent, x + 12, y + 44 + idx * 22);
    });
  });

  var enlace      = document.createElement('a');
  enlace.href     = canvas.toDataURL('image/jpeg', 0.95);
  enlace.download = (tituloResultado.textContent || 'equipos') + '.jpg';
  enlace.click();
}

// ===== COPIAR IMAGEN =====
function copiarImagenAlPortapapeles() {
  var canvas = document.createElement('canvas');
  var el     = contenedorEquipos;
  canvas.width  = el.scrollWidth  * 2;
  canvas.height = el.scrollHeight * 2;
  var ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  ctx.fillStyle = '#0f1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.toBlob(function(blob) {
    navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]).then(function() {
      alert('Imagen copiada al portapapeles');
    }).catch(function(e) {
      alert('No se pudo copiar: ' + e.message);
    });
  }, 'image/png');
}

// ===== COPIAR TEXTO =====
function copiarTextoEnColumnas() {
  var tarjetas = contenedorEquipos.querySelectorAll('.tarjeta-equipo');
  var columnas = [];

  tarjetas.forEach(function(t) {
    var col = [t.querySelector('h3').textContent];
    t.querySelectorAll('.miembro').forEach(function(m) { col.push(m.textContent); });
    columnas.push(col);
  });

  var maxFilas = 0;
  columnas.forEach(function(c) { if (c.length > maxFilas) maxFilas = c.length; });

  var texto = '';
  for (var f = 0; f < maxFilas; f++) {
    var fila = columnas.map(function(c) { return (c[f] || '').padEnd(22); });
    texto += fila.join('\t') + '\n';
  }

  navigator.clipboard.writeText(texto)
    .then(function()  { alert('Texto copiado al portapapeles'); })
    .catch(function() { alert('No se pudo copiar el texto'); });
}

// ===== LIMPIAR =====
function limpiarTodo() {
  if (confirm('¿Limpiar todo?')) {
    textareaParticipantes.value = '';
    inputTitulo.value           = '';
    guardarEnStorage();
    actualizarContador();
    actualizarSelector();
  }
}

// ===== EVENTOS =====
function registrarEventos() {
  textareaParticipantes.addEventListener('input', function() {
    actualizarContador();
    actualizarSelector();
    guardarEnStorage();
  });

  inputTitulo.addEventListener('input', guardarEnStorage);

  radioCantidadEquipos.addEventListener('change', actualizarSelector);
  radioPorEquipo.addEventListener('change',       actualizarSelector);

  btnGenerar.addEventListener('click',      generarEquipos);
  btnLimpiar.addEventListener('click',      limpiarTodo);
  btnVolver.addEventListener('click',       function() {
    pantallaResultado.classList.remove('activa');
    pantallaConfig.classList.add('activa');
  });
  btnDescargarJpg.addEventListener('click',  descargarComoJpg);
  btnCopiarImagen.addEventListener('click',  copiarImagenAlPortapapeles);
  btnCopiarTexto.addEventListener('click',   copiarTextoEnColumnas);
}