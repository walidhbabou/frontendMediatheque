document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche le rechargement de la page
  
    // Récupère les valeurs du formulaire
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const lastname = document.getElementById('lastname').value;
    const role = document.getElementById('role').value;
  
    // Crée l'objet de données à envoyer
    const data = {
      username: username,
      email: email,
      password: password,
      lastname: lastname,
      role: role
    };
  
    // Envoie la requête POST à l'API
    fetch('http://localhost:8080/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur réseau ou serveur');
      }
      return response.json();
    })
    .then(data => {
      if (data.accessToken) {
       
        // Redirigez l'utilisateur vers la page de connexion
        window.location.href = 'sign-in.html'; // Redirection vers sign-in.html
      } else {
        alert('Erreur lors de l\'inscription: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Une erreur s\'est produite lors de l\'inscription.');
    });
  });
  document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur réseau ou serveur');
        }
        return response.json();
    })
    .then(data => {
        if (data.accessToken) {
            // Stockez le token et le rôle dans le localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('role', data.role); // Assurez-vous que le rôle est renvoyé par l'API

            // Redirigez l'utilisateur en fonction de son rôle
            switch (data.role) {
                case 'ROLE_LECTEUR':
                    window.location.href = '../pages/lecteur/dashboard-lecteur.html';
                    break;
                case 'ROLE_EMPLOYEE':
                    window.location.href = '../pages/employe/dashboard-employe.html';
                    break;
                case 'ROLE_ADMIN':
                    window.location.href = '../pages/admin/dashboard-admin.html';
                    break;
                default:
                    alert('Rôle non reconnu');
                    break;
            }
        } else {
            alert('Token non reçu');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la connexion');
    });
});
