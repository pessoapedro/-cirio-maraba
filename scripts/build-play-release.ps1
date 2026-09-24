$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$androidRoot = Join-Path $root 'platforms\android'
$keysDir = Join-Path $root 'keys'
$keyStore = Join-Path $keysDir 'cirio-upload-key.jks'
$propertiesFile = Join-Path $androidRoot 'release-signing.properties'
$bundle = Join-Path $androidRoot 'app\build\outputs\bundle\release\app-release.aab'
$keyAlias = 'cirio-upload'

New-Item -ItemType Directory -Path $keysDir -Force | Out-Null

$securePassword = Read-Host 'Digite a senha da chave de assinatura (guarde-a com seguranca)' -AsSecureString
$passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)

try {
    if (-not (Test-Path $keyStore)) {
        & keytool -genkeypair -v -keystore $keyStore -alias $keyAlias -keyalg RSA -keysize 2048 -validity 10000 -storepass $password -keypass $password -dname 'CN=Localiza a Berlinda, OU=Mobile, O=Cirio, L=Belem, ST=PA, C=BR'
        if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel criar a chave de assinatura.' }
    }

    $keyStoreForGradle = $keyStore.Replace('\', '/')
    @(
        "storeFile=$keyStoreForGradle"
        "storePassword=$password"
        "keyAlias=$keyAlias"
        "keyPassword=$password"
    ) | Set-Content -Path $propertiesFile -Encoding ASCII

    Push-Location $androidRoot
    & .\gradlew.bat bundleRelease "-PcdvReleaseSigningPropertiesFile=$propertiesFile"
    $buildExitCode = $LASTEXITCODE
    Pop-Location
    if ($buildExitCode -ne 0) { throw 'O build de release falhou.' }

    if (-not (Test-Path $bundle)) { throw "Bundle nao encontrado: $bundle" }
    & jarsigner -verify $bundle
    if ($LASTEXITCODE -ne 0) { throw 'O bundle foi gerado, mas nao passou na verificacao de assinatura.' }

    Write-Host "Bundle assinado criado em: $bundle"
}
finally {
    if (Test-Path $propertiesFile) { Remove-Item $propertiesFile -Force }
    if ($passwordPtr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr) }
    $password = $null
}
