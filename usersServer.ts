import { serve } from "https://deno.land/std@0.123.0/http/server.ts";
import { join } from "https://deno.land/std@0.123.0/path/mod.ts";

const currentDirectory = Deno.cwd();
const usersFile = join(currentDirectory, "users.json");

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
    const decoded = atob(encoded); 
    const [username, password] = decoded.split(":");

    return username === USERNAME && password === PASSWORD;
}

async function handler(req: Request): Promise<Response> {
    console.log("Requête reçue : ", req.method, req.url); // Log pour suivre la requête

    if (!checkAuth(req)) {
        console.log("Échec de l'authentification");
        return new Response("Non autorisé", {
            status: 401,
            headers: { "WWW-Authenticate": 'Basic realm="Accès restreint"', "Content-Type": "text/plain" }
        });
    }

    if (req.method === "GET" && (req.url === "http://localhost:8001/" || req.url === "/")) {
        console.log("Traitement de la route racine pour afficher users.json");
        try {
            const users = await Deno.readTextFile(usersFile);
            return new Response(users, {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Erreur lors de la lecture du fichier users.json :", error.message);
            return new Response("Erreur lors de la lecture du fichier users.json", { status: 500 });
        }
    }
    
    console.log("URL demandée :", req.url);

    if (req.method === "GET" && req.url.endsWith("/users")) {
        console.log("Traitement de /users");
        try {
            const users = await Deno.readTextFile(usersFile);
            return new Response(users, {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Erreur lors de la lecture des utilisateurs :", error.message);
            return new Response("Erreur lors de la lecture des utilisateurs", { status: 500 });
        }
    }

    console.log("URL demandée :", req.url);

    if (req.method === "POST" && req.url.endsWith("/add-user")) {
        console.log("Traitement de /add-user");
        try {
            const formData = await req.json();
            formData.status = "user";
            const users = JSON.parse(await Deno.readTextFile(usersFile)) || [];

            if (users.some(user => user.username === formData.username)) {
                return new Response("Pseudonyme déjà utilisé, veuillez en choisir un autre.", { status: 400 });
            }

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
    } else if (req.url.endsWith("/favicon.ico")) {
        console.log("Requête favicon.ico reçue");
        return new Response(null, { status: 204 });
    } else {
        console.log("Méthode non supportée pour l'URL :", req.url);
        return new Response("Méthode non supportée", { status: 405 });
    }
    
}

console.log("Serveur des utilisateurs démarré sur http://localhost:8001");
initializeUsersFile();
serve(handler, { port: 8001 });
