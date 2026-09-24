/**
 * tcpServer.js
 * - Cria servidor TCP para receber dados do rastreador SinoTrack ST-901.
 * - Reconecta automaticamente e faz parse das mensagens.
 */

const net = require('net');
const EventEmitter = require('events');
const { parseSinoTrackMessage } = require('./parser');

class TcpServer extends EventEmitter {
    constructor(port){
        super();
        this.port = port;
        this.server = null;
        this.clients = new Set();
        this.maxClients = Number(process.env.TCP_MAX_CLIENTS) || 20;
        this.maxBuffer = Number(process.env.TCP_MAX_BUFFER) || 16384;
    }

    start(){
        this.server = net.createServer((socket) => {
            if (this.clients.size >= this.maxClients) {
                socket.destroy();
                return;
            }
            const remote = `${socket.remoteAddress}:${socket.remotePort}`;
            console.log(`TCP: cliente conectado ${remote}`);
            this.clients.add(socket);
            socket.setEncoding('utf8');
            socket.setTimeout(Number(process.env.TCP_SOCKET_TIMEOUT_MS) || 30000);
            let buffer = '';

            socket.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
                if (buffer.length > this.maxBuffer) {
                    socket.destroy();
                    return;
                }
                const parts = buffer.split(/\r?\n/);
                buffer = parts.pop() || '';
                const payloads = parts.filter(Boolean);
                payloads.forEach(raw => {
                    const parsed = parseSinoTrackMessage(raw);
                    if (parsed) {
                        this.emit('gps', parsed);
                    } else {
                        console.debug('TCP: mensagem ignorada:', raw);
                    }
                });
            });

            socket.on('timeout', () => socket.destroy());

            socket.on('close', () => {
                console.log(`TCP: cliente desconectado ${remote}`);
                this.clients.delete(socket);
            });

            socket.on('error', (err) => {
                console.warn(`TCP: erro cliente ${remote}`, err.message);
                this.clients.delete(socket);
            });
        });

        this.server.on('error', (err) => {
            console.error('TCP: servidor erro', err.message);
            setTimeout(() => this.restart(), 5000);
        });

        this.server.listen(this.port, () => {
            console.log(`TCP: servidor iniciado na porta ${this.port}`);
        });
    }

    restart(){
        if (this.server) {
            try { this.server.close(); } catch (e) {}
            this.server = null;
        }
        setTimeout(() => this.start(), 3000);
    }
}

module.exports = { TcpServer };
