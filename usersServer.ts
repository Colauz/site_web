import { serve } from "https://deno.land/std@0.123.0/http/server.ts";
import { join } from "https://deno.land/std@0.123.0/path/mod.ts";

const currentDirectory = Deno.cwd();
const usersFile = join(currentDirectory, "users.json");

// Remplacer par vos propres identifiants
const USERNAME = "Admin";
const PASSWORD = "1234";

async function initializeUsersFile() {
    try {
        await Deno.readTextFile(usersFile);
    } catch {
        await Deno.writeTextFile(usersFile, JSON.stringify([]));
    }
}

function checkAuth(req: Request): boolean {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return false;

    const encoded = authHeader.replace("Basic ", "");
    const decoded = atob(encoded); // Decode base64
    const [username, password] = decoded.split(":");

    return username === USERNAME && password === PASSWORD;
}

async function handler(req: Request): Promise<Response> {
    // Vérifier l'authentification pour toutes les requêtes
    if (!checkAuth(req)) {
        return new Response("Non autorisé", {
            status: 401,
            headers: { "WWW-Authenticate": 'Basic realm="Accès restreint"', "Content-Type": "text/plain" }
        });
    }

    if (req.method === "GET" && req.url.endsWith("/")) {
        try {
            const usersData = await Deno.readTextFile(usersFile);
            return new Response(usersData, {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error.message);
            return new Response("Erreur lors de la récupération des utilisateurs", { status: 500 });
        }
    }

    if (req.method === "POST" && req.url.endsWith("/add-user")) {
        try {
            const formData = await req.json();
            const users = JSON.parse(await Deno.readTextFile(usersFile)) || [];
            const userId = users.length + 1;
            const newUser = { id: userId, ...formData };
            users.push(newUser);
            await Deno.writeTextFile(usersFile, JSON.stringify(users, null, 2));
            return new Response(JSON.stringify(newUser), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'utilisateur :", error.message);
            return new Response("Erreur lors de l'ajout de l'utilisateur", { status: 500 });
        }
    }

    // Réponse par défaut pour les autres requêtes/méthodes
    return new Response("Méthode non supportée", { status: 405 });
}

console.log("Serveur des utilisateurs démarré sur http://localhost:8001");
initializeUsersFile();
serve(handler, { port: 8001 });
