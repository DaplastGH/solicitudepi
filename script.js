// ======================================================
// CONFIGURACIÓN
// ======================================================


const POWER_AUTOMATE_URL = "https://default9057cb6da67347c7b025e86c6b54bd.2d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/30/workflows/57ddabc7c70b4881b8794603f5c52371/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oOXsvgwnB9X38XfDQUqN3o1iK5h-L02rHiTonvmyr7A";


// ======================================================
// MODELOS DE EPI
// ======================================================

const modelosEPI = {

  "Guantes": [
    "Modelo 1",
    "Modelo 2",
    "Modelo 3"
  ],

  "Calzado de seguridad": [
    "Modelo 1"
  ],

  "Casco": [],

  "Gafas": [
    "Modelo 1"
  ],

  "Chaleco": [],

  "Protección auditiva": [],

  "Protección respiratoria": [],

  "Arnés": []

};


// ======================================================
// INICIALIZACIÓN
// ======================================================

document.addEventListener("DOMContentLoaded", () => {


  // Motivo

  document
    .getElementById("motivo")
    .addEventListener(
      "change",
      cambiarMotivo
    );


  // Añadir EPI

  document
    .getElementById("btnAgregarEPI")
    .addEventListener(
      "click",
      agregarEPI
    );


  // Crear solicitud

  document
    .getElementById("btnCrearSolicitud")
    .addEventListener(
      "click",
      crearSolicitud
    );


  // Nueva solicitud

  document
    .getElementById("btnNuevaSolicitud")
    .addEventListener(
      "click",
      nuevaSolicitud
    );


  // Primer EPI automáticamente

  agregarEPI();

});


// ======================================================
// MOTIVO
// ======================================================

function cambiarMotivo() {


  const motivo =
    document
      .getElementById("motivo")
      .value;


  const bloque =
    document
      .getElementById("bloqueOtroMotivo");


  if (motivo === "Otros") {

    bloque.style.display = "flex";

  } else {

    bloque.style.display = "none";

    document
      .getElementById("otroMotivo")
      .value = "";

  }

}


// ======================================================
// AÑADIR EPI
// ======================================================

function agregarEPI() {


  const container =
    document
      .getElementById("epis-container");


  const epiBox =
    document.createElement("div");


  epiBox.className =
    "epi-box";


  // ================================================
  // OPCIONES DE EPI
  // ================================================

  let opcionesEPI = `

    <option
      value=""
      selected
      disabled
    >
      Seleccione un EPI
    </option>

  `;


  Object.keys(modelosEPI)
    .forEach(epi => {


      opcionesEPI += `

        <option value="${epi}">
          ${epi}
        </option>

      `;

    });


  // ================================================
  // HTML DEL EPI
  // ================================================

  epiBox.innerHTML = `

    <div class="epi-header">

      <div class="epi-title">
        Equipo de protección
      </div>

      <button
        type="button"
        class="remove-btn"
        title="Eliminar EPI"
      >
        🗑️
      </button>

    </div>


    <div class="form-row">


      <!-- EPI -->

      <div class="form-group">

        <label>
          EPI
          <span class="required">*</span>
        </label>


        <select class="epi-select">

          ${opcionesEPI}

        </select>

      </div>


      <!-- MODELO -->

      <div
        class="form-group modelo-group"
        style="display:none;"
      >

        <label>
          Modelo
        </label>


        <select class="modelo-select">

          <option value="">
            Seleccione un modelo
          </option>

        </select>

      </div>


      <!-- CANTIDAD -->

      <div class="form-group">

        <label>

          Cantidad

          <span class="required">
            *
          </span>

        </label>


        <input
          type="number"
          class="cantidad-input"
          min="1"
          step="1"
          value="1"
        >

      </div>


    </div>

  `;


  container.appendChild(
    epiBox
  );


  // ================================================
  // SELECT2
  // ================================================

  const epiSelect =
    epiBox.querySelector(
      ".epi-select"
    );


  const modeloSelect =
    epiBox.querySelector(
      ".modelo-select"
    );


  $(epiSelect).select2({

    width: "100%",

    placeholder:
      "Seleccione un EPI",

    language: "es"

  });


  $(modeloSelect).select2({

    width: "100%",

    placeholder:
      "Seleccione un modelo",

    language: "es"

  });


  // ================================================
  // CAMBIO DE EPI
  // ================================================

  $(epiSelect).on(
    "change",
    function () {

      actualizarModelos(
        epiBox,
        this.value
      );

    }
  );


  // ================================================
  // ELIMINAR
  // ================================================

  epiBox
    .querySelector(".remove-btn")
    .addEventListener(
      "click",
      () => {

        epiBox.remove();

        actualizarNumeroEPIs();

      }
    );


  actualizarNumeroEPIs();

}


