// ======================================================
// CONFIGURACIÓN
// ======================================================

const POWER_AUTOMATE_URL = "https://default9057cb6da67347c7b025e86c6b54bd.2d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/18/workflows/d871c304d7ab4e6b896c1129e9ed286c/triggers/manual/paths/invoke?api-version=1";


// ======================================================
// OBTENER ID DE SOLICITUD DE LA URL
// ======================================================

const params = new URLSearchParams(window.location.search);

const idSolicitud = params.get("solicitud");


// ======================================================
// ELEMENTOS
// ======================================================

const canvas = document.getElementById("canvasFirma");
const btnBorrar = document.getElementById("btnBorrar");
const btnFirmar = document.getElementById("btnFirmar");
const aceptacion = document.getElementById("aceptacion");

const mensajeExito = document.getElementById("mensajeExito");
const mensajeError = document.getElementById("mensajeError");


// ======================================================
// CONFIGURACIÓN DEL CANVAS
// ======================================================

const ctx = canvas.getContext("2d");

let dibujando = false;
let hayFirma = false;


// Ajustar resolución del canvas
function ajustarCanvas() {

    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    ctx.scale(ratio, ratio);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
}

ajustarCanvas();


// ======================================================
// OBTENER POSICIÓN
// ======================================================

function obtenerPosicion(evento) {

    const rect = canvas.getBoundingClientRect();

    let x;
    let y;

    if (evento.touches && evento.touches.length > 0) {

        x = evento.touches[0].clientX - rect.left;
        y = evento.touches[0].clientY - rect.top;

    } else {

        x = evento.clientX - rect.left;
        y = evento.clientY - rect.top;
    }

    return { x, y };
}


// ======================================================
// EMPEZAR FIRMA
// ======================================================

function empezarFirma(evento) {

    evento.preventDefault();

    dibujando = true;
    hayFirma = true;

    const posicion = obtenerPosicion(evento);

    ctx.beginPath();

    ctx.moveTo(
        posicion.x,
        posicion.y
    );
}


// ======================================================
// DIBUJAR
// ======================================================

function dibujarFirma(evento) {

    if (!dibujando) return;

    evento.preventDefault();

    const posicion = obtenerPosicion(evento);

    ctx.lineTo(
        posicion.x,
        posicion.y
    );

    ctx.stroke();
}


// ======================================================
// TERMINAR FIRMA
// ======================================================

function terminarFirma(evento) {

    evento.preventDefault();

    dibujando = false;

    ctx.closePath();
}


// ======================================================
// EVENTOS RATÓN
// ======================================================

canvas.addEventListener(
    "mousedown",
    empezarFirma
);

canvas.addEventListener(
    "mousemove",
    dibujarFirma
);

canvas.addEventListener(
    "mouseup",
    terminarFirma
);

canvas.addEventListener(
    "mouseleave",
    terminarFirma
);


// ======================================================
// EVENTOS TÁCTILES
// ======================================================

canvas.addEventListener(
    "touchstart",
    empezarFirma,
    { passive: false }
);

canvas.addEventListener(
    "touchmove",
    dibujarFirma,
    { passive: false }
);

canvas.addEventListener(
    "touchend",
    terminarFirma,
    { passive: false }
);


// ======================================================
// BORRAR FIRMA
// ======================================================

btnBorrar.addEventListener(
    "click",
    function () {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        hayFirma = false;
    }
);


// ======================================================
// FIRMAR
// ======================================================

btnFirmar.addEventListener(
    "click",
    async function () {

        mensajeError.style.display = "none";

        if (!hayFirma) {

            mostrarError(
                "Por favor, realice su firma antes de continuar."
            );

            return;
        }

        if (!aceptacion.checked) {

            mostrarError(
                "Debe confirmar la recepción de los equipos antes de firmar."
            );

            return;
        }

        if (!idSolicitud) {

            mostrarError(
                "No se ha encontrado el número de solicitud."
            );

            return;
        }


        // Si todavía no hemos conectado Power Automate,
        // simplemente mostramos la firma capturada.

        if (!POWER_AUTOMATE_URL) {

            const firma = canvas.toDataURL("image/png");

            console.log("Solicitud:", idSolicitud);
            console.log("Firma:", firma);

            mensajeExito.style.display = "block";

            btnFirmar.disabled = true;

            return;
        }


        // ==================================================
        // ENVIAR A POWER AUTOMATE
        // ==================================================

        const firma = canvas.toDataURL("image/png");

        const payload = {

            IDSolicitud: idSolicitud,

            Firma: firma,

            FechaFirma: new Date().toISOString()

        };


        btnFirmar.disabled = true;
        btnFirmar.textContent = "Procesando...";


        try {

            const response = await fetch(
                POWER_AUTOMATE_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(payload)
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Error al enviar la firma."
                );
            }


            mensajeExito.style.display = "block";

            btnFirmar.textContent =
                "Documento firmado";


        } catch (error) {

            console.error(error);

            mostrarError(
                "No se ha podido registrar la firma. Inténtelo de nuevo."
            );

            btnFirmar.disabled = false;

            btnFirmar.textContent =
                "Firmar y confirmar entrega";
        }

    }
);


// ======================================================
// MOSTRAR ERROR
// ======================================================

function mostrarError(mensaje) {

    mensajeError.textContent = mensaje;

    mensajeError.style.display = "block";
}