'use strict';

/**
 * @typedef {{
 *   title: string,
 *   image: string|null,
 *   url: string,
 *   price: string|null,
 *   currency: string
 * }} ProductInfo
 */

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'extractProductInfo') {
    sendResponse(extractProductInfo());
  }
  return true;
});

/** @returns {ProductInfo} */
function extractProductInfo() {
  const title =
    getMeta('og:title') ||
    getMeta('twitter:title') ||
    document.title ||
    '';

  const image =
    getMeta('og:image') ||
    getMeta('twitter:image') ||
    getMeta('product:image') ||
    getFirstLargeImage();

  const url = window.location.href;
  const price = getMetaPrice() || getJsonLdPrice() || getDomPrice();
  const currency = detectCurrency();

  return { title, image, url, price, currency };
}

/**
 * @param {string} property
 * @returns {string|null}
 */
function getMeta(property) {
  const el = document.querySelector(
    `meta[property="${property}"], meta[name="${property}"]`
  );
  return el?.getAttribute('content') || null;
}

/** @returns {string|null} */
function getMetaPrice() {
  return (
    getMeta('og:price:amount') ||
    getMeta('product:price:amount')
  );
}

/** @returns {string|null} */
function getJsonLdPrice() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = /** @type {unknown} */ (JSON.parse(script.textContent || ''));
      const price = findPrice(data);
      if (price) return price;
    } catch {
      // ignore parse errors
    }
  }
  return null;
}

/**
 * @param {unknown} obj
 * @returns {string|null}
 */
function findPrice(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const o = /** @type {Record<string, unknown>} */ (obj);

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const p = findPrice(item);
      if (p) return p;
    }
    return null;
  }

  // offers.price (single offer)
  const offers = o['offers'];
  if (offers && typeof offers === 'object' && !Array.isArray(offers)) {
    const single = /** @type {Record<string, unknown>} */ (offers);
    if (single['price'] !== undefined) return String(single['price']);
  }
  // offers[0].price (array of offers)
  if (Array.isArray(offers) && offers.length > 0) {
    const first = /** @type {Record<string, unknown>} */ (offers[0]);
    if (first['price'] !== undefined) return String(first['price']);
  }
  // top-level price
  if (o['price'] !== undefined) return String(o['price']);

  // recurse into @graph
  if (Array.isArray(o['@graph'])) {
    for (const item of o['@graph']) {
      const p = findPrice(item);
      if (p) return p;
    }
  }
  return null;
}

/** @returns {string|null} */
function getDomPrice() {
  /** @type {string[]} */
  const selectors = [
    '[class*="total-price"]',
    '[class*="sale_price"]',
    '[class*="price_sell"]',
    '[class*="finalPrice"]',
    '[class*="salePrice"]',
    '.prod-sale-price',
    '.product-price',
    '#totalPrice',
    '[data-price]',
    '[class*="price"][class*="final"]',
    '[class*="price"][class*="sale"]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const text = el.getAttribute('data-price') || el.textContent || '';
    const digits = text.replace(/[^\d]/g, '');
    if (digits.length >= 3 && parseInt(digits, 10) >= 100) {
      return digits;
    }
  }
  return null;
}

/** @returns {string|null} */
function getFirstLargeImage() {
  const imgs = document.querySelectorAll('img');
  for (const img of imgs) {
    if (img.naturalWidth > 200 && img.naturalHeight > 200 && img.src.startsWith('http')) {
      return img.src;
    }
  }
  return null;
}

/** @returns {string} */
function detectCurrency() {
  const text = document.body?.innerText?.slice(0, 5000) || '';
  if (text.includes('₩') || text.includes('원')) return 'KRW';
  if (text.includes('$')) return 'USD';
  if (text.includes('€')) return 'EUR';
  if (text.includes('¥') || text.includes('円')) return 'JPY';
  return 'KRW';
}
