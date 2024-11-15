export function mostrarCards(data) {
  //Elementos
  const listCards = document.querySelector(".cards_list");
  const limiteCaracteres = 220;

  //Limpieza
  listCards.innerHTML = "";

  for (let id in data) {
    if (id === "default") continue;
    //Elementos internos
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
    let band = false;

    //Clases
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

    //Propiedades
    if (data[id].imagen) {
      img.src = data[id].imagen;
    } else {
      img.src = data["default"].imagen;
    }
    tituloCurso.innerHTML = data[id].titulo;
    if (data[id].descripcion.length > limiteCaracteres) {
      data[id].descripcion =
        data[id].descripcion.slice(0, limiteCaracteres) + "...";
      descripcionCurso.innerHTML = data[id].descripcion;
    }
    botonCurso.innerHTML = "Leer más";
    //botonCurso.aria-label = 'Leer más sobre este curso';
    switch (data[id].precioActual) {
      case "":
        precio.innerHTML = data["default"].precioNada;
        break;
      case "default":
        precio.innerHTML = data["default"].precioGratis;
        break;
      default:
        let num = parseInt(data[id].precioActual);
        let num2 = parseInt(data[id].precioAnterior);
        precio.innerHTML =
          "$" +
          num.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        if (num < num2) {
          precioAnterior.innerHTML =
            "$" +
            num2.toLocaleString("es-Ar", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          band = true;
        }
    }

    //Principal
    listCards.appendChild(tarjetaCurso);

    tarjetaCurso.appendChild(img);
    tarjetaCurso.appendChild(tarjetaContenido);

    tarjetaContenido.appendChild(tituloCurso);
    tarjetaContenido.appendChild(descripcionCurso);
    tarjetaContenido.appendChild(bottom);

    bottom.appendChild(botonCurso);
    bottom.appendChild(cuadroPrecio);

    if (band) {
      cuadroPrecio.appendChild(precioAnterior);
    }
    cuadroPrecio.appendChild(precio);
  }
}
