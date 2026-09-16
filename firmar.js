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
// GENERAR PDF
// ======================================================

async function generarPDFSolicitud(datos) {

    try {

        // Descargar PDF original
        const respuestaPDF = await fetch(
            'Reg%20Entrega%20EPIS%20editable.pdf'
        );

        if (!respuestaPDF.ok) {

            throw new Error(
                'No se ha podido cargar el PDF original'
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
            'Textbox2'
        ).setText(
            datos.solicitud.area || ''
        );


        form.getTextField(
            'Textbox3'
        ).setText(
            datos.solicitud.trabajador || ''
        );


        form.getTextField(
            'Textbox4'
        ).setText(
            datos.solicitud.puesto || ''
        );


        // ==================================================
        // CAMPOS DE EPIs
        // ==================================================

        const camposEPI = [

            'Textbox1',
            'Textbox5',
            'Textbox6',
            'Textbox7',
            'Textbox8',
            'Textbox9',
            'Textbox10',
            'Textbox11',
            'Textbox12'

        ];


        const camposCantidad = [

            'Textbox13',
            'Textbox14',
            'Textbox15',
            'Textbox16',
            'Textbox17',
            'Textbox18',
            'Textbox19',
            'Textbox20',
            'Textbox21'

        ];


        // ==================================================
        // RELLENAR EPIs
        // ==================================================

        datos.epis.forEach(
            (epi, index) => {

                // El PDF tiene 9 filas
                if (index >= 9) return;


                form.getTextField(
                    camposEPI[index]
                ).setText(
                    epi.epi || ''
                );


                form.getTextField(
                    camposCantidad[index]
                ).setText(
                    String(
                        epi.cantidad || ''
                    )
                );

            }
        );

const ahora = new Date();

const fechaFirma =
    String(ahora.getDate()).padStart(2, '0') + '/' +
    String(ahora.getMonth() + 1).padStart(2, '0') + '/' +
    ahora.getFullYear();

form.getTextField('Textbox23').setText(fechaFirma);
        // ==================================================
        // APLANAR FORMULARIO
        // ==================================================

        form.flatten();


        // ==================================================
        // GENERAR PDF FINAL DE ESTA FASE
        // ==================================================

        const pdfFinal =
            await pdfDoc.save();
        pdfActual = pdfFinal;


        // ==================================================
        // MOSTRAR PDF EN LA PÁGINA
        // ==================================================

        const blob =
            new Blob(
                [pdfFinal],
                {
                    type: 'application/pdf'
                }
            );


        const url =
            URL.createObjectURL(blob);


        const visorPDF =
            document.getElementById(
                'visorPDF'
            );


        if (!visorPDF) {

            throw new Error(
                'No se encuentra el visorPDF en el HTML'
            );
        }


        visorPDF.src = url;


        return pdfFinal;

    } catch (error) {

        console.error(
            'Error generando PDF:',
            error
        );

        mostrarError(
            'No se ha podido generar el PDF.'
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
        // GENERAR PDF CON LOS DATOS REALES
        // ==================================================

        await generarPDFSolicitud(
            datos
        );


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


        // Comprobar firma
        if (!hayFirma) {

            mostrarError(
                "Por favor, realice su firma antes de continuar."
            );

            return;
        }


        // Comprobar aceptación
        if (!aceptacion.checked) {

            mostrarError(
                "Debe confirmar la recepción de los equipos antes de firmar."
            );

            return;
        }


        // Comprobar solicitud
        if (!idSolicitud) {

            mostrarError(
                "No se ha encontrado el número de solicitud."
            );

            return;
        }

// ==================================================
// INCORPORAR FIRMA AL PDF
// ==================================================

if (!pdfActual) {

    mostrarError(
        "El PDF todavía no está disponible."
    );

    return;
}

try {

    btnFirmar.disabled = true;
    btnFirmar.textContent = "Generando documento...";

    // Cargar el PDF que ya hemos rellenado
    const pdfDoc = await PDFLib.PDFDocument.load(pdfActual);

    const pagina = pdfDoc.getPages()[0];

    // Obtener firma del canvas
    const firmaData = canvas.toDataURL("image/png");

    // Convertir la firma a bytes
    const firmaBytes = await fetch(firmaData)
        .then(res => res.arrayBuffer());

    // Insertar firma como imagen PNG
    const firmaImagen = await pdfDoc.embedPng(firmaBytes);

    // Tamaño de la firma
    const anchoFirma = 130;
    const altoFirma = 50;

    // Posición de la firma en el documento
    pagina.drawImage(firmaImagen, {
    x: 214,
    y: 79,
    width: 130,
    height: 50
});

    // Guardar PDF definitivo
    const pdfFirmado = await pdfDoc.save();

    // Mostrar PDF firmado en el visor
    const blob = new Blob(
        [pdfFirmado],
        {
            type: "application/pdf"
        }
    );

    const url = URL.createObjectURL(blob);

    document.getElementById("visorPDF").src = url;

    // Guardarlo para el siguiente paso
    pdfActual = pdfFirmado;

    btnFirmar.textContent =
        "Documento firmado";

    mensajeExito.style.display = "block";

    console.log(
        "PDF firmado correctamente"
    );
return;
} catch (error) {

    console.error(
        "Error incorporando firma al PDF:",
        error
    );

    mostrarError(
        "No se ha podido incorporar la firma al documento."
    );

    btnFirmar.disabled = false;

    btnFirmar.textContent =
        "Firmar y confirmar entrega";
}
        // ==================================================
        // CAPTURAR FIRMA
        // ==================================================

        const firma =
            canvas.toDataURL(
                "image/png"
            );


        const payload = {

            IDSolicitud:
                idSolicitud,

            Firma:
                firma,

            FechaFirma:
                new Date().toISOString()

        };


        btnFirmar.disabled = true;

        btnFirmar.textContent =
            "Procesando...";


        try {

            // ==================================================
            // ENVIAR FIRMA A POWER AUTOMATE
            // ==================================================

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
                    "Error al enviar la firma."
                );
            }


            mensajeExito.style.display =
                "block";


            btnFirmar.textContent =
                "Documento firmado";


        } catch (error) {

            console.error(
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
