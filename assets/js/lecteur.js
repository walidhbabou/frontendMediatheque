
const LECTEUR_API = 'http://localhost:8080/Mediatheque/lecteur';
const ABO_API = 'http://localhost:8080/Mediatheque/abo';


document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM chargé, on lance loadLecteurs()...');
  loadLecteurs();
});

function loadLecteurs() {
  console.log('Début du chargement des lecteurs...');

 
  const container = document.getElementById('lecteurs-container');
  if (!container) {
    console.error('Conteneur des lecteurs non trouvé!');
    return;
  }

  container.innerHTML = '';
  fetch(`${LECTEUR_API}/allLecteurs`)
    .then(response => {
      console.log('Réponse reçue:', response);
      if (!response.ok) {
        throw new Error('Erreur réseau lors de la récupération des lecteurs');
      }
      return response.json();
    })
    .then(lecteurs => {
      console.log('Données des lecteurs:', lecteurs);
      const totalLecteursElement = document.getElementById('total-lecteurs');
      if (totalLecteursElement) {
        totalLecteursElement.textContent = lecteurs.length;
      }

      lecteurs.forEach(lecteur => {
        fetch(`${ABO_API}/lecteur/${lecteur.lecteurId}`)
          .then(res => {
            if (res.status === 404) return null;
            if (!res.ok) throw new Error('Erreur réseau lors de la récupération de l’abonnement');
            return res.json();
          })
          .then(abonnement => {
            const card = createLecteurCard(lecteur, abonnement);
            container.appendChild(card);
          })
          .catch(err => {
            console.error('Erreur lors de la récupération de l\'abonnement:', err);
            const card = createLecteurCard(lecteur, null);
            container.appendChild(card);
          });
      });
    })
    .catch(error => {
      console.error('Erreur lors du chargement des lecteurs:', error);
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            Erreur lors du chargement des lecteurs: ${error.message}
          </div>
        </div>
      `;
    });
}

/****************************************
 * Fonction pour créer une carte de lecteur
 ****************************************/
function createLecteurCard(lecteur, abonnement) {
  const template = document.getElementById('lecteur-card-template');
  if (!template) {
    console.error('Template de carte lecteur non trouvé!');
    return document.createElement('div');
  }

  const card = template.content.cloneNode(true);
  const cardElement = card.querySelector('.profile-card');
  
  // Ajouter l'ID du lecteur
  if (cardElement) {
    cardElement.dataset.lecteurId = lecteur.lecteurId;
  }

  // Informations de base du lecteur
  const name = `${lecteur.user?.username || ''} ${lecteur.user?.lastname || ''}`.trim() || 'Sans nom';
  card.querySelector('.lecteur-name').textContent = name;
  card.querySelector('.lecteur-email').textContent = lecteur.user?.email || 'Email non renseigné';

  // Gestion du statut et des informations d'abonnement
  const statusBadge = card.querySelector('.lecteur-status');
  const datesContainer = card.querySelector('.dates-container');
  const statsContainer = card.querySelector('.social-stats');

  if (abonnement) {
    // Lecteur avec abonnement
    if (statusBadge) {
      const isActif = isAbonnementActif(abonnement);
      statusBadge.textContent = isActif ? 'Actif' : 'Expiré';
      statusBadge.className = `badge ${isActif ? 'bg-success' : 'bg-danger'} lecteur-status`;
    }

    // Afficher les dates d'abonnement
    if (datesContainer) {
      datesContainer.style.display = 'block';
      const inscriptionDate = card.querySelector('.abo-date-inscription');
      const expirationDate = card.querySelector('.abo-date-expiration');
      
      if (inscriptionDate) inscriptionDate.textContent = formatDate(abonnement.dateinscription);
      if (expirationDate) expirationDate.textContent = formatDate(abonnement.dateexpiration);
    }

    // Afficher les statistiques
    if (statsContainer) {
      statsContainer.style.display = 'flex';
      // Mettre à jour le solde
      const soldeElement = card.querySelector('.solde-amount');
      if (soldeElement) {
        soldeElement.textContent = `${abonnement.solde || 0} €`;
      }
    }
  } else {
    // Nouveau lecteur sans abonnement
    if (statusBadge) {
      statusBadge.textContent = 'Nouveau lecteur';
      statusBadge.className = 'badge bg-info lecteur-status';
    }

    // Masquer les dates d'abonnement
    if (datesContainer) {
      datesContainer.style.display = 'none';
    }

    // Masquer ou réinitialiser les statistiques
    if (statsContainer) {
      statsContainer.style.display = 'none';
    }
  }

  // Ajouter les écouteurs d'événements pour les boutons
  const deleteBtn = card.querySelector('.delete-profile');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => deleteLecteur(lecteur.lecteurId, name));
  }

  const viewDetailsBtn = card.querySelector('.view-details');
  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener('click', () => viewLecteurDetails(lecteur.lecteurId));
  }

  const editBtn = card.querySelector('.edit-profile');
  if (editBtn) {
    editBtn.addEventListener('click', () => editLecteurProfile(lecteur.lecteurId));
  }

  return card;
}

/****************************************
 * Fonction pour afficher les détails d'un lecteur (Modal)
 ****************************************/
function viewLecteurDetails(lecteurId) {
  console.log('Chargement des détails du lecteur:', lecteurId);

  // Récupérer à nouveau le lecteur (ou la liste) pour avoir les infos à jour
  fetch(`${LECTEUR_API}/allLecteurs`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des lecteurs');
      }
      return response.json();
    })
    .then(lecteurs => {
      const lecteur = lecteurs.find(l => l.lecteurId === lecteurId);
      if (!lecteur) {
        throw new Error('Lecteur non trouvé');
      }

      // Récupérer les abonnements du lecteur
      return fetch(`${ABO_API}/lecteur/${lecteurId}`)
        .then(res => {
          if (res.status === 404) return []; // Pas d'abonnement
          if (!res.ok) {
            throw new Error('Erreur lors du chargement des abonnements');
          }
          return res.json();
        })
        .then(abonnements => {
          showDetailsModal(lecteur, abonnements);
        });
    })
    .catch(error => {
      console.error('Erreur lors du chargement des détails:', error);
      alert(`Erreur lors du chargement des détails: ${error.message}`);
    });
}

/****************************************
 * Fonction pour afficher le modal (Bootstrap)
 ****************************************/
function showDetailsModal(lecteur, abonnements) {
  const modal = document.getElementById('lecteurDetailsModal');
  if (!modal) {
    // Si pas de modal, fallback sur une alerte
    alert('Détails du lecteur:\n' + JSON.stringify(lecteur, null, 2));
    return;
  }

  // Renseigner les champs du modal
  document.getElementById('modal-lecteur-name').textContent =
    `${lecteur.user?.firstname || ''} ${lecteur.user?.lastname || ''}`.trim();
  document.getElementById('modal-lecteur-email').textContent =
    lecteur.user?.email || 'Non renseigné';
  document.getElementById('modal-lecteur-id').textContent =
    lecteur.lecteurId || 'ID inconnu';
  document.getElementById('modal-lecteur-role').textContent =
    lecteur.user?.role?.name || 'Lecteur';

  // Conteneur pour afficher les différents abonnements
  const aboContainer = document.getElementById('abonnement-details');
  if (!abonnements || abonnements.length === 0) {
    aboContainer.innerHTML = `
      <div class="alert alert-warning mb-0">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Aucun abonnement actif pour ce lecteur
      </div>
    `;
  } else {
    // Si l'endpoint renvoie un seul abonnement (pas un tableau), on le convertit en tableau
    const tabAbonnements = Array.isArray(abonnements) ? abonnements : [abonnements];

    aboContainer.innerHTML = tabAbonnements.map(abo => {
      const actif = isAbonnementActif(abo);
      return `
        <div class="abonnement mb-3">
          <div class="status-badge mb-2">
            <span class="badge bg-${actif ? 'success' : 'danger'} p-2">
              ${actif ? 'Abonnement Actif' : 'Abonnement Expiré'}
            </span>
          </div>
          <div class="info-group">
            <p class="mb-1">
              <i class="fas fa-calendar-check text-primary me-2"></i>
              <strong>Inscription:</strong> ${formatDate(abo.dateinscription)}
            </p>
            <p class="mb-1">
              <i class="fas fa-calendar-times text-primary me-2"></i>
              <strong>Expiration:</strong> ${formatDate(abo.dateexpiration)}
            </p>
            <p class="mb-0">
              <i class="fas fa-wallet text-primary me-2"></i>
              <strong>Solde:</strong> ${abo.solde || 0} €
            </p>
          </div>
        </div>
      `;
    }).join('');
  }

  // Ouvrir le modal (Bootstrap 5)
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

/****************************************
 * Fonction pour modifier le lecteur
 ****************************************/
function editLecteurProfile(lecteurId) {
  console.log('Modifier le lecteur:', lecteurId);
  alert(`Fonction non implémentée pour le lecteur ID: ${lecteurId}`);
}

/****************************************
 * Fonction pour supprimer un lecteur
 ****************************************/
function deleteLecteur(lecteurId, lecteurName) {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: `Voulez-vous vraiment supprimer le lecteur ${lecteurName} ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${LECTEUR_API}/delete/${lecteurId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }
        Swal.fire(
          'Supprimé !',
          'Le lecteur a été supprimé avec succès.',
          'success'
        );
        // Recharger la liste
        loadLecteurs();
      })
      .catch(error => {
        console.error('Erreur:', error);
        Swal.fire(
          'Erreur !',
          'Une erreur est survenue lors de la suppression.',
          'error'
        );
      });
    }
  });
}

/****************************************
 * Vérifier si un abonnement est actif
 ****************************************/
function isAbonnementActif(abonnement) {
  if (!abonnement?.dateexpiration) return false;
  return new Date(abonnement.dateexpiration) > new Date();
}

/****************************************
 * Formater une date en FR (dd/mm/yyyy)
 ****************************************/
function formatDate(dateString) {
  if (!dateString) return 'Non renseignée';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
}
