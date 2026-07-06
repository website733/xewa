/*!
 * SGS — Smart Gallery System
 * Widget de galerie embarquable, illimité en images, personnalisable par palette de couleurs.
 * Deux modes d'affichage : "carousel" (défilement automatique) ou "grid" (grille classique).
 *
 * Usage minimal :
 *   <div class="sgs-gallery" data-sgs='{"items":[{"image":"...","name":"...","price":49}]}'></div>
 *   <script src="sgs-embed.js"></script>
 *
 * API programmatique :
 *   const gallery = SGS.render(document.getElementById('mon-conteneur'), config);
 *   gallery.update(nouvelleConfig);
 *
 * (c) SGS — Smart Gallery System — xewa.vercel.app
 */
(function (global) {
  'use strict';

  var DEFAULT_THEME = {
    accent: '#B8874A',
    background: '#12151A',
    surface: '#1B1F26',
    text: '#EDEAE3',
    muted: '#9AA3B2',
    radius: 16,
    gap: 18,
    cardMinWidth: 220,
    font: "'Manrope', system-ui, -apple-system, sans-serif"
  };

  var DEFAULTS = {
    items: [],
    currency: 'EUR',
    locale: 'fr-FR',
    layout: 'carousel',
    carouselSpeed: 3.2,
    initialCount: 12,
    loadStep: 12,
    search: true,
    sortable: true,
    title: '',
    emptyLabel: 'Aucune création à afficher pour le moment.'
  };

  var uidCounter = 0;

  function deepMerge(base, extra) {
    var out = {};
    var k;
    for (k in base) out[k] = base[k];
    if (extra) for (k in extra) {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && base[k] && typeof base[k] === 'object') {
        out[k] = deepMerge(base[k], extra[k]);
      } else if (extra[k] !== undefined) {
        out[k] = extra[k];
      }
    }
    return out;
  }

  function normalizeConfig(cfg) {
    cfg = cfg || {};
    var merged = deepMerge(DEFAULTS, cfg);
    merged.theme = deepMerge(DEFAULT_THEME, cfg.theme);
    merged.items = Array.isArray(merged.items) ? merged.items.filter(function (it) {
      return it && it.image && it.name;
    }) : [];
    return merged;
  }

  function formatPrice(value, currency, locale) {
    var num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
    if (isNaN(num)) return value == null ? '' : String(value);
    try {
      return new Intl.NumberFormat(locale || 'fr-FR', { style: 'currency', currency: currency || 'EUR', maximumFractionDigits: 2 }).format(num);
    } catch (e) {
      return num.toFixed(2) + ' ' + (currency || '');
    }
  }

  var STYLE = [
    ':host, .sgs-root { all: initial; }',
    '.sgs { font-family: var(--sgs-font); color: var(--sgs-text); background: var(--sgs-bg); padding: 28px; border-radius: calc(var(--sgs-radius) + 8px); box-sizing: border-box; position: relative; }',
    '.sgs, .sgs *, .sgs *::before, .sgs *::after { box-sizing: border-box; }',
    '.sgs-head { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; flex-wrap:wrap; }',
    '.sgs-title { font-size: 20px; font-weight: 800; letter-spacing: .01em; margin:0; }',
    '.sgs-tools { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }',
    '.sgs-search { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.12); color: var(--sgs-text); padding: 9px 14px; border-radius: 999px; font-size: 13px; font-family: inherit; outline: none; min-width: 180px; transition: border-color .2s, box-shadow .2s; }',
    '.sgs-search:focus { border-color: var(--sgs-accent); }',
    '.sgs-sort { background: var(--sgs-surface); border: 1px solid rgba(255,255,255,.12); color: var(--sgs-text); padding: 9px 12px; border-radius: 999px; font-size: 13px; font-family: inherit; outline: none; cursor:pointer; }',

    /* grid layout */
    '.sgs-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(var(--sgs-columns-min), 1fr)); gap: var(--sgs-gap); }',

    /* carousel layout */
    '.sgs-carousel-wrap { overflow:hidden; position:relative; -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent); }',
    '.sgs-carousel-track { display:flex; gap: var(--sgs-gap); width:max-content; will-change: transform; }',
    '.sgs-carousel-track.sgs-anim { animation-name: sgs-scroll; animation-timing-function: linear; animation-iteration-count: infinite; }',
    '.sgs-carousel-wrap:hover .sgs-anim, .sgs-carousel-wrap.sgs-paused .sgs-anim { animation-play-state: paused; }',
    '.sgs-carousel-track .sgs-card { flex: 0 0 auto; width: var(--sgs-columns-min); opacity:1; animation:none; }',
    '@keyframes sgs-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }',
    '@media (prefers-reduced-motion: reduce) { .sgs-anim { animation: none !important; } }',

    /* cards */
    '.sgs-card { position:relative; background: var(--sgs-surface); border-radius: var(--sgs-radius); overflow:hidden; border: 1px solid rgba(255,255,255,.08); cursor:pointer; transform: translateY(0); transition: transform .35s cubic-bezier(.2,.8,.2,1), border-color .3s, box-shadow .35s; }',
    '.sgs-grid .sgs-card { opacity:0; animation: sgs-in .5s ease forwards; }',
    '.sgs-grid .sgs-card:nth-child(1){animation-delay:.02s} .sgs-grid .sgs-card:nth-child(2){animation-delay:.06s} .sgs-grid .sgs-card:nth-child(3){animation-delay:.1s} .sgs-grid .sgs-card:nth-child(4){animation-delay:.14s} .sgs-grid .sgs-card:nth-child(5){animation-delay:.18s} .sgs-grid .sgs-card:nth-child(6){animation-delay:.22s}',
    '@keyframes sgs-in { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }',
    '.sgs-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px -18px rgba(0,0,0,.6); }',
    '.sgs-spot { position:absolute; inset:0; pointer-events:none; opacity:0; transition: opacity .3s; background: radial-gradient(circle 180px at var(--mx,50%) var(--my,50%), rgba(255,255,255,.22), transparent 70%); mix-blend-mode: screen; }',
    '.sgs-card:hover .sgs-spot { opacity:1; }',
    '.sgs-media { position:relative; width:100%; aspect-ratio: 1 / 1; overflow:hidden; background: linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02)); }',
    '.sgs-media img { width:100%; height:100%; object-fit: cover; display:block; transition: transform .6s cubic-bezier(.2,.8,.2,1); }',
    '.sgs-card:hover .sgs-media img { transform: scale(1.06); }',
    '.sgs-body { padding: 14px 16px 16px; display:flex; flex-direction:column; gap:4px; position:relative; }',
    '.sgs-name { font-size: 14.5px; font-weight: 700; line-height:1.3; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
    '.sgs-price { font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace; font-size: 13px; color: var(--sgs-accent); font-weight: 600; letter-spacing:.02em; }',
    '.sgs-empty { padding: 60px 20px; text-align:center; color: var(--sgs-muted); font-size: 14px; border: 1px dashed rgba(255,255,255,.15); border-radius: var(--sgs-radius); }',
    '.sgs-more-wrap { display:flex; justify-content:center; margin-top: 22px; }',
    '.sgs-more { background:transparent; border: 1px solid rgba(255,255,255,.25); color: var(--sgs-text); padding: 10px 22px; border-radius: 999px; font-family: inherit; font-size: 13px; font-weight:600; cursor:pointer; transition: background .25s, transform .2s; }',
    '.sgs-more:hover { background: rgba(255,255,255,.08); transform: translateY(-1px); }',
    '.sgs-badge { position:absolute; top:10px; left:10px; background: var(--sgs-accent); color:#12151A; font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; padding: 4px 9px; border-radius: 999px; }',
    '@media (max-width: 460px) { .sgs { padding: 18px; } .sgs-search{ min-width: 120px; } }'
  ].join('\n');

  var LIGHTBOX_STYLE = [
    ':host { all: initial; }',
    '.sgs-lb-overlay { position: fixed; inset:0; background: rgba(8,9,11,.92); backdrop-filter: blur(6px); display:flex; align-items:center; justify-content:center; z-index: 2147483000; animation: sgs-fade .2s ease; font-family: var(--sgs-font, sans-serif); }',
    '@keyframes sgs-fade { from{opacity:0} to{opacity:1} }',
    '.sgs-lb-fig { max-width: min(880px, 92vw); max-height: 86vh; display:flex; flex-direction:column; align-items:center; gap:14px; }',
    '.sgs-lb-fig img { max-width:100%; max-height:66vh; object-fit:contain; border-radius:14px; box-shadow: 0 30px 80px rgba(0,0,0,.6); }',
    '.sgs-lb-caption { text-align:center; color:#EDEAE3; }',
    '.sgs-lb-name { font-weight:700; font-size:16px; margin:0 0 4px; }',
    '.sgs-lb-price { font-family:"IBM Plex Mono", monospace; color: var(--sgs-accent, #B8874A); font-size:14px; }',
    '.sgs-lb-btn { position:absolute; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.18); color:#fff; width:42px; height:42px; border-radius:50%; font-size:18px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition: background .2s; }',
    '.sgs-lb-btn:hover { background: rgba(255,255,255,.18); }',
    '.sgs-lb-close { top: 22px; right: 22px; }',
    '.sgs-lb-prev { left: 18px; top:50%; transform: translateY(-50%); }',
    '.sgs-lb-next { right: 18px; top:50%; transform: translateY(-50%); }',
    '@media (max-width: 600px){ .sgs-lb-prev,.sgs-lb-next{ width:36px;height:36px; } }'
  ].join('\n');

  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function openLightbox(items, index, theme) {
    var host = el('div');
    document.body.appendChild(host);
    var shadow = host.attachShadow({ mode: 'open' });
    var styleEl = el('style'); styleEl.textContent = LIGHTBOX_STYLE; shadow.appendChild(styleEl);

    var overlay = el('div', 'sgs-lb-overlay');
    overlay.style.setProperty('--sgs-accent', theme.accent);
    overlay.style.setProperty('--sgs-font', theme.font);
    shadow.appendChild(overlay);

    var closeBtn = el('button', 'sgs-lb-btn sgs-lb-close'); closeBtn.innerHTML = '&times;';
    var prevBtn = el('button', 'sgs-lb-btn sgs-lb-prev'); prevBtn.innerHTML = '&#8249;';
    var nextBtn = el('button', 'sgs-lb-btn sgs-lb-next'); nextBtn.innerHTML = '&#8250;';
    var fig = el('div', 'sgs-lb-fig');
    overlay.appendChild(closeBtn); overlay.appendChild(prevBtn); overlay.appendChild(nextBtn); overlay.appendChild(fig);

    function close() {
      document.removeEventListener('keydown', onKey);
      host.remove();
    }
    function show(i) {
      index = (i + items.length) % items.length;
      var it = items[index];
      fig.innerHTML = '';
      var img = el('img'); img.src = it.image; img.alt = it.name || '';
      var cap = el('div', 'sgs-lb-caption');
      var nameEl = el('p', 'sgs-lb-name'); nameEl.textContent = it.name || '';
      var priceEl = el('div', 'sgs-lb-price'); priceEl.textContent = it.priceLabel || '';
      cap.appendChild(nameEl); cap.appendChild(priceEl);
      fig.appendChild(img); fig.appendChild(cap);
    }
    function onKey(ev) {
      if (ev.key === 'Escape') close();
      if (ev.key === 'ArrowRight') show(index + 1);
      if (ev.key === 'ArrowLeft') show(index - 1);
    }
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (ev) { if (ev.target === overlay) close(); });
    prevBtn.addEventListener('click', function () { show(index - 1); });
    nextBtn.addEventListener('click', function () { show(index + 1); });
    document.addEventListener('keydown', onKey);
    show(index);
  }

  function createGallery(container, config) {
    if (!container) throw new Error('SGS: conteneur introuvable');
    var cfg = normalizeConfig(config);
    var theme = cfg.theme;
    uidCounter++;
    var uid = 'sgs' + uidCounter;

    var root = container.__sgsShadow;
    if (!root) {
      root = container.attachShadow({ mode: 'open' });
      container.__sgsShadow = root;
      var styleEl = el('style'); styleEl.textContent = STYLE; root.appendChild(styleEl);
    } else {
      Array.prototype.forEach.call(root.children, function (c) { if (c.tagName !== 'STYLE') c.remove(); });
    }

    var state = { query: '', sort: 'default', shown: cfg.initialCount };

    var wrap = el('div', 'sgs');
    applyThemeVars(wrap, theme);
    root.appendChild(wrap);

    function applyThemeVars(node, t) {
      node.style.setProperty('--sgs-accent', t.accent);
      node.style.setProperty('--sgs-bg', t.background);
      node.style.setProperty('--sgs-surface', t.surface);
      node.style.setProperty('--sgs-text', t.text);
      node.style.setProperty('--sgs-muted', t.muted);
      node.style.setProperty('--sgs-radius', t.radius + 'px');
      node.style.setProperty('--sgs-gap', t.gap + 'px');
      node.style.setProperty('--sgs-columns-min', t.cardMinWidth + 'px');
      node.style.setProperty('--sgs-font', t.font);
    }

    function filteredItems() {
      var list = cfg.items.slice();
      if (state.query) {
        var q = state.query.toLowerCase();
        list = list.filter(function (it) { return (it.name || '').toLowerCase().indexOf(q) !== -1; });
      }
      if (state.sort === 'price-asc') list.sort(function (a, b) { return parseFloat(a.price) - parseFloat(b.price); });
      if (state.sort === 'price-desc') list.sort(function (a, b) { return parseFloat(b.price) - parseFloat(a.price); });
      if (state.sort === 'name') list.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
      return list;
    }

    function buildCard(it, lightboxList, lightboxIndex) {
      var priceLabel = formatPrice(it.price, cfg.currency, cfg.locale);
      it.priceLabel = priceLabel;
      var card = el('div', 'sgs-card');
      var media = el('div', 'sgs-media');
      var img = el('img');
      img.loading = 'lazy';
      img.src = it.image;
      img.alt = it.name || '';
      img.addEventListener('error', function () {
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="' + theme.surface + '"/><text x="50%" y="50%" fill="' + theme.muted + '" font-family="sans-serif" font-size="14" text-anchor="middle">image indisponible</text></svg>'
        );
      });
      var spot = el('div', 'sgs-spot');
      media.appendChild(img); media.appendChild(spot);
      if (it.badge) { var b = el('div', 'sgs-badge'); b.textContent = it.badge; media.appendChild(b); }

      var body = el('div', 'sgs-body');
      var name = el('p', 'sgs-name'); name.textContent = it.name; name.title = it.name;
      var price = el('div', 'sgs-price'); price.textContent = priceLabel;
      body.appendChild(name); body.appendChild(price);

      card.appendChild(media); card.appendChild(body);

      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var mx = ((e.clientX - r.left) / r.width) * 100;
        var my = ((e.clientY - r.top) / r.height) * 100;
        spot.style.setProperty('--mx', mx + '%');
        spot.style.setProperty('--my', my + '%');
      });
      card.addEventListener('click', function () {
        openLightbox(lightboxList, lightboxIndex, theme);
      });
      return card;
    }

    function buildToolbar() {
      var head = el('div', 'sgs-head');
      if (cfg.title) {
        var h = el('h3', 'sgs-title'); h.textContent = cfg.title; head.appendChild(h);
      }
      var tools = el('div', 'sgs-tools');
      if (cfg.search) {
        var search = el('input', 'sgs-search', { type: 'search', placeholder: 'Rechercher une création…' });
        search.value = state.query;
        search.addEventListener('input', function (e) { state.query = e.target.value; state.shown = cfg.initialCount; paint(); });
        tools.appendChild(search);
      }
      if (cfg.sortable) {
        var sort = el('select', 'sgs-sort');
        [['default', 'Ordre par défaut'], ['price-asc', 'Prix croissant'], ['price-desc', 'Prix décroissant'], ['name', 'Nom (A-Z)']].forEach(function (opt) {
          var o = el('option'); o.value = opt[0]; o.textContent = opt[1]; if (opt[0] === state.sort) o.selected = true; sort.appendChild(o);
        });
        sort.addEventListener('change', function (e) { state.sort = e.target.value; paint(); });
        tools.appendChild(sort);
      }
      head.appendChild(tools);
      return head;
    }

    function paintGrid(list) {
      var visible = list.slice(0, state.shown);
      var grid = el('div', 'sgs-grid');
      visible.forEach(function (it, i) {
        grid.appendChild(buildCard(it, list, i));
      });
      wrap.appendChild(grid);

      if (list.length > state.shown) {
        var moreWrap = el('div', 'sgs-more-wrap');
        var moreBtn = el('button', 'sgs-more');
        moreBtn.textContent = 'Voir plus (' + (list.length - state.shown) + ' restantes)';
        moreBtn.addEventListener('click', function () { state.shown += cfg.loadStep; paint(); });
        moreWrap.appendChild(moreBtn);
        wrap.appendChild(moreWrap);
      }
    }

    function paintCarousel(list) {
      var carouselWrap = el('div', 'sgs-carousel-wrap');
      var track = el('div', 'sgs-carousel-track');
      var loop = list.length > 1;
      if (loop) track.classList.add('sgs-anim');

      var sequence = loop ? list.concat(list) : list.slice();
      sequence.forEach(function (it, i) {
        track.appendChild(buildCard(it, list, i % list.length));
      });

      if (loop) {
        var duration = Math.max(list.length * cfg.carouselSpeed, cfg.carouselSpeed * 3);
        track.style.animationDuration = duration + 's';
      }
      carouselWrap.appendChild(track);
      wrap.appendChild(carouselWrap);
    }

    function paint() {
      wrap.innerHTML = '';

      if (cfg.title || cfg.search || cfg.sortable) {
        wrap.appendChild(buildToolbar());
      }

      var list = filteredItems();

      if (!list.length) {
        var empty = el('div', 'sgs-empty');
        empty.textContent = cfg.emptyLabel;
        wrap.appendChild(empty);
        return;
      }

      if (cfg.layout === 'carousel') paintCarousel(list);
      else paintGrid(list);
    }

    paint();

    return {
      update: function (newConfig) {
        cfg = normalizeConfig(deepMerge(cfg, newConfig));
        theme = cfg.theme;
        applyThemeVars(wrap, theme);
        state.shown = cfg.initialCount;
        paint();
      },
      config: function () { return cfg; }
    };
  }

  function autoInit(scope) {
    (scope || document).querySelectorAll('[data-sgs]').forEach(function (elm) {
      if (elm.__sgsInit) return;
      try {
        var cfg = JSON.parse(elm.getAttribute('data-sgs'));
        elm.__sgsInstance = createGallery(elm, cfg);
        elm.__sgsInit = true;
      } catch (e) {
        console.error('SGS: configuration JSON invalide sur', elm, e);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { autoInit(); });
  } else {
    autoInit();
  }

  global.SGS = {
    render: createGallery,
    refresh: autoInit,
    version: '1.1.0'
  };
})(window);
