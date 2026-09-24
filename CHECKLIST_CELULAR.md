# 📱 CHECKLIST: Rodar App no Celular

## 🔴 PRÉ-REQUISITOS

### No seu Computador:
- [ ] Windows, Mac ou Linux
- [ ] Node.js instalado
- [ ] Android SDK instalado
- [ ] ADB (Android Debug Bridge) disponível
- [ ] Arquivo `app-debug.apk` em `c:\apps\cirio\`

### No seu Celular:
- [ ] Android versão 6.0 ou superior
- [ ] Cabo USB disponível
- [ ] Modo Desenvolvedor DESATIVADO (ainda)
- [ ] Depuração USB DESATIVADA (ainda)

---

## 🟡 PASSO A PASSO

### 1️⃣ PREPARAR CELULAR (5 minutos)

**Ativar Modo Desenvolvedor:**
- [ ] Abra **Configurações**
- [ ] Procure **"Sobre o telefone"** ou **"Sobre o dispositivo"**
- [ ] Encontre **"Número da compilação"**
- [ ] **Toque 7 vezes** (aparecerá mensagem de desenvolvedor)
- [ ] Volte para Configurações (você verá nova aba "Desenvolvedor")

**Ativar Depuração USB:**
- [ ] Em Configurações, abra **"Opções do Desenvolvedor"** ou **"Desenvolvedor"**
- [ ] Procure por **"Depuração USB"**
- [ ] Ative o toggle (azul/verde)
- [ ] Confirme o aviso de segurança clicando OK

### 2️⃣ CONECTAR CELULAR (2 minutos)

- [ ] Pegue o cabo USB
- [ ] Conecte no celular
- [ ] Conecte no PC
- [ ] Uma caixa aparecerá no celular perguntando se permite depuração
- [ ] Clique em **"Permitir"** (opcionalmente marque "Sempre confiar")
- [ ] Aguarde aparecer a mensagem: "Autorizado"

### 3️⃣ VERIFICAR CONEXÃO (1 minuto)

**No PC - Abra PowerShell como Administrador:**

```powershell
adb devices
```

**Resultado esperado:**
```
List of devices attached
XXXXXXXXXXXXX    device
```

- [ ] Se vir "device" = ✅ Conectado!
- [ ] Se vir "unauthorized" = ❌ Clique OK no celular novamente
- [ ] Se vir lista vazia = ❌ Reconecte o cabo

### 4️⃣ INSTALAR APP (2 minutos)

**Opção A - Script Automático (RECOMENDADO):**

```powershell
cd c:\apps\cirio
.\InstalarNocelular.ps1
```

**Opção B - Manual:**

```powershell
cd c:\apps\cirio
adb install -r app-debug.apk
```

**Resultado esperado:**
```
Success
```

- [ ] Se retornar "Success" = ✅ Instalado!
- [ ] Aguarde até 1 minuto para processar

### 5️⃣ INICIAR APP (1 minuto)

**Opção A - Direto do Celular:**
- [ ] Procure em **Meus Apps** por **"Círio de Nazaré"** ou **"KDa Berlinda"**
- [ ] Clique para abrir
- [ ] Aguarde o splash screen

**Opção B - Via ADB:**

```powershell
adb shell am start -n br.com.cirio/.MainActivity
```

---

## 🟢 USANDO O APP

### Primeira Execução:
- [ ] Permitir acesso à Localização (GPS) quando pedir
- [ ] Verificar se a localização foi obtida

### No App:
- [ ] Clique em **"Mapa"** para visualizar
- [ ] Clique em **"Iniciar Rastreamento"** para começar
- [ ] Veja a distância percorrida atualizar
- [ ] Use **"Parar"** para interromper
- [ ] Use **"Resetar"** para zerar

---

## 🔴 TROUBLESHOOTING

### ❌ "List of devices attached" vazio

**Teste:**
```powershell
adb kill-server
adb start-server
adb devices
```

**Se persistir:**
- [ ] Desconecte e reconecte o cabo
- [ ] Tente outro porta USB
- [ ] Reinicie o celular
- [ ] Verifique se a Depuração USB está ativada

### ❌ "unauthorized"

**Solução:**
- [ ] Olhe para o celular
- [ ] Clique "Permitir" na caixa de diálogo
- [ ] Marque "Sempre confiar neste computador"
- [ ] Execute novamente: `adb devices`

### ❌ "adb: command not found"

**Solução:**
Android SDK não está no PATH. Use o caminho completo:

```powershell
"C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
```

Ou adicione ao PATH permanentemente.

### ❌ "app-debug.apk" não encontrado

**Solução 1 - Compilar:**
```powershell
cd c:\apps\cirio
npx cordova build android
```

**Solução 2 - Verificar caminho:**
```powershell
ls c:\apps\cirio\app-debug.apk
```

### ❌ App não inicia / Fica na tela preta

**Soluções:**
- [ ] Verifique se Localização está ativada no celular
- [ ] Permita acesso à Localização no app
- [ ] Aguarde 10 segundos na tela inicial
- [ ] Reinicie o app

### ❌ "br.com.cirio/.MainActivity" não encontrado

**Solução:**
```powershell
# Ver pacotes instalados
adb shell pm list packages | findstr cirio

# Tentar iniciar por intent
adb shell am start -a android.intent.action.MAIN -n br.com.cirio/.MainActivity
```

---

## ✅ VERIFICAÇÕES FINAIS

### App Instalado?
```powershell
adb shell pm list packages | findstr cirio
```
Resultado: `package:br.com.cirio` = ✅

### App Funcionando?
- [ ] Splash screen aparece
- [ ] Tela inicial carrega
- [ ] Card "Mapa" está visível
- [ ] Localização é obtida (5-10 segundos)

### Mapa Funciona?
- [ ] Clique em "Mapa"
- [ ] Aguarde carregar
- [ ] Deve ver marcador com sua localização

---

## 📊 INFORMAÇÕES TÉCNICAS

**Pacote:** `br.com.cirio`  
**Atividade Principal:** `.MainActivity`  
**Versão:** Debug (Desenvolvimento)  
**Mínimo Android:** 6.0 (API 23)  
**Alvo Android:** 14+ (API 34+)  
**Arquivo APK:** `c:\apps\cirio\app-debug.apk`  
**Tamanho Aproximado:** 50-100 MB  

---

## 🎯 PRÓXIMAS ETAPAS APÓS INSTALAÇÃO

1. **Adicionar Imagens:**
   - Coloque imagens em `www/img/`
   - Recompile: `cordova build android`

2. **Melhorar Design:**
   - Edite CSS em `www/css/`
   - Use `cordova prepare android` (rápido)

3. **Adicionar Funcionalidades:**
   - JavaScript em `www/js/`
   - Testar no celular regularmente

4. **Gerar APK de Release:**
   ```powershell
   cordova build android --release
   ```

---

## 📞 SUPORTE

Se tudo falhar:
1. Revise este checklist passo a passo
2. Verifique conectividade USB
3. Reinicie PC e celular
4. Tente com cabo diferente
5. Consulte documentação Cordova oficial

**Desenvolvido com 💛 para o Círio de Nazaré**

---

## 📈 PROGRESSO

- [x] Código desenvolvido
- [x] App compilado (APK gerado)
- [ ] App instalado no celular
- [ ] App testado e funcionando
- [ ] Pronto para distribuição

**Bom trabalho! Você está quase lá! 🚀**
