# Flutter Localiza a Berlinda

Aplicativo Flutter para exibir a localização em tempo real da berlinda usando Firebase Realtime Database.

## Estrutura

- `lib/main.dart`
- `lib/models/gps_model.dart`
- `lib/services/gps_service.dart`
- `lib/screens/map_screen.dart`
- `lib/widgets/device_marker.dart`

## Dependências

- `firebase_core`
- `firebase_database`
- `flutter_map`
- `latlong2`

## Instalação

```bash
cd flutter
flutter pub get
```

## Execução

```bash
cd flutter
flutter run
```

## Configuração Firebase

- Adicione o arquivo `google-services.json` em `flutter/android/app`.
- Em iOS, adicione `GoogleService-Info.plist` em `flutter/ios/Runner`.
- Se precisar, gere `firebase_options.dart` com `flutterfire configure`.

## Comportamento

- O app usa `GpsService` para escutar a rota `gps/<deviceId>` no Realtime Database.
- O marcador personalizado mostra a posição e rotação da berlinda.
- O mapa é centralizado automaticamente no ponto mais recente.
- O painel exibe velocidade, status ao vivo e horário da última atualização.
