import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
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
      window.location.href = "/";
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

    boton1.id = "btnAbrirModal";
    boton1.classList.add("btn");
    boton2.addEventListener("click", cerrarSesion);

    menu.appendChild(lista1);
    lista1.appendChild(boton1);
    boton1.appendChild(opcion1);
    menu.appendChild(lista2);
    lista2.appendChild(boton2);
    boton2.appendChild(opcion2);
  } else {
    opcion1.innerHTML = "Iniciar Sesion";
    opcion2.innerHTML = "";

    if (window.location.pathname === "/") {
      boton1.addEventListener("click", (event) => {
        window.location.href = "/login";
      });
    }

    menu.appendChild(lista1);
    lista1.appendChild(boton1);
    boton1.appendChild(opcion1);
  }
}

/**
 * Busca usuarios en Firestore según criterios específicos.
 *
 * @param {object} db - Instancia de Firestore.
 * @param {string} collectionName - Nombre de la colección donde buscar.
 * @param {string} field - Campo por el cual buscar (por ejemplo, "email", "username").
 * @param {string|number} value - Valor del campo a buscar.
 * @param {boolean} singleResult - Si es `true`, devuelve el primer resultado encontrado. Si es `false`, devuelve todos los resultados.
 * @returns {Promise<object|array|null>} Datos del usuario encontrado (objeto único o array). Devuelve `null` si no se encuentra nada.
 */
export async function buscarUsuarios(
  db,
  collectionName,
  field,
  value,
  singleResult = true
) {
  try {
    // Validaciones de los parámetros
    if (!db) throw new Error("La instancia de Firestore no está inicializada.");
    if (!collectionName)
      throw new Error("El nombre de la colección no puede estar vacío.");
    if (!field) throw new Error("El campo de búsqueda no puede estar vacío.");
    if (value === undefined || value === null)
      throw new Error("El valor a buscar no puede ser nulo o indefinido.");

    // Construcción de la consulta
    const usuariosRef = collection(db, collectionName);
    const userQuery = query(usuariosRef, where(field, "==", value));
    const querySnapshot = await getDocs(userQuery);

    // Procesar resultados
    if (!querySnapshot.empty) {
      if (singleResult) {
        // Devuelve el primer documento encontrado
        const firstDoc = querySnapshot.docs[0];
        const userData = firstDoc.data();
        console.log("Primer usuario encontrado:", userData);
        return userData;
      } else {
        // Devuelve todos los documentos encontrados
        const allUsers = querySnapshot.docs.map((doc) => doc.data());
        console.log("Todos los usuarios encontrados:", allUsers);
        return allUsers;
      }
    } else {
      console.warn(
        "No se encontraron usuarios con los criterios especificados."
      );
      return null;
    }
  } catch (error) {
    console.error("Error al buscar usuarios:", error.message);
    return null;
  }
}

export function detallesPerfil(db, storedUser) {
  // Referencias al modal y botones
  const modal = document.getElementById("modalPerfil");
  const btnAbrirModal = document.getElementById("btnAbrirModal");
  const cerrarModal = document.getElementById("cerrarModal");

  // Abrir el modal
  btnAbrirModal.addEventListener("click", async () => {
    const datos = await buscarUsuarios(
      db,
      "usuarios",
      "email",
      storedUser.email,
      true
    );

    if (datos) {
      // Muestra los datos en el modal
      document.getElementById("nombreUsuarioModal").textContent =
        datos.nombre || "Nombre no disponible";
      document.getElementById("emailUsuarioModal").textContent =
        datos.email || "Email no disponible";
    } else {
      console.log("error al escribir los datos");
      console.log(datos);
    }

    modal.style.display = "block"; // Muestra el modal
  });

  // Cerrar el modal
  cerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Cierra el modal al hacer clic fuera de él
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}

export function cerrarSesion() {
  const auth = getAuth();

  signOut(auth)
    .then(() => {
      alert("Sesión cerrada correctamente.");
      sessionStorage.clear();
      window.location.href = "/";
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error.message);
    });
}

// Agrega el evento al botón
