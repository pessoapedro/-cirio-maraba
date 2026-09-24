<#
Serve.ps1
Script para iniciar um servidor HTTP local para a pasta www\
Uso: abra PowerShell na raiz do projeto e execute:
    .\serve.ps1

O script tenta, nesta ordem:
 1. python -m http.server
 2. npx http-server
Se nenhum estiver disponível, exibe instruções rápidas.
#>

$wwwPath = Join-Path -Path (Get-Location) -ChildPath "www"
if (-not (Test-Path $wwwPath)) {
    Write-Error "Pasta 'www' não encontrada em: $((Get-Location).Path)"
    exit 1
}

function Try-PythonServer {
    $py = Get-Command python -ErrorAction SilentlyContinue
    if ($py) {
        Write-Host "Python encontrado: $($py.Path)" -ForegroundColor Green
        Write-Host "Iniciando: python -m http.server 8000 --directory www" -ForegroundColor Cyan
        Push-Location $wwwPath
        python -m http.server 8000 --directory . | Out-Host
        Pop-Location
        return $true
    }
    return $false
}

function Try-NpxServer {
    $npx = Get-Command npx -ErrorAction SilentlyContinue
    if ($npx) {
        Write-Host "npx encontrado: $($npx.Path)" -ForegroundColor Green
        Write-Host "Iniciando: npx http-server www -p 8000" -ForegroundColor Cyan
        npx http-server "$wwwPath" -p 8000
        return $true
    }
    return $false
}

function Try-HttpServerGlobal {
    $hs = Get-Command http-server -ErrorAction SilentlyContinue
    if ($hs) {
        Write-Host "http-server encontrado globalmente: $($hs.Path)" -ForegroundColor Green
        Write-Host "Iniciando: http-server www -p 8000" -ForegroundColor Cyan
        http-server "$wwwPath" -p 8000
        return $true
    }
    return $false
}

# Tentativas
if (Try-PythonServer) { exit 0 }
if (Try-NpxServer) { exit 0 }
if (Try-HttpServerGlobal) { exit 0 }

Write-Host "Nenhum servidor encontrado (python/npx/http-server)." -ForegroundColor Yellow
Write-Host "Opções para configurar rapidamente:" -ForegroundColor Cyan
Write-Host "1) Instalar Python: https://www.python.org/downloads/" -ForegroundColor Gray
Write-Host "   Depois execute: python -m http.server 8000 --directory www" -ForegroundColor Gray
Write-Host "2) Instalar Node.js (inclui npm): https://nodejs.org/" -ForegroundColor Gray
Write-Host "   Depois execute: npx http-server www -p 8000" -ForegroundColor Gray
Write-Host "Se o PowerShell bloquear execução de scripts, rode temporariamente (somente nesta sessão):" -ForegroundColor Magenta
Write-Host "  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force" -ForegroundColor Magenta

exit 1
