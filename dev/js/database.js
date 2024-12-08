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
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

/**
 * Escucha cambios en cualquier ruta de la base de datos con un tiempo límite en Firebase Realtime Database.
 * @param {object} database - Instancia de la base de datos Firebase.
 * @param {string} ruta - Ruta específica en la base de datos que se desea escuchar.
 * @param {function} callback - Función de callback para manejar los cambios.
 * @param {number} tiempoLimite - Tiempo límite en milisegundos (por ejemplo, 10 minutos = 600000).
 * @param {boolean} esLista - Indica si los datos son una lista (array) o un objeto con múltiples propiedades.
 */
export function escucharRealtimeConLimite(
  database,
  ruta,
  callback,
  esLista = false,
  tiempoLimite = 3500 // 3.5 segundos por defecto
) {
  const rutaRef = ref(database, ruta);

  // Escuchar los cambios en la ruta
  const listener = onValue(rutaRef, (snapshot) => {
    if (snapshot.exists()) {
      const datos = snapshot.val();

      if (esLista) {
        if (Array.isArray(datos)) {
          // console.log("El dato es un array");
          callback(datos); // Pasa el array completo
        } else if (typeof datos === "object") {
          // console.log("El dato es un objeto", datos);
          callback(datos); // Pasa el objeto completo
        }
      } else {
        console.log("Callback directo");
        callback(ruta, datos); // Para un valor simple
      }
    } else {
      console.warn(`No se encontraron datos en la ruta: ${ruta}`);
    }
  });

  // Finalizar la escucha después del tiempo límite
  setTimeout(() => {
    off(rutaRef);
    // console.log("Escucha de datos cerrada después del tiempo límite.");
    console.log("..");
  }, tiempoLimite);

  // Retornar el listener para cancelarlo manualmente si es necesario
  return listener;
}

/**
 * Escucha cambios en un documento o colección con un tiempo límite en Firebase Firestore.
 * @param {object} database - Instancia de la base de datos Firestore.
 * @param {string} ruta - Ruta específica en Firestore (puede ser un documento o colección).
 * @param {function} callback - Función de callback para manejar los cambios.
 * @param {boolean} esLista - Indica si los datos son una colección o un documento único.
 * @param {number} tiempoLimite - Tiempo límite en milisegundos (por ejemplo, 10 minutos = 600000).
 */
export function escucharFirestoreConLimite(
  database,
  ruta,
  callback,
  esLista = false,
  tiempoLimite = 4000 // 10 minutos por defecto
) {
  let rutaRef;

  // Verificar si la ruta corresponde a un documento o una colección
  const segmentos = ruta.split("/").filter(Boolean);

  if (esLista) {
    // Si es una lista (colección)
    if (segmentos.length % 2 !== 0) {
      // Si tiene un número impar de segmentos, es una colección
      rutaRef = collection(database, ruta);
    } else {
      throw new Error(
        `La ruta "${ruta}" es inválida para una colección. Debe tener un número impar de segmentos.`
      );
    }
  } else {
    // Si es un documento único
    if (segmentos.length % 2 === 0) {
      // Si tiene un número par de segmentos, es un documento
      rutaRef = doc(database, ruta);
    } else {
      throw new Error(
        `La ruta "${ruta}" es inválida para un documento. Debe tener un número par de segmentos.`
      );
    }
  }

  // Escuchar los cambios en el documento o colección
  const unsubscribe = onSnapshot(
    rutaRef,
    (snapshot) => {
      try {
        if (esLista) {
          // Si es una colección, recorrer los documentos
          const datos = [];
          if (!snapshot.empty) {
            snapshot.forEach((doc) => {
              if (doc.id === "default") return; // Ignorar entradas con clave "default"
              datos.push({ id: doc.id, ...doc.data() });
            });
          } else {
            console.log(`La colección en la ruta: ${ruta} está vacía.`);
          }
          callback(ruta, datos);
        } else {
          // Si es un documento único
          if (snapshot.exists()) {
            callback(ruta, snapshot.data());
          } else {
            console.log(`No se encontró el documento en la ruta: ${ruta}`);
          }
        }
      } catch (error) {
        console.error(
          `Error al procesar el snapshot de la ruta ${ruta}:`,
          error
        );
      }
    },
    (error) => {
      console.error(`Error al escuchar cambios en la ruta ${ruta}:`, error);
    }
  );

  // Finalizar la escucha después del tiempo límite
  setTimeout(() => {
    unsubscribe(); // Detener la escucha de Firestore
    // console.log("Escucha de datos cerrada después del tiempo límite.");
    console.log("..");
  }, tiempoLimite);

  // Retornar la función para cancelar la suscripción manualmente si se requiere
  return unsubscribe;
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
export function subirDatosFirestore(database, ruta, datos) {
  const rutaRef = doc(database, ruta);

  // Subir o reemplazar los datos del documento
  setDoc(rutaRef, datos)
    .then(() => {
      console.log(`Datos subidos exitosamente a Firestore en la ruta: ${ruta}`);
    })
    .catch((error) => {
      console.error(
        `Error al subir los datos a Firestore en la ruta ${ruta}:`,
        error
      );
    });
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
