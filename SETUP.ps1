#!/bin/bash
# SCRIPT DE INICIALIZAÇÃO RÁPIDA - Windows PowerShell

# =============================================
# LOCALIZA A BERLINDA - SETUP RÁPIDO
# =============================================

Write-Host "🎉 Bem-vindo ao App Localiza a Berlinda!" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js $nodeVersion encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js não instalado. Download em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar Cordova
Write-Host ""
Write-Host "📦 Verificando Apache Cordova..." -ForegroundColor Yellow
$cordovaVersion = cordova --version 2>$null
if ($cordovaVersion) {
    Write-Host "✅ Cordova $cordovaVersion encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Cordova não instalado. Instalando..." -ForegroundColor Yellow
    npm install -g cordova
}

# Verificar Java
Write-Host ""
Write-Host "📦 Verificando Java JDK..." -ForegroundColor Yellow
$javaVersion = java -version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Java JDK encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Java JDK não instalado. Download em: https://www.oracle.com/java/technologies/" -ForegroundColor Red
    exit 1
}

# Verificar Android SDK
Write-Host ""
Write-Host "📦 Verificando Android SDK..." -ForegroundColor Yellow
if (Test-Path $env:ANDROID_HOME) {
    Write-Host "✅ Android SDK em: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "⚠️ ANDROID_HOME não configurada" -ForegroundColor Yellow
}

# Instalar dependências
Write-Host ""
Write-Host "📥 Instalando dependências do projeto..." -ForegroundColor Yellow
npm install

# Instalar plugin de geolocalização
Write-Host ""
Write-Host "📥 Instalando plugin de geolocalização..." -ForegroundColor Yellow
cordova plugin add cordova-plugin-geolocation

# Listar arquivos criados
Write-Host ""
Write-Host "📁 Arquivos do projeto:" -ForegroundColor Cyan
Write-Host "  ✓ www/index.html - Página principal" -ForegroundColor Green
Write-Host "  ✓ www/css/index.css - Estilos" -ForegroundColor Green
Write-Host "  ✓ www/js/app.js - Lógica principal" -ForegroundColor Green
Write-Host "  ✓ www/js/map.js - Gerenciador de mapa" -ForegroundColor Green
Write-Host "  ✓ www/js/leaflet.js - Biblioteca de mapa" -ForegroundColor Green
Write-Host "  ✓ README.md - Documentação" -ForegroundColor Green
Write-Host "  ✓ GUIA_COMPLETO.md - Guia detalhado" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Testar no navegador:" -ForegroundColor Yellow
Write-Host "    Abra www/index.html no navegador" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Compilar para Android:" -ForegroundColor Yellow
Write-Host "    cordova build android" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Rodar no emulador:" -ForegroundColor Yellow
Write-Host "    cordova run android" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  Rodar em celular (conecte via USB):" -ForegroundColor Yellow
Write-Host "    cordova run android" -ForegroundColor White
Write-Host ""
Write-Host "📚 Para mais detalhes, leia: GUIA_COMPLETO.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Setup completo!" -ForegroundColor Green
