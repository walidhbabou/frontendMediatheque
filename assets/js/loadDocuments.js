document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.getElementById('document-table');
    fetch('http://localhost:8080/Mediatheque/Document/getAllDocuments', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('Réponse reçue:', response.status);
            response.clone().text().then(text => console.log('Réponse brute:', text));
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(documents => {
            console.log('Documents reçus:', documents);
            
            if (!documents || documents.length === 0) {
                console.log('Aucun document reçu');
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="9" class="text-center">
                            <div class="d-flex justify-content-center py-3">
                                <div class="text-info">
                                    Aucun document disponible
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tableBody.innerHTML = '';
            documents.forEach(doc => {
                console.log('Traitement du document:', document);
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>
                        <p class="text-xs font-weight-bold mb-0">${doc.titre || ''}</p>
                    </td>
                    <td>
                        <p class="text-xs font-weight-bold mb-0">${doc.type || ''}</p>
                    </td>
                    <td>
                        <p class="text-xs font-weight-bold mb-0">${doc.prix ? doc.prix + ' €' : ''}</p>
                    </td>
                    <td>
                        <span class="badge badge-sm bg-gradient-${doc.consultable ? 'success' : 'secondary'}">${doc.consultable ? 'Oui' : 'Non'}</span>
                    </td>
                    <td>
                        <span class="badge badge-sm bg-gradient-${doc.empruntable ? 'success' : 'secondary'}">${doc.empruntable ? 'Oui' : 'Non'}</span>
                    </td>
                    <td>
                        <p class="text-xs font-weight-bold mb-0">${doc.quantite || '0'}</p>
                    </td>
                    <td>
                        <p class="text-xs font-weight-bold mb-0">${doc.quantite_disponible || '0'}</p>
                    </td>
                    <td class="text-center">
  <button class="btn btn-sm btn-primary me-2" onclick="editDocument(${doc.id})">Modifier</button>
  <button class="btn btn-sm btn-danger" onclick="deleteDocument(${doc.id})">Supprimer</button>
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
});
document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll('.edit-btn');
    const editFormContainer = document.getElementById('edit-form-container');
    const editForm = document.getElementById('edit-form');
    const cancelEditButton = document.getElementById('cancel-edit');
  
    editButtons.forEach(button => {
      button.addEventListener('click', function () {
        const row = this.closest('tr');
        const cells = row.querySelectorAll('td');
  
        // Remplir le formulaire avec les données de la ligne
        document.getElementById('edit-title').value = cells[0].textContent;
        document.getElementById('edit-type').value = cells[1].textContent;
        document.getElementById('edit-price').value = cells[2].textContent;
        document.getElementById('edit-consultable').value = cells[3].textContent;
        document.getElementById('edit-empruntable').value = cells[4].textContent;
        document.getElementById('edit-quantity').value = cells[5].textContent;
        document.getElementById('edit-available-quantity').value = cells[6].textContent;
  
        // Afficher le formulaire
        editFormContainer.style.display = 'block';
      });
    });
  
    // Gérer l'annulation de la modification
    cancelEditButton.addEventListener('click', function () {
      editFormContainer.style.display = 'none';
    });
  
    // Gérer la soumission du formulaire
    editForm.addEventListener('submit', function (event) {
      event.preventDefault();
  
      // Ici, vous pouvez ajouter le code pour mettre à jour les données dans la base de données
  
      // Masquer le formulaire après la soumission
      editFormContainer.style.display = 'none';
    });
  });