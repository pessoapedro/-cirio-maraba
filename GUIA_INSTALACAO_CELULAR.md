# 📱 Guia Completo: Como Rodar o App Círio de Nazaré no Seu Celular

## ✅ Pré-requisitos

- Celular Android (versão 6.0+)
- Cabo USB
- Android SDK instalado
- ADB (Android Debug Bridge) configurado

---

## 🔧 PASSO 1: Preparar o Celular

### 1.1 Ativar Modo Desenvolvedor

1. Abra **Configurações** no seu celular
2. Procure por **"Sobre o telefone"** (pode variar por marca)
3. Localize **"Número da compilação"**
4. **Toque 7 vezes** em "Número da compilação"
   - Você verá a mensagem: "Você agora é um desenvolvedor!"
5. Volte para **Configurações**

### 1.2 Ativar Depuração USB

1. Volte para **Configurações**
2. Procure por **"Opções do Desenvolvedor"** ou **"Sistema > Desenvolvedor"**
3. Localize **"Depuração USB"**
4. **Ative o toggle** (ficará azul/verde)
5. Verá um aviso de segurança - clique em **"OK"** ou **"Permitir"**

---

## 🔌 PASSO 2: Conectar Celular ao PC

1. Pegue um **cabo USB** (preferível original)
2. Conecte o cabo no celular
3. Uma notificação aparecerá no celular dizendo:
   - "Permitir depuração USB deste computador?"
   - Clique em **"Permitir"**
   - Opcionalmente, marque "Sempre confiar neste computador"

---

## ✔️ PASSO 3: Verificar Conexão

1. Abra **PowerShell** ou **CMD** como Administrador
2. Execute:
   ```
   adb devices
   ```
3. Você deve ver:
   ```
   List of devices attached
   XXXXXXXXXXXXX    device
   ```
   - Se vir "device" = ✅ Conectado com sucesso!
   - Se vir "unauthorized" = ❌ Aceite a autorização no celular novamente

---

## 🚀 PASSO 4: Instalar o App

### Opção A: Usar o Script (Mais Fácil)

1. Abra **PowerShell como Administrador**
2. Execute:
   ```powershell
   cd c:\apps\cirio
   .\instalar.bat
   ```

### Opção B: Instalar Manualmente

1. Abra **PowerShell como Administrador**
2. Execute:
   ```powershell
   cd c:\apps\cirio
   adb install -r app-debug.apk
   ```

---

## 🎮 PASSO 5: Iniciar o App

### Após a instalação bem-sucedida:

**Opção 1: Direto do celular**
- Procure por **"Círio de Nazaré"** ou **"KDa Berlinda"** em Meus Apps
- Clique para abrir

**Opção 2: Via ADB**
- Execute:
  ```powershell
  adb shell am start -n br.com.cirio/.MainActivity
  ```

---

## 🐛 Troubleshooting - Problemas Comuns

### ❌ "adb devices" mostra lista vazia
**Solução:**
1. Desconecte e reconecte o cabo USB
2. Verifique se a Depuração USB está ativada
3. Reinicie o ADB:
   ```powershell
   adb kill-server
   adb start-server
   adb devices
   ```

### ❌ "Unauthorized"
**Solução:**
1. Olhe para seu celular
2. Clique em **"Permitir"** na caixa de diálogo
3. Opcionalmente marque "Sempre confiar"
4. Execute novamente:
   ```powershell
   adb devices
   ```

### ❌ "adb: command not found"
**Solução:**
1. ADB não está no PATH
2. Use o caminho completo do SDK:
   ```powershell
   "C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
   ```

### ❌ "Could not find app-debug.apk"
**Solução:**
1. Verifique se o arquivo existe em `c:\apps\cirio\app-debug.apk`
2. Se não existir, compile:
   ```powershell
   cd c:\apps\cirio
   npx cordova build android
   ```

---

## 📊 Verificar Aplicação Instalada

Execute:
```powershell
adb shell pm list packages | findstr cirio
```

Se retornar `package:br.com.cirio` = ✅ App está instalado!

---

## 🔄 Atualizações Rápidas

Para testes rápidos após mudanças no código:

1. Edite os arquivos em `www/`
2. Execute:
   ```powershell
   cd c:\apps\cirio
   npx cordova prepare android
   npx cordova run android --debug
   ```

---

## 📝 Informações do App

- **Pacote:** br.com.cirio
- **Atividade:** MainActivity
- **Arquivo:** c:\apps\cirio\app-debug.apk
- **Versão:** Debug (desenvolvimento)

---

## ✨ Próximas Etapas

Depois que o app estiver rodando:

1. Ative localização (GPS) no celular
2. Permita acesso à localização quando o app pedir
3. Clique em **"Mapa"** para visualizar
4. Clique em **"Iniciar Rastreamento"** para começar

---

## 📞 Suporte

Se tiver problemas:
1. Verifique todos os passos acima
2. Reinicie o celular
3. Reinicie o PC
4. Tente com outro cabo USB

**Desenvolvido com 💛 para o Círio de Nazaré**
