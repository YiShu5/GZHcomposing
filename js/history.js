// === 历史记录 / 撤销重做 / 草稿保存 ===

const HISTORY_MAX = 60;
let historyStack = [];
let historyIndex = -1;
let historyPushTimer = null;
let suppressHistory = false;
function pushHistorySnapshot() {
  if (suppressHistory) return;
  const html = editor.innerHTML;
  if (historyStack[historyIndex] === html) return;
  // 截断 redo 部分
  if (historyIndex < historyStack.length - 1) {
    historyStack = historyStack.slice(0, historyIndex + 1);
  }
  historyStack.push(html);
  historyIndex++;
  if (historyStack.length > HISTORY_MAX) {
    historyStack.shift();
    historyIndex--;
  }
}
function debouncedPushSnapshot() {
  clearTimeout(historyPushTimer);
  historyPushTimer = setTimeout(pushHistorySnapshot, 600);
}
function undoEditor() {
  // 立即把还没入栈的当前状态推入，再回退
  clearTimeout(historyPushTimer);
  pushHistorySnapshot();
  if (historyIndex <= 0) return;
  historyIndex--;
  suppressHistory = true;
  editor.innerHTML = historyStack[historyIndex];
  suppressHistory = false;
  scheduleUpdate();
}
function redoEditor() {
  if (historyIndex >= historyStack.length - 1) return;
  historyIndex++;
  suppressHistory = true;
  editor.innerHTML = historyStack[historyIndex];
  suppressHistory = false;
  scheduleUpdate();
}

// ===================================================================
// AUTOSAVE / DRAFT RECOVERY
// ===================================================================
const DRAFT_KEY = 'gzhcomposing.draft.v1';
function saveDraft() {
  try {
    const html = editor.innerHTML || '';
    const chars = (editor.innerText || '').replace(/\s/g, '').length;
    if (chars < 5) return; // 内容太少不存
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ html, chars, savedAt: Date.now() }));
  } catch (err) {
    // 配额满 / 隐身模式：每 10 次失败提示一次，避免持续沉默
    saveDraft._failCount = (saveDraft._failCount || 0) + 1;
    if (saveDraft._failCount === 1 || saveDraft._failCount % 10 === 0) {
      const t = document.createElement('div');
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1E293B;color:#fff;padding:10px 18px;border-radius:20px;font-size:13px;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,0.25);pointer-events:none';
      t.textContent = '草稿存储空间已满，请导出 HTML 或压缩图片后再编辑';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 4000);
    }
  }
}
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    // 7 天前的草稿就别问了
    if (!draft.savedAt || Date.now() - draft.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch { return null; }
}
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch {} }
let autosaveIntervalId = null;
function startAutosave() {
  if (autosaveIntervalId) clearInterval(autosaveIntervalId);
  autosaveIntervalId = setInterval(saveDraft, 5000);
  // 关页面前最后存一次 + 清理 interval
  window.addEventListener('beforeunload', () => {
    saveDraft();
    if (autosaveIntervalId) clearInterval(autosaveIntervalId);
  });
}
