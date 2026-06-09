const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------------------------------------------------------------
// Parole Transmise — configuration produit unique
// Cette boutique ne vend QUE « La Parole Transmise — Lumières d'Israël ».
// Toute autre référence est rejetée par isParoleTransmise() ci-dessous.
// ---------------------------------------------------------------------------
const PT_PRICE_ID        = 'price_1TBx07LLfYKjr3rUGkvFpLOf';
const PT_LEGACY_PRICE_ID = 'price_1Scn6GL4ecjfMIxOPxaM9FMl';
const PT_PRODUCT_KEY     = 'lumieres';
const PT_PRODUCT_NAME    = "La Parole Transmise - Lumières d'Israël";

function isParoleTransmise(item) {
  if (!item) return false;
  return (
    item.priceId   === PT_PRICE_ID        ||
    item.priceId   === PT_LEGACY_PRICE_ID ||
    item.id        === PT_PRODUCT_KEY     ||
    item.productId === PT_PRODUCT_KEY     ||
    item.name      === PT_PRODUCT_NAME
  );
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Content-Type': 'application/json'
  };

  // PROBLÈME 1 - Accepter les requêtes GET pour éviter 405 en local
  if (event.httpMethod === 'GET') {
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'OK' }) };
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { items, customerInfo, relay_name, relay_address, relay_city, relay_id, shipping_method, pickup_store } = body;

    // Vérifier que la clé secrète Stripe est configurée
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY manquante dans les variables d\'environnement');
    }

    // Validation stricte : cette boutique ne vend QUE « La Parole Transmise ».
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Panier vide : aucun article reçu.');
    }
    for (const item of items) {
      if (!isParoleTransmise(item)) {
        throw new Error('Produit non autorisé : cette boutique ne vend que La Parole Transmise');
      }
    }

    // Poids total estimé (metadata only) : ~1 kg par article
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalWeight = totalItems * 1.0;

    // Line items Stripe : toujours le price ID PT, peu importe ce que le client envoie.
    const lineItems = items.map(item => ({
      price: PT_PRICE_ID,
      quantity: item.quantity || 1
    }));

    const shippingMethod = body.shipping_method || 'colissimo';

    const optionCollect = {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 0,
          currency: 'eur'
        },
        display_name: 'Click & Collect — Blush Général Store (Lyon 6e)',
        delivery_estimate: {
          minimum: { unit: 'hour', value: 2 },
          maximum: { unit: 'hour', value: 4 }
        }
      }
    };

    const optionMR = {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 490,
          currency: 'eur'
        },
        display_name: 'Mondial Relay (Point Relais)',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 3 },
          maximum: { unit: 'business_day', value: 5 }
        }
      }
    };

    const optionColissimo = {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: 790,
          currency: 'eur'
        },
        display_name: 'Colissimo (Domicile)',
        delivery_estimate: {
          minimum: { unit: 'business_day', value: 2 },
          maximum: { unit: 'business_day', value: 3 }
        }
      }
    };

    let shippingOptions;
    if (shippingMethod.includes('collect')) {
      shippingOptions = [optionCollect, optionColissimo, optionMR];
    } else if (shippingMethod.includes('relay') ||
      shippingMethod.includes('mondial')) {
      shippingOptions = [optionMR, optionColissimo, optionCollect];
    } else {
      shippingOptions = [optionColissimo, optionMR, optionCollect];
    }

    // Créer session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: { allowed_countries: ['FR'] },
      shipping_options: shippingOptions,
      success_url: `${process.env.URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/#boutique`,
      customer_email: customerInfo.email,
      metadata: {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address || '',
        customer_city: customerInfo.city || '',
        customer_zip: customerInfo.postal || customerInfo.zip || '',
        relay_name: relay_name || '',
        relay_address: relay_address || '',
        relay_city: relay_city || '',
        relay_id: relay_id || '',
        shipping_method: shipping_method || 'colissimo',
        pickup_store: pickup_store || '',
        total_weight: totalWeight.toFixed(2)
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id })
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
