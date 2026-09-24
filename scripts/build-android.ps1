# PowerShell: copia google-services e executa build Cordova Android
Set-Location -Path (Join-Path $PSScriptRoot '..')
if(Test-Path -Path "google-services.json"){
  Write-Host "Copiando google-services.json para platforms/android/app/"
  Copy-Item -Path "google-services.json" -Destination "platforms/android/app/google-services.json" -Force
} else {
  Write-Host "google-services.json nao encontrado na raiz. Pulando copia."
}

Write-Host "Executando build: npx cordova build android"
$npx = "npx"
& $npx -y cordova build android
Write-Host "Build finalizado (verifique erros acima)."
