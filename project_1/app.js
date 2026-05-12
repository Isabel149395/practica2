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
    lineas.forEach((texto, i) => {
        const angulo = i * pasoGrados;
        const etiqueta = document.createElement('div');
        etiqueta.className = 'segmento-texto';
        etiqueta.textContent = texto;
        etiqueta.style.transform = `rotate(${angulo + pasoGrados / 2}deg) translate(0, -170px) rotate(-${angulo + pasoGrados / 2}deg)`;
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
}

function reiniciarTodo() {
    rotacionActual = 0;
    ultimoGanadorIndex = null;
    textarea.value = '';
    pantallaRespuesta.innerText = 'RESPUESTA';
    ruletaElemento.style.transform = 'rotate(0deg)';
    actualizarRuleta();
    localStorage.removeItem('datosRuleta');
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