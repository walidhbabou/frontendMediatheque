document.addEventListener('DOMContentLoaded', function () {
    const empruntTable = document.getElementById('emprunt-table');
    const createEmpruntButton = document.getElementById('create-emprunt-button');
    const createEmpruntFormDiv = document.getElementById('create-emprunt-form');
    const createEmpruntForm = document.getElementById('create-emprunt-form-data');
    const editEmpruntForm = document.getElementById('edit-emprunt-form-data');
    const editEmpruntFormDiv = document.getElementById('edit-emprunt-form');
  
    // Références aux selects
    const createAbonnementSelect = document.getElementById('create-abonnement');
    const createDocumentSelect = document.getElementById('create-document');
    const editAbonnementSelect = document.getElementById('edit-abonnement');
    const editDocumentSelect = document.getElementById('edit-document');
  
    // Boutons d'annulation
    const cancelCreateButton = document.getElementById('cancel-create-emprunt');
    const cancelEditButton = document.getElementById('cancel-edit-emprunt');
  
    // URLs des APIs corrigées selon vos contrôleurs
    const EMPRUNT_API = 'http://localhost:8080/api/emprunts';
    const DOCUMENT_API = 'http://localhost:8080/Mediatheque/Document/getAllDocuments';
    const LECTEUR_API = 'http://localhost:8080/Mediatheque/lecteur/allLecteurs';
  
    function loadEmprunts() {
      fetch(`${EMPRUNT_API}/all`)
        .then(response => response.json())
        .then(data => {
          console.log('Emprunts reçus:', data);
          empruntTable.innerHTML = '';
          data.forEach(emprunt => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${formatDate(emprunt.date_emprunt)}</td>
              <td>${formatDate(emprunt.date_retour)}</td>
              <td>${emprunt.lecteurName || ''} ${emprunt.lecteurlastName || ''}</td>
              <td>${emprunt.document?.titre || ''} - ${emprunt.document?.type || ''}</td>
              <td>
                <button class="btn btn-sm btn-warning edit-emprunt" data-id="${emprunt.emprunt_id}">Modifier</button>
              </td>
            `;
            empruntTable.appendChild(row);
          });
        })
        .catch(error => console.error('Erreur :', error));
    }
  
    // Afficher le formulaire de création
    createEmpruntButton.addEventListener('click', function() {
      createEmpruntFormDiv.style.display = 'block';
    });
  
    // Annuler la création
    cancelCreateButton.addEventListener('click', function() {
      createEmpruntFormDiv.style.display = 'none';
      createEmpruntForm.reset();
    });
  
    // Annuler la modification
    cancelEditButton.addEventListener('click', function() {
      editEmpruntFormDiv.style.display = 'none';
      editEmpruntForm.reset();
    });
  
    // Gérer la création d'un nouvel emprunt
    createEmpruntForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const lecteurId = document.getElementById('create-abonnement').value;
      
      if (!lecteurId) {
        alert('Veuillez sélectionner un lecteur');
        return;
      }

      fetch(`http://localhost:8080/Mediatheque/abo/lecteur/${lecteurId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération de l\'abonnement');
          }
          return response.json();
        })
        .then(abonnement => {
          if (!abonnement || !abonnement.abonnementId) {
            throw new Error('Aucun abonnement valide trouvé pour ce lecteur');
          }

          // Formatage des données selon la structure attendue par le backend
          const formData = {
            date_emprunt: document.getElementById('create-date-emprunt').value,
            date_retour: document.getElementById('create-date-retour').value,
            abonnement: {
              abonnementId: abonnement.abonnementId
            },
            document: {
              document_id: parseInt(document.getElementById('create-document').value)
            }
          };

          console.log('Données à envoyer:', formData);

          return fetch(`${EMPRUNT_API}/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
        })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(text || 'Erreur lors de la création de l\'emprunt');
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Emprunt créé avec succès:', data);
          loadEmprunts();
          createEmpruntForm.reset();
          createEmpruntFormDiv.style.display = 'none';
          alert('Emprunt créé avec succès');
        })
        .catch(error => {
          console.error('Erreur:', error);
          alert(error.message || 'Erreur lors de la création de l\'emprunt. Veuillez vérifier que le lecteur a un abonnement valide.');
        });
    });
  
    // Gérer la modification d'un emprunt
    editEmpruntForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('edit-emprunt-id').value;
      const lecteurId = document.getElementById('edit-abonnement').value;

      if (!lecteurId) {
        alert('Veuillez sélectionner un lecteur');
        return;
      }

      fetch(`http://localhost:8080/Mediatheque/abo/lecteur/${lecteurId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération de l\'abonnement');
          }
          return response.json();
        })
        .then(abonnement => {
          if (!abonnement || !abonnement.abonnementId) {
            throw new Error('Aucun abonnement valide trouvé pour ce lecteur');
          }

          // Formatage des données selon la structure attendue par le backend
          const formData = {
            date_emprunt: document.getElementById('edit-date-emprunt').value,
            date_retour: document.getElementById('edit-date-retour').value,
            abonnement: {
              abonnementId: abonnement.abonnementId
            },
            document: {
              document_id: parseInt(document.getElementById('edit-document').value)
            }
          };

          console.log('Données de modification à envoyer:', formData);

          return fetch(`${EMPRUNT_API}/update/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
        })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(text || 'Erreur lors de la modification de l\'emprunt');
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Emprunt modifié avec succès:', data);
          loadEmprunts();
          editEmpruntForm.reset();
          editEmpruntFormDiv.style.display = 'none';
          alert('Emprunt modifié avec succès');
        })
        .catch(error => {
          console.error('Erreur:', error);
          alert(error.message || 'Erreur lors de la modification de l\'emprunt. Veuillez vérifier que le lecteur a un abonnement valide.');
        });
    });
  
    // Charger les documents dans les selects
    function loadDocuments() {
      console.log('Début du chargement des documents');
      fetch(DOCUMENT_API)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Documents reçus:', data);
          
          // Vérifier que les éléments select existent
          const createDocumentSelect = document.getElementById('create-document');
          const editDocumentSelect = document.getElementById('edit-document');
          
          if (!createDocumentSelect || !editDocumentSelect) {
            console.error('Les éléments select pour les documents n\'ont pas été trouvés');
            return;
          }

          // Nettoyer les selects
          createDocumentSelect.innerHTML = '';
          editDocumentSelect.innerHTML = '';

          // Ajouter l'option par défaut
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = 'Sélectionnez un document';
          createDocumentSelect.appendChild(defaultOption.cloneNode(true));
          editDocumentSelect.appendChild(defaultOption.cloneNode(true));

          // Ajouter les options pour chaque document
          data.forEach(doc => {
            console.log('Document à ajouter:', doc);
            const option = document.createElement('option');
            option.value = doc.document_id;
            
            // Utiliser la bonne casse pour la propriété type
            option.textContent = `${doc.titre} - ${doc.type} - ${doc.prix}€`;
            
            if (doc.quantite_disponible <= 0) {
              option.disabled = true;
              option.textContent += ' (Non disponible)';
            } else {
              option.textContent += ` (${doc.quantite_disponible} disponible(s))`;
            }
            
            createDocumentSelect.appendChild(option.cloneNode(true));
            editDocumentSelect.appendChild(option.cloneNode(true));
          });
          
          console.log('Nombre de documents chargés:', data.length);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des documents:', error);
          const errorOption = document.createElement('option');
          errorOption.textContent = 'Erreur de chargement des documents';
          
          const createDocumentSelect = document.getElementById('create-document');
          const editDocumentSelect = document.getElementById('edit-document');
          
          if (createDocumentSelect) {
            createDocumentSelect.innerHTML = '';
            createDocumentSelect.appendChild(errorOption.cloneNode(true));
          }
          
          if (editDocumentSelect) {
            editDocumentSelect.innerHTML = '';
            editDocumentSelect.appendChild(errorOption.cloneNode(true));
          }
        });
    }
  
    function loadLecteurs() {
      fetch(LECTEUR_API)
        .then(response => response.json())
        .then(data => {
          console.log('Lecteurs reçus:', data);
          [createAbonnementSelect, editAbonnementSelect].forEach(select => {
            select.innerHTML = '<option value="">Sélectionnez un lecteur</option>';
            data.forEach(lecteur => {
              const option = document.createElement('option');
              option.value = lecteur.lecteurId; // Utiliser l'ID du lecteur
              option.textContent = `${lecteur.user.username} ${lecteur.user.lastname}`;
              select.appendChild(option);
            });
          });
        })
        .catch(error => console.error('Erreur chargement lecteurs:', error));
    }
  
    // Gérer le clic sur le bouton modifier
    empruntTable.addEventListener('click', function(e) {
      if (e.target.classList.contains('edit-emprunt')) {
        const id = e.target.getAttribute('data-id');
        fetch(`${EMPRUNT_API}/${id}`)
          .then(response => response.json())
          .then(emprunt => {
            console.log('Emprunt à modifier:', emprunt);
            
            document.getElementById('edit-emprunt-id').value = emprunt.emprunt_id;
            document.getElementById('edit-date-emprunt').value = formatDateForInput(emprunt.date_emprunt);
            document.getElementById('edit-date-retour').value = formatDateForInput(emprunt.date_retour);
            
            if (emprunt.abonnementId) {
              editAbonnementSelect.value = emprunt.abonnementId;
            }
            
            if (emprunt.document?.document_id) {
              editDocumentSelect.value = emprunt.document.document_id;
            }
            
            editEmpruntFormDiv.style.display = 'block';
          })
          .catch(error => console.error('Erreur :', error));
      }
    });
  
    // Fonction utilitaire pour formater les dates
    function formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    }
  
    // Initialisation
    loadEmprunts();
    loadDocuments();
    loadLecteurs();
  });