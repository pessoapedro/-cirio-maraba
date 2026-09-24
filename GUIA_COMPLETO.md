# 📱 GUIA COMPLETO: APP DE RASTREAMENTO DA BERLINDA COM CORDOVA

## 🎯 **OBJETIVO DO APLICATIVO**

Criar um aplicativo Android que mostra em **tempo real** a localização da Santa na berlinda durante uma procissão, contendo:
- ✅ Mapa interativo em tempo real
- ✅ Distância total do percurso
- ✅ Distância já percorrida
- ✅ Distância restante
- ✅ Tempo decorrido da procissão

---

## 📑 ÍNDICE DO GUIA

1. **ETAPA 1** - Preparação do Ambiente
2. **ETAPA 2** - Entender Seu Projeto Cordova
3. **ETAPA 3** - Layout das Telas (HTML)
4. **ETAPA 4** - Estilização (CSS)
5. **ETAPA 5** - Funcionalidades (JavaScript)
6. **ETAPA 6** - Plugins do Cordova
7. **ETAPA 7** - Testes
8. **ETAPA 8** - Gerar APK
9. **ETAPA 9** - Personalização Final
10. **ETAPA 10** - Checklist Final

---

## 🎯 **ETAPA 1 – PREPARAÇÃO DO AMBIENTE**

### **1.1 Instalação do Node.js**

O Node.js é a base para usar Cordova. Ele inclui o npm (gerenciador de pacotes).

