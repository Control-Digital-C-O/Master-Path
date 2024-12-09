import { getFirestore, collection, addDoc } from "firebase/firestore";

// Función para crear un nuevo curso
async function crearCurso(database) {
  const nombre = document.getElementById("nombreCurso").value;
  const contenido = tinymce.get("contenidoCurso").getContent(); // Obtener contenido de TinyMCE

  if (!nombre || !contenido) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  try {
    const nuevoCursoRef = await addDoc(collection(database, "cursos"), {
      nombre: nombre,
      contenido: contenido,
      fechaCreacion: new Date(),
      autor: "Admin/Profesor", // Aquí se debe almacenar el autor según el rol
    });

    console.log("Curso creado con ID: ", nuevoCursoRef.id);
    alert("Curso creado exitosamente.");
    window.location.href = "/"; // Redirigir al inicio o a la lista de cursos
  } catch (e) {
    console.error("Error al crear el curso: ", e);
    alert("Hubo un error al crear el curso.");
  }
}

// Agregar evento al formulario
document.getElementById("formCurso").addEventListener("submit", (e) => {
  e.preventDefault();
  const database = getFirestore(); // Obtenemos la instancia de Firestore
  crearCurso(database); // Llamamos a la función para crear el curso
});

// Función para leer los cursos
async function leerCursos(database) {
  const querySnapshot = await getDocs(collection(database, "cursos"));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    // Aquí puedes crear dinámicamente una lista de cursos para mostrar
    const curso = doc.data();
    const cursoElement = document.createElement("div");
    cursoElement.innerHTML = `
      <h3>${curso.nombre}</h3>
      <p>${curso.contenido.substring(
        0,
        100
      )}...</p> <!-- Muestra solo un resumen del contenido -->
      <button onclick="editarCurso('${doc.id}')">Editar</button>
      <button onclick="eliminarCurso('${doc.id}')">Eliminar</button>
    `;
    document.getElementById("listaCursos").appendChild(cursoElement);
  });
}

// Llamar a la función para cargar los cursos
const database = getFirestore(); // Obtenemos la instancia de Firestore
leerCursos(database);
