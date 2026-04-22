/* ==========================================================================
   cart-stripe.js - Panier + Stripe + Checkout + Mondial Relay
   Extrait depuis index.html (phase 1 d'optimisation)
   ========================================================================== */

    // NETTOYAGE - À retirer après test
    localStorage.removeItem('cart');
    console.log('Panier nettoyé');
    
    // Panier minimal - Tout en vanilla JavaScript
    let cart = [];
    
    // Produits avec priceId Stripe
    // IMPORTANT: Les clés DOIVENT correspondre exactement aux productId utilisés dans addToCart()
    const products = {
        jdc: {
            id: 'jdc',
            name: 'Jérusalem du Ciel',
            price: 39.90,
            priceId: 'price_1SBf5wL4ecjfMIxOm0nbZ5sp',
            image: './images/jdc_picto_arrondi.png',
            available: false
        },
        moh: {
            id: 'moh',
            name: 'Minhag ou Halakha',
            price: 19.90,
            priceId: 'price_1SBf6vL4ecjfMIxOYXAbWfh8',
            image: './images/moh_picto_arrondi.png',
            available: true
        },
        poz: {
            id: 'poz',
            name: 'Poztamitsvah',
            price: 19.90,
            priceId: 'price_1SBf7lL4ecjfMIxOKuRj4czs',
            image: './images/poz_picto_arrondi.png',
            available: false
        },
        lumieres: {
            id: 'lumieres',
            name: 'La Parole Transmise - Lumières d\'Israël',
            price: 39.90,
            priceId: 'price_1Scn6GL4ecjfMIxOPxaM9FMl', // TODO: mettre à jour le priceId Stripe pour 39.90€
            image: './images/mockup_boite_serie1_recto.png',
            available: true
        },
        pack: {
            id: 'pack',
            name: 'Pack Complet Ora Shel Torah',
            price: 79.90,
            priceId: null, // TODO: Ajouter le priceId Stripe pour le pack
            image: './images/pack-3d.png'
        }
    };
    
    // Poids des produits (en kg) - À AJUSTER selon pesée réelle
    const productWeights = {
        'jdc': 2.8,    // Jérusalem du Ciel : 850 cartes + plateau circulaire
        'moh': 0.7,    // Minhag ou Halakha : 330 cartes
        'poz': 0.6,    // Poztamitsvah : 220 cartes
        'pack': 4.0    // Pack complet
    };
    
    function calculateShipping(cart) {
        const price = 7.90;
        const label = 'Livraison Colissimo : 7,90 €';
        return { price, label, weight: 0 };
    }
    
    // Charger le panier depuis localStorage
    try {
        const saved = localStorage.getItem('cart');
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        cart = [];
    }
    
    // Fonction pour ouvrir/fermer le panier
    function toggleCart() {
        const panel = document.getElementById('cart-panel');
        console.log('Panel trouvé:', panel);
        
        if (!panel) {
            console.error('ERREUR: cart-panel introuvable');
            return;
        }
        
        const isOpen = panel.classList.toggle('open');
        console.log('Panier ouvert:', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }
    
    // Fonction pour fermer le panier
    function closeCart() {
        const panel = document.getElementById('cart-panel');
        if (panel) {
            panel.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
    
    // Formater le prix
    function formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }
    
    // Mettre à jour l'affichage du panier
    function updateCartDisplay() {
        // Compteur
        const count = document.querySelector('.cart-count');
        if (count) {
            const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            count.textContent = total;
            if (total > 0) {
                count.style.display = 'flex';
            } else {
                count.style.display = 'none';
            }
        }
        
        // Articles dans le panier
        const itemsDiv = document.querySelector('.cart-items');
        if (!itemsDiv) return;
        
        if (cart.length === 0) {
            itemsDiv.innerHTML = '<p class="cart-empty">Votre panier est vide</p>';
            const totalEl = document.getElementById('cart-total');
            if (totalEl) totalEl.textContent = '0€';
            return;
        }
        
        itemsDiv.innerHTML = cart.map(item => `
            <div class="cart-item" data-product="${item.id || ''}">
                ${item.image ? `<img src="${item.image}" alt="${item.name || ''}" loading="lazy">` : ''}
                <div class="cart-item-details">
                    <h4>${item.name || 'Produit'}</h4>
                    <p>${formatPrice(item.price || 0)}</p>
                    <div class="cart-item-quantity">
                        <button onclick="updateQuantity('${item.id}', ${Math.max(1, (item.quantity || 1) - 1)})">-</button>
                        <span>${item.quantity || 1}</span>
                        <button onclick="updateQuantity('${item.id}', ${(item.quantity || 1) + 1})">+</button>
                    </div>
                </div>
                <div class="item-price">${formatPrice((item.price || 0) * (item.quantity || 1))}</div>
                <button onclick="removeFromCart('${item.id}')" title="Supprimer">×</button>
            </div>
        `).join('');
        
        updateCartTotal();
    }
    
    // Mettre à jour le total
    function updateCartTotal() {
        const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
        // Total = subtotal uniquement (frais de port calculés par Stripe)
        const total = subtotal;
        
        // Mettre à jour le total dans cart-panel
        const totalEl = document.getElementById('cart-total');
        if (totalEl) {
            totalEl.textContent = formatPrice(total);
            
            // Ajouter la mention discrète sous le total si elle n'existe pas déjà
            if (!document.querySelector('.shipping-notice')) {
                const notice = document.createElement('p');
                notice.className = 'shipping-notice';
                notice.style.cssText = 'font-size:0.8rem; color:#888; text-align:center; margin:5px 0';
                notice.textContent = '🚚 Frais de port calculés à la commande';
                totalEl.parentElement.appendChild(notice);
            }
        }
        
        // Mettre à jour aussi les totaux dans l'ancien panier (si présent)
        const subtotalEl = document.querySelector('.subtotal-amount');
        const shippingEl = document.querySelector('.shipping-amount');
        const oldTotalEl = document.querySelector('.total-amount');
        
        // Masquer la ligne frais de port si elle existe
        if (shippingEl) {
            const shippingRow = shippingEl.closest('.shipping-row, .summary-line');
            if (shippingRow) {
                shippingRow.style.display = 'none';
            } else {
                shippingEl.style.display = 'none';
            }
        }
        
        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        if (oldTotalEl) oldTotalEl.textContent = formatPrice(total);
    }
    
    // Notification d'ajout au panier
    function showCartNotification(productName) {
        const existing = document.querySelectorAll('.cart-notification');
        existing.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                ✓ ${productName} ajouté au panier
                <button onclick="toggleCart()">Voir le panier</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Ajouter au panier
    function addToCart(productId, productName, price, image) {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Trouver le produit directement par sa clé (simplifié)
        const product = products[productId];
        const priceId = product ? product.priceId : null;
        
        // Vérifier si le produit est disponible
        if (product && product.available === false) {
            alert('Ce produit n\'est pas encore disponible. Sortie prévue : Printemps 2026.\n\nUtilisez le bouton "Me prévenir" pour être informé de sa disponibilité.');
            return;
        }
        
        // DEBUG: Log pour vérifier la correspondance
        console.log('Adding to cart:', { productId, product, priceId });
        
        // Vérifier que le priceId existe (sauf pour le pack qui peut être géré différemment)
        if (!priceId && productId !== 'pack') {
            alert('Erreur: priceId manquant pour ' + productName + '\n\nLe produit n\'a pas été ajouté au panier.');
            console.error('Produit sans priceId:', { productId, productName, product });
            return;
        }
        
        // Avertir pour le pack (mais permettre l'ajout)
        if (!priceId && productId === 'pack') {
            console.warn('Pack ajouté sans priceId Stripe - Le checkout ne fonctionnera pas pour le pack');
        }
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
            // Mettre à jour le priceId si nécessaire
            if (!existingItem.priceId && priceId) {
                existingItem.priceId = priceId;
            }
        } else {
            cart.push({ 
                id: productId, 
                name: productName, 
                price: parseFloat(price), 
                priceId: priceId,
                image: image || '', 
                quantity: 1 
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showCartNotification(productName);
    }
    
    // Retirer du panier
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
    
    // Mettre à jour la quantité
    function updateQuantity(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            const newQuantity = Math.max(1, parseInt(quantity) || 1);
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
    
    // Fonction pour continuer les achats depuis le panier
    function continueShoppingFromCart() {
        toggleCart(); // Fermer le panier
        const boutiqueSection = document.getElementById('boutique');
        if (boutiqueSection) {
            boutiqueSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Fonction pour passer commande
    function proceedToCheckout() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            alert('Votre panier est vide');
            return;
        }
        
        // Afficher la modal
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
        
        // Remplir les items
        const itemsDiv = document.getElementById('checkout-items');
        if (itemsDiv) {
            itemsDiv.innerHTML = cart.map(item => `
                <div class="checkout-item">
                    <img src="${item.image || ''}" alt="${item.name || 'Produit'}" loading="lazy">
                    <div class="item-details">
                        <h4>${item.name || 'Produit'}</h4>
                        <p>Quantité: ${item.quantity || 1}</p>
                    </div>
                    <div class="item-price">${formatPrice((item.price || 0) * (item.quantity || 1))}</div>
                </div>
            `).join('');
        }
        
        // Calculer totaux
        const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
        const total = subtotal;
        
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
        if (shippingEl) {
            shippingEl.textContent = 'Frais de port : selon le mode de livraison choisi ci-dessous';
        }
        if (totalEl) totalEl.textContent = formatPrice(total);
        setTimeout(updateMRWidgetVisibility, 300);
    }

    $(document).ready(function() {
      window.initMRWidget = function(codePostal) {
        $("#Zone_Widget").MR_ParcelShopPicker({
          Target: "#SelectedRelay",
          Brand: "CC23VA2Y",
          Country: "FR",
          PostCode: codePostal,
          ColLivMod: "24R",
          NbResults: "7",
          OnParcelShopSelected: function(data) {
            window.selectedRelay = data;
            document.getElementById('confirm-relay-btn').style.display = 'block';
            document.getElementById('mr-widget-container')
              .querySelector('p').innerHTML =
              '✅ Point relais sélectionné : <strong>' +
              data.Nom + ' — ' + data.Adresse1 +
              ', ' + data.CP + ' ' + data.Ville + '</strong>';
          }
        });
      };
    });

    function isMondialRelaySelected() {
      const selectedInput = document.querySelector('input[name="shipping-method"]:checked, input[name="delivery-method"]:checked');
      const selectedSelect = document.querySelector('select[name="shipping-method"], select[name="delivery-method"]');
      const selectedValue = ((selectedInput && selectedInput.value) || (selectedSelect && selectedSelect.value) || '').toLowerCase();
      return selectedValue.includes('mondial') || selectedValue.includes('relay') || selectedValue.includes('24r');
    }

    function updateMRWidgetVisibility() {
      const postalInput = document.getElementById('postal') || document.getElementById('customer-zip');
      const container = document.getElementById('mr-widget-container');
      if (!postalInput || !container) return;

      const codePostal = (postalInput.value || '').trim();
      if (codePostal && isMondialRelaySelected()) {
        container.style.display = 'block';
        const confirmRelayBtn = document.getElementById('confirm-relay-btn');
        if (confirmRelayBtn) {
          confirmRelayBtn.style.display = 'none';
        }
        initMRWidget(codePostal);
      } else {
        container.style.display = 'none';
      }
    }
    
    // Fonction pour fermer la modal de checkout
    function closeCheckout() {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // Gérer la soumission du formulaire de checkout
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM chargé');
        const panel = document.getElementById('cart-panel');
        console.log('Panel existe:', !!panel);
        
        updateCartDisplay();
        
        // Event listener pour l'icône panier
        const cartIcon = document.querySelector('.cart-icon');
        
        if (cartIcon) {
            console.log('Icon panier trouvée, ajout listener');
            
            // Retirer onclick si conflit
            cartIcon.removeAttribute('onclick');
            
            // Ajouter listener
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Click sur icône panier');
                toggleCart();
            });
        } else {
            console.error('Icône panier introuvable');
        }
        
        // Gérer la soumission du formulaire de checkout
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            const postalInput = document.getElementById('postal') || document.getElementById('customer-zip');
            if (postalInput) {
                postalInput.addEventListener('input', updateMRWidgetVisibility);
                postalInput.addEventListener('change', updateMRWidgetVisibility);
            }
            document.querySelectorAll('input[name="shipping-method"], input[name="delivery-method"], select[name="shipping-method"], select[name="delivery-method"]').forEach((el) => {
                el.addEventListener('change', updateMRWidgetVisibility);
            });
            document.querySelectorAll('input[name="shipping-method"]').forEach((el) => {
                el.addEventListener('change', () => updateMRWidgetVisibility());
            });
            document.querySelectorAll('input[name="shipping-method"]')
              .forEach(radio => {
                radio.addEventListener('change', function() {
                  const selector = document.getElementById(
                    'collect-store-selector');
                  if (selector) {
                    selector.style.display =
                      this.value === 'collect' ? 'block' : 'none';
                  }
                });
              });
            const confirmRelayBtn = document.getElementById('confirm-relay-btn');
            if (confirmRelayBtn) {
                confirmRelayBtn.addEventListener('click', function() {
                    if (!window.selectedRelay) return;
                    const container = document.getElementById('mr-widget-container');
                    if (!container) return;
                    const widgetZone = document.getElementById('Zone_Widget');
                    if (widgetZone) widgetZone.style.display = 'none';
                    confirmRelayBtn.style.display = 'none';
                    container.querySelector('p').innerHTML =
                        '✅ Point relais sélectionné : <strong>' +
                        window.selectedRelay.Nom + ' — ' + window.selectedRelay.Adresse1 +
                        ', ' + window.selectedRelay.CP + ' ' + window.selectedRelay.Ville + '</strong>';
                });
            }

            // Pré-remplissage automatique en dev uniquement
            if (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1') {
                const devData = {
                    'customer-name': 'Michael Lumbroso',
                    'customer-email': 'mlumbroso68@gmail.com',
                    'customer-phone': '0618061000',
                    'customer-address': '27 boulevard des belges',
                    'customer-city': 'Lyon',
                    'customer-zip': '69006',
                    'customer-country': 'FR'
                };
                Object.entries(devData).forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (el) el.value = val;
                });
            }
            checkoutForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                // Calculer frais de port (sera recalculé côté serveur, mais on l'utilise pour vérification)
                const shippingInfo = calculateShipping(cart);
                
                // Vérifier que tous les produits ont un priceId
                const itemsWithoutPriceId = cart.filter(item => !item.priceId);
                if (itemsWithoutPriceId.length > 0) {
                    console.error('Produits sans priceId:', itemsWithoutPriceId);
                    alert('Erreur : Certains produits n\'ont pas de priceId Stripe. Veuillez réessayer.');
                    return;
                }
                
                // Préparer les données pour Stripe (format simplifié)
                const checkoutData = {
                    items: cart.map(item => ({
                        priceId: item.priceId,
                        quantity: item.quantity || 1
                    })),
                    customerInfo: {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        address: formData.get('address'),
                        city: formData.get('city'),
                        postal: formData.get('postal'),
                        country: formData.get('country')
                    },
                    relay_name: window.selectedRelay?.Nom || '',
                    relay_address: window.selectedRelay?.Adresse1 || '',
                    relay_city: window.selectedRelay?.Ville || '',
                    relay_id: window.selectedRelay?.ID || '',
                    shipping_method: document.querySelector(
                      'input[name="shipping-method"]:checked')?.value || 'colissimo',
                    pickup_store: document.getElementById('pickup-store')?.value || ''
                };
                
                console.log('Données envoyées à Stripe:', checkoutData);
                
                try {
                    // Afficher un loader
                    const submitBtn = e.target.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Traitement...';
                    
                    // Appel à la fonction Netlify
                    const response = await fetch('/.netlify/functions/create-checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(checkoutData)
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Response error:', errorText);
                        let errorData;
                        try {
                            errorData = JSON.parse(errorText);
                        } catch (e) {
                            errorData = { error: errorText };
                        }
                        throw new Error(errorData.error || `Erreur serveur: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('Réponse Netlify:', data);
                    
                    if (!data.sessionId) {
                        throw new Error('Session ID manquant dans la réponse');
                    }
                    
                    // Redirection Stripe
                    const stripe = Stripe('pk_live_51SBeyrLLfYKjr3rUDC9XHZw0mEQPPnQnR7bWnhkec0MqOGh6BfNKm1z9PAHmoT5ozk21RiZI2g4CZYBPb8DP8PZ000gcXNmXeL');
                    await stripe.redirectToCheckout({ sessionId: data.sessionId });
                    
                } catch (error) {
                    console.error('Erreur de paiement:', error);
                    alert(`Erreur: ${error.message || 'Une erreur est survenue. Veuillez réessayer.'}`);
                    
                    // Réactiver le bouton
                    const submitBtn = e.target.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText || 'Payer par carte →';
                    }
                }
            });
        }
        
        // Fermer la modal en cliquant en dehors
        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal) {
            checkoutModal.addEventListener('click', function(e) {
                if (e.target === checkoutModal) {
                    closeCheckout();
                }
            });
        }
    });