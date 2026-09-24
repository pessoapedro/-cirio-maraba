@echo off
REM Executar deste diretório do repositório: c:\apps\cirio
cd /d %~dp0\..
echo Instalando plugins FCM nativos e local-notification via npx cordova...
npx -y cordova plugin add cordova-plugin-firebase-messaging
npx -y cordova plugin add cordova-plugin-fcm-with-dependecies
npx -y cordova plugin add cordova-plugin-local-notification
echo Plugins instalados (verifique mensagens acima para erros)
pause
