const coloresBase = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff'];
const textarea = document.getElementById('lista-elementos');
const ruletaElemento = document.getElementById('ruleta-grafica');
const pantallaRespuesta = document.getElementById('pantalla-respuesta');
const btnTitulo = document.getElementById('btn-titulo');
const btnEditar = document.getElementById('btn-editar');
const btnEsconder = document.getElementById('btn-esconder');

let rotacionActual = 0;
let ultimoGanadorIndex = null;

function obtenerLineas() {
    return textarea.value
        .split('\n')
        .map(linea => linea.trim())
        .filter(linea => linea !== '');
}

function actualizarRuleta() {
    const lineas = obtenerLineas();

    if (lineas.length === 0) {
        ruletaElemento.style.background = '#ddd';
        ruletaElemento.innerHTML = '';
        localStorage.setItem('datosRuleta', '');
        return;
    }

    const porcentajePaso = 100 / lineas.length;
    const gradiente = lineas
        .map((texto, i) => {
            const color = coloresBase[i % coloresBase.length];
            return `${color} ${i * porcentajePaso}% ${(i + 1) * porcentajePaso}%`;
        })
        .join(', ');

    ruletaElemento.style.background = `conic-gradient(from 90deg, ${gradiente})`;
    ruletaElemento.innerHTML = '';

    const pasoGrados = 360 / lineas.length;
    const radioRuleta = ruletaElemento.offsetWidth / 2 || 190;
    const distanciaTexto = radioRuleta * 0.62;

    lineas.forEach((texto, i) => {
        const anguloMedio = 90 + i * pasoGrados + pasoGrados / 2;
        const anguloRad = (anguloMedio * Math.PI) / 180;

        const x = radioRuleta + distanciaTexto * Math.cos(anguloRad);
        const y = radioRuleta + distanciaTexto * Math.sin(anguloRad);

        const etiqueta = document.createElement('div');
        etiqueta.className = 'segmento-texto';
        etiqueta.textContent = texto;

        etiqueta.style.position = 'absolute';
        etiqueta.style.left = x + 'px';
        etiqueta.style.top = y + 'px';
        etiqueta.style.transform = `translate(-50%, -50%) rotate(${anguloMedio}deg)`;
        etiqueta.style.width = (distanciaTexto * 1.1) + 'px';
        etiqueta.style.textAlign = 'center';
        etiqueta.style.fontSize = lineas.length > 12 ? '1rem' : '1.25rem';
        etiqueta.style.transformOrigin = 'center center';

        ruletaElemento.appendChild(etiqueta);
    });

    localStorage.setItem('datosRuleta', textarea.value);
}

function calcularIndiceGanador() {
    const lineas = obtenerLineas();
    if (lineas.length === 0) return null;

    const anguloFinal = rotacionActual % 360;
    const anguloSeleccionado = (360 - anguloFinal + 360) % 360;
    const pasoGrados = 360 / lineas.length;
    return Math.floor(anguloSeleccionado / pasoGrados) % lineas.length;
}

function girarRuleta() {
    const lineas = obtenerLineas();
    if (lineas.length === 0) {
        pantallaRespuesta.innerText = 'Ingresa al menos un elemento en la lista.';
        return;
    }

    const gradosExtras = Math.floor(Math.random() * 360) + 3600;
    rotacionActual += gradosExtras;
    ruletaElemento.style.transform = `rotate(${rotacionActual}deg)`;
    pantallaRespuesta.innerText = 'Girando...';

    setTimeout(() => {
        const lineasActuales = obtenerLineas();
        const indice = calcularIndiceGanador();
        if (indice === null || !lineasActuales[indice]) {
            pantallaRespuesta.innerText = 'No se pudo obtener un ganador.';
            return;
        }
        ultimoGanadorIndex = indice;
        pantallaRespuesta.innerText = `GANADOR: ${lineasActuales[indice]}`;
        marcarSegmentoSeleccionado(indice);
    }, 4000);
}

function marcarSegmentoSeleccionado(indice) {
    const etiquetas = ruletaElemento.querySelectorAll('.segmento-texto');
    etiquetas.forEach((etiqueta, i) => {
        etiqueta.classList.toggle('activo', i === indice);
    });

    // resaltar el segmento ganador con overlay
    const canvas = ruletaElemento.querySelector('#overlay-ganador');
    if (canvas) canvas.remove();

    const lineas = obtenerLineas();
    const pasoGrados = 360 / lineas.length;
    const overlay = document.createElement('div');
    overlay.id = 'overlay-ganador';
    overlay.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: conic-gradient(
            from ${90 + indice * pasoGrados}deg,
            rgba(255,255,255,0.38) 0deg,
            rgba(255,255,255,0.38) ${pasoGrados}deg,
            transparent ${pasoGrados}deg
        );
        pointer-events: none;
        z-index: 2;
    `;
    ruletaElemento.appendChild(overlay);
}

function reiniciarTodo() {
    rotacionActual = 0;
    ultimoGanadorIndex = null;
    textarea.value = '';
    pantallaRespuesta.innerText = 'RESPUESTA';
    ruletaElemento.style.transform = 'rotate(0deg)';
    actualizarRuleta();
    localStorage.removeItem('datosRuleta');
    // agrega esto:
    const overlay = ruletaElemento.querySelector('#overlay-ganador');
    if (overlay) overlay.remove();
}

function ocultarSeleccionado() {
    const lineas = obtenerLineas();
    if (ultimoGanadorIndex === null || ultimoGanadorIndex >= lineas.length) {
        pantallaRespuesta.innerText = 'Gira primero para seleccionar un elemento.';
        return;
    }

    lineas.splice(ultimoGanadorIndex, 1);
    textarea.value = lineas.join('\n');
    ultimoGanadorIndex = null;
    actualizarRuleta();
    pantallaRespuesta.innerText = 'Elemento ocultado. Gira de nuevo.';
}

function inicializarEventos() {
    textarea.addEventListener('input', actualizarRuleta);

    btnTitulo.addEventListener('click', () => {
        const nuevoTitulo = prompt('Nuevo título para la pantalla:', pantallaRespuesta.innerText === 'RESPUESTA' ? '' : pantallaRespuesta.innerText);
        if (nuevoTitulo !== null) {
            pantallaRespuesta.innerText = nuevoTitulo.trim() === '' ? 'RESPUESTA' : nuevoTitulo;
        }
    });

    btnEditar.addEventListener('click', () => {
        textarea.focus();
    });

    btnEsconder.addEventListener('click', ocultarSeleccionado);

    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                girarRuleta();
                break;
            case 'KeyR':
                reiniciarTodo();
                break;
            case 'KeyF':
                document.documentElement.requestFullscreen();
                break;
            case 'KeyS':
                ocultarSeleccionado();
                break;
        }
    });
}

function cargarDatosGuardados() {
    const datos = localStorage.getItem('datosRuleta');
    if (datos) {
        textarea.value = datos;
    }
    actualizarRuleta();
}

inicializarEventos();
cargarDatosGuardados();