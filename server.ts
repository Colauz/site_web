import { serve } from "https://deno.land/std@0.123.0/http/server.ts";
import { join } from "https://deno.land/std@0.123.0/path/mod.ts";

const currentDirectory = Deno.cwd();

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === "/favicon.ico") {
        return new Response(null, { status: 404 });
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
                throw new Error('Erreur lors de la communication avec le serveur des utilisateurs');
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

    let filePath = path === "/" ? "index.html" : path.substring(1);
    filePath = join(currentDirectory, filePath);
    let contentType = "text/html"; 

    try {
        const file = await Deno.readFile(filePath);
        const fileContent = new TextDecoder().decode(file);
        return new Response(fileContent, {
            headers: { "content-type": contentType }
        });
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier :", error.message);
        return new Response("Page non trouvée", { status: 404 });
    }
}

console.log("Serveur principal démarré sur http://localhost:8000");
serve(handler, { port: 8000 });
