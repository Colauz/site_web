async function addUser() {
    const firstName = document.getElementById('firstNameEntry').value;
    const lastName = document.getElementById('lastNameEntry').value;
    const password = document.getElementById('uniquePasswordEntry').value;

    // Vérification de la longueur du prénom et du nom
    if (firstName.length <= 2 || lastName.length <= 2) {
        alert("Le prénom et le nom doivent contenir plus de 2 caractères.");
        return;
    }

    // Vérification du mot de passe
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{7,}$/;
    if (!passwordRegex.test(password)) {
        alert("Le mot de passe doit contenir au moins 7 caractères, une majuscule et un caractère spécial.");
        return;
    }

    console.log("Envoi des données :", { firstName, lastName, password });

    const response = await fetch('/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, password })
    });

    if (response.ok) {
        console.log('Utilisateur ajouté');
        document.getElementById('firstNameEntry').value = '';
        document.getElementById('lastNameEntry').value = '';
        document.getElementById('uniquePasswordEntry').value = '';
    } else {
        console.error('Erreur lors de l\'ajout de l\'utilisateur');
    }
}
