# 🎉 Localiza a Berlinda - App Mobile

**Aplicativo Android e iOS para rastreamento em tempo real da Santa na berlinda durante procissões**

## 📱 Recursos

- 🗺️ **Mapa em Tempo Real**: Visualiza a rota de forma interativa
- 📍 **Localização GPS**: Rastreia a localização com alta precisão
- 📏 **Cálculo de Distâncias**: Mostra distância total, percorrida e restante
- ⏱️ **Cronômetro**: Registra tempo decorrido da procissão
- 📊 **Dashboard Visual**: Cards informativos com dados atualizados
- 📱 **Responsivo**: Funciona em todos os tamanhos de tela

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ ([download](https://nodejs.org))
- Java JDK 17+ ([download](https://www.oracle.com/java/technologies/downloads/))
- Android SDK ([Android Studio](https://developer.android.com/studio))
- macOS com Xcode 15+ para compilar e publicar no iOS
- Apache Cordova (`npm install -g cordova`)

### Instalação

1. **Clonar/Abrir o projeto:**
```bash
cd c:\apps\cirio
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Instalar plugins necessários:**
```bash
cordova plugin add cordova-plugin-geolocation
cordova plugin add cordova-plugin-inappbrowser
```

4. **Compilar para Android:**
```bash
cordova build android
```

5. **Rodar no emulador/celular:**
```bash
cordova run android
```

### iOS

A plataforma iOS está declarada no projeto, mas a compilação precisa ser feita em um Mac com Xcode:

```bash
npm install
cordova platform add ios
cordova prepare ios
cordova build ios
cordova run ios
```

Execute `cordova platform add ios` em um Mac; o Cordova não instala a plataforma iOS no Windows.

Para notificações push no iOS, adicione o arquivo `GoogleService-Info.plist` ao projeto gerado no Xcode e habilite as capacidades Push Notifications e Background Modes > Remote notifications.

## 📁 Estrutura do Projeto

```
www/
├── index.html          # Página principal (layout)
├── css/
│   └── index.css      # Estilos do app
├── js/
│   ├── app.js         # Lógica principal e GPS
│   ├── map.js         # Gerenciamento do mapa
│   ├── leaflet.js     # Biblioteca de mapa (fallback)
│   └── index.js       # Inicialização Cordova
└── img/               # Imagens e ícones

platforms/android/     # Código compilado (não editar)
plugins/              # Plugins Cordova instalados
config.xml            # Configuração do app
```

## 🎯 Como Usar

1. **Abrir App**: Toque no ícone "Localiza a Berlinda"
2. **Permissões**: Conceda permissão de acesso ao GPS
3. **Iniciar**: Clique "▶️ Iniciar Rastreamento"
4. **Acompanhar**: Veja a rota e estatísticas em tempo real
5. **Parar**: Clique "⏹️ Parar Rastreamento" quando terminar
6. **Resetar**: Use "🔄 Resetar" para começar nova procissão

## 📚 Documentação

Para um guia completo e detalhado, veja [GUIA_COMPLETO.md](GUIA_COMPLETO.md)

## 🔧 Desenvolvimento

### Editar Código

Todos os arquivos estão em `www/`:
- **Estrutura**: `www/index.html`
- **Estilos**: `www/css/index.css`
- **Lógica**: `www/js/app.js`

### Testar Localmente

```bash
# Usar Live Server no VS Code
# Clique direito em index.html → Open with Live Server
```

### Compilar Novamente

```bash
# Depois de fazer mudanças:
cordova build android

# Ou para rodar direto:
cordova run android
```

### Ver Logs

```bash
# No celular via USB:
adb logcat

# Filtrar apenas o app:
adb logcat | findstr "BERLINDA"
```

## 🎨 Personalização

### Cores
Edite em `www/css/index.css`:
```css
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Distância Total
Edite em `www/js/app.js`:
```javascript
totalDistance: 5000,  // Mude para o comprimento real da procissão em metros
```

### Nome do App
Edite `config.xml`:
```xml
<name>Seu Nome Aqui</name>
```

## 📦 Gerar APK para Distribuição

### Debug (Testes)
```bash
cordova build android --debug
# Arquivo: platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### Release (Produção)
```bash
cordova build android --release

# Assinar com chave privada (uma única vez):
keytool -genkey -v -keystore my-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias

# Assinar APK:
jarsigner -sigalg SHA256withRSA -digestalg SHA256 -keystore my-key.keystore \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk my-alias

# Otimizar:
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## ⚙️ Configurações Técnicas

### Permissões (Android)

Adicionadas automaticamente:
- `ACCESS_FINE_LOCATION` - GPS de alta precisão
- `ACCESS_COARSE_LOCATION` - GPS aproximado
- `INTERNET` - Conexão de dados

### Plugins Instalados

- `cordova-plugin-geolocation` - Acesso ao GPS

### API JavaScript Usado

- **Geolocation API**: `navigator.geolocation.watchPosition()`
- **Canvas API**: Desenho do mapa em fallback
- **Local Storage**: (opcional para histórico)

## 🐛 Troubleshooting

### GPS não funciona
```javascript
// Verificar se plugin está instalado:
cordova plugin list

// Verificar permissões no celular:
Settings → Apps → Localiza a Berlinda → Permissions → Location
```

### Compilação falha
```bash
# Limpar e tentar novamente:
cordova clean
cordova build android --debug
```

### Emulador não encontra GPS
```bash
# Fornecer coordenadas simuladas:
adb emu geo fix -122.419 37.774

# Ou usar app de GPS falso (Fake GPS)
```

## 📊 Estatísticas

- **Tamanho do APK**: ~15 MB
- **Compatibilidade**: Android 9.0+ (API 28+)
- **RAM Mínima**: 256 MB
- **Espaço Mínimo**: 50 MB

## 🔐 Segurança

- ✅ Sem coleta de dados pessoais
- ✅ Localização processada localmente
- ✅ Sem armazenamento em servidores
- ✅ Permissões explícitas do usuário

## 📈 Roadmap

- [ ] Integração com Google Maps
- [ ] Histórico de procissões
- [ ] Compartilhamento de rota
- [ ] Notificações push
- [ ] Widget de tela inicial
- [ ] Modo offline
- [ ] Temas personalizáveis

## 🤝 Contribuindo

Encontrou um bug? Tem uma sugestão?

1. Abra uma issue descrevendo o problema
2. Inclua seu sistema operacional e versão
3. Descreva passos para reproduzir

## 📄 Licença

Apache License 2.0

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para acompanhar sua procissão

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2026  
**Status**: Estável ✅
