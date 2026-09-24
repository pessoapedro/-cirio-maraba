# PowerShell script to install Cordova FCM plugins (run as Administrator if execution policy blocks)
# Usage: Open PowerShell as Administrator and run: .\scripts\install-fcm-plugins.ps1
Set-Location -Path (Join-Path $PSScriptRoot '..')
Write-Host "Instalando plugins FCM nativos e local-notification via npx cordova..."

$npx = "npx"
& $npx -y cordova plugin add cordova-plugin-firebase-messaging
& $npx -y cordova plugin add cordova-plugin-fcm-with-dependecies
& $npx -y cordova plugin add cordova-plugin-local-notification

Write-Host "Concluído. Verifique a saída para possíveis erros."
