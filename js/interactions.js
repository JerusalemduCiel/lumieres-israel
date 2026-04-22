/* ==========================================================================
   interactions.js - Diverses interactions UI
   (copyright, formulaire contact, parallaxe, modale arbitrage, notify,
   carrousel book, lightbox)
   Extrait depuis index.html (phase 1 d'optimisation)
   ========================================================================== */

/* ---- Copyright year ---- */
    document.getElementById('copyright-year').textContent = new Date().getFullYear();

/* ---- Formulaire de contact unifie (toggle entreprise/particulier) ---- */
        document.addEventListener('DOMContentLoaded', function() {
            const userTypeSelect = document.getElementById('user-type');
            const organizationField = document.getElementById('organization-field');
            const partnershipTypeField = document.getElementById('partnership-type-field');
            const organizationInput = document.getElementById('unified-organization');
            const partnershipTypeSelect = document.getElementById('unified-partnership-type');
            const unifiedForm = document.getElementById('unified-contact-form');
            
            // Fonction pour afficher/masquer les champs conditionnels
            function toggleConditionalFields() {
                const selectedValue = userTypeSelect.value;
                
                if (selectedValue === 'entreprise') {
                    // Afficher les champs conditionnels
                    organizationField.style.display = 'block';
                    partnershipTypeField.style.display = 'block';
                    
                    // Rendre les champs obligatoires
                    organizationInput.setAttribute('required', 'required');
                    partnershipTypeSelect.setAttribute('required', 'required');
                    
                    // Changer l'action du formulaire pour partenariat
                    unifiedForm.action = 'https://formspree.io/f/xvgwgezy';
                } else {
                    // Masquer les champs conditionnels
                    organizationField.style.display = 'none';
                    partnershipTypeField.style.display = 'none';
                    
                    // Retirer l'obligation des champs
                    organizationInput.removeAttribute('required');
                    partnershipTypeSelect.removeAttribute('required');
                    
                    // Réinitialiser les valeurs
                    organizationInput.value = '';
                    partnershipTypeSelect.value = '';
                    
                    // Changer l'action du formulaire pour contact
                    unifiedForm.action = 'https://formspree.io/f/xwprpgvk';
                }
            }
            
            // Écouter les changements sur le select "Vous êtes"
            if (userTypeSelect) {
                userTypeSelect.addEventListener('change', toggleConditionalFields);
            }
        });

/* ---- Parallaxe bandeau Ticket d'Or ---- */
    // Parallaxe Bandeau Ticket d'Or
    document.addEventListener('DOMContentLoaded', function() {
        const bandeau = document.getElementById('bandeau-parallax');
        const frise = document.querySelector('.frise-content');
        const section = document.querySelector('.bandeau-ticket-or');
        
        if (bandeau && frise && section) {
            window.addEventListener('scroll', function() {
                // Désactiver le parallax sur mobile
                if (window.innerWidth <= 768) {
                    bandeau.style.transform = 'none';
                    frise.style.transform = 'none';
                    return;
                }
                
                const rect = section.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Vérifie si la section est visible
                if (rect.top < windowHeight && rect.bottom > 0) {
                    // Calcul du pourcentage de scroll dans la section
                    const scrollPercent = (windowHeight - rect.top) / (windowHeight + rect.height);
                    
                    // Parallaxe accentuée sur desktop : mouvement plus prononcé
                    const bandeauOffset = (scrollPercent - 0.5) * -150; // Droite → Gauche (augmenté de -100 à -150)
                    const friseOffset = (scrollPercent - 0.5) * 200; // Gauche → Droite (augmenté de 150 à 200)
                    
                    bandeau.style.transform = `translateX(${bandeauOffset}px)`;
                    frise.style.transform = `translateX(${friseOffset}px)`;
                }
            });
            
            // Réinitialiser au resize pour gérer le passage mobile/desktop
            window.addEventListener('resize', function() {
                if (window.innerWidth <= 768) {
                    bandeau.style.transform = 'none';
                    frise.style.transform = 'none';
                }
            });
        }
    });

/* ---- Modale carte (commentaires) ---- */
    // La fonction flipCarte est définie dans js/main.js
    // La fonction closeModal a été modifiée dans js/main.js pour reset le flip

