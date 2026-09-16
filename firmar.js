// ======================================================
// CONFIGURACIÓN
// ======================================================

const POWER_AUTOMATE_URL = "https://default9057cb6da67347c7b025e86c6b54bd.2d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/18/workflows/d871c304d7ab4e6b896c1129e9ed286c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6uDYutyrd21nBPUhdeWwG4kqJLIkT3wTCiS0czgie74";
const POWER_AUTOMATE_URL_FIRMA = "https://default9057cb6da67347c7b025e86c6b54bd.2d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/07/workflows/d1c008abf1794d05966acb78c89a286e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=XISxADVeCHdLM7OhIER-LvNDz0fykHB-N-4ukGPo7Qk"

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

async function cargarSolicitud() {

    console.log("🚀 cargarSolicitud ejecutándose");
    console.log("ID solicitud:", idSolicitud);
    console.log("URL Power Automate:", POWER_AUTOMATE_URL);
    
if (!idSolicitud) {
        mostrarError("No se ha encontrado el número de solicitud.");
        return;
    }

    try {

        const response = await fetch(
            POWER_AUTOMATE_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    IDSolicitud: idSolicitud
                })
            }
        );

        if (!response.ok) {
            throw new Error("Error al obtener la solicitud.");
        }

        const datos = await response.json();

        console.log("Respuesta Power Automate:", datos);

        if (datos.resultado !== "ok") {
            throw new Error("La solicitud no existe.");
        }

        const solicitud = datos.solicitud;

        // Datos generales
        document.getElementById("idSolicitud").textContent =
            solicitud.id;

        document.getElementById("fechaSolicitud").textContent =
            solicitud.fecha;

        document.getElementById("numeroOperario").textContent =
            solicitud.numeroOperario;

        document.getElementById("trabajador").textContent =
            solicitud.trabajador;

        document.getElementById("area").textContent =
            solicitud.area;

        document.getElementById("puesto").textContent =
            solicitud.puesto;

        document.getElementById("motivo").textContent =
            solicitud.motivo;


        // EPIs
        const tabla = document.getElementById("tablaEPIs");

        tabla.innerHTML = "";

        datos.epis.forEach(epi => {

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${epi.epi || ""}</td>
                <td>${epi.modelo || ""}</td>
                <td>${epi.cantidad || ""}</td>
            `;

            tabla.appendChild(fila);

        });


    } catch (error) {

        console.error(error);

        mostrarError(
            "No se ha podido cargar la solicitud."
        );
    }
}
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

        if (!POWER_AUTOMATE_URL_FIRMA) {

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
                POWER_AUTOMATE_URL_FIRMA,
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

cargarSolicitud();

async function generarPDFSolicitud(datos) {

    try {

        // 1. Descargar el PDF original
        const respuestaPDF = await fetch('Reg%20Entrega%20EPIS%20editable.pdf');

        if (!respuestaPDF.ok) {
            throw new Error('No se ha podido cargar el PDF original');
        }

        const pdfBytes = await respuestaPDF.arrayBuffer();

        // 2. Abrir PDF con pdf-lib
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

        // 3. Obtener formulario
        const form = pdfDoc.getForm();

        const solicitud = datos.solicitud;
        const epis = datos.epis;

        // 4. Rellenar datos generales
        form.getTextField('Textbox1').setText(solicitud.fecha || '');
        form.getTextField('Textbox2').setText(solicitud.area || '');
        form.getTextField('Textbox3').setText(solicitud.trabajador || '');
        form.getTextField('Textbox4').setText(solicitud.puesto || '');

        // 5. Rellenar EPIs
        epis.forEach((epi, index) => {

            const fila = index + 1;

            // De momento probamos con esta correspondencia
            const campoEPI = `Textbox${4 + fila}`;
            const campoCantidad = `Textbox${12 + fila}`;

            try {
                form.getTextField(campoEPI).setText(epi.epi || '');
                form.getTextField(campoCantidad).setText(String(epi.cantidad || ''));
            } catch (e) {
                console.log(`No se pudo rellenar la fila ${fila}`, e);
            }
        });

        // 6. Aplanar los campos
        form.flatten();

        // 7. Generar nuevo PDF
        const pdfFinal = await pdfDoc.save();

        // 8. Crear URL temporal
        const blob = new Blob([pdfFinal], {
            type: 'application/pdf'
        });

        return URL.createObjectURL(blob);

    } catch (error) {

        console.error('Error generando PDF:', error);
        alert('No se ha podido generar el PDF.');

        return null;
    }
}

async function probarPDF() {

    const respuestaPDF = await fetch(
    'Reg%20Entrega%20EPIS%20editable.pdf'
    );

    const pdfBytes = await respuestaPDF.arrayBuffer();

    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Datos de prueba
    form.getTextField('Textbox2').setText('INSTALACIONES-VALENCIA');
    form.getTextField('Textbox3').setText('JUAN JOSE BELMONTE AGUILERA');
    form.getTextField('Textbox4').setText('PEÓN INSTALADOR');

    // Convertir los campos en texto normal
    form.flatten();

    // Crear el nuevo PDF
    const pdfFinal = await pdfDoc.save();

    // Abrirlo
    const blob = new Blob([pdfFinal], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

document.getElementById("visorPDF").src = url;
}

probarPDF();
