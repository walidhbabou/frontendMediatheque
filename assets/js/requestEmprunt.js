const API_BASE_URL = 'http://localhost:8080/api/requests';

// Fonction pour récupérer toutes les demandes
async function fetchAllRequests() {
    try {
        const response = await fetch(`${API_BASE_URL}/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des demandes');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

// Fonction pour mettre à jour le statut d'une demande
async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/update/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la mise à jour du statut de la demande');
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}

// Afficher les demandes sous forme de cartes
function displayRequests(requests) {
    const cardsContainer = document.getElementById('request-cards');
    cardsContainer.innerHTML = '';

    requests.forEach(request => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Demande #${request.requestId}</h5>
                    <p class="card-text">
                        <strong>Lecteur:</strong> ${request.lecteurNom} ${request.lecteurPrenom}<br>
                        <strong>Document:</strong> ${request.documentTitre}<br>
                        <strong>Date de Demande:</strong> ${new Date(request.dateRequest).toLocaleDateString()}<br>
                        <strong>Statut:</strong> <span id="status-${request.requestId}">${request.status}</span>
                    </p>
                    <div class="d-flex justify-content-between">
                        <div class="dropdown">
                            <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="dropdownMenuButton${request.requestId}" onclick="toggleDropdown(${request.requestId})">
                                Modifier Statut
                            </button>
                            <ul class="dropdown-menu" id="dropdownMenu${request.requestId}" aria-labelledby="dropdownMenuButton${request.requestId}">
                                <li><a class="dropdown-item" href="#" onclick="updateRequestStatusAndRefresh(${request.requestId}, 'EN_ATTENTE')">En Attente</a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateRequestStatusAndRefresh(${request.requestId}, 'VALIDE')">Valide</a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateRequestStatusAndRefresh(${request.requestId}, 'RETOURNE')">Retourné</a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateRequestStatusAndRefresh(${request.requestId}, 'REFUSE')">Refuser</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}

// Fonction pour afficher/masquer le menu déroulant
function toggleDropdown(requestId) {
    const dropdownMenu = document.getElementById(`dropdownMenu${requestId}`);
    dropdownMenu.classList.toggle('show');
}

// Fermer le menu déroulant si l'utilisateur clique en dehors
window.onclick = function (event) {
    if (!event.target.matches('.dropdown-toggle')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};


async function updateRequestStatusAndRefresh(requestId, status) {
    try {
        const updatedRequest = await updateRequestStatus(requestId, status);
        if (updatedRequest) {
            // Afficher une notification de succès
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: `Statut mis à jour avec succès: ${status}`,
                confirmButtonText: 'OK'
            }).then(() => {
                // Rediriger vers la page Emprunt.html avec les données de la demande
                if (status === 'VALIDE') {
                    const queryParams = new URLSearchParams({
                        requestId: updatedRequest.requestId,
                        lecteurNom: updatedRequest.lecteurNom,
                        lecteurPrenom: updatedRequest.lecteurPrenom,
                        documentTitre: updatedRequest.documentTitre,
                        dateRequest: updatedRequest.dateRequest,
                        status: updatedRequest.status
                    });
                    window.location.href = `/pages/admin/Emprunt.html?${queryParams.toString()}`;
                }
            });
        }
    } catch (error) {
        console.error('Erreur:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.message || 'Une erreur est survenue lors de la mise à jour du statut',
            confirmButtonText: 'OK'
        });
    }
}

// Charger les demandes au chargement de la page
document.addEventListener('DOMContentLoaded', async function () {
    const requests = await fetchAllRequests();
    displayRequests(requests);
});