@echo off
echo Fermeture des serveurs Deno...

taskkill /F /IM deno.exe /T

echo Les serveurs ont été fermés.
