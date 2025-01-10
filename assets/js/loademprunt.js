// Définir les URLs des APIs
const EMPRUNT_API = 'http://localhost:8080/api/emprunts';
const ABONNEMENT_API = 'http://localhost:8080/Mediatheque/abo';
const DOCUMENT_API = 'http://localhost:8080/Mediatheque/Document/getAllDocuments';
const LECTEUR_API = 'http://localhost:8080/Mediatheque/lecteur/allLecteurs';

document.addEventListener('DOMContentLoaded', function () {
    const empruntTable = document.getElementById('emprunt-table');
    const createEmpruntButton = document.getElementById('create-emprunt-button');
    const createEmpruntFormDiv = document.getElementById('create-emprunt-form');
    const createEmpruntForm = document.getElementById('create-emprunt-form-data');
    const editEmpruntFormDiv = document.getElementById('edit-emprunt-form');
    const editEmpruntForm = document.getElementById('edit-emprunt-form-data');
    const cancelCreateButton = document.getElementById('cancel-create-emprunt');
    const cancelEditButton = document.getElementById('cancel-edit-emprunt');

    // Charger les emprunts, abonnements et documents au démarrage
    loadEmprunts();
    loadAbonnements();
    loadDocuments();
    loadLecteurs(); 
    // Afficher le formulaire de création
    createEmpruntButton.addEventListener('click', function () {
        createEmpruntFormDiv.style.display = 'block';
    });

    // Annuler la création
    cancelCreateButton.addEventListener('click', function () {
        createEmpruntFormDiv.style.display = 'none';
        createEmpruntForm.reset();
    });

    // Annuler la modification
    cancelEditButton.addEventListener('click', function () {
        editEmpruntFormDiv.style.display = 'none';
        editEmpruntForm.reset();
    });

    // Soumettre le formulaire de création
    createEmpruntForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = {
            date_emprunt: document.getElementById('create-date-emprunt').value,
            date_retour: document.getElementById('create-date-retour').value,
            abonnement: {
                abonnementId: document.getElementById('create-abonnement').value
            },
            document: {
                document_id: parseInt(document.getElementById('create-document').value)
            }
        };

        fetch(EMPRUNT_API + '/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Erreur lors de la création de l\'emprunt');
                return response.json();
            })
            .then(data => {
                alert('Emprunt créé avec succès');
                createEmpruntForm.reset();
                createEmpruntFormDiv.style.display = 'none';
                loadEmprunts(); // Recharger la liste des emprunts
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la création de l\'emprunt: ' + error.message);
            });
    });

    // Soumettre le formulaire de modification
    editEmpruntForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('edit-emprunt-id').value;
        const formData = {
            date_emprunt: document.getElementById('edit-date-emprunt').value,
            date_retour: document.getElementById('edit-date-retour').value,
            abonnement: {
                abonnementId: document.getElementById('edit-abonnement').value
            },
            document: {
                document_id: parseInt(document.getElementById('edit-document').value)
            }
        };

        fetch(EMPRUNT_API + '/update/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Erreur lors de la modification de l\'emprunt');
                return response.json();
            })
            .then(data => {
                alert('Emprunt modifié avec succès');
                editEmpruntForm.reset();
                editEmpruntFormDiv.style.display = 'none';
                loadEmprunts(); // Recharger la liste des emprunts
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la modification de l\'emprunt: ' + error.message);
            });
    });
    function loadLecteurs() {
        fetch(LECTEUR_API)
            .then(response => {
                if (!response.ok) throw new Error('Erreur lors du chargement des lecteurs');
                return response.json();
            })
            .then(data => {
                const createAbonnementSelect = document.getElementById('create-abonnement');
                const editAbonnementSelect = document.getElementById('edit-abonnement');
    
                // Vider les selects
                createAbonnementSelect.innerHTML = '<option value="">Sélectionnez un lecteur</option>';
                editAbonnementSelect.innerHTML = '<option value="">Sélectionnez un lecteur</option>';
    
                // Ajouter les options pour chaque lecteur
                data.forEach(lecteur => {
                    const option = document.createElement('option');
                    option.value = lecteur.lecteurId; // Assurez-vous que c'est le bon champ
                    option.textContent = `${lecteur.user.username} ${lecteur.user.lastname}`; // Ajustez selon votre structure de données
                    createAbonnementSelect.appendChild(option.cloneNode(true));
                    editAbonnementSelect.appendChild(option.cloneNode(true));
                });
            })
            .catch(error => {
                console.error('Erreur lors du chargement des lecteurs:', error);
                alert('Erreur lors du chargement des lecteurs');
            });
    }
    // Charger les emprunts
    function loadEmprunts() {
        fetch(EMPRUNT_API + '/all')
            .then(response => response.json())
            .then(data => {
                empruntTable.innerHTML = '';
                data.forEach(emprunt => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formatDate(emprunt.date_emprunt)}</td>
                        <td>${formatDate(emprunt.date_retour)}</td>
                        <td>${emprunt.abonnement?.lecteurName || ''} ${emprunt.abonnement?.lecteurlastName || ''}</td>
                        <td>${emprunt.document?.titre || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-emprunt" data-id="${emprunt.emprunt_id}">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                        </td>
                    `;
                    empruntTable.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Erreur:', error);
                empruntTable.innerHTML = `
                    <tr><td colspan="5" class="text-danger">Erreur lors du chargement: ${error.message}</td></tr>
                `;
            });
    }

    // Charger les abonnements
    function loadAbonnements() {
        fetch(ABONNEMENT_API + '/all')
            .then(response => response.json())
            .then(data => {
                const createAbonnementSelect = document.getElementById('create-abonnement');
                const editAbonnementSelect = document.getElementById('edit-abonnement');
                createAbonnementSelect.innerHTML = '<option value="">Sélectionnez un abonnement</option>';
                editAbonnementSelect.innerHTML = '<option value="">Sélectionnez un abonnement</option>';
                data.forEach(abonnement => {
                    const option = document.createElement('option');
                    option.value = abonnement.abonnementId;
                    option.textContent = `${abonnement.lecteurName} ${abonnement.lecteurlastName}`;
                    createAbonnementSelect.appendChild(option.cloneNode(true));
                    editAbonnementSelect.appendChild(option.cloneNode(true));
                });
            })
            .catch(error => console.error('Erreur chargement abonnements:', error));
    }

    // Charger les documents
    function loadDocuments() {
        fetch(DOCUMENT_API)
            .then(response => response.json())
            .then(data => {
                const createDocumentSelect = document.getElementById('create-document');
                const editDocumentSelect = document.getElementById('edit-document');
                createDocumentSelect.innerHTML = '<option value="">Sélectionnez un document</option>';
                editDocumentSelect.innerHTML = '<option value="">Sélectionnez un document</option>';
                data.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.document_id;
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
            })
            .catch(error => console.error('Erreur chargement documents:', error));
    }

    // Formater une date pour l'affichage
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    // Gérer le clic sur le bouton Modifier
    document.addEventListener('click', function (e) {
        const editButton = e.target.closest('.edit-emprunt');
        if (editButton) {
            const id = editButton.getAttribute('data-id');
            fetch(EMPRUNT_API + '/' + id)
                .then(response => response.json())
                .then(emprunt => {
                    document.getElementById('edit-emprunt-id').value = emprunt.emprunt_id;
                    document.getElementById('edit-date-emprunt').value = formatDateForInput(emprunt.date_emprunt);
                    document.getElementById('edit-date-retour').value = formatDateForInput(emprunt.date_retour);
                    document.getElementById('edit-abonnement').value = emprunt.abonnement.abonnementId;
                    document.getElementById('edit-document').value = emprunt.document.document_id;
                    editEmpruntFormDiv.style.display = 'block';
                })
                .catch(error => console.error('Erreur:', error));
        }
    });

    // Formater une date pour l'input de type date
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    }
});