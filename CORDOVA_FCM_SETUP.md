Guia rápido: integrar FCM nativo no projeto Cordova

1) Escolha do plugin (recomendado)
- `cordova-plugin-firebase-messaging` (community)
- Alternativa: `cordova-plugin-fcm-with-dependecies` ou `cordova-plugin-firebase` (legado)

2) Instalar o plugin (exemplo recomendado)

Android / iOS:

```bash
# do diretório raiz do projeto Cordova (c:\apps\cirio)
cordova plugin add cordova-plugin-firebase-messaging
# alternativa (se preferir a fork FCM):
# cordova plugin add cordova-plugin-fcm-with-dependecies
```

3) Adicionar arquivos do Firebase
- Android: coloque `google-services.json` em `platforms/android/app/` antes de construir (ou no root do projeto; plugin copia automaticamente em builds).
- iOS: coloque `GoogleService-Info.plist` em `platforms/ios/<AppName>/` ou arraste para Xcode em Resources.

4) Ajustes de build (Android)
- Certifique-se de ter `classpath 'com.google.gms:google-services:4.3.15'` no `build.gradle` de nível de projeto (o plugin normalmente cuida disso).
- O `google-services.json` deve conter as credenciais FCM do seu projeto.

5) Permissões (Android)
- O plugin geralmente configura permissões automaticamente. Se necessário, verifique `AndroidManifest.xml`.

6) Uso no código (o projeto já contém adaptador)
- O arquivo `www/js/fcm-native.js` foi adicionado e tenta detectar APIs comuns dos plugins e enviar o token ao backend em `POST /api/register-token` com payload `{ token, platform }`.
- Mantenha também `www/js/fcm-register.js` para web tokens (desktop / PWA).

7) Teste rápido no dispositivo
- Instale plugin e copie `google-services.json` e `GoogleService-Info.plist`.
- Construa e rode:

```bash
cordova build android
cordova run android --device
```
- No app, abra `Eventos` e toque em `Participar`. O adaptador nativo tentará obter o token e registrar no backend.
- Verifique logs do backend (`backend/server.js`) para ver o token recebido ou verifique no Realtime Database.

8) Observações
- Para envio de push do backend já implementado, o `backend` precisa do `FIREBASE_SERVICE_ACCOUNT` e `FIREBASE_DATABASE_URL` configurados.
- Para iOS, é necessário registrar capacidades de push e certificar-se de que o bundle id e certificado no Firebase correspondem ao app.

Se quiser, eu posso:
- adicionar steps automáticos para instalar o plugin e copiar os arquivos (posso criar um script `scripts/add-fcm-plugin.sh`), ou
- aplicar as alterações no `config.xml` / `build.gradle` caso queira que eu ajuste automaticamente.
