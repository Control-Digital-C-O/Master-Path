export function nombrePagina (data) {
	//Elementos
	const titulo = document.getElementById('logo');
	const favicon = document.getElementById('favicon');
	
	// Limpieza del Elemento
	titulo.innerHTML = '';
	document.title = '';

	// Crear elementos internos
	const contenido = document.createElement('div');
	const img = document.createElement('img');

	// Agregar atributos
	contenido.textContent = data.nombre;
	img.src = data.logo;
	img.alt = "logo de MasterPath";
	document.title = data.nombre;
	favicon.href = data.logo;

	// Agregar clases y estilos
	img.classList.add('logo-header-img');
	contenido.classList.add('empresa_container');
	
	// Agregar elementos al contenedor principal
	titulo.appendChild(img);
	titulo.appendChild(contenido);
}