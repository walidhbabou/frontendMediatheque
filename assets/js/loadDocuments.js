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
                        <button class="btn btn-sm btn-primary me-2" onclick="editDocument(${doc.id})">Modifier</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDocument(${doc.document_id})">Supprimer</button>
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
        fetch(`http://localhost:8080/Mediatheque/Document/getAllDocuments`)
        .then(response => response.json())
        .then(documents => {
            const doc = documents.find(d => d.id_document === id);
            if (doc) {
                console.log('Document sélectionné pour modification:', doc); // Log du document sélectionné
                document.getElementById('edit-title').value = doc.titre;
                document.getElementById('edit-type').value = doc.type;
                document.getElementById('edit-price').value = doc.prix;
                document.getElementById('edit-consultable').value = doc.consultable ? 'Oui' : 'Non';
                document.getElementById('edit-empruntable').value = doc.empruntable ? 'Oui' : 'Non';
                document.getElementById('edit-quantity').value = doc.quantite;
                document.getElementById('edit-available-quantity').value = doc.quantite_disponible;
                document.getElementById('edit-id').value = doc.document_id; // Utiliser doc.id
                editFormContainer.style.display = 'block';
            } else {
                console.error('Document non trouvé pour l\'ID:', id); // Log si le document n'est pas trouvé
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du document:', error); // Log en cas d'erreur
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
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Réponse de l\'API en cas d\'erreur:', text); // Log de la réponse en cas d'erreur
                    throw new Error(`Erreur HTTP ! Status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Réponse de l\'API après mise à jour:', data); // Log de la réponse de l'API
            editFormContainer.style.display = 'none';
            loadDocuments();
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du document:', error); 
            loadDocuments();

        });
    });

    window.deleteDocument = function(document_id) {
        console.log('ID du document à supprimer:', document_id); // Log de l'ID
        if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            fetch(`http://localhost:8080/Mediatheque/Document/delete/${document_id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Réponse de l\'API en cas d\'erreur:', text); // Log de la réponse en cas d'erreur
                        throw new Error(`Erreur HTTP ! Status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(() => {
                alert('Document supprimé avec succès !');
                loadDocuments(); // Recharger les documents pour afficher les modifications
            })
            .catch(error => {
                console.error('Erreur lors de la suppression du document:', error); // Log en cas d'erreur
                loadDocuments();
            });
        }
    };

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
      console.log('Formulaire de création affiché'); // Log pour débogage
    });
  
    // Masquer le formulaire de création
    cancelCreateButton.addEventListener('click', function () {
      createForm.style.display = 'none';
      console.log('Formulaire de création masqué'); // Log pour débogage
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
          console.log('Réponse du serveur après création :', data); // Log pour débogage
          alert('Document créé avec succès !');
          createForm.style.display = 'none'; // Masquer le formulaire après la création
          loadDocuments(); // Recharger la liste des documents
        })
        .catch(error => {
          console.error('Erreur lors de la création du document :', error); // Log pour débogage
          loadDocuments();

        });});
  });