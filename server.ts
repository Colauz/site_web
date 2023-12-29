import { serve } from "https://deno.land/std@0.123.0/http/server.ts";
import { join } from "https://deno.land/std@0.123.0/path/mod.ts";

const currentDirectory = Deno.cwd();
const usersFile = join(currentDirectory, "users.json");

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === "/favicon.ico") {
        return new Response(null, { status: 404 });
    }

    if (path === "/") {
        try {
            const filePath = join(currentDirectory, "accueil.html");
            const file = await Deno.readFile(filePath);
            const fileContent = new TextDecoder().decode(file);
            return new Response(fileContent, {
                headers: { "content-type": "text/html" }
            });
        } catch (error) {
            console.error("Erreur lors de la lecture de accueil.html :", error.message);
            return new Response("Page non trouvée", { status: 404 });
        }
    }
    
    if (path === "/index") {
        try {
            const filePath = join(currentDirectory, "inscription.html");
            const file = await Deno.readFile(filePath);
            const fileContent = new TextDecoder().decode(file);
            return new Response(fileContent, {
                headers: { "content-type": "text/html" }
            });
        } catch (error) {
            console.error("Erreur lors de la lecture de inscription.html :", error.message);
            return new Response("Page non trouvée", { status: 404 });
        }
    }

    if (req.method === "POST" && path === "/add-user") {
        try {
            const formData = await req.json();
            console.log("Données reçues :", formData);

            formData.inscriptionDate = new Date().toISOString();

            const credentials = btoa("Admin:1234");
            const authHeader = `Basic ${credentials}`;

            const response = await fetch("http://localhost:8001/add-user", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erreur lors de l'ajout de l'utilisateur :", errorText);
                return new Response(errorText, { status: response.status });
            }

            const newUser = await response.json();
            return new Response(JSON.stringify(newUser), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'utilisateur :", error.message);
            return new Response("Erreur lors de l'ajout de l'utilisateur", { status: 500 });
        }
    }

    if (path === "/style.css") {
        try {
            const filePath = join(currentDirectory, "style_inscription.css");
            const file = await Deno.readFile(filePath);
            const fileContent = new TextDecoder().decode(file);
            return new Response(fileContent, {
                headers: { "content-type": "text/css" }
            });
        } catch (error) {
            console.error("Erreur lors de la lecture du fichier CSS d'inscription :", error.message);
            return new Response("Fichier CSS non trouvé", { status: 404 });
        }
    }

    if (path === "/style_accueil.css") {
        try {
            const filePath = join(currentDirectory, "style_accueil.css");
            const file = await Deno.readFile(filePath);
            const fileContent = new TextDecoder().decode(file);
            return new Response(fileContent, {
                headers: { "content-type": "text/css" }
            });
        } catch (error) {
            console.error("Erreur lors de la lecture du fichier style_accueil.css :", error.message);
            return new Response("Fichier CSS non trouvé", { status: 404 });
        }
    }

    if (path === "/style_inscription.css") {
        try {
            const filePath = join(currentDirectory, "style_inscription.css");
            const file = await Deno.readFile(filePath);
            const fileContent = new TextDecoder().decode(file);
            return new Response(fileContent, {
                headers: { "content-type": "text/css" }
            });
        } catch (error) {
            console.error("Erreur lors de la lecture du fichier style_inscription.css :", error.message);
            return new Response("Fichier CSS non trouvé", { status: 404 });
        }
    }

    if (path === "/style_connexion.css") {
        try {
            const filePath = join(currentDirectory, "style_connexion.css");
            const file = await Deno.readFile(filePath);
            const fileContent = new TextDecoder().decode(file);
            return new Response(fileContent, {
                headers: { "content-type": "text/css" }
            });
        } catch (error) {
            console.error("Erreur lors de la lecture du fichier style_connexion.css :", error.message);
            return new Response("Fichier CSS non trouvé", { status: 404 });
        }
    }

    if (req.method === "POST" && path === "/login") {
        try {
            const loginData = await req.json();
            const users = JSON.parse(await Deno.readTextFile(usersFile));
    
            const user = users.find(u => u.username === loginData.username);
            if (user && user.password === loginData.password) {
                console.log(`Utilisateur connecté : ${user.username}`);
                return new Response(JSON.stringify({ username: user.username, status: user.status }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            } else {
                return new Response("Identifiants incorrects", { status: 401 });
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error.message);
            return new Response("Erreur lors de la connexion", { status: 500 });
        }
    }

    if (req.method === "POST" && path === "/logout") {
        try {
            const logoutData = await req.json();
            console.log(`Utilisateur déconnecté : ${logoutData.username}`);

            return new Response("Déconnexion réussie", { status: 200 });
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error.message);
            return new Response("Erreur lors de la déconnexion", { status: 500 });
        }
    }

if (path === "/get-users") {
    try {
        const users = JSON.parse(await Deno.readTextFile(usersFile));
        return new Response(JSON.stringify(users), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error.message);
        return new Response("Erreur lors de la récupération des utilisateurs", { status: 500 });
    }
}

if (req.method === "POST" && path === "/delete-user") {
    try {
        const { userId, currentUser } = await req.json();
        let users = JSON.parse(await Deno.readTextFile(usersFile));

        const requestingUser = users.find(user => user.username === currentUser);

        if (!requestingUser || requestingUser.status !== "admin") {
            return new Response("Opération non autorisée", { status: 403 });
        }

        const userToDelete = users.find(user => user.id === userId);
        if (!userToDelete) {
            return new Response("Utilisateur non trouvé", { status: 404 });
        }

        users = users.filter(user => user.id !== userId);
        await Deno.writeTextFile(usersFile, JSON.stringify(users, null, 2));

        console.log(`Utilisateur '${userToDelete.username}' supprimé par l'administrateur '${currentUser}'`);

        return new Response("Utilisateur supprimé", { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur :", error.message);
        return new Response("Erreur lors de la suppression de l'utilisateur", { status: 500 });
    }
}

    try {
        const filePath = join(currentDirectory, path.substring(1));
        const file = await Deno.readFile(filePath);
        const fileContent = new TextDecoder().decode(file);
        return new Response(fileContent, {
            headers: { "content-type": "text/html" }
        });
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier :", error.message);
        return new Response("Page non trouvée", { status: 404 });
    }
}

console.log("Serveur principal démarré sur http://localhost:8000");
serve(handler, { port: 8000 });
