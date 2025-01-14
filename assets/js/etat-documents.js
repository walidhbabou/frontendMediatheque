class DocumentService {
    static async getDocumentsState() {
        try {
            const response = await fetch('http://localhost:8080/api/documents/state', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors du chargement des données');
            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    static async getAllDocuments() {
        try {
            const response = await fetch('http://localhost:8080/api/documents', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors du chargement des documents');
            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }
}

// Fonction pour mettre à jour l'interface
function updateDocumentsList(documents) {
    const tbody = document.getElementById('documentsList');
    tbody.innerHTML = documents.map(doc => `
        <tr>
            <td>
                <div class="d-flex px-2 py-1">
                    <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-0 text-sm">${doc.titre}</h6>
                        <p class="text-xs text-secondary mb-0">${doc.type}</p>
                    </div>
                </div>
            </td>
            <td>
                <p class="text-xs font-weight-bold mb-0">${doc.document_id}</p>
            </td>
            <td class="align-middle text-center text-sm">
                <span class="badge badge-sm bg-gradient-${getStatusColor(doc)}">
                    ${getStatusText(doc)}
                </span>
            </td>
            <td class="align-middle text-center">
                <span class="text-secondary text-xs font-weight-bold">
                    ${doc.quantite_disponible}/${doc.quantite}
                </span>
            </td>
            <td class="align-middle text-center">
                <span class="text-secondary text-xs font-weight-bold">
                    ${doc.prix} €
                </span>
            </td>
            <td class="align-middle">
                <a href="./modifier-document.html?id=${doc.document_id}" class="btn btn-link text-dark px-3 mb-0">
                    <i class="fas fa-pencil-alt text-dark me-2"></i>Modifier
                </a>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(doc) {
    if (doc.quantite_disponible === 0) return 'danger';
    if (doc.quantite_disponible < doc.quantite / 2) return 'warning';
    return 'success';
}

function getStatusText(doc) {
    if (doc.quantite_disponible === 0) return 'Indisponible';
    if (doc.quantite_disponible < doc.quantite / 2) return 'Stock Faible';
    return 'Disponible';
}

async function updateStats() {
    try {
        const documents = await DocumentService.getAllDocuments();
        
        const stats = {
            disponibles: documents.filter(d => d.quantite_disponible > 0).length,
            indisponibles: documents.filter(d => d.quantite_disponible === 0).length,
            total: documents.length,
            stockFaible: documents.filter(d => d.quantite_disponible < d.quantite / 2).length
        };

        document.getElementById('disponibles').textContent = stats.disponibles;
        document.getElementById('indisponibles').textContent = stats.indisponibles;
        document.getElementById('total').textContent = stats.total;
        document.getElementById('stockFaible').textContent = stats.stockFaible;

        updateDocumentsList(documents);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
}

// Filtrer les documents
function filterDocuments() {
    const status = document.getElementById('filterStatus').value;
    DocumentService.getAllDocuments().then(documents => {
        let filteredDocs;
        switch(status) {
            case 'disponible':
                filteredDocs = documents.filter(d => d.quantite_disponible > 0);
                break;
            case 'indisponible':
                filteredDocs = documents.filter(d => d.quantite_disponible === 0);
                break;
            case 'stockFaible':
                filteredDocs = documents.filter(d => d.quantite_disponible < d.quantite / 2);
                break;
            default:
                filteredDocs = documents;
        }
        updateDocumentsList(filteredDocs);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    document.getElementById('filterStatus').addEventListener('change', filterDocuments);
}); 