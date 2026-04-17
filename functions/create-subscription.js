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

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { priceId, customerEmail } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: customerEmail || undefined,
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: `${process.env.SITE_URL}/pages/shop.html?subscribed=true`,
      cancel_url: `${process.env.SITE_URL}/pages/shop.html`,
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
    console.error('Stripe subscription error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
