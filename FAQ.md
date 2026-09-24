# ❓ PERGUNTAS FREQUENTES - Localiza a Berlinda

## 🤔 PERGUNTAS GERAIS

### **P: O que é Cordova?**
**R:** Apache Cordova é um framework que permite criar apps nativos Android/iOS usando HTML, CSS e JavaScript. Você escreve o código uma única vez e ele funciona em múltiplas plataformas.

### **P: Preciso saber programar?**
**R:** O app já está pronto! Você só precisa compilar e rodar. Se quiser customizar cores ou textos, é muito simples (edite arquivos HTML/CSS).

### **P: Quanto custa?**
**R:** 100% grátis! Node.js, Cordova, Android SDK e VS Code são todos open source e gratuitos.

### **P: Funciona em iOS?**
**R:** Este guia é para Android. Para iOS, é preciso Mac e xCode (caro). Mas o código é compatível - basta executar `cordova platform add ios`.

---

## 📱 INSTALAÇÃO E SETUP

### **P: Tenho que reinstalar tudo se reiniciar?**
**R:** Não. Após primeira instalação, tudo fica salvo. Pode simplesmente abrir terminal e compilar.

### **P: Qual a melhor forma de começar?**
**R:** 
1. Instale Node.js e Java JDK
2. Abra PowerShell e rode: `npm install -g cordova`
3. Baixe Android Studio (pode ser pesado, ~3-5GB)
4. Rode o script SETUP.ps1

### **P: Posso desenvolver no Mac/Linux?**
**R:** Sim! Todos os comandos funcionam (use bash em vez de PowerShell). A única diferença é nos caminhos das pastas.

### **P: Quanto espaço em disco preciso?**
**R:** ~15GB para Android SDK + NDK. Celular precisa de ~50MB para o app.

---

## 🗺️ GPS E LOCALIZAÇÃO

### **P: Por que o GPS não funciona no emulador?**
**R:** Emulador não tem GPS real. Forneça coordenadas simuladas:
```powershell
adb emu geo fix -122.419 37.774 100
```

### **P: Como a precisão do GPS?**
**R:** Tipicamente 5-10 metros em área aberta. Pode ser pior em prédios/ruas estreitas.

### **P: GPS consome muita bateria?**
**R:** Sim. GPS "High Accuracy" consome ~20% da bateria por hora. Considere avisar usuários.

### **P: Funciona sem internet?**
**R:** GPS funciona sim. Mas mapa precisa de dados. Use OpenStreetMap (requer internet) ou salve mapa offline.

---

## 🎨 CUSTOMIZAÇÃO

### **P: Como mudar as cores?**
**R:** Edite `www/css/index.css`. Procure por cores como `#667eea` e mude para o código hexadecimal que quiser.

### **P: Como mudar o nome do app?**
**R:** Edite `config.xml`:
```xml
<name>Novo Nome</name>
```

### **P: Como adicionar meu logo?**
**R:** 
1. Salve imagem em `www/img/meu-logo.png`
2. Edite `config.xml` para usar como ícone
3. Recompile com `cordova build android`

### **P: Posso mudar a distância total (5km)?**
**R:** Sim! Edite em `www/js/app.js`:
```javascript
totalDistance: 10000,  // 10 km em metros
```

---

## 🧪 TESTES

### **P: Como testar sem celular?**
**R:** Use emulador Android. Abra Android Studio → AVD Manager → Create Virtual Device.

### **P: Qual emulador é mais rápido?**
**R:** Pixel 4a com Nougat é bom balanço. Avoid Tablet emulators.

### **P: Posso testar no navegador (Chrome)?**
**R:** Sim, mas GPS não funciona. Use "fake position" ou extensão do Chrome.

### **P: Como ver erros do app?**
**R:** 
```powershell
# No navegador: Pressione F12
# No celular: adb logcat
```

### **P: App crashes. Como debugar?**
**R:** 
```powershell
# Ver logs em tempo real:
adb logcat

# Salvar em arquivo:
adb logcat > logs.txt

# Procurar por erro:
adb logcat | findstr "ERROR"
```

---

## 📦 COMPILAÇÃO E APK

### **P: Qual a diferença entre APK debug e release?**
**R:** 
- **Debug**: Rápido de gerar, tem info de debug, não pode publicar
- **Release**: Otimizado, assinado, pronto para publicar