// ======================================================
// ACTUALIZAR MODELOS
// ======================================================

function actualizarModelos(
  epiBox,
  epiSeleccionado
) {


  const modeloGroup =
    epiBox.querySelector(
      ".modelo-group"
    );


  const modeloSelect =
    epiBox.querySelector(
      ".modelo-select"
    );


  const modelos =
    modelosEPI[
      epiSeleccionado
    ] || [];


  // ================================================
  // LIMPIAR
  // ================================================

  $(modeloSelect)
    .empty()
    .append(`

      <option value="">
        Seleccione un modelo
      </option>

    `);


  // ================================================
  // TIENE MODELOS
  // ================================================

  if (modelos.length > 0) {


    modeloGroup.style.display =
      "flex";


    modelos.forEach(
      modelo => {

        $(modeloSelect)
          .append(`

            <option value="${modelo}">
              ${modelo}
            </option>

          `);

      }
    );


  } else {


    // ============================================
    // NO TIENE MODELO
    // ============================================

    modeloGroup.style.display =
      "none";


    $(modeloSelect)
      .val("")
      .trigger("change");

  }

}


// ======================================================
// CONTADOR
// ======================================================

function actualizarNumeroEPIs() {


  const numero =
    document.querySelectorAll(
      ".epi-box"
    ).length;


  document.getElementById(
    "numeroEPIs"
  ).innerText =
    numero;

}


// ======================================================
// RECOGER DATOS
// ======================================================

function obtenerDatosFormulario() {


  const numeroOperario =
    document
      .getElementById(
        "numeroOperario"
      )
      .value
      .trim();


  const trabajador =
    document
      .getElementById(
        "trabajador"
      )
      .value
      .trim();


  const area =
    document
      .getElementById(
        "area"
      )
      .value
      .trim();


  const puesto =
    document
      .getElementById(
        "puesto"
      )
      .value
      .trim();


  const motivo =
    document
      .getElementById(
        "motivo"
      )
      .value;


  const otroMotivo =
    document
      .getElementById(
        "otroMotivo"
      )
      .value
      .trim();

const comentarios =
    document.getElementById("comentarios").value.trim();
  const epis = [];


  let error = false;


  document
    .querySelectorAll(
      ".epi-box"
    )
    .forEach(box => {


      const epi =
        box
          .querySelector(
            ".epi-select"
          )
          .value;


      const modelo =
        box
          .querySelector(
            ".modelo-select"
          )
          .value;


      const cantidad =
        parseInt(
          box
            .querySelector(
              ".cantidad-input"
            )
            .value
        ) || 0;


      // ==========================================
      // EPI OBLIGATORIO
      // ==========================================

      if (!epi) {


        alert(
          "Debe seleccionar todos los EPIs."
        );


        error = true;

        return;

      }


      // ==========================================
      // CANTIDAD
      // ==========================================

      if (cantidad <= 0) {


        alert(
          "La cantidad de cada EPI debe ser mayor que 0."
        );


        error = true;

        return;

      }


      // ==========================================
      // MODELO
      // ==========================================

      const modelosDisponibles =
        modelosEPI[epi] || [];


      if (
        modelosDisponibles.length > 0 &&
        !modelo
      ) {


        alert(
          `Debe seleccionar el modelo de ${epi}.`
        );


        error = true;

        return;

      }


      // ==========================================
      // AÑADIR EPI
      // ==========================================

      epis.push({

        EPI: epi,

        Modelo:
          modelo || "",

        Cantidad:
          cantidad

      });

    });


  if (error) {

    return null;

  }


  return {

    NumeroOperario:
      numeroOperario,

    Trabajador:
      trabajador,

    Area:
      area,

    Puesto:
      puesto,

    Motivo:
      motivo,

    OtroMotivo:
      motivo === "Otros"
        ? otroMotivo
        : "",

    Comentarios:
      comentarios,

    EPIs:
      epis

};

}


