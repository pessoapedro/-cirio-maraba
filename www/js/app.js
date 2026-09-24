/**
 * ===============================
 * APP LOCALIZA A BERLINDA
 * Rastreamento em Tempo Real com Framework7
 * ===============================
 */

// Inicializar Framework7
const f7 = new Framework7({
    root: '#app',
    name: 'Localiza a Berlinda',
    theme: 'auto',
    routes: [
        {
            path: '/',
            name: 'home'
        },
        {
            path: '/home/',
            name: 'home'
        },
        {
            path: '/cartazes/',
            name: 'cartazes'
        },
        {
            path: '/transmissoes/',
            name: 'transmissoes'
        },
        {
            path: '/links/',
            name: 'links'
        },
        {
            path: '/eventos/',
            name: 'eventos'
        },
        {
            path: '/perfil/',
            name: 'perfil'
        }
    ]
});

// Obter router do Framework7
const router = f7.router;
const mainView = f7.views.main;

const app = {
    // ========================================
    // ESTADO GLOBAL DA APLICAÇÃO //save 
    // ========================================
    state: {
        isTracking: false,
        startTime: null,
        totalDistance: 0,
        coveredDistance: 0,
        positions: [],
        trackerPositions: [],
        trackerPosition: null,
        trackerDeviceId: null,
        trackerStatus: 'offline',
        trackerLastUpdate: null,
        trackerBattery: '--',
        watchId: null,
        currentLocation: null,
        lastSharedAt: null,
        lastSpeedMps: 0,
        lastRouteFetchAt: 0,
        routeFetchInFlight: false
    },

    formatEtaText: function(seconds) {
        const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
        if (safeSeconds <= 0) return '--:--';
        const hours = Math.floor(safeSeconds / 3600);
        const minutes = Math.floor((safeSeconds % 3600) / 60);
        const secs = safeSeconds % 60;
        if (hours > 0) return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}min`;
        if (minutes > 0) return `${String(minutes).padStart(2, '0')}min ${String(secs).padStart(2, '0')}s`;
        return `${String(secs).padStart(2, '0')}s`;
    },

    getDefaultMapLocation: function() {
        return {
            lat: -5.368900,
            lng: -49.117000,
            accuracy: 1000,
            source: 'fallback'
        };
    },

    getParoquiaLocation: function() {
        try {
            const saved = localStorage.getItem('cirio_paroquia_location');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
                    return {
                        lat: parsed.lat,
                        lng: parsed.lng,
                        name: 'Paróquia Nossa Senhora de Nazaré'
                    };
                }
            }
        } catch (e) {
            console.warn('Não foi possível ler a localização salva da paróquia:', e);
        }

        return {
            lat: -5.368900,
            lng: -49.117000,
            name: 'Paróquia Nossa Senhora de Nazaré'
        };
    },

    setParoquiaLocation: function(lat, lng) {
        const safeLat = Number(lat);
        const safeLng = Number(lng);
        if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) return null;

        const location = {
            lat: safeLat,
            lng: safeLng,
            name: 'Paróquia Nossa Senhora de Nazaré'
        };

        try {
            localStorage.setItem('cirio_paroquia_location', JSON.stringify({ lat: safeLat, lng: safeLng }));
        } catch (e) {
            console.warn('Não foi possível salvar a localização da paróquia:', e);
        }

        if (this.landmarkMarker && typeof this.landmarkMarker.setLatLng === 'function') {
            this.landmarkMarker.setLatLng([safeLat, safeLng]);
            this.landmarkMarker.bindPopup(`<strong>${location.name}</strong><br>Destino ajustado manualmente`);
        }

        return location;
    },

    requestRoadRoute: async function(origin, destination) {
        if (!origin || !destination || !window.fetch) return null;

        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=false&alternatives=false`;

        try {
            const response = await fetch(url, { headers: { Accept: 'application/json' } });
            if (!response.ok) {
                throw new Error(`OSRM status ${response.status}`);
            }
            const data = await response.json();
            const coords = data && data.routes && data.routes[0] && data.routes[0].geometry && data.routes[0].geometry.coordinates;
            if (!Array.isArray(coords) || coords.length < 2) return null;

            return coords.map(([lng, lat]) => ({ lat, lng }));
        } catch (e) {
            console.warn('Rota por rua indisponível, usando rota direta:', e);
            return null;
        }
    },

    syncParoquiaRoute: function() {
        const destination = this.getParoquiaLocation();
        const origin = this.state.currentLocation || this.getDefaultMapLocation();
        if (!origin || !destination) return;

        const applyDirectRoute = () => {
            this.state.route = [
                { lat: origin.lat, lng: origin.lng },
                { lat: destination.lat, lng: destination.lng }
            ];

            if (typeof this.setRoute === 'function') {
                this.setRoute(this.state.route);
            }
        };

        if (this.state.currentLocation && typeof fetch === 'function' && !this.state.routeFetchInFlight && (!this.state.lastRouteFetchAt || Date.now() - this.state.lastRouteFetchAt > 15000)) {
            this.state.routeFetchInFlight = true;
            this.state.lastRouteFetchAt = Date.now();
            this.requestRoadRoute(origin, destination)
                .then((roadRoute) => {
                    if (roadRoute && roadRoute.length >= 2) {
                        this.state.route = roadRoute;
                        if (typeof this.setRoute === 'function') this.setRoute(this.state.route);
                    } else {
                        applyDirectRoute();
                    }
                })
                .catch(() => applyDirectRoute())
                .finally(() => {
                    this.state.routeFetchInFlight = false;
                });
        } else {
            applyDirectRoute();
        }

        if (this.map && this.state.currentLocation) {
            try {
                this.map.setView([this.state.currentLocation.lat, this.state.currentLocation.lng], this.map.getZoom() || 13);
            } catch (e) {}
        }
    },

    isBrazilLocation: function(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') return false;
        return lat >= -34 && lat <= 6 && lng >= -75 && lng <= -30;
    },

    normalizePosition: function(position) {
        if (!position) return null;

        let normalized = null;

        if (position.coords && typeof position.coords.latitude === 'number' && typeof position.coords.longitude === 'number') {
            normalized = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy || 0,
                timestamp: position.timestamp || Date.now()
            };
        }

        if (!normalized && typeof position.lat === 'number' && typeof position.lng === 'number') {
            normalized = {
                lat: position.lat,
                lng: position.lng,
                accuracy: position.accuracy || 0,
                timestamp: position.timestamp || Date.now()
            };
        }

        if (!normalized) return null;
        if (!this.isBrazilLocation(normalized.lat, normalized.lng)) {
            console.warn('📍 Localização fora do Brasil ou inválida. Usando fallback de Marabá.', normalized);
            return { ...this.getDefaultMapLocation(), timestamp: normalized.timestamp || Date.now() };
        }

        return normalized;
    },

    f7App: f7,

    linksData: [
        { title: 'TV Círio Marabá', description: 'Transmissões ao vivo e vídeos.', icon: 'youtube', url: 'https://www.youtube.com/@tvciriodenazaremaraba' },
        { title: 'Instagram Oficial', description: 'Fotos, reels e novidades.', icon: 'instagram', url: 'https://www.instagram.com/ciriomaraba?stkn=b25iZHM2c3Q1ZmRj' },
        { title: 'Diocese de Marabá', description: 'Portal oficial da Diocese.', icon: 'church', url: 'https://www.instagram.com/diocesedemaraba/' },
        { title: 'Como Chegar', description: 'Abrir localização no Google Maps.', icon: 'location', url: 'https://www.google.com/maps/search/?api=1&query=Santu%C3%A1rio+Nossa+Senhora+de+Nazar%C3%A9+Marab%C3%A1+PA' },
        { title: 'Facebook', description: 'Fique por dentro das novidades e  noticias.', icon: 'facebook', url: 'https://www.facebook.com/share/187yDnCyFm/?mibextid=wwXIfr' }
    ],
    patrocinadoresData: [],

    eventosData: [
        { id: 1, titulo: 'Peregrinação: Comunidade Santo Antônio de Pádua', categoria: 'Peregrinação', data: '2026-09-22', hora: '19:00 - 19:30', local: 'Comunidade Santo Antônio de Pádua', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Comunidade Santo Antônio de Pádua.', detalhe: false, status: 'Previsto' },
        { id: 2, titulo: 'Peregrinação: Comunidade Nossa Senhora Aparecida', categoria: 'Peregrinação', data: '2026-09-23', hora: '19:00 - 19:30', local: 'Comunidade Nossa Senhora Aparecida', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Comunidade Nossa Senhora Aparecida.', detalhe: false, status: 'Previsto' },
        { id: 3, titulo: 'Peregrinação: Comunidade Jesus Misericordioso', categoria: 'Peregrinação', data: '2026-09-24', hora: '19:00 - 19:30', local: 'Comunidade Jesus Misericordioso', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Comunidade Jesus Misericordioso.', detalhe: false, status: 'Previsto' },
        { id: 4, titulo: 'Peregrinação da Luz e abertura oficial do Círio 2026', categoria: 'Peregrinação', data: '2026-09-25', hora: '18:30 - 19:30', local: 'Santuário Nossa Senhora de Nazaré', imagem: 'img/custom/nossa-senhora.png', descricao: 'Abertura oficial da programação do Círio com peregrinação da luz.', detalhe: true, status: 'Previsto' },
        { id: 5, titulo: 'Círio Missionário - Paróquia Senhora Santana', categoria: 'Círio Missionário', data: '2026-09-26', hora: '15:00', local: 'Paróquia Senhora Santana', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário na Paróquia Senhora Santana.', detalhe: false, status: 'Previsto' },
        { id: 6, titulo: 'Peregrinação - Paróquia Senhora Santana', categoria: 'Peregrinação', data: '2026-09-26', hora: '18:00 - 19:30', local: 'Paróquia Senhora Santana', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Paróquia Senhora Santana.', detalhe: false, status: 'Previsto' },
        { id: 7, titulo: 'Círio Missionário - Paróquia Nossa Senhora de Fátima', categoria: 'Círio Missionário', data: '2026-09-27', hora: '15:00', local: 'Paróquia Nossa Senhora de Fátima', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário na Paróquia Nossa Senhora de Fátima.', detalhe: false, status: 'Previsto' },
        { id: 8, titulo: 'Peregrinação - Paróquia Nossa Senhora de Fátima', categoria: 'Peregrinação', data: '2026-09-27', hora: '18:00 - 19:30', local: 'Paróquia Nossa Senhora de Fátima', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Paróquia Nossa Senhora de Fátima.', detalhe: false, status: 'Previsto' },
        { id: 9, titulo: 'Círio Missionário - Paróquia São José Operário', categoria: 'Círio Missionário', data: '2026-09-29', hora: '15:00', local: 'Paróquia São José Operário', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário na Paróquia São José Operário.', detalhe: false, status: 'Previsto' },
        { id: 10, titulo: 'Peregrinação - Paróquia São José Operário', categoria: 'Peregrinação', data: '2026-09-29', hora: '18:00 - 19:30', local: 'Paróquia São José Operário', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Paróquia São José Operário.', detalhe: false, status: 'Previsto' },
        { id: 11, titulo: 'Círio Missionário - Paróquia Santo Antônio', categoria: 'Círio Missionário', data: '2026-09-30', hora: '15:00', local: 'Paróquia Santo Antônio', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário na Paróquia Santo Antônio.', detalhe: false, status: 'Previsto' },
        { id: 12, titulo: 'Peregrinação - Paróquia Santo Antônio', categoria: 'Peregrinação', data: '2026-09-30', hora: '17:00 - 19:30', local: 'Paróquia Santo Antônio', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Paróquia Santo Antônio.', detalhe: false, status: 'Previsto' },
        { id: 13, titulo: 'Círio Missionário - Paróquia Sagrado Coração de Jesus', categoria: 'Círio Missionário', data: '2026-10-02', hora: '15:00', local: 'Paróquia Sagrado Coração de Jesus', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário na Paróquia Sagrado Coração de Jesus.', detalhe: false, status: 'Previsto' },
        { id: 14, titulo: 'Peregrinação - Paróquia Sagrado Coração de Jesus', categoria: 'Peregrinação', data: '2026-10-02', hora: '18:00 - 19:30', local: 'Paróquia Sagrado Coração de Jesus', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Paróquia Sagrado Coração de Jesus.', detalhe: false, status: 'Previsto' },
        { id: 15, titulo: 'Círio Missionário - Paróquia Bom Pastor', categoria: 'Círio Missionário', data: '2026-10-05', hora: '15:00', local: 'Paróquia Bom Pastor', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário na Paróquia Bom Pastor.', detalhe: false, status: 'Previsto' },
        { id: 16, titulo: 'Peregrinação - Paróquia Bom Pastor', categoria: 'Peregrinação', data: '2026-10-05', hora: '18:00 - 19:30', local: 'Paróquia Bom Pastor', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Paróquia Bom Pastor.', detalhe: false, status: 'Previsto' },
        { id: 17, titulo: 'Círio Missionário - Capelania Militar Santo Inácio de Loyola', categoria: 'Círio Missionário', data: '2026-10-06', hora: '15:00', local: 'Capelania Militar Santo Inácio de Loyola', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário na Capelania Militar Santo Inácio de Loyola.', detalhe: false, status: 'Previsto' },
        { id: 18, titulo: 'Peregrinação - Capelania Militar Santo Inácio de Loyola', categoria: 'Peregrinação', data: '2026-10-06', hora: '18:00 - 19:30', local: 'Capelania Militar Santo Inácio de Loyola', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Capelania Militar Santo Inácio de Loyola.', detalhe: false, status: 'Previsto' },
        { id: 19, titulo: 'Círio Missionário - Paróquia São Félix de Valois', categoria: 'Círio Missionário', data: '2026-10-08', hora: '15:00', local: 'Paróquia São Félix de Valois', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário na Paróquia São Félix de Valois.', detalhe: false, status: 'Previsto' },
        { id: 20, titulo: 'Peregrinação - Paróquia São Félix de Valois', categoria: 'Peregrinação', data: '2026-10-08', hora: '18:00 - 19:30', local: 'Paróquia São Félix de Valois', imagem: 'img/custom/logo.png', descricao: 'Peregrinação na Paróquia São Félix de Valois.', detalhe: false, status: 'Previsto' },
        { id: 21, titulo: 'Ciclo-Romaria', categoria: 'Romaria', data: '2026-10-10', hora: '17:30 - 19:00', local: 'Marabá - PA', imagem: 'img/custom/logo.png', descricao: 'Ciclo-Romaria em preparação para a saída do Círio.', detalhe: false, status: 'Previsto' },
        { id: 22, titulo: '3º Círio da Juventude', categoria: 'Juventude', data: '2026-10-11', hora: '16:00', local: 'Marabá - PA', imagem: 'img/custom/logo.png', descricao: '3º Círio da Juventude.', detalhe: false, status: 'Previsto' },
        { id: 23, titulo: 'Moto-Romaria', categoria: 'Romaria', data: '2026-10-11', hora: '18:00 - 19:30', local: 'Marabá - PA', imagem: 'img/custom/logo.png', descricao: 'Moto-Romaria.', detalhe: false, status: 'Previsto' },
        { id: 24, titulo: 'Visita da Imagem Peregrina à Câmara Municipal', categoria: 'Visita', data: '2026-10-13', hora: '09:00', local: 'Câmara Municipal', imagem: 'img/custom/logo.png', descricao: 'Visita da Imagem Peregrina à Câmara Municipal.', detalhe: false, status: 'Previsto' },
        { id: 25, titulo: 'Círio Missionário e Peregrinação - Paróquia Imaculada Conceição', categoria: 'Círio Missionário', data: '2026-10-13', hora: '15:00 - 19:30', local: 'Paróquia Imaculada Conceição', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário e Peregrinação na Paróquia Imaculada Conceição.', detalhe: false, status: 'Previsto' },
        { id: 26, titulo: 'Missa de Investidura da Guarda de Nazaré', categoria: 'Missa', data: '2026-10-14', hora: '19:30', local: 'Santuário Nossa Senhora de Nazaré', imagem: 'img/custom/nossa-senhora.png', descricao: 'Missa de investidura da Guarda de Nazaré.', detalhe: false, status: 'Previsto' },
        { id: 27, titulo: 'Círio Missionário e Peregrinação - Comunidade São João Batista', categoria: 'Círio Missionário', data: '2026-10-15', hora: '15:00 - 19:30', local: 'Comunidade São João Batista', imagem: 'img/custom/logo.png', descricao: 'Círio Missionário e Peregrinação na Comunidade São João Batista.', detalhe: false, status: 'Previsto' },
        { id: 28, titulo: 'Segue da Comunidade São João Batista', categoria: 'Eventos Especiais', data: '2026-10-16', hora: '18:00 - 19:00', local: 'Comunidade São João Batista', imagem: 'img/custom/logo.png', descricao: 'Segue da Comunidade São João Batista.', detalhe: false, status: 'Previsto' },
        { id: 29, titulo: 'Grande Dia do Círio: Missa, Romaria e Acolhida', categoria: 'Missa', data: '2026-10-17', hora: '07:00 - 11:30', local: 'Santuário Nossa Senhora de Nazaré / Marabá - PA', imagem: 'img/custom/nossa-senhora.png', descricao: 'Sequência do grande dia do Círio: missa, romaria rodoviária e acolhida da Imagem Peregrina.', detalhe: true, status: 'Previsto' },
        { id: 32, titulo: 'Trasladação para o Porto das Mangueiras', categoria: 'Eventos Especiais', data: '2026-10-17', hora: '16:00', local: 'Porto das Mangueiras', imagem: 'img/custom/logo.png', descricao: 'Trasladação para o Porto das Mangueiras.', detalhe: false, status: 'Previsto' },
        { id: 33, titulo: 'Círio Fluvial', categoria: 'Círio', data: '2026-10-17', hora: '17:30', local: 'Porto das Mangueiras', imagem: 'img/custom/logo.png', descricao: 'Círio Fluvial.', detalhe: false, status: 'Previsto' },
        { id: 34, titulo: 'Chegada do Círio Fluvial', categoria: 'Eventos Especiais', data: '2026-10-17', hora: '18:30', local: 'Porto das Mangueiras', imagem: 'img/custom/logo.png', descricao: 'Chegada do Círio Fluvial.', detalhe: false, status: 'Previsto' },
        { id: 35, titulo: 'Santa Missa de Apresentação do Manto Oficial', categoria: 'Missa', data: '2026-10-17', hora: '19:30', local: 'Santuário Nossa Senhora de Nazaré', imagem: 'img/custom/nossa-senhora.png', descricao: 'Santa Missa de apresentação do manto oficial.', detalhe: false, status: 'Previsto' },
        { id: 36, titulo: 'Santa Missa na Catedral Diocesana', categoria: 'Missa', data: '2026-10-18', hora: '06:00', local: 'Catedral Diocesana', imagem: 'img/custom/nossa-senhora.png', descricao: 'Santa Missa na Catedral Diocesana.', detalhe: false, status: 'Previsto' },
        { id: 37, titulo: 'Saída do 46º Círio de Nazaré', categoria: 'Círio', data: '2026-10-18', hora: '07:00', local: 'Marabá - PA', imagem: 'img/custom/logo.png', descricao: 'Saída oficial do 46º Círio de Nazaré.', detalhe: false, status: 'Previsto' },
        { id: 38, titulo: 'Santa Missa de Encerramento', categoria: 'Missa', data: '2026-10-18', hora: '11:30', local: 'Marabá - PA', imagem: 'img/custom/nossa-senhora.png', descricao: 'Santa Missa de encerramento do Círio.', detalhe: false, status: 'Previsto' }
    ],

    selectedEventDate: null,
    selectedFilter: 'Todos',
    searchQuery: '',
    reminders: {},
    reminderSheetOpen: false,
    currentReminderEventId: null,
    selectedReminderOption: '30m',
    eventsCalendar: null,

    loadReminders: function() {
        try {
            const stored = window.localStorage.getItem('cirioEventReminders');
            if (stored) {
                this.reminders = JSON.parse(stored) || {};
            }
        } catch (e) {
            console.warn('Erro carregando lembretes:', e);
        }
    },

    saveReminders: function() {
        try {
            window.localStorage.setItem('cirioEventReminders', JSON.stringify(this.reminders));
        } catch (e) {
            console.warn('Erro salvando lembretes:', e);
        }
    },

    getEventTimeMillis: function(evento) {
        if (!evento || !evento.data || !evento.hora) return null;
        const timeParts = evento.hora.split(':');
        const hour = Number.parseInt(timeParts[0], 10);
        const minute = Number.parseInt(timeParts[1], 10);
        if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
        const eventDate = new Date(`${evento.data}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
        return Number.isNaN(eventDate.getTime()) ? null : eventDate.getTime();
    },

    getReminderOffsets: function() {
        return [
            { key: '30m', label: '30 minutos', ms: 30 * 60 * 1000 },
            { key: '4h', label: '4 horas', ms: 4 * 60 * 60 * 1000 },
            { key: '6h', label: '6 horas', ms: 6 * 60 * 60 * 1000 },
            { key: '1d', label: '1 dia', ms: 24 * 60 * 60 * 1000 }
        ];
    },

    getReminderNotificationId: function(eventId, key) {
        return `cirio_event_${String(eventId).replace(/[^a-zA-Z0-9_-]/g, '_')}_${key}`;
    },

    getLocalNotificationPlugin: function() {
        return window.cordova && cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local
            ? cordova.plugins.notification.local : null;
    },

    ensureLocalNotificationSetup: async function(plugin) {
        if (!plugin) return false;
        try {
            if (typeof plugin.requestPermission === 'function') {
                const permission = await new Promise(resolve => plugin.requestPermission(resolve));
                if (permission === false || (permission && permission.granted === false)) return false;
            }
            if (typeof plugin.createChannel === 'function') {
                await new Promise(resolve => plugin.createChannel({
                    androidChannelId: 'event_reminders',
                    androidChannelName: 'Lembretes de eventos',
                    androidChannelImportance: 'high'
                }, resolve));
            }
            return true;
        } catch (error) {
            console.warn('Permissao/canal de notificacao indisponivel:', error);
            return false;
        }
    },

    cancelEventReminders: async function(eventId, ids) {
        const plugin = this.getLocalNotificationPlugin();
        if (!plugin || typeof plugin.cancel !== 'function') return;
        const notificationIds = Array.isArray(ids) && ids.length
            ? ids : this.getReminderOffsets().map(offset => this.getReminderNotificationId(eventId, offset.key));
        for (const id of notificationIds) {
            try { await new Promise(resolve => plugin.cancel(id, resolve)); } catch (error) { /* ja cancelado */ }
        }
    },

    scheduleEventReminders: async function(evento, selectedOption = this.selectedReminderOption) {
        const eventTimeMillis = this.getEventTimeMillis(evento);
        if (!eventTimeMillis) return [];
        const plugin = this.getLocalNotificationPlugin();
        if (!plugin || typeof plugin.schedule !== 'function') return [];
        if (!await this.ensureLocalNotificationSetup(plugin)) return [];

        const reminderOption = this.normalizeReminderOption(selectedOption);
        const offsets = this.getReminderOffsets().filter(offset => offset.key === reminderOption);
        const scheduledIds = [];
        await this.cancelEventReminders(evento.id);
        for (const offset of offsets) {
            const triggerAt = eventTimeMillis - offset.ms;
            if (triggerAt <= Date.now()) continue;
            const id = this.getReminderNotificationId(evento.id, offset.key);
            await new Promise((resolve, reject) => {
                plugin.schedule({
                    id,
                    title: evento.titulo || 'Evento',
                    text: `Faltam ${offset.label}: ${evento.hora || ''}${evento.local ? ` - ${evento.local}` : ''}`,
                    at: new Date(triggerAt),
                    androidChannelId: 'event_reminders',
                    data: { eventId: evento.id, reminder: offset.key }
                }, result => result === false ? reject(new Error('Permissao de notificacao negada')) : resolve());
            });
            scheduledIds.push(id);
        }
        return scheduledIds;
    },

    showNotification: async function(title, body) {
        if ('Notification' in window) {
            try {
                if (Notification.permission === 'default') {
                    await Notification.requestPermission();
                }
                if (Notification.permission === 'granted') {
                    new Notification(title, { body });
                    return;
                }
            } catch (e) {
                console.warn('Erro ao exibir notificação:', e);
            }
        }
        f7.toast.create({ text: body, closeTimeout: 4000 }).open();
    },

    scheduleReminderChecks: function() {
        if (this._reminderCheckInterval) return;
        this._reminderCheckInterval = window.setInterval(() => this.checkRemindersDue(), 15 * 60 * 1000);
        this.checkRemindersDue();
    },

    checkRemindersDue: function() {
        const now = Date.now();
        Object.values(this.reminders).forEach(reminder => {
            if (reminder.notified || !reminder.triggerAt || reminder.scheduledIds) return;
            // If reminder was scheduled via native Cordova plugin, skip web check
            const triggerTime = new Date(reminder.triggerAt).getTime();
            if (triggerTime <= now) {
                const evento = this.eventosData.find(item => item.id === reminder.eventId);
                if (!evento) return;
                reminder.notified = true;
                this.saveReminders();
                this.showNotification('Lembrete ativo', `${evento.titulo} às ${evento.hora}`);
            }
        });
    },

    activateReminder: async function(eventId) {
        const evento = this.eventosData.find(item => item.id === eventId);
        if (!evento) return;
        const reminderObj = {
            eventId: evento.id,
            option: '30m,4h,6h,1d',
            eventTime: this.getEventTimeMillis(evento),
            createdAt: new Date().toISOString(),
            scheduledIds: []
        };
        this.reminders[evento.id] = reminderObj;
        this.saveReminders();

        try {
            reminderObj.scheduledIds = await this.scheduleEventReminders(evento);
            this.saveReminders();
        } catch (error) {
            console.warn('Erro ao agendar lembretes nativos:', error);
        }

        // Ensure background checker is running for web fallback
        this.scheduleReminderChecks();
        f7.toast.create({ text: 'Lembrete definido', closeTimeout: 2200 }).open();
    },

    // ========================================
    // INICIALIZAÇÃO
    // ========================================
    init: function() {
        if (this._initStarted) return;
        this._initStarted = true;

        if (window.firebaseManager && typeof window.firebaseManager.onAppDataUpdate === 'function') {
            window.firebaseManager.onAppDataUpdate((appData) => {
                try { this.applyFirebaseAppData(appData); } catch (e) { console.warn('Erro aplicando dados Firebase', e); }
            });
        }

        if (typeof trackerManager !== 'undefined') {
            trackerManager.subscribe((trackerState) => this.onTrackerUpdate(trackerState));
            trackerManager.init();
        }

        this.loadReminders();
        this.scheduleReminderChecks();

        // Inicializar novos serviços (compatível com versões antigas)
        if (window.firebaseService && typeof window.firebaseService.init === 'function') {
            try { window.firebaseService.init(); } catch(e) { console.warn('firebaseService.init failed', e); }
        }

        if (window.trackingService && typeof window.trackingService.subscribe === 'function') {
            try { window.trackingService.subscribe((s) => this.onTrackerUpdate(s)); } catch(e) { console.warn('trackingService.subscribe failed', e); }
            try { if (typeof window.trackingService.init === 'function') window.trackingService.init(); } catch(e) {}
        }

        console.log('🎉 Iniciando App Localiza a Berlinda com Framework7...');
        console.log('Framework7 instance:', f7);
        console.log('Main view:', f7.views.main);

        document.addEventListener('deviceready', () => {
            this.onDeviceReady();
        }, false);

        if (document.readyState !== 'loading') {
            setTimeout(() => this.onDeviceReady(), 150);
        }
    },

    showSplashScreen: function() {
        const splashScreen = document.getElementById('splashScreen');
        if (splashScreen) {
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 2000);
        }
    },

    applyFirebaseAppData: function(data) {
        if (!data || typeof data !== 'object') return;

        if (Array.isArray(data.links)) {
            this.linksData = data.links.map(link => ({
                title: link.title || 'Link',
                description: link.description || '',
                icon: link.icon || 'link',
                url: link.url || '#'
            }));
        }

        if (Array.isArray(data.eventos) && data.eventos.length > 0) {
            this.eventosData = data.eventos.map((evento, index) => ({
                id: evento.id || index + 1,
                titulo: evento.titulo || `Evento ${index + 1}`,
                categoria: this.normalizeEventCategory(evento.categoria || 'Eventos Especiais'),
                data: evento.data || this.getDateKey(new Date()),
                hora: evento.hora || '00:00',
                local: evento.local || 'Local não informado',
                imagem: evento.imagem || 'img/custom/logo.png',
                descricao: evento.descricao || 'Descrição em breve.',
                detalhe: evento.detalhe || false,
                status: evento.status || 'Confirmado'
            }));
        }

        if (Array.isArray(data.patrocinadores)) {
            this.patrocinadoresData = data.patrocinadores.slice();
        }

        if (data.transmissao) {
            const configuredTransmission = window.LiveTransmission && window.LiveTransmission.current;
            window.LiveTransmission = {
                current: {
                    ...data.transmissao,
                    ...(configuredTransmission && {
                        channel: configuredTransmission.channel,
                        channelUrl: configuredTransmission.channelUrl,
                        url: configuredTransmission.url
                    })
                }
            };
            this.loadLiveTransmissionCard();
        }

        this.renderLinksPage();
        this.renderEventsPage();
        this.renderSponsorBanner();
    },

    onDeviceReady: function() {
        if (this._deviceReady) return;
        this._deviceReady = true;

        console.log('✅ Device Ready with Framework7!');
        if (navigator && navigator.splashscreen && navigator.splashscreen.hide) {
            try { navigator.splashscreen.hide(); } catch (e) { /* ignore */ }
        }
        this.setupEventListeners();
        this.loadLiveTransmissionCard();
        this.setupPageEvents();
        this.renderLinksPage();
        this.renderEventsPage();
        this.renderSponsorBanner();
        this.updateUI();
        if (window.firebaseManager && typeof window.firebaseManager.registerSharerDevice === 'function') {
            window.firebaseManager.registerSharerDevice();
        }
        this.ensureHomePage();
    },

    setupPageEvents: function() {
        if (!f7) return;
        f7.on('pageInit', (page) => {
            if (page.name === 'links') {
                this.renderLinksPage();
            }
            if (page.name === 'eventos') {
                this.renderEventsPage();
            }
        });
    },

    renderLinksPage: function() {
        const container = document.getElementById('linksList');
        if (!container) return;
        const links = Array.isArray(this.linksData) && this.linksData.length ? this.linksData : [];
        container.innerHTML = links.map(link => {
            const iconClass = this.getLinkIconClass(link.icon);
            const safeUrl = this.safeRemoteUrl(link.url);
            if (!safeUrl) return '';
            return `
                <div class="link-card" role="button" onclick="app.openExternalLink('${this.escapeJsString(safeUrl)}')">
                    <div class="link-card-main">
                        <div class="link-icon link-icon-${this.escapeHtml(link.icon)}">
                            <i class="${iconClass}" aria-hidden="true"></i>
                        </div>
                        <div class="link-card-content">
                            <div class="link-card-title">${this.escapeHtml(link.title)}</div>
                            <div class="link-card-description">${this.escapeHtml(link.description)}</div>
                        </div>
                    </div>
                    <div class="link-card-action"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></div>
                </div>
            `;
        }).join('');
    },

    renderEventsPage: function() {
        const today = this.getDateKey(new Date());
        if (!this.selectedEventDate || this.selectedEventDate === '1969-12-31' || !this.parseDateKey(this.selectedEventDate)) {
            this.selectedEventDate = today;
        }
        this.renderEventsCalendar();
        this.renderEventFilters();
        this.renderEventHighlight();
        this.renderEventList();
        this.setupEventSearch();
    },

    getDateKey: function(date) {
        if (date == null) return null;
        let d;
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const [year, month, day] = date.split('-').map(Number);
            d = new Date(year, month - 1, day);
        } else if (Object.prototype.toString.call(date) === '[object Date]') {
            d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
            d = new Date(date);
        }
        if (Number.isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    parseDateKey: function(dateKey) {
        if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
        const [year, month, day] = dateKey.split('-').map(Number);
        return new Date(year, month - 1, day);
    },

    normalizeEventCategory: function(category) {
        const value = (category || '').trim();
        if (!value) return 'Eventos Especiais';
        const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const aliases = {
            'evento': 'Eventos Especiais',
            'eventos': 'Eventos Especiais',
            'eventos especiais': 'Eventos Especiais',
            'romaria': 'Romaria',
            'juventude': 'Juventude',
            'cirio missionario': 'Círio Missionário',
            'cirio musical': 'Círio Musical',
            'peregrinacao': 'Peregrinação',
            'visita': 'Visita'
        };
        return aliases[normalized] || value;
    },

    getDayKeyFromElement: function(dayEl) {
        if (!dayEl || !dayEl.dataset) return null;
        const day = parseInt(dayEl.dataset.day, 10);
        const month = parseInt(dayEl.dataset.month, 10);
        const year = parseInt(dayEl.dataset.year, 10);
        if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
        const normalizedMonth = month + 1;
        return `${year}-${String(normalizedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    },

    getEventsByDate: function(dateKey) {
        return this.eventosData.filter(evento => evento.data === dateKey);
    },

    getEventsForSelectedDate: function() {
        return this.getEventsByDate(this.selectedEventDate);
    },

    getFilteredEvents: function() {
        const query = this.searchQuery.trim().toLowerCase();
        // When filtering, ignore the selected date: show upcoming events in the chosen category(s)
        let events = Array.isArray(this.eventosData) ? this.eventosData.slice() : [];
        // Remove events whose date has already passed (compare date only)
        const todayDate = this.parseDateKey(this.getDateKey(new Date()));
        events = events.filter(ev => {
            const evDate = this.parseDateKey(ev && ev.data);
            return evDate && evDate >= todayDate;
        });
        // Apply category filter (if not 'Todos')
        if (this.selectedFilter && this.selectedFilter !== 'Todos') {
            events = events.filter(ev => ev.categoria === this.selectedFilter);
        }
        // Apply search filter
        if (query) {
            events = events.filter(evento => {
                return [evento.titulo, evento.categoria, evento.local, evento.descricao].some(value => (value || '').toLowerCase().includes(query));
            });
        }
        return events;
    },

    renderEventsCalendar: function() {
        const container = document.getElementById('eventsCalendar');
        if (!container) return;
        const app = this;
        const today = this.getDateKey(new Date());
        if (!this.selectedEventDate || this.selectedEventDate === '1969-12-31' || !this.parseDateKey(this.selectedEventDate)) {
            this.selectedEventDate = today;
        }
        if (this.eventsCalendar) {
            const selectedDate = this.parseDateKey(this.selectedEventDate) || new Date();
            this.eventsCalendar.setValue(selectedDate);
            this.highlightCalendarDays();
            return;
        }
        const selectedDayKey = this.getDayKeyFromElement(container.querySelector('.calendar-day-selected:not(.calendar-day-prev):not(.calendar-day-next)'));
        if (!this.parseDateKey(this.selectedEventDate) && selectedDayKey) {
            this.selectedEventDate = selectedDayKey;
        }
        this.eventsCalendar = f7.calendar.create({
            containerEl: '#eventsCalendar',
            value: [this.parseDateKey(this.selectedEventDate) || new Date()],
            weekHeader: true,
            showOtherMonths: false,
            toolbarTemplate: function() {
                return '<div class="calendar-header">'
                    + '<button type="button" class="calendar-nav prev" aria-label="Mês anterior"><i class="fa-solid fa-chevron-left"></i></button>'
                    + '<div class="calendar-title"><span class="calendar-year"></span><span class="calendar-month"></span></div>'
                    + '<button type="button" class="calendar-nav next" aria-label="Próximo mês"><i class="fa-solid fa-chevron-right"></i></button>'
                    + '</div>';
            },
            on: {
                init: (calendar) => {
                    app.updateCalendarHeader(calendar);
                    app.highlightCalendarDays();
                    app.bindCalendarNavigation(calendar);
                },
                monthYearChange: (calendar) => {
                    app.updateCalendarHeader(calendar);
                    app.highlightCalendarDays();
                },
                dayClick: function(calendar, dayEl, date) {
                    const selectedDay = app.getDayKeyFromElement(dayEl) || app.getDateKey(date);
                    if (selectedDay) {
                        app.selectedEventDate = selectedDay;
                        app.renderEventHighlight();
                        app.renderEventList();
                        app.highlightCalendarDays();
                    }
                }
            }
        });
    },

    updateCalendarHeader: function(calendar) {
        // Framework7 calendar may expose DOM as `el` or as a Dom7 collection `$el`.
        const container = (calendar && (calendar.el || (calendar.$el && calendar.$el[0]) || calendar.$el));
        if (!container) return;
        const header = (container.querySelector ? container.querySelector('.calendar-header .calendar-title') : null);
        if (!header) return;
        const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const month = monthNames[calendar.currentMonth];
        const monthEl = header.querySelector('.calendar-month');
        if (monthEl) monthEl.textContent = month;
    },

    bindCalendarNavigation: function(calendar) {
        const container = calendar.el || (calendar.$el && calendar.$el[0]) || calendar.$el;
        const prevBtn = container && container.querySelector ? container.querySelector('.calendar-nav.prev') : null;
        const nextBtn = container && container.querySelector ? container.querySelector('.calendar-nav.next') : null;
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (calendar.prevMonth) {
                    calendar.prevMonth();
                } else if (calendar.setMonth) {
                    calendar.setMonth(calendar.currentMonth - 1);
                }
                this.updateCalendarHeader(calendar);
                this.highlightCalendarDays();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (calendar.nextMonth) {
                    calendar.nextMonth();
                } else if (calendar.setMonth) {
                    calendar.setMonth(calendar.currentMonth + 1);
                }
                this.updateCalendarHeader(calendar);
                this.highlightCalendarDays();
            });
        }
    },

    highlightCalendarDays: function() {
        if (!this.eventsCalendar) return;
        const calendarObj = this.eventsCalendar;
        const calendarEl = (calendarObj.el || (calendarObj.$el && calendarObj.$el[0]) || calendarObj.$el || calendarObj);
        if (!calendarEl || typeof calendarEl.querySelectorAll !== 'function') return;
        const allDays = calendarEl.querySelectorAll('.calendar-day');
        // Map event dates to counts for tooltip/indicator
        const eventsByDate = this.eventosData.reduce((acc, ev) => {
            if (!ev || !ev.data) return acc;
            acc[ev.data] = (acc[ev.data] || 0) + 1;
            return acc;
        }, {});
        const eventDays = new Set(Object.keys(eventsByDate));
        const todayKey = this.getDateKey(new Date());
        allDays.forEach(dayEl => {
            dayEl.classList.remove('calendar-day-event', 'calendar-day-selected', 'calendar-day-today', 'calendar-day-past-event');
            const day = dayEl.dataset.day;
            const month = dayEl.dataset.month;
            const year = dayEl.dataset.year;
            if (!day || !month || !year) return;
            const monthNumber = parseInt(month, 10);
            if (Number.isNaN(monthNumber)) return;
            const normalizedMonth = monthNumber + 1;
            const dayKey = `${year}-${String(normalizedMonth).padStart(2,'0')}-${String(parseInt(day, 10)).padStart(2,'0')}`;
            if (eventDays.has(dayKey)) {
                // If the event date is in the past, hide it from the calendar view
                const dayDate = this.parseDateKey(dayKey);
                const todayDate = this.parseDateKey(this.getDateKey(new Date()));
                if (dayDate && todayDate && dayDate < todayDate) {
                    dayEl.classList.add('calendar-day-past-event');
                    try { dayEl.style.visibility = 'hidden'; dayEl.style.pointerEvents = 'none'; } catch(e){}
                    dayEl.removeAttribute('data-event-count');
                    dayEl.removeAttribute('title');
                } else {
                    dayEl.classList.add('calendar-day-event');
                    // ensure days from adjacent months are visible and clickable
                        // Keep event highlighting limited to the selected month.
                        if (dayEl.classList.contains('calendar-day-prev') || dayEl.classList.contains('calendar-day-next')) return;
                        try { dayEl.style.visibility = 'visible'; dayEl.style.pointerEvents = 'auto'; } catch(e){}
                    const count = eventsByDate[dayKey] || 1;
                    dayEl.setAttribute('data-event-count', String(count));
                    dayEl.setAttribute('title', `${count} evento${count > 1 ? 's' : ''} nesta data`);
                }
            }
            if (dayKey === todayKey) dayEl.classList.add('calendar-day-today');
            if (dayKey === this.selectedEventDate) dayEl.classList.add('calendar-day-selected');
        });
    },

    renderEventFilters: function() {
        const container = document.getElementById('eventFilters');
        if (!container) return;
        const categories = ['Todos','Missa','Procissão','Novena','Formação','Retiro','Círio','Eventos Especiais','Peregrinação','Romaria','Visita','Juventude','Círio Missionário','Círio Musical'];
        container.innerHTML = categories.map(category => `
            <button type="button" class="event-filter-chip ${this.selectedFilter === category ? 'active' : ''}" onclick="app.selectEventFilter('${category}')">${category}</button>
        `).join('');
    },

    selectEventFilter: function(category) {
        this.selectedFilter = category;
        this.renderEventFilters();
        this.renderEventList();
    },

    renderEventHighlight: function() {
        const highlightCard = document.getElementById('eventHighlightCard');
        if (!highlightCard) return;
        const eventsForDate = this.getEventsByDate(this.selectedEventDate);
        const highlightEvent = eventsForDate.find(evento => evento.detalhe) || eventsForDate[0];
        if (!highlightEvent) {
            highlightCard.innerHTML = '<div class="event-empty">Nenhum evento em destaque para esta data.</div>';
            return;
        }
        const imageUrl = this.escapeHtml(this.safeRemoteUrl(highlightEvent.imagem));
        const title = this.formatEventTitle(highlightEvent.titulo);
        const titleText = this.escapeHtml(this.stripEventMarkup(highlightEvent.titulo));
        const description = this.escapeHtml(highlightEvent.descricao);
        const local = this.escapeHtml(highlightEvent.local);
        const category = this.escapeHtml(highlightEvent.categoria);
        highlightCard.innerHTML = `
            <div class="event-highlight-grid">
                <div class="event-highlight-image"><img src="${imageUrl}" alt="${titleText}" /></div>
                <div class="event-highlight-info">
                    <div class="event-highlight-tag">DESTAQUE</div>
                    <h2>${title}</h2>
                    <p>${description}</p>
                    <div class="event-highlight-meta">
                        <span><i class="fa-solid fa-calendar-days"></i> ${this.formatDate(highlightEvent.data)}</span>
                        <span><i class="fa-solid fa-clock"></i> ${highlightEvent.hora}</span>
                        <span>${local}</span>
                    </div>
                    <div class="event-highlight-actions">
                        ${this.reminders && this.reminders[highlightEvent.id] ?
                            `<button class="btn btn-primary-outline" onclick="app.openReminderSheet(${highlightEvent.id})">Editar lembrete</button>` :
                            `<button class="btn btn-primary" onclick="app.activateReminder(${highlightEvent.id})">Participar</button>`}
                        <button class="btn btn-info" onclick="app.abrirLocalizacao('${this.escapeJsString(highlightEvent.local)}')">Abrir no Maps</button>
                    </div>
                </div>
            </div>
        `;
    },

    formatDate: function(dateString) {
        let date = this.parseDateKey(dateString);
        if (!date) {
            date = new Date(dateString);
        }
        const day = String(date.getDate()).padStart(2,'0');
        const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        return `${day} ${monthNames[date.getMonth()]}`;
    },

    renderEventList: function() {
        const list = document.getElementById('eventsList');
        if (!list) return;
        // If 'Todos', render grouped by category (preserve order)
        const categories = ['Missa','Procissão','Novena','Formação','Retiro','Círio','Eventos Especiais','Peregrinação','Romaria','Visita','Juventude','Círio Missionário','Círio Musical'];
        const events = this.getFilteredEvents();
        if (this.selectedFilter === 'Todos' || !this.selectedFilter) {
            // group events by category
            const groups = {};
            events.forEach(ev => {
                const cat = ev.categoria || 'Outros';
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(ev);
            });
            // Build HTML sections in the preferred category order, then any remaining
            let html = '';
            const used = new Set();
            categories.forEach(cat => {
                const items = groups[cat];
                if (items && items.length) {
                    used.add(cat);
                    html += `<section class="event-group"><h3 class="event-group-title">${cat} <span class="event-group-count">(${items.length})</span></h3>`;
                    // render compact (no image) for grouped view
                    html += items.map(evento => this._renderEventCompactHtml(evento)).join('');
                    html += `</section>`;
                }
            });
            // remaining categories
            Object.keys(groups).forEach(cat => {
                if (used.has(cat)) return;
                const items = groups[cat];
                html += `<section class="event-group"><h3 class="event-group-title">${cat} <span class="event-group-count">(${items.length})</span></h3>`;
                html += items.map(evento => this._renderEventCompactHtml(evento)).join('');
                html += `</section>`;
            });
            list.innerHTML = html || '<div class="event-no-results">Nenhum evento encontrado.</div>';
            return;
        }
        // Otherwise render flat list for specific category
        const items = events.map(evento => this._renderEventCardHtml(evento)).join('');
        list.innerHTML = items || '<div class="event-no-results">Nenhum evento encontrado.</div>';
    },

    _renderEventCardHtml: function(evento) {
        const imageUrl = this.escapeHtml(this.safeRemoteUrl(evento.imagem));
        const title = this.formatEventTitle(evento.titulo);
        const titleText = this.escapeHtml(this.stripEventMarkup(evento.titulo));
        const category = this.escapeHtml(evento.categoria);
        const status = this.escapeHtml(evento.status);
        return `
            <article class="event-card">
                <div class="event-card-image"><img src="${imageUrl}" alt="${titleText}" /></div>
                <div class="event-card-body">
                    <div class="event-card-head">
                        <div>
                            <h3>${title}</h3>
                            <span class="event-category">${category}</span>
                            ${this.reminders && this.reminders[evento.id] ? `<span class="event-badge reminder">Lembrete definido</span>` : ''}
                        </div>
                        <div class="event-status">${status}</div>
                    </div>
                    <div class="event-card-meta">
                        <span><i class="fa-solid fa-calendar-days"></i> ${this.formatDate(evento.data)}</span>
                        <span><i class="fa-solid fa-clock"></i> ${evento.hora}</span>
                        <span>${this.renderLocationLink(evento.local)}</span>
                    </div>
                    <div class="event-card-actions">
                        <button class="btn btn-secondary" onclick="app.openEventDetails(${evento.id})">Saiba Mais</button>
                        ${this.reminders && this.reminders[evento.id] ? `
                            <button class="btn btn-primary-outline" onclick="app.openReminderSheet(${evento.id})">Editar lembrete</button>
                        ` : `
                            <button class="btn btn-primary-outline" onclick="app.openReminderSheet(${evento.id})">Lembrete</button>
                        `}
                    </div>
                </div>
            </article>
        `;
    },

    _renderEventCompactHtml: function(evento) {
        const title = this.formatEventTitle(evento.titulo);
        const category = this.escapeHtml(evento.categoria);
        const status = this.escapeHtml(evento.status);
        return `
            <article class="event-card event-compact">
                <div class="event-card-body">
                    <div class="event-card-head">
                        <div>
                            <h3>${title}</h3>
                            <span class="event-category">${category}</span>
                            ${this.reminders && this.reminders[evento.id] ? `<span class="event-badge reminder">Lembrete definido</span>` : ''}
                        </div>
                        <div class="event-status">${status}</div>
                    </div>
                    <div class="event-card-meta">
                        <span><i class="fa-solid fa-calendar-days"></i> ${this.formatDate(evento.data)}</span>
                        <span><i class="fa-solid fa-clock"></i> ${evento.hora}</span>
                        <span>${this.renderLocationLink(evento.local)}</span>
                    </div>
                    <div class="event-card-actions">
                        <button class="btn btn-secondary" onclick="app.openEventDetails(${evento.id})">Saiba Mais</button>
                        ${this.reminders && this.reminders[evento.id] ? `
                            <button class="btn btn-primary-outline" onclick="app.openReminderSheet(${evento.id})">Editar lembrete</button>
                        ` : `
                            <button class="btn btn-primary-outline" onclick="app.openReminderSheet(${evento.id})">Lembrete</button>
                        `}
                    </div>
                </div>
            </article>
        `;
    },

    setupEventSearch: function() {
        const input = document.getElementById('eventSearchInput');
        if (!input) return;
        input.oninput = (event) => {
            this.searchQuery = event.target.value;
            this.renderEventList();
        };
    },

    openEventDetails: function(eventId) {
        const evento = this.eventosData.find(item => item.id === eventId);
        if (!evento) return;
        alert(`Detalhes do evento:\n${evento.titulo}\n${evento.categoria}\n${this.formatDate(evento.data)} ${evento.hora}\n${evento.local}`);
    },

    openReminderSheet: function(eventId) {
        const evento = this.eventosData.find(item => item.id === eventId);
        if (!evento) {
            console.warn('Nenhum evento encontrado para lembrete:', eventId);
            return;
        }
        this.currentReminderEventId = eventId;
        const existingReminder = this.reminders && this.reminders[eventId];
        this.selectedReminderOption = existingReminder && existingReminder.option
            ? this.normalizeReminderOption(existingReminder.option)
            : '30m';
        this.renderReminderSheet();
        const overlay = document.getElementById('eventSheetOverlay');
        const sheet = document.getElementById('eventReminderSheet');
        if (overlay && sheet) {
            overlay.classList.add('open');
            sheet.classList.add('open');
        }
    },

    closeReminderSheet: function() {
        const overlay = document.getElementById('eventSheetOverlay');
        const sheet = document.getElementById('eventReminderSheet');
        if (overlay && sheet) {
            overlay.classList.remove('open');
            sheet.classList.remove('open');
        }
    },

    normalizeReminderOption: function(option) {
        if (!option) return '30m';
        const values = typeof option === 'string' ? option.split(',') : [option];
        const normalized = values.map(value => String(value).trim()).find(value => this.getReminderOffsets().some(offset => offset.key === value));
        return normalized || '30m';
    },

    renderReminderSheet: function() {
        const sheet = document.getElementById('eventReminderSheet');
        if (!sheet) return;
        const evento = this.eventosData.find(item => item.id === this.currentReminderEventId);
        const isEditing = !!(this.reminders && this.reminders[this.currentReminderEventId]);
        const options = [
            { key: '30m', label: '30 minutos antes' },
            { key: '4h', label: '4 horas antes' },
            { key: '6h', label: '6 horas antes' },
            { key: '1d', label: '1 dia antes' }
        ];
        sheet.innerHTML = `
            <div class="sheet-handle"></div>
            <div class="sheet-content">
                <div class="sheet-title">${isEditing ? 'Editar lembrete' : 'Receber lembrete deste evento'}</div>
                <div class="sheet-event-name">${evento ? evento.titulo : 'Evento'}</div>
                <div class="reminder-options">${options.map(option => `
                    <label class="reminder-option ${this.selectedReminderOption === option.key ? 'selected' : ''}">
                        <input type="radio" name="reminderOption" value="${option.key}" ${this.selectedReminderOption === option.key ? 'checked' : ''} />
                        <span>${option.label}</span>
                    </label>
                `).join('')}</div>
                <div class="sheet-actions">
                    <button class="btn btn-secondary" onclick="app.closeReminderSheet()">Cancelar</button>
                    <button class="btn btn-primary" onclick="app.saveReminder()">${isEditing ? 'Atualizar' : 'Salvar'}</button>
                </div>
            </div>
        `;
        sheet.querySelectorAll('input[name="reminderOption"]').forEach(input => {
            input.addEventListener('change', (event) => {
                this.selectedReminderOption = event.target.value;
                this.renderReminderSheet();
            });
        });
    },

    saveReminder: function() {
        const evento = this.eventosData.find(item => item.id === this.currentReminderEventId);
        if (!evento) return;

        if (this.reminders && this.reminders[evento.id]) {
            this.editarLembrete(evento);
            this.closeReminderSheet();
            f7.toast.create({ text: 'Lembrete atualizado', closeTimeout: 2200 }).open();
            return;
        }

        this.adicionarLembrete(evento);
        this.closeReminderSheet();
        f7.toast.create({ text: 'Lembrete definido', closeTimeout: 2200 }).open();
    },

    adicionarLembrete: function(evento) {
        this.reminders[evento.id] = {
            eventId: evento.id,
            option: this.selectedReminderOption,
            createdAt: new Date().toISOString()
        };
        this.scheduleEventReminders(evento, this.selectedReminderOption).then(ids => {
            if (this.reminders[evento.id]) {
                this.reminders[evento.id].scheduledIds = ids;
                this.saveReminders();
            }
        }).catch(error => console.warn('Erro ao agendar lembretes:', error));
        this.saveReminders();
        console.log('Lembrete adicionado', this.reminders[evento.id]);
    },

    editarLembrete: function(evento) {
        if (!this.reminders[evento.id]) return;
        this.reminders[evento.id].option = this.selectedReminderOption;
        this.scheduleEventReminders(evento, this.selectedReminderOption).then(ids => {
            this.reminders[evento.id].scheduledIds = ids;
            this.saveReminders();
        }).catch(error => console.warn('Erro ao reagendar lembretes:', error));
        this.saveReminders();
        console.log('Lembrete editado', this.reminders[evento.id]);
    },

    removerLembrete: function(evento) {
        const reminder = this.reminders[evento.id];
        this.cancelEventReminders(evento.id, reminder && reminder.scheduledIds);
        delete this.reminders[evento.id];
        this.saveReminders();
        console.log('Lembrete removido', evento.id);
    },

    getLinkIconClass: function(icon) {
        switch (icon) {
            case 'youtube': return 'fa-brands fa-youtube';
            case 'instagram': return 'fa-brands fa-instagram';
            case 'facebook': return 'fa-brands fa-facebook';
            case 'church': return 'fa-solid fa-church';
            case 'location': return 'fa-solid fa-location-dot';
            case 'heart': return 'fa-solid fa-heart';
            case 'video': return 'fa-solid fa-video';
            case 'calendar': return 'fa-solid fa-calendar-days';
            default: return 'fa-solid fa-link';
        }
    },

    openExternalLink: function(url) {
        if (typeof url !== 'string') return;
        let parsed;
        try { parsed = new URL(url, window.location.origin); } catch (e) { return; }
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return;

        const target = '_blank';
        try {
            const opened = window.open(parsed.href, target, 'noopener,noreferrer');
            if (!opened) {
                window.location.href = parsed.href;
            }
        } catch (e) {
            try {
                window.location.href = parsed.href;
            } catch (err) {
                console.warn('Erro ao abrir link externo:', err);
            }
        }
    },

    escapeHtml: function(text) {
        if (text == null) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    stripEventMarkup: function(text) {
        return String(text == null ? '' : text).replace(/<\/?strong>/gi, '');
    },

    formatEventTitle: function(text) {
        return this.escapeHtml(text)
            .replace(/&lt;strong&gt;/gi, '<strong>')
            .replace(/&lt;\/strong&gt;/gi, '</strong>');
    },

    escapeJsString: function(text) {
        if (text == null) return '';
        return String(text)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    },

    safeRemoteUrl: function(value) {
        if (typeof value !== 'string') return '';
        try {
            const parsed = new URL(value, window.location.origin);
            return parsed.protocol === 'https:' ? parsed.href : '';
        } catch (e) {
            return '';
        }
    },

    renderLocationLink: function(localizacao) {
        const safeText = this.escapeHtml(localizacao);
        const safeJs = this.escapeJsString(localizacao);
        return `<a class="event-location-link" href="#" onclick="app.abrirLocalizacao('${safeJs}'); return false;" aria-label="Abrir ${safeText} no Google Maps"><span>${safeText}</span></a>`;
    },

    abrirLocalizacao: function(localizacao) {
        if (!localizacao || typeof localizacao !== 'string') return;
        const query = `${localizacao}, Marabá - PA`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

        if (isMobile) {
            const geoUrl = `geo:0,0?q=${encodeURIComponent(query)}`;
            const fallback = () => {
                window.open(mapsUrl, '_blank', 'noopener,noreferrer');
            };
            const timeoutId = window.setTimeout(fallback, 1000);
            window.location.href = geoUrl;
            window.setTimeout(() => window.clearTimeout(timeoutId), 1200);
        } else {
            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
        }
    },

    renderSponsorBanner: function() {
        if (!Array.isArray(this.patrocinadoresData) || !this.patrocinadoresData.length) return;
        const existing = document.querySelector('.sponsor-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.className = 'sponsor-banner';
        banner.setAttribute('aria-hidden', 'false');

        const track = document.createElement('div');
        track.className = 'sponsor-track';

        const listA = document.createElement('div');
        listA.className = 'sponsor-list';
        const listB = document.createElement('div');
        listB.className = 'sponsor-list';

        this.patrocinadoresData.forEach((sponsor) => {
            const itemA = this.createSponsorItem(sponsor);
            const itemB = this.createSponsorItem(sponsor);
            listA.appendChild(itemA);
            listB.appendChild(itemB);
        });

        track.appendChild(listA);
        track.appendChild(listB);
        banner.appendChild(track);
        document.body.appendChild(banner);

        const width = Math.ceil(listA.getBoundingClientRect().width);
        if (width > 0) {
            track.style.setProperty('--scroll-distance', width + 'px');
            const speed = 100;
            const duration = Math.max(18, width / speed);
            track.style.setProperty('--scroll-duration', duration + 's');
        }
    },

    createSponsorItem: function(sponsor){
        const item = document.createElement('div');
        item.className = 'sponsor-item';

        if (sponsor.src) {
            const img = document.createElement('img');
            img.className = 'sponsor-logo';
            img.src = sponsor.src;
            img.alt = sponsor.name || 'Patrocinador';
            item.appendChild(img);
        } else {
            const label = document.createElement('div');
            label.className = 'sponsor-label';
            label.textContent = sponsor.name || 'Patrocinador';
            item.appendChild(label);
        }

        return item;
    },

    ensureHomePage: function() {
        // Ensure home page is visible on load
        document.querySelectorAll('.page').forEach(p => p.classList.remove('page-current'));
        const homePage = document.querySelector('[data-name="home"]');
        if (homePage) {
            homePage.classList.add('page-current');
            console.log('✅ Home page set as current');
        }

        if (mainView && mainView.router) {
            try {
                mainView.router.navigate('/', { animate: false, pushState: false });
            } catch (e) {
                console.warn('⚠️ Não foi possível forçar a rota home:', e);
            }
        }
    },

    setupEventListeners: function() {
        document.addEventListener('back', () => {
            console.log('Botão Back pressionado');
            if (mainView) {
                mainView.router.back();
            }
        });

        const bindLiveCard = () => {
            const livePlayerCard = document.getElementById('livePlayerCard');
            if (!livePlayerCard) return;
            livePlayerCard.addEventListener('click', () => {
                const live = window.LiveTransmission && window.LiveTransmission.current;
                if (live && live.url) {
                    window.location.href = live.url;
                } else {
                    console.warn('Live transmission link não configurado');
                }
            });
        };

        const bindSheetOverlay = () => {
            const overlay = document.getElementById('eventSheetOverlay');
            if (!overlay) return;
            overlay.addEventListener('click', () => this.closeReminderSheet());
        };

        if (document.readyState !== 'loading') {
            bindLiveCard();
            bindSheetOverlay();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                bindLiveCard();
                bindSheetOverlay();
            });
        }
    },

    resolveLiveTitleFromUrl: async function(url) {
        if (!url) return null;

        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace('www.', '');

            if (host.includes('youtube.com') || host.includes('youtu.be')) {
                const embedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
                const response = await fetch(embedUrl);
                if (response.ok) {
                    const json = await response.json();
                    if (json && json.title) return json.title;
                }
            }
        } catch (e) {
            console.warn('Falha ao resolver título específico de serviço:', e);
        }

        try {
            const embedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
            const response = await fetch(embedUrl);
            if (!response.ok) return null;
            const json = await response.json();
            if (json && json.title) return json.title;
        } catch (e) {
            console.warn('Não foi possível buscar título pelo link:', e);
        }

        return null;
    },

    resolveLiveChannelInfoFromUrl: async function(url) {
        if (!url) return null;

        try {
            const embedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
            const response = await fetch(embedUrl);
            if (!response.ok) return null;
            const json = await response.json();
            if (json) return json;
        } catch (e) {
            console.warn('Não foi possível buscar informações do canal pelo link:', e);
        }

        return null;
    },

    getHandleFromUrl: function(url) {
        try {
            const parsed = new URL(url);
            const path = parsed.pathname.replace(/\/$/, '');
            const segments = path.split('/').filter(Boolean);
            if (segments.length > 0) {
                return segments[segments.length - 1];
            }
        } catch (e) {
            return null;
        }
        return null;
    },

    loadLiveTransmissionCard: async function() {
        const live = window.LiveTransmission && window.LiveTransmission.current;
        if (!live) return;

        const titleEl = document.getElementById('livePlayerTitle');
        const subtitleEl = document.getElementById('livePlayerSubtitle');
        const badgeEl = document.getElementById('liveBadge');
        const imageEl = document.getElementById('livePlayerImage');
        const playAction = document.querySelector('.player-action[data-action="play"]');

        if (imageEl && live.image) imageEl.src = live.image;
        if (subtitleEl) subtitleEl.textContent = live.subtitle || subtitleEl.textContent;

        const titleText = live.title || '';
        const channelEl = document.getElementById('livePlayerChannel');
        const liveChannelLink = document.getElementById('liveChannelLink');
        const liveChannelUrl = document.getElementById('liveChannelUrl');
        const channelNameEl = document.getElementById('liveChannelName');
        const channelHandleEl = document.getElementById('liveChannelHandle');
        if (titleEl) {
            titleEl.textContent = titleText;
        }
        if (channelEl) {
            channelEl.textContent = live.channel || 'TV Círio Marabá';
        }
        if (channelNameEl) {
            channelNameEl.textContent = live.channel || live.title || live.subtitle || 'TV Círio Marabá';
        }
        if (channelHandleEl) {
            if (live.channelHandle) {
                channelHandleEl.textContent = live.channelHandle;
            } else if (live.channelUrl) {
                const handleFromUrl = this.getHandleFromUrl(live.channelUrl);
                channelHandleEl.textContent = handleFromUrl || '';
            } else if (live.url) {
                const handleFromUrl = this.getHandleFromUrl(live.url);
                channelHandleEl.textContent = handleFromUrl || '';
            }
        }
        if (liveChannelLink) {
            if (live.url) {
                liveChannelLink.href = live.url;
                liveChannelLink.target = '_blank';
                liveChannelLink.rel = 'noopener noreferrer';
            } else {
                liveChannelLink.removeAttribute('href');
            }
        }
        if (liveChannelUrl) {
            if (live.channelUrl) {
                liveChannelUrl.href = live.channelUrl;
                liveChannelUrl.style.display = 'inline-block';
            } else {
                liveChannelUrl.style.display = 'none';
            }
        }

        const needsChannelInfo = (!live.channel || !live.channelHandle) && live.url;
        if (needsChannelInfo) {
            const channelInfo = await this.resolveLiveChannelInfoFromUrl(live.url);
            if (channelInfo) {
                if (!live.channel && channelInfo.author_name && channelNameEl) {
                    channelNameEl.textContent = channelInfo.author_name;
                }
                if (!live.channelHandle && channelInfo.author_url && channelHandleEl) {
                    channelHandleEl.textContent = this.getHandleFromUrl(channelInfo.author_url) || channelHandleEl.textContent;
                }
            }
        }

        if (live.autoTitle && (!titleText || titleText.trim().length === 0)) {
            const resolvedTitle = await this.resolveLiveTitleFromUrl(live.url);
            if (resolvedTitle && titleEl) {
                titleEl.textContent = resolvedTitle;
            }
        }

        if (badgeEl) {
            if (live.active) {
                badgeEl.classList.remove('live-badge-hidden');
            } else {
                badgeEl.classList.add('live-badge-hidden');
            }
        }

        if (playAction) {
            playAction.addEventListener('click', (event) => {
                event.stopPropagation();
                if (live.url) {
                    window.location.href = live.url;
                }
            });
        }
    },

    // ========================================
    // GPS E LOCALIZAÇÃO
    // ========================================
    
    requestLocationConsent: function(callback) {
        const storageKey = 'cirio_location_permission_notice_seen';
        const seen = (() => {
            try {
                return localStorage.getItem(storageKey) === '1';
            } catch (e) {
                return false;
            }
        })();

        if (seen) {
            if (typeof callback === 'function') callback(true);
            return true;
        }

        this.showLocationPermissionAlert(() => {
            try {
                localStorage.setItem(storageKey, '1');
            } catch (e) {
                console.warn('Não foi possível salvar a confirmação da localização:', e);
            }
            if (typeof callback === 'function') callback(true);
        });

        return false;
    },

    getInitialLocation: function() {
        const statusElement = document.getElementById('statusText');
        
        if (!statusElement) {
            console.warn('⚠️ Elemento statusText não encontrado no DOM');
            return;
        }
        
        if (!navigator.geolocation) {
            statusElement.textContent = '⚠️ Geolocalização não disponível';
            return;
        }

        const proceedWithLocation = () => {
            statusElement.textContent = '📍 Buscando localização...';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.state.currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    
                    statusElement.textContent = `📍 Localização obtida (precisão: ${Math.round(position.coords.accuracy)}m)`;
                    this.initializeMap();
                    console.log('Localização:', this.state.currentLocation);
                },
                (error) => {
                    statusElement.textContent = `⚠️ Erro ao obter localização: ${error.message}`;
                    console.error('Erro GPS:', error);
                    
                    this.state.currentLocation = {
                        lat: -1.454630,
                        lng: -48.504166,
                        accuracy: 10
                    };
                    this.initializeMap();
                },
                {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 10000
                }
            );
        };

        if (!this.requestLocationConsent(proceedWithLocation)) {
            statusElement.textContent = '📍 Aguardando confirmação de localização...';
        }
    },

    // ========================================
    // RASTREAMENTO
    // ========================================
    
    startTracking: function() {
        console.log('▶️ Iniciando rastreamento...');
        
        this.state.isTracking = true;
        this.state.startTime = Date.now();
        this.state.coveredDistance = 0;
        this.state.positions = [];
        this.state.trackerPositions = [];
        
        // Mostrar/esconder botões
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) {
            stopBtn.style.display = 'grid';
            stopBtn.style.gridColumn = '1 / 3';
        }
        
        // Iniciar cronômetro
        this.startTimer();

        const beginTracking = () => {
            if (navigator.geolocation) {
                this.state.watchId = navigator.geolocation.watchPosition(
                    (position) => this.onLocationUpdate(position),
                    (error) => {
                        console.error('Erro no watch position:', error);
                        this.simulateMovement();
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 15000,
                        maximumAge: 10000
                    }
                );
            } else {
                this.simulateMovement();
            }
        };

        if (!this.requestLocationConsent(beginTracking)) {
            this.state.isTracking = false;
            if (this.timerInterval) clearInterval(this.timerInterval);
            if (stopBtn) stopBtn.style.display = 'none';
            if (startBtn) {
                startBtn.style.display = 'grid';
                startBtn.style.gridColumn = '1 / 3';
            }
        }
    },

    stopTracking: function() {
        console.log('⏹️ Parando rastreamento...');
        
        this.state.isTracking = false;
        
        // Parar watch GPS
        if (this.state.watchId !== null) {
            navigator.geolocation.clearWatch(this.state.watchId);
            this.state.watchId = null;
        }
        
        // Parar timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Mostrar/esconder botões
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const statusText = document.getElementById('statusText');
        
        if (startBtn) {
            startBtn.style.display = 'grid';
            startBtn.style.gridColumn = '1 / 3';
        }
        if (stopBtn) stopBtn.style.display = 'none';
        if (statusText) statusText.textContent = '⏸️ Rastreamento parado';
    },

    resetTracking: function() {
        console.log('🔄 Resetando rastreamento...');
        
        this.stopTracking();
        
        this.state.coveredDistance = 0;
        this.state.positions = [];
        this.state.startTime = null;
        
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = 'Aguardando localização...';
        
        this.updateUI();
    },

    // ========================================
    // ATUALIZAÇÃO DE LOCALIZAÇÃO
    // ========================================
    
    onLocationUpdate: function(position) {
        const normalized = this.normalizePosition(position);
        if (!normalized) return;

        const previous = this.state.currentLocation ? { ...this.state.currentLocation } : null;
        const previousTimestamp = previous && typeof previous.timestamp === 'number' ? previous.timestamp : null;

        // Atualizar posição atual do usuário
        this.state.currentLocation = normalized;
        this.state.positions.push(normalized);

        if (previous && previousTimestamp && typeof normalized.timestamp === 'number') {
            const elapsed = Math.max((normalized.timestamp - previousTimestamp) / 1000, 1);
            const meters = this.calculateDistance(previous.lat, previous.lng, normalized.lat, normalized.lng);
            this.state.lastSpeedMps = meters > 0 ? (meters / elapsed) : 0;
        } else if (this.state.lastSpeedMps <= 0) {
            this.state.lastSpeedMps = 1.4;
        }

        // Se houver rota oficial, calcular progresso projetado sobre a rota
        if (this.state.route && typeof percurso !== 'undefined') {
            try {
                const prog = percurso.computeProgress(this.state.route, { lat: normalized.lat, lng: normalized.lng });
                // atualizar estados derivados
                this.state.coveredDistance = prog.covered;
                this.state.totalDistance = prog.total;
                // atualizar UI de distâncias e progresso
                if (typeof ui !== 'undefined'){
                    ui.setTotalDistance(prog.total);
                    ui.setCoveredDistance(prog.covered);
                    ui.setRemainingDistance(prog.remaining);
                    ui.setProgress(prog.percent);
                }
                // ETA e velocidade média
                if (this.state.startTime) {
                    const elapsed = Math.floor((Date.now() - this.state.startTime)/1000);
                    if (typeof ui !== 'undefined') ui.setElapsedTime(elapsed);
                    const avg = elapsed > 0 ? (this.state.coveredDistance / elapsed) : 0;
                    if (typeof ui !== 'undefined') ui.setAvgSpeed(avg);
                }

                if (typeof ui !== 'undefined') {
                    const speedMps = this.state.lastSpeedMps > 0 ? this.state.lastSpeedMps : 1.4;
                    const remainingSeconds = prog.remaining > 0 ? Math.max(0, prog.remaining / speedMps) : 0;
                    ui.setETA(this.formatEtaText(remainingSeconds));
                }
            } catch (e) {
                console.error('Erro ao computar progresso do percurso', e);
            }
        } else {
            // fallback: calcular distância incremental entre pontos
            if (this.state.currentLocation && this.state.positions.length > 1) {
                const last = this.state.positions[this.state.positions.length - 2];
                const distance = this.calculateDistance(last.lat, last.lng, normalized.lat, normalized.lng);
                if (distance > 1) this.state.coveredDistance += distance;
            }
            // atualizar UI genérica
            this.updateUI();
            if (this.state.startTime) {
                const elapsed = Math.floor((Date.now() - this.state.startTime)/1000);
                if (typeof ui !== 'undefined') ui.setElapsedTime(elapsed);
                const avg = elapsed > 0 ? (this.state.coveredDistance / elapsed) : 0;
                if (typeof ui !== 'undefined') ui.setAvgSpeed(avg);
            }
        }

        // Atualizar rota até a Paróquia Nossa Senhora de Nazaré
        this.syncParoquiaRoute();

        // Atualizar mapa (atualiza camadas e UI)
        this.updateMap();

        // Compartilhar posição se configurado
        this.sharePositionIfConfigured(normalized);

        // Log
        console.log(`📍 Distância percorrida: ${(this.state.coveredDistance / 1000).toFixed(2)} km`);
    },

    // ========================================
    // SIMULAÇÃO DE MOVIMENTO (para testes)
    // ========================================
    
    normalizePosition: function(position) {
        if (!position) return null;

        let normalized = null;

        if (position.coords && typeof position.coords.latitude === 'number' && typeof position.coords.longitude === 'number') {
            normalized = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy || 0,
                timestamp: position.timestamp || Date.now()
            };
        }

        if (!normalized && typeof position.lat === 'number' && typeof position.lng === 'number') {
            normalized = {
                lat: position.lat,
                lng: position.lng,
                accuracy: position.accuracy || 0,
                timestamp: position.timestamp || Date.now()
            };
        }

        if (!normalized) return null;
        if (!this.isBrazilLocation(normalized.lat, normalized.lng)) {
            console.warn('📍 Localização fora do Brasil ou inválida. Usando fallback de Marabá.', normalized);
            return { ...this.getDefaultMapLocation(), timestamp: normalized.timestamp || Date.now() };
        }

        return normalized;
    },

    onTrackerUpdate: function(trackerState) {
        if (!trackerState || typeof trackerState !== 'object') return;

        this.state.trackerDeviceId = trackerState.deviceId || this.state.trackerDeviceId || 'N/A';
        this.state.trackerStatus = trackerState.status || 'offline';
        this.state.trackerLastUpdate = trackerState.lastUpdate || this.state.trackerLastUpdate;
        this.state.trackerBattery = trackerState.battery != null ? String(trackerState.battery) : this.state.trackerBattery;

        if (trackerState.position && trackerState.position.lat != null && trackerState.position.lng != null) {
            const position = this.normalizePosition(trackerState.position);
            if (position) {
                this.state.trackerPosition = position;
                this.state.trackerPositions = this.state.trackerPositions || [];
                this.state.trackerPositions.push(position);
                if (this.state.trackerPositions.length > 200) {
                    this.state.trackerPositions = this.state.trackerPositions.slice(-200);
                }
            }
        }

        if (!this.state.currentLocation && this.state.trackerPosition) {
            this.state.currentLocation = this.state.trackerPosition;
        }

        if (typeof ui !== 'undefined') {
            ui.setExternalTrackerDevice(this.state.trackerDeviceId || 'N/A');
            ui.setExternalTrackerStatus(this.state.trackerStatus || 'offline');
            ui.setExternalTrackerLastUpdate(this.state.trackerLastUpdate);
            ui.setExternalTrackerBattery(this.state.trackerBattery);
        }

        const statusText = document.getElementById('trackerStatusText');
        if (statusText) {
            statusText.textContent = this.state.trackerStatus === 'online'
                ? `Rastreador ativo • ${this.state.trackerDeviceId || 'sem ID'}`
                : 'Rastreador externo offline';
        }

        this.updateTrackerMap();
    },

    updateTrackerMap: function() {
        if (!this.map || !this.state.trackerPositions || this.state.trackerPositions.length === 0) return;

        if (typeof L !== 'undefined' && this.map) {
            try {
                if (!this.trackerPathLayer) {
                    this.trackerPathLayer = L.polyline([], {
                        color: '#f59e0b',
                        weight: 5,
                        opacity: 0.9,
                        dashArray: '6,8'
                    }).addTo(this.map);
                }

                const latlngs = this.state.trackerPositions.map(p => [p.lat, p.lng]);
                if (this.trackerPathLayer && typeof this.trackerPathLayer.setLatLngs === 'function') {
                    this.trackerPathLayer.setLatLngs(latlngs);
                }

                const latest = this.state.trackerPositions[this.state.trackerPositions.length - 1];
                if (latest) {
                    if (!this.trackerMarker) {
                        this.trackerMarker = L.marker([latest.lat, latest.lng], {
                            title: 'Rastreador Externo'
                        }).addTo(this.map).bindPopup('🚚 Rastreador Externo');
                    } else if (typeof this.trackerMarker.setLatLng === 'function') {
                        this.trackerMarker.setLatLng([latest.lat, latest.lng]);
                    }
                }
            } catch (e) {
                console.warn('updateTrackerMap falhou:', e);
            }
        }
    },

    simulateMovement: function() {
        if (!this.state.isTracking) return;
        
        // Simular movimento aleatório
        const randomLat = (Math.random() - 0.5) * 0.001;
        const randomLng = (Math.random() - 0.5) * 0.001;
        
        const simulatedPosition = {
            coords: {
                latitude: this.state.currentLocation.lat + randomLat,
                longitude: this.state.currentLocation.lng + randomLng,
                accuracy: 5
            }
        };
        
        this.onLocationUpdate(simulatedPosition);
        
        // Continuar simulação a cada 5 segundos
        setTimeout(() => this.simulateMovement(), 5000);
    },

    // runSimulation removed: debug simulation triggered from UI was deleted

    // ========================================
    // CÁLCULOS MATEMÁTICOS
    // ========================================
    
    /**
     * Calcula distância entre dois pontos usando Haversine
     * @param {number} lat1 - Latitude ponto 1
     * @param {number} lng1 - Longitude ponto 1
     * @param {number} lat2 - Latitude ponto 2
     * @param {number} lng2 - Longitude ponto 2
     * @returns {number} Distância em metros
     */
    calculateDistance: function(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Raio da Terra em metros
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    },

    toRad: function(degrees) {
        return degrees * (Math.PI / 180);
    },

    // ========================================
    // TIMER/CRONÔMETRO
    // ========================================
    
    startTimer: function() {
        this.timerInterval = setInterval(() => {
            if (this.state.isTracking && this.state.startTime) {
                const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
                this.updateElapsedTime(elapsed);
            }
        }, 1000);
    },

    formatTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    updateElapsedTime: function(seconds) {
        const elapsedTimeEl = document.getElementById('elapsedTime');
        if (elapsedTimeEl) {
            elapsedTimeEl.textContent = this.formatTime(seconds);
        }
    },

    // ========================================
    // ATUALIZAÇÃO DE UI
    // ========================================
    
    updateUI: function() {
        // Atualiza todos os elementos de estatísticas via funções do módulo `ui`
        try {
            if (typeof ui !== 'undefined') {
                ui.setTotalDistance(this.state.totalDistance || 0);
                ui.setCoveredDistance(this.state.coveredDistance || 0);
                const remaining = Math.max(0, (this.state.totalDistance || 0) - (this.state.coveredDistance || 0));
                ui.setRemainingDistance(remaining);

                const role = (window.firebaseManager && typeof window.firebaseManager.getEffectiveDeviceRole === 'function')
                    ? window.firebaseManager.getEffectiveDeviceRole()
                    : (window.FIREBASE_DEVICE_ROLE === 'sharer' ? 'sharer' : 'viewer');
                ui.setFirebaseRole(role);
                ui.setFirebaseDeviceId(window.FIREBASE_SHARE_DEVICE_ID || (window.device && window.device.uuid) || 'device-1');
                const sharingActive = role === 'sharer' && window.FIREBASE_AUTO_SHARE && window.FIREBASE_AUTO_SHARE !== 'false';
                ui.setFirebaseShareState(sharingActive ? 'Compartilhamento ativo' : 'Compartilhamento inativo');

                const percentage = (this.state.totalDistance && this.state.totalDistance > 0)
                    ? Math.min(100, Math.round((this.state.coveredDistance / this.state.totalDistance) * 100))
                    : 0;
                ui.setProgress(percentage);

                // Tempo e velocidade média
                if (this.state.startTime) {
                    const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
                    ui.setElapsedTime(elapsed);
                    const avg = elapsed > 0 ? (this.state.coveredDistance / elapsed) : 0; // m/s
                    ui.setAvgSpeed(avg);

                    // ETA: usar velocidade média para estimar tempo restante
                    const speedMps = this.state.lastSpeedMps > 0 ? this.state.lastSpeedMps : (avg > 0 ? avg : 1.4);
                    if (speedMps > 0) {
                        const secondsRemain = Math.round(remaining / speedMps);
                        ui.setETA(this.formatEtaText(secondsRemain));
                    } else {
                        ui.setETA('--:--');
                    }
                } else {
                    ui.setElapsedTime(0);
                    ui.setAvgSpeed(0);
                    ui.setETA('--:--');
                }
            }
        } catch (e) {
            console.warn('updateUI: erro ao atualizar via ui module', e);
        }
    },

    // ========================================
    // MAPA
    // ========================================

    setRoute: function(routeArray){
        // routeArray = [{lat,lng}, ...]
        if (!Array.isArray(routeArray) || routeArray.length < 2) {
            console.warn('setRoute: route inválida');
            return;
        }
        this.state.route = routeArray;

        // calcular distância total usando percurso.js
        if (typeof percurso !== 'undefined') {
            try {
                const total = percurso.computeTotalDistance(routeArray);
                this.state.totalDistance = total;
                if (typeof ui !== 'undefined') ui.setTotalDistance(total);
            } catch (e) { console.warn('Erro ao calcular total route', e); }
        } else {
            // fallback: somar segmentos com calculateDistance
            try {
                let total = 0;
                for (let i=1;i<routeArray.length;i++){
                    total += this.calculateDistance(routeArray[i-1].lat, routeArray[i-1].lng, routeArray[i].lat, routeArray[i].lng);
                }
                this.state.totalDistance = total;
                if (typeof ui !== 'undefined') ui.setTotalDistance(total);
            } catch(e){ console.warn('Erro fallback calcular total', e); }
        }

        // calcular progresso inicial se já tivermos localização atual
        if (this.state.currentLocation) {
            if (typeof percurso !== 'undefined') {
                try {
                    const prog = percurso.computeProgress(this.state.route, { lat: this.state.currentLocation.lat, lng: this.state.currentLocation.lng });
                    this.state.coveredDistance = prog.covered;
                    if (typeof ui !== 'undefined'){
                        ui.setCoveredDistance(prog.covered);
                        ui.setRemainingDistance(prog.remaining);
                        ui.setProgress(prog.percent);
                    }
                } catch(e) { console.warn('Erro ao calcular progresso inicial', e); }
            } else {
                // fallback: estimar pelo ponto mais próximo (vértice)
                try {
                    let bestIdx = 0; let bestDist = Infinity;
                    for (let i=0;i<this.state.route.length;i++){
                        const d = this.calculateDistance(this.state.currentLocation.lat, this.state.currentLocation.lng, this.state.route[i].lat, this.state.route[i].lng);
                        if (d < bestDist){ bestDist = d; bestIdx = i; }
                    }
                    // somar segmentos até bestIdx
                    let covered = 0;
                    for (let i=1;i<=bestIdx;i++) covered += this.calculateDistance(this.state.route[i-1].lat, this.state.route[i-1].lng, this.state.route[i].lat, this.state.route[i].lng);
                    this.state.coveredDistance = covered;
                    const remaining = Math.max(0, this.state.totalDistance - covered);
                    const percent = this.state.totalDistance>0 ? Math.round((covered/this.state.totalDistance)*100) : 0;
                    if (typeof ui !== 'undefined'){
                        ui.setCoveredDistance(covered);
                        ui.setRemainingDistance(remaining);
                        ui.setProgress(percent);
                    }
                } catch(e){ console.warn('Erro fallback progresso inicial', e); }
            }
        }

        // desenhar rota completa
        if (this.fullRouteLayer && this.fullRouteLayer.setLatLngs) {
            const latlngs = routeArray.map(p => [p.lat,p.lng]);
            this.fullRouteLayer.setLatLngs(latlngs);
        }

        // ajustar zoom
        if (this.map && this.fullRouteLayer && this.fullRouteLayer.getBounds) {
            try { this.map.fitBounds(this.fullRouteLayer.getBounds(), { padding: [40,40] }); } catch(e){}
        }
    },
    
    // Mapa removido do app.

    sharePositionIfConfigured: function(position) {
        if (!window.firebaseManager || typeof window.firebaseManager.sharePosition !== 'function') return;
        if (!window.firebaseManager.canSharePosition()) {
            const deviceId = window.firebaseManager.getShareDeviceId ? window.firebaseManager.getShareDeviceId() : (window.FIREBASE_SHARE_DEVICE_ID || (window.device && window.device.uuid) || 'device-1');
            if (window.FIREBASE_DEVICE_ROLE !== 'sharer') {
                if (typeof ui !== 'undefined') ui.setFirebaseShareState('Bloqueado: dispositivo viewer');
            } else {
                if (typeof ui !== 'undefined') ui.setFirebaseShareState(`Bloqueado: sharer ${deviceId} não autorizado`);
            }
            return;
        }
        if (!window.FIREBASE_AUTO_SHARE || window.FIREBASE_AUTO_SHARE === 'false') {
            if (typeof ui !== 'undefined') ui.setFirebaseShareState('Sharer sem auto-share');
            return;
        }

        const intervalMs = Number(window.FIREBASE_SHARE_INTERVAL_MS || 10000);
        const now = Date.now();
        if (this.state.lastSharedAt && (now - this.state.lastSharedAt) < intervalMs) return;

        this.state.lastSharedAt = now;

        try {
            window.firebaseManager.sharePosition({
                lat: position.lat,
                lng: position.lng,
                accuracy: position.accuracy,
                timestamp: position.timestamp,
                source: 'gps',
                deviceId: window.FIREBASE_SHARE_DEVICE_ID || 'device-1'
            });
            if (typeof ui !== 'undefined') ui.setFirebaseShareState('Compartilhando posição');
        } catch (e) {
            console.warn('Falha ao compartilhar posição com Firebase', e);
            if (typeof ui !== 'undefined') ui.setFirebaseShareState('Erro ao compartilhar');
        }
    },

    updateMap: function() {
        if (!this.map) return;

        // Atualizar marker atual
        const last = (this.state.positions.length>0) ? this.state.positions[this.state.positions.length-1] : this.state.currentLocation;
        if (this.currentMarker && typeof this.currentMarker.setLatLng === 'function') {
            this.currentMarker.setLatLng([last.lat, last.lng]);
        }

        // Se houver rota oficial (definida em state.route), dividir em percorrido/restante
        if (this.state.route && Array.isArray(this.state.route) && this.state.route.length>1) {
            // full route
            const fullLatlngs = this.state.route.map(p => [p.lat,p.lng]);
            if (this.fullRouteLayer && this.fullRouteLayer.setLatLngs) this.fullRouteLayer.setLatLngs(fullLatlngs);

            // calcular progress usando percurso.js
            if (typeof percurso !== 'undefined') {
                const prog = percurso.computeProgress(this.state.route, { lat: last.lat, lng: last.lng });
                // coberto: reconstruir polylines para covered e remaining
                const coveredCoords = []; const remainingCoords = [];

                // caminhar pelos segmentos e cortar no ponto correspondente a prog.covered
                let cum = 0;
                let stopped = false;
                for (let i=0;i<this.state.route.length-1;i++){
                    const A = this.state.route[i];
                    const B = this.state.route[i+1];
                    const segLen = percurso.haversine(A,B);
                    if (!stopped && (cum + segLen) <= prog.covered + 1) {
                        // segmento totalmente coberto
                        coveredCoords.push([A.lat,A.lng]);
                        // se for o último segmento coberto, adicionar B também
                        if ((cum + segLen) <= prog.covered + 1 && i === this.state.route.length-2) coveredCoords.push([B.lat,B.lng]);
                    } else if (!stopped && (cum + segLen) > prog.covered + 1) {
                        // ponto de corte dentro deste segmento
                        const remainOnSeg = prog.covered - cum; // metros
                        const t = Math.max(0, Math.min(1, remainOnSeg / segLen));
                        const cutLat = A.lat + (B.lat - A.lat) * t;
                        const cutLng = A.lng + (B.lng - A.lng) * t;
                        coveredCoords.push([A.lat,A.lng]);
                        coveredCoords.push([cutLat,cutLng]);
                        remainingCoords.push([cutLat,cutLng]);
                        remainingCoords.push([B.lat,B.lng]);
                        // push remaining rest
                        for (let j=i+1;j<this.state.route.length-1;j++) remainingCoords.push([this.state.route[j].lat,this.state.route[j].lng]);
                        stopped = true;
                    } else {
                        // totalmente remaining
                        remainingCoords.push([A.lat,A.lng]);
                        if (i===this.state.route.length-2) remainingCoords.push([B.lat,B.lng]);
                    }
                    cum += segLen;
                }

                if (coveredCoords.length === 0 && prog.covered > 0) coveredCoords.push([this.state.route[0].lat,this.state.route[0].lng]);

                if (this.coveredLayer && this.coveredLayer.setLatLngs) this.coveredLayer.setLatLngs(coveredCoords);
                if (this.remainingLayer && this.remainingLayer.setLatLngs) this.remainingLayer.setLatLngs(remainingCoords);

                // Atualizar UI
                if (typeof ui !== 'undefined'){
                    ui.setTotalDistance(prog.total);
                    ui.setCoveredDistance(prog.covered);
                    ui.setRemainingDistance(prog.remaining);
                    // fallback: garantir que percent seja coerente com covered/total
                    let pct = prog.percent;
                    if ((typeof pct !== 'number' || pct <= 0) && prog.total > 0) {
                        pct = Math.round((prog.covered / prog.total) * 100);
                    }
                    ui.setProgress(pct);
                }
            }
        }

        // Centralizar suavemente
        if (this.map && last) {
            try { this.map.panTo([last.lat,last.lng], { animate: true, duration: 0.5 }); } catch(e) { this.map.setView([last.lat,last.lng]); }
        }
    },

    // Tile reload and provider switching removed (dead UI controls eliminated)

    // Canvas fallback: desenha rota e marcador localmente quando tiles estão indisponíveis
    enableCanvasFallback: function() {
        try {
            if (this._canvasFallbackActive) return;
            // garantir que o mapa exista (inicializar se necessário)
            if (!this.map) {
                try { this.initializeMap(); } catch(e) { console.warn('initializeMap failed during fallback', e); }
            }
            const container = document.getElementById('map');
            if (!container) return;
            // esconder camada de tiles para reduzir requests
            try { if (this.tileLayer && this.map) this.map.removeLayer(this.tileLayer); } catch(e){}

            const canvas = document.createElement('canvas');
            canvas.style.position = 'absolute';
            canvas.style.left = '0'; canvas.style.top = '0'; canvas.style.width = '100%'; canvas.style.height = '100%';
            canvas.width = container.clientWidth; canvas.height = container.clientHeight;
            canvas.id = 'mapCanvasFallback';
            container.appendChild(canvas);
            this._canvasFallbackActive = true;
            this._fallbackCanvas = canvas;

            const redraw = () => {
                try {
                    const ctx = canvas.getContext('2d');
                    canvas.width = container.clientWidth; canvas.height = container.clientHeight;
                    ctx.clearRect(0,0,canvas.width,canvas.height);
                    // background
                    ctx.fillStyle = '#f7f7f7'; ctx.fillRect(0,0,canvas.width,canvas.height);
                    // draw route
                    if (this.state.route && this.state.route.length>0 && this.map) {
                        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 4; ctx.beginPath();
                        this.state.route.forEach((p, idx) => {
                            const pt = this.map.latLngToContainerPoint([p.lat,p.lng]);
                            if (idx===0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
                        });
                        ctx.stroke();
                    }
                    // draw covered in green
                    if (this.state.route && this.state.route.length>0 && this.map) {
                        // use percurso to determine covered ratio
                        const prog = (typeof percurso !== 'undefined') ? percurso.computeProgress(this.state.route, this.state.currentLocation || this.state.route[0]) : null;
                        if (prog && prog.covered>0) {
                            // build covered path up to covered distance
                            ctx.strokeStyle = '#10b981'; ctx.lineWidth = 6; ctx.beginPath();
                            let dist = 0; let stop = false;
                            for (let i=0;i<this.state.route.length-1;i++){
                                const A = this.state.route[i]; const B = this.state.route[i+1];
                                const segLen = percurso.haversine(A,B);
                                const pA = this.map.latLngToContainerPoint([A.lat,A.lng]);
                                const pB = this.map.latLngToContainerPoint([B.lat,B.lng]);
                                if (!stop) {
                                    if (dist + segLen <= prog.covered) {
                                        if (i===0) ctx.moveTo(pA.x,pA.y);
                                        ctx.lineTo(pB.x,pB.y);
                                    } else {
                                        const remain = prog.covered - dist; const t = Math.max(0, Math.min(1, remain / segLen));
                                        const x = pA.x + (pB.x - pA.x) * t; const y = pA.y + (pB.y - pA.y) * t;
                                        if (i===0) ctx.moveTo(pA.x,pA.y);
                                        ctx.lineTo(x,y);
                                        stop = true;
                                    }
                                }
                                dist += segLen;
                            }
                            ctx.stroke();
                        }
                    }
                    // draw marker
                    if (this.state.currentLocation && this.map) {
                        const p = this.map.latLngToContainerPoint([this.state.currentLocation.lat, this.state.currentLocation.lng]);
                        ctx.fillStyle = '#DAA520'; ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2); ctx.fill();
                        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                    }
                } catch(e){ console.warn('fallback redraw failed', e); }
            };

            // attach events
            this.map.on('move zoom resize', redraw);
            redraw();
        } catch(e) { console.warn('enableCanvasFallback failed', e); }
    },

    // ========================================
    // MODAL DE INFORMAÇÕES
    // ========================================
    
    showLocationPermissionAlert: function(onConfirm) {
        const modal = document.getElementById('locationPermissionModal');
        if (!modal) return;
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');

        const closeBtn = modal.querySelector('.location-permission-close');
        const okBtn = modal.querySelector('.location-permission-ok');

        const closeModal = () => {
            modal.classList.remove('visible');
            modal.setAttribute('aria-hidden', 'true');
            if (typeof onConfirm === 'function') onConfirm();
        };

        if (closeBtn) {
            closeBtn.onclick = () => closeModal();
        }
        if (okBtn) {
            okBtn.onclick = () => closeModal();
        }
        modal.onclick = (event) => {
            if (event.target === modal) closeModal();
        };
    },

    hideLocationPermissionAlert: function() {
        const modal = document.getElementById('locationPermissionModal');
        if (!modal) return;
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
    },

    showInfo: function() {
        const modal = document.getElementById('infoModal');
        if (modal) modal.style.display = 'block';
    },

    closeInfo: function() {
        const modal = document.getElementById('infoModal');
        if (modal) modal.style.display = 'none';
    },

    // ========================================
    // NAVEGAÇÃO ENTRE SEÇÕES
    // ========================================
    
    goToTracker: function() {
        const trackerUrl = 'https://localhost:3001/rastreador.html';
        try {
            window.location.href = trackerUrl;
        } catch (e) {
            window.open(trackerUrl, '_self');
        }
    },

    openSection: function(section) {
        console.log('🔄 openSection called with:', section);
        if (section === 'home') section = '';
        // Toggle sponsor transparency for specific pages
        try{
            const transparentPages = ['cartazes'];
            const noSponsorPages = ['transmissoes','links'];
            if (transparentPages.indexOf(section) !== -1) document.body.classList.add('sponsor-transparent'); else document.body.classList.remove('sponsor-transparent');
            if (noSponsorPages.indexOf(section) !== -1) document.body.classList.add('no-sponsor'); else document.body.classList.remove('no-sponsor');
        }catch(e){console.warn('sponsor class toggle failed',e)}
        this.updateNavActive(section || 'home');
        if (mainView && mainView.router) {
            console.log('✅ Using router.navigate');
            const targetPath = section ? `/${section}/` : '/';
            mainView.router.navigate(targetPath, { animate: true });
        } else {
            console.log('⚠️ Router not available, using CSS fallback');
            // Fallback
            document.querySelectorAll('.page').forEach(p => p.classList.remove('page-current'));
            const pageName = section || 'home';
            const page = document.querySelector(`.page[data-name="${pageName}"]`);
            console.log('Found page:', page ? 'yes' : 'no');
            if (page) {
                page.classList.add('page-current');
                console.log('✅ page-current added to', pageName);
            }
        }
    },

    updateNavActive: function(section) {
        const items = document.querySelectorAll('.bottom-nav .nav-item');
        items.forEach(item => {
            if (item.dataset.section === section) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    closeSection: function(section) {
        if (mainView && mainView.router) {
            mainView.router.back();
        } else {
            // Fallback
            try{ document.body.classList.remove('sponsor-transparent'); }catch(e){}
            document.querySelectorAll('.page').forEach(p => p.classList.remove('page-current'));
            const homePage = document.querySelector('.page[data-name="home"]');
            if (homePage) homePage.classList.add('page-current');
        }
    },

    // ========================================
    // UTILITÁRIOS
    // ========================================
    
    log: function(message) {
        console.log(`[BERLINDA] ${message}`);
    }
};

// Iniciar app quando documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Expor `app` no escopo global para permitir chamadas inline (onclick) e inspeção no DevTools
try {
    window.app = app;
} catch (e) {
    // ambiente restrito — nada a fazer
}
