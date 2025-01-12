document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:8080/Mediatheque/abo'; // URL de l'API pour les abonnements
    const lecteurApiUrl = 'http://localhost:8080/Mediatheque/lecteur/allLecteurs'; // URL de l'API pour les lecteurs
    const abonnementTable = document.getElementById('abonnement-table');
    const createForm = document.getElementById('create-form');
    const editForm = document.getElementById('edit-form');
    const createButton = document.getElementById('create-abonnement-button');
    const cancelCreateButton = document.getElementById('cancel-create');
    const cancelEditButton = document.getElementById('cancel-edit');
    const createLecteurSelect = document.getElementById('create-lecteur');
    const editLecteurSelect = document.getElementById('edit-lecteur');
    const editAbonnementForm = document.getElementById('edit-abonnement-form');
  
    // Afficher le formulaire de création
    createButton.addEventListener('click', () => {
      createForm.style.display = 'block';
      editForm.style.display = 'none';
    });
  
    // Masquer le formulaire de création
    cancelCreateButton.addEventListener('click', () => {
      createForm.style.display = 'none';
    });
  
    // Masquer le formulaire de modification
    cancelEditButton.addEventListener('click', () => {
      editForm.style.display = 'none';
    });
  
    // Charger tous les abonnements
    function loadAbonnements() {
      fetch(`${apiUrl}/All`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors du chargement des abonnements');
          }
          return response.json();
        })
        .then(data => {
          console.log('Données reçues des abonnements:', data);
          abonnementTable.innerHTML = '';
          
          if (!data || data.length === 0) {
            abonnementTable.innerHTML = '<tr><td colspan="6">Aucun abonnement trouvé</td></tr>';
            return;
          }

          data.forEach(abonnement => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${abonnement.lecteurName || ''} ${abonnement.lecteurlastName || ''}</td>
              <td>${formatDateForDisplay(abonnement.dateinscription)}</td>
              <td>${formatDateForDisplay(abonnement.dateexpiration)}</td>
              <td>${abonnement.solde || 0} €</td>
              <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${abonnement.abonnementId}">
                  <i class="fas fa-edit"></i> Modifier
                </button>
                
              </td>
            `;
            abonnementTable.appendChild(row);
          });
        })
        .catch(error => {
          console.error('Erreur lors du chargement:', error);
          abonnementTable.innerHTML = `
            <tr>
              <td colspan="6" class="text-danger">
                Erreur lors du chargement des abonnements: ${error.message}
              </td>
            </tr>
          `;
        });
    }
  
    // Charger tous les lecteurs
    function loadLecteurs() {
      fetch(lecteurApiUrl)
        .then(response => response.json())
        .then(data => {
          createLecteurSelect.innerHTML = '';
          editLecteurSelect.innerHTML = '';
  
          // Option par défaut
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = 'Sélectionnez un lecteur';
          createLecteurSelect.appendChild(defaultOption.cloneNode(true));
          editLecteurSelect.appendChild(defaultOption.cloneNode(true));
  
          data.forEach(lecteur => {
            const option = document.createElement('option');
            option.value = lecteur.lecteurId;
            // Afficher le nom et prénom du lecteur
            option.textContent = `${lecteur.user.username} ${lecteur.user.lastname}`;
            createLecteurSelect.appendChild(option.cloneNode(true));
            editLecteurSelect.appendChild(option.cloneNode(true));
          });
        })
        .catch(error => console.error('Erreur lors du chargement des lecteurs:', error));
    }
  
    // Créer un abonnement
    document.getElementById('create-abonnement-form').addEventListener('submit', function (e) {
      e.preventDefault();
  
      const lecteurId = document.getElementById('create-lecteur').value;
      if (!lecteurId) {
        alert('Veuillez sélectionner un lecteur.');
        return;
      }
  
      const formData = {
        date_expiration: document.getElementById('create-date-expiration').value,
        date_inscription: document.getElementById('create-date-inscription').value,
        solde: document.getElementById('create-solde').value,
        lecteurId: parseInt(lecteurId) // Convertir en nombre
      };
  
      fetch(`${apiUrl}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors de la création de l\'abonnement');
          }
          return response.json();
        })
        .then(() => {
          loadAbonnements();
          createForm.style.display = 'none';
        })
        .catch(error => {
          console.error('Erreur :', error);
          alert('Erreur lors de la création de l\'abonnement. Veuillez vérifier les données.');
        });
    });
  
    // Modifier un abonnement
    abonnementTable.addEventListener('click', function (e) {
      const editButton = e.target.closest('.edit-btn');
      if (editButton) {
        const id = editButton.getAttribute('data-id');
        console.log('ID de l\'abonnement à modifier:', id);

        // Récupérer les données de l'abonnement
        fetch(`${apiUrl}/${id}`)
          .then(response => {
            if (!response.ok) throw new Error('Erreur lors de la récupération des données');
            return response.json();
          })
          .then(abonnement => {
            console.log('Données de l\'abonnement:', abonnement);
            
            // Remplir le formulaire
            document.getElementById('edit-id').value = abonnement.abonnementId;
            document.getElementById('edit-date-expiration').value = formatDateForInput(abonnement.dateexpiration);
            document.getElementById('edit-date-inscription').value = formatDateForInput(abonnement.dateinscription);
            document.getElementById('edit-solde').value = abonnement.solde;
            document.getElementById('edit-lecteur').value = abonnement.lecteurId;

            // Afficher le formulaire de modification
            if (editForm) {
              editForm.style.display = 'block';
              if (createForm) createForm.style.display = 'none';
              
              // Faire défiler jusqu'au formulaire
              editForm.scrollIntoView({ behavior: 'smooth' });
            } else {
              console.error('Le formulaire de modification n\'a pas été trouvé');
            }
          })
          .catch(error => {
            console.error('Erreur:', error);
            alert('Erreur lors de la récupération des données de l\'abonnement');
          });
      }
    });
  
    // Gestionnaire pour le bouton Annuler
    if (cancelEditButton) {
      cancelEditButton.addEventListener('click', function() {
        editForm.style.display = 'none';
        if (createForm) createForm.style.display = 'block';
      });
    }
  
    // Gestionnaire pour le formulaire de modification
    document.getElementById('edit-abonnement-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = {
        abonnementId: document.getElementById('edit-id').value,
        dateexpiration: document.getElementById('edit-date-expiration').value,
        dateinscription: document.getElementById('edit-date-inscription').value,
        solde: document.getElementById('edit-solde').value,
        lecteurId: document.getElementById('edit-lecteur').value
      };

      const id = formData.abonnementId;
      
      fetch(`${apiUrl}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
        return response.json();
      })
      .then(data => {
        console.log('Mise à jour réussie:', data);
        editForm.style.display = 'none';
        loadAbonnements(); // Recharger la liste
        alert('Abonnement mis à jour avec succès');
      })
      .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour de l\'abonnement');
      });
    });
  
    // Supprimer un abonnement
    abonnementTable.addEventListener('click', function (e) {
      if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        fetch(`${apiUrl}/abonnement/${id}`, { method: 'DELETE' })
          .then(() => loadAbonnements())
          .catch(error => console.error('Erreur :', error));
      }
    });
  
    // Charger les abonnements et les lecteurs au démarrage
    loadAbonnements();
    loadLecteurs();
  
    // Fonction utilitaire pour formater la date
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }
  
    // Fonction utilitaire pour formater les dates pour l'affichage
    function formatDateForDisplay(dateString) {
      if (!dateString) return 'Non défini';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';
        
        return new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
      } catch (error) {
        console.error('Erreur de formatage de date:', error);
        return 'Date invalide';
      }
    }
      function formatDateForInput(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        // Format YYYY-MM-DD pour les inputs date
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Erreur de formatage de date pour input:', error);
        return '';
      }
    }
  });