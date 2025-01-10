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
          console.log('Données reçues des abonnements:', data); // Pour déboguer
          abonnementTable.innerHTML = '';
          data.forEach(abonnement => {
            console.log('Données du lecteur:', { 
                name: abonnement.Username, 
                lastName: abonnement.lastName
            }); // Pour déboguer
            
            const row = document.createElement('tr');
            const lecteurNom = abonnement.lecteurName || 'Non défini';
            const lecteurPrenom = abonnement.lecteurlastName || 'Non défini';
            
            row.innerHTML = `
              <td>${abonnement.abonnementId}</td>
              <td>${formatDate(abonnement.date_expiration)}</td>
              <td>${formatDate(abonnement.date_inscription)}</td>
              <td>${abonnement.solde}</td>
              <td>${lecteurNom} ${lecteurPrenom}</td>
              <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${abonnement.abonnementId}">Modifier</button>
              </td>
            `;
            abonnementTable.appendChild(row);
          });
        })
        .catch(error => {
          console.error('Erreur lors du chargement:', error);
          abonnementTable.innerHTML = '<tr><td colspan="6">Erreur lors du chargement des abonnements</td></tr>';
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
      if (e.target.classList.contains('edit-btn')) {
        const id = e.target.getAttribute('data-id');
        fetch(`${apiUrl}/${id}`)
          .then(response => response.json())
          .then(abonnement => {
            document.getElementById('edit-id').value = abonnement.abonnementId;
            document.getElementById('edit-date-expiration').value = formatDate(abonnement.date_expiration);
            document.getElementById('edit-date-inscription').value = formatDate(abonnement.date_inscription);
            document.getElementById('edit-solde').value = abonnement.solde;
            document.getElementById('edit-lecteur').value = abonnement.lecteurId;

            // Mettre à jour le select avec la bonne valeur
            const editLecteurSelect = document.getElementById('edit-lecteur');
            if (editLecteurSelect) {
              editLecteurSelect.value = abonnement.lecteurId;
            }

            editForm.style.display = 'block';
          })
          .catch(error => console.error('Erreur :', error));
      }
    });
  
    // Gérer l'annulation de la modification
    cancelEditButton.addEventListener('click', function() {
      editForm.style.display = 'none';
    });
  
    // Gérer la soumission du formulaire de modification
    editAbonnementForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const id = document.getElementById('edit-id').value;
      const formData = {
        date_expiration: document.getElementById('edit-date-expiration').value,
        date_inscription: document.getElementById('edit-date-inscription').value,
        solde: parseInt(document.getElementById('edit-solde').value),
        lecteurId: parseInt(document.getElementById('edit-lecteur').value)
      };
  
      fetch(`${apiUrl}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors de la modification');
          }
          return response.json();
        })
        .then(() => {
          editForm.style.display = 'none';
          loadAbonnements();
        })
        .catch(error => {
          console.error('Erreur :', error);
          alert('Erreur lors de la modification de l\'abonnement');
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
  });