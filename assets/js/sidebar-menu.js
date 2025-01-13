document.addEventListener('DOMContentLoaded', function() {
    // Charger le menu si nécessaire
    if (!document.querySelector('.sidenav')) {
        fetch('/pages/Employe/components/sidebar.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('sidebar-container').innerHTML = html;
                initializeSidebar();
            });
    } else {
        initializeSidebar();
    }
});

function initializeSidebar() {
    // Gestion des menus déroulants
    const dropdownMenus = document.querySelectorAll('[data-bs-toggle="collapse"]');
    dropdownMenus.forEach(menu => {
        menu.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-bs-target');
            const targetElement = document.querySelector(targetId);
            
            // Fermer tous les autres menus
            document.querySelectorAll('.collapse').forEach(collapse => {
                if (collapse.id !== targetId.substring(1)) {
                    collapse.classList.remove('show');
                }
            });
            
            // Basculer le menu actuel
            targetElement.classList.toggle('show');
            
            // Mettre à jour l'icône de la flèche
            const arrow = this.querySelector('.ni-bold-down');
            if (arrow) {
                arrow.style.transform = targetElement.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    });

    // Marquer le lien actif
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
            const parentCollapse = link.closest('.collapse');
            if (parentCollapse) {
                parentCollapse.classList.add('show');
            }
        }
    });
}

// Ajouter le style pour l'animation de la flèche
const style = document.createElement('style');
style.textContent = `
    .ni-bold-down {
        transition: transform 0.3s ease;
        display: inline-block;
    }
`;
document.head.appendChild(style); 