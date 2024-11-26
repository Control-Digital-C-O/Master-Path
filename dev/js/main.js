import { setupNavbarMenuAnimation } from "./barsMenu.js";
import { nombrePagina } from "./title.js";
import { mostrarCards } from "./cards.js";

function metaDatos() {
  let errorCount = 0;
  const header = document.querySelector(".header");
  const home = document.querySelector(".home");
  fetch("https://masterpath-22-default-rtdb.firebaseio.com/.json")
    .then((response) => response.json())
    .then((data) => {
      if (home && header) {
        nombrePagina(data.pagina);
        mostrarCards(data.cursos);
      }
    })
    .catch((error) => errorDatos(error));
}

function errorDatos(error) {
  console.error("Error al cargar los datos:", error);
  if (errorCount > 3) {
    alert("Error al cargar los datos: ", error);
  } else {
    errorCount++;
  }
  console.log("Conteo de error: " + errorCount);
}

metaDatos();
setupNavbarMenuAnimation();
//setInterval(metaDatos, 5000);