/* ---- Modale Guide d'Arbitrage + Gestion Me prevenir ---- */
    document.addEventListener('DOMContentLoaded', function() {
        // === MODALE GUIDE D'ARBITRAGE ===
        const btnArbitrage = document.getElementById('btn-arbitrage-guide');
        const arbitrageOverlay = document.getElementById('arbitrage-modal-overlay');
        const arbitrageCloseBtn = document.querySelector('.arbitrage-modal-close');
        
        // Ouverture
        if (btnArbitrage && arbitrageOverlay) {
            btnArbitrage.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                arbitrageOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('Modale arbitrage ouverte');
            });
        } else {
            console.log('Bouton ou overlay non trouvé', btnArbitrage, arbitrageOverlay);
        }
        
        // Fermeture bouton X
        if (arbitrageCloseBtn) {
            arbitrageCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                arbitrageOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Fermeture clic extérieur
        if (arbitrageOverlay) {
            arbitrageOverlay.addEventListener('click', function(e) {
                if (e.target === arbitrageOverlay) {
                    arbitrageOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Fermeture touche Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && arbitrageOverlay && arbitrageOverlay.classList.contains('active')) {
                arbitrageOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // ============================================
    // GESTION "ME PRÉVENIR" - SORTIE JEUX
    // ============================================

    const notifyGameNames = {
      'jdc': 'Jérusalem du Ciel',
      'moh': 'Minhag ou Halakha'
    };

    const notifyGameDescriptions = {
      'jdc': 'le jeu de plateau qui permet de traverser 3000 ans d\'histoire juive en famille',
      'moh': 'le jeu qui permet de distinguer la loi religieuse de la coutume'
    };

    function openNotifyModal(gameId) {
      const gameName = notifyGameNames[gameId];
      const gameDesc = notifyGameDescriptions[gameId];
      if (!gameName) return;
      
      // Fermer les modales ouvertes si nécessaire
      const openModals = document.querySelectorAll('.modal.active, .content-discovery-overlay.active, [class*="modal"][style*="display: block"]');
      openModals.forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
      });
      document.body.classList.remove('modal-open', 'no-scroll');
      
      // Trouver la section contact/newsletter
      const targetSection = document.querySelector('#contact, #newsletter, #restez-informes, #communaute, [id*="contact"], [id*="newsletter"]');
      
      if (targetSection) {
        setTimeout(() => {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
      
      // Trouver le textarea
      const messageField = document.querySelector('textarea[name="message"], textarea#message, .contact-form textarea, form textarea, #contact textarea');
      
      if (messageField) {
        // Déterminer le message en fonction du jeu
        let prefilledMessage;
        if (gameId === 'moh') {
          prefilledMessage = `Bonjour,

Je souhaite être informé(e) dès la sortie du jeu 
Minhag ou Halakha (prévu été 2026).

📌 Jeu : Minhag ou Halakha
🎯 Objectif : Distinguer la loi religieuse de la coutume
📅 Sortie prévue : Été 2026

[Votre message ou question ici]

Merci !`;
        } else {
          prefilledMessage = `Bonjour,

Je souhaite être informé(e) dès la sortie du jeu 
Jérusalem du Ciel (prévu hiver 2026).

📌 Jeu : Jérusalem du Ciel
🎯 Objectif : Traverser 3000 ans d'histoire juive en famille
📅 Sortie prévue : Hiver 2026

[Votre message ou question ici]

Merci !`;
        }
        
        messageField.value = prefilledMessage;
        
        setTimeout(() => {
          messageField.focus();
          const placeholder = '[Votre message ou question ici]';
          const startPos = prefilledMessage.indexOf(placeholder);
          const endPos = startPos + placeholder.length;
          if (startPos > -1) {
            messageField.setSelectionRange(startPos, endPos);
          }
        }, 600);
      }
      
      // Ajouter champ caché pour Formspree
      const form = messageField ? messageField.closest('form') : document.querySelector('form[action*="formspree"], #contact form, .contact-form');
      if (form) {
        // Pré-sélectionner \"Vous êtes\" sur Particulier si vide
        const userTypeSelect = form.querySelector('#user-type, select[name=\"user_type\"]');
        if (userTypeSelect && !userTypeSelect.value) {
          userTypeSelect.value = 'particulier';
        }

        let hiddenField = form.querySelector('input[name="jeu_interesse"]');
        if (!hiddenField) {
          hiddenField = document.createElement('input');
          hiddenField.type = 'hidden';
          hiddenField.name = 'jeu_interesse';
          form.appendChild(hiddenField);
        }
        hiddenField.value = gameName;
        
        // Ajouter champ sujet pour Formspree (_subject)
        let subjectField = form.querySelector('input[name="_subject"]');
        if (!subjectField) {
          subjectField = document.createElement('input');
          subjectField.type = 'hidden';
          subjectField.name = '_subject';
          form.appendChild(subjectField);
        }
        subjectField.value = gameId === 'moh' 
          ? 'Demande d\'information pour Minhag ou Halakha'
          : `Demande d'information pour ${gameName}`;
        
        // Afficher bannière de confirmation
        let confirmBanner = form.querySelector('.notify-confirm-banner');
        if (!confirmBanner) {
          confirmBanner = document.createElement('div');
          confirmBanner.className = 'notify-confirm-banner';
          confirmBanner.innerHTML = '<span class="confirm-icon">✨</span><span>Demande d\'information pour <strong></strong></span>';
          form.insertBefore(confirmBanner, form.firstChild);
        }
        confirmBanner.querySelector('strong').textContent = gameName;
        confirmBanner.style.display = 'flex';
      }
    }

    // Gestion des clics sur les boutons "Me prévenir"
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.btn-notify[data-game]').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const gameId = this.dataset.game;
          if (gameId) {
            openNotifyModal(gameId);
          }
        });
      });
      
      // Vérifier si paramètre ?notify= dans l'URL
      const urlParams = new URLSearchParams(window.location.search);
      const notifyGame = urlParams.get('notify');
      if (notifyGame && notifyGameNames[notifyGame]) {
        setTimeout(() => openNotifyModal(notifyGame), 500);
      }
    });

