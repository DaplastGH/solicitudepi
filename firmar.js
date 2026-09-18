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
let pdfActual = null;


// Ajustar resolución del canvas
function ajustarCanvas() {

    const ratio = Math.max(
        window.devicePixelRatio || 1,
        1
    );

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

    if (
        evento.touches &&
        evento.touches.length > 0
    ) {

        x =
            evento.touches[0].clientX -
            rect.left;

        y =
            evento.touches[0].clientY -
            rect.top;

    } else {

        x =
            evento.clientX -
            rect.left;

        y =
            evento.clientY -
            rect.top;
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
// CONVERTIR ARRAYBUFFER A BASE64
// ======================================================

function arrayBufferToBase64(buffer) {

    let binary = "";

    const bytes = new Uint8Array(buffer);

    const chunkSize = 0x8000;

    for (
        let i = 0;
        i < bytes.length;
        i += chunkSize
    ) {

        const chunk = bytes.subarray(
            i,
            i + chunkSize
        );

        binary += String.fromCharCode(
            ...chunk
        );
    }

    return btoa(binary);
}


// ======================================================
// GENERAR PDF CON LOS DATOS DE LA SOLICITUD
// ======================================================

async function generarPDFSolicitud(datos) {

    try {

        // Descargar PDF original
        const respuestaPDF = await fetch(
            "Reg%20Entrega%20EPIS%20editable.pdf"
        );

        if (!respuestaPDF.ok) {

            throw new Error(
                "No se ha podido cargar el PDF original"
            );
        }


        const pdfBytes =
            await respuestaPDF.arrayBuffer();


        // Abrir PDF
        const pdfDoc =
            await PDFLib.PDFDocument.load(
                pdfBytes
            );


        // Obtener formulario
        const form =
            pdfDoc.getForm();


        // ==================================================
        // DATOS GENERALES
        // ==================================================

        form.getTextField(
            "Textbox2"
        ).setText(
            datos.solicitud.area || ""
        );


        form.getTextField(
            "Textbox3"
        ).setText(
            datos.solicitud.trabajador || ""
        );


        form.getTextField(
            "Textbox4"
        ).setText(
            datos.solicitud.puesto || ""
        );


        // ==================================================
        // FECHA
        // ==================================================

        const ahora = new Date();

        const fechaFirma =
            String(
                ahora.getDate()
            ).padStart(2, "0") + "/" +

            String(
                ahora.getMonth() + 1
            ).padStart(2, "0") + "/" +

            ahora.getFullYear();


        form.getTextField(
            "Textbox23"
        ).setText(
            fechaFirma
        );

        // ==================================================
// MOTIVO DE LA ENTREGA
// ==================================================

const pagina = pdfDoc.getPages()[0];

const motivo = (datos.solicitud.motivo || "")
    .trim()
    .toLowerCase();

const posicionesMotivo = {
    "1ª entrega": { x: 189, y: 51 },
    "cambio e.p.i.": { x: 251, y: 51 },
    "deterioro": { x: 316, y: 51 },
    "pérdida": { x: 376, y: 51 },
    "otros": { x: 422, y: 51 }
};

if (posicionesMotivo[motivo]) {

    const posicion = posicionesMotivo[motivo];

    pagina.drawText("X", {
        x: posicion.x - 5,
        y: posicion.y - 5,
        size: 10
    });
}

        // ==================================================
        // CAMPOS DE EPIs
        // ==================================================

        const camposEPI = [

            "Textbox1",
            "Textbox5",
            "Textbox6",
            "Textbox7",
            "Textbox8",
            "Textbox9",
            "Textbox10",
            "Textbox11",
            "Textbox12"

        ];


        const camposCantidad = [

            "Textbox13",
            "Textbox14",
            "Textbox15",
            "Textbox16",
            "Textbox17",
            "Textbox18",
            "Textbox19",
            "Textbox20",
            "Textbox21"

        ];


        // ==================================================
        // RELLENAR EPIs
        // ==================================================

        datos.epis.forEach(
            (epi, index) => {

                // Máximo 9 líneas
                if (index >= 9) return;


                form.getTextField(
                    camposEPI[index]
                ).setText(
                    epi.epi || ""
                );


                form.getTextField(
                    camposCantidad[index]
                ).setText(
                    String(
                        epi.cantidad || ""
                    )
                );

            }
        );


        // ==================================================
        // APLANAR FORMULARIO
        // ==================================================

        form.flatten();


        // ==================================================
        // GENERAR PDF
        // ==================================================

        const pdfFinal =
            await pdfDoc.save();


        // Guardar PDF en memoria
        pdfActual = pdfFinal;


        // ==================================================
        // MOSTRAR PDF EN EL VISOR
        // ==================================================

        const blob =
            new Blob(
                [pdfFinal],
                {
                    type: "application/pdf"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const visorPDF =
            document.getElementById(
                "visorPDF"
            );


        if (!visorPDF) {

            throw new Error(
                "No se encuentra el visorPDF en el HTML"
            );
        }


        visorPDF.src = url;


        return pdfFinal;


    } catch (error) {

        console.error(
            "Error generando PDF:",
            error
        );


        mostrarError(
            "No se ha podido generar el PDF."
        );


        return null;
    }
}


// ======================================================
// CARGAR SOLICITUD
// ======================================================

async function cargarSolicitud() {

    console.log(
        "🚀 cargarSolicitud ejecutándose"
    );

    console.log(
        "ID solicitud:",
        idSolicitud
    );


    if (!idSolicitud) {

        mostrarError(
            "No se ha encontrado el número de solicitud."
        );

        return;
    }


    try {

        // ==================================================
        // PEDIR SOLICITUD A POWER AUTOMATE
        // ==================================================

        const response =
            await fetch(
                POWER_AUTOMATE_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        IDSolicitud:
                            idSolicitud

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Error al obtener la solicitud."
            );
        }


        const datos =
            await response.json();


        console.log(
            "Respuesta Power Automate:",
            datos
        );


        if (
            datos.resultado !== "ok"
        ) {

            throw new Error(
                "La solicitud no existe."
            );
        }


        const solicitud =
            datos.solicitud;

        // ==================================================
        // DATOS GENERALES EN HTML
        // ==================================================

        document.getElementById(
            "idSolicitud"
        ).textContent =
            solicitud.id || "";


        document.getElementById(
            "fechaSolicitud"
        ).textContent =
            solicitud.fecha || "";


        document.getElementById(
            "numeroOperario"
        ).textContent =
            solicitud.numeroOperario || "";


        document.getElementById(
            "trabajador"
        ).textContent =
            solicitud.trabajador || "";


        document.getElementById(
            "area"
        ).textContent =
            solicitud.area || "";


        document.getElementById(
            "puesto"
        ).textContent =
            solicitud.puesto || "";


        document.getElementById(
            "motivo"
        ).textContent =
            solicitud.motivo || "";


        // ==================================================
        // TABLA DE EPIs
        // ==================================================

        const tabla =
            document.getElementById(
                "tablaEPIs"
            );


        tabla.innerHTML = "";


        datos.epis.forEach(
            epi => {

                const fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML = `
                    <td>${epi.epi || ""}</td>
                    <td>${epi.modelo || ""}</td>
                    <td>${epi.cantidad || ""}</td>
                `;


                tabla.appendChild(
                    fila
                );

            }
        );


        // ==================================================
        // BLOQUEAR FIRMA
        // ==================================================
        
        console.log("ESTADO SOLICITUD:", solicitud.estado);
        
        if (solicitud.estado === "Firmado") {
            console.log("🔒 SOLICITUD FIRMADA - BLOQUEANDO");
            document.querySelector(".firma-container").style.display = "none";
            document.querySelector(".aceptacion").style.display = "none";
            document.getElementById("btnFirmar").style.display = "none";
            document.querySelector(".pdf-container").style.display = "none";
            document.getElementById("documentoFirmado").style.display = "block";
}
        // ==================================================
        // GENERAR PDF
        // ==================================================

        if (solicitud.estado !== "Firmado") {
    await generarPDFSolicitud(datos);
}


    } catch (error) {

        console.error(
            error
        );


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

        mensajeError.style.display =
            "none";


        // ==================================================
        // COMPROBAR FIRMA
        // ==================================================

        if (!hayFirma) {

            mostrarError(
                "Por favor, realice su firma antes de continuar."
            );

            return;
        }


        // ==================================================
        // COMPROBAR ACEPTACIÓN
        // ==================================================

        if (!aceptacion.checked) {

            mostrarError(
                "Debe confirmar la recepción de los equipos antes de firmar."
            );

            return;
        }


        // ==================================================
        // COMPROBAR SOLICITUD
        // ==================================================

        if (!idSolicitud) {

            mostrarError(
                "No se ha encontrado el número de solicitud."
            );

            return;
        }


        // ==================================================
        // COMPROBAR PDF
        // ==================================================

        if (!pdfActual) {

            mostrarError(
                "El PDF todavía no está disponible."
            );

            return;
        }


        try {

            btnFirmar.disabled = true;

            btnFirmar.textContent =
                "Generando documento...";


            // ==================================================
            // CARGAR PDF YA RELLENADO
            // ==================================================

            const pdfDoc =
                await PDFLib.PDFDocument.load(
                    pdfActual
                );


            const pagina =
                pdfDoc.getPages()[0];


            // ==================================================
            // OBTENER FIRMA DEL CANVAS
            // ==================================================

            const firmaData =
                canvas.toDataURL(
                    "image/png"
                );


            const firmaBytes =
                await fetch(
                    firmaData
                ).then(
                    res =>
                        res.arrayBuffer()
                );


            // ==================================================
            // INSERTAR FIRMA
            // ==================================================

            const firmaImagen =
                await pdfDoc.embedPng(
                    firmaBytes
                );


            const anchoFirma = 130;
            const altoFirma = 50;


            pagina.drawImage(
                firmaImagen,
                {
                    x: 214,
                    y: 79,
                    width: anchoFirma,
                    height: altoFirma
                }
            );


            // ==================================================
            // GENERAR PDF DEFINITIVO
            // ==================================================

            const pdfFirmado =
                await pdfDoc.save();


            pdfActual =
                pdfFirmado;


            // ==================================================
            // CONVERTIR PDF A BASE64
            // ==================================================

            const pdfBase64 =
                arrayBufferToBase64(
                    pdfFirmado
                );


            // ==================================================
            // CAPTURAR FIRMA
            // ==================================================

            const firma =
                canvas.toDataURL(
                    "image/png"
                );


            // ==================================================
            // PREPARAR PAYLOAD
            // ==================================================

            const payload = {

                IDSolicitud:
                    idSolicitud,

                Firma:
                    firma,

                FechaFirma:
                    new Date().toISOString(),

                PDF:
                    pdfBase64

            };


            console.log(
                "Enviando PDF firmado a Power Automate..."
            );


            // ==================================================
            // ENVIAR A POWER AUTOMATE
            // ==================================================

            btnFirmar.textContent =
                "Guardando documento...";


            const response =
                await fetch(
                    POWER_AUTOMATE_URL_FIRMA,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Error al enviar el documento."
                );
            }


            // ==================================================
            // MOSTRAR PDF FIRMADO
            // ==================================================

            const blob =
                new Blob(
                    [pdfFirmado],
                    {
                        type: "application/pdf"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            document.getElementById(
                "visorPDF"
            ).src = url;


            // ==================================================
            // ÉXITO
            // ==================================================

            mensajeExito.style.display =
                "block";


            btnFirmar.textContent =
                "Documento firmado";


            console.log(
                "PDF firmado y enviado correctamente"
            );


        } catch (error) {

            console.error(
                "Error:",
                error
            );


            mostrarError(
                "No se ha podido registrar la firma. Inténtelo de nuevo."
            );


            btnFirmar.disabled =
                false;


            btnFirmar.textContent =
                "Firmar y confirmar entrega";
        }

    }
);


// ======================================================
// MOSTRAR ERROR
// ======================================================

function mostrarError(mensaje) {

    mensajeError.textContent =
        mensaje;

    mensajeError.style.display =
        "block";
}


// ======================================================
// INICIAR
// ======================================================

cargarSolicitud();
