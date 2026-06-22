// === 图片持久化：base64 存 IndexedDB，草稿只存引用，避免撑爆 localStorage 导致图片丢失 ===
// 思路（借鉴花生排版器）：
//   编辑器 DOM 里图片仍是 base64（用于显示 / 复制 / 导出，无需改动预览和复制逻辑）；
//   但草稿存进 localStorage 前，把 base64 抽出来存进 IndexedDB（大容量），草稿里只留 data-img-id 引用；
//   重新打开时再用 id 从 IndexedDB 把 base64 还原回编辑器。

const IMG_DB_NAME = 'gzhcomposing-images';
const IMG_STORE_NAME = 'images';
const IMG_REF_ATTR = 'data-img-id';
let _imgDb = null;
let imageStoreReady = false;           // IndexedDB 是否可用；不可用时草稿退回原行为（保留 base64）
const imageMemCache = new Map();       // id -> dataURL，供同步还原

function openImageDB() {
  return new Promise((resolve, reject) => {
    if (_imgDb) { resolve(_imgDb); return; }
    if (!window.indexedDB) { reject(new Error('indexedDB unavailable')); return; }
    const req = indexedDB.open(IMG_DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IMG_STORE_NAME)) {
        req.result.createObjectStore(IMG_STORE_NAME);
      }
    };
    req.onsuccess = () => { _imgDb = req.result; resolve(_imgDb); };
    req.onerror = () => reject(req.error || new Error('open failed'));
  });
}

// 启动时把 IndexedDB 里所有图片读进内存缓存，供同步还原
async function initImageStore() {
  try {
    const db = await openImageDB();
    imageStoreReady = true;
    await new Promise(resolve => {
      const tx = db.transaction(IMG_STORE_NAME, 'readonly');
      const req = tx.objectStore(IMG_STORE_NAME).openCursor();
      req.onsuccess = e => {
        const cur = e.target.result;
        if (cur) { imageMemCache.set(cur.key, cur.value); cur.continue(); }
        else resolve();
      };
      req.onerror = () => resolve();
    });
  } catch {
    imageStoreReady = false;
  }
}

function genImageId() {
  return 'img-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// 注册一张 data: 图片：同步写内存缓存，异步写 IndexedDB，返回 id
function registerImageDataURL(dataURL) {
  if (typeof dataURL !== 'string' || !dataURL.startsWith('data:image/')) return '';
  const id = genImageId();
  imageMemCache.set(id, dataURL);
  openImageDB().then(db => {
    const tx = db.transaction(IMG_STORE_NAME, 'readwrite');
    tx.objectStore(IMG_STORE_NAME).put(dataURL, id);
  }).catch(() => {});
  return id;
}

function getImageDataURL(id) {
  return imageMemCache.get(id) || '';
}

// 给编辑器里所有 base64 图片打上 data-img-id 并存进 IndexedDB（幂等：已登记过的跳过）
function ensureEditorImagesPersisted() {
  if (!imageStoreReady) return;
  editor.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (!src.startsWith('data:')) return;
    const existing = img.getAttribute(IMG_REF_ATTR);
    if (existing && imageMemCache.has(existing)) return;
    const id = registerImageDataURL(src);
    if (id) img.setAttribute(IMG_REF_ATTR, id);
  });
}

// 草稿序列化前：把已登记图片的 base64 src 清空，只留 data-img-id 引用（草稿体积骤减）
// IndexedDB 不可用时原样返回（保留 base64），保证不比旧行为更糟
function dehydrateImagesForDraft(html) {
  if (!imageStoreReady) return html;
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html || '');
  tpl.content.querySelectorAll('img').forEach(img => {
    const id = img.getAttribute(IMG_REF_ATTR);
    if (id && imageMemCache.has(id) && (img.getAttribute('src') || '').startsWith('data:')) {
      img.setAttribute('src', '');
    }
  });
  return tpl.innerHTML;
}

// 草稿载入前：用 data-img-id 把 base64 从缓存还原回 src（在 sanitize 之前调用，避免空 src 被清除）
function rehydrateImagesFromStore(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html || '');
  tpl.content.querySelectorAll('img[' + IMG_REF_ATTR + ']').forEach(img => {
    if ((img.getAttribute('src') || '').startsWith('data:')) return;
    const data = getImageDataURL(img.getAttribute(IMG_REF_ATTR));
    if (data) img.setAttribute('src', data);
  });
  return tpl.innerHTML;
}
