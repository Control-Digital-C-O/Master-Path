import {
  getDatabase,
  ref,
  onValue,
  off,
  set,
  update,
  remove,
} from "firebase/database";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

/**
 * Obtiene datos de Firebase utilizando caché para una carga más rápida.
 * Si no hay datos en el caché, los descarga y los almacena.
 * @param {object} database - Instancia de la base de datos Firebase.
 * @param {string} ruta - Ruta específica en la base de datos que se desea consultar.
 * @param {boolean} esLista - Indica si los datos son una lista (array) o un objeto con múltiples propiedades.
 * @returns {Promise<object>} - Retorna los datos obtenidos (desde el caché o Firebase).
 */
export async function obtenerDatosConCache(database, ruta, esLista = false) {
  const cacheKey = `cache_${ruta}`; // Clave para el caché
  const cachedData = localStorage.getItem(cacheKey);

  // Si hay datos en el caché, devolverlos inmediatamente
  if (cachedData) {
    try {
      const parsedData = JSON.parse(cachedData);
      console.log(`Datos obtenidos del caché para la ruta: ${ruta}`);
      return parsedData;
    } catch (error) {
      console.error("Error al analizar los datos del caché:", error);
    }
  }

  // Si no hay caché, descarga los datos desde Firebase
  try {
    const rutaRef = ref(database, ruta);
    const snapshot = await get(rutaRef);

    if (snapshot.exists()) {
      const datos = snapshot.val();

      // Guarda los datos en el caché
      localStorage.setItem(cacheKey, JSON.stringify(datos));

      console.log(
        `Datos descargados y almacenados en el caché para la ruta: ${ruta}`
      );
      return datos;
    } else {
      console.warn(`No se encontraron datos en la ruta: ${ruta}`);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener datos desde Firebase:", error);
    throw error;
  }
}

/**
 * Escucha cambios en tiempo real en una ruta de Firebase y actualiza el caché.
 * @param {object} database - Instancia de la base de datos Firebase.
 * @param {string} ruta - Ruta específica en la base de datos que se desea escuchar.
 * @param {function} callback - Función de callback para manejar los cambios.
 * @param {boolean} esLista - Indica si los datos son una lista (array) o un objeto con múltiples propiedades.
 * @param {number} tiempoLimite - Tiempo límite en milisegundos para mantener la escucha activa.
 * @returns {function} - Retorna una función para detener la escucha manualmente.
 */
export function escucharActualizaciones(
  database,
  ruta,
  callback,
  esLista = false,
  tiempoLimite = 600000 // 10 minutos por defecto
) {
  const rutaRef = ref(database, ruta);

  // Configura el listener
  const listener = onValue(rutaRef, (snapshot) => {
    if (snapshot.exists()) {
      const nuevosDatos = snapshot.val();
      const cacheActual = localStorage.getItem(`cache_${ruta}`);
      const datosEnCache = cacheActual ? JSON.parse(cacheActual) : null;

      // Compara los datos antes de actualizarlos
      if (JSON.stringify(nuevosDatos) !== JSON.stringify(datosEnCache)) {
        localStorage.setItem(`cache_${ruta}`, JSON.stringify(nuevosDatos));
        console.log("Cache actualizado:", nuevosDatos);

        // Llama al callback solo si hay cambios
        callback(esLista ? Object.values(nuevosDatos) : nuevosDatos);
      } else {
        console.log("Realtime: Los datos no han cambiado, no update cache.");
      }
    } else {
      console.warn(`No se encontraron datos en la ruta: ${ruta}`);
    }
  });

  // Finaliza la escucha después del tiempo límite
  const timeout = setTimeout(() => {
    off(rutaRef);
    console.log("Escucha de datos cerrada después del tiempo límite.");
  }, tiempoLimite);

  // Retorna una función para detener el listener manualmente
  return () => {
    off(rutaRef);
    clearTimeout(timeout);
    console.log("Escucha de datos detenida manualmente.");
  };
}

/**
 * Obtiene datos de Firestore con caché local.
 * @param {object} database - Instancia de Firestore.
 * @param {string} ruta - Ruta específica en Firestore (puede ser un documento o colección).
 * @param {boolean} esLista - Indica si los datos son una colección o un documento único.
 * @returns {Promise<any>} - Los datos obtenidos (ya sea del caché o Firestore).
 */
export async function obtenerDatosFirestoreConCache(
  database,
  ruta,
  esLista = false
) {
  const cacheKey = `cache_firestore_${ruta}`;
  const cacheData = localStorage.getItem(cacheKey);

  if (cacheData) {
    // Si hay caché, devolverlo inmediatamente
    // console.log("Datos obtenidos del caché:", JSON.parse(cacheData));
    return JSON.parse(cacheData);
  }

  // Si no hay caché, descargar los datos desde Firestore
  let datos = null;
  const segmentos = ruta.split("/").filter(Boolean);

  try {
    if (esLista) {
      if (segmentos.length % 2 !== 0) {
        // Si la ruta es de una colección (debe tener un número impar de segmentos)
        const snapshot = await getDocs(collection(database, ruta));
        datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } else {
        throw new Error("Ruta inválida para una colección.");
      }
    } else {
      if (segmentos.length % 2 === 0) {
        // Si la ruta es de un documento (debe tener un número par de segmentos)
        const snapshot = await getDoc(doc(database, ruta));
        datos = snapshot.exists() ? snapshot.data() : null;
      } else {
        throw new Error("Ruta inválida para un documento.");
      }
    }

    // Almacenar los datos en caché
    if (datos) {
      localStorage.setItem(cacheKey, JSON.stringify(datos));
      console.log("Datos descargados y almacenados en caché:", datos);
    }
  } catch (error) {
    console.error(
      `Error al obtener datos de Firestore en la ruta ${ruta}:`,
      error
    );
  }

  return datos;
}

/**
 * Escucha actualizaciones en Firestore y sincroniza el caché si hay cambios.
 * @param {object} database - Instancia de Firestore.
 * @param {string} ruta - Ruta específica en Firestore (puede ser un documento o colección).
 * @param {function} callback - Función de callback para manejar los cambios.
 * @param {boolean} esLista - Indica si los datos son una colección o un documento único.
 * @returns {function} - Función para detener la escucha.
 */
export function escucharActualizacionesFirestore(
  database,
  ruta,
  callback,
  esLista = false
) {
  const cacheKey = `cache_firestore_${ruta}`;
  let rutaRef;

  const segmentos = ruta.split("/").filter(Boolean);

  if (esLista) {
    if (segmentos.length % 2 !== 0) {
      rutaRef = collection(database, ruta);
    } else {
      throw new Error("Ruta inválida para una colección.");
    }
  } else {
    if (segmentos.length % 2 === 0) {
      rutaRef = doc(database, ruta);
    } else {
      throw new Error("Ruta inválida para un documento.");
    }
  }

  // Configurar el listener
  const unsubscribe = onSnapshot(
    rutaRef,
    (snapshot) => {
      let nuevosDatos = null;

      if (esLista) {
        nuevosDatos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else {
        nuevosDatos = snapshot.exists() ? snapshot.data() : null;
      }

      // Leer los datos actuales del caché
      const cacheActual = localStorage.getItem(cacheKey);
      const datosEnCache = cacheActual ? JSON.parse(cacheActual) : null;

      // Compara los datos antes de actualizarlos
      if (JSON.stringify(nuevosDatos) !== JSON.stringify(datosEnCache)) {
        localStorage.setItem(cacheKey, JSON.stringify(nuevosDatos));
        console.log("Caché actualizado con datos en tiempo real:", nuevosDatos);

        // Llama al callback solo si hay cambios
        callback(nuevosDatos);
      } else {
        console.log("Firestore: Los datos no han cambiado, no update cache.");
      }
    },
    (error) => {
      console.error(
        `Error al escuchar cambios en Firestore para la ruta ${ruta}:`,
        error
      );
    }
  );

  return unsubscribe; // Retornar la función para cancelar la suscripción
}

// Update de los datos (Crud)
/**
 * Sube o actualiza datos en Firebase Realtime Database.
 * @param {object} database - Instancia de la base de datos Firebase.
 * @param {string} ruta - Ruta específica en la base de datos donde se suben los datos.
 * @param {object} datos - Datos a subir o actualizar.
 */
export function subirDatosRealtime(database, ruta, datos) {
  const rutaRef = ref(database, ruta);

  // Subir o actualizar los datos en la ruta
  set(rutaRef, datos)
    .then(() => {
      console.log(`Datos subidos exitosamente a la ruta: ${ruta}`);
    })
    .catch((error) => {
      console.error(`Error al subir los datos a la ruta ${ruta}:`, error);
    });
}

/**
 * Actualiza datos específicos en Firebase Realtime Database.
 * @param {object} database - Instancia de la base de datos Firebase.
 * @param {string} ruta - Ruta específica donde se actualizarán los datos.
 * @param {object} datos - Datos a actualizar.
 */
export function actualizarDatosRealtime(database, ruta, datos) {
  const rutaRef = ref(database, ruta);

  // Actualizar los datos en la ruta
  update(rutaRef, datos)
    .then(() => {
      console.log(`Datos actualizados exitosamente en la ruta: ${ruta}`);
    })
    .catch((error) => {
      console.error(`Error al actualizar los datos en la ruta ${ruta}:`, error);
    });
}

/**
 * Elimina los datos de una ruta en Firebase Realtime Database.
 * @param {object} database - Instancia de la base de datos Firebase.
 * @param {string} ruta - Ruta específica a eliminar.
 */
export function eliminarDatosRealtime(database, ruta) {
  const rutaRef = ref(database, ruta);

  // Eliminar los datos en la ruta
  remove(rutaRef)
    .then(() => {
      console.log(`Datos eliminados exitosamente de la ruta: ${ruta}`);
    })
    .catch((error) => {
      console.error(`Error al eliminar los datos en la ruta ${ruta}:`, error);
    });
}

/**
 * Sube un nuevo documento o reemplaza un documento existente en Firestore.
 * @param {object} database - Instancia de la base de datos Firestore.
 * @param {string} ruta - Ruta donde se subirá el documento (ej. "coleccion/ID").
 * @param {object} datos - Datos a subir o reemplazar.
 */
export async function subirDatosFirestore(database, ruta, datos) {
  const rutaRef = doc(database, ruta);

  try {
    // Esperar que se complete la operación de subir datos
    await setDoc(rutaRef, datos);
    console.log(`Datos subidos exitosamente a Firestore en la ruta: ${ruta}`);
  } catch (error) {
    console.error(
      `Error al subir los datos a Firestore en la ruta ${ruta}:`,
      error
    );
  }
}

/**
 * Actualiza datos específicos de un documento en Firestore.
 * @param {object} database - Instancia de la base de datos Firestore.
 * @param {string} ruta - Ruta donde se actualizarán los datos (ej. "coleccion/ID").
 * @param {object} datos - Datos a actualizar.
 */
export function actualizarDatosFirestore(database, ruta, datos) {
  const rutaRef = doc(database, ruta);

  // Actualizar los datos del documento
  updateDoc(rutaRef, datos)
    .then(() => {
      console.log(
        `Datos actualizados exitosamente en Firestore en la ruta: ${ruta}`
      );
    })
    .catch((error) => {
      console.error(
        `Error al actualizar los datos en Firestore en la ruta ${ruta}:`,
        error
      );
    });
}

/**
 * Elimina un documento en Firestore.
 * @param {object} database - Instancia de la base de datos Firestore.
 * @param {string} ruta - Ruta del documento que se eliminará (ej. "coleccion/ID").
 */
export function eliminarDatosFirestore(database, ruta) {
  const rutaRef = doc(database, ruta);

  // Eliminar el documento
  deleteDoc(rutaRef)
    .then(() => {
      console.log(
        `Documento eliminado exitosamente en Firestore en la ruta: ${ruta}`
      );
    })
    .catch((error) => {
      console.error(
        `Error al eliminar el documento en Firestore en la ruta ${ruta}:`,
        error
      );
    });
}

/**
 * Agrega un nuevo documento a una colección en Firestore.
 * @param {object} database - Instancia de la base de datos Firestore.
 * @param {string} coleccion - Ruta de la colección (ej. "coleccion").
 * @param {object} datos - Datos a agregar como nuevo documento.
 */
export function agregarDocumentoAcoleccion(database, coleccion, datos) {
  const coleccionRef = collection(database, coleccion);

  // Agregar un nuevo documento a la colección
  addDoc(coleccionRef, datos)
    .then((docRef) => {
      console.log(
        `Documento agregado exitosamente a la colección: ${coleccion}, ID: ${docRef.id}`
      );
      alert(
        `Documento agregado exitosamente a la colección: ${coleccion}, ID: ${docRef.id}`
      );
    })
    .catch((error) => {
      console.error(
        `Error al agregar el documento a la colección ${coleccion}:`,
        error
      );
    });
}
