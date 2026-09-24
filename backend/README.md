# Backend SinoTrack ST-901

Backend Node.js para receber pacotes TCP do rastreador SinoTrack ST-901 e gravar os dados no Firebase Realtime Database.

## Estrutura

- `server.js` - inicia o servidor TCP e encaminha dados para o Firebase.
- `tcpServer.js` - implementa a escuta TCP e reconexão.
- `parser.js` - parseia as mensagens do rastreador.
- `firebase.js` - inicializa Firebase Admin e grava dados.
- `.env.example` - variáveis de ambiente.

## Instalação

```bash
cd backend
npm install
cp .env.example .env
```

## Configuração

Edite `.env` com:

```dotenv
PORT=3000
TCP_PORT=8090
FIREBASE_DATABASE_URL=https://<seu-projeto>.firebaseio.com
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
FIREBASE_GPS_ROOT=gps
```

Coloque o arquivo de credenciais do Firebase admin em `backend/serviceAccountKey.json` ou no caminho desejado.

## Execução

```bash
cd backend
node server.js
```

## Como funciona

- O servidor TCP escuta em `TCP_PORT`.
- Cada pacote recebido é parseado e transformado em:
  - `imei`
  - `latitude`
  - `longitude`
  - `speed`
  - `course`
  - `online`
  - `timestamp`
- Os dados são gravados em `gps/<imei>` no Firebase.

## Observações

- A reconexão TCP é automática em caso de erro.
- Se a mensagem não for reconhecida, ela é descartada.
