// -----------------------
// Définir les URLs des APIs
// -----------------------
const EMPRUNT_API    = 'http://localhost:8080/api/emprunts';
const ABONNEMENT_API = 'http://localhost:8080/Mediatheque/abo';
const DOCUMENT_API   = 'http://localhost:8080/Mediatheque/Document/getAllDocuments';
const LECTEUR_API    = 'http://localhost:8080/Mediatheque/lecteur/allLecteurs';

// -----------------------
// Au chargement du DOM
// -----------------------
document.addEventListener('DOMContentLoaded', function () {
    const empruntTable         = document.getElementById('emprunt-table');
    const createEmpruntButton  = document.getElementById('create-emprunt-button');
    const createEmpruntFormDiv = document.getElementById('create-emprunt-form');
    const createEmpruntForm    = document.getElementById('create-emprunt-form-data');
    const editEmpruntFormDiv   = document.getElementById('edit-emprunt-form');
    const editEmpruntForm      = document.getElementById('edit-emprunt-form-data');
    const cancelCreateButton   = document.getElementById('cancel-create-emprunt');
    const cancelEditButton     = document.getElementById('cancel-edit-emprunt');

    // Charger les emprunts, abonnements et documents au démarrage
    loadEmprunts();
    loadAbonnements();
    loadDocuments();
    loadLecteurs(); 

    // -----------------------
    // Afficher le formulaire de création
    // -----------------------
    createEmpruntButton.addEventListener('click', function () {
        createEmpruntFormDiv.style.display = 'block';
    });

    // -----------------------
    // Annuler la création
    // -----------------------
    cancelCreateButton.addEventListener('click', function () {
        createEmpruntFormDiv.style.display = 'none';
        createEmpruntForm.reset();
    });

    // -----------------------
    // Annuler la modification
    // -----------------------
    cancelEditButton.addEventListener('click', function () {
        editEmpruntFormDiv.style.display = 'none';
        editEmpruntForm.reset();
    });

    // -----------------------
    // Soumission du formulaire de création
    // -----------------------
    createEmpruntForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Récupérer les champs saisis
        const formData = {
            date_emprunt: document.getElementById('create-date-emprunt').value,
            date_retour:  document.getElementById('create-date-retour').value,
            abonnement: {
                abonnementId: document.getElementById('create-abonnement').value
            },
            document: {
                document_id: parseInt(document.getElementById('create-document').value)
            }
        };

        // 1) Créer l'emprunt
        fetch(EMPRUNT_API + '/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la création de l\'emprunt');
            }
            return response.json();
        })
        .then(async data => {
            alert('Emprunt créé avec succès');

            // On récupère l'ID du document et l'ID de l'abonnement
            const docId = formData.document.document_id;
            const aboId = formData.abonnement.abonnementId;

            // 2) Récupérer le document complet (pour la quantité disponible, le prix, etc.)
            let docFull = null;
            try {
                docFull = await fetchDocumentById(docId);
            } catch (err) {
                console.error('Erreur lors de la récupération du document:', err);
                alert('Impossible de mettre à jour la quantité du document.');
            }

            // 3) Récupérer l'abonnement complet (pour le solde ou autre champ)
            let aboFull = null;
            try {
                aboFull = await fetchAbonnementById(aboId);
            } catch (err) {
                console.error('Erreur lors de la récupération de l\'abonnement:', err);
                alert('Impossible de mettre à jour le solde de l\'abonnement.');
            }

            // 4) Décrémenter si on a bien récupéré les deux
            if (docFull && aboFull) {
                // Exemple : on décrémente la quantité du document
                const nouvelleQuantite = (docFull.quantite_disponible || 0) - 1;
                // Exemple : on décrémente le solde de l'abonnement du prix du document
                const nouveauSolde = (aboFull.solde || 0) - (docFull.prix || 0);

                // Appeler l'API pour mettre à jour la quantité disponible du document
                try {
                    await updateDocument(docFull.document_id, nouvelleQuantite);
                } catch (err) {
                    console.error('Erreur mise à jour document:', err);
                }

                // Appeler l'API pour mettre à jour le solde de l'abonnement
                try {
                    await updateAbonnement(aboFull.abonnementId, nouveauSolde);
                } catch (err) {
                    console.error('Erreur mise à jour abonnement:', err);
                }
            }

            // Réinitialiser formulaire et recharger la liste
            createEmpruntForm.reset();
            createEmpruntFormDiv.style.display = 'none';
            loadEmprunts(); // Recharger la liste des emprunts
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Erreur lors de la création de l\'emprunt: ' + error.message);
        });
    });

    // -----------------------
    // Soumission du formulaire de modification
    // -----------------------
    editEmpruntForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('edit-emprunt-id').value;

        const formData = {
            date_emprunt: document.getElementById('edit-date-emprunt').value,
            date_retour:  document.getElementById('edit-date-retour').value,
            abonnement: {
                abonnementId: document.getElementById('edit-abonnement').value
            },
            document: {
                document_id: parseInt(document.getElementById('edit-document').value)
            }
        };

        fetch(EMPRUNT_API + '/update/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la modification de l\'emprunt');
            }
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

    // -----------------------
    // Charger tous les lecteurs
    // -----------------------
    function loadLecteurs() {
        fetch(LECTEUR_API)
            .then(response => {
                if (!response.ok) throw new Error('Erreur lors du chargement des lecteurs');
                return response.json();
            })
            .then(data => {
                const createAbonnementSelect = document.getElementById('create-abonnement');
                const editAbonnementSelect   = document.getElementById('edit-abonnement');
    
                // Vider les selects
                createAbonnementSelect.innerHTML = '<option value="">Sélectionnez un lecteur</option>';
                editAbonnementSelect.innerHTML   = '<option value="">Sélectionnez un lecteur</option>';
    
                // Ajouter les options pour chaque lecteur
                data.forEach(lecteur => {
                    const option = document.createElement('option');
                    option.value = lecteur.lecteurId; 
                    option.textContent = `${lecteur.user.username} ${lecteur.user.lastname}`;
                    createAbonnementSelect.appendChild(option.cloneNode(true));
                    editAbonnementSelect.appendChild(option.cloneNode(true));
                });
            })
            .catch(error => {
                console.error('Erreur lors du chargement des lecteurs:', error);
                alert('Erreur lors du chargement des lecteurs');
            });
    }

    // -----------------------
    // Charger tous les emprunts
    // -----------------------
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
                    <tr><td colspan="5" class="text-danger">
                        Erreur lors du chargement: ${error.message}
                    </td></tr>
                `;
            });
    }

    // -----------------------
    // Charger tous les abonnements
    // -----------------------
    function loadAbonnements() {
        fetch(ABONNEMENT_API + '/All')
            .then(response => response.json())
            .then(data => {
                const createAbonnementSelect = document.getElementById('create-abonnement');
                const editAbonnementSelect   = document.getElementById('edit-abonnement');
                createAbonnementSelect.innerHTML = '<option value="">Sélectionnez un abonnement</option>';
                editAbonnementSelect.innerHTML   = '<option value="">Sélectionnez un abonnement</option>';

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

    // -----------------------
    // Charger tous les documents
    // -----------------------
    function loadDocuments() {
        fetch(DOCUMENT_API)
            .then(response => response.json())
            .then(data => {
                const createDocumentSelect = document.getElementById('create-document');
                const editDocumentSelect   = document.getElementById('edit-document');
                createDocumentSelect.innerHTML = '<option value="">Sélectionnez un document</option>';
                editDocumentSelect.innerHTML   = '<option value="">Sélectionnez un document</option>';

                data.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.document_id;
                    // Exemple d'affichage : Titre - Type - Prix€ (x disponibles)
                    option.textContent = `${doc.titre} - ${doc.type} - ${doc.prix}€`;
                    
                    // Gérer la disponibilité
                    if (doc.quantite_disponible <= 0) {
                        option.disabled = true;
                        option.textContent += ' (Non disponible)';
                    } else {
                        option.textContent += ` (${doc.quantite_disponible} dispo)`;
                    }
                    createDocumentSelect.appendChild(option.cloneNode(true));
                    editDocumentSelect.appendChild(option.cloneNode(true));
                });
            })
            .catch(error => console.error('Erreur chargement documents:', error));
    }

    // -----------------------
    // Clic sur "Modifier" emprunt
    // -----------------------
    document.addEventListener('click', function (e) {
        const editButton = e.target.closest('.edit-emprunt');
        if (editButton) {
            const id = editButton.getAttribute('data-id');
            fetch(EMPRUNT_API + '/' + id)
                .then(response => response.json())
                .then(emprunt => {
                    document.getElementById('edit-emprunt-id').value = emprunt.emprunt_id;
                    document.getElementById('edit-date-emprunt').value = formatDateForInput(emprunt.date_emprunt);
                    document.getElementById('edit-date-retour').value  = formatDateForInput(emprunt.date_retour);
                    document.getElementById('edit-abonnement').value   = emprunt.abonnement.abonnementId;
                    document.getElementById('edit-document').value     = emprunt.document.document_id;
                    editEmpruntFormDiv.style.display = 'block';
                })
                .catch(error => console.error('Erreur:', error));
        }
    });

    // -----------------------
    // Formatage pour affichage (table)
    // -----------------------
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('fr-FR', {
            day:   '2-digit',
            month: '2-digit',
            year:  'numeric'
        }).format(date);
    }

    // -----------------------
    // Formatage pour <input type="date">
    // -----------------------
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    }

    // -----------------------
    // Récupérer un document par son ID
    // -----------------------
    async function fetchDocumentById(documentId) {
        // Ici on récupère la liste complète, puis on filtre.
        // Selon votre API, vous pouvez avoir un endpoint plus direct:
        // ex. GET /Mediatheque/Document/getDocument/{id}
        const response = await fetch(DOCUMENT_API);
        if (!response.ok) {
            throw new Error('Erreur fetching Document');
        }
        const documents = await response.json();
        return documents.find(doc => doc.document_id === documentId);
    }

    // -----------------------
    // Récupérer un abonnement par son ID
    // -----------------------
    async function fetchAbonnementById(abonnementId) {
        // Pareil : si vous avez un endpoint direct ex. GET /Mediatheque/abo/get/{id}, utilisez-le.
        const response = await fetch(ABONNEMENT_API + '/All');
        if (!response.ok) {
            throw new Error('Erreur fetching Abonnement');
        }
        const abonnements = await response.json();
        return abonnements.find(abo => abo.abonnementId == abonnementId);
    }

    // -----------------------
    // Mettre à jour la quantité d’un document
    // -----------------------
    async function updateDocument(docId, nouvelleQuantite) {
        // On suppose un endpoint type : PUT /Mediatheque/Document/update/{docId}
        // avec un body JSON contenant la nouvelle quantité.
        // À adapter selon votre backend.
        const updateUrl = `http://localhost:8080/Mediatheque/Document/update/${docId}`;

        const bodyData = {
            document_id: docId,
            quantite_disponible: nouvelleQuantite
            // Ajoutez d'autres champs si nécessaires
        };

        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du document');
        }
        return response.json();
    }

    // -----------------------
    // Mettre à jour le solde d’un abonnement
    // -----------------------
    async function updateAbonnement(aboId, nouveauSolde) {
        // Même principe, on suppose : PUT /Mediatheque/abo/update/{aboId}
        const updateUrl = `http://localhost:8080/Mediatheque/abo/update/${aboId}`;

        const bodyData = {
            abonnementId: aboId,
            solde: nouveauSolde
            // Ajoutez d'autres champs si nécessaires
        };

        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour de l\'abonnement');
        }
        return response.json();
    }
});