// ======================================================
// VALIDACIÓN
// ======================================================

function validarFormulario(
  datos
) {


  if (!datos.NumeroOperario) {


    alert(
      "Debe introducir el número de operario."
    );


    return false;

  }


  if (!datos.Trabajador) {


    alert(
      "Debe introducir el nombre del trabajador."
    );


    return false;

  }


  if (!datos.Area) {


    alert(
      "Debe introducir el área o departamento."
    );


    return false;

  }


  if (!datos.Puesto) {


    alert(
      "Debe introducir el puesto de trabajo."
    );


    return false;

  }


  if (!datos.Motivo) {


    alert(
      "Debe seleccionar el motivo de la entrega."
    );


    return false;

  }


  if (
    datos.Motivo === "Otros" &&
    !datos.OtroMotivo
  ) {


    alert(
      "Debe especificar el motivo."
    );


    return false;

  }


  if (
    datos.EPIs.length === 0
  ) {


    alert(
      "Debe añadir al menos un EPI."
    );


    return false;

  }


  return true;

}


// ======================================================
// CREAR SOLICITUD
// ======================================================

async function crearSolicitud() {


  const datos =
    obtenerDatosFormulario();


  if (!datos) {

    return;

  }


  if (
    !validarFormulario(datos)
  ) {

    return;

  }


  // ================================================
  // RESUMEN PARA CONFIRMACIÓN
  // ================================================

  let resumen = "";


  datos.EPIs.forEach(
    epi => {


      resumen +=
        `\n- ${epi.EPI}`;


      if (epi.Modelo) {

        resumen +=
          ` (${epi.Modelo})`;

      }


      resumen +=
        ` x${epi.Cantidad}`;

    }
  );


  // ================================================
  // CONFIRMACIÓN
  // ================================================

  const confirmar =
    confirm(

      `¿Crear esta solicitud?\n\n` +

      `Operario: ` +
      `${datos.NumeroOperario}\n` +

      `Trabajador: ` +
      `${datos.Trabajador}\n` +

      `Motivo: ` +
      `${datos.Motivo}\n\n` +

      `EPIs:` +
      `${resumen}`

    );


  if (!confirmar) {

    return;

  }


  // ================================================
  // COMPROBAR URL
  // ================================================

  if (
    !POWER_AUTOMATE_URL ||
    POWER_AUTOMATE_URL.includes(
      "PEGA_AQUI"
    )
  ) {


    alert(
      "No se ha configurado la conexión con Power Automate."
    );


    console.log(
      "Payload preparado:",
      datos
    );


    return;

  }


  // ================================================
  // ELEMENTOS
  // ================================================

  const boton =
    document.getElementById(
      "btnCrearSolicitud"
    );


  const spinner =
    document.getElementById(
      "spinner"
    );


  boton.disabled =
    true;


  spinner.style.display =
    "block";


  // ================================================
  // ENVÍO
  // ================================================

  try {


    const response =
      await fetch(
        POWER_AUTOMATE_URL,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(datos)

        }
      );


    // ============================================
    // LEER RESPUESTA COMO TEXTO
    // ============================================

    const textoRespuesta =
      await response.text();


    console.log(
      "Respuesta Power Automate:",
      textoRespuesta
    );


    // ============================================
    // INTENTAR JSON
    // ============================================

    let resultado =
      null;


    if (
      textoRespuesta &&
      textoRespuesta.trim() !== ""
    ) {


      try {

        resultado =
          JSON.parse(
            textoRespuesta
          );

      } catch (errorJSON) {


        console.warn(
          "La respuesta de Power Automate no es JSON:",
          textoRespuesta
        );

      }

    }


    // ============================================
    // OCULTAR SPINNER
    // ============================================

    spinner.style.display =
      "none";


    boton.disabled =
      false;


    // ============================================
    // RESPUESTA CORRECTA
    // ============================================

    if (
      response.ok &&
      resultado &&
      resultado.resultado === "ok"
    ) {


      mostrarResultado(
        resultado
      );


      return;

    }


    // ============================================
    // RESPUESTA HTTP CORRECTA PERO SIN JSON
    // ============================================

    if (
      response.ok &&
      !resultado
    ) {


      console.warn(
        "Power Automate respondió correctamente, pero no devolvió JSON."
      );


      alert(
        "La solicitud se ha enviado, pero no se ha podido obtener el número de solicitud."
      );


      return;

    }


    // ============================================
    // ERROR
    // ============================================

    console.error(

      "Respuesta inesperada de Power Automate:",

      {

        status:
          response.status,

        respuesta:
          textoRespuesta,

        resultado:
          resultado

      }

    );


    alert(
      "Se ha producido un error al crear la solicitud."
    );


  } catch (error) {


    // ============================================
    // ERROR DE CONEXIÓN
    // ============================================

    spinner.style.display =
      "none";


    boton.disabled =
      false;


    console.error(
      "Error de conexión:",
      error
    );


    alert(
      "No se ha podido conectar con Power Automate."
    );

  }

}


