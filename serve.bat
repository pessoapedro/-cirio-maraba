@echo off
REM serve.bat - iniciar servidor local para a pasta www ou usar Firebase CLI
SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

IF NOT EXIST "www" (
  echo Pasta www\ nao encontrada. Execute este .bat na raiz do projeto.
  pause
  exit /b 1
)

REM Check for global firebase
where firebase >nul 2>&1
IF %ERRORLEVEL%==0 goto USE_FIREBASE

REM Check for npx
where npx >nul 2>&1
IF %ERRORLEVEL%==0 goto USE_NPX

goto FALLBACKS

:USE_FIREBASE
IF "%~1"=="deploy" (
  echo Deploy para Firebase Hosting: firebase deploy --only hosting
  firebase deploy --only hosting
  goto :eof
)
IF "%~1"=="serve" (
  echo Iniciando hosting local: firebase hosting:serve --port 5000
  firebase hosting:serve --port 5000
  goto :eof
)
echo Iniciando emulador de hosting (padrao): firebase emulators:start --only hosting
firebase emulators:start --only hosting
goto :eof

:USE_NPX
IF "%~1"=="deploy" (
  echo Deploy para Firebase Hosting: npx firebase deploy --only hosting
  npx firebase deploy --only hosting
  goto :eof
)
IF "%~1"=="serve" (
  echo Iniciando hosting local: npx firebase hosting:serve --port 5000
  npx firebase hosting:serve --port 5000
  goto :eof
)
REM Verifica se npx pode executar firebase sem instalar
npx firebase --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo npx firebase nao disponivel; caindo para fallbacks
  goto FALLBACKS
)
echo Iniciando emulador de hosting (padrao): npx firebase emulators:start --only hosting
npx firebase emulators:start --only hosting
goto :eof

:FALLBACKS
where python >nul 2>&1
IF %ERRORLEVEL%==0 (
  echo Python encontrado. Iniciando: python -m http.server 8000 --directory www
  pushd www
  python -m http.server 8000 --directory .
  popd
  goto :eof
)

where npx >nul 2>&1
IF %ERRORLEVEL%==0 (
  echo npx encontrado. Iniciando: npx http-server www -p 8000
  npx http-server www -p 8000
  goto :eof
)

where http-server >nul 2>&1
IF %ERRORLEVEL%==0 (
  echo http-server encontrado. Iniciando: http-server www -p 8000
  http-server www -p 8000
  goto :eof
)

echo Nenhum servidor encontrado (firebase/npx/python/http-server).
echo Instale Firebase CLI (https://firebase.google.com/docs/cli) ou Node.js (https://nodejs.org/) e rode 'npm i -g firebase-tools'.
pause
exit /b 1