**Passos:**
1. Acesse [nodejs.org](https://nodejs.org)
2. Baixe a versão **LTS (Long Term Support)** - recomendo v20 ou superior
3. Execute o instalador como administrador
4. Escolha as opções padrão (inclui npm automaticamente)
5. **Reinicie o computador**

**Verificar se foi instalado:**
```powershell
node --version
npm --version
```

Você deve ver algo como:
```
v20.x.x
10.x.x
```

---

### **1.2 Instalação do Apache Cordova**

Cordova permite criar apps Android usando HTML/CSS/JavaScript.

**Instalar globalmente (abrir PowerShell como admin):**
```powershell
npm install -g cordova
```

**Verificar instalação:**
```powershell
cordova --version
```

Deve mostrar: `cordova@12.x.x` (ou versão similar)

---

### **1.3 Instalação do Java JDK**

Android precisa do Java Development Kit para compilar o código.

**Passos:**
1. Acesse [oracle.com/java/technologies](https://www.oracle.com/java/technologies/downloads/)
2. Baixe **Java Development Kit (JDK) 17 ou superior**
3. Execute o instalador como administrador
4. Escolha caminho padrão (geralmente `C:\Program Files\Java\jdk-17`)
5. **Reinicie o computador**

**Verificar:**
```powershell
java -version
javac -version
```

---

### **1.4 Instalação do Android Studio**

É a ferramenta oficial da Google para desenvolvimento Android.

**Passos detalhados:**

1. Acesse [developer.android.com/studio](https://developer.android.com/studio)
2. Clique em "Download Android Studio"
3. Aceite os termos
4. Execute o instalador como administrador
5. Escolha caminho padrão
6. Na tela de componentes, certifique-se que estão selecionados:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (para emulador)
7. Clique "Next" e aguarde a instalação (~3-5 GB)
8. Abra o Android Studio

**Configurar SDK Manager:**
1. Abra Android Studio
2. Menu superior: **Tools → SDK Manager**
3. Aba **SDK Platforms**, instale:
   - Android 14 (API level 34)
   - Android 13 (API level 33)
   - Android 12 (API level 31) - IMPORTANTE
4. Aba **SDK Tools**, instale:
   - Android SDK Build-Tools (versão 34.x)
   - Android Emulator
   - Android SDK Platform-Tools
5. Clique "OK" e aguarde

---

### **1.5 Configurar Variáveis de Ambiente**

Seu computador precisa saber onde estão Java e Android.

**Abra PowerShell como Administrador e execute:**

```powershell
# Variável JAVA_HOME
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", [EnvironmentVariableTarget]::User)

# Variável ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", [EnvironmentVariableTarget]::User)

# Adicionar Java ao PATH
$path = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
$newPath = "$path;C:\Program Files\Java\jdk-17\bin"
[Environment]::SetEnvironmentVariable("PATH", $newPath, [EnvironmentVariableTarget]::User)

# Adicionar Android ao PATH
$androidPath = "$([Environment]::GetEnvironmentVariable('ANDROID_HOME', [EnvironmentVariableTarget]::User))\tools;$([Environment]::GetEnvironmentVariable('ANDROID_HOME', [EnvironmentVariableTarget]::User))\platform-tools"
$finalPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User) + ";$androidPath"
[Environment]::SetEnvironmentVariable("PATH", $finalPath, [EnvironmentVariableTarget]::User)

# Reiniciar PowerShell completamente para aplicar mudanças
```

**Após executar, feche TODOS os PowerShell e abra um novo.**

**Verificar:**
```powershell
adb --version
```

Deve mostrar: `Android Debug Bridge version x.x.x`

---

### **1.6 Visual Studio Code**

Já deve estar instalado. Instale as extensões recomendadas:

1. Abra VS Code
2. Clique em **Extensions** (ícone de quadrados)
3. Procure e instale:
   - **Cordova Tools** (Microsoft)
   - **Android Extension Pack** (Microsoft)
   - **HTML CSS Support**
   - **JavaScript (ES6) code snippets**
   - **Prettier** (formatador de código)

---

## 🎯 **ETAPA 2 – ESTRUTURA DO PROJETO CORDOVA**

Seu projeto já existe em: `c:\apps\cirio`

### **Estrutura de Pastas:**

```
cirio/
├── www/                          ← Você trabalha AQUI
│   ├── index.html               ← Página principal (HTML)
│   ├── css/
│   │   └── index.css            ← Estilos do app (CSS)
│   ├── js/
│   │   ├── app.js               ← Lógica principal
│   │   ├── map.js               ← Gerenciamento do mapa
│   │   ├── leaflet.js           ← Biblioteca de mapa (opcional)
│   │   └── index.js             ← Inicialização (template padrão)
│   └── img/                     ← Imagens
│
├── platforms/                    ← Gerado automaticamente (NÃO editar)
│   └── android/                 ← Código Android compilado
│
├── plugins/                      ← Plugins instalados
│
├── config.xml                    ← Configuração do app
└── package.json                  ← Dependências do projeto
```

### **Ciclo de Desenvolvimento:**

```
1. Você edita código em www/
   ↓
2. Compila com: cordova build android
   ↓
3. Código é copiado para platforms/android/
   ↓
4. Android SDK compila tudo
   ↓
5. Gera APK em platforms/android/app/build/outputs/apk/
```

---

## 🎯 **ETAPA 3 – LAYOUT DAS TELAS (HTML)**

O layout já foi criado! Aqui está o que inclui:

### **Estrutura HTML:**

```html
<header>               ← Cabeçalho com título
  
<container>            ← Conteúdo principal
  <map-section>       ← Mapa com status
  <info-cards>        ← 4 cards com informações
  <action-buttons>    ← Botões de controle
  <modal>             ← Informações da procissão
  
<footer>              ← Rodapé
```

### **O que cada parte faz:**

| Elemento | Função |
|----------|--------|
| Header | Título "Localiza a Berlinda" |
| Mapa | Visualização da rota em tempo real |
| Card Total | Mostra distância total (5 km) |
| Card Percorrida | Mostra quanto já foi percorrido |
| Card Restante | Mostra quanto falta |
| Card Tempo | Mostra tempo decorrido |
| Botão Iniciar | Começa o rastreamento |
| Botão Parar | Interrompe o rastreamento |
| Botão Resetar | Limpa dados e recomeça |
| Botão Info | Mostra informações sobre o app |
| Modal | Janela com detalhes da procissão |

---

## 🎯 **ETAPA 4 – ESTILIZAÇÃO (CSS)**

O CSS já foi criado com:

### **Design Responsivo:**

- **Celular** (até 767px): Grid com 2 colunas
- **Tablet+** (768px+): Grid com 4 colunas

### **Cores Principais:**

```css
Gradiente Roxo: #667eea → #764ba2  (cabeçalho, botões)
Verde:          #48bb78             (distância percorrida)
Laranja:        #f6ad55             (distância restante)
Azul:           #667eea             (tempo decorrido)
```

### **Animações:**

- **Hover nos cards**: Sobe 2px com sombra maior
- **Modal**: Fade in + slide down
- **Loading**: Pulsação contínua

---

## 🎯 **ETAPA 5 – FUNCIONALIDADES (JAVASCRIPT)**

### **Como Funciona:**

#### **1️⃣ Inicialização**
```javascript
// App inicia quando documento carrega
const app = {
  state: {
    isTracking: false,
    totalDistance: 5000,    // 5 km
    coveredDistance: 0,
    positions: [],
  }
}
```

#### **2️⃣ Rastreamento GPS**
```javascript
app.startTracking()
  ↓
navigator.geolocation.watchPosition()  // Monitora posição
  ↓
onLocationUpdate()  // Chamado a cada mudança de localização
  ↓
calculateDistance() // Calcula distância com Haversine
```

#### **3️⃣ Cálculo de Distância**
Usa a **fórmula de Haversine** (cálculo matemático preciso):
```javascript
// Calcula distância em metros entre dois pontos GPS
distance = calculateDistance(lat1, lng1, lat2, lng2)
// Raio da Terra = 6.371.000 metros
```

#### **4️⃣ Atualização em Tempo Real**
```
GPS detecta movimento
     ↓
Calcula distância percorrida
     ↓
Atualiza cards na tela
     ↓
Desenha rota no mapa
     ↓
Atualiza cronômetro
```

#### **5️⃣ Cronômetro**
```javascript
startTimer()
  ↓
setInterval(1000)  // A cada 1 segundo
  ↓
formatTime(seconds) // Converte para HH:MM:SS
```

### **Fluxo Completo:**

```
┌─────────────────────────────────────┐
│  USUARIO CLICA "INICIAR"            │
└────────────────┬────────────────────┘
                 ↓
         ┌───────────────┐
         │ app.init()    │ ← Inicia
         └───────┬───────┘
                 ↓
    ┌────────────────────────┐
    │ Solicita Permissão GPS │
    └────────┬───────────────┘
             ↓
    ┌────────────────────────┐
    │ Obtem Localização      │
    │ Inicial                │
    └────────┬───────────────┘
             ↓
    ┌────────────────────────┐
    │ Inicializa Mapa        │
    └────────┬───────────────┘
             ↓
    ┌────────────────────────┐
    │ app.watchPosition()    │ ← Monitora em tempo real
    └────────┬───────────────┘
             ↓
        (A cada mudança)
             ↓
    ┌────────────────────────┐
    │ onLocationUpdate()     │
    └────────┬───────────────┘
             ↓
    ┌────────────────────────┐
    │ calculateDistance()    │
    └────────┬───────────────┘
             ↓
    ┌────────────────────────┐
    │ coveredDistance += d   │
    └────────┬───────────────┘
             ↓
    ┌────────────────────────┐
    │ updateUI()             │ ← Atualiza cards
    └────────┬───────────────┘
             ↓
    ┌────────────────────────┐
    │ updateMap()            │ ← Redesenha rota
    └────────┬───────────────┘
             ↓
        (Volta ao loop)
```

---

## 🎯 **ETAPA 6 – PLUGINS DO CORDOVA**

### **O que é um Plugin?**

Plugins são "extensões" que dão acesso a recursos do celular:
- 📍 GPS (geolocalização)
- 📱 Câmera
- 📞 Contatos
- 🔊 Áudio
- etc.

### **Instalando Geolocation**

Abra o terminal na pasta `c:\apps\cirio` e execute:

```powershell
# Instalar plugin de geolocalização
cordova plugin add cordova-plugin-geolocation

# Verificar instalação
cordova plugin list
```

Você deve ver:
```
cordova-plugin-geolocation x.x.x
```

### **Permissões no Android**

O arquivo `platforms/android/app/src/main/AndroidManifest.xml` deve ter:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**Nota**: O Cordova adiciona automaticamente. Se precisar adicionar manualmente:

1. Abra `config.xml` na raiz do projeto
2. Adicione:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### **Como Usar no JavaScript**

```javascript
// Obter posição uma vez
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('Latitude:', position.coords.latitude);
    console.log('Longitude:', position.coords.longitude);
    console.log('Precisão:', position.coords.accuracy, 'metros');
  },
  (error) => {
    console.error('Erro:', error.message);
  }
);

// Monitorar posição continuamente
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    // Chamado toda vez que a posição muda
  },
  (error) => {
    // Erro ao obter posição
  }
);

// Parar monitoramento
navigator.geolocation.clearWatch(watchId);
```

---

## 🎯 **ETAPA 7 – TESTES**

### **7.1 Testando no Navegador**

É a forma mais rápida de começar!

**Passos:**

1. Abra VS Code
2. Pressione **Ctrl + Shift + P**
3. Digite: `Live Server: Open with Live Server`
4. Browser abrirá em `http://localhost:5500`
5. Abra console com **F12** para ver logs

**O que testar:**
- ✅ Layout carrega corretamente
- ✅ Botões funcionam
- ✅ Modal abre/fecha
- ✅ Cards existem

**Limitações no navegador:**
- ❌ GPS não funciona (sem permissão)
- ❌ Geolocation retorna erro
- ⚠️ Usa simulação no código

### **7.2 Testando no Emulador Android**

Emula um celular no seu computador.

**Pré-requisito**: Android Studio instalado e SDK configurado.

**Passos:**

1. Abra Android Studio
2. Menu: **Tools → AVD Manager**
3. Clique **Create Virtual Device**
4. Escolha: **Pixel 4a** → **Next**
5. Escolha: **Android 12** (ou 13/14) → **Next**
6. Configure emulador
7. Clique **Finish**
8. Clique ▶️ para iniciar emulador

**Aguarde 2-3 minutos...**

Quando emulador estiver pronto, no terminal:

```powershell
cd c:\apps\cirio

# Compilar para Android
cordova build android

# Instalar e rodar no emulador
cordova run android
```

**Aguarde compilação... (~2-5 minutos na primeira vez)**

### **7.3 Testando em Celular Real**

É o teste mais importante!

**Pré-requisitos:**
- Celular Android conectado via USB
- USB Debugging ativado no celular

**Ativar USB Debugging:**

1. Abra **Configurações** no celular
2. Vá para **Sobre o Telefone**
3. Toque 7x em **Número da Versão**
4. Volta para **Configurações**
5. Vá para **Opções de Desenvolvedor**
6. Ative **Depuração USB**

**Compilar e instalar:**

```powershell
cd c:\apps\cirio

# Conectar celular via USB
# Verificar conexão:
adb devices

# Você deve ver algo como:
# List of attached devices
# ZY226DXXXX          device

# Compilar e instalar
cordova run android

# Sau usar debug direto:
cordova build android --debug
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

**Testar app no celular:**

1. Ative GPS
2. Clique **Iniciar Rastreamento**
3. Caminhe (se puder) ou:
   - Simule movimento usando o emulador de localização
   - Ou use app "Fake GPS" na Play Store

### **7.4 Corrigindo Erros Comuns**

#### **Erro: "cordova: command not found"**
```powershell
# Solução: Reinstalar Cordova
npm install -g cordova

# Reiniciar PowerShell completamente
```

#### **Erro: "android.jar not found"**
```powershell
# Solução: SDK não configurado corretamente
# Abra Android Studio → Tools → SDK Manager
# Instale Android 12+ SDK Platform
```

#### **Erro: "Unable to resolve activity MainActivity"**
```powershell
# Solução: Compilar novamente
cordova clean
cordova build android
```

#### **GPS sempre retorna erro**
```javascript
// Verificar se geolocation está disponível
if (navigator.geolocation) {
  // OK
} else {
  // Plugin não instalado
}

// Verificar log:
adb logcat | findstr "geolocation"
```

### **7.5 Usando Console e Logs**

**No navegador:**
```powershell
# Pressione F12
# Console abrirá
# Veja logs em tempo real
```

**No celular (via USB):**
```powershell
# Ver logs em tempo real:
adb logcat

# Filtrar apenas app:
adb logcat | findstr "BERLINDA"

# Salvar logs em arquivo:
adb logcat > logs.txt
```

**No JavaScript:**
```javascript
// Logs diferentes
console.log('ℹ️ Info');        // Azul
console.warn('⚠️ Aviso');      // Amarelo  
console.error('❌ Erro');       // Vermelho
console.info('ℹ️ Informação');  // Azul

// Ver valores de variáveis
console.log('Estado:', app.state);
console.log('Localização atual:', app.state.currentLocation);
```

---

## 🎯 **ETAPA 8 – GERAR APK**

### **O que é APK?**

APK é o instalador do app Android (similar a .exe no Windows).

### **8.1 APK de Debug (Testes)**

Tem informações de debug e é rápido de gerar.

```powershell
cd c:\apps\cirio

# Gerar APK de debug
cordova build android --debug

# Ou rodar direto (compila + instala):
cordova run android --debug
```

**Tempo**: 2-5 minutos (primeira vez mais longo)

**Arquivo gerado em:**
```
c:\apps\cirio\platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

**Instalar em celular:**
```powershell
adb install -r c:\apps\cirio\platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

### **8.2 APK de Release (Distribuição)**

É otimizado e pronto para publicar na Play Store.

**Passo 1: Gerar APK Release**
```powershell
cd c:\apps\cirio

cordova build android --release
```

**Arquivo gerado em:**
```
c:\apps\cirio\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk
```

**Passo 2: Assinar APK**

Android exige que APKs sejam "assinados" com sua chave privada.

```powershell
# Criar keystore (chave de assinatura) - uma única vez
keytool -genkey -v -keystore my-release-key.keystore `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -alias my-key-alias

# Digite uma senha (ex: minhasenha123)
# Preencha dados pessoais
# Digite "yes" no final
```

```powershell
# Assinar APK com a chave
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA256 `
  -keystore my-release-key.keystore `
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk `
  my-key-alias

# Digite a senha do keystore
```

```powershell
# Otimizar APK final
zipalign -v 4 `
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk `
  app-release.apk
```

**APK final está pronto em:** `app-release.apk`

### **8.3 Distribuir para Testes**

**Opção 1: Via Google Play (oficial)**
- Criar conta Google Play Developer ($25 único)
- Upload do APK assinado
- Leva ~2 horas para revisar
- Usuários baixam da Play Store

**Opção 2: Enviar arquivo direto**
- Envie `app-release.apk` por email, WhatsApp, etc
- Usuários baixam e instalam manualmente
- Ative "Fontes desconhecidas" em segurança

**Opção 3: Usar TestFlight/Firebase**
- Distribuição interna para testers

---

## 🎯 **ETAPA 9 – PERSONALIZAÇÃO FINAL**

### **9.1 Nome do Aplicativo**

Editar `config.xml` na raiz:

```xml
<widget id="br.com.cirio" version="1.0.0" xmlns="...">
    <name>Localiza a Berlinda</name>
    <description>Rastreamento em Tempo Real</description>
    <author email="seu@email.com" href="seu-site.com">
        Seu Nome
    </author>
```

### **9.2 Ícone do App**

1. Crie imagem quadrada (512x512 px) em PNG
2. Coloque em `www/img/icon.png`
3. Editar `config.xml`:

```xml
<platform name="android">
    <icon src="www/img/icon.png" density="mdpi" />
    <icon src="www/img/icon.png" density="hdpi" />
    <icon src="www/img/icon.png" density="xhdpi" />
    <icon src="www/img/icon.png" density="xxhdpi" />
    <icon src="www/img/icon.png" density="xxxhdpi" />
</platform>
```

### **9.3 Splash Screen (Tela de Carregamento)**

1. Crie imagem (1280x1920 px) em PNG
2. Coloque em `www/img/splash.png`
3. Editar `config.xml`:

```xml
<platform name="android">
    <splash src="www/img/splash.png" density="land-hdpi" />
    <splash src="www/img/splash.png" density="port-hdpi" />
</platform>
```

### **9.4 Permissões Extras (se precisar)**

```xml
<!-- Em config.xml, dentro de <platform name="android"> -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

---

## 🎯 **ETAPA 10 – CHECKLIST FINAL**

Antes de publicar, verifique:

### **✅ Funcionalidades**

- [ ] GPS solicita permissão ao abrir
- [ ] Localização inicial é obtida
- [ ] Botão "Iniciar" começa rastreamento
- [ ] Mapa mostra rota em tempo real
- [ ] Cards atualizam em tempo real
- [ ] Cronômetro funciona
- [ ] Botão "Parar" interrompe rastreamento
- [ ] Botão "Resetar" limpa dados
- [ ] Modal de informações abre/fecha

### **✅ Interface**

- [ ] Layout responsivo em celulares
- [ ] Botões são clicáveis e claros
- [ ] Cores estão boas
- [ ] Sem erros de digitação
- [ ] Ícone do app está legal
- [ ] Splash screen aparece

### **✅ Performance**

- [ ] App não trava
- [ ] Sem memory leak
- [ ] Atualiza suavemente
- [ ] Respostas rápidas aos cliques

### **✅ Segurança**

- [ ] Sem dados sensíveis hardcoded
- [ ] Validação de inputs
- [ ] Tratamento de erros

### **✅ Testes Finais**

- [ ] Testado em 2+ celulares diferentes
- [ ] Testado com GPS ativo
- [ ] Sem crashes/travamentos
- [ ] Sem avisos de segurança

### **✅ Documentação**

- [ ] Código comentado
- [ ] README.md existe
- [ ] Instruções de instalação claras

---

## 📚 REFERÊNCIA RÁPIDA DE COMANDOS

```powershell
# Criar novo projeto Cordova
cordova create <nome-app> <id-app> <nome-exibicao>

# Entrar na pasta
cd <nome-app>

# Adicionar plataforma Android
cordova platform add android

# Instalar plugin
cordova plugin add <nome-plugin>

# Listar plugins
cordova plugin list

# Compilar
cordova build android

# Testar no emulador
cordova run android

# Compilar release
cordova build android --release

# Limpar arquivos antigos
cordova clean

# Ver arquivos do projeto
dir www/
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Publique na Play Store**: Configure conta Google Play Developer
2. **Melhore o mapa**: Integre Google Maps ou Mapbox
3. **Notificações**: Adicione alertas quando procissão terminar
4. **Histórico**: Salve histórico de procissões anteriores
5. **Compartilhamento**: Permita compartilhar rota no WhatsApp
6. **Widgets**: Crie widget de tempo real na tela inicial

---

## 📞 SUPORTE

**Erro não documentado?**

1. Procure em: [cordova.apache.org/docs](https://cordova.apache.org/docs)
2. Stack Overflow: [tag: cordova]
3. Forum: [Apache Cordova Community](https://cordova.apache.org/)

---

**Desenvolvido com ❤️ para sua procissão! 🎊**
