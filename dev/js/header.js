export function toggleHeaderOnScroll() {
    let lastScrollTop = 0;
    const header = document.querySelector("header");

    window.addEventListener("scroll", function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // Desplazamiento hacia abajo
            header.style.transform = "translateY(-140%)"; // Oculta el header
            console.log("scrollTop: " + scrollTop);
            console.log("lastScrollTop: " + lastScrollTop);
        } else {
            // Desplazamiento hacia arriba
            header.style.transform = "translateY(0)"; // Muestra el header
            console.log("scrollTop: " + scrollTop);
            console.log("lastScrollTop: " + lastScrollTop);
        }
        console.log("");
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Previene valores negativos
    });
}

export function manageHeaderSpacer() {
    const header = document.querySelector("header");
    const spacer = document.getElementById("header-spacer");
    const headerHeight = header.offsetHeight;

    function updateSpacerHeight() {
        // Detecta si el header está en la cima o en el 90% superior de la ventana
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop <= headerHeight * 0.5) {
            // Header está en la cima, aplica la altura del espaciador
            spacer.style.height = `calc(${headerHeight}px + 10px)`;
        } else {
            // El header ya no está en la cima, reduce la altura del espaciador
            spacer.style.height = "0";
        }
    }

    // Escucha el evento de desplazamiento para ajustar el espaciador sin interferir con el header
    window.addEventListener("scroll", updateSpacerHeight);
    // Llama a la función una vez para inicializar el estado correcto al cargar la página
    updateSpacerHeight();
}
