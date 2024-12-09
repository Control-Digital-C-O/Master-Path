import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { subirDatosFirestore } from "./database";

// Función para iniciar sesión con correo y contraseña
export function iniciarSesionCorreo(auth, email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Sesión iniciada:", user);
      // Almacenar la información en sessionStorage
      sessionStorage.setItem("user", JSON.stringify(user));

      alert("¡Bienvenido " + user.email + "!");
      window.location.href = "/";
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión: " + error.message);
    });
}

// Función para iniciar sesión con Google
export async function iniciarSesionGoogle(auth, db) {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // console.log("Sesión iniciada con Google:", user);

    // Almacenar la información del usuario en sessionStorage
    sessionStorage.setItem("user", JSON.stringify(user));
    let user3 = JSON.parse(sessionStorage.getItem("user"));
    // console.log("Sesión iniciada con Google2:", user3);

    // Verificar si el usuario ya está registrado en la base de datos
    const emailUnico = await buscarUsuarios(
      db,
      "usuarios",
      "email",
      user3.email,
      true
    );

    if (!emailUnico) {
      // Si el usuario no está registrado, crear una cuenta
      await crearUsuario(db, user3);
      console.log("Cuenta creada para el usuario:", user3.email);
    } else {
      console.log("El usuario ya está registrado:", emailUnico);
    }

    alert("¡Bienvenido " + user3.displayName + "!");
    window.location.href = "/";
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
    alert("Error al iniciar sesión con Google: " + error.message);
  }
}

// Función para manejar el formulario de registro
export async function registrarUsuario(auth, name, email, password, db) {
  try {
    // Validar los campos antes de intentar crear la cuenta
    if (!email || !password || !name) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    // Crear un nuevo usuario con correo y contraseña
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    user.displayName = name;
    // Actualizar el perfil del usuario con el nombre
    sessionStorage.setItem("user", JSON.stringify(user));
    let user3 = JSON.parse(sessionStorage.getItem("user"));
    await crearUsuario(db, user3);
    console.log("Cuenta creada para el usuario:", user3.email);

    console.log("Usuario creado con éxito:", user3);
    alert("Exito al registrarse");
    window.location.href = "/"; // Redirigir a la página principal
  } catch (error) {
    console.error("Error al crear la cuenta:", error.message);

    // Manejo de errores
    if (error.code === "auth/email-already-in-use") {
      alert("Este correo ya está en uso. Por favor, use otro.");
    } else if (error.code === "auth/weak-password") {
      alert("La contraseña debe tener al menos 6 caracteres.");
    } else {
      alert("Error al crear la cuenta: " + error.message);
    }
  }
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

export function buscarUsuariosNoAsync(
  db,
  collectionName,
  field,
  value,
  singleResult = true
) {
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

  // Aquí, en lugar de usar await, devolvemos la promesa directamente
  return getDocs(userQuery)
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        if (singleResult) {
          // Devuelve el primer documento encontrado
          const firstDoc = querySnapshot.docs[0];
          const userData = firstDoc.data();
          // console.log("Primer usuario encontrado:", userData);
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
    })
    .catch((error) => {
      console.error("Error al buscar usuarios:", error.message);
      return null;
    });
}

export function detallesPerfil(db, storedUser) {
  // Referencias al modal y botones
  const modal = document.getElementById("modalPerfil");
  const btnAbrirModal = document.getElementById("btnAbrirModal");
  const cerrarModal = document.getElementById("cerrarModal");
  const btnCerrar = document.getElementById("btnCerrar");

  // Abrir el modal
  btnAbrirModal.addEventListener("click", async () => {
    try {
      const datos = await buscarUsuarios(
        db,
        "usuarios",
        "email",
        storedUser.email,
        true
      );

      if (datos) {
        // Mostrar los datos en el modal
        document.getElementById("nombreUsuarioModal").textContent =
          datos.nombre || "Nombre no disponible";
        document.getElementById("emailUsuarioModal").textContent =
          datos.email || "Email no disponible";
        document.getElementById("rolUsuarioModal").textContent =
          datos.rol || "Rol no disponible";
        document.getElementById("nombreDeUsuarioModal").textContent =
          datos.usuario || "Usuario no disponible";
      } else {
        console.log("No se encontraron datos del usuario.");
      }

      modal.style.display = "flex"; // Muestra el modal
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  });

  // Cerrar el modal (botón cerrar y fondo)
  const cerrarModalHandler = () => {
    modal.style.display = "none";
  };

  cerrarModal.addEventListener("click", cerrarModalHandler);
  btnCerrar.addEventListener("click", cerrarModalHandler);

  // Cerrar el modal al hacer clic fuera del contenido
  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      cerrarModalHandler();
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

export function irCrud() {
  window.location.href = "/crud";
}

async function crearUsuario(database, usuarioData) {
  try {
    // Verificar si el email ya está registrado
    const emailUnico = await buscarUsuarios(
      database,
      "usuarios",
      "email",
      usuarioData.email,
      true
    );

    if (emailUnico) {
      console.log("El email de usuario ya está en uso.");
      return;
    }

    const nuevoId = await runTransaction(database, async (transaction) => {
      const contadorRef = doc(database, "MasterPath/config");
      const contadorSnap = await transaction.get(contadorRef);

      let contadorActual = 0;
      if (contadorSnap.exists()) {
        contadorActual = contadorSnap.data().idContador || 0;
      }

      // Incrementar el contador
      const nuevoContador = contadorActual + 1;
      transaction.update(contadorRef, { idContador: nuevoContador });

      return `U${nuevoContador}`; // Nuevo ID generado
    });
    // Datos predeterminados
    const datosUsuario = {
      email: usuarioData.email,
      genero: usuarioData.genero || "nada", // Por defecto, "nada"
      nombre: usuarioData.displayName || "Usuario Anónimo",
      usuario:
        nuevoId +
        "@" +
        (usuarioData.displayName.replace(/\s/g, "").slice(0, 6) || "user"),
      rol: "Estudiante",
    };

    // Subir datos del nuevo usuario
    const ruta = `usuarios/${nuevoId}`;
    await subirDatosFirestore(database, ruta, datosUsuario);
    console.log("Usuario creado exitosamente:", datosUsuario);
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw new Error("No se pudo registrar el usuario.");
  }
}

// Leer los datos de un usuario
export async function obtenerUsuario(database, usuario) {
  const datosUsuario = await buscarUsuarios(
    database,
    "usuarios",
    "usuario",
    usuario
  );

  if (datosUsuario) {
    console.log("Usuario encontrado:", datosUsuario);
  } else {
    console.log("Usuario no encontrado.");
  }
  return datosUsuario;
}

// Actualizar los datos de un usuario
export async function actualizarUsuario(database, usuario, nuevosDatos) {
  const ruta = `usuarios/${usuario}`;
  await subirDatosFirestore(database, ruta, nuevosDatos);
  console.log("Usuario actualizado:", nuevosDatos);
}

// Eliminar un usuario
export async function eliminarUsuario(database, usuario) {
  const ruta = `usuarios/${usuario}`;
  const usuarioExistente = await buscarUsuarios(
    database,
    "usuarios",
    "usuario",
    usuario
  );

  if (usuarioExistente) {
    const rutaRef = doc(database, ruta);
    await deleteDoc(rutaRef);
    console.log(`Usuario ${usuario} eliminado.`);
  } else {
    console.log("El usuario no existe y no se puede eliminar.");
  }
}
