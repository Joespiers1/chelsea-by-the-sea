const Stripe = require('stripe');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items, mode } = JSON.parse(event.body);

    if (!items || !items.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No items provided' })
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: mode || 'payment',
      line_items: items.map(item => ({
        price: item.priceId,
        quantity: item.quantity || 1
      })),
      success_url: `${process.env.SITE_URL}/pages/shop.html?success=true`,
      cancel_url: `${process.env.SITE_URL}/pages/shop.html?cancelled=true`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },
      metadata: {
        source: 'chelseabts.com'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
