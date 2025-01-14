class SidebarLoader {
    static async loadSidebar() {
        try {
            const response = await fetch('/components/sidebar.html');
            const sidebarContent = await response.text();
            
            // Insérer le contenu du sidebar
            document.getElementById('sidebar-container').innerHTML = sidebarContent;
            
            // Marquer l'élément actif du menu
            this.setActiveMenuItem();
        } catch (error) {
            console.error('Erreur lors du chargement du sidebar:', error);
        }
    }

    static setActiveMenuItem() {
        // Obtenir le chemin actuel
        const currentPath = window.location.pathname;
        
        // Retirer la classe active de tous les liens
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Trouver et activer le lien correspondant au chemin actuel
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
}

// Charger le sidebar quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    SidebarLoader.loadSidebar();
}); 