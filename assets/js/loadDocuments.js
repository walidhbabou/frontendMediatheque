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
            // Log de la réponse complète pour le débogage
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
            
            // Vider le tableau existant
            tableBody.innerHTML = '';
            
            // Itérer sur les documents
            documents.forEach(doc => {
                console.log('Traitement du document:', document);
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>
                        <p class="text-xs font-weight-bold mb-0">${doc.document_id || ''}</p>
                    </td>
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
                    <td class="align-middle">
                        <a href="javascript:;" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                            Modifier
                        </a>
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
document.addEventListener('DOMContentLoaded', function() {
    const dashboardContainer = document.getElementById('dashboard-content');
    const role = localStorage.getItem('role'); // Récupère le rôle de l'utilisateur

    let dashboardFile;
    switch (role) {
        case 'ADMIN':
            dashboardFile = '../../pages/lecteur/dashboard-admin.html';
            break;
        case 'LECTEUR':
            dashboardFile = '../../pages/lecteur/dashboard-lecteur.html';
            break;
        case 'EMPLOYEE':
            dashboardFile = '../../pages/lecteur/dashboard-employe.html';
            break;
        default:
            console.error('Unknown role:', role);
            dashboardContainer.innerHTML = '<p class="text-danger p-3">Error: Unknown role</p>';
            return;
    }

    // Charge le tableau de bord correspondant
    fetch(dashboardFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            dashboardContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading dashboard:', error);
            dashboardContainer.innerHTML = '<p class="text-danger p-3">Error loading dashboard content</p>';
        });
});