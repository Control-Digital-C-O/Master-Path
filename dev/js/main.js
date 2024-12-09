// Animaciones
import { setupNavbarMenuAnimation, nombrePagina } from "./header.js";
import { mostrarCards } from "./cards.js";
// Firebase
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Sesion
import {
  iniciarSesionCorreo,
  iniciarSesionGoogle,
  menuUsuario,
  datosUsuario,
  detallesPerfil,
  registrarUsuario,
  buscarUsuariosNoAsync,
} from "./user.js";
// DataBase
import {
  obtenerDatosConCache,
  escucharActualizaciones,
  obtenerDatosFirestoreConCache,
  escucharActualizacionesFirestore,
  subirDatosRealtime,
  actualizarDatosRealtime,
  eliminarDatosRealtime,
  subirDatosFirestore,
  actualizarDatosFirestore,
  eliminarDatosFirestore,
  agregarDocumentoAcoleccion,
} from "./database.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCDyWUKx7P7cYdTxfk3hkfzm4raauSVXLg",
  authDomain: "masterpath-22.firebaseapp.com",
  databaseURL: "https://masterpath-22-default-rtdb.firebaseio.com",
  projectId: "masterpath-22",
  storageBucket: "masterpath-22.firebasestorage.app",
  messagingSenderId: "1054173466031",
  appId: "1:1054173466031:web:f77048670ad97c0899735a",
  measurementId: "G-XLFJNG8XMY",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar las instancias necesarias
const database = getDatabase(app); // Realtime Database
const firestore = getFirestore(app); // Firestore
const auth = getAuth(app); // Authentication

function loginjs() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  if (loginForm && signupForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email-log").value;
      const password = document.getElementById("password-log").value;
      iniciarSesionCorreo(auth, email, password, firestore);
    });
    document
      .getElementById("googleLoginButton")
      .addEventListener("click", () => {
        iniciarSesionGoogle(auth, firestore);
      });
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email-sign").value;
      const password = document.getElementById("password-sign").value;
      registrarUsuario(auth, name, email, password, firestore);
    });
  }
}

async function metaDatos(database) {
  const header = document.querySelector(".header");
  const home = document.querySelector(".home");
  let detenerEscucha = null;
  let band = false;

  if (header) {
    // Obtener datos iniciales del documento `/pagina` con caché
    try {
      const datosPagina = await obtenerDatosFirestoreConCache(
        firestore,
        "MasterPath/pagina",
        false
      );
      if (datosPagina) {
        // console.log("Datos de la página obtenidos:", datosPagina);
        // Aquí puedes actualizar el DOM con los datos
        nombrePagina(datosPagina);
      }
    } catch (error) {
      console.error("Error al cargar los datos de la página:", error);
    }

    // Escuchar actualizaciones en tiempo real para el documento `/pagina`
    detenerEscucha = escucharActualizacionesFirestore(
      firestore,
      "MasterPath/pagina",
      (datos) => {
        // console.log(
        //   "Actualizaciones en tiempo real del documento página:",
        //   datos
        // );
        // Actualizar el DOM con los nuevos datos
        nombrePagina(datos);
      },
      false
    );

    if (home) {
      // Obtener datos iniciales de `/cursos` con caché
      try {
        const datosCursos = await obtenerDatosConCache(
          database,
          "/cursos",
          true
        );
        const datosImagenes = await obtenerDatosFirestoreConCache(
          firestore,
          "cursos",
          true
        );
        // Vincular las imágenes al curso correspondiente
        for (const id in datosCursos) {
          if (datosCursos.hasOwnProperty(id)) {
            const curso = datosCursos[id];
            const imagenCurso = datosImagenes.find((img) => img.id === id);
            curso.imagen = imagenCurso ? imagenCurso.imagen : null; // Agregar la imagen al curso
          }
        }
        // console.log("datos:", datosCursosImagen);
        console.log("datos:", datosCursos);
        mostrarCards(datosCursos);
        band = true;
      } catch (error) {
        console.error("Error al cargar los datos de cursos:", error);
      }

      if (band) {
        // Escuchar actualizaciones en tiempo real para `/cursos`
        detenerEscucha = escucharActualizaciones(
          database,
          "/cursos",
          (nuevosDatos) => {
            console.log(
              "Datos actualizados en tiempo real de cursos:",
              nuevosDatos
            );
            mostrarCards(nuevosDatos);
          },
          true,
          300000 // 5 minutos
        );
      }
    }
  }

  // Asegurarse de detener el listener cuando no sea necesario
  return () => {
    if (detenerEscucha) {
      detenerEscucha();
      console.log("Listener detenido.");
    }
  };
}

