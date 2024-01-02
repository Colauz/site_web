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
        document.cookie = `userStatus=user; path=/`; // Définir le statut comme 'user'
        window.location.href = 'accueil.html';
    } else {
        const errorText = await response.text();
        alert('Erreur lors de l\'inscription: ' + errorText);
    }
}

async function logoutUser() {
    const username = getCookie("username");
    
    try {
        await fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }

    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    document.cookie = 'userStatus=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';

    await fetchUsers(); 
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
            document.cookie = `userStatus=${userData.status}; path=/`; 
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
    const userStatus = getCookie("userStatus");

    if (username) {
        document.getElementById('inscriptionButton').style.display = 'none';
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'block';
    } else {
        document.getElementById('inscriptionButton').style.display = 'block';
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('logoutButton').style.display = 'none';
    }

    const manageButtons = document.getElementsByClassName('manage-btn');

    if (userStatus !== 'admin') {
        for (let i = 0; i < manageButtons.length; i++) {
            manageButtons[i].style.display = 'none';
        }
    }

    fetchUsers();
};

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

async function logoutUser() {
    const username = getCookie("username");
    
    try {
        await fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }

    // Effacer les cookies
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    document.cookie = 'userStatus=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';

    // Mettre à jour l'interface utilisateur pour refléter l'état non connecté
    updateUIForLoggedOutUser();

    window.location.href = 'accueil.html';
}

function updateUIForLoggedOutUser() {
    document.getElementById('inscriptionButton').style.display = 'block';
    document.getElementById('loginButton').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'none';

    const manageButtons = document.getElementsByClassName('manage-btn');
    for (let i = 0; i < manageButtons.length; i++) {
        manageButtons[i].style.display = 'none';
    }
}


async function fetchUsers() {
    try {
        const response = await fetch('/get-users');
        if (!response.ok) {
            throw new Error('Problème de réseau ou de serveur');
        }
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
}

async function deleteUser(userId) {
    const currentUser = getCookie("username");

    try {
        const response = await fetch('/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currentUser })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l’utilisateur');
        }
        alert('Utilisateur supprimé avec succès');
        fetchUsers(); 
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l’utilisateur');
    }
}

function displayUsers(users) {
    const container = document.getElementById('userListContainer');
    const currentUserStatus = getCookie("userStatus");
    const currentUsername = getCookie("username"); // Récupérer le nom d'utilisateur actuel depuis les cookies
    container.innerHTML = '';

    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.id = `user-card-${user.id}`;

        const userName = document.createElement('h3');
        userName.className = 'user-name';
        userName.textContent = `Pseudo: ${user.username}`;

        const userInfo = document.createElement('p');
        userInfo.className = 'user-info';
        userInfo.textContent = `Inscription: ${formatDate(user.inscriptionDate)}`;

        const userStatus = document.createElement('p');
        userStatus.className = 'user-status';
        userStatus.textContent = `Statut: ${user.status}`;
        userCard.appendChild(userStatus);

        if (currentUserStatus === "admin" && user.username !== currentUsername) {
            const manageButton = document.createElement('button');
            manageButton.textContent = 'Gérer';
            manageButton.className = 'manage-btn';
            manageButton.onclick = () => toggleManageOptions(user.id);
            userCard.appendChild(manageButton);

            const manageOptions = document.createElement('ul');
            manageOptions.className = 'manage-options';
            manageOptions.id = `manage-options-${user.id}`;

            if (user.status !== "admin") {
                const deleteOption = document.createElement('li');
                deleteOption.textContent = 'Supprimer';
                deleteOption.onclick = () => deleteUser(user.id);
                manageOptions.appendChild(deleteOption);

                const promoteOption = document.createElement('li');
                promoteOption.textContent = 'Promouvoir en admin';
                promoteOption.onclick = () => promoteUser(user.id);
                manageOptions.appendChild(promoteOption);
            } else {
                const demoteOption = document.createElement('li');
                demoteOption.textContent = 'Démotion';
                demoteOption.onclick = () => initiateDemotionVote(user.id);
                manageOptions.appendChild(demoteOption);                
            }

            userCard.appendChild(manageOptions);
        }

        userCard.appendChild(userName);
        userCard.appendChild(userInfo);

        container.appendChild(userCard);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function toggleManageOptions(userId) {
    const manageOptions = document.getElementById(`manage-options-${userId}`);
    if (manageOptions.style.display === 'block') {
        manageOptions.style.display = 'none';
    } else {
        manageOptions.style.display = 'block';
    }
}

function showManageOptions(userId) {
    const selectedUserCard = document.getElementById(`user-card-${userId}`);
    if (!selectedUserCard.querySelector('.delete-btn')) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteUser(userId);
        selectedUserCard.appendChild(deleteButton);
    }
}

async function promoteUser(userId) {
    const currentUser = getCookie("username");

    try {
        const response = await fetch('/promote-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currentUser })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la promotion de l’utilisateur');
        }
        alert('Utilisateur promu en administrateur avec succès');
        fetchUsers();
    } catch (error) {
        console.error('Erreur lors de la promotion:', error);
        alert('Erreur lors de la promotion de l’utilisateur');
    }
}

async function initiateDemotionVote(adminId) {
    const currentUser = getCookie("username");

    try {
        const response = await fetch('/initiate-demotion-vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminId, currentUser })
        });

        if (response.ok) {
            alert('Vote pour démotion initié');
            document.getElementById('voteSection').style.display = 'block'; // Afficher la section de vote
        } else {
            throw new Error('Erreur lors de l’initiation du vote pour démotion');
        }
    } catch (error) {
        console.error('Erreur lors de l’initiation du vote pour démotion:', error);
    }
}

async function castVote(adminId, vote) {
    const currentUser = getCookie("username");

    try {
        await fetch('/cast-vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminId, vote, currentUser })
        });
        alert('Vote enregistré');
    } catch (error) {
        console.error('Erreur lors du vote:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchUsers);

