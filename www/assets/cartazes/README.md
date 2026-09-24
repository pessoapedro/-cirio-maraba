Coloque aqui as imagens dos cartazes que serão exibidas na aba "Cartazes".

Como usar:
- Adicione arquivos de imagem (jpg/png/webp/svg) nesta pasta.
- Atualize `manifest.json` listando os arquivos na ordem desejada.

Exemplo `manifest.json`:
[
  { "id": "2025", "ano": "2025", "imagem": "assets/cartazes/2025.jpg" },
  { "id": "2024", "ano": "2024", "imagem": "assets/cartazes/2024.jpg" }
]

Se o `manifest.json` não existir, o `www/js/cartazes.js` usará uma lista padrão embutida.
