@echo off
title Servidor Local - Sanchis Asesores
echo ========================================================
echo Iniciando servidor en http://localhost:3000 ...
echo No cierres esta ventana para que la web siga activa.
echo ========================================================
cd /d "%~dp0"
npm run dev
pause
