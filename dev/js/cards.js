export function mostrarCards(data) {
  // console.log("Datos recibidos en mostrarCards:", data);

  if (!data || typeof data !== "object") {
    console.error("Datos inválidos recibidos:", data);
    return;
  }
  // console.log(data);
  // console.log("");
  // console.log("");
  // console.log(data[key]);
  // console.log("Datos recibidos en mostrarCards:", data);

  // Seleccionar el contenedor de las cards
  const listCards = document.querySelector(".cards_list");
  const limiteCaracteres = 220;

  // Limpiar el contenedor antes de agregar nuevas cards
  listCards.innerHTML = "";

  // Iterar sobre las claves del objeto
  for (key in data) {
    if (key === "default") continue; // Ignorar entradas con clave "default"

    const curso = data[key];

    // Crear elementos HTML
    let tarjetaCurso = document.createElement("div");
    let img = document.createElement("img");
    let tarjetaContenido = document.createElement("div");
    let tituloCurso = document.createElement("div");
    let descripcionCurso = document.createElement("div");
    let bottom = document.createElement("div");
    let botonCurso = document.createElement("button");
    let precio = document.createElement("div");
    let precioAnterior = document.createElement("div");
    let cuadroPrecio = document.createElement("div");
    let tieneDescuento = false;

    // Asignar clases CSS
    tarjetaCurso.classList.add("card");
    img.classList.add("card__image");
    tarjetaContenido.classList.add("card__content");
    tituloCurso.classList.add("card__title");
    descripcionCurso.classList.add("card__description");
    botonCurso.classList.add("card__button");
    precio.classList.add("card__price");
    bottom.classList.add("card__bottom");
    precioAnterior.classList.add("card__priceBefore");
    cuadroPrecio.classList.add("card__cuadroPrecio");

    // Configurar propiedades de los elementos
    // img.src = curso.imagen || data["default"]?.imagen || ""; // Imagen del curso o default
    tituloCurso.innerHTML = curso.titulo || "Título no disponible";

    descripcionCurso.innerHTML =
      curso.descripcion && curso.descripcion.length > limiteCaracteres
        ? curso.descripcion.slice(0, limiteCaracteres) + "..."
        : curso.descripcion || "Sin descripción";

    botonCurso.innerHTML = "Leer más";

    if (curso.precioActual) {
      let precioActual = parseFloat(curso.precioActual) || 0;
      let precioAnteriorValor = parseFloat(curso.precioAnterior) || 0;

      precio.innerHTML = `$${precioActual.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      if (precioAnteriorValor > precioActual) {
        tieneDescuento = true;
        precioAnterior.innerHTML = `$${precioAnteriorValor.toLocaleString(
          "es-AR",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}`;
      }
    } else {
      precio.innerHTML =
        curso.precioActual === "default"
          ? data["default"]?.precioGratis || "Gratis"
          : data["default"]?.precioNada || "Sin precio";
    }

    // Construir la tarjeta
    listCards.appendChild(tarjetaCurso);

    tarjetaCurso.appendChild(img);
    tarjetaCurso.appendChild(tarjetaContenido);

    tarjetaContenido.appendChild(tituloCurso);
    tarjetaContenido.appendChild(descripcionCurso);
    tarjetaContenido.appendChild(bottom);

    bottom.appendChild(botonCurso);
    botonCurso.addEventListener("click", () => {
      mostrarDetallesCurso(curso); // Pasar los datos de la tarjeta seleccionada
    });

    bottom.appendChild(cuadroPrecio);

    if (tieneDescuento) {
      cuadroPrecio.appendChild(precioAnterior);
    }
    cuadroPrecio.appendChild(precio);
  }
}

export function mostrarDetallesCurso(curso) {
  // Seleccionar el modal
  let body = document.querySelector("body");
  const modal = document.querySelector("#modal");
  const modalContent = modal.querySelector(".modal__content");
  body.classList.toggle("no-scroll");
  // Llenar el contenido del modal con los detalles del curso
  modalContent.innerHTML = `
  <div class="no-scroll">
    <h2>${curso.titulo || "Título no disponible"}</h2>
    <img src="${curso.imagen || ""}" alt="${curso.titulo || "Curso"}" />
    <p>${curso.descripcion || "Sin descripción disponible"}</p>
    <p><strong>Precio:</strong> ${
      curso.precioActual
        ? `$${parseFloat(curso.precioActual).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "Gratis"
    }</p>
  </div>
  `;

  // Mostrar el modal
  modal.style.display = "block";
}
