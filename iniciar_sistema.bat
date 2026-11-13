@echo off
title Sistema Multi-Modo - Restaurante Chivo al Campo
color 0E
echo ========================================================
echo   RESTAURANTE CHIVO AL CAMPO - VILLA ELISA, MONTE CRISTI
echo   Proyecto Integrador - UTESA
echo ========================================================
echo.
echo Iniciando servidor Node.js en http://localhost:3000...
echo.

start "" "http://localhost:3000/"
node server.js

pause
