document.addEventListener('DOMContentLoaded', function () {
    const empruntTable = document.getElementById('emprunt-table');
    const createEmpruntButton = document.getElementById('create-emprunt-button');
    const createEmpruntForm = document.getElementById('create-emprunt-form');
    const cancelCreateEmprunt = document.getElementById('cancel-create-emprunt');
    const editEmpruntForm = document.getElementById('edit-emprunt-form');
    const cancelEditEmprunt = document.getElementById('cancel-edit-emprunt');
  
    // Charger les emprunts
    function loadEmprunts() {
      fetch('http://localhost:8080/api/emprunts/all')
        .then(response => response.json())
        .then(data => {
          empruntTable.innerHTML = '';
          data.forEach(emprunt => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${emprunt.date_emprunt}</td>
              <td>${emprunt.date_retour}</td>
              <td>${emprunt.abonnement.abonnementId}</td>
              <td>${emprunt.document.document_id}</td>
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
    createEmpruntButton.addEventListener('click', () => {
      createEmpruntForm.style.display = 'block';
    });
  
    // Masquer le formulaire de création
    cancelCreateEmprunt.addEventListener('click', () => {
      createEmpruntForm.style.display = 'none';
    });
  
    // Masquer le formulaire de modification
    cancelEditEmprunt.addEventListener('click', () => {
      editEmpruntForm.style.display = 'none';
    });
  
    // Charger les emprunts au démarrage
    loadEmprunts();
  });