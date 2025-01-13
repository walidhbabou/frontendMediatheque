class DocumentSearchService {
    static async getAllDocuments() {
        try {
            const response = await fetch('http://localhost:8080/Mediatheque/Document/getAllDocuments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Erreur lors de la récupération des documents');
            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    static filterDocuments(documents, searchParams) {
        return documents.filter(doc => {
            const matchTitre = !searchParams.titre || 
                doc.titre.toLowerCase().includes(searchParams.titre.toLowerCase());
            const matchType = !searchParams.type || 
                doc.type === searchParams.type;
            return matchTitre && matchType;
        });
    }
}

// Variable globale pour stocker tous les documents
let allDocuments = [];

// Fonction pour mettre à jour l'affichage des résultats
function updateSearchResults(documents) {
    const tbody = document.getElementById('searchResults');
    if (!tbody) {
        console.error('Element searchResults non trouvé');
        return;
    }

    tbody.innerHTML = documents.map(doc => `
        <tr>
            <td>
                <div class="d-flex px-2 py-1">
                    <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-0 text-sm">${doc.titre}</h6>
                        <p class="text-xs text-secondary mb-0">${doc.type || 'Non spécifié'}</p>
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
                    ${doc.prix} MAD
                </span>
            </td>
            <td class="align-middle">
                <div class="ms-auto text-end">
                    <button class="btn btn-link text-primary px-3 mb-0" 
                            onclick="modifierDocument(${doc.document_id})"
                            title="Modifier">
                        <i class="fas fa-pencil-alt text-primary me-2"></i>
                        Modifier
                    </button>
                </div>
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

function modifierDocument(documentId) {
    window.location.href = `modifier-document.html?id=${documentId}`;
}

// Fonction de recherche dynamique
async function handleDynamicSearch() {
    const searchParams = {
        titre: document.getElementById('title').value,
        type: document.getElementById('category').value
    };

    const filteredDocuments = DocumentSearchService.filterDocuments(allDocuments, searchParams);
    updateSearchResults(filteredDocuments);
}

// Chargement initial des documents
async function loadDocuments() {
    try {
        console.log('Chargement des documents...');
        allDocuments = await DocumentSearchService.getAllDocuments();
        console.log('Documents reçus:', allDocuments);
        updateSearchResults(allDocuments);
    } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        alert('Erreur lors du chargement des documents');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page chargée, chargement des documents...');
    loadDocuments();
    
    // Ajouter les écouteurs d'événements pour la recherche dynamique
    const titleInput = document.getElementById('title');
    const categorySelect = document.getElementById('category');
    
    if (titleInput) {
        titleInput.addEventListener('input', handleDynamicSearch);
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', handleDynamicSearch);
    }
    
    // Supprimer l'écouteur submit du formulaire car la recherche est maintenant dynamique
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }
}); 