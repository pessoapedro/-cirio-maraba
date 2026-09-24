@echo off
REM build-android.bat: copia google-services e executa build Cordova Android
cd /d %~dp0\..
if exist google-services.json (
  echo Copiando google-services.json para platforms/android/app/
  copy /Y google-services.json platforms\android\app\google-services.json
) else (
  echo google-services.json nao encontrado na raiz. Pulando copia.
)
npx -y cordova build android
necho Build finalizado (verifique erros acima)
pause
