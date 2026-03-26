'use strict';

/** @type {string} */
const DEFAULT_SERVER = 'https://shopaitry.vercel.app';

/**
 * @typedef {{
 *   title: string,
 *   image: string|null,
 *   url: string,
 *   price: string|null,
 *   currency: string
 * }} ProductInfo
 *
 * @typedef {{ id: number, name: string }} Board
 */

/** @type {ProductInfo|null} */
let productInfo = null;
/** @type {Board[]} */
let boards = [];
/** @type {string} */
let apiKey = '';
/** @type {string} */
let serverUrl = DEFAULT_SERVER;

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * @param {number} tabId
 * @param {{ action: string }} message
 * @returns {Promise<ProductInfo>}
 */
function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (/** @type {ProductInfo} */ response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/** @returns {Promise<void>} */
async function loadSettings() {
  const result = await chrome.storage.sync.get(['apiKey', 'serverUrl']);
  apiKey = /** @type {string} */ (result['apiKey'] || '');
  serverUrl = /** @type {string} */ (result['serverUrl'] || DEFAULT_SERVER);
}

/** @returns {Promise<Board[]>} */
async function fetchBoards() {
  if (!apiKey) return [];
  try {
    const res = await fetch(`${serverUrl}/api/v1/boards`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = /** @type {{ boards: Board[] }} */ (await res.json());
    return data.boards || [];
  } catch {
    return [];
  }
}

/**
 * @param {number|null} boardId
 * @returns {Promise<void>}
 */
async function saveItem(boardId) {
  if (!productInfo) throw new Error('상품 정보가 없어요.');

  const titleEl = /** @type {HTMLInputElement|null} */ (document.getElementById('title-input'));
  const priceEl = /** @type {HTMLInputElement|null} */ (document.getElementById('price-input'));

  const title = titleEl?.value?.trim() || productInfo.title;
  const priceStr = priceEl?.value?.trim() || productInfo.price || '';
  const priceNum = priceStr ? parseInt(priceStr.replace(/[^\d]/g, ''), 10) : null;

  const body = {
    url: productInfo.url,
    title,
    price: (priceNum !== null && !isNaN(priceNum)) ? priceNum : null,
    board_id: boardId || null,
    thumbnail_url: productInfo.image || null,
  };

  const res = await fetch(`${serverUrl}/api/v1/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = /** @type {{ message?: string }} */ (await res.json().catch(() => ({})));
    throw new Error(err.message || `저장 실패 (HTTP ${res.status})`);
  }
}

// ── UI ───────────────────────────────────────────────────────────────

/** @param {string} viewId */
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId)?.classList.add('active');
}

/**
 * @param {string} msg
 * @param {'idle'|'loading'|'error'|'warn'} [type]
 */
function setStatus(msg, type = 'idle') {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = msg;
  el.className = `status status-${type}`;
}

/** @param {ProductInfo} info */
function renderProduct(info) {
  const imgEl = /** @type {HTMLImageElement|null} */ (document.getElementById('product-image'));
  const titleEl = /** @type {HTMLInputElement|null} */ (document.getElementById('title-input'));
  const priceEl = /** @type {HTMLInputElement|null} */ (document.getElementById('price-input'));
  const siteEl = document.getElementById('product-site');

  if (imgEl) {
    if (info.image) {
      imgEl.src = info.image;
      imgEl.style.display = 'block';
      imgEl.onerror = () => { imgEl.style.display = 'none'; };
    } else {
      imgEl.style.display = 'none';
    }
  }
  if (titleEl) titleEl.value = info.title || '';
  if (priceEl && info.price) {
    const num = parseInt(String(info.price).replace(/[^\d]/g, ''), 10);
    if (!isNaN(num)) priceEl.value = num.toLocaleString('ko-KR');
  }
  if (siteEl) {
    try {
      siteEl.textContent = new URL(info.url).hostname;
    } catch {
      siteEl.textContent = '';
    }
  }
}

/** @param {Board[]} boardList */
function renderBoards(boardList) {
  const select = /** @type {HTMLSelectElement|null} */ (document.getElementById('board-select'));
  if (!select) return;
  while (select.options.length > 1) select.remove(1);
  boardList.forEach(board => {
    const opt = document.createElement('option');
    opt.value = String(board.id);
    opt.textContent = board.name;
    select.appendChild(opt);
  });
}

// ── Init ─────────────────────────────────────────────────────────────

async function initMainView() {
  setStatus('상품 정보를 불러오는 중...', 'loading');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    setStatus('탭 정보를 가져올 수 없어요.', 'error');
    return;
  }

  // Extract product info via content.js
  try {
    const info = await sendMessageToTab(tab.id, { action: 'extractProductInfo' });
    if (!info?.url) throw new Error('no info');
    productInfo = info;
    renderProduct(productInfo);
    setStatus('', 'idle');
  } catch {
    // Fallback: use tab's own metadata
    productInfo = {
      title: tab.title || '',
      image: null,
      url: tab.url || '',
      price: null,
      currency: 'KRW',
    };
    renderProduct(productInfo);

    const isChromeInternal = (tab.url || '').startsWith('chrome://') || (tab.url || '').startsWith('chrome-extension://');
    setStatus(
      isChromeInternal
        ? 'Chrome 내부 페이지는 지원하지 않아요.'
        : '일부 정보를 가져오지 못했어요.',
      isChromeInternal ? 'error' : 'warn'
    );
  }

  // Load boards in background
  boards = await fetchBoards();
  renderBoards(boards);
}

async function init() {
  await loadSettings();

  if (!apiKey) {
    showView('settings-view');
    return;
  }

  showView('main-view');
  await initMainView();
}

// ── Event listeners ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  init();

  // Open settings view
  document.getElementById('settings-btn')?.addEventListener('click', () => {
    const keyInput = /** @type {HTMLInputElement|null} */ (document.getElementById('api-key-input'));
    const urlInput = /** @type {HTMLInputElement|null} */ (document.getElementById('server-url-input'));
    if (keyInput) keyInput.value = apiKey;
    if (urlInput) urlInput.value = serverUrl;
    showView('settings-view');
  });

  // Back to main from settings
  document.getElementById('back-btn')?.addEventListener('click', () => {
    if (apiKey) {
      showView('main-view');
    } else {
      setStatus('API 키를 먼저 입력해 주세요.', 'error');
    }
  });

  // Save settings
  document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
    const keyInput = /** @type {HTMLInputElement|null} */ (document.getElementById('api-key-input'));
    const urlInput = /** @type {HTMLInputElement|null} */ (document.getElementById('server-url-input'));
    const newKey = keyInput?.value?.trim() || '';
    const newUrl = urlInput?.value?.trim() || DEFAULT_SERVER;

    await chrome.storage.sync.set({ apiKey: newKey, serverUrl: newUrl });
    apiKey = newKey;
    serverUrl = newUrl;

    if (newKey) {
      showView('main-view');
      await initMainView();
    }
  });

  // Save item
  document.getElementById('save-btn')?.addEventListener('click', async () => {
    const saveBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById('save-btn'));
    const boardSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('board-select'));
    const boardId = boardSelect?.value ? parseInt(boardSelect.value, 10) : null;

    if (!saveBtn) return;
    saveBtn.disabled = true;
    saveBtn.textContent = '저장 중...';

    try {
      await saveItem(boardId);
      showView('success-view');
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = '저장하기';
      setStatus(err instanceof Error ? err.message : '저장에 실패했어요.', 'error');
    }
  });

  // Open Shopaitry web app
  document.getElementById('open-app-btn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: serverUrl });
    window.close();
  });
});