/* ---- Carrousel Feuilleter les pages + Lightbox zoom ---- */
    // === CARROUSEL FEUILLETER LES PAGES (SHOW/HIDE) ===
    var currentBookSlide = 0;
    var TOTAL_BOOK_SLIDES = 5;

    function changeBookSlide(direction) {
        currentBookSlide = (currentBookSlide + direction + TOTAL_BOOK_SLIDES) % TOTAL_BOOK_SLIDES;
        showBookSlide();
    }

    function goToBookSlide(index) {
        currentBookSlide = index;
        showBookSlide();
    }

    function showBookSlide() {
        var slides = document.querySelectorAll('#book-carousel .book-slide');
        for (var i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }
        if (slides[currentBookSlide]) {
            slides[currentBookSlide].style.display = 'block';
        }
        var dots = document.querySelectorAll('#modal-carte-apercu .book-dot');
        for (var j = 0; j < dots.length; j++) {
            dots[j].style.background = (j === currentBookSlide) ? '#D4A94A' : '#ccc';
        }
        var counter = document.getElementById('book-counter');
        if (counter) {
            counter.textContent = (currentBookSlide + 1) + ' / ' + TOTAL_BOOK_SLIDES;
        }
    }

    // === LIGHTBOX ZOOM POUR FEUILLETER LES PAGES ===
    var lightboxZoomed = false;

    function openBookLightbox(src, alt) {
        var lightbox = document.getElementById('book-lightbox');
        var img = document.getElementById('lightbox-img');
        if (!lightbox || !img) return;
        img.src = src;
        img.alt = alt || 'Zoom';
        img.style.width = '90%';
        lightboxZoomed = false;
        img.style.cursor = 'zoom-in';
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeBookLightbox() {
        var lightbox = document.getElementById('book-lightbox');
        if (lightbox) {
            lightbox.style.display = 'none';
        }
        document.body.style.overflow = '';
        lightboxZoomed = false;
    }

    document.addEventListener('DOMContentLoaded', function() {
        var closeBtn = document.getElementById('lightbox-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeBookLightbox();
            });
        }

        var lightbox = document.getElementById('book-lightbox');
        if (lightbox) {
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closeBookLightbox();
                }
            });
        }

        var img = document.getElementById('lightbox-img');
        if (img) {
            img.addEventListener('click', function(e) {
                e.stopPropagation();
                if (lightboxZoomed) {
                    img.style.width = '90%';
                    img.style.cursor = 'zoom-in';
                    lightboxZoomed = false;
                    if (lightbox) {
                        lightbox.scrollTop = 0;
                        lightbox.scrollLeft = 0;
                    }
                } else {
                    img.style.width = '180%';
                    img.style.cursor = 'zoom-out';
                    lightboxZoomed = true;
                }
            });
        }

        if (lightbox) {
            lightbox.addEventListener('wheel', function(e) {
                if (lightbox.style.display === 'block') {
                    e.preventDefault();
                    var lbImg = document.getElementById('lightbox-img');
                    if (!lbImg) return;
                    var currentWidth = parseFloat(lbImg.style.width) || 90;
                    if (e.deltaY < 0) {
                        currentWidth = Math.min(currentWidth + 15, 300);
                    } else {
                        currentWidth = Math.max(currentWidth - 15, 50);
                    }
                    lbImg.style.width = currentWidth + '%';
                    lbImg.style.cursor = currentWidth > 95 ? 'zoom-out' : 'zoom-in';
                    lightboxZoomed = currentWidth > 95;
                }
            }, { passive: false });
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var lightbox = document.getElementById('book-lightbox');
            if (lightbox && lightbox.style.display === 'block') {
                closeBookLightbox();
            }
        }
    });