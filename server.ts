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

    if (req.method === "POST" && path === "/login") {
        try {
            const loginData = await req.json();
            const users = JSON.parse(await Deno.readTextFile(usersFile));
    
            const user = users.find(u => u.username === loginData.username);
            if (user && user.password === loginData.password) {
                // Les identifiants sont corrects
                return new Response(JSON.stringify({ username: user.username }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            } else {
                // Identifiants incorrects
                return new Response("Identifiants incorrects", { status: 401 });
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error.message);
            return new Response("Erreur lors de la connexion", { status: 500 });
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
