(function(){
    const sponsors = [
        { name: 'Patrocinador Um' },
        { name: 'Patrocinador Dois' },
        { name: 'Patrocinador Tres' },
        { name: 'Patrocinador Quatro' }
    ];

    function createSponsorItem(sponsor){
        const item = document.createElement('div');
        item.className = 'sponsor-item';

        if (sponsor.src){
            const img = document.createElement('img');
            img.className = 'sponsor-logo';
            img.src = sponsor.src;
            img.alt = sponsor.name;
            item.appendChild(img);
        } else {
            const label = document.createElement('div');
            label.className = 'sponsor-label';
            label.textContent = sponsor.name;
            item.appendChild(label);
        }

        return item;
    }

    function buildBanner(){
        if (document.querySelector('.sponsor-banner')) return;

        const banner = document.createElement('div');
        banner.className = 'sponsor-banner';
        banner.setAttribute('aria-hidden','false');

        const track = document.createElement('div');
        track.className = 'sponsor-track';

        const listA = document.createElement('div');
        listA.className = 'sponsor-list';
        const listB = document.createElement('div');
        listB.className = 'sponsor-list';

        sponsors.forEach(sponsor => {
            listA.appendChild(createSponsorItem(sponsor));
            listB.appendChild(createSponsorItem(sponsor));
        });

        track.appendChild(listA);
        track.appendChild(listB);
        banner.appendChild(track);
        document.body.appendChild(banner);

        return { banner, track, listA, listB };
    }

    function updateScroll(track, listA){
        if (!track || !listA) return;
        const width = Math.ceil(listA.getBoundingClientRect().width);
        if (width <= 0) return;
        track.style.setProperty('--scroll-distance', width + 'px');
        const speed = 100; // pixels per second
        const duration = Math.max(18, width / speed);
        track.style.setProperty('--scroll-duration', duration + 's');
    }

    function init(){
        const built = buildBanner();
        if (!built) return;

        function refresh(){
            updateScroll(built.track, built.listA);
        }

        refresh();
        window.addEventListener('resize', () => { setTimeout(refresh, 120); });
        window.addEventListener('load', () => setTimeout(refresh, 120));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