// ======================================================
// MOSTRAR RESULTADO
// ======================================================

function mostrarResultado(
  resultado
) {


  // ================================================
  // OCULTAR FORMULARIO
  // ================================================

  document
    .getElementById(
      "formularioSolicitud"
    )
    .style.display =
    "none";


  // ================================================
  // OBTENER NÚMERO
  // ================================================

  let numero =
    resultado.numeroSolicitud ||
    resultado.IDSolicitud ||
    resultado.idSolicitud ||
    "";


  // ================================================
  // CONVERTIR A TEXTO
  // ================================================

  numero =
    numero
      .toString()
      .trim();


  // ================================================
  // FORMATO EPI-2026-0003
  // ================================================

  if (
    numero &&
    !numero.startsWith("EPI-")
  ) {


    const año =
      new Date()
        .getFullYear();


    numero =

      `EPI-${año}-` +

      String(numero)
        .padStart(
          4,
          "0"
        );

  }


  // ================================================
  // MOSTRAR NÚMERO
  // ================================================

  document
    .getElementById(
      "numeroSolicitud"
    )
    .innerText =
    numero;


  // ================================================
  // MOSTRAR RESULTADO
  // ================================================

  document
    .getElementById(
      "resultado"
    )
    .style.display =
    "block";


  // ================================================
  // CAMBIAR TÍTULO
  // ================================================

  const titulo =
    document.querySelector(
      "h1"
    );


  if (titulo) {

    titulo.innerText =
      "Solicitud creada correctamente";

  }


  // ================================================
  // IR AL RESULTADO
  // ================================================

  document
    .getElementById(
      "resultado"
    )
    .scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

}


// ======================================================
// NUEVA SOLICITUD
// ======================================================

function nuevaSolicitud() {

  window.location.reload();

}
