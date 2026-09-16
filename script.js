// ======================================================
// CONFIGURACIÓN
// ======================================================


const POWER_AUTOMATE_URL = "https://default9057cb6da67347c7b025e86c6b54bd.2d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/30/workflows/57ddabc7c70b4881b8794603f5c52371/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oOXsvgwnB9X38XfDQUqN3o1iK5h-L02rHiTonvmyr7A";


// ======================================================
// MODELOS DE EPI
// ======================================================

// Puedes modificar esta lista fácilmente.
//
// Si un EPI no tiene modelo,
// simplemente dejamos el array vacío.

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
    .addEventListener("change", cambiarMotivo);

  // Añadir EPI
  document
    .getElementById("btnAgregarEPI")
    .addEventListener("click", agregarEPI);

  // Crear solicitud
  document
    .getElementById("btnCrearSolicitud")
    .addEventListener("click", crearSolicitud);

  // Copiar enlace
  document
    .getElementById("btnCopiarEnlace")
    .addEventListener("click", copiarEnlace);

  // Nueva solicitud
  document
    .getElementById("btnNuevaSolicitud")
    .addEventListener("click", nuevaSolicitud);

  // Añadimos automáticamente el primer EPI
  agregarEPI();

});


// ======================================================
// MOTIVO
// ======================================================

function cambiarMotivo() {

  const motivo =
    document.getElementById("motivo").value;

  const bloque =
    document.getElementById("bloqueOtroMotivo");

  if (motivo === "Otros") {

    bloque.style.display = "flex";

  } else {

    bloque.style.display = "none";

    document.getElementById("otroMotivo").value = "";

  }

}


// ======================================================
// AÑADIR EPI
// ======================================================

function agregarEPI() {

  const container =
    document.getElementById("epis-container");

  const epiBox =
    document.createElement("div");

  epiBox.className = "epi-box";


  // Opciones EPI

  let opcionesEPI =
    `<option value="" selected disabled>
       Seleccione un EPI
     </option>`;

  Object.keys(modelosEPI).forEach(epi => {

    opcionesEPI += `
      <option value="${epi}">
        ${epi}
      </option>
    `;

  });


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
          EPI <span class="required">*</span>
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
          Cantidad <span class="required">*</span>
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


  container.appendChild(epiBox);


  // Inicializar Select2

  const epiSelect =
    epiBox.querySelector(".epi-select");

  const modeloSelect =
    epiBox.querySelector(".modelo-select");

  $(epiSelect).select2({
    width: "100%",
    placeholder: "Seleccione un EPI",
    language: "es"
  });

  $(modeloSelect).select2({
    width: "100%",
    placeholder: "Seleccione un modelo",
    language: "es"
  });


  // Cambio de EPI

  $(epiSelect).on("change", function () {

    actualizarModelos(
      epiBox,
      this.value
    );

  });


  // Eliminar

  epiBox
    .querySelector(".remove-btn")
    .addEventListener("click", () => {

      epiBox.remove();

      actualizarNumeroEPIs();

    });


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
    epiBox.querySelector(".modelo-group");

  const modeloSelect =
    epiBox.querySelector(".modelo-select");


  const modelos =
    modelosEPI[epiSeleccionado] || [];


  // Limpiar modelos

  $(modeloSelect)
    .empty()
    .append(
      `<option value="">
        Seleccione un modelo
       </option>`
    );


  // Si tiene modelos

  if (modelos.length > 0) {

    modeloGroup.style.display = "flex";


    modelos.forEach(modelo => {

      $(modeloSelect).append(
        `<option value="${modelo}">
          ${modelo}
         </option>`
      );

    });


  } else {

    // No tiene modelo

    modeloGroup.style.display = "none";

    $(modeloSelect).val("").trigger("change");

  }

}


// ======================================================
// CONTADOR
// ======================================================

function actualizarNumeroEPIs() {

  const numero =
    document.querySelectorAll(".epi-box").length;

  document.getElementById(
    "numeroEPIs"
  ).innerText = numero;

}


// ======================================================
// RECOGER DATOS
// ======================================================

