// Cart state — stored in memory per session
let cart = [];
let cartListeners = [];

export function addToCart(productId, quantity = 1) {
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  notifyListeners();
  updateCartUI();
}

export function removeFromCart(productId) {
  cart = cart.filter(i => i.productId !== productId);
  notifyListeners();
  updateCartUI();
}

export function getCart() {
  return [...cart];
}

export function getCartCount() {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function clearCart() {
  cart = [];
  notifyListeners();
  updateCartUI();
}

export function onCartChange(fn) {
  cartListeners.push(fn);
}

function notifyListeners() {
  cartListeners.forEach(fn => fn(cart));
}

function updateCartUI() {
  const count = getCartCount();
  const badge = document.getElementById('cart-count-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

export async function checkout(items) {
  const hasPlaceholder = items.some(
    i => !i.priceId || i.priceId.startsWith('PLACEHOLDER')
  );

  if (hasPlaceholder) {
    showComingSoonModal();
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, mode: 'payment' })
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'Checkout failed');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Checkout unavailable right now. Please try again.');
  }
}

export async function subscribe(priceId) {
  if (!priceId || priceId.startsWith('PLACEHOLDER')) {
    showComingSoonModal();
    return;
  }
  try {
    const response = await fetch('/.netlify/functions/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  } catch (err) {
    console.error('Subscription error:', err);
  }
}

function showComingSoonModal() {
  const modal = document.getElementById('shop-coming-soon-modal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    const m = document.createElement('div');
    m.id = 'shop-coming-soon-modal';
    m.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.5);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;
    `;
    m.innerHTML = `
      <div style="
        background:#f7f4ef;padding:40px 48px;max-width:420px;
        text-align:center;border:0.5px solid rgba(30,77,107,0.15);
      ">
        <div style="font-size:10px;letter-spacing:.15em;
          text-transform:uppercase;color:#9dbfb8;margin-bottom:12px;">
          Coming Soon
        </div>
        <div style="font-family:'Playfair Display',serif;
          font-size:26px;font-weight:400;color:#18181a;margin-bottom:12px;">
          Shop launching soon
        </div>
        <p style="font-size:13px;color:#8a9a9a;line-height:1.8;
          margin-bottom:24px;">
          The BTS store is almost ready. Join the newsletter to
          be first to know when products go live.
        </p>
        <button onclick="this.closest('#shop-coming-soon-modal').remove()"
          style="padding:10px 28px;background:#1e4d6b;color:#fff;
          border:none;font-size:11px;letter-spacing:.1em;
          text-transform:uppercase;cursor:pointer;">
          Got it
        </button>
      </div>
    `;
    document.body.appendChild(m);
    m.addEventListener('click', e => {
      if (e.target === m) m.remove();
    });
  }
}
