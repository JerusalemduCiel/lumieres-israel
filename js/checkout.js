/* ==========================================================================
   checkout.js - Modale Mon parcours + fermetures
   Extrait depuis index.html (phase 1 d'optimisation)
   ========================================================================== */

        // ========== DÉBOGAGE MODALE PARCOURS ==========
        console.log('=== DÉBOGAGE MODALE PARCOURS ===');
        
        // Vérifier que les éléments existent
        const storyFull = document.getElementById('story-full');
        console.log('Modale trouvée (story-full) :', storyFull);
        
        const btnLireSuite = document.querySelector('.lien-voir-plus');
        console.log('Bouton "voir plus" trouvé :', btnLireSuite);
        
        const btnCloseModal = storyFull?.querySelector('.close-story');
        console.log('Bouton fermeture trouvé (.close-story) :', btnCloseModal);
        
        // Test direct de fermeture - Vérification avant utilisation
        let closeStory = document.querySelector('.close-story');
        if (closeStory) {
            // Utiliser closeStory si trouvé globalement
            if (!btnCloseModal && closeStory) {
                closeStory.addEventListener('click', function(e) {
                    console.log('CLIC SUR LA CROIX DÉTECTÉ !');
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const modal = document.getElementById('story-full');
                    if (modal) {
                        console.log('Tentative de fermeture...');
                        modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        console.log('Modale fermée !');
                    }
                });
            }
        }
        
        if (btnCloseModal) {
            btnCloseModal.addEventListener('click', function(e) {
                console.log('CLIC SUR LA CROIX DÉTECTÉ !');
                e.preventDefault();
                e.stopPropagation();
                
                const modal = document.getElementById('story-full');
                if (modal) {
                    console.log('Tentative de fermeture...');
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    console.log('Modale fermée !');
                } else {
                    console.error('ERREUR : story-full introuvable lors de la fermeture');
                }
            });
            console.log('✅ Event listener ajouté sur la croix');
        } else {
            console.error('❌ ERREUR : Bouton de fermeture (.close-story) introuvable !');
            console.log('Vérification de la structure HTML...');
            if (storyFull) {
                console.log('Contenu de story-full :', storyFull.innerHTML.substring(0, 200));
            }
        }
        
        console.log('=== FIN DÉBOGAGE ===');
        
        // ========== MODALE PARCOURS - Gestion ouverture/fermeture ==========
        
        // Fonction pour ouvrir la modale
        function openStoryModal() {
            if (storyFull) {
                // Retirer la classe de fermeture
                storyFull.classList.remove('modal-fermee');
                // Ajouter la classe d'ouverture
                storyFull.classList.add('modal-ouverte');
                
                // FORCER le display flex avec !important
                storyFull.style.setProperty('display', 'flex', 'important');
                document.body.style.setProperty('overflow', 'hidden', 'important');
                console.log('Modale ouverte');
            }
        }
        
        // Fonction pour fermer la modale
        function closeStoryModal() {
            if (storyFull) {
                // FORCER le display none avec !important
                storyFull.style.setProperty('display', 'none', 'important');
                
                // AJOUTER une classe de fermeture
                storyFull.classList.add('modal-fermee');
                storyFull.classList.remove('modal-ouverte');
                
                // Réactiver le scroll avec !important
                document.body.style.setProperty('overflow', 'auto', 'important');
                console.log('Modale fermée');
            }
        }
        
        // Ouverture de la modale
        if (btnLireSuite && storyFull) {
            btnLireSuite.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openStoryModal();
            });
        }
        
        // Fermeture via le bouton [X] - Utiliser la délégation d'événements
        // Réutiliser la variable closeStory déjà déclarée plus haut (ligne 3421)
        if (!closeStory) {
            closeStory = document.querySelector('.close-story');
        }
        if (closeStory) {
            // Vérifier que l'event listener n'est pas déjà ajouté
            const hasListener = closeStory.getAttribute('data-listener-added');
            if (!hasListener) {
                closeStory.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeStoryModal();
                    return;
                });
                closeStory.setAttribute('data-listener-added', 'true');
            }
        }
        
        if (storyFull) {
            storyFull.addEventListener('click', function(e) {
                // Si on clique sur le bouton de fermeture
                if (e.target.classList.contains('close-story') || e.target.closest('.close-story')) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeStoryModal();
                    return;
                }
                
                // Si on clique sur le fond sombre (overlay), pas sur le contenu
                if (e.target === storyFull) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeStoryModal();
                }
            });
            
            // Empêcher la fermeture quand on clique dans le contenu
            const storyModal = storyFull.querySelector('.story-modal');
            if (storyModal) {
                storyModal.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            }
        }
        
        // Fermeture avec la touche Échap
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && storyFull && storyFull.style.display === 'flex') {
                closeStoryModal();
            }
        });

        // Bouton vidéo philosophie
        const btnLoadVideo = document.querySelector('.btn-load-video');
        const videoFrame = document.getElementById('philosophy-video-frame');

        if (btnLoadVideo && videoFrame) {
            btnLoadVideo.addEventListener('click', function() {
                const videoId = this.getAttribute('data-video-id');
                const wrapper = this.closest('.video-wrapper');
                const previewContent = wrapper.querySelector('.video-preview-content');
                const overlay = wrapper.querySelector('.video-overlay');
                
                // Cacher contenu de prévisualisation, overlay et bouton
                if (previewContent) previewContent.style.display = 'none';
                if (overlay) overlay.style.display = 'none';
                this.style.display = 'none';
                
                // Afficher et lancer la vidéo
                videoFrame.style.display = 'block';
                videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            });
        }

        // Effet hover sur cartes inspirations
        const inspirationCards = document.querySelectorAll('.inspiration-card');
        inspirationCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });

/* ---- Fonction de fermeture simple et directe (modale Mon parcours) ---- */
        // Fonction de fermeture simple et directe
        function fermerModaleParcours() {
            console.log('fermerModaleParcours() appelée');
            
            // Chercher la modale par plusieurs méthodes
            const modal = document.getElementById('story-full') ||
                          document.querySelector('.story-modal-overlay') ||
                          document.querySelector('[id="story-full"]');
            
            if (modal) {
                console.log('Modale trouvée, fermeture FORCÉE...');
                
                // FORCER le display none avec !important
                modal.style.setProperty('display', 'none', 'important');
                
                // AJOUTER une classe de fermeture
                modal.classList.add('modal-fermee');
                modal.classList.remove('modal-ouverte');
                
                // Réactiver le scroll avec !important
                document.body.style.setProperty('overflow', 'auto', 'important');
                
                console.log('Modale fermée avec succès (forcé)');
            } else {
                console.error('ERREUR : Modale introuvable !');
                // Essai de forcer la fermeture de toutes les modales
                document.querySelectorAll('.story-modal-overlay, [id*="story"]').forEach(m => {
                    m.style.setProperty('display', 'none', 'important');
                    m.classList.add('modal-fermee');
                    m.classList.remove('modal-ouverte');
                });
                document.body.style.setProperty('overflow', 'auto', 'important');
            }
        }
        
        // Fermeture avec Échap (backup)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('story-full');
                if (modal && (modal.classList.contains('modal-ouverte') || modal.style.display === 'flex')) {
                    fermerModaleParcours();
                }
            }
        });
        
        // Fermeture en cliquant sur le fond (backup)
        document.addEventListener('click', function(e) {
            const modal = document.getElementById('story-full');
            if (modal && e.target === modal && (modal.classList.contains('modal-ouverte') || modal.style.display === 'flex')) {
                fermerModaleParcours();
            }
        });