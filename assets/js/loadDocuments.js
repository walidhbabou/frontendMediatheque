const BASE_URL      = 'http://localhost:8080/Mediatheque/Document';
const GET_ALL_URL   = BASE_URL + '/getAllDocuments';
const SAVE_URL      = BASE_URL + '/save';
const UPDATE_URL    = BASE_URL + '/update';
const DELETE_URL    = BASE_URL + '/delete'; 
const GET_BY_ID_URL = BASE_URL;           


document.addEventListener('DOMContentLoaded', function () {
  const createButton         = document.getElementById('create-document-button');
  const createFormContainer  = document.getElementById('create-form');
  const createForm           = document.getElementById('create-document-form');
  const cancelCreateButton   = document.getElementById('cancel-create');

  const editFormContainer    = document.getElementById('edit-form-container');
  const editForm             = document.getElementById('edit-form'); 
  const cancelEditButton     = document.getElementById('cancel-edit');

  const documentTableBody    = document.getElementById('document-table');

  const searchInput = document.getElementById('searchInput');
  const pagination = document.getElementById('pagination');

  let documents = []; 
  let currentPage = 1;
  const itemsPerPage = 10;

  function loadDocuments() {
    fetch(GET_ALL_URL, {
      method: 'GET'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des documents');
      }
      return response.json();
    })
    .then(data => {
      documents = data;
      renderTable();
    })
    .catch(error => {
      console.error('Erreur lors du chargement des documents:', error);
    });
  }

  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredDocuments = documents.filter(doc => 
      doc.titre.toLowerCase().includes(searchTerm) ||
      doc.type.toLowerCase().includes(searchTerm)
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    documentTableBody.innerHTML = paginatedDocuments.map(doc => `
      <tr>
        <td>${doc.titre}</td>
        <td>${doc.type}</td>
        <td>${doc.prix != null ? doc.prix + ' MAD' : ''}</td>
        <td>${doc.consultable ? 'Oui' : 'Non'}</td>
        <td>${doc.quantite || 0}</td>
        <td>${doc.quantite_disponible || 0}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2" onclick="editDocument(${doc.document_id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteDocument(${doc.document_id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

    renderPagination(filteredDocuments.length);
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === currentPage ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = i;
        renderTable();
      });
      pagination.appendChild(li);
    }
  }

  createButton.addEventListener('click', function () {
    createFormContainer.style.display = 'block';
  });
  cancelCreateButton.addEventListener('click', function () {
    createFormContainer.style.display = 'none';
    createForm.reset();
  });

  createForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newDocument = {
      titre:               document.getElementById('create-title').value,
      type:                document.getElementById('create-type').value,
      prix:                parseFloat(document.getElementById('create-price').value),
      consultable:         (document.getElementById('create-consultable').value === 'Oui'),
      quantite:            parseInt(document.getElementById('create-quantity').value),
      quantite_disponible: parseInt(document.getElementById('create-available-quantity').value)
    };

    fetch(SAVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDocument)
    })
    .then(response => {
        console.log('POST /save -> status:', response.status);
        if (!response.ok) {
          return response.text().then(txt => {
            console.error('Erreur création document:', txt);
            throw new Error('Impossible de créer le document (code HTTP ' + response.status + ')');
          });
        }
        return response.text();
      })
    .then(result => {
      Swal.fire({
        icon: 'success',
        title: 'Document créé avec succès',
        showConfirmButton: false,
        timer: 1500
      });
      createFormContainer.style.display = 'none';
      createForm.reset();
      loadDocuments();
    })
    .catch(error => {
      console.error(error);
      Swal.fire('Erreur', error.message, 'error');
    });
  });


  window.editDocument = function (id) {
    fetch(`${GET_BY_ID_URL}/${id}`, {
      method: 'GET'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du document');
      }
      return response.json();
    })
    .then(doc => {
      document.getElementById('edit-id').value                      = doc.document_id;
      document.getElementById('edit-title').value                   = doc.titre || '';
      document.getElementById('edit-type').value                    = doc.type || '';
      document.getElementById('edit-price').value                   = doc.prix || 0;
      document.getElementById('edit-consultable').value             = doc.consultable ? 'Oui' : 'Non';
      document.getElementById('edit-quantity').value                = doc.quantite || 0;
      document.getElementById('edit-available-quantity').value      = doc.quantite_disponible || 0;

      editFormContainer.style.display = 'block';
    })
    .catch(error => {
      console.error(error);
      Swal.fire('Erreur', error.message, 'error');
    });
  };

  // ------------------------------------------
  // Annuler l'édition
  // ------------------------------------------
  cancelEditButton.addEventListener('click', function () {
    editFormContainer.style.display = 'none';
    editForm.reset();
  });

  // ------------------------------------------
  // Soumission du formulaire EDIT (UPDATE)
  // ------------------------------------------
  editForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const updatedDoc = {
      document_id:         parseInt(document.getElementById('edit-id').value),
      titre:               document.getElementById('edit-title').value,
      type:                document.getElementById('edit-type').value,
      prix:                parseFloat(document.getElementById('edit-price').value),
      consultable:         (document.getElementById('edit-consultable').value === 'Oui'),
      quantite:            parseInt(document.getElementById('edit-quantity').value),
      quantite_disponible: parseInt(document.getElementById('edit-available-quantity').value)
    };

    fetch(UPDATE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDoc)
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(txt => {
          console.error('Erreur update document:', txt);
          throw new Error('Impossible de modifier le document');
        });
      }
      return response.text(); 
    })
    .then(result => {
      Swal.fire({
        icon: 'success',
        title: 'Document modifié',
        showConfirmButton: false,
        timer: 1500
      });
      editFormContainer.style.display = 'none';
      editForm.reset();
      loadDocuments();
    })
    .catch(error => {
      console.error(error);
      Swal.fire('Erreur', error.message, 'error');
    });
  });

  // Supprimer un document
  window.deleteDocument = function (id) {
    Swal.fire({
      title: 'Supprimer ce document ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${DELETE_URL}/${id}`, {
          method: 'DELETE'
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
          }
          return response.text();
        })
        .then(msg => {
          Swal.fire({
            icon: 'success',
            title: 'Document supprimé',
            showConfirmButton: false,
            timer: 1200
          });
          loadDocuments();
        })
        .catch(error => {
          console.error(error);
          Swal.fire('Erreur', error.message, 'error');
        });
      }
    });
  };

  searchInput.addEventListener('input', () => {
    currentPage = 1; 
    renderTable();
  });

  loadDocuments();
});
