// ======================================================
// CONFIGURACIÓN
// ======================================================

const POWER_AUTOMATE_URL =
  "https://default9057cb6da67347c7b025e86c6b54bd.2d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/30/workflows/fa9b13383202441dbc037bd3ae8170a1/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6uIjffaCNr-gWetEs_ikkqgjXH65npWunbhphBDep_g";


// ======================================================
// VARIABLES
// ======================================================

let solicitudes = [];


// ======================================================
// INICIALIZACIÓN
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // Botón buscar

    document
      .getElementById("btnBuscar")
      .addEventListener(
        "click",
        filtrarSolicitudes
      );


    // Mostrar todas

    document
      .getElementById("btnMostrarTodas")
      .addEventListener(
        "click",
        () => {

          document
            .getElementById("busqueda")
            .value = "";

          mostrarSolicitudes(
            solicitudes
          );

        }
      );


    // Buscar pulsando Enter

    document
      .getElementById("busqueda")
      .addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter"
          ) {

            filtrarSolicitudes();

          }

        }
      );


    // Cargar solicitudes

    cargarSolicitudes();

  }
);


// ======================================================
// CARGAR SOLICITUDES
// ======================================================

async function cargarSolicitudes() {


  const spinner =
    document.getElementById(
      "spinner"
    );


  spinner.style.display =
    "block";


  ocultarResultados();


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
            JSON.stringify({

              busqueda: ""

            })

        }
      );


    // ================================================
    // LEER RESPUESTA
    // ================================================

    const textoRespuesta =
      await response.text();


    console.log(
      "Respuesta Power Automate:",
      textoRespuesta
    );


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

        console.error(
          "La respuesta no es JSON:",
          textoRespuesta
        );

      }

    }


    // ================================================
    // COMPROBAR
    // ================================================

    if (
      !response.ok ||
      !resultado ||
      resultado.resultado !== "ok"
    ) {

      throw new Error(
        "Power Automate no devolvió una respuesta válida."
      );

    }


    // ================================================
    // GUARDAR SOLICITUDES
    // ================================================

    solicitudes =
      Array.isArray(
        resultado.solicitudes
      )
        ? resultado.solicitudes
        : [];


    // ================================================
    // MOSTRAR
    // ================================================

    mostrarSolicitudes(
      solicitudes
    );


  } catch (error) {


    console.error(
      "Error cargando solicitudes:",
      error
    );


    mostrarError();


  } finally {


    spinner.style.display =
      "none";

  }

}


// ======================================================
// FILTRAR
// ======================================================

function filtrarSolicitudes() {


  const texto =
    document
      .getElementById("busqueda")
      .value
      .trim()
      .toLowerCase();


  // Si está vacío → todas

  if (!texto) {

    mostrarSolicitudes(
      solicitudes
    );

    return;

  }


  // ================================================
  // FILTRADO
  // ================================================

  const resultados =
    solicitudes.filter(
      solicitud => {


        const id =
          String(
            solicitud.idSolicitud || ""
          )
          .toLowerCase();


        const operario =
          String(
            solicitud.numeroOperario || ""
          )
          .toLowerCase();


        const trabajador =
          String(
            solicitud.trabajador || ""
          )
          .toLowerCase();


        return (

          id.includes(texto) ||

          operario.includes(texto) ||

          trabajador.includes(texto)

        );

      }
    );


  mostrarSolicitudes(
    resultados
  );

}


// ======================================================
// MOSTRAR SOLICITUDES
// ======================================================

function mostrarSolicitudes(
  lista
) {


  const container =
    document.getElementById(
      "listaSolicitudes"
    );


  const contador =
    document.getElementById(
      "contadorResultados"
    );


  const numeroResultados =
    document.getElementById(
      "numeroResultados"
    );


  const sinResultados =
    document.getElementById(
      "sinResultados"
    );


  // Limpiar

  container.innerHTML = "";


  // Contador

  contador.style.display =
    "block";


  numeroResultados.innerText =
    lista.length;


  // Sin resultados

  if (
    lista.length === 0
  ) {

    sinResultados.style.display =
      "block";

    return;

  }


  sinResultados.style.display =
    "none";


  // ================================================
  // CREAR TARJETAS
  // ================================================

  lista.forEach(
    solicitud => {


      const tarjeta =
        document.createElement(
          "div"
        );


      tarjeta.className =
        "solicitud-pendiente";


      tarjeta.innerHTML = `

        <div class="solicitud-pendiente-info">

          <div class="solicitud-pendiente-id">

            ${escapeHTML(
              solicitud.idSolicitud || ""
            )}

          </div>


          <div class="solicitud-pendiente-dato">

            <strong>
              Trabajador:
            </strong>

            ${escapeHTML(
              solicitud.trabajador || ""
            )}

          </div>


          <div class="solicitud-pendiente-dato">

            <strong>
              Nº operario:
            </strong>

            ${escapeHTML(
              solicitud.numeroOperario || ""
            )}

          </div>


          <div class="solicitud-pendiente-dato">

            <strong>
              Fecha:
            </strong>

            ${escapeHTML(
              solicitud.fecha || ""
            )}

          </div>


          <div class="solicitud-pendiente-dato">

            <strong>
              Motivo:
            </strong>

            ${escapeHTML(
              solicitud.motivo || ""
            )}

          </div>

        </div>


        <div class="solicitud-pendiente-accion">

          <button
            type="button"
            class="primary-btn btnAbrirSolicitud"
          >
            ABRIR
          </button>

        </div>

      `;


      // ============================================
      // BOTÓN ABRIR
      // ============================================

      const boton =
        tarjeta.querySelector(
          ".btnAbrirSolicitud"
        );


      boton.addEventListener(
        "click",
        () => {

          abrirSolicitud(
            solicitud
          );

        }
      );


      container.appendChild(
        tarjeta
      );

    }
  );

}


// ======================================================
// ABRIR SOLICITUD
// ======================================================

function abrirSolicitud(
  solicitud
) {


  if (
    !solicitud.enlaceFirma
  ) {

    alert(
      "No se ha encontrado el enlace de esta solicitud."
    );

    return;

  }


  window.location.href =
    solicitud.enlaceFirma;

}


// ======================================================
// OCULTAR RESULTADOS
// ======================================================

function ocultarResultados() {


  document
    .getElementById(
      "contadorResultados"
    )
    .style.display =
    "none";


  document
    .getElementById(
      "sinResultados"
    )
    .style.display =
    "none";


  document
    .getElementById(
      "listaSolicitudes"
    )
    .innerHTML = "";

}


// ======================================================
// ERROR
// ======================================================

function mostrarError() {


  const container =
    document.getElementById(
      "listaSolicitudes"
    );


  container.innerHTML = `

    <div class="error-box">

      <strong>
        No se han podido cargar las solicitudes.
      </strong>

      <p>
        Compruebe la conexión e inténtelo de nuevo.
      </p>

      <button
        type="button"
        class="secondary-btn"
        onclick="cargarSolicitudes()"
      >
        Reintentar
      </button>

    </div>

  `;

}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escapeHTML(
  texto
) {


  return String(
    texto
  )
  .replace(
    /&/g,
    "&amp;"
  )
  .replace(
    /</g,
    "&lt;"
  )
  .replace(
    />/g,
    "&gt;"
  )
  .replace(
    /"/g,
    "&quot;"
  )
  .replace(
    /'/g,
    "&#039;"
  );

}