// Verificar si hay un usuario autenticado
function verificarSesion() {
  const user = sessionStorage.getItem("user");

  if (user) {
    // El usuario está autenticado, muestra su nombre o información
    const usuario = JSON.parse(user);
    console.log("Usuario autenticado:", usuario.email);
    console.log(usuario);
    // document.getElementById("bienvenida").innerHTML =
    //   "Bienvenido, " + usuario.email;
  } else {
    // El usuario no está autenticado, redirige al login
    console.log("Usuario no autenticado");
    // window.location.href = "/login"; // Redirige a la página de login
  }
}

function cerrarModal() {
  document.addEventListener("DOMContentLoaded", () => {
    // Seleccionar el botón de cierre del modal
    let body = document.querySelector("body");
    const closeModalButton = document.querySelector(".modal__close");

    // Verificar si el botón existe antes de añadir el evento
    if (closeModalButton) {
      closeModalButton.addEventListener("click", () => {
        const modal = document.querySelector("#modal");
        modal.style.display = "none"; // Ocultar el modal
        body.classList.remove("no-scroll");
      });
    }

    // También puedes cerrar el modal haciendo clic fuera del contenido
    const modal = document.querySelector("#modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none"; // Ocultar el modal si se hace clic fuera
          body.classList.remove("no-scroll");
        }
      });
    }
  });
}

function loader() {
  document.addEventListener("DOMContentLoaded", () => {
    // Seleccionar el modal
    const loadingModal = document.getElementById("loading-modal");
    console.log("Carga la funcion");
    // Ocultar el modal
    if (loadingModal) {
      console.log("Existe el loadingModal");
      setTimeout(() => {
        loadingModal.classList.add("hidden");
      }, 1500); // Agrega un retraso para que el usuario vea el loader
    } else {
      console.log("No existe el loadingModal");
    }
  });
}

function gestionarCambioRuta() {
  if (window.location.pathname !== "/") {
    console.log("Saliendo de la ruta '/', deteniendo escucha...");
    if (detenerEscuchaRealtime) {
      detenerEscuchaRealtime(); // Detener la escucha
      detenerEscuchaRealtime = null; // Limpiar la referencia
    }
  }
}

function redirectToCrud() {
  const plus = document.querySelector(".plusIcon");
  plus.addEventListener("click", (event) => {
    window.location.href = "/crud";
  });
}

function main() {
  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  console.log("datos: ", storedUser);

  let detenerEscuchaRealtime;
  let detenerEscuchaFirestore;
  menuUsuario(storedUser);
  // Verificar si el usuario está en la página /login
  if (storedUser) {
    detallesPerfil(firestore, storedUser);
  }

  metaDatos(database);
  verificarSesion();
  setupNavbarMenuAnimation();
  cerrarModal();
  loader();
  if (window.location.pathname === "/login") {
    loginjs();
    if (storedUser) {
      window.location.href = "/";
    }
  }

  // Escucha cambios en el historial de navegación
  window.addEventListener("popstate", gestionarCambioRuta);

  // Opcional: Para detectar enlaces o navegaciones manuales
  window.addEventListener("hashchange", gestionarCambioRuta);
  redirectToCrud();

  if (window.location.pathname === "/crud") {
    // Inicializar TinyMCE en el textarea
    tinymce.init({
      selector: "#contenidoCurso",
      plugins: "lists link image",
      toolbar: "undo redo | bold italic | bullist numlist | link image",
    });
  }
}

main();
