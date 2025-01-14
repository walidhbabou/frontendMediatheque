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
            // Affiche une SweetAlert pour informer que le compte a été créé
            Swal.fire({
                title: 'Compte créé avec succès !',
                text: 'Vous pouvez maintenant vous connecter.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Réinitialise le formulaire après la création du compte
                document.getElementById('signupForm').reset();
            });
        } else {
            // Affiche une SweetAlert en cas d'erreur
            Swal.fire({
                title: 'Erreur',
                text: 'Erreur lors de l\'inscription: ' + data.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        // Affiche une SweetAlert en cas d'erreur réseau ou serveur
        Swal.fire({
            title: 'Erreur',
            text: 'Une erreur s\'est produite lors de l\'inscription.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
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
            localStorage.setItem('userId', data.id); // Assurez-vous que 'data.id' contient bien l'ID du lecteur
            localStorage.setItem('role', data.role);

            // Redirigez l'utilisateur en fonction de son rôle
            switch (data.role) {
                case 'LECTEUR':
                    window.location.href = '/pages/lecteur/dashboard-lecteur.html';
                    break;
                case 'EMPLOYEE':
                    window.location.href = '/pages/employe/dashboard-employe.html';
                    break;
                case 'ADMIN':
                    window.location.href = '/pages/admin/dashboard-admin.html';
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