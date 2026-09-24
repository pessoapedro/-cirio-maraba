const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const { WebSocketServer } = require('ws');

const CHAVE_EMISSOR = 'troque-esta-chave';
const PORTA = process.env.PORT || 3001;

const app = express();
app.use(express.static('public'));

const certPath = path.join(__dirname, 'cert.crt');
const keyPath = path.join(__dirname, 'cert.key');

const server = https.createServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}, app);

const wss = new WebSocketServer({ server });

let ultimaPosicao = null;

wss.on('connection', (ws) => {
  if (ultimaPosicao) {
    ws.send(JSON.stringify(ultimaPosicao));
  }

  ws.on('message', (msg) => {
    let dados;
    try {
      dados = JSON.parse(msg);
    } catch {
      return;
    }

    if (dados.tipo !== 'posicao' || dados.chave !== CHAVE_EMISSOR) return;

    ultimaPosicao = {
      tipo: 'posicao',
      lat: dados.lat,
      lng: dados.lng,
      precisao: dados.precisao,
      velocidade: dados.velocidade,
      rumo: dados.rumo,
      ts: Date.now()
    };

    const txt = JSON.stringify(ultimaPosicao);
    wss.clients.forEach((cliente) => {
      if (cliente !== ws && cliente.readyState === 1) {
        cliente.send(txt);
      }
    });
  });
});

server.listen(PORTA, '0.0.0.0', () => {
  console.log(`Rodando em https://localhost:${PORTA}`);
  console.log(`Acesso local da rede: https://192.168.0.4:${PORTA}`);
});
