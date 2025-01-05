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
      fetch(`${apiUrl}/allAbonnement`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors du chargement des abonnements');
          }
          return response.json();
        })
        .then(data => {
          console.log('Données reçues :', data); // Log des données
          abonnementTable.innerHTML = ''; // Vider le tableau
          data.forEach(abonnement => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${abonnement.abonnementId}</td>
              <td>${abonnement.date_expiration}</td>
              <td>${abonnement.date_inscription}</td>
              <td>${abonnement.solde}</td>
              <td>${abonnement.lecteur_id ? abonnement.lecteurId.user.username : 'N/A'}</td>
              <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${abonnement.abonnementId}">Modifier</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${abonnement.abonnementId}">Supprimer</button>
              </td>
            `;
            abonnementTable.appendChild(row);
          });
        })
        .catch(error => {
          console.error('Erreur :', error);
          abonnementTable.innerHTML = '<tr><td colspan="6">Erreur lors du chargement des abonnements</td></tr>';
        });
    }
  
    // Charger tous les lecteurs
    function loadLecteurs() {
      fetch(lecteurApiUrl)
        .then(response => response.json())
        .then(data => {
          // Vider les listes déroulantes
          createLecteurSelect.innerHTML = '';
          editLecteurSelect.innerHTML = '';
  
          // Ajouter une option par défaut
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = 'Sélectionnez un lecteur';
          createLecteurSelect.appendChild(defaultOption.cloneNode(true));
          editLecteurSelect.appendChild(defaultOption.cloneNode(true));
  
          // Remplir les listes déroulantes avec les données des lecteurs
          data.forEach(lecteur => {
            const option = document.createElement('option');
            option.value = lecteur.lecteurId; // Utiliser l'ID du lecteur comme valeur
            option.textContent = `${lecteur.user.username} (${lecteur.user.email})`; // Afficher le nom et l'e-mail du lecteur
            createLecteurSelect.appendChild(option.cloneNode(true));
            editLecteurSelect.appendChild(option.cloneNode(true));
          });
        })
        .catch(error => console.error('Erreur :', error));
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
        lecteurId: lecteurId // Envoyer directement l'ID du lecteur
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
            document.getElementById('edit-date-expiration').value = abonnement.date_expiration;
            document.getElementById('edit-date-inscription').value = abonnement.date_inscription;
            document.getElementById('edit-solde').value = abonnement.solde;
            document.getElementById('edit-lecteur').value = abonnement.lecteur.lecteurId;
            editForm.style.display = 'block';
            createForm.style.display = 'none';
          })
          .catch(error => console.error('Erreur :', error));
      }
    });
  
    document.getElementById('edit-abonnement-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const id = document.getElementById('edit-id').value;
      const formData = {
        date_expiration: document.getElementById('edit-date-expiration').value,
        date_inscription: document.getElementById('edit-date-inscription').value,
        solde: document.getElementById('edit-solde').value,
        lecteurId: document.getElementById('edit-lecteur').value // Envoyer directement l'ID du lecteur
      };
  
      fetch(`${apiUrl}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(response => response.json())
        .then(() => {
          loadAbonnements();
          editForm.style.display = 'none';
        })
        .catch(error => console.error('Erreur :', error));
    });
  
    // Supprimer un abonnement
    abonnementTable.addEventListener('click', function (e) {
      if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
          .then(() => loadAbonnements())
          .catch(error => console.error('Erreur :', error));
      }
    });
  
    // Charger les abonnements et les lecteurs au démarrage
    loadAbonnements();
    loadLecteurs();
  });