const PRODUCTS = [
  {
    id: 'bts-coastal-set',
    name: 'BTS Coastal Set',
    description: 'Signature coastal athleisure set',
    price: 68,
    priceId: 'price_1TN3PPKFMunmF2aHtOS1xt7r',
    category: 'athleisure',
    image: '/assets/images/placeholders/placeholder-bts-coastal-set.svg',
    mode: 'payment',
    supplier: 'printful'
  },
  {
    id: 'bts-coastal-hoodie',
    name: 'BTS Coastal Hoodie',
    description: 'Premium coastal hoodie',
    price: 72,
    priceId: 'PLACEHOLDER',
    category: 'athleisure',
    image: '/assets/images/placeholders/placeholder-bts-coastal-hoodie.svg',
    mode: 'payment',
    supplier: 'printful'
  },
  {
    id: 'bts-collagen-plus',
    name: 'BTS Collagen+',
    description: 'Vanilla Sea Salt collagen supplement',
    price: 54,
    priceId: 'price_1TN3QQKFMunmF2aHgM9VNIvk',
    category: 'nutrition',
    image: '/assets/images/placeholders/placeholder-bts-collagen-plus.svg',
    mode: 'payment',
    supplier: 'supliful'
  },
  {
    id: 'bts-protein',
    name: 'BTS Protein',
    description: 'Clean coastal protein powder',
    price: 58,
    priceId: 'PLACEHOLDER',
    category: 'nutrition',
    image: '/assets/images/placeholders/placeholder-bts-protein.svg',
    mode: 'payment',
    supplier: 'supliful'
  },
  {
    id: 'sea-glow-serum',
    name: 'Sea Glow Serum',
    description: 'Vitamin C + SPF face serum',
    price: 42,
    priceId: 'PLACEHOLDER',
    category: 'skincare',
    image: '/assets/images/placeholders/placeholder-sea-glow-serum.svg',
    mode: 'payment',
    supplier: 'blanka'
  },
  {
    id: 'bts-body-butter',
    name: 'BTS Body Butter',
    description: 'Coastal hydrating body butter',
    price: 36,
    priceId: 'PLACEHOLDER',
    category: 'skincare',
    image: '/assets/images/placeholders/placeholder-bts-body-butter.svg',
    mode: 'payment',
    supplier: 'blanka'
  },
  {
    id: 'driftwood-sea-candle',
    name: 'Driftwood & Sea Candle',
    description: '8oz hand-poured coastal candle',
    price: 36,
    priceId: 'PLACEHOLDER',
    category: 'candles',
    image: '/assets/images/placeholders/placeholder-driftwood-sea-candle.svg',
    mode: 'payment',
    supplier: 'faire'
  },
  {
    id: 'bts-morning-blend',
    name: 'BTS Morning Blend',
    description: 'Signature coastal roast coffee',
    price: 28,
    priceId: 'PLACEHOLDER',
    category: 'coffee',
    image: '/assets/images/placeholders/placeholder-bts-morning-blend.svg',
    mode: 'payment',
    supplier: 'dripshipper'
  },
  {
    id: 'bts-one-piece',
    name: 'BTS One-Piece',
    description: 'Signature coastal swimwear',
    price: 88,
    priceId: 'PLACEHOLDER',
    category: 'swimwear',
    image: '/assets/images/placeholders/placeholder-bts-one-piece.svg',
    mode: 'payment',
    supplier: 'contrado'
  },
  {
    id: 'blues-coastal-kit',
    name: "Blue's Coastal Kit",
    description: 'Bandana, leash, and accessories',
    price: 38,
    priceId: 'PLACEHOLDER',
    category: 'blue',
    image: '/assets/images/placeholders/placeholder-blues-coastal-kit.svg',
    mode: 'payment',
    supplier: 'printify'
  },
  {
    id: 'blues-joint-coat-chews',
    name: 'Joint & Coat Chews',
    description: "Blue's daily supplement chews",
    price: 42,
    priceId: 'PLACEHOLDER',
    category: 'blue',
    image: '/assets/images/placeholders/placeholder-blues-joint-coat-chews.svg',
    mode: 'payment',
    supplier: 'supliful'
  },
  {
    id: 'cbts-monthly-box',
    name: 'C-BTS Monthly Box',
    description: 'Monthly curated drops, merch & exclusives',
    price: 49,
    priceId: 'price_1TN3R2KFMunmF2aHWYi1EbIo',
    category: 'membership',
    image: '/assets/images/placeholders/placeholder-cbts-monthly-box.svg',
    mode: 'subscription',
    supplier: 'internal'
  },
  {
    id: 'body-glow-pack',
    name: 'Body & Glow Pack',
    description: 'Skincare + nutrition + candle bundle',
    price: 89,
    priceId: 'PLACEHOLDER',
    category: 'carepack',
    image: '/assets/images/placeholders/placeholder-body-glow-pack.svg',
    mode: 'payment',
    supplier: 'internal'
  },
  {
    id: 'coastal-wellness-pack',
    name: 'Coastal Wellness Pack',
    description: 'Collagen + greens + electrolytes + coffee',
    price: 112,
    priceId: 'PLACEHOLDER',
    category: 'carepack',
    image: '/assets/images/placeholders/placeholder-coastal-wellness-pack.svg',
    mode: 'payment',
    supplier: 'internal'
  },
  {
    id: 'blues-gift-pack',
    name: "Blue's Gift Pack",
    description: 'Bandana + chews + treats bundle',
    price: 64,
    priceId: 'PLACEHOLDER',
    category: 'carepack',
    image: '/assets/images/placeholders/placeholder-blues-gift-pack.svg',
    mode: 'payment',
    supplier: 'printify'
  }
];

export function getProduct(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

export function getProductsByCategory(cat) {
  return PRODUCTS.filter(p => p.category === cat);
}

export function getAllProducts() {
  return PRODUCTS;
}

export default PRODUCTS;
