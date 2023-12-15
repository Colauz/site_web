async function addUser() {
    const firstName = document.getElementById('firstNameEntry').value;
    const lastName = document.getElementById('lastNameEntry').value;
    const username = document.getElementById('usernameEntry').value; // Ajout du pseudonyme
    const password = document.getElementById('uniquePasswordEntry').value;

    // Vérification de la longueur du prénom, du nom et du pseudonyme
    if (firstName.length <= 2 || lastName.length <= 2 || username.length <= 2) {
        alert("Le prénom, le nom et le pseudonyme doivent contenir plus de 2 caractères.");
        return;
    }

    // Vérification du mot de passe
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
        // Réinitialisez les champs de saisie
        document.getElementById('firstNameEntry').value = '';
        document.getElementById('lastNameEntry').value = '';
        document.getElementById('usernameEntry').value = '';
        document.getElementById('uniquePasswordEntry').value = '';
    } else {
        const errorText = await response.text();
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', errorText);

        // Affiche un message spécifique en fonction de l'erreur
        if (errorText.includes("Pseudonyme déjà utilisé")) {
            alert("Pseudonyme déjà utilisé, veuillez en choisir un autre.");
        } else {
            alert("Erreur lors de l'ajout de l'utilisateur.");
        }
    }
}