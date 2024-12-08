import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Función para iniciar sesión con correo y contraseña
export function iniciarSesionCorreo(auth, email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Sesión iniciada:", user);
      alert("¡Bienvenido " + user.email + "!");

      // Almacenar la información en sessionStorage
      sessionStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/home";
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión: " + error.message);
    });
}

// Función para iniciar sesión con Google
export function iniciarSesionGoogle(auth) {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Sesión iniciada con Google:", user);
      alert("¡Bienvenido " + user.displayName + "!");
    })
    .catch((error) => {
      console.error("Error al iniciar sesión con Google:", error);
      alert("Error al iniciar sesión con Google: " + error.message);
    });
}

export function menuUsuario(storedUser) {
  const menu = document.querySelector(".menu-usuario");
  let opcion1 = document.createElement("span");
  let opcion2 = document.createElement("span");
  let lista1 = document.createElement("li");
  let lista2 = document.createElement("li");
  let boton1 = document.createElement("button");
  let boton2 = document.createElement("button");

  opcion1.classList.add("textUserMenu");
  opcion2.classList.add("textUserMenu");
  menu.innerHTML = "";
  if (storedUser) {
    opcion1.innerHTML = "Perfil";
    opcion2.innerHTML = "Cerrar Sesion";

    menu.appendChild(lista1);
    lista1.appendChild(boton1);
    boton1.appendChild(opcion1);
    menu.appendChild(lista2);
    lista2.appendChild(boton2);
    boton2.appendChild(opcion2);
  } else {
    opcion1.innerHTML = "Iniciar Sesion";
    opcion2.innerHTML = "";

    menu.appendChild(lista1);
    lista1.appendChild(boton1);
    boton1.appendChild(opcion1);
  }
}

export async function datosUsuario(db, storedUser) {
  try {
    // Verifica si los parámetros son válidos
    if (!db) throw new Error("La instancia de Firestore no está inicializada.");
    if (!storedUser || !storedUser.email)
      throw new Error("El usuario almacenado no es válido.");

    // Consulta Firestore para buscar el usuario por email
    const usuariosRef = collection(db, "usuarios");
    const userQuery = query(
      usuariosRef,
      where("email", "==", storedUser.email)
    );
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log("Datos del usuario:", userData);

        // Asegúrate de que el DOM esté listo antes de modificarlo
        const nombreElem = document.getElementById("nombreUsuario");
        const emailElem = document.getElementById("emailUsuario");

        if (nombreElem && emailElem) {
          nombreElem.textContent = userData.nombre || "Nombre no disponible";
          emailElem.textContent = userData.email;
        } else {
          console.warn(
            "Elementos del DOM no encontrados para mostrar los datos del usuario."
          );
        }
      });
    } else {
      console.error(
        "No se encontró ningún usuario con el email proporcionado."
      );
    }
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error.message);
  }
}
