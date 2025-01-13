// Création du nouveau fichier pour gérer le dashboard employé
document.addEventListener('DOMContentLoaded', function() {
    // Vérification de l'authentification
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/pages/sign-in.html';
        return;
    }

    // Chargement des statistiques
    loadDashboardStats();
    
    // Gestionnaire d'événements pour les boutons d'action rapide
    setupActionButtons();

    // Gestion des menus déroulants
    const dropdownToggles = document.querySelectorAll('[data-bs-toggle="collapse"]');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('data-bs-target'));
            
            // Fermer les autres menus
            document.querySelectorAll('.collapse.show').forEach(menu => {
                if (menu !== target) {
                    menu.classList.remove('show');
                }
            });
            
            // Ouvrir/fermer le menu cliqué
            if (target) {
                target.classList.toggle('show');
            }
        });
    });

    // Marquer le lien actif et ouvrir le menu parent
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            // Si c'est un élément du sous-menu, ouvrir le menu parent
            const parentCollapse = link.closest('.collapse');
            if (parentCollapse) {
                parentCollapse.classList.add('show');
                // Ajouter la classe active au bouton parent
                const parentToggle = document.querySelector(`[data-bs-target="#${parentCollapse.id}"]`);
                if (parentToggle) {
                    parentToggle.classList.add('active');
                }
            }
        }
    });
});

async function loadDashboardStats() {
    try {
        const response = await fetch('http://votre-api/dashboard/stats', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
        
        const stats = await response.json();
        
        // Mise à jour des statistiques dans l'interface
        document.getElementById('total-documents').textContent = stats.totalDocuments || 0;
        document.getElementById('total-readers').textContent = stats.activeReaders || 0;
        document.getElementById('current-loans').textContent = stats.currentLoans || 0;
        document.getElementById('total-reservations').textContent = stats.totalReservations || 0;
        
        // Ajouter le chargement des statistiques des bénévoles
        await loadVolunteerStats();
        
        // Charger les statistiques supplémentaires si on est sur la page correspondante
        if (window.location.pathname.includes('stats-documents')) {
            await loadDocumentStats();
        }
        if (window.location.pathname.includes('documents-populaires')) {
            await loadPopularDocuments();
        }
        if (window.location.pathname.includes('rapport-retards')) {
            await loadOverdueReport();
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        // Afficher un message d'erreur à l'utilisateur
    }
}

async function checkLoanConditions(readerId) {
    try {
        const response = await fetch(`http://votre-api/readers/${readerId}/loan-conditions`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la vérification des conditions');
        
        const conditions = await response.json();
        
        // Vérifier les conditions
        if (!conditions.subscriptionValid) {
            throw new Error('La cotisation du lecteur n\'est pas à jour');
        }
        
        if (conditions.currentLoans >= 5) {
            throw new Error('Le lecteur a atteint le maximum de 5 emprunts');
        }
        
        return true;
        
    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message);
        return false;
    }
}

async function loadVolunteerStats() {
    try {
        const response = await fetch('http://votre-api/volunteers/stats', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques des bénévoles');
        
        const stats = await response.json();
        
        // Mise à jour des statistiques des bénévoles dans l'interface
        document.getElementById('active-volunteers').textContent = stats.activeVolunteers || 0;
        document.getElementById('scheduled-volunteers').textContent = stats.scheduledVolunteers || 0;
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function manageVolunteerRights(volunteerId, rights) {
    try {
        const response = await fetch(`http://votre-api/volunteers/${volunteerId}/rights`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rights)
        });

        if (!response.ok) throw new Error('Erreur lors de la mise à jour des droits');
        
        alert('Droits mis à jour avec succès');
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour des droits');
    }
}

async function scheduleVolunteer(volunteerId, schedule) {
    try {
        const response = await fetch(`http://votre-api/volunteers/${volunteerId}/schedule`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(schedule)
        });

        if (!response.ok) throw new Error('Erreur lors de la planification');
        
        alert('Période planifiée avec succès');
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la planification');
    }
}

function setupActionButtons() {
    // Nouveau Document
    // document.querySelector('.btn-primary').addEventListener('click', async () => {
    //     window.location.href = '/pages/nouveau-document.html';
    // });

    // Nouveau Lecteur
    document.querySelector('.btn-info').addEventListener('click', () => {
        window.location.href = '/pages/nouveau-lecteur.html';
    });

    // Nouveau Prêt
    document.querySelector('.btn-success').addEventListener('click', async () => {
        const readerId = prompt('Entrez l\'ID du lecteur :');
        if (readerId && await checkLoanConditions(readerId)) {
            window.location.href = `/pages/nouveau-pret.html?readerId=${readerId}`;
        }
    });

    // Nouveau Bénévole
    document.querySelector('.btn-warning').addEventListener('click', async () => {
        window.location.href = '/pages/nouveau-benevole.html';
    });
}

async function loadDocumentStats() {
    try {
        const response = await fetch('http://votre-api/stats/documents', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques des documents');
        
        const stats = await response.json();
        
        // Mise à jour du graphique des documents par catégorie
        if (document.getElementById('documentsByCategory')) {
            new Chart(document.getElementById('documentsByCategory'), {
                type: 'pie',
                data: {
                    labels: stats.categories.map(cat => cat.name),
                    datasets: [{
                        data: stats.categories.map(cat => cat.count),
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ]
                    }]
                }
            });
        }
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function loadPopularDocuments() {
    try {
        const response = await fetch('http://votre-api/stats/popular-documents', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors du chargement des documents populaires');
        
        const popularDocs = await response.json();
        
        // Mise à jour du graphique des documents populaires
        if (document.getElementById('popularDocuments')) {
            new Chart(document.getElementById('popularDocuments'), {
                type: 'bar',
                data: {
                    labels: popularDocs.map(doc => doc.title),
                    datasets: [{
                        label: 'Nombre d\'emprunts',
                        data: popularDocs.map(doc => doc.loanCount),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function loadOverdueReport() {
    try {
        const response = await fetch('http://votre-api/stats/overdue', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors du chargement du rapport des retards');
        
        const overdueData = await response.json();
        
        // Mise à jour du tableau des retards
        const tableBody = document.querySelector('#overdueTable tbody');
        if (tableBody) {
            tableBody.innerHTML = overdueData.map(item => `
                <tr>
                    <td>${item.document.title}</td>
                    <td>${item.reader.name}</td>
                    <td>${new Date(item.dueDate).toLocaleDateString()}</td>
                    <td>${item.daysOverdue} jours</td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
    }
} 