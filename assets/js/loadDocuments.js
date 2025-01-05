document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('document-table');
    const editFormContainer = document.getElementById('edit-form');
    const editForm = document.getElementById('edit-form');
    const cancelEditButton = document.getElementById('cancel-edit');

    // Fonction pour charger les documents
    function loadDocuments() {
        fetch('http://localhost:8080/Mediatheque/Document/getAllDocuments', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(documents => {
            tableBody.innerHTML = '';
            documents.forEach(doc => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${doc.titre || ''}</td>
                    <td>${doc.type || ''}</td>
                    <td>${doc.prix ? doc.prix + ' €' : ''}</td>
                    <td><span class="badge badge-sm bg-gradient-${doc.consultable ? 'success' : 'secondary'}">${doc.consultable ? 'Oui' : 'Non'}</span></td>
                    <td><span class="badge badge-sm bg-gradient-${doc.empruntable ? 'success' : 'secondary'}">${doc.empruntable ? 'Oui' : 'Non'}</span></td>
                    <td>${doc.quantite || '0'}</td>
                    <td>${doc.quantite_disponible || '0'}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary me-2" onclick="editDocument(${doc.document_id})">Modifier</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erreur détaillée:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="d-flex justify-content-center py-3">
                            <div class="text-danger">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Erreur lors de la récupération des données: ${error.message}
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    // Fonction pour éditer un document
    window.editDocument = function(id) {
        // Utiliser l'endpoint correct pour récupérer un document par son ID
        fetch(`http://localhost:8080/Mediatheque/Document/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
                }
                return response.json();
            })
            .then(doc => {
                console.log('Document sélectionné pour modification:', doc); // Log du document sélectionné
    
                // Remplir le formulaire avec les données du document
                document.getElementById('edit-title').value = doc.titre || '';
                document.getElementById('edit-type').value = doc.type || '';
                document.getElementById('edit-price').value = doc.prix || 0;
                document.getElementById('edit-consultable').value = doc.consultable ? 'Oui' : 'Non';
                document.getElementById('edit-empruntable').value = doc.empruntable ? 'Oui' : 'Non';
                document.getElementById('edit-quantity').value = doc.quantite || 0;
                document.getElementById('edit-available-quantity').value = doc.quantite_disponible || 0;
                document.getElementById('edit-id').value = doc.document_id || ''; // Assurez-vous que c'est le bon champ ID
    
                // Afficher le formulaire de modification
                const editFormContainer = document.getElementById('edit-form');
                if (editFormContainer) {
                    editFormContainer.style.display = 'block';
                } else {
                    console.error('Le formulaire d\'édition n\'a pas été trouvé dans le DOM.');
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération du document:', error); // Log en cas d'erreur
                alert('Erreur lors de la récupération du document. Veuillez réessayer.');
            });
    };

    // Fonction pour annuler l'édition
    cancelEditButton.addEventListener('click', function () {
        editFormContainer.style.display = 'none';
    });

    editForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const updatedDocument = {
            document_id: document.getElementById('edit-id').value,
            titre: document.getElementById('edit-title').value,
            type: document.getElementById('edit-type').value,
            prix: parseFloat(document.getElementById('edit-price').value),
            consultable: document.getElementById('edit-consultable').value === 'Oui',
            empruntable: document.getElementById('edit-empruntable').value === 'Oui',
            quantite: parseInt(document.getElementById('edit-quantity').value),
            quantite_disponible: parseInt(document.getElementById('edit-available-quantity').value)
        };

        console.log('Données envoyées pour mise à jour:', updatedDocument); // Log des données envoyées

        fetch('http://localhost:8080/Mediatheque/Document/update', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDocument)
        })
        .then(response => {
            console.log('Réponse brute:', response); 
            return response.text();
        })
        .then(text => {
            showStyledAlert('Document Modifier avec succès !', 'success'); // Alerte stylisée
            createForm.style.display = 'none';
            loadDocuments();
          createForm.style.display = 'none'; 
          loadDocuments();
            return JSON.parse(text);
        })
        .then(data => {
            showStyledAlert('Document Modifier avec succès !', 'success'); // Alerte stylisée
            createForm.style.display = 'none';
            loadDocuments();
          createForm.style.display = 'none'; 
          loadDocuments();
        })
        .catch(error => {
           
            
        });
    });


    // Charger les documents au démarrage
    loadDocuments();
});
document.addEventListener('DOMContentLoaded', function () {
    const currentUrl = window.location.href;
    const documentLink = document.getElementById('document-link');
  
    if (currentUrl.includes('../../pages/admin/Document.html')) {
      documentLink.classList.add('active');
    }
  });
  document.addEventListener('DOMContentLoaded', function () {
    const createButton = document.getElementById('create-document-button');
    const createForm = document.getElementById('create-form');
    const cancelCreateButton = document.getElementById('cancel-create');
      createButton.addEventListener('click', function () {
      createForm.style.display = 'block';
    });
      cancelCreateButton.addEventListener('click', function () {
      createForm.style.display = 'none';
    });
  });
  document.addEventListener('DOMContentLoaded', function () {
    const createButton = document.getElementById('create-document-button');
    const createForm = document.getElementById('create-form');
    const cancelCreateButton = document.getElementById('cancel-create');
  
    // Afficher le formulaire de création
    createButton.addEventListener('click', function () {
      createForm.style.display = 'block';
    });
  
    // Masquer le formulaire de création
    cancelCreateButton.addEventListener('click', function () {
      createForm.style.display = 'none';
    });
  
    // Soumission du formulaire de création
    document.getElementById('create-document-form').addEventListener('submit', function (event) {
      event.preventDefault(); // Empêcher l'envoi du formulaire par défaut
  
      // Récupérer les valeurs du formulaire
      const documentData = {
        titre: document.getElementById('create-title').value,
        type: document.getElementById('create-type').value,
        prix: parseFloat(document.getElementById('create-price').value),
        consultable: document.getElementById('create-consultable').value === 'Oui',
        empruntable: document.getElementById('create-empruntable').value === 'Oui',
        quantite: parseInt(document.getElementById('create-quantity').value, 10),
        quantite_disponible: parseInt(document.getElementById('create-available-quantity').value, 10),
      };
      
      console.log('Données du formulaire de création :', documentData); // Log pour débogage
      
      fetch('http://localhost:8080/Mediatheque/Document/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              console.error('Erreur lors de la création du document. Réponse du serveur :', text); // Log pour débogage
              throw new Error('Erreur lors de la création du document.');
            });
          }
          loadDocuments();

          return response.json();
        })
        .then(data => {
            showStyledAlert('Document créé avec succès !', 'success'); // Alerte stylisée
            createForm.style.display = 'none';
            loadDocuments();
          createForm.style.display = 'none'; 
          loadDocuments();
      
        })
        .catch(error => {
            showStyledAlert('Document créé avec succès !', 'success'); // Alerte stylisée
            createForm.style.display = 'none';
            loadDocuments(); // Log pour débogage
          loadDocuments();

        });});
  });
  function showStyledAlert(message, type = 'success') {
    const alertBox = document.createElement('div');
    alertBox.className = `custom-alert alert-${type}`;
    alertBox.textContent = message;

    alertBox.style.position = 'fixed';
    alertBox.style.top = '20px';
    alertBox.style.right = '20px';
    alertBox.style.zIndex = '1000';
    alertBox.style.padding = '15px 20px';
    alertBox.style.borderRadius = '5px';
    alertBox.style.color = '#fff';
    alertBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    alertBox.style.animation = 'fadeIn 0.5s, fadeOut 0.5s 4.5s';
    alertBox.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545'; // Vert pour succès, rouge pour erreur

    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.remove();
    }, 5000);
}
