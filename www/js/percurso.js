/**
 * PERCURSO.JS - Cálculos do percurso oficial
 * - calcular distância total
 * - determinar distância percorrida até posição atual projetada na rota
 */
const percurso = (function(){
    const R = 6371000;

    function toRad(deg){ return deg * Math.PI/180; }

    function haversine(a,b){
        const dLat = toRad(b.lat - a.lat);
        const dLon = toRad(b.lng - a.lng);
        const lat1 = toRad(a.lat);
        const lat2 = toRad(b.lat);
        const sinDlat = Math.sin(dLat/2);
        const sinDlon = Math.sin(dLon/2);
        const aa = sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon;
        const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
        return R * c;
    }

    // Converte lat/lng para coordenadas cartesianas locais (m) usando equirectangular
    function latLngToXY(lat,lng, lat0){
        const x = toRad(lng) * R * Math.cos(toRad(lat0));
        const y = toRad(lat) * R;
        return {x,y};
    }

    function computeTotalDistance(route){
        if (!route || route.length < 2) return 0;
        let total = 0;
        for (let i=1;i<route.length;i++){
            total += haversine(route[i-1], route[i]);
        }
        return total;
    }

    // Dado o route (array de {lat,lng}) e current {lat,lng}, retorna objeto com progress
    function computeProgress(route, current){
        const total = computeTotalDistance(route);
        if (total === 0) return { total:0, covered:0, remaining:0, percent:0 };

        // Melhor projeção mínima
        let best = {
            distToRoute: Infinity,
            coveredAlong: 0
        };

        // percorre segmentos
        let cum = 0;
        for (let i=0;i<route.length-1;i++){
            const A = route[i];
            const B = route[i+1];

            // converter para XY com referência em latitude média
            const lat0 = (A.lat + B.lat + current.lat)/3;
            const Axy = latLngToXY(A.lat, A.lng, lat0);
            const Bxy = latLngToXY(B.lat, B.lng, lat0);
            const Cxy = latLngToXY(current.lat, current.lng, lat0);

            const vx = Bxy.x - Axy.x;
            const vy = Bxy.y - Axy.y;
            const wx = Cxy.x - Axy.x;
            const wy = Cxy.y - Axy.y;
            const vlen2 = vx*vx + vy*vy;
            let t = 0;
            if (vlen2 > 0) t = (vx*wx + vy*wy) / vlen2;
            t = Math.max(0, Math.min(1, t));

            const projx = Axy.x + t*vx;
            const projy = Axy.y + t*vy;

            const dx = Cxy.x - projx;
            const dy = Cxy.y - projy;
            const distToSeg = Math.sqrt(dx*dx + dy*dy);

            // distância ao longo da rota até o ponto projetado
            const distAlongSegment = Math.sqrt((projx - Axy.x)*(projx - Axy.x) + (projy - Axy.y)*(projy - Axy.y));
            // converter distAlongSegment (em metros) já está em metros
            const covered = cum + distAlongSegment;

            if (distToSeg < best.distToRoute){
                best.distToRoute = distToSeg;
                best.coveredAlong = covered;
            }

            // avançar cum com comprimento real do segmento (usando haversine)
            cum += haversine(A,B);
        }

        const covered = Math.max(0, Math.min(total, best.coveredAlong));
        const remaining = Math.max(0, total - covered);
        const percent = total > 0 ? Math.round((covered/total)*100) : 0;

        return {
            total,
            covered,
            remaining,
            percent,
            distanceToRoute: best.distToRoute
        };
    }

    return {
        computeTotalDistance,
        computeProgress,
        haversine
    };
})();

try { window.percurso = percurso; } catch(e) {}