function obtenerDatosFormulario() {

  const numeroOperario =
    document
      .getElementById("numeroOperario")
      .value.trim();

  const trabajador =
    document
      .getElementById("trabajador")
      .value.trim();

  const area =
    document
      .getElementById("area")
      .value.trim();

  const puesto =
    document
      .getElementById("puesto")
      .value.trim();

  const motivo =
    document
      .getElementById("motivo")
      .value;

  const otroMotivo =
    document
      .getElementById("otroMotivo")
      .value.trim();


  const epis = [];

  let error = false;


  document
    .querySelectorAll(".epi-box")
    .forEach(box => {

      const epi =
        box
          .querySelector(".epi-select")
          .value;

      const modelo =
        box
          .querySelector(".modelo-select")
          .value;

      const cantidad =
        parseInt(
          box
            .querySelector(".cantidad-input")
            .value
        ) || 0;


      if (!epi) {

        alert("Debe seleccionar todos los EPIs.");

        error = true;

        return;

      }


      if (cantidad <= 0) {

        alert(
          "La cantidad de cada EPI debe ser mayor que 0."
        );

        error = true;

        return;

      }


      // Si tiene modelos, obligamos a seleccionar uno

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


      epis.push({

        EPI: epi,

        Modelo: modelo || "",

        Cantidad: cantidad

      });

    });


  if (error) {
    return null;
  }


  return {

    NumeroOperario: numeroOperario,

    Trabajador: trabajador,

    Area: area,

    Puesto: puesto,

    Motivo: motivo,

    OtroMotivo:
      motivo === "Otros"
        ? otroMotivo
        : "",

    EPIs: epis

  };

}


// ======================================================
// VALIDACIÓN
// ======================================================

function validarFormulario(datos) {

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


  if (datos.EPIs.length === 0) {

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


  if (!validarFormulario(datos)) {
    return;
  }


  // Confirmación

  let resumen = "";

  datos.EPIs.forEach(epi => {

    resumen +=
      `\n- ${epi.EPI}`;

    if (epi.Modelo) {

      resumen +=
        ` (${epi.Modelo})`;

    }

    resumen +=
      ` x${epi.Cantidad}`;

  });


  const confirmar =
    confirm(
      `¿Crear esta solicitud?\n\n` +

      `Operario: ${datos.NumeroOperario}\n` +

      `Trabajador: ${datos.Trabajador}\n` +

      `Motivo: ${datos.Motivo}\n\n` +

      `EPIs:${resumen}`
    );


  if (!confirmar) {
    return;
  }


  // ================================================
  // COMPROBAR URL
  // ================================================

  if (!POWER_AUTOMATE_URL) {

    alert(
      "La web está funcionando correctamente, " +
      "pero todavía no se ha configurado Power Automate."
    );

    console.log(
      "Payload preparado:",
      datos
    );

    return;

  }


  // ================================================
  // ENVIAR
  // ================================================

  const boton =
    document.getElementById(
      "btnCrearSolicitud"
    );

  const spinner =
    document.getElementById(
      "spinner"
    );


  boton.disabled = true;

  spinner.style.display = "block";


  try {

    const response =
      await fetch(
        POWER_AUTOMATE_URL,
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(datos)

        }
      );


    const resultado =
      await response.json();


    spinner.style.display =
      "none";

    boton.disabled =
      false;


    if (
      response.ok &&
      resultado.resultado === "ok"
    ) {

      mostrarResultado(
        resultado
      );

    } else {

      alert(
        "Se ha producido un error al crear la solicitud."
      );

      console.error(
        resultado
      );

    }


  } catch (error) {

    spinner.style.display =
      "none";

    boton.disabled =
      false;


    console.error(error);

    alert(
      "No se ha podido conectar con Power Automate."
    );

  }

}


// ======================================================
// MOSTRAR RESULTADO
// ======================================================

// ======================================================
// MOSTRAR RESULTADO
// ======================================================

function mostrarResultado(resultado) {

  // Ocultar formulario completo
  document.querySelector(".section-title").parentElement;

  document.querySelectorAll(
    ".section-title, .form-row, #bloqueOtroMotivo, " +
    "#epis-container, #btnAgregarEPI, .summary-box, " +
    "#btnCrearSolicitud"
  ).forEach(elemento => {
    elemento.style.display = "none";
  });


  // Mostrar resultado
  const resultadoBox =
    document.getElementById("resultado");

  resultadoBox.style.display = "block";


  // Número de solicitud
  document.getElementById(
    "numeroSolicitud"
  ).innerText =
    resultado.numeroSolicitud || "";


  // Enlace de firma
  document.getElementById(
    "enlaceFirma"
  ).value =
    resultado.enlaceFirma || "";


  // Cambiar título principal
  const titulo =
    document.querySelector("h1");

  if (titulo) {
    titulo.innerText =
      "Solicitud creada correctamente";
  }


  // Ir al resultado
  resultadoBox.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ======================================================
// COPIAR ENLACE
// ======================================================

async function copiarEnlace() {

  const input =
    document.getElementById(
      "enlaceFirma"
    );

  try {

    await navigator.clipboard.writeText(
      input.value
    );

    alert(
      "Enlace copiado."
    );

  } catch {

    input.select();

    document.execCommand("copy");

    alert(
      "Enlace copiado."
    );

  }

}


// ======================================================
// NUEVA SOLICITUD
// ======================================================

function nuevaSolicitud() {

  window.location.reload();

}
