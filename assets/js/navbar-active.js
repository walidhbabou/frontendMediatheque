document.addEventListener("DOMContentLoaded", function () {
  // Sélectionner tous les liens de la navbar
  const navLinks = document.querySelectorAll(".nav-link");

  // Ajouter un écouteur d'événements à chaque lien
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      // Retirer la classe 'active' de tous les liens
      navLinks.forEach((l) => l.classList.remove("active"));

      // Ajouter la classe 'active' au lien cliqué
      this.classList.add("active");

      // Sauvegarder l'état actif dans le localStorage
      localStorage.setItem("activeNavItem", this.getAttribute("href"));
    });

    // Vérifier si ce lien correspond à la page actuelle
    const currentPage = window.location.pathname;
    const linkPage = link.getAttribute("href");

    if (currentPage.includes(linkPage)) {
      // Retirer la classe 'active' de tous les liens
      navLinks.forEach((l) => l.classList.remove("active"));
      // Ajouter la classe 'active' au lien correspondant
      link.classList.add("active");
    }
  });

  // Restaurer l'état actif au chargement de la page
  const activeNavItem = localStorage.getItem("activeNavItem");
  if (activeNavItem) {
    const activeLink = document.querySelector(`a[href="${activeNavItem}"]`);
    if (activeLink) {
      navLinks.forEach((l) => l.classList.remove("active"));
      activeLink.classList.add("active");
    }
  }
});
