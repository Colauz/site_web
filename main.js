async function addUser() {
    const firstName = document.getElementById('firstNameEntry').value;
    const lastName = document.getElementById('lastNameEntry').value;
    const username = document.getElementById('usernameEntry').value; 
    const password = document.getElementById('uniquePasswordEntry').value;

    if (firstName.length <= 2 || lastName.length <= 2 || username.length <= 2) {
        alert("Le prénom, le nom et le pseudonyme doivent contenir plus de 2 caractères.");
        return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{7,}$/;
    if (!passwordRegex.test(password)) {
        alert("Le mot de passe doit contenir au moins 7 caractères, une majuscule et un caractère spécial.");
        return;
    }

    console.log("Envoi des données :", { firstName, lastName, username, password });

    const response = await fetch('/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, username, password })
    });

    if (response.ok) {
        console.log('Utilisateur ajouté');
        document.getElementById('firstNameEntry').value = '';
        document.getElementById('lastNameEntry').value = '';
        document.getElementById('usernameEntry').value = '';
        document.getElementById('uniquePasswordEntry').value = '';
    } else {
        const errorText = await response.text();
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', errorText);

        if (errorText.includes("Pseudonyme déjà utilisé")) {
            alert("Pseudonyme déjà utilisé, veuillez en choisir un autre.");
        } else {
            const errorText = await response.text();
            console.error('Erreur lors de l\'ajout de l\'utilisateur:', errorText);
        
            alert(errorText);
        }
    }
    if (response.ok) {
        const newUser = await response.json();

        document.cookie = `username=${newUser.username}; path=/`;

        window.location.href = 'accueil.html';
    } else {
        const errorText = await response.text();
        alert('Erreur lors de l\'inscription: ' + errorText);
    }
}

function logoutUser() {

    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    window.location.href = 'accueil.html';
}

async function loginUser() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const userData = await response.json();
            document.cookie = `username=${userData.username}; path=/`;
            window.location.href = 'accueil.html';
        } else {
            alert('Identifiants incorrects. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        alert('Erreur lors de la connexion. Veuillez réessayer.');
    }
}

window.onload = function() {
    const username = getCookie("username");
    if (username) {
        document.getElementById('inscriptionButton').style.display = 'none';
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'block';
    } else {
        document.getElementById('inscriptionButton').style.display = 'block';
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('logoutButton').style.display = 'none';
    }
};

// Fonctions getCookie et logoutUser...


function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

function logoutUser() {
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    window.location.href = 'accueil.html';
}
