/* js/feuilleter.js — "Feuilleter le livre" : aperçu façon livre feuilletable.
   Gabarit unique copiable dans les 4 sites. Lit les pages simples depuis
   /animation/images/page1.jpg, page2.jpg … (auto-détection du nombre).
   page1 = 1re de couverture, dernière = 4e de couverture (affichées seules).
   Déclencheur : tout élément portant l'attribut data-feuilleter.
   Drop-in autonome : charge StPageFlip à la demande + injecte la modale.
   Desktop = livre ouvert (2 pages) · Mobile = 1 page · swipe / drag / clic. */
(function () {
  'use strict';

  var IMG_BASE  = 'animation/images/page';   // → animation/images/page1.jpg, page2.jpg …
  var IMG_EXT   = '.jpg';
  var MAX_PAGES = 60;                          // garde-fou
  var LIB_URL   = 'https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js';

  var overlay, container, pageFlip, srcs = [];

  // ---- détection auto du nombre de pages ----
  function probe(i, found, done){
    if (i > MAX_PAGES){ done(found); return; }
    var img = new Image();
    img.onload  = function(){ found.push(IMG_BASE + i + IMG_EXT); probe(i+1, found, done); };
    img.onerror = function(){ done(found); };
    img.src = IMG_BASE + i + IMG_EXT;
  }

  // ---- chargement de la lib StPageFlip ----
  function loadLib(cb){
    if (window.St && window.St.PageFlip){ cb(); return; }
    var s = document.createElement('script');
    s.src = LIB_URL; s.onload = cb;
    s.onerror = function(){ console.error('[feuilleter] StPageFlip non chargée — vérifier LIB_URL'); };
    document.head.appendChild(s);
  }

  // ---- styles + modale (créés une seule fois) ----
  function ensureModal(){
    if (overlay) return;
    var style = document.createElement('style');
    style.textContent =
      '.ost-feuill-overlay{position:fixed;inset:0;z-index:10002;display:none;align-items:center;'+
      'justify-content:center;background:rgba(8,6,4,.94);padding:20px;}'+
      '.ost-feuill-overlay.active{display:flex;}'+
      '.ost-feuill-box{position:relative;}'+
      '.ost-feuill-close{position:absolute;top:-44px;right:0;width:38px;height:38px;border-radius:50%;'+
      'border:none;background:rgba(255,255,255,.14);color:#fff;font-size:24px;line-height:1;cursor:pointer;'+
      'display:flex;align-items:center;justify-content:center;z-index:2;}'+
      '.ost-feuill-close:hover{background:rgba(255,255,255,.28);}'+
      '.ost-feuill-hint{position:absolute;bottom:-32px;left:0;right:0;text-align:center;'+
      'color:#cbb88a;font-size:.8rem;letter-spacing:.02em;}'+
      '@media (max-width:768px){.ost-feuill-close{top:-42px;}.ost-feuill-hint{bottom:-30px;}}';
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.className = 'ost-feuill-overlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML =
      '<div class="ost-feuill-box">'+
      '<button class="ost-feuill-close" type="button" aria-label="Fermer">&times;</button>'+
      '<div id="ost-feuill-flip"></div>'+
      '<div class="ost-feuill-hint">Glissez ou cliquez les bords pour tourner les pages</div>'+
      '</div>';
    document.body.appendChild(overlay);
    container = overlay.querySelector('#ost-feuill-flip');

    overlay.querySelector('.ost-feuill-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });
  }

  // ---- construction du flip-book (reconstruit à chaque ouverture = responsive) ----
  function buildFlip(done){
    if (pageFlip){ try { pageFlip.destroy(); } catch(e){} pageFlip = null; container.innerHTML = ''; }
    var first = new Image();
    first.onload = function(){
      var ratio = (first.naturalWidth / first.naturalHeight) || 0.73;
      var wide  = window.innerWidth >= 820;          // desktop = 2 pages, mobile = 1 page
      var shown = wide ? 2 : 1;
      var availW = window.innerWidth  * (wide ? 0.90 : 0.96);
      var availH = window.innerHeight * 0.86;
      var pageH = Math.min(availH, (availW / shown) / ratio);
      var pageW = pageH * ratio;
      pageFlip = new St.PageFlip(container, {
        width: Math.round(pageW),
        height: Math.round(pageH),
        size: 'fixed',
        usePortrait: true,        // bascule auto en 1 page si l'écran est étroit
        showCover: true,          // 1re et 4e de couverture affichées seules
        maxShadowOpacity: 0.5,
        flippingTime: 700,
        useMouseEvents: true,
        mobileScrollSupport: true
      });
      pageFlip.loadFromImages(srcs);
      done();
    };
    first.onerror = done;
    first.src = srcs[0];
  }

  function show(){
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  function openModal(){
    ensureModal();
    loadLib(function(){
      if (srcs.length){ buildFlip(show); return; }
      probe(1, [], function(found){
        srcs = found;
        if (!srcs.length){ console.warn('[feuilleter] aucune image trouvée : '+IMG_BASE+'1'+IMG_EXT); return; }
        buildFlip(show);
      });
    });
  }

  function init(){
    var t = document.querySelectorAll('[data-feuilleter]');
    for (var i=0;i<t.length;i++){
      t[i].addEventListener('click', function(e){ e.preventDefault(); openModal(); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