### **P: Quanto tempo leva compilar?**
**R:** 
- Primeira vez: 5-10 minutos
- Compilações seguintes: 2-3 minutos

### **P: APK pode ser compartilhado?**
**R:** Sim! Envie por email, WhatsApp, etc. Usuário instala manualmente (ativar "Fontes desconhecidas").

### **P: Posso publicar na Play Store?**
**R:** Sim! Crie conta Google Play Developer ($25), siga os passos de publicação.

### **P: Qual tamanho do APK?**
**R:** ~15-20 MB (pequeno).

---

## 🔧 TROUBLESHOOTING

### **P: Erro "cordova command not found"**
**R:** 
```powershell
npm install -g cordova
# Feche TODOS os PowerShell e abra um novo
```

### **P: "JAVA_HOME not set"**
**R:** 
```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", [EnvironmentVariableTarget]::User)
# Reinicie PowerShell
```

### **P: "Android SDK not found"**
**R:** 
1. Abra Android Studio
2. Tools → SDK Manager
3. Instale Android 12+ SDK Platform

### **P: Build falha aleatoriamente**
**R:** 
```powershell
cordova clean
cordova build android --debug
```

### **P: Emulador travou**
**R:** 
```powershell
adb kill-server
adb start-server
adb devices
```

### **P: APK não instala no celular**
**R:** 
```powershell
# Desinstalar versão anterior:
adb uninstall br.com.cirio

# Instalar nova:
adb install -r app-debug.apk
```

---

## 💾 ARMAZENAMENTO E DADOS

### **P: Como salvar histórico de procissões?**
**R:** Use LocalStorage:
```javascript
// Salvar
localStorage.setItem('procissao_1', JSON.stringify(dados));

// Recuperar
const dados = JSON.parse(localStorage.getItem('procissao_1'));
```

### **P: Posso sincronizar com servidor?**
**R:** Sim! Use fetch/axios para enviar dados para um servidor Node.js/PHP.

### **P: Onde os dados são salvos?**
**R:** Localmente no celular (`/data/data/br.com.cirio/`).

---

## 🎯 PERFORMANCE

### **P: App está lento. O que fazer?**
**R:** 
1. Verifique se GPS está ligado (consome processamento)
2. Reduza frequência de atualização do mapa
3. Limite histórico de posições em `app.state.positions`

### **P: Mapa não carrega (tela branca)?**
**R:** 
- Sem internet → Usa canvas (fallback)
- Com internet → Usa Leaflet (melhor)

### **P: App consome muita memória?**
**R:** Provável: histórico de posições cresceu muito. Resetar ou limitar:
```javascript
if (this.state.positions.length > 1000) {
    this.state.positions.shift(); // Remove primeira posição
}
```

---

## 🔐 SEGURANÇA

### **P: Dados são seguros?**
**R:** Dados ficam no celular (não enviados). Use SSL/HTTPS se enviar para servidor.

### **P: Alguém pode hackar o app?**
**R:** Dificilmente. Código está em JavaScript (visível), mas sem dados sensíveis = pouco lucro.

### **P: Devo usar keystore privada?**
**R:** Sim! Guarde `my-release-key.keystore` em local seguro. Sem ela, não consegue atualizar app.

---

## 📞 SUPORTE TÉCNICO

### **P: Aonde procurar ajuda?**

**Documentação Oficial:**
- [Apache Cordova](https://cordova.apache.org/docs/)
- [Android Developers](https://developer.android.com/)

**Communities:**
- [Stack Overflow (tag: cordova)](https://stackoverflow.com/questions/tagged/cordova)
- [Cordova Forum](https://cordova.apache.org/)

**YouTube:**
- "Cordova Android Tutorial"
- "Apache Cordova for beginners"

---

## ✅ CHECKLIST DE DEPLOYMENT

Antes de publicar:

- [ ] Testei em 2+ celulares
- [ ] GPS funciona e é preciso
- [ ] Sem crashes ou erros
- [ ] Sem warnings de segurança
- [ ] APK assinado corretamente
- [ ] Nome e ícone estão certos
- [ ] Documentação está clara

---

**Pergunta não respondida?** Procure no:
- [GUIA_COMPLETO.md](GUIA_COMPLETO.md)
- [README.md](README.md)
- Documentação oficial do Cordova

**Última atualização:** Janeiro 2026
