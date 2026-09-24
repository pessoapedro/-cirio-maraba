Coloque aqui a imagem de splash que deseja usar para gerar os recursos nativos.

Recomendações:
- Nome do arquivo: `splash.png` ou `splash.svg`
- Resolução sugerida (SVG recomendado): 2732x2732 (arquivo quadrado, imagem centralizada)

Como gerar recursos Android/iOS após adicionar a imagem:

```powershell
cd C:\apps\cirio
npx cordova-res android --copy
npx cordova-res ios --copy
```

Se preferir, substitua `splash.svg` por sua imagem real e execute os comandos acima.
