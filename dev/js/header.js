export function toggleHeaderOnScroll() {
    let lastScrollTop = 0;
    const header = document.querySelector("header");

    window.addEventListener("scroll", function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // Desplazamiento hacia abajo
            header.style.transform = "translateY(-100%)"; // Oculta el header
        } else {
            // Desplazamiento hacia arriba
            header.style.transform = "translateY(0)"; // Muestra el header
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Previene valores negativos
    });
}
