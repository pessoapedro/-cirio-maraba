/**
 * parser.js
 * - Parseia mensagens do rastreador SinoTrack ST-901.
 * - Extrai IMEI, latitude, longitude, velocidade, curso, timestamp.
 * - Retorna null quando a mensagem não é reconhecida.
 */

function parseSinoTrackMessage(raw){
    if (!raw || typeof raw !== 'string') return null;
    if (raw.length > 4096) return null;
    const message = raw.trim();

    // Mensagens típicas GNSS do SinoTrack: $GPRMC ou pacotes proprietary
    if (message.startsWith('$GPRMC')) {
        const parts = message.split(',');
        if (parts.length < 12) return null;
        const status = parts[2];
        const latRaw = parts[3];
        const latHem = parts[4];
        const lonRaw = parts[5];
        const lonHem = parts[6];
        const speedKnots = parseFloat(parts[7]) || 0;
        const course = parseFloat(parts[8]) || 0;
        const dateRaw = parts[9];
        const timeRaw = parts[1];
        const latitude = parseCoordinate(latRaw, latHem);
        const longitude = parseCoordinate(lonRaw, lonHem);
        const speed = knotsToKmh(speedKnots);
        const timestamp = parseNmeaDatetime(dateRaw, timeRaw);
        return validatePayload({
            imei: null,
            latitude,
            longitude,
            speed,
            course,
            online: status === 'A',
            timestamp
        });
    }

    // Padrão comum do SinoTrack ST-901:
    // imei:123456789012345,tracker,0,200510,055548,22.5483,-49.1170,0.00,84.3,1.510,;
    if (/imei\s*[:=]/i.test(message)) {
        const normalized = message.replace(/\r|\n/g, '').trim();
        const parts = normalized.split(',').map(p => p.trim()).filter(p => p.length > 0);
        const imeiPart = parts.find(part => part.toLowerCase().startsWith('imei'));
        const imei = imeiPart ? imeiPart.split(/[:=]/)[1] : null;
        const hasTracker = parts.length >= 8 && parts[1] && /tracker/i.test(parts[1]);

        if (!imei || !hasTracker) {
            return null;
        }

        const datePart = parts[3] || '';
        const timePart = parts[4] || '';
        const latitude = parseFloat(parts[5]);
        const longitude = parseFloat(parts[6]);
        const speed = knotsToKmh(parseFloat(parts[7]) || 0);
        const course = parseFloat(parts[8]) || 0;
        const timestamp = parseNmeaDatetime(datePart, timePart);

        return validatePayload({
            imei,
            latitude: Number.isFinite(latitude) ? latitude : null,
            longitude: Number.isFinite(longitude) ? longitude : null,
            speed,
            course,
            online: true,
            timestamp
        });
    }

    // Caso o pacote seja JSON puro
    try {
        const payload = JSON.parse(message);
        if (payload && typeof payload === 'object' && (payload.latitude != null || payload.lat != null)) {
            return validatePayload({
                imei: payload.imei || payload.device || payload.id || null,
                latitude: Number(payload.latitude ?? payload.lat),
                longitude: Number(payload.longitude ?? payload.lng ?? payload.lon),
                speed: Number(payload.speed ?? payload.velocidade ?? 0),
                course: Number(payload.course ?? payload.curso ?? payload.direction ?? 0),
                online: payload.online !== false,
                timestamp: Number(payload.timestamp ?? payload.time ?? Date.now())
            });
        }
    } catch (err) {
        // ignora parse JSON inválido
    }

    return null;
}

function validatePayload(payload){
    if (!payload || !Number.isFinite(payload.latitude) || payload.latitude < -90 || payload.latitude > 90) return null;
    if (!Number.isFinite(payload.longitude) || payload.longitude < -180 || payload.longitude > 180) return null;
    if (!Number.isFinite(payload.speed) || payload.speed < 0 || payload.speed > 500) return null;
    if (!Number.isFinite(payload.course) || payload.course < 0 || payload.course > 360) return null;
    if (payload.imei != null && !/^\d{6,20}$/.test(String(payload.imei))) return null;
    const timestamp = Number(payload.timestamp);
    if (!Number.isFinite(timestamp) || timestamp > Date.now() + 10 * 60 * 1000) return null;
    return { ...payload, timestamp };
}

function parseCoordinate(raw, hemisphere){
    if (!raw || raw.length < 4) return null;
    const value = parseFloat(raw);
    if (Number.isNaN(value)) return null;
    const degrees = parseInt(raw.slice(0, raw.indexOf('.') - 2), 10);
    const minutes = parseFloat(raw.slice(raw.indexOf('.') - 2));
    let decimal = degrees + (minutes / 60);
    if (hemisphere === 'S' || hemisphere === 'W') decimal *= -1;
    return decimal;
}

function parseNmeaDatetime(datePart, timePart){
    if (!datePart || !timePart) return Date.now();
    try {
        const day = Number(datePart.slice(0,2));
        const month = Number(datePart.slice(2,4)) - 1;
        const year = 2000 + Number(datePart.slice(4,6));
        const hours = Number(timePart.slice(0,2));
        const minutes = Number(timePart.slice(2,4));
        const seconds = Number(timePart.slice(4,6));
        return Date.UTC(year, month, day, hours, minutes, seconds);
    } catch (err) {
        return Date.now();
    }
}

function knotsToKmh(knots){
    if (!Number.isFinite(knots)) return 0;
    return Number((knots * 1.852).toFixed(2));
}

module.exports = { parseSinoTrackMessage };
