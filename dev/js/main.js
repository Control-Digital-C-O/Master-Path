import { setupNavbarMenuAnimation } from "./barsMenu.js";
/*
import { toggleHeaderOnScroll } from './header.js';
import { manageHeaderSpacer } from './header.js';
*/
import { nombrePagina } from "./title.js";
import { mostrarCards } from "./cards.js";

/*
toggleHeaderOnScroll();
manageHeaderSpacer();
*/

function metaDatos() {
  const home = document.querySelector(".home");
  fetch("https://masterpath-22-default-rtdb.firebaseio.com/.json")
    .then((response) => response.json())
    .then((data) => {
      nombrePagina(data.pagina);
      if (home) {
        mostrarCards(data.cursos);
      }
    })
    .catch((error) => errorDatos(error));
}

function errorDatos(error) {
  console.error("Error al cargar los datos:", error);
  alert("Error al cargar los datos: ", error);
}

metaDatos();
setupNavbarMenuAnimation();
setInterval(metaDatos, 5000);
