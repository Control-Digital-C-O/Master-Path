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
} from "./user.js";
// DataBase
import {
  escucharRealtimeConLimite,
  escucharFirestoreConLimite,
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
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      iniciarSesionCorreo(auth, email, password);
    });
    document
      .getElementById("googleLoginButton")
      .addEventListener("click", () => {
        iniciarSesionGoogle(auth);
      });
  }
}

function metaDatos(database) {
  const header = document.querySelector(".header");
  const home = document.querySelector(".home");

  if (header) {
    escucharFirestoreConLimite(
      firestore,
      "MasterPath/pagina",
      nombrePagina,
      false,
      2500
    );
    if (home) {
      escucharRealtimeConLimite(database, "/cursos", mostrarCards, true);
    }
  }
}

// Verificar si hay un usuario autenticado
function verificarSesion() {
  const user = sessionStorage.getItem("user");

  if (user) {
    // El usuario está autenticado, muestra su nombre o información
    const usuario = JSON.parse(user);
    console.log("Usuario autenticado:", usuario.email);
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

function main() {
  const storedUser = JSON.parse(sessionStorage.getItem("user"));

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
}

main();
