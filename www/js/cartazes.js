(function(){
    // Try to load manifest.json from assets/cartazes/, fallback to embedded list
    const DEFAULT_CARTAZES = [
        { id: '2025', ano: '2025', imagem: 'assets/cartazes/placeholder.svg' },
        { id: '2024', ano: '2024', imagem: 'assets/cartazes/placeholder.svg' }
    ];

    // store manifest globally for preloading/navigation
    let CARTAZES_MANIFEST = [];

    function preloadImage(src){
        if (!src) return;
        const img = new Image();
        img.src = src;
    }

    function buildCard(item){
        const wrapper = document.createElement('div');
        wrapper.className = 'cartaz-poster';
        wrapper.setAttribute('role','button');
        wrapper.setAttribute('tabindex','0');

        const img = document.createElement('img');
        img.className = 'cartaz-thumb lazy';
        img.src = 'assets/cartazes/placeholder.svg';
        img.setAttribute('data-src', item.imagem);
        img.alt = `Cartaz ${item.ano}`;

        const loader = document.createElement('div');
        loader.className = 'cartaz-loader';

        img.addEventListener('load', function onload(){
            // when placeholder loads, real image may still not be set; check naturalWidth
            if (this.dataset && this.dataset.loaded === '1') return;
            // if real src already applied, mark loaded
            if (!this.classList.contains('lazy')) return;
        });

        img.onerror = function(){
            // fallback placeholder if image not found
            this.style.display = 'none';
            wrapper.style.background = 'linear-gradient(180deg,#f3f3f3,#e9e9e9)';
            const placeholder = document.createElement('div');
            placeholder.style.width = '100%';
            placeholder.style.height = '100%';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.color = '#8a8a8a';
            placeholder.style.fontWeight = '700';
            placeholder.style.fontSize = '20px';
            placeholder.textContent = item.ano;
            wrapper.appendChild(placeholder);
        };

        wrapper.appendChild(img);
        wrapper.appendChild(loader);

        const grad = document.createElement('div');
        grad.className = 'cartaz-gradient';
        wrapper.appendChild(grad);

        const year = document.createElement('div');
        year.className = 'cartaz-year';
        year.textContent = item.ano;
        wrapper.appendChild(year);

        // click opens detalhes page (use existing openSection/navigation)
        wrapper.addEventListener('click', ()=>{
            try {
                // store selected item globally for detalhes view to read
                window.__selectedCartaz = item;
                // navigate to cartazes only if not already there
                const currentPage = document.querySelector('.page.page-current');
                const isOnCartazes = currentPage && currentPage.getAttribute('data-name') === 'cartazes';
                function openModal(){
                    const modal = document.getElementById('cartazModal');
                    if (modal){
                        const modalImg = document.getElementById('cartazModalImg');
                        const downloadLink = document.getElementById('cartazDownload');
                        if (modalImg) modalImg.src = item.imagem;
                        if (downloadLink) { downloadLink.href = item.imagem; downloadLink.setAttribute('download', item.id || item.ano || 'cartaz'); }
                        modal.classList.add('visible');
                        modal.setAttribute('aria-hidden','false');
                        // preload neighbor images (next and previous)
                        try{
                            const idx = CARTAZES_MANIFEST.findIndex(x => (x.imagem === item.imagem) || x.id === item.id || x.ano === item.ano);
                            if (idx >= 0){
                                const next = CARTAZES_MANIFEST[idx+1];
                                const prev = CARTAZES_MANIFEST[idx-1];
                                if (next) preloadImage(next.imagem);
                                if (prev) preloadImage(prev.imagem);
                            }
                        }catch(e){console.warn('preload neighbors failed',e)}
                    } else {
                        console.log('Detalhes: implement details viewer or navigation to DetalhesCartaz');
                    }
                }

                if (!isOnCartazes){
                    app.openSection('cartazes');
                    // give time for navigation to complete then open modal
                    setTimeout(openModal, 220);
                } else {
                    openModal();
                }
            } catch(e){ console.warn(e); }
        });

        return wrapper;
    }

    function renderWithData(cartazes){
        const list = document.getElementById('cartazesList');
        if (!list) return;
        list.innerHTML = '';
        cartazes.forEach(item => {
            const col = document.createElement('div');
            col.className = 'cartaz-card';
            col.appendChild(buildCard(item));
            list.appendChild(col);
        });
        // keep a copy of manifest for preloading/navigation
        CARTAZES_MANIFEST = cartazes.slice();
        // after rendering, initialize lazy loader
        initLazyLoader();
    }

    function render(){
        const manifestUrl = 'assets/cartazes/manifest.json';
        fetch(manifestUrl).then(res => {
            if (!res.ok) throw new Error('manifest not found');
            return res.json();
        }).then(data => {
            if (!Array.isArray(data) || data.length === 0) throw new Error('empty manifest');
            renderWithData(data);
        }).catch(()=>{
            renderWithData(DEFAULT_CARTAZES);
        });
    }

    // init on DOM ready
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();

// Lazy loading with IntersectionObserver
function initLazyLoader(){
    const lazyImages = [].slice.call(document.querySelectorAll('img.cartaz-thumb.lazy'));
    if ('IntersectionObserver' in window){
        const observer = new IntersectionObserver(function(entries, obs){
            entries.forEach(entry => {
                if (entry.isIntersecting){
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src){
                        img.src = src;
                        img.dataset.loaded = '1';
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        const loader = img.parentNode.querySelector('.cartaz-loader');
                        if (loader) loader.style.display = 'none';
                    }
                    obs.unobserve(img);
                }
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });
        lazyImages.forEach(img => observer.observe(img));
    } else {
        // fallback: load all
        lazyImages.forEach(img => { const src = img.getAttribute('data-src'); if (src) img.src = src; img.classList.remove('lazy'); img.classList.add('loaded'); const loader = img.parentNode.querySelector('.cartaz-loader'); if (loader) loader.style.display = 'none'; });
    }
}

// Modal behavior: close, zoom toggle, ESC key
(function initModal(){
    function qs(id){ return document.getElementById(id); }
    const modal = qs('cartazModal');
    if (!modal) return;
    const modalImg = qs('cartazModalImg');
    const closeBtn = qs('cartazClose');
    const zoomBtn = qs('cartazZoom');
    const downloadLink = qs('cartazDownload');
    let zoomed = false;

    function closeModal(){
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden','true');
        if (modalImg) { modalImg.classList.remove('zoomed'); zoomed = false; }
    }

    closeBtn && closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e)=>{ if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeModal(); });

    if (zoomBtn){
        zoomBtn.addEventListener('click', ()=>{
            if (!modalImg) return;
            zoomed = !zoomed;
            modalImg.classList.toggle('zoomed', zoomed);
            zoomBtn.textContent = zoomed ? 'Deszoom' : 'Zoom';
        });
    }

    // double-click image to toggle zoom
    modalImg && modalImg.addEventListener('dblclick', ()=>{ zoomBtn && zoomBtn.click(); });

    // wheel to zoom in/out
    modalImg && modalImg.addEventListener('wheel', (e)=>{
        if (!e.ctrlKey) return; // require ctrl+wheel to avoid scroll conflicts
        e.preventDefault();
        zoomed = true;
        modalImg.classList.add('zoomed');
        zoomBtn && (zoomBtn.textContent = 'Deszoom');
    }, { passive:false });
})();
})();
