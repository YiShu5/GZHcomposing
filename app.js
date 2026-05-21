// ===================================================================
// DOM REFS
// ===================================================================
const $ = id => document.getElementById(id);

// 哆啦A梦四次元口袋彩蛋：点击头像随机掏出一件道具
const DORA_GADGETS = [
  '任意门', '时光机', '竹蜻蜓', '缩小灯', '记忆面包',
  '隐身斗篷', '空气炮', '四次元口袋', '桃太郎印饭团',
  '时光布', '立体复印机', '入梦机', '说谎机800号', '万能照相机'
];
const DORA_HIDDEN_5 = ['🤓 大雄又来抱大腿了', '😴 大雄正在睡午觉', '🍙 大雄抢走了饭团'];
const DORA_HIDDEN_10 = ['💪 胖虎登场，请绕道', '🎤 胖虎要开演唱会，快捂耳朵', '👊 胖虎拳头预热中……'];
const DORA_HIDDEN_15 = ['💰 小夫又在炫耀新玩具', '😏 小夫笑得贼贼的', '🎻 静香在练小提琴（捂耳）', '🌸 静香路过，留下一阵清香'];
let doraClickCount = 0;
let doraClickTimer = null;
function showDoraBubble(avatar, text, special) {
  const old = avatar.querySelector('.dora-gadget-bubble');
  if (old) old.remove();
  const bubble = document.createElement('div');
  bubble.className = 'dora-gadget-bubble' + (special ? ' special' : '');
  bubble.textContent = text;
  avatar.appendChild(bubble);
  requestAnimationFrame(() => bubble.classList.add('show'));
  setTimeout(() => bubble.remove(), special ? 2400 : 1700);
}
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// 空闲提醒：60 秒不打字 → 哆啦A梦跳一下 + 气泡催你
const IDLE_THRESHOLD = 60000;
const IDLE_MESSAGES = [
  '别发呆了，赶紧努力 ✊',
  '该写稿子啦~',
  '哆啦A梦看着你呢 👀',
  '休息够了，继续吧 💪',
  '不写完会被胖虎抓住哦',
  '稿子还差一段，加油',
];
let idleTimer = null;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(triggerIdleReminder, IDLE_THRESHOLD);
}
function triggerIdleReminder() {
  const avatar = document.querySelector('.dora-avatar');
  if (!avatar) return;
  // 编辑器为空就不催（用户可能还没开始写）
  const hasContent = (editor.innerText || '').trim().length > 30;
  if (!hasContent) { resetIdleTimer(); return; }
  // 头像跳一下（呼应中央提醒）
  avatar.classList.remove('bounce');
  void avatar.offsetWidth;
  avatar.classList.add('bounce');
  setTimeout(() => avatar.classList.remove('bounce'), 700);
  // 屏幕正中央大字气泡
  document.querySelectorAll('.dora-idle-bubble').forEach(el => el.remove());
  const bubble = document.createElement('div');
  bubble.className = 'dora-idle-bubble';
  bubble.textContent = pickRandom(IDLE_MESSAGES);
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 4100);
  // 继续监控，下次空闲再触发
  resetIdleTimer();
}

// 任意门：随机传送到一套样式 + 配色
function teleportRandomStyle() {
  // 排版模式：避开当前的
  const otherModes = MODES.filter(m => m.id !== STATE.mode);
  const newMode = otherModes[Math.floor(Math.random() * otherModes.length)] || MODES[0];
  applyMode(newMode);
  // 配色：避开当前的
  const otherColorIdxs = COLOR_SCHEMES.map((_, i) => i).filter(i => i !== STATE.colorScheme);
  const newColorIdx = otherColorIdxs[Math.floor(Math.random() * otherColorIdxs.length)];
  STATE.colorScheme = newColorIdx;
  STATE.customColors = null;
  // 随机背景
  if (typeof BG_TEXTURES !== 'undefined' && BG_TEXTURES.length) {
    const otherBgs = BG_TEXTURES.filter(b => b.id !== STATE.bg);
    const newBg = otherBgs[Math.floor(Math.random() * otherBgs.length)] || BG_TEXTURES[0];
    STATE.bg = newBg.id;
  }
  updatePreview();

  showTeleportToast(`✨ 任意门已开 — ${newMode.name} · ${COLOR_SCHEMES[newColorIdx].name}`);
}
function showTeleportToast(text) {
  const old = document.getElementById('teleportToast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.id = 'teleportToast';
  toast.className = 'teleport-toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 1800);
}
function doraGadget(e) {
  const avatar = e.currentTarget;
  doraClickCount++;
  clearTimeout(doraClickTimer);
  doraClickTimer = setTimeout(() => { doraClickCount = 0; }, 2000);
  // 隐藏彩蛋：连点 5/10/15/30 次召唤朋友
  if (doraClickCount === 30) {
    avatar.classList.add('shake');
    setTimeout(() => avatar.classList.remove('shake'), 500);
    showDoraBubble(avatar, '🎉 哆啦A梦来喽~', true);
    doraClickCount = 0;
    return;
  }
  if (doraClickCount === 15) {
    avatar.classList.add('shake');
    setTimeout(() => avatar.classList.remove('shake'), 500);
    showDoraBubble(avatar, pickRandom(DORA_HIDDEN_15), true);
    return; // 不重置，让计数继续累加到 30
  }
  if (doraClickCount === 10) {
    avatar.classList.add('shake');
    setTimeout(() => avatar.classList.remove('shake'), 500);
    showDoraBubble(avatar, pickRandom(DORA_HIDDEN_10), true);
    return;
  }
  if (doraClickCount === 5) {
    avatar.classList.add('shake');
    setTimeout(() => avatar.classList.remove('shake'), 500);
    showDoraBubble(avatar, pickRandom(DORA_HIDDEN_5), true);
    return;
  }
  showDoraBubble(avatar, '✨ ' + pickRandom(DORA_GADGETS) + '！', false);
}

const editor = $('editor');
const preview = $('preview');
const previewFrame = $('previewFrame');
const previewWrap = $('previewWrap');
const panelLeft = $('panelLeft');
const panelRight = $('panelRight');
const divider = $('divider');

// ===================================================================
// INIT
// ===================================================================
window.addEventListener('DOMContentLoaded', () => {
  // 草稿恢复优先于默认内容
  const draft = loadDraft();
  if (draft && draft.html && draft.html.trim() && draft.html !== DEFAULT_HTML) {
    const minutesAgo = Math.max(1, Math.round((Date.now() - draft.savedAt) / 60000));
    const ok = confirm(`检测到 ${minutesAgo} 分钟前的未保存草稿（约 ${draft.chars} 字），是否恢复？\n\n点「确定」恢复草稿。\n点「取消」加载默认范例（草稿会被覆盖）。`);
    if (ok) editor.innerHTML = draft.html;
    else editor.innerHTML = DEFAULT_HTML;
  } else {
    editor.innerHTML = DEFAULT_HTML;
  }
  applyMode(MODES.find(m => m.id === DEFAULT_MODE_ID) || MODES[0]);
  updatePreview();
  // 同步「微信预览」按钮的初始 active 态（wechatPreviewActive 默认为 true）
  const wcBtn = $('wechatPreviewToggle');
  if (wcBtn) wcBtn.classList.toggle('active', wechatPreviewActive);
  setupDivider();
  setupScrollSync();
  setupEditorEvents();
  setupRichCopyEvents();
  updateToolbarStates();
  startAutosave();
  pushHistorySnapshot(); // 初始快照
  // 启动空闲提醒：编辑器输入 / 全局点击或键盘活动 → 重置计时器
  resetIdleTimer();
  editor.addEventListener('input', resetIdleTimer, { passive: true });
  document.addEventListener('keydown', resetIdleTimer, { passive: true });
  document.addEventListener('mousedown', resetIdleTimer, { passive: true });
});

// ===================================================================
// UNDO / REDO 历史栈
// ===================================================================
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
  if (historyStack.length > HISTORY_MAX) {
    historyStack.shift();
  } else {
    historyIndex++;
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
    // 配额满 / 隐身模式：静默跳过
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

// ===================================================================
// EDITOR COMMANDS
// ===================================================================
function execCmd(cmd, val) {
  if (cmd === 'formatBlock') {
    toggleBlockFormat(String(val || 'P').toUpperCase());
    return;
  }
  document.execCommand(cmd, false, val || null);
  editor.focus();
  scheduleUpdate();
  updateToolbarStates();
}
function execHeading(tag) {
  if (!tag) return;
  toggleBlockFormat(String(tag).toUpperCase());
}

function toggleBlockFormat(tag) {
  const active = isSelectionInBlockFormat(tag);
  if (tag === 'BLOCKQUOTE' && active) {
    unwrapSelectedBlockquotes();
  } else {
    document.execCommand('formatBlock', false, active ? 'P' : tag);
  }
  editor.focus();
  scheduleUpdate();
  updateToolbarStates();
}

function applyTextAlign(align) {
  const safeAlign = ['left', 'center', 'right'].includes(align) ? align : 'left';
  const range = getSelectionRangeInEditor();
  if (!range) {
    editor.focus();
    return;
  }
  const targets = getSelectedAlignTargets(range);
  if (!targets.length) {
    document.execCommand(safeAlign === 'center' ? 'justifyCenter' : safeAlign === 'right' ? 'justifyRight' : 'justifyLeft', false, null);
  } else {
    targets.forEach(el => {
      el.style.textAlign = safeAlign;
      el.setAttribute('data-user-align', safeAlign);
    });
  }
  editor.focus();
  scheduleUpdate();
  updateToolbarStates();
}

function toggleAlignPanel() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
    savedEditorRange = sel.getRangeAt(0).cloneRange();
  }
  const p = $('alignPanel');
  p.classList.toggle('show');
  $('imgPanel')?.classList.remove('show');
  $('hrPanel')?.classList.remove('show');
  updateToolbarStates();
}

function chooseTextAlign(align) {
  if (savedEditorRange) restoreEditorRange(savedEditorRange);
  applyTextAlign(align);
  $('alignPanel')?.classList.remove('show');
}

function getSelectionRangeInEditor() {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const anchor = sel.anchorNode;
  const focus = sel.focusNode;
  if ((anchor && editor.contains(anchor)) || (focus && editor.contains(focus))) return range;
  return null;
}

function getElementFromNode(node) {
  if (!node) return null;
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}

function closestBlock(node) {
  let el = getElementFromNode(node);
  while (el && el !== editor) {
    if (/^(P|H1|H2|H3|BLOCKQUOTE|LI|PRE|DIV|SECTION)$/i.test(el.tagName)) return el;
    el = el.parentElement;
  }
  return null;
}

function closestTag(node, tag) {
  let el = getElementFromNode(node);
  while (el && el !== editor) {
    if (el.tagName === tag) return el;
    el = el.parentElement;
  }
  return null;
}

function isSelectionInBlockFormat(tag) {
  const range = getSelectionRangeInEditor();
  if (!range) return false;
  if (tag === 'BLOCKQUOTE') {
    return !!closestTag(range.startContainer, 'BLOCKQUOTE') && !!closestTag(range.endContainer, 'BLOCKQUOTE');
  }
  const startBlock = closestBlock(range.startContainer);
  const endBlock = closestBlock(range.endContainer);
  return !!startBlock && !!endBlock && startBlock.tagName === tag && endBlock.tagName === tag;
}

function getSelectedAlignTargets(range) {
  const targets = new Set();
  const selector = 'p,h1,h2,h3,blockquote,li,pre,section,div[data-theme-component]';
  const addTarget = node => {
    const el = getElementFromNode(node);
    if (!el || !editor.contains(el)) return;
    const component = el.closest?.('[data-theme-component]');
    if (component && editor.contains(component)) targets.add(component);
    const block = el.closest?.(selector);
    if (block && editor.contains(block) && block !== editor) targets.add(block);
  };
  addTarget(range.startContainer);
  addTarget(range.endContainer);
  editor.querySelectorAll(selector).forEach(el => {
    try {
      if (range.intersectsNode(el)) targets.add(el);
    } catch (e) {}
  });
  return Array.from(targets).filter(el => !Array.from(targets).some(other => other !== el && other.contains(el)));
}

function getCurrentUserAlign() {
  const range = getSelectionRangeInEditor();
  if (!range) return '';
  const el = getElementFromNode(range.startContainer);
  const target = el?.closest?.('[data-user-align],p,h1,h2,h3,blockquote,li,pre,section,div[data-theme-component]');
  if (!target || !editor.contains(target)) return '';
  const value = target.getAttribute('data-user-align') || target.style.textAlign || '';
  return ['left', 'center', 'right'].includes(value) ? value : '';
}

function unwrapSelectedBlockquotes() {
  const range = getSelectionRangeInEditor();
  if (!range) return;
  const blockquotes = new Set();
  const start = closestTag(range.startContainer, 'BLOCKQUOTE');
  const end = closestTag(range.endContainer, 'BLOCKQUOTE');
  if (start) blockquotes.add(start);
  if (end) blockquotes.add(end);
  editor.querySelectorAll('blockquote').forEach(el => {
    try {
      if (range.intersectsNode(el)) blockquotes.add(el);
    } catch (e) {}
  });
  Array.from(blockquotes).forEach(unwrapBlockquoteElement);
}

function isBlockContentElement(node) {
  return node?.nodeType === Node.ELEMENT_NODE && /^(P|H1|H2|H3|BLOCKQUOTE|UL|OL|LI|PRE|DIV|SECTION|TABLE|HR)$/i.test(node.tagName);
}

function unwrapBlockquoteElement(bq) {
  if (!bq || !bq.parentNode) return;
  const frag = document.createDocumentFragment();
  const hasBlockChild = Array.from(bq.childNodes).some(isBlockContentElement);
  if (hasBlockChild) {
    while (bq.firstChild) frag.appendChild(bq.firstChild);
  } else {
    const p = document.createElement('p');
    while (bq.firstChild) p.appendChild(bq.firstChild);
    if (!p.childNodes.length) p.appendChild(document.createElement('br'));
    frag.appendChild(p);
  }
  bq.replaceWith(frag);
}

function setToolbarActive(id, active) {
  const el = $(id);
  if (el) el.classList.toggle('active', !!active);
}

function updateToolbarStates() {
  try {
    setToolbarActive('btnBold', document.queryCommandState('bold'));
    setToolbarActive('btnItalic', document.queryCommandState('italic'));
    setToolbarActive('btnUl', document.queryCommandState('insertUnorderedList'));
    setToolbarActive('btnOl', document.queryCommandState('insertOrderedList'));
  } catch (e) {}
  setToolbarActive('btnQuote', isSelectionInBlockFormat('BLOCKQUOTE'));
  setToolbarActive('btnHighlight', isSelectionInEditorHighlight());
  const align = getCurrentUserAlign();
  setToolbarActive('btnAlign', !!align);
  setToolbarActive('alignOptionLeft', align === 'left');
  setToolbarActive('alignOptionCenter', align === 'center');
  setToolbarActive('alignOptionRight', align === 'right');
  const alignIcon = { left: '↤', center: '↔', right: '↦' }[align] || '↔';
  if ($('btnAlign')) $('btnAlign').textContent = alignIcon;
}
function insertCodeBlock() {
  const sel = window.getSelection();
  const text = sel.toString() || '// 在此输入代码';
  document.execCommand('insertHTML', false, '<pre><code>' + escapeHtml(text) + '</code></pre><p><br></p>');
  editor.focus();
  scheduleUpdate();
}
function escapeHtml(t) {
  return String(t ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function escapeAttr(t) {
  return escapeHtml(t).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function clampNumber(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
function sanitizeColorValue(value, fallback = '#333333') {
  const v = String(value || '').trim();
  if (!v || v.length > 40) return fallback;
  if (/url\s*\(|expression\s*\(|javascript:|vbscript:|[<>"'`;{}]/i.test(v)) return fallback;
  if (!/^[#a-zA-Z0-9\s,().%+-]+$/.test(v)) return fallback;
  if (window.CSS && CSS.supports && !CSS.supports('color', v)) return fallback;
  return v;
}
function toColorInputValue(value, fallback = '#333333') {
  const v = String(value || '').trim();
  const shortHex = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (shortHex) return '#' + shortHex.slice(1).map(x => x + x).join('');
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  return fallback;
}
function alphaColor(value, alpha = 0.12, fallback = 'rgba(0,0,0,0.08)') {
  const v = sanitizeColorValue(value, '');
  const a = Math.min(1, Math.max(0, Number(alpha) || 0));
  const shortHex = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (shortHex) {
    const [r,g,b] = shortHex.slice(1).map(x => parseInt(x + x, 16));
    return `rgba(${r},${g},${b},${a})`;
  }
  const hex = v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (hex) {
    const [r,g,b] = hex.slice(1).map(x => parseInt(x, 16));
    return `rgba(${r},${g},${b},${a})`;
  }
  const rgb = v.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgb) return `rgba(${rgb[1]},${rgb[2]},${rgb[3]},${a})`;
  return fallback;
}
function sanitizeImageSrc(src) {
  const raw = String(src || '').trim().replace(/[\u0000-\u001F\u007F]/g, '');
  if (!raw) return '';
  if (/^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(raw)) {
    return raw.replace(/\s/g, '');
  }
  try {
    const u = new URL(raw, window.location.href);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
  } catch {}
  return '';
}

const SAFE_HTML_TAGS = new Set([
  'P','BR','STRONG','B','EM','I','U','S','H1','H2','H3','BLOCKQUOTE','UL','OL','LI',
  'PRE','CODE','HR','DIV','SECTION','SPAN','IMG','A','TABLE','TBODY','TR','TD'
]);
const DROP_HTML_TAGS = new Set(['SCRIPT','STYLE','LINK','META','IFRAME','OBJECT','EMBED','FORM','INPUT','BUTTON','TEXTAREA','SELECT','OPTION']);
const SAFE_STYLE_PROPS = new Set([
  'color','background','background-color','background-image','background-size','background-clip','background-origin',
  'border','border-left','border-right','border-top','border-bottom','border-radius','border-image',
  'border-width','border-style','border-color',
  'border-left-width','border-left-style','border-left-color',
  'border-right-width','border-right-style','border-right-color',
  'border-top-width','border-top-style','border-top-color',
  'border-bottom-width','border-bottom-style','border-bottom-color',
  'border-top-left-radius','border-top-right-radius','border-bottom-right-radius','border-bottom-left-radius',
  'box-shadow','box-sizing','display','align-items','justify-content','gap','column-gap','flex','flex-shrink','flex-wrap',
  'border-collapse','border-spacing','table-layout',
  'width','height','max-width','min-width','max-height','margin','margin-top','margin-right','margin-bottom','margin-left',
  'padding','padding-top','padding-right','padding-bottom','padding-left','text-align','font-size','font-weight',
  'font-style','font-family','line-height','letter-spacing','text-indent','text-decoration','opacity','position','left','right','top','bottom',
  'vertical-align','overflow','overflow-x','overflow-y','overflow-wrap','word-wrap','white-space','white-space-collapse','text-wrap-mode','text-transform'
]);
function isSafeCssValue(value) {
  // Allow data: URLs for background-image since sanitizeImageSrc already validated them
  if (/^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(value)) return true;
  return !/url\s*\(|expression\s*\(|behavior\s*:|binding\s*:|javascript:|vbscript:|[<>]/i.test(String(value || ''));
}
function sanitizeStyleText(styleText) {
  const probe = document.createElement('div');
  probe.setAttribute('style', String(styleText || ''));
  const safe = [];
  for (let i = 0; i < probe.style.length; i++) {
    const prop = probe.style[i].toLowerCase();
    const value = probe.style.getPropertyValue(prop).trim();
    if (SAFE_STYLE_PROPS.has(prop) && isSafeCssValue(value)) safe.push(`${prop}:${value}`);
  }
  return safe.join(';');
}
function sanitizeElementTree(root) {
  Array.from(root.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      return;
    }

    const tag = node.tagName;
    if (DROP_HTML_TAGS.has(tag)) {
      node.remove();
      return;
    }
    if (!SAFE_HTML_TAGS.has(tag)) {
      const frag = document.createDocumentFragment();
      while (node.firstChild) frag.appendChild(node.firstChild);
      node.replaceWith(frag);
      sanitizeElementTree(root);
      return;
    }

    Array.from(node.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith('on') || name === 'srcdoc' || name === 'contenteditable') {
        node.removeAttribute(attr.name);
        return;
      }
      if (name === 'style') {
        const safeStyle = sanitizeStyleText(value);
        if (safeStyle) node.setAttribute('style', safeStyle);
        else node.removeAttribute('style');
        return;
      }
      if (tag === 'IMG' && name === 'src') {
        const safeSrc = sanitizeImageSrc(value);
        if (safeSrc) node.setAttribute('src', safeSrc);
        else node.remove();
        return;
      }
      if (tag === 'A' && name === 'href') {
        try {
          const u = new URL(value, window.location.href);
          if (u.protocol === 'http:' || u.protocol === 'https:') node.setAttribute('href', u.href);
          else node.removeAttribute('href');
        } catch { node.removeAttribute('href'); }
        return;
      }
      if (['alt','title'].includes(name)) return;
      if (['data-ending-block','data-ending-type','data-theme-component','data-theme-role','data-layout','data-editor-highlight','data-hr-style','data-user-align'].includes(name)) return;
      node.removeAttribute(attr.name);
    });

    if (tag === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    sanitizeElementTree(node);
  });
}
function normalizeImagePairs(root) {
  Array.from(root.querySelectorAll('div')).forEach(group => {
    const styleText = (group.getAttribute('style') || '').toLowerCase();
    if (!styleText.includes('display:flex') && !styleText.includes('display: flex')) return;
    if (!styleText.includes('column-gap') && !styleText.includes('gap')) return;

    const children = Array.from(group.children);
    if (children.length !== 2 || group.querySelectorAll('img').length !== 2) return;
    const imgs = children.map(child => child.tagName === 'IMG' ? child : child.querySelector('img'));
    if (imgs.some(img => !img)) return;

    const table = document.createElement('table');
    table.setAttribute('data-layout', 'image-pair');
    table.style.width = group.style.width || '100%';
    table.style.maxWidth = '100%';
    table.style.margin = group.style.margin || '12px auto';
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';
    table.style.tableLayout = 'fixed';
    table.style.boxSizing = 'border-box';

    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    imgs.forEach((img, idx) => {
      const td = document.createElement('td');
      td.style.width = '50%';
      td.style.padding = idx === 0 ? '0 0.5mm 0 0' : '0 0 0 0.5mm';
      td.style.verticalAlign = 'top';
      td.style.boxSizing = 'border-box';
      img.style.display = 'block';
      img.style.width = '100%';
      img.style.maxWidth = '100%';
      img.style.margin = '0';
      img.style.boxSizing = 'border-box';
      td.appendChild(img);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
    table.appendChild(tbody);
    group.replaceWith(table);
  });
}
function stripGeneratedListMarker(li) {
  const first = li.firstElementChild;
  if (!first || first.tagName !== 'SPAN') return;
  const styleText = (first.getAttribute('style') || '').toLowerCase();
  const text = first.textContent.trim();
  const looksGenerated = styleText.includes('position:absolute') ||
    styleText.includes('display:inline-flex') ||
    styleText.includes('border-radius:50%') ||
    styleText.includes('border-radius: 50%') ||
    (styleText.includes('background') && /^(\d{1,2}|[鈻鈥•·])/.test(text) && text.length <= 3);
  if (looksGenerated) first.remove();
}
function buildWechatListMarker(list, idx, mode, c) {
  const marker = document.createElement('span');
  const isOrdered = list.tagName === 'OL';
  const isCardMode = mode.id === 'mario-theme' || mode.id === 'coffee-journal' || (mode.id === 'tutorial' && isOrdered);
  marker.textContent = isCardMode ? String(idx + 1).padStart(2, '0') : (isOrdered ? `${idx + 1}.` : '•');
  marker.style.display = 'inline-block';
  marker.style.textAlign = 'center';
  marker.style.fontWeight = isCardMode ? '900' : '700';
  marker.style.fontSize = isCardMode ? '11px' : '16px';
  marker.style.color = isCardMode ? '#111827' : c.main;
  marker.style.lineHeight = isCardMode ? '26px' : '1.4';
  marker.style.width = isCardMode ? '26px' : '20px';
  marker.style.height = isCardMode ? '26px' : 'auto';
  if (mode.id === 'mario-theme') {
    marker.style.background = c.accent;
    marker.style.border = '2px solid #111827';
    marker.style.borderRadius = '50%';
    marker.style.boxSizing = 'border-box';
  } else if (mode.id === 'coffee-journal') {
    marker.style.background = c.main;
    marker.style.color = '#FFFFFF';
    marker.style.borderRadius = '6px';
    marker.style.fontSize = '10px';
    marker.style.lineHeight = '20px';
    marker.style.width = '24px';
    marker.style.height = '20px';
  } else if (mode.id === 'tutorial' && isOrdered) {
    marker.style.background = c.main;
    marker.style.color = '#FFFFFF';
    marker.style.borderRadius = '50%';
    marker.style.fontSize = '12px';
    marker.style.lineHeight = '24px';
    marker.style.width = '24px';
    marker.style.height = '24px';
  }
  return marker;
}
function normalizeWechatLists(root) {
  const c = getColors();
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  const journalPaper = c.paper || c.sub || '#FFF6E8';
  const themeSky = c.sky || c.main;

  Array.from(root.querySelectorAll('ul,ol')).forEach(list => {
    const items = Array.from(list.children).filter(child => child.tagName === 'LI');
    if (!items.length) return;

    const wrapper = document.createElement('section');
    wrapper.style.display = 'block';
    wrapper.style.margin = list.style.margin || `1em 0 ${STATE.paraSpacing}em`;
    wrapper.style.padding = '0';

    items.forEach((li, idx) => {
      stripGeneratedListMarker(li);

      const item = document.createElement('section');
      item.style.display = 'block';
      item.style.width = '100%';
      item.style.maxWidth = '100%';
      item.style.boxSizing = 'border-box';
      item.style.margin = '0 0 10px 0';
      item.style.color = c.text;
      item.style.fontSize = li.style.fontSize || '15px';
      item.style.lineHeight = li.style.lineHeight || String(STATE.lineHeight);
      item.style.letterSpacing = li.style.letterSpacing || '0.03em';
      item.style.paddingLeft = mode.id === 'mario-theme' ? '48px' : mode.id === 'coffee-journal' ? '42px' : '30px';
      item.style.textIndent = mode.id === 'mario-theme' ? '-38px' : mode.id === 'coffee-journal' ? '-34px' : '-28px';

      if (mode.id === 'mario-theme') {
        item.style.border = `2px solid ${alphaColor(themeSky, 0.28, '#bbdefb')}`;
        item.style.borderRadius = '12px';
        item.style.background = '#FFFFFF';
        item.style.boxShadow = `0 4px 0 ${alphaColor(c.accent, 0.35, 'rgba(251,192,45,0.35)')}`;
        item.style.padding = '12px 14px 10px 48px';
      } else if (mode.id === 'coffee-journal') {
        item.style.border = `1px solid ${alphaColor(c.main, 0.24, '#E7D6BE')}`;
        item.style.borderRadius = '12px';
        item.style.background = '#FFFFFF';
        item.style.boxShadow = `0 3px 12px ${alphaColor(c.main, 0.06, 'rgba(200,135,78,0.06)')}`;
        item.style.padding = '9px 12px 9px 42px';
      } else {
        item.style.padding = '0 0 6px 30px';
      }

      const marker = buildWechatListMarker(list, idx, mode, c);
      marker.style.verticalAlign = 'middle';
      marker.style.marginRight = mode.id === 'coffee-journal' ? '10px' : '8px';
      marker.style.textIndent = '0';
      const content = document.createElement('span');
      content.style.textIndent = '0';
      content.style.color = li.style.color || c.text;
      content.innerHTML = li.innerHTML;
      item.appendChild(marker);
      item.appendChild(content);
      wrapper.appendChild(item);
    });

    list.replaceWith(wrapper);
  });
}
function getWechatThemeBasics() {
  const c = getColors();
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  return {
    c,
    mode,
    main: c.main || '#2563EB',
    accent: c.accent || c.main || '#2563EB',
    sub: c.sub || alphaColor(c.main || '#2563EB', 0.08, '#F7F8FA'),
    text: c.text || '#333333',
    paper: c.paper || c.sub || '#FFF6E8',
    sky: c.sky || c.main || '#2563EB'
  };
}
function normalizeWechatInlineLayouts(root) {
  const { mode, main, accent, sub, text, paper } = getWechatThemeBasics();

  Array.from(root.querySelectorAll('h1,h2,h3')).forEach(h => {
    if ((h.style.display || '').toLowerCase().includes('flex')) {
      h.style.display = 'block';
      h.style.alignItems = '';
      h.style.justifyContent = '';
      h.style.gap = '';
    }
    h.style.boxSizing = 'border-box';
    if (mode.headingStyle === 'gradient-round' || mode.headingStyle === 'color-block' || mode.headingStyle === 'business-card') {
      h.style.display = 'inline-block';
      h.style.width = 'fit-content';
      h.style.maxWidth = '100%';
    } else {
      h.style.width = '100%';
      h.style.maxWidth = '100%';
    }

    const spans = Array.from(h.querySelectorAll(':scope > span'));
    if (h.dataset.coffeeBadgeAdded || mode.headingStyle === 'coffee-label') {
      h.style.background = paper;
      h.style.border = `1px solid ${alphaColor(main,0.22,'#E7D6BE')}`;
      h.style.borderLeft = `4px solid ${main}`;
      h.style.borderRadius = '10px';
      h.style.padding = h.tagName === 'H1' ? '12px 14px' : '10px 12px';
      h.style.fontWeight = '800';
      // 用 CSS table 模型替代 flex：H 设 display:table 让 3 个 span 横排，
      // 第 2 列 width:100% 撑满，第 3 列 text-align:right 把横线推到行末
      h.style.display = 'table';
      h.style.width = '100%';
      h.style.boxSizing = 'border-box';
      h.style.borderCollapse = 'collapse';
      if (spans[0]) {
        spans[0].style.display = 'table-cell';
        spans[0].style.verticalAlign = 'middle';
        spans[0].style.whiteSpace = 'nowrap';
        spans[0].style.background = main;
        spans[0].style.color = '#FFFFFF';
        spans[0].style.borderRadius = '8px';
        spans[0].style.textAlign = 'center';
        spans[0].style.padding = '6px 8px';
        spans[0].style.width = '';
        spans[0].style.height = '';
        spans[0].style.lineHeight = '1';
        spans[0].style.marginRight = '';
      }
      if (spans[1]) {
        spans[1].style.display = 'table-cell';
        spans[1].style.verticalAlign = 'middle';
        spans[1].style.color = text;
        spans[1].style.width = '100%';
        spans[1].style.padding = '0 10px';
      }
      if (spans[2]) {
        spans[2].style.display = 'table-cell';
        spans[2].style.verticalAlign = 'middle';
        spans[2].style.textAlign = 'right';
        spans[2].style.whiteSpace = 'nowrap';
        spans[2].style.background = '';
        spans[2].style.width = '';
        spans[2].style.height = '';
        spans[2].style.marginLeft = '';
        spans[2].style.padding = '0';
        // 横线本身用内嵌 inline-block + border-top + padding 撑长度，
        // 避免空 span 在公众号被 max-width 压缩为 0
        spans[2].innerHTML = `<span style="display:inline-block;border-top:1px solid ${accent};opacity:.55;padding:0 14px;line-height:0;font-size:0;vertical-align:middle;">&nbsp;</span>`;
      }
    }

    if (h.dataset.marioBadgeAdded || mode.headingStyle === 'mario-block') {
      if (spans[0]) {
        spans[0].style.display = 'inline-block';
        spans[0].style.width = '30px';
        spans[0].style.height = '30px';
        spans[0].style.lineHeight = '26px';
        spans[0].style.textAlign = 'center';
        spans[0].style.verticalAlign = 'middle';
        spans[0].style.marginRight = '10px';
      }
      if (spans[1]) {
        spans[1].style.display = 'inline';
        spans[1].style.verticalAlign = 'middle';
      }
    }

    if (h.dataset.businessPartAdded || mode.headingStyle === 'business-card') {
      h.style.display = 'block';
      h.style.width = 'fit-content';
      h.style.maxWidth = '100%';
      h.style.boxSizing = 'border-box';
      h.style.background = main;
      h.style.color = '#FFFFFF';
      h.style.border = 'none';
      h.style.borderLeft = 'none';
      h.style.borderBottom = 'none';
      h.style.borderRadius = '8px';
      h.style.padding = h.tagName === 'H1' ? '18px 22px 11px' : '15px 18px 9px';
      h.style.marginTop = '22px';
      h.style.marginRight = 'auto';
      h.style.marginBottom = '16px';
      h.style.marginLeft = 'auto';
      h.style.textAlign = 'center';
      h.style.boxShadow = 'none';
      h.style.position = 'static';
      h.style.fontWeight = '800';
      if (spans[0]) {
        spans[0].style.display = 'block';
        spans[0].style.width = 'fit-content';
        spans[0].style.margin = h.tagName === 'H1' ? '-27px auto 6px' : '-24px auto 6px';
        spans[0].style.padding = '2px 12px';
        spans[0].style.borderRadius = '999px';
        spans[0].style.background = sub;
        spans[0].style.color = main;
        spans[0].style.fontSize = '11px';
        spans[0].style.fontWeight = '800';
        spans[0].style.lineHeight = '1.3';
      }
      if (spans[1]) {
        spans[1].style.display = 'block';
        spans[1].style.color = '#FFFFFF';
        spans[1].style.lineHeight = '1.25';
      }
    }

    if (['knowledge-blogger','japanese','deep-read'].includes(mode.id)) {
      h.querySelectorAll('.heading-bar').forEach(bar => bar.remove());
      h.style.display = 'block';
      h.style.width = '100%';
      h.style.maxWidth = '100%';
      h.style.boxSizing = 'border-box';
      h.style.background = 'transparent';
      h.style.boxShadow = 'none';
      h.style.borderImage = 'none';
      h.style.position = 'static';
      if (mode.id === 'knowledge-blogger') {
        h.style.color = main;
        h.style.padding = '12px 0 12px 14px';
        h.style.borderLeft = `4px solid ${main}`;
        h.style.borderBottom = `1px solid ${alphaColor(main, 0.16, '#E5E7EB')}`;
        h.style.textAlign = 'left';
      }
      if (mode.id === 'japanese') {
        h.style.color = accent;
        h.style.padding = '8px 0 8px 14px';
        h.style.borderLeft = `4px solid ${main}`;
        h.style.borderBottom = 'none';
        h.style.textAlign = 'left';
      }
      if (mode.id === 'business') {
        h.style.color = text;
        h.style.padding = '8px 0 10px';
        h.style.borderLeft = 'none';
        h.style.borderBottom = `4px solid ${main}`;
        h.style.textAlign = 'left';
      }
      if (mode.id === 'deep-read') {
        h.style.color = text;
        h.style.padding = '12px 0 10px';
        h.style.borderLeft = 'none';
        h.style.borderBottom = `2px solid ${alphaColor(main, 0.32, '#D4D4D4')}`;
        h.style.textAlign = 'center';
      }
    }
  });

  Array.from(root.querySelectorAll('[data-theme-component="numbered-heading"]')).forEach(el => {
    const num = el.querySelector('[data-theme-role="number"]');
    const divider = el.querySelector('[data-theme-role="divider"]');
    const title = el.querySelector('[data-theme-role="title"]');
    el.style.display = 'block';
    el.style.width = '100%';
    el.style.maxWidth = '100%';
    el.style.boxSizing = 'border-box';
    if (num) {
      num.style.display = 'inline-block';
      num.style.verticalAlign = 'middle';
      num.style.marginRight = '12px';
    }
    if (divider) {
      divider.style.display = 'inline-block';
      divider.style.verticalAlign = 'middle';
      divider.style.marginRight = '12px';
    }
    if (title) {
      title.style.display = 'inline';
      title.style.verticalAlign = 'middle';
    }
  });

  Array.from(root.querySelectorAll('[data-theme-component="tip-card"], [data-theme-component="design-heading"], [data-theme-component="design-intro"], [data-theme-component="design-ending"]')).forEach(el => {
    if ((el.style.display || '').toLowerCase().includes('flex')) el.style.display = 'block';
    el.style.width = '100%';
    // 强制 max-width:100%，避免 600px 在 Word 中转后被转写为 width:600px 触发微信「宽度异常」
    el.style.maxWidth = '100%';
    el.style.boxSizing = 'border-box';
  });

  Array.from(root.querySelectorAll('blockquote')).forEach(bq => {
    Array.from(bq.querySelectorAll('span')).forEach(span => {
      const styleText = (span.getAttribute('style') || '').toLowerCase();
      if (styleText.includes('position:absolute') || styleText.includes('height:100%')) span.remove();
    });
    bq.style.display = 'block';
    bq.style.width = '100%';
    bq.style.maxWidth = '100%';
    bq.style.boxSizing = 'border-box';
    bq.style.borderImage = 'none';
    if (mode.quoteStyle === 'coffee-note') {
      bq.style.background = paper;
      bq.style.border = `1px solid ${alphaColor(main, 0.34, '#DCC8A7')}`;
      bq.style.borderLeft = `6px solid ${accent}`;
      bq.style.padding = '18px 20px';
      const first = bq.firstElementChild;
      const second = first?.nextElementSibling;
      if (first && second && /^note$/i.test(first.textContent.trim()) && /^note$/i.test(second.textContent.trim())) {
        second.remove();
      }
      if (first && /^note$/i.test(first.textContent.trim())) {
        first.style.display = 'block';
        first.style.marginBottom = '8px';
        first.style.color = main;
      }
    }
  });

  Array.from(root.querySelectorAll('div,section')).forEach(el => {
    const styleText = (el.getAttribute('style') || '').toLowerCase();
    if (!styleText.includes('display:flex') && !styleText.includes('display: flex')) return;
    const hasOnlyDecorSpans = Array.from(el.children).length > 0 && Array.from(el.children).every(child => child.tagName === 'SPAN');
    el.style.display = 'block';
    if (hasOnlyDecorSpans) {
      el.style.textAlign = el.style.textAlign || 'center';
      Array.from(el.children).forEach(child => {
        child.style.display = 'inline-block';
        child.style.verticalAlign = 'middle';
        child.style.marginLeft = child.style.marginLeft || '4px';
        child.style.marginRight = child.style.marginRight || '4px';
      });
    }
  });
}
function normalizeWechatPositioning(root) {
  Array.from(root.querySelectorAll('span')).forEach(span => {
    if ((span.style.position || '').toLowerCase() !== 'absolute') return;
    const text = span.textContent.trim();
    const width = parseFloat(span.style.width || '0');
    const height = String(span.style.height || '');
    if (!text || (width > 0 && width <= 4) || height === '100%') {
      span.remove();
      return;
    }
    span.style.position = 'static';
    span.style.left = '';
    span.style.right = '';
    span.style.top = '';
    span.style.bottom = '';
    span.style.display = 'inline-block';
    span.style.verticalAlign = 'middle';
    span.style.marginRight = span.style.marginRight || '6px';
  });
}
function normalizeWechatTipCards(root) {
  const c = getColors();
  const main = c.main || '#133363';
  const sub = c.sub || '#F6F6F6';
  const text = c.text || '#333333';
  Array.from(root.querySelectorAll('[data-theme-component="tip-card"]')).forEach(card => {
    card.style.display = 'block';
    card.style.width = '100%';
    card.style.maxWidth = '100%';
    card.style.boxSizing = 'border-box';
    card.style.background = sub;
    card.style.border = 'none';
    card.style.borderLeft = `4px solid ${main}`;
    card.style.borderRadius = '10px';
    card.style.padding = '18px 20px';
    card.style.margin = '18px 0';
    card.style.fontFamily = BODY_FONTS[STATE.bodyFont].stack;
    card.style.fontWeight = '400';
    card.style.color = text;
    card.style.lineHeight = '1.8';

    const title = card.querySelector('[data-theme-role="title"]');
    if (title) {
      title.style.display = 'block';
      title.style.margin = '0 0 8px';
      title.style.padding = '0';
      title.style.fontSize = '15px';
      title.style.fontWeight = '700';
      title.style.lineHeight = '1.6';
      title.style.color = main;
      title.style.textIndent = '0';
      title.style.letterSpacing = '0';
    }

    const body = card.querySelector('[data-theme-role="body"]');
    if (body) {
      body.style.display = 'block';
      body.style.margin = '0';
      body.style.padding = '0';
      body.style.fontSize = '15px';
      body.style.fontWeight = '400';
      body.style.lineHeight = '1.8';
      body.style.color = text;
      body.style.textIndent = '0';
      Array.from(body.querySelectorAll('p,div,section,span,strong,b,em,i')).forEach(el => {
        el.style.fontSize = '15px';
        el.style.fontWeight = (el.tagName === 'STRONG' || el.tagName === 'B') ? '700' : '400';
        el.style.lineHeight = '1.8';
        el.style.color = text;
        el.style.textIndent = '0';
        el.style.letterSpacing = '0.02em';
        if (el.tagName === 'P') el.style.margin = '0 0 8px';
      });
    }
  });
}

function ensureTerminalCodeBar(pre) {
  if (!pre || pre.querySelector('[data-theme-role="code-window-bar"]')) return;
  const bar = document.createElement('section');
  bar.setAttribute('data-theme-role', 'code-window-bar');
  bar.style.display = 'block';
  bar.style.height = '12px';
  bar.style.lineHeight = '12px';
  bar.style.margin = '0 0 18px';
  bar.style.whiteSpace = 'nowrap';
  ['#FF6B5F', '#F6BE4F', '#59D36A'].forEach(color => {
    const dot = document.createElement('span');
    dot.style.display = 'inline-block';
    dot.style.width = '12px';
    dot.style.height = '12px';
    dot.style.marginRight = '8px';
    dot.style.borderRadius = '50%';
    dot.style.background = color;
    dot.style.verticalAlign = 'top';
    bar.appendChild(dot);
  });
  pre.insertBefore(bar, pre.firstChild);
}

function normalizeWechatCodeBlocks(root) {
  root.querySelectorAll('pre').forEach(pre => {
    ensureTerminalCodeBar(pre);
    pre.style.display = 'block';
    pre.style.width = '100%';
    pre.style.maxWidth = '100%';
    pre.style.boxSizing = 'border-box';
    pre.style.background = '#252A33';
    pre.style.border = 'none';
    pre.style.borderRadius = '8px';
    pre.style.boxShadow = '0 10px 24px rgba(15,23,42,0.26)';
    pre.style.padding = '18px 20px 10px';
    pre.style.margin = '1.4em auto';
    pre.style.overflowX = 'auto';
    pre.style.overflowY = 'hidden';
    pre.style.overflow = 'auto';
    pre.style.whiteSpace = 'pre';
    pre.style.wordWrap = 'normal';
    pre.style.overflowWrap = 'normal';
    pre.style.fontSize = '13px';
    pre.style.lineHeight = '1.8';
    pre.style.fontFamily = '"SF Mono","Consolas","Menlo",monospace';
    pre.style.color = '#D7E7FF';

    pre.querySelectorAll('code').forEach(code => {
      code.style.display = 'block';
      code.style.minWidth = 'max-content';
      code.style.width = 'max-content';
      code.style.maxWidth = 'none';
      code.style.background = 'transparent';
      code.style.padding = '0';
      code.style.margin = '0';
      code.style.border = 'none';
      code.style.whiteSpace = 'pre';
      code.style.wordWrap = 'normal';
      code.style.overflowWrap = 'normal';
      code.style.fontSize = '13px';
      code.style.lineHeight = '1.8';
      code.style.fontFamily = '"SF Mono","Consolas","Menlo",monospace';
      code.style.color = '#D7E7FF';
    });
  });
}

const WECHAT_MODE_SAFE = {
  text: '#767676',
  muted: '#888888',
  emphasis: '#5F7899',
  heading: '#5A7290',
  border: '#8A8A8A',
  light: '#FFFFFF'
};

function isTransparentCss(value) {
  const v = String(value || '').trim().toLowerCase();
  return !v || v === 'transparent' || v === 'none' || v === 'rgba(0, 0, 0, 0)' || v === 'rgba(0,0,0,0)';
}

function isWhiteCss(value) {
  const v = String(value || '').trim().toLowerCase().replace(/\s+/g, '');
  return v === '#fff' || v === '#ffffff' || v === 'white' || v === 'rgb(255,255,255)' || v === 'rgba(255,255,255,1)';
}

function parseCssRgb(value) {
  let v = String(value || '').trim().toLowerCase();
  if (!v || v === 'transparent' || v === 'none') return null;
  if (v === 'white') v = '#ffffff';
  if (v === 'black') v = '#000000';
  let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    let hex = m[1];
    if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  m = v.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  m = v.match(/#([0-9a-f]{6}|[0-9a-f]{3})/i) || v.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
  if (m && m[0].startsWith('#')) return parseCssRgb(m[0]);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return null;
}

function relativeLuminance(rgb) {
  const vals = rgb.map(v => {
    const n = Math.max(0, Math.min(255, v)) / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  });
  return vals[0] * 0.2126 + vals[1] * 0.7152 + vals[2] * 0.0722;
}

function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

function hasOwnVisibleBackground(el) {
  if (!el?.style) return false;
  const bg = el.style.background || '';
  const bgColor = el.style.backgroundColor || '';
  const bgImage = el.style.backgroundImage || '';
  return !isTransparentCss(bg) || !isTransparentCss(bgColor) || !isTransparentCss(bgImage);
}

function nearestBackgroundRgb(el) {
  let node = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    const rgb = parseCssRgb(node.style.backgroundColor) || parseCssRgb(node.style.background) || parseCssRgb(node.style.backgroundImage);
    if (rgb) return rgb;
    node = node.parentElement;
  }
  return null;
}

function hasReadableColorOnBackground(el) {
  const fg = parseCssRgb(el?.style?.color);
  const bg = nearestBackgroundRgb(el);
  if (!fg || !bg) return false;
  return contrastRatio(fg, bg) >= 3.4;
}

function hasDarkReadableBackgroundForWhite(el) {
  const bg = nearestBackgroundRgb(el);
  if (!bg) return false;
  return contrastRatio([255, 255, 255], bg) >= 3.4;
}

function hasColoredReadableBackground(el) {
  let node = el;
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    if (hasOwnVisibleBackground(node) && !isWhiteCss(node.style.background) && !isWhiteCss(node.style.backgroundColor)) return hasReadableColorOnBackground(el);
    node = node.parentElement;
  }
  return false;
}

function normalizeWechatColorModeCompatibility(root) {
  const safe = WECHAT_MODE_SAFE;

  root.style.color = safe.text;
  if (!root.style.background && !root.style.backgroundColor) root.style.backgroundColor = '#FFFFFF';

  root.querySelectorAll('p,li,blockquote,pre,code,[data-theme-role="body"],[data-theme-role="meta"]').forEach(el => {
    if (isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el)) return;
    if (!isWhiteCss(el.style.color) && hasReadableColorOnBackground(el)) return;
    el.style.color = el.dataset.themeRole === 'meta' ? safe.muted : safe.text;
  });

  root.querySelectorAll('strong,b').forEach(el => {
    if (isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el)) return;
    el.style.color = safe.emphasis;
    el.style.fontWeight = '700';
  });

  root.querySelectorAll('em,i').forEach(el => {
    if (isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el)) return;
    el.style.color = safe.emphasis;
  });

  root.querySelectorAll('h1,h2,h3,[data-theme-role="title"]').forEach(el => {
    const preserveWhiteOnColor = isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el);
    if (!preserveWhiteOnColor) el.style.color = safe.heading;
  });

  root.querySelectorAll('span').forEach(el => {
    if (!el.textContent.trim()) return;
    if (isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el)) return;
    if (!isWhiteCss(el.style.color) && hasReadableColorOnBackground(el)) return;
    const role = el.getAttribute('data-theme-role') || '';
    if (['divider','dots'].includes(role)) return;
    if (el.closest('h1,h2,h3') && hasReadableColorOnBackground(el)) return;
    if (el.style.color && !isWhiteCss(el.style.color)) el.style.color = safe.emphasis;
    if (isWhiteCss(el.style.color) && !hasDarkReadableBackgroundForWhite(el)) el.style.color = safe.emphasis;
  });

  root.querySelectorAll('hr,[data-theme-role="divider"]').forEach(el => {
    if (el.style.background) el.style.background = safe.border;
    if (el.style.borderColor) el.style.borderColor = safe.border;
  });
}

function prepareWechatCompatibility(root) {
  normalizeImagePairs(root);
  normalizeWechatLists(root);
  normalizeWechatDesignComponents(root);      // 必须在 InlineLayouts/Flex 通用转换前
  normalizeWechatInlineLayouts(root);
  normalizeWechatPositioning(root);
  normalizeWechatTipCards(root);
  normalizeWechatEndingIconRowsToTable(root); // 必须在 flex 通用转换前
  normalizeWechatNumberedHeadings(root);      // 必须在 flex 通用转换前
  normalizeWechatFlexLayouts(root);
  normalizeWechatCodeBlocks(root);
  normalizeWechatColorModeCompatibility(root);
  sanitizeFixedWidthsForWechat(root);         // 必须最后：兜底把所有 width:Npx 转 max-width:Npx
}

// 把 inline style 里所有 width:Npx 转成 max-width:Npx
// 微信公众号「内容结构检测」只针对 width 不针对 max-width，避免装饰元素触发警告
function sanitizeFixedWidthsForWechat(root) {
  Array.from(root.querySelectorAll('[style]')).forEach(el => {
    const style = el.getAttribute('style') || '';
    const cleaned = style.replace(
      /(^|;)\s*width\s*:\s*(\d+(?:\.\d+)?px)\s*(?=;|$)/gi,
      '$1max-width:$2'
    );
    if (cleaned !== style) el.setAttribute('style', cleaned);
  });
}
// 把 ending card 整段 normalize 成 WeChat 友好的结构：
// 1. 所有 div → section（WeChat 对 section 的内联样式宽容很多，对 div 几乎全剥离）
// 2. icon 横排 → table（公众号编辑器原生支持）
// 3. table 加 border:0 防止 WeChat 注入默认边框
function normalizeWechatEndingIconRowsToTable(root) {
  // 步骤 1：先把 ending block 内所有 div 替换成 section（保留属性 + 样式 + 子节点）
  Array.from(root.querySelectorAll('[data-theme-component="ending"]')).forEach(block => {
    // 子节点先转，再转外壳，避免引用断链
    Array.from(block.querySelectorAll('div')).forEach(convertDivToSection);
    convertDivToSection(block);
  });
  // 步骤 2：处理 icon 横排 → table
  Array.from(root.querySelectorAll('[data-theme-component="ending"]')).forEach(block => {
    const card = block.querySelector('[data-ending-type]') || block;
    Array.from(card.children).forEach(rowEl => {
      // section 或 div 都看
      if (rowEl.tagName !== 'SECTION' && rowEl.tagName !== 'DIV') return;
      const icons = Array.from(rowEl.children).filter(c =>
        (c.tagName === 'SECTION' || c.tagName === 'DIV') &&
        (c.getAttribute('data-theme-role') || '').startsWith('icon-')
      );
      if (icons.length < 2) return;
      if (rowEl.querySelector('table[data-icons-table]')) return;
      const table = document.createElement('table');
      table.setAttribute('data-icons-table', 'true');
      table.style.cssText = 'margin:0 auto 24px;border-collapse:collapse;border-spacing:0;border:0';
      const tr = document.createElement('tr');
      icons.forEach(icon => {
        const td = document.createElement('td');
        td.style.cssText = 'padding:0 12px;vertical-align:middle;border:0';
        const clone = icon.cloneNode(true);
        if (clone.style) {
          // 清残留 flex/居中相关属性
          clone.style.alignItems = '';
          clone.style.justifyContent = '';
          clone.style.margin = '';
          // 强制 inline-block 让圆形 + line-height 居中起作用
          clone.style.display = 'inline-block';
          if (!clone.style.lineHeight && clone.style.height) {
            clone.style.lineHeight = clone.style.height;
          }
          if (!clone.style.textAlign) clone.style.textAlign = 'center';
          if (!clone.style.verticalAlign) clone.style.verticalAlign = 'middle';
        }
        td.appendChild(clone);
        tr.appendChild(td);
      });
      table.appendChild(tr);
      rowEl.replaceWith(table);
    });
  });
  // 步骤 3：给所有 ending block 内的 table 强制 border:0，防止 WeChat 注入默认边框
  Array.from(root.querySelectorAll('[data-theme-component="ending"] table')).forEach(table => {
    if (!table.style.borderCollapse) table.style.borderCollapse = 'collapse';
    if (!table.style.borderSpacing) table.style.borderSpacing = '0';
    table.style.border = '0';
    Array.from(table.querySelectorAll('td')).forEach(td => { td.style.border = '0'; });
  });
}
// 把一个 <div> 元素原地替换成 <section>，保留所有属性、样式和子节点
function convertDivToSection(el) {
  if (!el || el.tagName !== 'DIV') return el;
  const section = document.createElement('section');
  for (const attr of Array.from(el.attributes)) {
    section.setAttribute(attr.name, attr.value);
  }
  while (el.firstChild) section.appendChild(el.firstChild);
  el.replaceWith(section);
  return section;
}
// design-heading / design-intro / design-ending: 把内部 flex 布局转成 table，公众号才能横向显示
function normalizeWechatDesignComponents(root) {
  // 1. design-heading 外壳：左编号列 + 右标题列
  Array.from(root.querySelectorAll('[data-theme-component="design-heading"]')).forEach(el => {
    convertTwoColumnFlexToTable(el, { leftWidth: 'auto', gap: 16, margin: el.style.margin || '36px 0 24px', flattenWraps: true, keepDataAttr: 'design-heading' });
  });

  // 2. design-intro 内部：主行（title + badge）+ 底栏 bar（左右两端文字）
  Array.from(root.querySelectorAll('[data-theme-component="design-intro"]')).forEach(intro => {
    Array.from(intro.querySelectorAll('section')).forEach(sec => {
      if ((sec.style.display || '').toLowerCase() !== 'flex') return;
      const kids = Array.from(sec.children).filter(c => c.tagName === 'SECTION');
      // 主行：两个 section，其中之一是 badge
      if (kids.length === 2 && kids.some(c => c.getAttribute('data-theme-role') === 'badge')) {
        // 把右侧的 badge 设为固定宽度，左侧 auto
        const badgeIdx = kids.findIndex(c => c.getAttribute('data-theme-role') === 'badge');
        const rightWidth = (kids[badgeIdx].style.width || '108px');
        if (badgeIdx === 1) {
          convertTwoColumnFlexToTable(sec, { leftWidth: 'auto', rightWidth, gap: 18 });
        } else {
          convertTwoColumnFlexToTable(sec, { leftWidth: rightWidth, rightWidth: 'auto', gap: 18 });
        }
      }
    });
    // 底栏 bar：保留背景/内边距，里面塞 table 做左右两端
    const bar = intro.querySelector('[data-theme-role="bar"]');
    if (bar && (bar.style.display || '').toLowerCase() === 'flex') {
      convertJustifyBetweenToInnerTable(bar);
    }
  });

  // 3. design-ending 内部：编号行（/// LAST + 标题）
  Array.from(root.querySelectorAll('[data-theme-component="design-ending"]')).forEach(ending => {
    Array.from(ending.children).forEach(child => {
      if (child.tagName !== 'SECTION') return;
      if ((child.style.display || '').toLowerCase() !== 'flex') return;
      const kids = Array.from(child.children).filter(c => c.tagName === 'SECTION');
      if (kids.length !== 2) return;
      // 跳过含 badge 的（design-intro 处理过类似），这里专门处理编号列在左的情况
      if (kids.some(c => c.getAttribute('data-theme-role') === 'badge')) return;
      const firstStyle = (kids[0].getAttribute('style') || '').toLowerCase();
      if (/text-align\s*:\s*center/.test(firstStyle) && /(flex-shrink|min-width)/.test(firstStyle)) {
        convertTwoColumnFlexToTable(child, { leftWidth: 'auto', gap: 16, marginBottom: child.style.marginBottom || '', flattenWraps: true });
      }
    });
  });
}

function convertTwoColumnFlexToTable(flexEl, opts) {
  const children = Array.from(flexEl.children).filter(c => c.nodeType === 1);
  if (children.length !== 2) return;
  const leftWidth = opts.leftWidth || 'auto';
  const rightWidth = opts.rightWidth || 'auto';
  const gap = opts.gap || 0;
  const table = document.createElement('table');
  if (opts.keepDataAttr) table.setAttribute('data-theme-component', opts.keepDataAttr);
  // 显式 display:table 防止微信把 table 降级成 block 导致两列竖向堆叠
  // 不写 max-width / table-layout:fixed，避免 Word 中转后变 width:600px 触发微信「宽度异常」
  let css = 'display:table;width:100%;border-collapse:collapse;border-spacing:0;border:0';
  if (opts.margin) css += ';margin:' + opts.margin;
  if (opts.marginBottom && !opts.margin) css += ';margin-bottom:' + opts.marginBottom;
  table.style.cssText = css;
  const tr = document.createElement('tr');
  tr.style.cssText = 'display:table-row';
  const widths = [leftWidth, rightWidth];
  children.forEach((child, i) => {
    const td = document.createElement('td');
    // display:table-cell + padding:0 防止微信加默认间距
    let tdCss = 'display:table-cell;border:0;vertical-align:middle;padding:0';
    // 微信检测要求 width 只能是 auto / 100% / 百分比，px 值直接丢弃，靠 white-space:nowrap 控制窄列
    if (widths[i] === '100%') tdCss += ';width:100%';
    else if (widths[i] && widths[i] !== 'auto' && !/px\s*$/i.test(widths[i])) tdCss += ';width:' + widths[i];
    else if (i === 1) tdCss += ';width:100%';
    else tdCss += ';white-space:nowrap';
    if (i === 1 && gap > 0) tdCss += ';padding-left:' + gap + 'px';
    // 把内层包裹元素（section/div）的有效样式提到 td，子元素直接放入 td
    // 避免 flex:1 等属性在非 flex 上下文里被微信误处理
    if (opts.flattenWraps && child.style) {
      if (child.style.textAlign) tdCss += ';text-align:' + child.style.textAlign;
    }
    td.style.cssText = tdCss;
    if (opts.flattenWraps) {
      while (child.firstChild) td.appendChild(child.firstChild);
    } else {
      td.appendChild(child);
    }
    tr.appendChild(td);
  });
  table.appendChild(tr);
  flexEl.replaceWith(table);
}

function convertJustifyBetweenToInnerTable(flexEl) {
  const children = Array.from(flexEl.children).filter(c => c.nodeType === 1);
  if (children.length < 2) return;
  // 外壳保留背景/内边距，去掉 flex
  flexEl.style.display = 'block';
  flexEl.style.justifyContent = '';
  flexEl.style.alignItems = '';
  flexEl.style.gap = '';
  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;border-spacing:0;border:0';
  const tr = document.createElement('tr');
  children.forEach((child, i) => {
    const td = document.createElement('td');
    let align = 'center';
    if (i === 0) align = 'left';
    else if (i === children.length - 1) align = 'right';
    td.style.cssText = 'border:0;vertical-align:middle;text-align:' + align;
    td.appendChild(child);
    tr.appendChild(td);
  });
  table.appendChild(tr);
  while (flexEl.firstChild) flexEl.firstChild.remove();
  flexEl.appendChild(table);
}

// numbered-heading: flex 横排（数字|竖线|标题）→ table，避免公众号剥离 flex 后竖向堆叠
function normalizeWechatNumberedHeadings(root) {
  Array.from(root.querySelectorAll('[data-theme-component="numbered-heading"]')).forEach(el => {
    const children = Array.from(el.children);
    if (children.length < 2) return;
    const borderBottom = el.style.borderBottom || '';
    const margin = el.style.margin || '1.2em 0 0.6em';
    const table = document.createElement('table');
    table.setAttribute('data-theme-component', 'numbered-heading');
    table.style.cssText = `width:100%;border-collapse:collapse;border-spacing:0;border:0;${borderBottom ? 'border-bottom:' + borderBottom + ';' : ''}margin:${margin}`;
    const tr = document.createElement('tr');
    children.forEach((child, i) => {
      const td = document.createElement('td');
      td.setAttribute('style', child.getAttribute('style') || '');
      td.style.flexShrink = '';
      td.style.flex = '';
      td.style.display = '';
      td.style.border = '0';
      td.style.verticalAlign = 'middle';
      td.style.paddingTop = '14px';
      td.style.paddingBottom = '14px';
      if (i === children.length - 1) td.style.width = '100%';
      while (child.firstChild) td.appendChild(child.firstChild);
      tr.appendChild(td);
    });
    table.appendChild(tr);
    el.replaceWith(table);
  });
}
// WeChat editor drops display:flex on divs. Convert any centered flex container
// (used for hr decorations, ending card icon rows, etc.) to inline-block layout.
function normalizeWechatFlexLayouts(root) {
  Array.from(root.querySelectorAll('div')).forEach(div => {
    if ((div.style.display || '').toLowerCase() !== 'flex') return;
    const jc = (div.style.justifyContent || '').toLowerCase();
    // Only normalize centered or unset flex (decorative patterns).
    // Skip flex layouts the user intentionally aligned to start/end/space-between.
    if (jc && jc !== 'center') return;

    const gapPx = parseInt(div.style.gap || '0', 10) || 0;
    div.style.display = 'block';
    div.style.justifyContent = '';
    div.style.alignItems = '';
    div.style.gap = '';
    if (!div.style.textAlign) div.style.textAlign = 'center';
    // Collapse whitespace between inline-block children
    if (gapPx > 0) div.style.fontSize = '0';

    Array.from(div.children).forEach(child => {
      if (!child.style) return;
      const childDisplay = (child.style.display || '').toLowerCase();
      // Inner flex (e.g. icon circle centering its emoji): convert to inline-block + line-height
      if (childDisplay === 'flex') {
        const h = child.style.height || '';
        child.style.display = 'inline-block';
        child.style.alignItems = '';
        child.style.justifyContent = '';
        if (h) child.style.lineHeight = h;
        if (!child.style.textAlign) child.style.textAlign = 'center';
      } else if (!childDisplay || childDisplay === 'block' || childDisplay === 'inline') {
        child.style.display = 'inline-block';
      }
      child.style.verticalAlign = child.style.verticalAlign || 'middle';
      // Convert gap → margin
      if (gapPx > 0 && !child.style.margin) {
        child.style.margin = `0 ${gapPx / 2}px`;
      }
      // If parent set font-size:0 to kill whitespace, ensure text children have own font-size
      if (gapPx > 0 && !child.style.fontSize) {
        // Only set if there's text content to render (avoid touching empty spans with bg color)
        const hasText = (child.textContent || '').trim().length > 0;
        if (hasText) child.style.fontSize = '14px';
      }
    });
  });
}
function sanitizeContentHTML(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html || '');
  sanitizeElementTree(tpl.content);
  normalizeImagePairs(tpl.content);
  return tpl.innerHTML;
}
function insertSafeHTML(html) {
  const safeHtml = sanitizeContentHTML(html);
  const sel = window.getSelection();
  let range;
  if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
    range = sel.getRangeAt(0);
  } else {
    range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
  }
  range.deleteContents();
  const tpl = document.createElement('template');
  tpl.innerHTML = safeHtml;
  const frag = tpl.content.cloneNode(true);
  const lastChild = frag.lastChild;
  range.insertNode(frag);
  if (lastChild && sel) {
    try {
      const endRange = document.createRange();
      endRange.setStartAfter(lastChild);
      endRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(endRange);
    } catch (e) {}
  }
}

// ===================================================================
// IMAGE INSERT
// ===================================================================
let pendingImgData = [];
let savedEditorRange = null;
let targetBadgeForImage = null; // Track if we're inserting image into a badge
function getValidImageFiles(files, limit = Infinity) {
  const list = Array.from(files || []).filter(Boolean).slice(0, limit);
  const badFile = list.find(file => !/^image\/(?:png|jpe?g|gif|webp)$/i.test(file.type));
  if (badFile) {
    alert('仅支持 PNG、JPG、GIF、WebP 图片，已拦截不安全格式');
    return null;
  }
  const largeFile = list.find(file => file.size > 10 * 1024 * 1024);
  if (largeFile) {
    alert('单张图片不能超过 10MB');
    return null;
  }
  return list;
}
// 客户端压缩：超 1200px 自动缩放，统一转 JPEG（quality 0.85）
// 已经够小的不动，避免重复压损画质。GIF 保留原图（避免动图变静图）。
function compressImageDataURL(dataURL, maxDim = 1200, quality = 0.85, sizeThresholdKB = 200) {
  return new Promise(resolve => {
    if (typeof dataURL !== 'string' || !dataURL.startsWith('data:image/')) {
      resolve(dataURL); return;
    }
    if (dataURL.startsWith('data:image/gif')) { resolve(dataURL); return; } // 不压动图
    const img = new Image();
    img.onload = () => {
      try {
        const max = Math.max(img.width, img.height);
        const sizeKB = (dataURL.length * 3 / 4) / 1024;
        if (max <= maxDim && sizeKB < sizeThresholdKB) { resolve(dataURL); return; }
        const scale = max > maxDim ? maxDim / max : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        // 透明 PNG 转 JPEG 会变黑底，先铺白底
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const out = canvas.toDataURL('image/jpeg', quality);
        resolve(out.length < dataURL.length ? out : dataURL);
      } catch { resolve(dataURL); }
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}
function readImageFiles(files) {
  return Promise.all(files.map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = async e => {
      const compressed = await compressImageDataURL(e.target.result);
      resolve({ file, src: sanitizeImageSrc(compressed) });
    };
    reader.onerror = () => resolve({ file, src: '' });
    reader.readAsDataURL(file);
  })));
}
function restoreEditorRange(range) {
  editor.focus();
  const sel = window.getSelection();
  sel.removeAllRanges();
  if (range) {
    sel.addRange(range);
    return;
  }
  const fallback = document.createRange();
  fallback.selectNodeContents(editor);
  fallback.collapse(false);
  sel.addRange(fallback);
}
function buildSingleImageHTML(src) {
  return `<img src="${escapeAttr(src)}" style="max-width:100%;border-radius:12px;height:auto;display:block;margin:12px auto;" alt="image"><br>`;
}
function toggleMoreDropdown() {
  const p = $('moreDropdown');
  p.classList.toggle('show');
  $('imgPanel')?.classList.remove('show');
  $('hrPanel')?.classList.remove('show');
  $('alignPanel')?.classList.remove('show');
}
function toggleImgPanel() {
  const p = $('imgPanel');
  const willClose = p.classList.contains('show');
  // Save cursor position before opening panel
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
    savedEditorRange = sel.getRangeAt(0).cloneRange();
  }
  p.classList.toggle('show');
  // If user is closing the panel without inserting, drop the badge target
  // so the next normal image insert doesn't accidentally land in an old badge.
  if (willClose) targetBadgeForImage = null;
  $('hrPanel')?.classList.remove('show');
  $('alignPanel')?.classList.remove('show');
}
function toggleHrPanel() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
    savedEditorRange = sel.getRangeAt(0).cloneRange();
  }
  const p = $('hrPanel');
  p.classList.toggle('show');
  $('imgPanel')?.classList.remove('show');
  $('alignPanel')?.classList.remove('show');
}
function insertSpacer(size) {
  const heights = { sm: 12, md: 24, lg: 48 };
  const h = heights[size] || 24;
  restoreEditorRange(savedEditorRange);
  savedEditorRange = null;
  insertSafeHTML(`<div data-theme-role="spacer" style="height:${h}px;line-height:${h}px"><br></div>`);
  $('hrPanel')?.classList.remove('show');
  editor.focus();
  scheduleUpdate();
}
function insertDivider(style) {
  restoreEditorRange(savedEditorRange);
  savedEditorRange = null;
  insertSafeHTML(`<hr data-hr-style="${escapeAttr(style)}">`);
  $('hrPanel')?.classList.remove('show');
  editor.focus();
  scheduleUpdate();
}
function switchImgTab(tab, btn) {
  $('imgTabUpload').style.display = tab === 'upload' ? '' : 'none';
  $('imgTabUrl').style.display = tab === 'url' ? '' : 'none';
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  pendingImgData = [];
}
function switchImgLayout(layout) {
  const isDouble = layout === 'double';
  const secondUrl = $('imgUrlInput2');
  const note = $('imgLayoutNote');
  if (secondUrl) secondUrl.style.display = isDouble ? '' : 'none';
  if (note) {
    note.textContent = isDouble
      ? '双图并排适合两张横图、对比图或步骤图；本地上传可一次选择2张。'
      : '单张图片适合封面、长图和正文配图。';
  }
}
function handleImgFile(input) {
  const files = getValidImageFiles(input.files, 2);
  if (!files || !files.length) {
    input.value = '';
    return;
  }
  readImageFiles(files).then(items => {
    pendingImgData = items.map(item => item.src).filter(Boolean);
    if (pendingImgData.length !== files.length) {
      alert('图片读取失败或格式不安全');
      return;
    }
    // Visual feedback: show thumbnail + filename
    const area = input.closest('.img-upload-area') || input.parentElement;
    const thumbs = items.map(item => `<div style="flex:1;min-width:0;text-align:center"><img src="${escapeAttr(item.src)}" style="max-width:100%;max-height:96px;border-radius:8px;margin-bottom:6px;object-fit:cover"><br><span style="font-size:11px;color:#16a34a;font-weight:600;word-break:break-all">✅ ${escapeHtml(item.file.name)}</span></div>`).join('');
    area.innerHTML = `<div style="display:flex;gap:8px;align-items:flex-start">${thumbs}</div><input type="file" id="imgFileInput" accept="image/png,image/jpeg,image/gif,image/webp" onchange="handleImgFile(this)" style="display:none" multiple>`;
  });
}
// Show/hide border color pickers when border width > 0
document.addEventListener('DOMContentLoaded', () => {
  const bwInput = document.getElementById('imgBorderW');
  if (bwInput) bwInput.addEventListener('input', () => {
    const show = parseInt(bwInput.value) > 0;
    document.getElementById('imgBorderColors').style.display = show ? 'flex' : 'none';
  });
});
function doInsertImage() {
  const layout = $('imgLayout')?.value || 'single';
  const isDouble = layout === 'double';
  let srcList = pendingImgData.length ? pendingImgData.slice(0, isDouble ? 2 : 1) : [
    sanitizeImageSrc($('imgUrlInput').value.trim()),
    sanitizeImageSrc($('imgUrlInput2')?.value.trim())
  ].filter(Boolean).slice(0, isDouble ? 2 : 1);
  if (!srcList.length) { alert('请选择安全的图片，或输入 http/https 图片URL'); return; }
  if (isDouble && srcList.length < 2) { alert('双图并排需要选择或输入2张图片'); return; }
  const align = $('imgAlign').value;
  const w = clampNumber($('imgWidth').value, 10, 100, 100);
  const radius = clampNumber($('imgRadius').value, 0, 50, 12);
  const borderW = clampNumber($('imgBorderW').value, 0, 10, 0);
  let baseStyle = `max-width:${isDouble ? 100 : w}%;border-radius:${radius}px;height:auto;`;
  if (borderW > 0) {
    const c1 = sanitizeColorValue($('imgBorderC1').value, '#E5E7EB');
    const c2 = sanitizeColorValue($('imgBorderC2').value, '#0066FF');
    baseStyle = `max-width:${isDouble ? 100 : w}%;border-radius:${radius}px;height:auto;border:${borderW}px solid transparent;background-clip:padding-box;box-shadow:0 0 0 ${borderW}px ${c1},inset 0 0 0 0 transparent;background-image:linear-gradient(white,white),linear-gradient(135deg,${c1},${c2});background-origin:border-box;background-clip:padding-box,border-box;`;
  }
  let imgHtml = '';
  if (isDouble) {
    const groupMargin = align === 'right' ? '12px 0 12px auto' : align === 'left' ? '12px auto 12px 0' : '12px auto';
    const groupWidth = `${w}%`;
    const cells = srcList.map((src, idx) => `<td style="width:50%;padding:${idx === 0 ? '0 0.5mm 0 0' : '0 0 0 0.5mm'};vertical-align:top;box-sizing:border-box;"><img src="${escapeAttr(src)}" style="${escapeAttr(baseStyle + 'display:block;width:100%;max-width:100%;margin:0;object-fit:cover;box-sizing:border-box;')}" alt="image ${idx + 1}"></td>`).join('');
    imgHtml = `<table data-layout="image-pair" style="width:${groupWidth};max-width:100%;margin:${groupMargin};border-collapse:separate;border-spacing:0;table-layout:fixed;box-sizing:border-box;"><tbody><tr>${cells}</tr></tbody></table><p><br></p>`;
  } else {
    let style = baseStyle;
    if (align === 'center') style += 'display:block;margin:12px auto;';
    else if (align === 'right') style += 'display:block;margin:12px 0 12px auto;';
    else style += 'display:block;margin:12px auto 12px 0;';
    imgHtml = `<img src="${escapeAttr(srcList[0])}" style="${escapeAttr(style)}" alt="image"><br>`;
  }

  // Check if we're inserting into a badge
  if (targetBadgeForImage) {
    const badge = targetBadgeForImage;
    // 用 <img> 标签替代 background-image：微信公众号会剥离 inline style 里的
    // background-image:url(...)，必须用 <img> 才能在复制后保留图片显示
    // 给 badge 一个明确的 120px 方形尺寸，否则 td 是 white-space:nowrap + section 无显式宽度
    // + img width:100% 形成环形依赖 → 浏览器把列宽算成 0，整个 badge 视觉消失
    const imgSrc = srcList[0];
    badge.innerHTML = `<img src="${escapeAttr(imgSrc)}" alt="image" style="display:block;width:120px;height:120px;border-radius:14px;object-fit:cover;">`;
    badge.setAttribute('data-badge-has-image', '1');
    badge.style.padding = '0';
    badge.style.width = '120px';
    badge.style.height = '120px';
    badge.style.background = '';
    badge.style.backgroundImage = '';
    badge.style.backgroundSize = '';
    badge.style.backgroundPosition = '';
    badge.title = '点击更换图片';
    badge.style.cursor = 'pointer';
    targetBadgeForImage = null;
    $('imgPanel').classList.remove('show');
    pendingImgData = [];
    $('imgUrlInput').value = '';
    if ($('imgUrlInput2')) $('imgUrlInput2').value = '';
    const uploadArea = $('imgTabUpload');
    if (uploadArea) {
      uploadArea.innerHTML = `<div class="img-upload-area" onclick="document.getElementById('imgFileInput').click()">点击选择图片，双图并排可一次选择2张<input type="file" id="imgFileInput" accept="image/png,image/jpeg,image/gif,image/webp" onchange="handleImgFile(this)" multiple></div>`;
    }
    scheduleUpdate();
    return;
  }

  // Restore focus and cursor to editor before inserting
  editor.focus();
  const sel = window.getSelection();
  if (savedEditorRange) {
    try {
      sel.removeAllRanges();
      sel.addRange(savedEditorRange);
    } catch (e) {
      // stale range — fall back to end of editor
      const r = document.createRange();
      r.selectNodeContents(editor);
      r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
    }
    savedEditorRange = null;
  } else {
    const r = document.createRange();
    r.selectNodeContents(editor);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  }
  insertSafeHTML(imgHtml);
  $('imgPanel').classList.remove('show');
  pendingImgData = [];
  $('imgUrlInput').value = '';
  if ($('imgUrlInput2')) $('imgUrlInput2').value = '';
  // Reset upload area
  const uploadArea = $('imgTabUpload');
  if (uploadArea) {
    uploadArea.innerHTML = `<div class="img-upload-area" onclick="document.getElementById('imgFileInput').click()">点击选择图片，双图并排可一次选择2张<input type="file" id="imgFileInput" accept="image/png,image/jpeg,image/gif,image/webp" onchange="handleImgFile(this)" multiple></div>`;
  }
  scheduleUpdate();
}

// ===================================================================
// TEXT HIGHLIGHT (Navy bold)
// ===================================================================
function applyTextHighlight() {
  const sel = window.getSelection();
  if (!sel.rangeCount || sel.isCollapsed) {
    alert('请先选中要高亮的文字');
    return;
  }
  const range = getSelectionRangeInEditor();
  if (!range) return;
  const existing = getIntersectingHighlights(range);
  if (existing.length) {
    existing.forEach(unwrapElement);
    editor.focus();
    scheduleUpdate();
    updateToolbarStates();
    return;
  }
  const c = getColors();
  const color = c.main || '#133363';
  const selectedHTML = getRangeHTML(range);
  document.execCommand('insertHTML', false, `<span data-editor-highlight="true" style="color:${color};font-weight:700">${selectedHTML}</span>`);
  editor.focus();
  scheduleUpdate();
  updateToolbarStates();
}

function getEditorHighlight(node) {
  let el = getElementFromNode(node);
  while (el && el !== editor) {
    if (el.getAttribute('data-editor-highlight') === 'true') return el;
    el = el.parentElement;
  }
  return null;
}

function isSelectionInEditorHighlight() {
  const range = getSelectionRangeInEditor();
  if (!range) return false;
  return !!getEditorHighlight(range.startContainer) && !!getEditorHighlight(range.endContainer);
}

function getIntersectingHighlights(range) {
  const highlights = new Set();
  const start = getEditorHighlight(range.startContainer);
  const end = getEditorHighlight(range.endContainer);
  if (start) highlights.add(start);
  if (end) highlights.add(end);
  editor.querySelectorAll('[data-editor-highlight="true"]').forEach(el => {
    try {
      if (range.intersectsNode(el)) highlights.add(el);
    } catch (e) {}
  });
  return Array.from(highlights);
}

function getRangeHTML(range) {
  const holder = document.createElement('div');
  holder.appendChild(range.cloneContents());
  return sanitizeContentHTML(holder.innerHTML || escapeHtml(range.toString()));
}

function getRangeTextAsParagraphs(range) {
  return String(range?.toString() || '')
    .split(/\n{1,}/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('');
}

function unwrapElement(el) {
  if (!el || !el.parentNode) return;
  const parent = el.parentNode;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
  parent.normalize();
}

// ===================================================================
// INSERT NUMBERED HEADING
// ===================================================================
let _sectionCounter = 0;
function insertNumberedHeading() {
  _sectionCounter++;
  const num = String(_sectionCounter).padStart(2, '0');
  const c = getColors();
  const mainColor = c.main || '#133363';
  const html = `<div data-theme-component="numbered-heading" style="display:flex;align-items:center;padding:14px 0;border-bottom:1px solid ${alphaColor(mainColor, 0.22, '#d4d4d4')};margin:1.2em 0 0.6em;">
    <div style="flex-shrink:0;padding-right:16px;min-width:48px;text-align:center;">
      <span data-theme-role="number" style="font-size:32px;font-weight:900;color:${mainColor};line-height:1;letter-spacing:-1px;">${num}</span>
    </div>
    <span data-theme-role="divider" style="display:inline-block;border-left:1px solid ${alphaColor(mainColor, 0.26, '#c8c8c8')};height:36px;vertical-align:middle;margin-right:16px;flex-shrink:0;"></span>
    <div style="flex:1;">
      <span data-theme-role="title" style="font-size:18px;font-weight:700;color:${mainColor};line-height:1.4;letter-spacing:0.02em;">在此输入标题</span>
    </div>
  </div><p><br></p>`;
  document.execCommand('insertHTML', false, html);
  editor.focus();
  scheduleUpdate();
}

// ===================================================================
// INSERT TIP CARD
// ===================================================================
function insertTipCard() {
  const range = getSelectionRangeInEditor();
  const selectedHTML = range && !range.collapsed
    ? (getRangeHTML(range) || getRangeTextAsParagraphs(range))
    : '';
  const html = buildTipCardHTML(selectedHTML);
  document.execCommand('insertHTML', false, html);
  editor.focus();
  scheduleUpdate();
}

function buildTipCardHTML(bodyHTML) {
  const c = getColors();
  const bgColor = c.sub || '#F6F6F6';
  const textColor = c.text || '#333';
  const accentColor = c.main || '#133363';
  const body = normalizeTipCardBodyHTML(bodyHTML || '<p>在此输入提示内容</p>', textColor);
  return `<section data-theme-component="tip-card" style="display:block;background:${bgColor};border-left:4px solid ${accentColor};border-radius:12px;padding:18px 22px;margin:1.2em 0;box-sizing:border-box;width:100%;max-width:100%;">
    <p data-theme-role="title" style="font-size:15px;font-weight:700;color:${accentColor};line-height:1.6;margin:0 0 8px;">提示</p>
    <section data-theme-role="body" style="display:block;font-size:15px;font-weight:400;color:${textColor};line-height:1.8;margin:0;padding:0;">${body}</section>
  </section><p><br></p>`;
}

function normalizeTipCardBodyHTML(html, textColor) {
  const tpl = document.createElement('template');
  tpl.innerHTML = sanitizeContentHTML(html || '');
  const hasBlock = Array.from(tpl.content.childNodes).some(isBlockContentElement);
  if (!hasBlock) {
    const text = tpl.content.textContent || '在此输入提示内容';
    tpl.innerHTML = text.split(/\n{1,}/).map(line => line.trim()).filter(Boolean).map(line => `<p>${escapeHtml(line)}</p>`).join('');
  }
  const wrapper = document.createElement('section');
  wrapper.appendChild(tpl.content.cloneNode(true));
  Array.from(wrapper.querySelectorAll('p,div,section,span')).forEach(el => {
    if (el.getAttribute('data-theme-role') === 'title') return;
    el.style.fontSize = '15px';
    el.style.fontWeight = '400';
    el.style.lineHeight = '1.8';
    el.style.color = textColor;
    el.style.margin = el.tagName === 'P' ? '0 0 8px' : (el.style.margin || '0');
    el.style.letterSpacing = '0.02em';
  });
  return wrapper.innerHTML || `<p style="font-size:15px;font-weight:400;color:${textColor};line-height:1.8;margin:0;">在此输入提示内容</p>`;
}

// ===================================================================
// DESIGN LAYOUT COMPONENTS
// ===================================================================
let _designSectionCounter = 0;
function showDesignLayoutPanel() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
    savedEditorRange = sel.getRangeAt(0).cloneRange();
  }
  const c = getColors();
  const main = c.main || '#059669';
  showModal(`
    <h3>插入图片</h3>
    <p style="font-size:12px;color:#999;margin-bottom:16px">复刻品牌实战类文章结构：开头总结框、小标题和结尾。</p>
      <div id="designLayoutChoices" style="display:grid;grid-template-columns:1fr;gap:10px">
      <button type="button" data-design-action="intro" style="border:2px solid #e5e7eb;border-radius:8px;padding:14px;cursor:pointer;transition:all .2s;background:#fff;text-align:left">
        <div style="font-size:13px;font-weight:700;color:${main};margin-bottom:4px">开头总结框</div>
        <div style="font-size:11px;color:#999">适合放文章节点、关键词、教程目录和一句话主题</div>
      </button>
      <button type="button" data-design-action="heading" style="border:2px solid #e5e7eb;border-radius:8px;padding:14px;cursor:pointer;transition:all .2s;background:#fff;text-align:left">
        <div style="font-size:13px;font-weight:700;color:${main};margin-bottom:4px">设计小标题</div>
        <div style="font-size:11px;color:#999">左侧大编号 + PART，右侧标题 + 英文副标题</div>
      </button>
      <button type="button" data-design-action="ending" style="border:2px solid #e5e7eb;border-radius:8px;padding:14px;cursor:pointer;transition:all .2s;background:#fff;text-align:left">
        <div style="font-size:13px;font-weight:700;color:${main};margin-bottom:4px">设计结尾</div>
        <div style="font-size:11px;color:#999">/// LAST 标题、强调句、总结卡和互动引导</div>
      </button>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="hideModal()">取消</button>
    </div>
  `);
  setupDesignLayoutPanelEvents(main);
}

function setupDesignLayoutPanelEvents(main) {
  const panel = $('designLayoutChoices');
  if (!panel) return;
  panel.querySelectorAll('[data-design-action]').forEach(btn => {
    btn.addEventListener('mouseenter', () => { btn.style.borderColor = main; });
    btn.addEventListener('mouseleave', () => { btn.style.borderColor = '#e5e7eb'; });
    btn.addEventListener('click', () => {
      const action = btn.dataset.designAction;
      if (action === 'intro') insertDesignIntro();
      if (action === 'heading') insertDesignHeading();
      if (action === 'ending') insertDesignEnding();
    });
  });
}

function insertDesignHTML(html) {
  restoreEditorRange(savedEditorRange);
  savedEditorRange = null;
  insertSafeHTML(html);
  hideModal();
  editor.focus();
  scheduleUpdate();
}
function insertDesignIntro() {
  const c = getColors();
  const main = c.main || '#059669';
  const accent = c.accent || main;
  const sub = c.sub || '#ECFDF5';
  const text = c.text || '#374151';
  // 用 table 替代所有 flex，chips 用 inline-block，兼容微信公众号
  const html = `<section data-theme-component="design-intro" style="margin:0 0 32px;background:#fff;border:1.5px solid ${alphaColor(main,0.16,'#d1fae5')};border-radius:16px;overflow:hidden;width:100%;">
    <section style="padding:24px 20px 20px;">
      <table style="width:100%;border-collapse:collapse;border-spacing:0;margin-bottom:18px;"><tbody><tr>
        <td style="padding:0;vertical-align:middle;border:0;">
          <span style="display:inline-block;border-radius:50%;background:${main};padding:4px;font-size:0;line-height:0;vertical-align:middle;margin-right:8px;"></span>
          <span data-theme-role="meta" style="vertical-align:middle;font-size:11px;color:${main};font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">DESIGN · CASE STUDY</span>
        </td>
        <td style="padding:0;text-align:right;vertical-align:middle;border:0;white-space:nowrap;width:100%;">
          <span style="font-size:11px;color:#9CA3AF;">2026</span>
        </td>
      </tr></tbody></table>
      <table style="width:100%;border-collapse:collapse;border-spacing:0;"><tbody><tr>
        <td style="padding:0;vertical-align:top;border:0;width:100%;">
          <p style="font-size:13px;color:#D1D5DB;margin:0 0 6px;text-decoration:line-through;letter-spacing:0.5px;">把内容散着写？</p>
          <p data-theme-role="title" style="font-size:22px;font-weight:900;color:${text};margin:0;line-height:1.1;letter-spacing:0;">一篇文章</p>
          <p data-theme-role="highlight" style="font-size:22px;font-weight:900;color:${main};margin:0 0 12px;line-height:1.1;letter-spacing:0;">讲清一个流程</p>
          <p data-theme-role="body" style="font-size:12px;color:#9CA3AF;margin:0;line-height:1.7;letter-spacing:0.5px;">节点 · 关键词 · 结论</p>
        </td>
        <td style="padding:0 0 0 16px;vertical-align:middle;border:0;white-space:nowrap;">
          <section data-theme-role="badge" style="border-radius:16px;background:linear-gradient(135deg,${alphaColor(main,0.14,sub)},${alphaColor(accent,0.12,'#fff')});text-align:center;padding:40px 24px;" title="点击插入图片">
            <span data-badge-text="true" style="font-size:14px;font-weight:900;color:${main};line-height:1.4;">插入图片</span>
          </section>
        </td>
      </tr></tbody></table>
    </section>
    <section data-theme-role="bar" style="background:linear-gradient(135deg,${main},${accent});padding:11px 20px;border-radius:0 0 14px 14px;">
      <table style="width:100%;border-collapse:collapse;border-spacing:0;"><tbody><tr>
        <td style="padding:0;vertical-align:middle;border:0;">
          <span style="font-size:12px;color:rgba(255,255,255,0.9);font-weight:700;letter-spacing:0.5px;">文章节点</span>
        </td>
        <td style="padding:0;text-align:right;vertical-align:middle;border:0;">
          <span style="font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:1px;">KEYWORDS</span>
        </td>
      </tr></tbody></table>
    </section>
    <section style="padding:14px 18px 18px;"><span data-theme-role="chip-main" style="display:inline-block;background:${main};color:#fff;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:800;margin:0 6px 6px 0;">PART 01 · 背景</span><span data-theme-role="chip" style="display:inline-block;background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:800;color:${text};margin:0 6px 6px 0;">PART 02 · 方法</span><span data-theme-role="chip" style="display:inline-block;background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:800;color:${text};margin:0 6px 6px 0;">PART 03 · 案例</span><span data-theme-role="chip" style="display:inline-block;background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:800;color:${text};margin:0 6px 6px 0;">OUTRO · 总结</span></section>
  </section><p><br></p>`;
  insertDesignHTML(html);
}

function insertDesignHeading() {
  _designSectionCounter++;
  const c = getColors();
  const main = c.main || '#059669';
  const text = c.text || '#111827';
  const num = String(_designSectionCounter).padStart(2, '0');
  // 直接输出 table，微信公众号无需 normalize 即可正确横排
  // 不写 max-width / margin auto / td width:px，避免触发「宽度异常」检测
  const html = `<table data-theme-component="design-heading" style="width:100%;border-collapse:collapse;border-spacing:0;margin:36px 0 24px;display:table;"><tbody><tr style="display:table-row;">
    <td style="display:table-cell;text-align:center;vertical-align:middle;padding:0 16px 0 0;border:0;white-space:nowrap;">
      <p data-theme-role="number" style="margin:0;font-size:28px;font-weight:900;color:${main};line-height:1;letter-spacing:-1px;">${num}</p>
      <p data-theme-role="label" style="margin:0;font-size:8px;font-weight:800;color:#D1D5DB;letter-spacing:2px;line-height:1.4;">PART</p>
    </td>
    <td style="display:table-cell;vertical-align:middle;padding:0;border:0;width:100%;">
      <p data-theme-role="title" style="margin:0 0 1px;font-size:17px;font-weight:900;color:${text};letter-spacing:0.3px;line-height:1.45;">在此输入小标题</p>
      <p data-theme-role="subtitle" style="margin:0;font-size:11px;font-weight:700;color:#9CA3AF;letter-spacing:1.5px;line-height:1.5;">KEYWORD · 在此输入副标题</p>
    </td>
  </tr></tbody></table>`;
  insertDesignHTML(html);
}
function insertDesignEnding() {
  const c = getColors();
  const main = c.main || '#059669';
  const accent = c.accent || main;
  const text = c.text || '#111827';
  const html = `<section data-theme-component="design-ending" style="margin:48px 0 32px;padding:0 4px;">
    <section style="display:flex;align-items:center;gap:16px;margin-bottom:22px;">
      <section style="text-align:center;flex-shrink:0;min-width:54px;">
        <p data-theme-role="number" style="margin:0;font-size:28px;font-weight:900;color:${main};line-height:1;letter-spacing:-1px;">///</p>
        <p data-theme-role="label" style="margin:0;font-size:8px;font-weight:800;color:#D1D5DB;letter-spacing:2px;">LAST</p>
      </section>
      <section style="min-width:0;">
        <p data-theme-role="title" style="margin:0 0 1px;font-size:17px;font-weight:900;color:${text};letter-spacing:0.3px;line-height:1.45;">写在最后</p>
        <p data-theme-role="subtitle" style="margin:0;font-size:11px;font-weight:700;color:#9CA3AF;letter-spacing:1.5px;line-height:1.5;">OUTRO · 一句话总结</p>
      </section>
    </section>
    <p data-theme-role="quote" style="font-size:14px;margin:0 0 20px;text-align:center;color:${main};font-weight:800;letter-spacing:1px;border-top:1px solid #F3F4F6;border-bottom:1px solid #F3F4F6;padding:12px 0;">把复杂流程，变成可以复用的方法</p>
    <section data-theme-role="summary" style="background:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 4px 16px ${alphaColor(main,0.12,'rgba(0,0,0,0.08)')};margin-bottom:24px;text-align:center;">
      <p style="font-size:13px;color:#9CA3AF;margin:0 0 6px;line-height:1.5;">说到底</p>
      <p data-theme-role="summary-title" style="margin:0;line-height:1.6;font-weight:800;color:${text};">这一套设计排版，是为了让读者快速抓住重点</p>
    </section>
    <section data-theme-role="action" style="background:radial-gradient(circle at center,#F9FAFB 0%,#FFFFFF 100%);border:1px solid #E5E7EB;border-radius:16px;padding:30px 20px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
      <p style="font-size:13px;font-weight:800;color:${text};margin:0 0 20px;line-height:1.6;">既然看到这里了，如果觉得有用，随手点个赞、在看、转发三连吧。</p>
      <section style="display:flex;justify-content:center;gap:24px;margin-bottom:16px;">
        <span style="text-align:center;color:#4B5563;font-size:13px;">点赞</span>
        <span style="text-align:center;color:#4B5563;font-size:13px;">在看</span>
        <span data-theme-role="share" style="text-align:center;color:${main};font-size:13px;font-weight:800;">转发</span>
      </section>
      <p style="font-size:10px;color:#9CA3AF;letter-spacing:1px;margin:0;">THANKS FOR READING</p>
    </section>
  </section><p><br></p>`;
  insertDesignHTML(html);
}

// ===================================================================
// SMART PREPROCESS: Plain text -> Markdown
// ===================================================================
const PREPROCESS_MODE_CONFIG = {
  clean: {
    name: '保守整理',
    desc: '清理空行，识别明确标题、列表和引用，不主动新增小标题。'
  },
  longform: {
    name: '长文分层',
    desc: '适合观点文、随笔和复盘，按段落节奏补少量小标题。'
  },
  tutorial: {
    name: '教程步骤',
    desc: '强化步骤、清单、注意事项和常见问题，适合干货教程。'
  },
  recommend: {
    name: '种草清单',
    desc: '强化推荐理由、适合人群、亮点和总结，适合产品/内容推荐。'
  },
  spoken: {
    name: '口播转图文',
    desc: '把口语长段拆成短段，保留原句，阅读节奏更像公众号。'
  }
};

function isConservativeHeadingLine(text, prevLine = '', nextLine = '') {
  const s = String(text || '').trim();
  if (!s) return false;
  if (s.length > 24) return false;
  if (/[。！？!?；;]/.test(s)) return false;
  if (/[，,]/.test(s)) return false;
  if (/^(但|但是|而是|而且|所以|因此|如果|因为|同时|然后|好像|这些|这个|这就|于是|不过|其实|只是|甚至)/.test(s)) return false;

  const prevBlank = !String(prevLine || '').trim();
  const nextBlank = !String(nextLine || '').trim();
  const isolated = prevBlank || nextBlank;
  const numberedHeading = /^(第?[一二三四五六七八九十百千万\d]{1,3}[章节部分条点、.．)）:：]\s*)\S+/.test(s);
  const compactColonHeading = /^[^:：]{2,10}[:：]$/.test(s) && !/[的了是在把被会让让人我们你我他她它]/.test(s.replace(/[:：]$/, ''));
  const commonLabelHeading = /^(前言|导语|引言|目录|摘要|背景|问题|方法|案例|步骤|清单|总结|小结|复盘|结论|写在最后|今日小结|核心观点|重点提示|注意事项)$/.test(s.replace(/[:：]$/, ''));
  const shortIsolatedTitle = isolated && s.length <= 12 && !/[的了是在把被会让]/.test(s) && !/[:：]$/.test(s);

  return numberedHeading || compactColonHeading || commonLabelHeading || shortIsolatedTitle;
}

function isModeHeadingLine(text, mode) {
  const s = String(text || '').trim().replace(/[:：]$/, '');
  if (!s || s.length > 28) return false;
  if (/[。！？!?；;，,]/.test(s)) return false;

  const tutorialLabels = /^(准备工作|前置准备|操作步骤|具体步骤|步骤一|步骤二|步骤三|第一步|第二步|第三步|第四步|注意事项|常见问题|避坑提醒|使用方法|实操流程|案例演示|最终效果)$/;
  const recommendLabels = /^(推荐理由|适合人群|不适合谁|核心亮点|主要优点|缺点不足|使用体验|购买建议|价格参考|总结|一句话总结|我的感受|真实体验)$/;
  const spokenLabels = /^(先说结论|说个重点|还有一点|换句话说|最后总结|讲个例子|重点来了)$/;

  if (mode === 'tutorial') return tutorialLabels.test(s);
  if (mode === 'recommend') return recommendLabels.test(s);
  if (mode === 'spoken') return spokenLabels.test(s);
  return false;
}

function summarizeHeadingCandidate(text) {
  let s = String(text || '').trim().replace(/[:：]\s*$/, '');
  if (!s || s.length > 42) return '';
  if (!/[:：]$/.test(String(text || '').trim())) return '';

  const keywordRules = [
    { re: /不适感|不舒服|不安|焦虑|压力/, title: '不适感' },
    { re: /另一件事|另一层问题/, title: '另一件事' },
    { re: /奇怪的结构|结构/, title: '奇怪结构' },
    { re: /AI的意义|意义/, title: 'AI的意义' },
    { re: /成本|效率|收入|消费/, title: '效率与成本' },
    { re: /总结|小结|复盘/, title: '小结' }
  ];
  const matched = keywordRules.find(rule => rule.re.test(s));
  if (matched) return matched.title;

  const parts = s.split(/[，,；;]/).map(x => x.trim()).filter(Boolean);
  let core = parts.length > 1 ? parts[parts.length - 1] : s;
  core = core
    .replace(/^(这就|这是|这些|这种|那就是|而是|但是|但|所以|因此|然后|其实|只是|好像)/, '')
    .replace(/^(会让人|让人|让我们|让你|让他|让她|产生了?|形成了?|变成了?|带来了?|导致了?)/, '')
    .replace(/^(一个|一种|一件|很强的|很大的|很奇怪的|很明显的|真正的|了一个|了一种|了一件)/, '')
    .replace(/^(的|了|是)/, '')
    .trim();

  core = core.replace(/[“”"']/g, '').replace(/\s+/g, '');
  if (!core || core.length < 3) return '';
  if (/^(另一件事|一件事|一个问题|这个问题|这些变化)$/.test(core)) return '';
  return core.length > 12 ? core.slice(0, 12) : core;
}

function normalizePreprocessText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/\t/g, '  ')
    .replace(/[ \f\v]+$/gm, '');
}

function splitLongPlainLine(line, maxLen) {
  const s = String(line || '').trim();
  if (s.length <= maxLen) return [s];
  const parts = s.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [s];
  const chunks = [];
  let current = '';
  parts.forEach(part => {
    const piece = part.trim();
    if (!piece) return;
    if (current && (current + piece).length > maxLen) {
      chunks.push(current);
      current = piece;
    } else {
      current += piece;
    }
  });
  if (current) chunks.push(current);
  return chunks.length ? chunks : [s];
}

function preparePreprocessLines(rawText, mode) {
  const sourceLines = normalizePreprocessText(rawText).split('\n');
  const lines = [];
  const maxLen = mode === 'spoken' ? 72 : 120;
  const shouldSplit = mode === 'spoken' || mode === 'longform';

  sourceLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      lines.push('');
      return;
    }
    if (shouldSplit && !/^#{1,3}\s/.test(trimmed) && !/^```/.test(trimmed) && trimmed.length > maxLen) {
      splitLongPlainLine(trimmed, maxLen).forEach(part => lines.push(part));
      return;
    }
    lines.push(trimmed);
  });
  return lines;
}

function convertListLine(trimmed, mode) {
  if (/^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) return trimmed;

  const bulletMatch = trimmed.match(/^[·•●○–—▪▫►▶]\s*(.+)/);
  if (bulletMatch) return '- ' + bulletMatch[1];

  const orderedMatch = trimmed.match(/^(\d{1,2})[、.．)）]\s*(.+)/);
  if (orderedMatch) return `${orderedMatch[1]}. ${orderedMatch[2]}`;

  const bracketMatch = trimmed.match(/^[（(]([一二三四五六七八九十\d]{1,3})[）)]\s*(.+)/);
  if (bracketMatch) return `- ${bracketMatch[2]}`;

  const circledNumbers = '①②③④⑤⑥⑦⑧⑨⑩';
  const circledMatch = trimmed.match(/^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.+)/);
  if (circledMatch) return `${circledNumbers.indexOf(circledMatch[1]) + 1}. ${circledMatch[2]}`;

  const chineseOrder = ['第一', '第二', '第三', '第四', '第五', '第六', '第七', '第八', '第九', '第十'];
  const chineseMatch = trimmed.match(/^(第一|第二|第三|第四|第五|第六|第七|第八|第九|第十)[，,、]\s*(.+)/);
  if (chineseMatch && (mode === 'tutorial' || mode === 'longform')) {
    return `${chineseOrder.indexOf(chineseMatch[1]) + 1}. ${chineseMatch[2]}`;
  }

  const labeledMatch = trimmed.match(/^(优势|优点|缺点|亮点|适合|不适合|推荐理由|使用感受|价格|口感|质地|体验|注意事项|准备材料)[:：]\s*(.+)/);
  if (labeledMatch && (mode === 'recommend' || mode === 'tutorial')) {
    return `- **${labeledMatch[1]}**：${labeledMatch[2]}`;
  }

  return '';
}

function convertQuoteLine(trimmed, mode) {
  if (/^>\s/.test(trimmed)) return trimmed;

  const quoteMatch = trimmed.match(/^[“「》【]\s*(.+)/);
  if (quoteMatch) {
    return '> ' + quoteMatch[1].replace(/[”」】]\s*$/, '');
  }

  const labelQuote = trimmed.match(/^(注|提示|提醒|注意|重点|结论|金句|避坑)[:：]\s*(.+)/);
  if (labelQuote && (mode === 'tutorial' || mode === 'longform' || mode === 'spoken')) {
    return `> **${labelQuote[1]}**：${labelQuote[2]}`;
  }

  return '';
}

function extractCompactHeadingCandidate(text) {
  let s = String(text || '').trim();
  if (!s) return '';
  s = s.split(/[。！？!?；;，,]/)[0] || s;
  s = s
    .replace(/^(我觉得|我发现|你会发现|其实|说白了|简单说|换句话说|先说结论|首先|然后|所以|但是|不过)/, '')
    .replace(/^(这件事|这个问题|这些变化|这种情况|一个很明显的)/, '')
    .replace(/[“”"']/g, '')
    .replace(/\s+/g, '')
    .trim();
  if (s.length < 4 || s.length > 10) return '';
  if (/[吗呢吧啊呀]$/.test(s)) return '';
  return s;
}

function inferHeadingForMode(text, mode) {
  const s = String(text || '').trim();
  if (!s || s.length < 18) return '';

  if (mode === 'longform' || mode === 'spoken') {
    const colonTitle = summarizeHeadingCandidate(s.endsWith('：') || s.endsWith(':') ? s : '');
    if (colonTitle) return colonTitle;
    const rules = [
      { re: /结论|总结|所以|因此|最后|归根到底|本质上/, title: '先说结论' },
      { re: /问题|痛点|困境|矛盾|难点|不适|焦虑|压力/, title: '问题浮现' },
      { re: /原因|因为|为什么|背后|来自|源于/, title: '背后的原因' },
      { re: /变化|趋势|正在|开始|越来越|已经/, title: '变化正在发生' },
      { re: /案例|比如|举个例子|具体来说/, title: '一个例子' },
      { re: /方法|做法|路径|策略|建议|可以这样/, title: '可以怎么做' }
    ];
    const matched = rules.find(rule => rule.re.test(s));
    return matched ? matched.title : extractCompactHeadingCandidate(s);
  }

  if (mode === 'tutorial') {
    const rules = [
      { re: /准备|材料|工具|账号|环境|前提/, title: '准备工作' },
      { re: /第一步|首先|先|打开|进入|点击|选择|填写|设置/, title: '操作步骤' },
      { re: /注意|不要|避免|坑|错误|失败|提醒/, title: '注意事项' },
      { re: /为什么|原因|原理|逻辑/, title: '原理说明' },
      { re: /完成|效果|结果|验证|检查/, title: '检查结果' }
    ];
    const matched = rules.find(rule => rule.re.test(s));
    return matched ? matched.title : '';
  }

  if (mode === 'recommend') {
    const rules = [
      { re: /推荐|喜欢|值得|入手|购买|安利/, title: '推荐理由' },
      { re: /适合|人群|场景|用来|拿来/, title: '适合谁' },
      { re: /优点|亮点|好处|优势|体验/, title: '核心亮点' },
      { re: /缺点|不足|问题|但是|不过/, title: '不足之处' },
      { re: /价格|预算|性价比|贵|便宜/, title: '价格参考' },
      { re: /总结|最后|总之|一句话/, title: '一句话总结' }
    ];
    const matched = rules.find(rule => rule.re.test(s));
    return matched ? matched.title : '';
  }

  return '';
}

function shouldInsertAutoHeading(mode, state, text) {
  if (mode === 'clean') return '';
  if (state.autoHeadingCount >= 5) return '';

  const title = inferHeadingForMode(text, mode);
  if (!title) return '';

  if (mode === 'longform') {
    if (state.paragraphCount === 0 || state.sinceHeading >= 2) return title;
    return '';
  }
  if (mode === 'spoken') {
    if (state.paragraphCount === 0 || state.sinceHeading >= 3) return title;
    return '';
  }
  if (mode === 'tutorial' || mode === 'recommend') {
    if (state.sinceHeading >= 2 || state.paragraphCount === 0) return title;
  }
  return '';
}

function pushBlank(result) {
  if (result.length && result[result.length - 1] !== '') result.push('');
}

function smartPreprocess() {
  const rawText = editor.innerText || '';
  if (!rawText.trim()) { alert('编辑器为空，请先输入内容'); return; }
  const cards = Object.entries(PREPROCESS_MODE_CONFIG).map(([key, item]) => `
      <div style="border:2px solid #e5e7eb;border-radius:8px;padding:14px;cursor:pointer" onclick="runSmartPreprocess('${key}')">
        <div style="font-size:14px;font-weight:800;color:#6B2303;margin-bottom:4px">${item.name}</div>
        <div style="font-size:12px;color:#888;line-height:1.6">${item.desc}</div>
      </div>
  `).join('');
  showModal(`
    <h3>智能预处理</h3>
    <p style="font-size:12px;color:#777;line-height:1.7;margin-bottom:14px">选择文章类型。所有方式都会尽量保留原文，只增加标题、列表、引用和段落结构。</p>
    <div style="display:grid;grid-template-columns:1fr;gap:10px">
      ${cards}
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="hideModal()">取消</button>
    </div>
  `);
}
function runSmartPreprocess(mode = 'clean') {
  const rawText = editor.innerText || '';
  if (!rawText.trim()) { alert('编辑器为空，请先输入内容'); return; }
  if (mode === 'outline') mode = 'longform';
  // If already has markdown, warn
  const hasMd = /^#{1,3}\s/m.test(rawText) || /\*\*/.test(rawText) || /^```/m.test(rawText) || /^[-*+]\s/m.test(rawText) || /^\d+\.\s/m.test(rawText);
  if (hasMd && !confirm('检测到已有Markdown语法，是否继续预处理？')) return;

  const lines = preparePreprocessLines(rawText, mode);
  const result = [];
  let prevBlank = false;
  const state = {
    paragraphCount: 0,
    sinceHeading: 0,
    autoHeadingCount: 0
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // Empty line -> preserve as blank
    if (!trimmed) {
      if (!prevBlank) result.push('');
      prevBlank = true;
      continue;
    }
    prevBlank = false;

    // Already markdown heading -> keep
    if (/^#{1,3}\s/.test(trimmed)) {
      result.push(trimmed);
      state.sinceHeading = 0;
      continue;
    }

    // Already markdown list -> keep
    if (/^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      result.push(trimmed);
      continue;
    }

    // Already blockquote -> keep
    if (/^>\s/.test(trimmed)) {
      result.push(trimmed);
      continue;
    }

    // Already code fence -> keep
    if (/^```/.test(trimmed)) {
      result.push(trimmed);
      continue;
    }

    const listLine = convertListLine(trimmed, mode);
    if (listLine) {
      result.push(listLine);
      continue;
    }

    const quoteLine = convertQuoteLine(trimmed, mode);
    if (quoteLine) {
      result.push(quoteLine);
      continue;
    }

    // Only promote lines with clear heading signals. Do not guess from ordinary sentences.
    const prevLine = (i > 0) ? lines[i - 1].trim() : '';
    const nextLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
    if (isConservativeHeadingLine(trimmed, prevLine, nextLine) || isModeHeadingLine(trimmed, mode)) {
      result.push('## ' + trimmed);
      state.sinceHeading = 0;
      continue;
    }

    const autoHeading = shouldInsertAutoHeading(mode, state, trimmed);
    if (autoHeading) {
      pushBlank(result);
      result.push('### ' + autoHeading);
      state.sinceHeading = 0;
      state.autoHeadingCount++;
    }

    // Regular paragraph
    result.push(trimmed);
    state.paragraphCount++;
    state.sinceHeading++;
  }

  const mdText = result.join('\n');
  // Parse MD and set as editor content
  const parsedHtml = parseMD(mdText);
  editor.innerHTML = sanitizeContentHTML(parsedHtml);
  hideModal();
  scheduleUpdate();
}

// ===================================================================
// ENDING STYLES
// ===================================================================
function showEndingPanel() {
  const c = getColors();
  const mainColor = c.main || '#2563EB';
  showModal(`
    <h3>插入结尾样式</h3>
    <p style="font-size:12px;color:#999;margin-bottom:16px">点击选择一种结尾样式，将插入到编辑器末尾</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="border:2px solid #e5e7eb;border-radius:8px;padding:16px;cursor:pointer;transition:all .2s;text-align:center" onmouseover="this.style.borderColor='${mainColor}'" onmouseout="this.style.borderColor='#e5e7eb'" onclick="insertEnding(1)">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">互动引导卡</div>
        <div style="font-size:10px;color:#999">灰底卡片+三个图标</div>
      </div>
      <div style="border:2px solid #e5e7eb;border-radius:8px;padding:16px;cursor:pointer;transition:all .2s;text-align:center" onmouseover="this.style.borderColor='${mainColor}'" onmouseout="this.style.borderColor='#e5e7eb'" onclick="insertEnding(2)">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">简约签名</div>
        <div style="font-size:10px;color:#999">分割线+感谢阅读+签名</div>
      </div>
      <div style="border:2px solid #e5e7eb;border-radius:8px;padding:16px;cursor:pointer;transition:all .2s;text-align:center" onmouseover="this.style.borderColor='${mainColor}'" onmouseout="this.style.borderColor='#e5e7eb'" onclick="insertEnding(3)">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">渐变卡片引导</div>
        <div style="font-size:10px;color:#999">渐变背景+引导文字</div>
      </div>
      <div style="border:2px solid #e5e7eb;border-radius:8px;padding:16px;cursor:pointer;transition:all .2s;text-align:center" onmouseover="this.style.borderColor='${mainColor}'" onmouseout="this.style.borderColor='#e5e7eb'" onclick="insertEnding(4)">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">极简 END</div>
        <div style="font-size:10px;color:#999">三点+END+细线</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="hideModal()">取消</button>
    </div>
  `);
}

function insertEnding(type) {
  const c = getColors();
  const mainColor = c.main || '#2563EB';
  const accentColor = c.accent || mainColor;
  const subColor = c.sub || alphaColor(mainColor, 0.08, '#f5f5f5');
  const textColor = c.text || '#333';
  let html = '';
  switch(type) {
    case 1:
      html = `<section data-ending-type="1" style="background:${subColor};border-radius:16px;padding:32px;text-align:center;margin:2em 0">
        <section data-theme-role="title" style="display:block;font-size:18px;font-weight:700;color:${mainColor};margin-bottom:8px">既然看到这里了</section>
        <section data-theme-role="body" style="display:block;font-size:14px;color:${textColor};opacity:0.72;margin-bottom:24px;line-height:1.7">觉得有启发，记得点赞、爱心，<br>转发给同样需要的人。</section>
        <table style="margin:0 auto 24px;border-collapse:collapse;border-spacing:0;border:0"><tr>
          <td style="padding:0 12px;vertical-align:middle;border:0"><section data-theme-role="icon-main" style="display:inline-block;padding:14px 13px;line-height:1;border-radius:50%;background:${alphaColor(mainColor, 0.12, '#eee')};font-size:20px;text-align:center;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">👍️</section></td>
          <td style="padding:0 12px;vertical-align:middle;border:0"><section data-theme-role="icon-sub" style="display:inline-block;padding:14px 13px;line-height:1;border-radius:50%;background:${alphaColor(mainColor, 0.12, '#eee')};font-size:20px;text-align:center;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">❤️</section></td>
          <td style="padding:0 12px;vertical-align:middle;border:0"><section data-theme-role="icon-accent" style="display:inline-block;padding:14px 13px;line-height:1;border-radius:50%;background:${alphaColor(mainColor, 0.12, '#eee')};font-size:20px;text-align:center;font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">↗️</section></td>
        </tr></table>
        <section data-theme-role="meta" style="display:block;font-size:13px;color:${mainColor};opacity:0.62;font-weight:500;line-height:1.7">关注意疏，我们一起把看见的机会，<br>变成撑起自己的能力。</section>
      </section>`;
      break;
    case 2:
      html = `<div data-ending-type="2" style="text-align:center;margin:2em 0">
        <p data-theme-role="divider" style="text-align:center;margin:0 0 20px;line-height:0;"><span style="display:inline-block;border-top:1px solid ${alphaColor(mainColor, 0.34, '#ddd')};padding:0 20px;line-height:0;font-size:0;">&nbsp;</span></p>
        <div style="font-size:16px;color:${mainColor};margin-bottom:12px">感谢阅读</div>
        <div data-theme-role="body" style="font-size:14px;color:${textColor};opacity:0.56;margin-bottom:8px">— 意疏的 AI 口袋 —</div>
        <div data-theme-role="meta" style="font-size:12px;color:${mainColor};opacity:0.32">2025.01.01</div>
      </div>`;
      break;
    case 3:
      html = `<div data-ending-type="3" style="background:linear-gradient(135deg, ${alphaColor(mainColor, 0.12, subColor)}, ${alphaColor(accentColor, 0.05, '#fff')});border-radius:12px;padding:32px;text-align:center;margin:2em 0">
        <div data-theme-role="title" style="font-size:16px;font-weight:600;color:${mainColor};margin-bottom:8px">如果这篇文章对你有帮助</div>
        <div data-theme-role="body" style="font-size:14px;color:${textColor};opacity:0.72;margin-bottom:16px">欢迎点赞 · 在看 · 转发</div>
        <div data-theme-role="meta" style="font-size:12px;color:${mainColor};opacity:0.52">你的支持是我创作的动力</div>
      </div>`;
      break;
    case 4:
      html = `<div data-ending-type="4" style="text-align:center;margin:2em 0">
        <div data-theme-role="dots" style="font-size:14px;letter-spacing:12px;color:${mainColor};opacity:0.32;margin-bottom:16px">· · ·</div>
        <div style="font-size:24px;letter-spacing:0.5em;color:${mainColor};font-weight:300;margin-bottom:16px">END</div>
        <p data-theme-role="divider" style="text-align:center;margin:0;line-height:0;"><span style="display:inline-block;border-top:1px solid ${alphaColor(mainColor, 0.26, '#e5e7eb')};padding:0 30px;line-height:0;font-size:0;">&nbsp;</span></p>
      </div>`;
      break;
  }
  // Remove any existing ending block first
  const existing = editor.querySelector('[data-ending-block]');
  if (existing) existing.remove();
  // Wrap in a container with marker attribute. 用 section 而不是 div，让 WeChat 编辑器保留外层样式
  html = `<section data-ending-block="true" data-theme-component="ending" data-ending-type="${type}" style="display:block;margin-top:2em">${html}</section>`;
  // Insert at end of editor
  editor.focus();
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  document.execCommand('insertHTML', false, html);
  hideModal();
  scheduleUpdate();
}

// ===================================================================
// MARKDOWN PARSER (basic)
// ===================================================================
function parseMD(text) {
  const lines = text.split('\n');
  let html = '';
  let inCode = false;
  let codeLines = [];
  let inList = false;
  let listType = '';

  function closeList() {
    if (inList) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
      listType = '';
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html += '<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>';
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList();
      html += '<hr>';
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (hMatch) {
      closeList();
      const level = hMatch[1].length;
      html += `<h${level}>${inlineFormat(hMatch[2])}</h${level}>`;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('> ')) {
      closeList();
      html += `<blockquote>${inlineFormat(line.trim().slice(2))}</blockquote>`;
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        html += '<ul>';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${inlineFormat(ulMatch[1])}</li>`;
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        html += '<ol>';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${inlineFormat(olMatch[1])}</li>`;
      continue;
    }

    closeList();

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Paragraph
    html += `<p>${inlineFormat(line)}</p>`;
  }
  if (inCode) {
    html += '<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>';
  }
  closeList();
  return html;
}

function inlineFormat(t) {
  t = escapeHtml(t);
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}

// ===================================================================
// PASTE HANDLER: detect markdown
// ===================================================================
function getClipboardImageFiles(clipboardData) {
  const fromItems = Array.from(clipboardData?.items || [])
    .filter(item => item.kind === 'file' && /^image\//i.test(item.type))
    .map(item => item.getAsFile())
    .filter(Boolean);
  if (fromItems.length) return fromItems;
  return Array.from(clipboardData?.files || []).filter(file => /^image\//i.test(file.type));
}

function ensureEndingBlockAtEnd() {
  const ending = editor.querySelector('[data-ending-block]');
  if (!ending || !ending.parentNode) return;
  const meaningful = Array.from(editor.childNodes).filter(node => {
    return node.nodeType !== Node.TEXT_NODE || node.textContent.trim();
  });
  if (meaningful[meaningful.length - 1] !== ending) {
    editor.appendChild(ending);
  }
}

function movePastePointBeforeEndingIfNeeded() {
  const ending = editor.querySelector('[data-ending-block]');
  const range = getSelectionRangeInEditor();
  if (!ending || !range) return false;
  let shouldMove = ending.contains(range.startContainer) || ending.contains(range.endContainer);
  const endingIndex = Array.prototype.indexOf.call(editor.childNodes, ending);
  if (range.startContainer === editor) {
    shouldMove = shouldMove || range.startOffset > endingIndex;
  } else {
    const startElement = getElementFromNode(range.startContainer);
    shouldMove = shouldMove || !!(ending.compareDocumentPosition(startElement) & Node.DOCUMENT_POSITION_FOLLOWING);
  }
  if (!shouldMove) return false;
  const sel = window.getSelection();
  const beforeEnding = document.createRange();
  beforeEnding.setStartBefore(ending);
  beforeEnding.collapse(true);
  sel.removeAllRanges();
  sel.addRange(beforeEnding);
  return true;
}

function insertPasteHTML(html, beforeEnding = false) {
  const ending = editor.querySelector('[data-ending-block]');
  if (!beforeEnding || !ending) {
    insertSafeHTML(html);
    return;
  }
  const tpl = document.createElement('template');
  tpl.innerHTML = sanitizeContentHTML(html);
  editor.insertBefore(tpl.content, ending);
}

function plainTextToParagraphHTML(text) {
  const normalized = String(text || '').replace(/\r\n?/g, '\n');
  return normalized.split(/\n{2,}/).map(part => {
    const body = escapeHtml(part).replace(/\n/g, '<br>');
    return `<p>${body || '<br>'}</p>`;
  }).join('');
}

function setupEditorEvents() {
  editor.addEventListener('paste', e => {
    if (editor.innerHTML.trim() === DEFAULT_HTML.trim()) {
      editor.innerHTML = '';
    }
    const pasteBeforeEnding = movePastePointBeforeEndingIfNeeded();
    const imageFiles = getClipboardImageFiles(e.clipboardData);
    if (imageFiles.length) {
      e.preventDefault();
      const files = getValidImageFiles(imageFiles);
      if (!files || !files.length) return;
      const pasteRange = window.getSelection().rangeCount
        ? window.getSelection().getRangeAt(0).cloneRange()
        : null;
      readImageFiles(files).then(items => {
        const safeItems = items.filter(item => item.src);
        if (safeItems.length !== files.length) {
          alert('图片读取失败或格式不安全');
          return;
        }
        restoreEditorRange(pasteRange);
        insertPasteHTML(safeItems.map(item => buildSingleImageHTML(item.src)).join(''), pasteBeforeEnding);
        ensureEndingBlockAtEnd();
        scheduleUpdate();
      });
      return;
    }
    const plain = e.clipboardData.getData('text/plain');
    const html = e.clipboardData.getData('text/html');
    e.preventDefault();
    // Detect markdown — require line-anchored markers, not loose ** matches
    const looksLikeMarkdown = plain && (
      /^#{1,6}\s/m.test(plain) ||
      /^>\s/m.test(plain) ||
      /^```/m.test(plain) ||
      /^[-*]\s/m.test(plain) ||
      (plain.match(/\*\*[^*\n]+\*\*/g) || []).length >= 2
    );
    if (looksLikeMarkdown) {
      const parsed = parseMD(plain);
      insertPasteHTML(parsed, pasteBeforeEnding);
      ensureEndingBlockAtEnd();
      scheduleUpdate();
      return;
    }
    if (html) {
      insertPasteHTML(html, pasteBeforeEnding);
      ensureEndingBlockAtEnd();
      scheduleUpdate();
      return;
    }
    if (plain) {
      if (pasteBeforeEnding) {
        insertPasteHTML(plainTextToParagraphHTML(plain), true);
      } else {
        document.execCommand('insertText', false, plain);
      }
      ensureEndingBlockAtEnd();
      scheduleUpdate();
    }
  });
  editor.addEventListener('input', () => {
    ensureEndingBlockAtEnd();
    scheduleUpdate();
    debouncedPushSnapshot();
  });
  editor.addEventListener('keyup', updateToolbarStates);
  editor.addEventListener('mouseup', updateToolbarStates);
  editor.addEventListener('focus', updateToolbarStates);
  editor.addEventListener('keydown', e => {
    // 自定义 Undo/Redo 覆盖浏览器默认（contenteditable 自带 undo 在自定义 DOM 操作下不可靠）
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      undoEditor();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && (e.key === 'z' || e.key === 'Z')) || e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      redoEditor();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed) return;
      if (range.startContainer !== range.endContainer) return;
      if (range.endOffset - range.startOffset !== 1) return;
      const img = range.startContainer.childNodes[range.startOffset];
      if (!img || img.tagName !== 'IMG') return;
      e.preventDefault();
      // If image is inside a side-by-side table layout, drop the whole table
      const table = img.closest('table');
      if (table && editor.contains(table)) {
        table.remove();
      } else {
        const next = img.nextSibling;
        img.remove();
        if (next && next.tagName === 'BR') next.remove();
      }
      editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  document.addEventListener('selectionchange', () => {
    if (getSelectionRangeInEditor()) updateToolbarStates();
  });

  // Event delegation for badge image click
  editor.addEventListener('click', e => {
    const badge = e.target.closest('[data-theme-role="badge"]');
    if (badge) {
      e.stopPropagation();
      e.preventDefault();
      // Store reference to this badge and open image panel
      targetBadgeForImage = badge;
      toggleImgPanel();
      return;
    }
    // Click an inserted image to select it so Delete/Backspace removes it
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      const range = document.createRange();
      range.selectNode(e.target);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });

}

function setupRichCopyEvents() {
  preview.addEventListener('copy', e => {
    const range = getSelectionRangeWithin(preview);
    if (!range || range.collapsed || !e.clipboardData) return;
    const holder = buildSelectedWechatCopyContainer(range);
    if (!holder || !holder.childNodes.length) return;
    const html = buildWechatHTMLFromElement(holder, false);
    e.clipboardData.setData('text/html', html);
    e.clipboardData.setData('text/plain', holder.textContent || range.toString());
    e.preventDefault();
  });
}

function getSelectionRangeWithin(container) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const anchor = sel.anchorNode;
  const focus = sel.focusNode;
  if ((anchor && container.contains(anchor)) || (focus && container.contains(focus))) return range;
  return null;
}

function buildSelectedWechatCopyContainer(range) {
  const holder = document.createElement('section');
  const components = getSelectedThemeComponents(range);
  if (components.length) {
    components.forEach(component => holder.appendChild(component.cloneNode(true)));
    return holder;
  }
  holder.appendChild(range.cloneContents());
  return holder;
}

function getSelectedThemeComponents(range) {
  const items = new Set();
  const start = getElementFromNode(range.startContainer)?.closest?.('[data-theme-component]');
  const end = getElementFromNode(range.endContainer)?.closest?.('[data-theme-component]');
  if (start && preview.contains(start)) items.add(start);
  if (end && preview.contains(end)) items.add(end);
  preview.querySelectorAll('[data-theme-component]').forEach(el => {
    try {
      if (range.intersectsNode(el)) items.add(el);
    } catch (e) {}
  });
  return Array.from(items).filter(el => !Array.from(items).some(other => other !== el && other.contains(el)));
}

// ===================================================================
// PREVIEW UPDATE
// ===================================================================
let updateTimer = null;
function scheduleUpdate() {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(updatePreview, 150);
}

function updatePreview() {
  const content = sanitizeContentHTML(editor.innerHTML);
  // Apply to preview with styling
  preview.innerHTML = content;
  applyPreviewStyles();
  applyUserAlignmentOverrides(preview);
  applyBgTexture();
  updateCounts();
  // 如果当前在「微信预览」模式，编辑后也要重跑兼容管道
  if (wechatPreviewActive) {
    wechatPreviewBackup = preview.innerHTML;
    preview.innerHTML = buildWechatHTMLFromElement(preview, false);
  }
}

function applyUserAlignmentOverrides(root) {
  root.querySelectorAll('[data-user-align]').forEach(el => {
    const align = el.getAttribute('data-user-align');
    if (!['left', 'center', 'right'].includes(align)) return;
    el.style.textAlign = align;
    el.querySelectorAll('[data-theme-role="body"],[data-theme-role="title"],[data-theme-role="meta"],p,h1,h2,h3,blockquote,li').forEach(child => {
      child.style.textAlign = align;
    });
  });
}

let goldenZoneTriggered = false;
function updateCounts() {
  const edText = editor.innerText || '';
  const prText = preview.innerText || '';
  const edChars = edText.replace(/\s/g, '').length;
  const chars = prText.replace(/\s/g, '').length;
  const imgs = preview.querySelectorAll('img').length;
  const readMin = Math.max(1, Math.ceil(chars / 400));
  // 公众号最佳长度提示：1200-2000 字之间为黄金区间
  let zoneTag = '';
  if (edChars >= 1200 && edChars <= 2000) zoneTag = ' · 🟢 黄金长度';
  else if (edChars > 2000 && edChars <= 3000) zoneTag = ' · 🟡 略长';
  else if (edChars > 3000) zoneTag = ' · 🔴 太长';
  else if (edChars > 0 && edChars < 600) zoneTag = ' · ⚪ 偏短';
  $('editorCount').textContent = `字数：${edChars} · 预估阅读 ${readMin} 分钟${zoneTag}`;
  $('previewStats').textContent = `字数：${chars} | 图片：${imgs} | 预估阅读：${readMin}分钟`;
  const floatEl = $('editorFloatStats');
  if (floatEl) floatEl.textContent = `📝 ${edChars}字 | ⏱️ ${readMin}分钟 | ✅ Markdown`;
  // 字数首次跨越 1500 → 触发时光机彩蛋（每次会话只触发一次）
  if (!goldenZoneTriggered && edChars >= 1500) {
    goldenZoneTriggered = true;
    triggerGoldenZoneCelebration();
  }
}
function triggerGoldenZoneCelebration() {
  // 小时光机从右往左飘过
  const tm = document.createElement('div');
  tm.className = 'time-machine-mini';
  tm.innerHTML = `
    <svg viewBox="0 0 320 280" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <path d="M 130 145 Q 95 100 70 50" stroke="#F5C518" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M 132 145 Q 97 100 72 50" stroke="#FFD54F" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>
      <g class="paddle">
        <circle cx="70" cy="40" r="26" fill="#FFD54F" stroke="#3D1F00" stroke-width="2.5"/>
        <path d="M 70 40 L 70 14 A 26 26 0 0 1 96 40 Z" fill="#E53935"/>
        <path d="M 70 40 L 96 40 A 26 26 0 0 1 70 66 Z" fill="#F5C518"/>
        <path d="M 70 40 L 70 66 A 26 26 0 0 1 44 40 Z" fill="#E53935"/>
        <path d="M 70 40 L 44 40 A 26 26 0 0 1 70 14 Z" fill="#F5C518"/>
        <circle cx="70" cy="40" r="4" fill="#3D1F00"/>
      </g>
      <ellipse cx="160" cy="248" rx="135" ry="12" fill="rgba(0,0,30,0.3)"/>
      <path d="M 90 175 Q 90 130 130 130 L 230 130 Q 270 130 270 175 Z" fill="#3A4F75" stroke="#13203A" stroke-width="2.5"/>
      <ellipse cx="170" cy="145" rx="60" ry="8" fill="#5A75AA" opacity="0.5"/>
      <path d="M 35 195 Q 35 175 60 175 L 260 175 Q 285 175 285 195 L 285 215 Q 285 235 260 235 L 60 235 Q 35 235 35 215 Z" fill="#2C3E5E" stroke="#13203A" stroke-width="2.5"/>
      <ellipse cx="50" cy="210" rx="28" ry="26" fill="#2C3E5E" stroke="#13203A" stroke-width="2.5"/>
      <ellipse cx="270" cy="210" rx="28" ry="26" fill="#2C3E5E" stroke="#13203A" stroke-width="2.5"/>
      <path d="M 130 175 L 220 175 L 240 215 L 110 215 Z" fill="#E8D5A8" stroke="#5D2D00" stroke-width="2.5"/>
      <line x1="125" y1="190" x2="225" y2="190" stroke="#5D2D00" stroke-width="1.5" opacity="0.55"/>
      <line x1="120" y1="200" x2="230" y2="200" stroke="#5D2D00" stroke-width="1.5" opacity="0.55"/>
      <ellipse cx="180" cy="125" rx="32" ry="30" fill="#03ADF0" stroke="#016FAD" stroke-width="2"/>
      <ellipse cx="180" cy="135" rx="25" ry="22" fill="#FFFFFF"/>
      <ellipse cx="170" cy="118" rx="6" ry="7" fill="#FFFFFF" stroke="#000" stroke-width="1.5"/>
      <ellipse cx="190" cy="118" rx="6" ry="7" fill="#FFFFFF" stroke="#000" stroke-width="1.5"/>
      <circle cx="172" cy="121" r="1.8" fill="#000"/>
      <circle cx="188" cy="121" r="1.8" fill="#000"/>
      <circle cx="180" cy="130" r="3" fill="#E53935"/>
      <line x1="180" y1="133" x2="180" y2="143" stroke="#000" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M 172 142 Q 180 148 188 142" stroke="#000" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <rect x="160" y="153" width="40" height="4" fill="#E53935" rx="1"/>
    </svg>`;
  document.body.appendChild(tm);
  setTimeout(() => tm.remove(), 4600);
  // 金色 toast
  const old = document.getElementById('teleportToast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.id = 'teleportToast';
  toast.className = 'teleport-toast golden';
  toast.textContent = '🎉 黄金长度达成 — 1500 字！';
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

// ===================================================================
// STYLE APPLICATION
// ===================================================================
function getColors() {
  if (STATE.customColors) {
    return {
      name: '自定义',
      main: sanitizeColorValue(STATE.customColors.main, '#2563EB'),
      sub: sanitizeColorValue(STATE.customColors.sub, '#EFF6FF'),
      accent: sanitizeColorValue(STATE.customColors.accent, '#1D4ED8'),
      text: sanitizeColorValue(STATE.customColors.text, '#1E293B'),
      bg: sanitizeColorValue(STATE.customColors.bg, '#FFFFFF'),
      gradient: `linear-gradient(135deg, ${sanitizeColorValue(STATE.customColors.main, '#2563EB')}, ${sanitizeColorValue(STATE.customColors.accent, '#1D4ED8')})`
    };
  }
  return COLOR_SCHEMES[STATE.colorScheme];
}

function applyPreviewStyles() {
  const c = getColors();
  const tf = TITLE_FONTS[STATE.titleFont];
  const bf = BODY_FONTS[STATE.bodyFont];
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  const themePipe = c.pipe || c.main;
  const themeSky = c.sky || c.main;
  const journalPaper = c.paper || c.sub || '#FFF6E8';
  const journalRose = c.rose || c.accent || '#E8B2B8';

  // Base
  preview.style.fontFamily = bf.stack;
  preview.style.fontWeight = bf.weight;
  preview.style.lineHeight = STATE.lineHeight;
  preview.style.color = c.text;
  preview.style.background = c.bg;

  // Paragraphs
  const allPs = preview.querySelectorAll('p');
  allPs.forEach((p, idx) => {
    // 跳过 design 组件内部的 p 元素：它们有自己的 font-size / line-height / letter-spacing / margin
    // 被全局段落样式覆写后会导致左侧编辑区与右侧预览显示不一致
    if (p.closest('[data-theme-component]')) return;
    p.style.marginBottom = STATE.paraSpacing + 'em';
    p.style.color = c.text;
    p.style.lineHeight = STATE.lineHeight;
    p.style.letterSpacing = '0.03em';
    p.style.textIndent = '0';
    // Deep-read: first-line indent
    if (mode.id === 'deep-read') {
      p.style.textIndent = '2em';
    }
  });

  // Opening paragraph style is independent from whether the article has a title.
  const openingP = Array.from(preview.children).find(el => el.tagName === 'P');
  if (openingP) {
    openingP.style.fontSize = '15.5px';
    openingP.style.color = c.accent;
    openingP.style.opacity = '0.85';
    openingP.style.lineHeight = '1.9';
    openingP.style.marginBottom = (STATE.paraSpacing + 0.3) + 'em';
    if (mode.id === 'mario-theme') {
      openingP.style.background = `radial-gradient(circle at 18px 18px, ${c.accent} 0 5px, transparent 6px), radial-gradient(circle at 50px 18px, ${c.accent} 0 5px, transparent 6px), linear-gradient(180deg, ${c.sub}, #FFFFFF)`;
      openingP.style.border = `2px solid ${alphaColor(c.main, 0.32, '#f3b2b2')}`;
      openingP.style.borderBottom = `6px solid ${themePipe}`;
      openingP.style.borderRadius = '16px';
      openingP.style.boxShadow = `0 8px 0 ${alphaColor(c.main, 0.14, 'rgba(229,57,53,0.14)')}`;
      openingP.style.color = c.text;
      openingP.style.fontWeight = '600';
      openingP.style.padding = '44px 20px 18px';
      openingP.style.opacity = '1';
    }
    if (mode.id === 'coffee-journal') {
      openingP.style.background = `linear-gradient(135deg, ${journalPaper}, #FFFFFF)`;
      openingP.style.border = `1.5px solid ${alphaColor(c.main, 0.34, '#DCC8A7')}`;
      openingP.style.borderRadius = '16px';
      openingP.style.boxShadow = `0 8px 24px ${alphaColor(c.main, 0.10, 'rgba(200,135,78,0.10)')}`;
      openingP.style.color = c.text;
      openingP.style.fontSize = '15px';
      openingP.style.lineHeight = '2';
      openingP.style.padding = '20px 22px';
      openingP.style.opacity = '1';
    }
  }

  // Closing section style (last p or p after last hr)
  const allElements = Array.from(preview.children);
  const lastHrIdx = allElements.map((el,i) => (el.tagName === 'HR' || (el.tagName === 'DIV' && el.textContent.trim().length < 10)) ? i : -1).filter(i => i > -1).pop();
  if (lastHrIdx !== undefined && lastHrIdx >= 0) {
    for (let i = lastHrIdx + 1; i < allElements.length; i++) {
      const el = allElements[i];
      if (el.tagName === 'P') {
        el.style.textAlign = 'center';
        el.style.color = c.main;
        el.style.fontSize = '14px';
        el.style.opacity = '0.7';
        el.style.letterSpacing = '0.05em';
      }
    }
  };

  // Headings
  preview.querySelectorAll('h1,h2,h3').forEach(h => {
    h.style.fontFamily = tf.stack;
    h.style.fontWeight = tf.weight;
    h.style.lineHeight = '1.4';
    h.style.marginTop = '1.2em';
    h.style.marginBottom = '0.6em';
    // Reset
    h.style.textAlign = '';
    h.style.borderBottom = '';
    h.style.border = '';
    h.style.borderLeft = '';
    h.style.paddingBottom = '';
    h.style.background = '';
    h.style.padding = '';
    h.style.borderRadius = '';
    h.style.display = '';
    h.style.borderTop = '';
    h.style.borderImage = '';
    h.style.boxShadow = '';
    h.style.gap = '';
    h.style.letterSpacing = '';
    h.style.width = '';
    h.style.maxWidth = '';
    h.style.minWidth = '';
    h.style.color = c.text;
    h.style.position = 'relative';
    // Remove any existing gradient bar from previous render
    const existingBars = h.querySelectorAll('.heading-bar');
    existingBars.forEach(b => b.remove());

    const tag = h.tagName;
    let size = tag === 'H1' ? '22px' : tag === 'H2' ? '18px' : '16px';
    // Deep-read: larger + centered titles
    if (mode.id === 'deep-read') {
      size = tag === 'H1' ? '24px' : tag === 'H2' ? '20px' : '18px';
      h.style.textAlign = 'center';
    }
    h.style.fontSize = size;

    // Chinese: traditional wide spacing
    if (mode.id === 'chinese') {
      h.style.letterSpacing = '0.15em';
      const cSize = tag === 'H1' ? '26px' : tag === 'H2' ? '22px' : '18px';
      h.style.fontSize = cSize;
    }

    applyHeadingStyle(h, mode.headingStyle, c, tag);
  });

  // Blockquotes
  preview.querySelectorAll('blockquote').forEach(bq => {
    // Reset all styles
    bq.style.cssText = 'margin:1em 0;line-height:' + STATE.lineHeight + ';letter-spacing:0.02em;';
    applyQuoteStyle(bq, mode.quoteStyle, c);
    // Tutorial: tip card style
    if (mode.id === 'tutorial') {
      bq.style.background = c.sub || '#F0F7FF';
      bq.style.borderRadius = '12px';
      bq.style.padding = '18px 20px';
      bq.style.position = 'static';
      bq.style.border = 'none';
      bq.style.borderImage = 'none';
      bq.style.borderLeft = '4px solid ' + c.main;
    }
    // Sweet: large border-radius + gradient bg
    if (mode.id === 'sweet') {
      bq.style.borderRadius = '20px';
      bq.style.background = `linear-gradient(135deg, ${c.sub}, ${alphaColor(c.accent, 0.12, c.bg)})`;
    }
    // Mario theme: make quotes feel like playful information cards.
    if (mode.id === 'mario-theme') {
      bq.style.borderRadius = '16px';
      bq.style.border = `2px solid ${c.main}`;
      bq.style.borderLeft = `8px solid ${c.main}`;
      bq.style.background = `linear-gradient(180deg, ${c.sub}, #FFFFFF)`;
      bq.style.boxShadow = `0 6px 0 ${alphaColor(themeSky, 0.18, 'rgba(30,136,229,0.18)')}`;
      bq.style.padding = '18px 20px 18px 22px';
    }
    if (mode.id === 'coffee-journal') {
      bq.style.borderRadius = '14px';
      bq.style.border = `1.5px solid ${alphaColor(c.main, 0.42, '#DCC8A7')}`;
      bq.style.borderLeft = `5px solid ${c.accent}`;
      bq.style.background = `linear-gradient(135deg, #FFFFFF, ${journalPaper})`;
      bq.style.boxShadow = `0 6px 18px ${alphaColor(c.main, 0.08, 'rgba(200,135,78,0.08)')}`;
      bq.style.padding = '18px 20px';
      bq.style.color = c.text;
      if (!bq.dataset.coffeeQuoteAdded) {
        bq.innerHTML = `<span style="display:inline-block;color:${c.main};font-size:12px;font-weight:800;letter-spacing:1px;margin-bottom:8px;">NOTE</span><br>${bq.innerHTML}`;
        bq.dataset.coffeeQuoteAdded = '1';
      }
    }
    // Chinese: classical border
    if (mode.id === 'chinese') {
      bq.style.border = '2px double ' + c.main + '60';
      bq.style.borderRadius = '2px';
      bq.style.background = `linear-gradient(135deg, ${c.sub}, ${alphaColor(c.main, 0.08, c.bg)})`;
      bq.style.padding = '20px 24px';
    }
  });

  // HR
  preview.querySelectorAll('hr').forEach(hr => {
    hr.style.cssText = '';
    hr.style.margin = '1.5em 0';
    if (hr.dataset.hrStyle) {
      applyHrStyle(hr, hr.dataset.hrStyle, c);
      return;
    }
    // Sweet: wave line
    if (mode.id === 'sweet') {
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;font-size:18px;letter-spacing:8px;color:${c.main};opacity:0.5">∼∼∼∼∼</div>`;
      return;
    }
    // Chinese: decorative pattern
    if (mode.id === 'chinese') {
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;letter-spacing:4px;color:${c.main};opacity:0.45;font-size:13px">═══ ✿ ═══</div>`;
      return;
    }
    // Tutorial: step heading style - we keep numbered dots
    if (mode.id === 'tutorial') {
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;display:flex;align-items:center;justify-content:center;gap:8px"><span style="flex:1;max-width:80px;height:2px;background:${c.main}30;border-radius:1px"></span><span style="width:8px;height:8px;border-radius:50%;background:${c.main};opacity:0.3"></span><span style="flex:1;max-width:80px;height:2px;background:${c.main}30;border-radius:1px"></span></div>`;
      return;
    }
    applyHrStyle(hr, mode.hrStyle, c);
  });

  // Code blocks
  preview.querySelectorAll('pre').forEach(pre => {
    ensureTerminalCodeBar(pre);
    pre.style.display = 'block';
    pre.style.width = '100%';
    pre.style.maxWidth = '100%';
    pre.style.boxSizing = 'border-box';
    pre.style.background = '#252A33';
    pre.style.borderRadius = '8px';
    pre.style.padding = '18px 20px 10px';
    pre.style.overflowX = 'auto';
    pre.style.overflowY = 'hidden';
    pre.style.overflow = 'auto';
    pre.style.whiteSpace = 'pre';
    pre.style.wordWrap = 'normal';
    pre.style.overflowWrap = 'normal';
    pre.style.fontSize = '13px';
    pre.style.lineHeight = '1.8';
    pre.style.margin = '1.4em auto';
    pre.style.fontFamily = '"SF Mono","Consolas","Menlo",monospace';
    pre.style.color = '#D7E7FF';
    pre.style.border = 'none';
    pre.style.boxShadow = '0 10px 24px rgba(15,23,42,0.26)';
    pre.querySelectorAll('code').forEach(code => {
      code.style.display = 'block';
      code.style.minWidth = 'max-content';
      code.style.width = 'max-content';
      code.style.maxWidth = 'none';
      code.style.background = 'transparent';
      code.style.padding = '0';
      code.style.margin = '0';
      code.style.border = 'none';
      code.style.whiteSpace = 'pre';
      code.style.wordWrap = 'normal';
      code.style.overflowWrap = 'normal';
      code.style.fontSize = '13px';
      code.style.lineHeight = '1.8';
      code.style.fontFamily = '"SF Mono","Consolas","Menlo",monospace';
      code.style.color = '#D7E7FF';
    });
  });
  preview.querySelectorAll('code').forEach(code => {
    if (code.parentElement.tagName !== 'PRE') {
      code.style.background = c.sub || '#F0F1F3';
      code.style.padding = '2px 8px';
      code.style.borderRadius = '4px';
      code.style.fontSize = '0.88em';
      code.style.fontFamily = '"SF Mono","Fira Code","Consolas",monospace';
      code.style.color = c.main;
    }
  });

  // Lists
  preview.querySelectorAll('ul,ol').forEach(list => {
    list.style.paddingLeft = '1.5em';
    list.style.marginBottom = STATE.paraSpacing + 'em';
    // Tutorial: styled ordered list numbers
    if (mode.id === 'tutorial' && list.tagName === 'OL') {
      list.style.listStyle = 'none';
      list.style.counterReset = 'tutorial-counter';
      list.style.paddingLeft = '0';
    }
    if (mode.id === 'mario-theme') {
      list.style.listStyle = 'none';
      list.style.paddingLeft = '0';
      list.style.margin = '1.2em 0';
    }
    if (mode.id === 'coffee-journal') {
      list.style.listStyle = 'none';
      list.style.paddingLeft = '0';
      list.style.margin = '1.2em 0';
    }
  });
  preview.querySelectorAll('li').forEach((li, liIdx) => {
    li.style.marginBottom = '0.4em';
    li.style.lineHeight = STATE.lineHeight;
    li.style.color = c.text;
    li.style.letterSpacing = '0.03em';
    // Tutorial: circle-wrapped numbers for OL
    if (mode.id === 'tutorial' && li.parentElement && li.parentElement.tagName === 'OL') {
      li.style.counterIncrement = 'tutorial-counter';
      li.style.paddingLeft = '36px';
      li.style.position = 'relative';
      if (!li.dataset.numAdded) {
        const num = liIdx + 1;
        li.innerHTML = `<span style="position:absolute;left:0;top:2px;width:24px;height:24px;border-radius:50%;background:${c.main};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:1">${num}</span>` + li.innerHTML;
        li.dataset.numAdded = '1';
      }
    }
    if (mode.id === 'mario-theme') {
      li.style.position = 'relative';
      li.style.marginBottom = '10px';
      li.style.padding = '12px 14px 12px 52px';
      li.style.border = `2px solid ${alphaColor(themeSky, 0.28, '#bbdefb')}`;
      li.style.borderRadius = '12px';
      li.style.background = '#FFFFFF';
      li.style.boxShadow = `0 4px 0 ${alphaColor(c.accent, 0.35, 'rgba(251,192,45,0.35)')}`;
      if (!li.dataset.marioCoinAdded) {
        const num = String(liIdx + 1).padStart(2, '0');
        li.innerHTML = `<span style="position:absolute;left:14px;top:12px;width:26px;height:26px;border-radius:50%;background:${c.accent};border:2px solid #111827;color:#111827;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;line-height:1;box-sizing:border-box;">${num}</span>${li.innerHTML}`;
        li.dataset.marioCoinAdded = '1';
      }
    }
    if (mode.id === 'coffee-journal') {
      li.style.position = 'relative';
      li.style.marginBottom = '8px';
      li.style.padding = '9px 12px 9px 42px';
      li.style.border = `1px solid ${alphaColor(c.main, 0.24, '#E7D6BE')}`;
      li.style.borderRadius = '10px';
      li.style.background = '#FFFFFF';
      li.style.boxShadow = `0 2px 8px ${alphaColor(c.main, 0.05, 'rgba(200,135,78,0.05)')}`;
      if (!li.dataset.coffeeItemAdded) {
        const num = String(liIdx + 1).padStart(2, '0');
        li.innerHTML = `<span style="position:absolute;left:12px;top:10px;width:22px;height:20px;border-radius:6px;background:${c.main};color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;line-height:1;">${num}</span>${li.innerHTML}`;
        li.dataset.coffeeItemAdded = '1';
      }
    }
  });

  // Strong / em colors
  preview.querySelectorAll('strong').forEach(s => { s.style.color = c.accent; s.style.fontWeight = '700'; });
  preview.querySelectorAll('em').forEach(e => { e.style.color = c.main; e.style.fontStyle = 'italic'; });
  preview.querySelectorAll('img').forEach(img => {
    img.style.maxWidth = img.style.maxWidth || '100%';
    if (!img.style.borderRadius) img.style.borderRadius = '12px';
    img.style.height = 'auto';
    if (!img.style.margin) img.style.margin = '8px 0';
    if (!img.style.display) img.style.display = 'block';
    if (mode.id === 'mario-theme') {
      img.style.border = `3px solid ${themePipe}`;
      img.style.boxShadow = `0 6px 0 ${alphaColor(themeSky, 0.18, 'rgba(30,136,229,0.18)')}`;
      img.style.background = '#FFFFFF';
    }
    if (mode.id === 'coffee-journal') {
      img.style.border = `6px solid ${journalPaper}`;
      img.style.boxShadow = `0 8px 22px ${alphaColor(c.main, 0.14, 'rgba(200,135,78,0.14)')}`;
      img.style.background = journalPaper;
    }
  });
  applyThemedComponents(c);
}

function applyThemedComponents(c) {
  const main = c.main || '#2563EB';
  const accent = c.accent || main;
  const sub = c.sub || alphaColor(main, 0.08, '#f5f5f5');
  const text = c.text || '#333333';
  const grad = c.gradient || `linear-gradient(135deg, ${main}, ${accent})`;
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  const journalPaper = c.paper || c.sub || '#FFF6E8';

  preview.querySelectorAll('[data-theme-component="numbered-heading"]').forEach(el => {
    el.style.borderBottom = `1px solid ${alphaColor(main, 0.24, '#d4d4d4')}`;
    const num = el.querySelector('[data-theme-role="number"]');
    const divider = el.querySelector('[data-theme-role="divider"]');
    const title = el.querySelector('[data-theme-role="title"]');
    if (mode.id === 'coffee-journal') {
      const numWrap = num ? num.parentElement : null;
      const titleWrap = title ? title.parentElement : null;
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.gap = '10px';
      el.style.margin = '1.4em 0 0.9em';
      el.style.padding = '11px 14px';
      el.style.border = `1px solid ${alphaColor(main,0.22,'#E7D6BE')}`;
      el.style.borderLeft = `4px solid ${main}`;
      el.style.borderRadius = '10px';
      el.style.background = `linear-gradient(90deg, ${journalPaper} 0%, #FFFFFF 78%)`;
      el.style.boxShadow = `0 3px 12px ${alphaColor(main,0.06,'rgba(200,135,78,0.06)')}`;
      if (numWrap) {
        numWrap.style.order = '1';
        numWrap.style.minWidth = '0';
        numWrap.style.paddingRight = '0';
        numWrap.style.textAlign = 'left';
      }
      if (num) {
        num.style.display = 'inline-flex';
        num.style.alignItems = 'center';
        num.style.justifyContent = 'center';
        num.style.width = '28px';
        num.style.height = '28px';
        num.style.borderRadius = '8px';
        num.style.background = main;
        num.style.color = '#FFFFFF';
        num.style.fontSize = '13px';
        num.style.letterSpacing = '0';
        num.style.boxShadow = `0 3px 0 ${alphaColor(main,0.14,'rgba(200,135,78,0.14)')}`;
      }
      if (titleWrap) {
        titleWrap.style.order = '2';
        titleWrap.style.flex = '1';
        titleWrap.style.minWidth = '0';
      }
      if (divider) {
        divider.style.order = '3';
        divider.style.width = '28px';
        divider.style.height = '1px';
        divider.style.background = accent;
        divider.style.opacity = '0.55';
        divider.style.margin = '0';
        divider.style.flexShrink = '0';
      }
      if (title) {
        title.style.color = text;
        title.style.fontSize = '17px';
      }
      return;
    }
    if (num) num.style.color = main;
    if (divider) divider.style.background = alphaColor(main, 0.28, '#c8c8c8');
    if (title) title.style.color = main;
  });

  preview.querySelectorAll('[data-theme-component="tip-card"]').forEach(el => {
    el.style.background = sub;
    el.style.display = 'block';
    el.style.borderLeft = `4px solid ${main}`;
    el.style.boxSizing = 'border-box';
    el.style.width = '100%';
    el.style.maxWidth = '100%';
    const title = el.querySelector('[data-theme-role="title"]');
    const body = el.querySelector('[data-theme-role="body"]');
    if (title) {
      title.style.color = main;
      title.style.fontSize = '15px';
      title.style.fontWeight = '700';
      title.style.lineHeight = '1.6';
      title.style.margin = '0 0 8px';
    }
    if (body) {
      body.style.color = text;
      body.style.fontSize = '15px';
      body.style.fontWeight = '400';
      body.style.lineHeight = '1.8';
      body.style.margin = '0';
      Array.from(body.querySelectorAll('p,div,section,span')).forEach(child => {
        child.style.color = text;
        child.style.fontSize = '15px';
        child.style.fontWeight = '400';
        child.style.lineHeight = '1.8';
        child.style.letterSpacing = '0.02em';
        if (child.tagName === 'P') child.style.margin = '0 0 8px';
      });
    }
  });

  preview.querySelectorAll('[data-theme-component="design-intro"]').forEach(el => {
    el.style.borderColor = alphaColor(main, 0.16, '#d1fae5');
    const meta = el.querySelector('[data-theme-role="meta"]');
    const highlight = el.querySelector('[data-theme-role="highlight"]');
    const badge = el.querySelector('[data-theme-role="badge"]');
    const bar = el.querySelector('[data-theme-role="bar"]');
    const chipMain = el.querySelector('[data-theme-role="chip-main"]');
    const chips = el.querySelectorAll('[data-theme-role="chip"]');
    const title = el.querySelector('[data-theme-role="title"]');
    const body = el.querySelector('[data-theme-role="body"]');
    if (meta) meta.style.color = main;
    if (highlight) highlight.style.color = main;
    if (badge && !badge.hasAttribute('data-badge-has-image')) {
      badge.style.background = `linear-gradient(135deg, ${alphaColor(main,0.14,sub)}, ${alphaColor(accent,0.12,'#fff')})`;
    }
    if (bar) bar.style.background = grad;
    if (chipMain) {
      chipMain.style.background = main;
      chipMain.style.color = '#fff';
    }
    chips.forEach(chip => {
      chip.style.color = text;
      chip.style.borderColor = alphaColor(main, 0.14, '#E5E7EB');
    });
    if (title) title.style.color = text;
    if (body) body.style.color = '#9CA3AF';
  });

  preview.querySelectorAll('[data-theme-component="design-heading"]').forEach(el => {
    const num = el.querySelector('[data-theme-role="number"]');
    const label = el.querySelector('[data-theme-role="label"]');
    const title = el.querySelector('[data-theme-role="title"]');
    const subtitle = el.querySelector('[data-theme-role="subtitle"]');
    if (num) num.style.color = main;
    if (label) label.style.color = '#D1D5DB';
    if (title) title.style.color = text;
    if (subtitle) subtitle.style.color = '#9CA3AF';
  });

  preview.querySelectorAll('[data-theme-component="design-ending"]').forEach(el => {
    const num = el.querySelector('[data-theme-role="number"]');
    const label = el.querySelector('[data-theme-role="label"]');
    const title = el.querySelector('[data-theme-role="title"]');
    const subtitle = el.querySelector('[data-theme-role="subtitle"]');
    const quote = el.querySelector('[data-theme-role="quote"]');
    const summary = el.querySelector('[data-theme-role="summary"]');
    const summaryTitle = el.querySelector('[data-theme-role="summary-title"]');
    const share = el.querySelector('[data-theme-role="share"]');
    if (num) num.style.color = main;
    if (label) label.style.color = '#D1D5DB';
    if (title) title.style.color = text;
    if (subtitle) subtitle.style.color = '#9CA3AF';
    if (quote) quote.style.color = main;
    if (summary) summary.style.boxShadow = `0 4px 16px ${alphaColor(main,0.12,'rgba(0,0,0,0.08)')}`;
    if (summaryTitle) summaryTitle.style.color = text;
    if (share) share.style.color = main;
  });

  preview.querySelectorAll('[data-theme-component="ending"]').forEach(block => {
    const type = block.dataset.endingType || block.querySelector('[data-ending-type]')?.dataset.endingType || '1';
    const card = block.querySelector('[data-ending-type]') || block;
    const title = card.querySelector('[data-theme-role="title"]');
    const body = card.querySelector('[data-theme-role="body"]');
    const meta = card.querySelector('[data-theme-role="meta"]');
    const divider = card.querySelector('[data-theme-role="divider"]');
    if (title) title.style.color = main;
    if (body) {
      body.style.color = text;
      body.style.opacity = type === '2' ? '0.56' : '0.72';
    }
    if (meta) {
      meta.style.color = main;
      meta.style.opacity = type === '1' ? '0.42' : '0.52';
    }
    if (divider) divider.style.background = alphaColor(main, 0.3, '#e5e7eb');

    if (type === '1') {
      card.style.background = sub;
      const iconMain = card.querySelector('[data-theme-role="icon-main"]');
      const iconSub = card.querySelector('[data-theme-role="icon-sub"]');
      const iconAccent = card.querySelector('[data-theme-role="icon-accent"]');
      if (iconMain) iconMain.style.background = main;
      if (iconSub) iconSub.style.background = alphaColor(main, 0.12, '#eeeeee');
      if (iconAccent) iconAccent.style.background = alphaColor(accent, 0.16, '#eeeeee');
    }
    if (type === '2') {
      const thanks = card.children[1];
      if (thanks) thanks.style.color = main;
    }
    if (type === '3') {
      card.style.background = `linear-gradient(135deg, ${alphaColor(main, 0.12, sub)}, ${alphaColor(accent, 0.05, '#fff')})`;
    }
    if (type === '4') {
      const dots = card.querySelector('[data-theme-role="dots"]');
      const end = card.children[1];
      if (dots) {
        dots.style.color = main;
        dots.style.opacity = '0.32';
      }
      if (end) end.style.color = main;
    }
  });
}

// ===================================================================
// HEADING STYLES
// ===================================================================
function applyHeadingStyle(h, style, c, tag) {
  const grad = c.gradient || `linear-gradient(135deg, ${c.main}, ${c.accent})`;
  const themeSky = c.sky || c.main;
  const journalPaper = c.paper || c.sub || '#FFF6E8';
  const journalRose = c.rose || c.accent || '#E8B2B8';
  // Inject gradient bar via ::before pseudo-element using a wrapper span
  function addGradientBar(h, position, barW, barH, barRadius, gradient) {
    // Remove any existing bar
    const existingBar = h.querySelector('.heading-bar');
    if (existingBar) existingBar.remove();
    const bar = document.createElement('span');
    bar.className = 'heading-bar';
    bar.style.cssText = `display:inline-block;width:${barW};height:${barH};background:${gradient};border-radius:${barRadius};flex-shrink:0;`;
    if (position === 'left') {
      h.style.display = 'flex';
      h.style.alignItems = 'center';
      h.style.gap = '12px';
      h.insertBefore(bar, h.firstChild);
    } else if (position === 'bottom') {
      bar.style.display = 'block';
      bar.style.marginTop = '8px';
      h.appendChild(bar);
    } else if (position === 'top') {
      bar.style.display = 'block';
      bar.style.marginBottom = '8px';
      h.insertBefore(bar, h.firstChild);
    }
  }

  switch(style) {
    case 'underline-blue':
      h.style.color = c.main;
      h.style.paddingBottom = '10px';
      h.style.textAlign = 'left';
      h.style.letterSpacing = '0.03em';
      addGradientBar(h, 'bottom', tag==='H1'?'60px':'48px', '3px', '2px', grad);
      break;
    case 'center-deco':
      h.style.textAlign = 'center';
      h.style.color = c.text;
      h.style.paddingTop = '16px';
      h.style.paddingBottom = '16px';
      h.style.letterSpacing = '0.05em';
      addGradientBar(h, 'bottom', '40px', '3px', '2px', grad);
      // Center the bar
      const cBar = h.querySelector('.heading-bar');
      if(cBar) cBar.style.margin = '10px auto 0';
      break;
    case 'color-block':
      h.style.color = '#FFFFFF';
      h.style.padding = tag === 'H1' ? '14px 20px' : '10px 16px';
      h.style.borderRadius = '8px';
      h.style.textAlign = 'left';
      h.style.background = grad;
      h.style.letterSpacing = '0.03em';
      h.style.display = 'inline-block';
      h.style.width = 'fit-content';
      h.style.maxWidth = '100%';
      break;
    case 'small-tag':
      h.style.color = c.accent;
      h.style.textAlign = 'left';
      h.style.paddingLeft = '16px';
      h.style.fontSize = tag === 'H1' ? '20px' : tag === 'H2' ? '17px' : '15px';
      h.style.letterSpacing = '0.03em';
      addGradientBar(h, 'left', '4px', tag==='H1'?'28px':'22px', '2px', grad);
      break;
    case 'gradient-round':
      h.style.background = grad;
      h.style.color = '#FFFFFF';
      h.style.padding = '10px 24px';
      h.style.borderRadius = '24px';
      h.style.textAlign = 'center';
      h.style.display = 'inline-block';
      h.style.width = 'fit-content';
      h.style.maxWidth = '100%';
      h.style.letterSpacing = '0.04em';
      break;
    case 'thick-underline':
      h.style.color = c.text;
      h.style.paddingBottom = '8px';
      h.style.textAlign = 'left';
      h.style.letterSpacing = '0.03em';
      addGradientBar(h, 'bottom', tag==='H1'?'100%':'80px', '4px', '2px', grad);
      break;
    case 'business-card':
      h.querySelectorAll('.heading-bar').forEach(bar => bar.remove());
      h.style.color = '#FFFFFF';
      h.style.background = c.main;
      h.style.border = 'none';
      h.style.borderLeft = 'none';
      h.style.borderBottom = 'none';
      h.style.borderRadius = '8px';
      h.style.padding = tag === 'H1' ? '18px 22px 11px' : '15px 18px 9px';
      h.style.marginTop = '22px';
      h.style.marginRight = 'auto';
      h.style.marginBottom = '16px';
      h.style.marginLeft = 'auto';
      h.style.display = 'block';
      h.style.width = 'fit-content';
      h.style.maxWidth = '100%';
      h.style.textAlign = 'center';
      h.style.letterSpacing = '0.02em';
      h.style.boxShadow = 'none';
      h.style.position = 'relative';
      h.style.fontSize = tag === 'H1' ? '18px' : tag === 'H2' ? '15px' : '14px';
      if (!h.dataset.businessPartAdded) {
        const allHeadings = Array.from(h.parentElement.querySelectorAll('h1,h2,h3'));
        const num = allHeadings.indexOf(h) + 1;
        const partMargin = tag === 'H1' ? '-27px auto 6px' : '-24px auto 6px';
        h.innerHTML = `<span style="display:block;width:fit-content;margin:${partMargin};padding:2px 12px;border-radius:999px;background:${c.sub};color:${c.main};font-size:11px;font-weight:800;line-height:1.3;">Part.${num}</span><span style="display:block;color:#FFFFFF;line-height:1.25;">${h.innerHTML}</span>`;
        h.dataset.businessPartAdded = '1';
      }
      {
        const spans = Array.from(h.querySelectorAll(':scope > span'));
        const partMargin = tag === 'H1' ? '-27px auto 6px' : '-24px auto 6px';
        if (spans[0]) {
          spans[0].style.display = 'block';
          spans[0].style.width = 'fit-content';
          spans[0].style.margin = partMargin;
          spans[0].style.padding = '2px 12px';
          spans[0].style.borderRadius = '999px';
          spans[0].style.background = c.sub;
          spans[0].style.color = c.main;
          spans[0].style.fontSize = '11px';
        }
        if (spans[1]) {
          spans[1].style.display = 'block';
          spans[1].style.color = '#FFFFFF';
          spans[1].style.lineHeight = '1.25';
        }
      }
      break;
    case 'center-red':
      h.style.textAlign = 'center';
      h.style.color = c.main;
      h.style.paddingBottom = '12px';
      h.style.letterSpacing = '0.08em';
      addGradientBar(h, 'bottom', '36px', '3px', '2px', grad);
      const rBar = h.querySelector('.heading-bar');
      if(rBar) rBar.style.margin = '10px auto 0';
      break;
    case 'plain':
      h.style.textAlign = 'left';
      h.style.color = c.text;
      h.style.fontWeight = '500';
      h.style.letterSpacing = '0.04em';
      addGradientBar(h, 'left', '3px', tag==='H1'?'24px':'18px', '1.5px', `linear-gradient(180deg, ${c.text}44, ${c.text}11)`);
      break;
    case 'numbered-divider':
      h.style.color = c.main;
      h.style.fontWeight = '700';
      h.style.fontSize = tag === 'H1' ? '18px' : tag === 'H2' ? '16px' : '15px';
      h.style.borderBottom = '1px solid #E5E7EB';
      h.style.paddingBottom = '14px';
      h.style.paddingTop = '14px';
      h.style.letterSpacing = '0.02em';
      h.style.textAlign = 'left';
      addGradientBar(h, 'left', '4px', '32px', '2px', grad);
      break;
    case 'mario-block':
      h.style.color = '#FFFFFF';
      h.style.background = c.main;
      h.style.borderRadius = '10px';
      h.style.border = '2px solid #111827';
      h.style.borderBottom = `6px solid ${c.accent}`;
      h.style.boxShadow = `0 6px 0 ${alphaColor(themeSky, 0.22, 'rgba(30,136,229,0.22)')}`;
      h.style.padding = tag === 'H1' ? '14px 16px' : '11px 14px';
      h.style.display = 'flex';
      h.style.alignItems = 'center';
      h.style.gap = '10px';
      h.style.textAlign = 'left';
      h.style.letterSpacing = '0.02em';
      h.style.fontSize = tag === 'H1' ? '22px' : tag === 'H2' ? '18px' : '16px';
      if (!h.dataset.marioBadgeAdded) {
        const allHeadings = Array.from(h.parentElement.querySelectorAll('h1,h2,h3'));
        const num = String(allHeadings.indexOf(h) + 1).padStart(2, '0');
        h.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${c.accent};border:2px solid #111827;color:#111827;font-size:11px;font-weight:900;line-height:1;flex-shrink:0;box-sizing:border-box;">${num}</span><span style="min-width:0;">${h.innerHTML}</span>`;
        h.dataset.marioBadgeAdded = '1';
      }
      break;
    case 'coffee-label':
      h.style.color = c.text;
      h.style.background = `linear-gradient(90deg, ${journalPaper} 0%, #FFFFFF 78%)`;
      h.style.border = `1px solid ${alphaColor(c.main,0.22,'#E7D6BE')}`;
      h.style.borderLeft = `4px solid ${c.main}`;
      h.style.boxShadow = `0 3px 12px ${alphaColor(c.main,0.06,'rgba(200,135,78,0.06)')}`;
      h.style.padding = tag === 'H1' ? '12px 14px' : '10px 12px';
      h.style.display = 'flex';
      h.style.alignItems = 'center';
      h.style.gap = '8px';
      h.style.textAlign = 'left';
      h.style.letterSpacing = '0.02em';
      h.style.borderRadius = '10px';
      h.style.fontSize = tag === 'H1' ? '20px' : tag === 'H2' ? '17px' : '15px';
      if (!h.dataset.coffeeBadgeAdded) {
        const allHeadings = Array.from(h.parentElement.querySelectorAll('h1,h2,h3'));
        const num = String(allHeadings.indexOf(h) + 1).padStart(2, '0');
        h.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:${c.main};color:#fff;font-size:13px;font-weight:900;line-height:1;flex-shrink:0;box-shadow:0 3px 0 ${alphaColor(c.main,0.14,'rgba(200,135,78,0.14)')};">${num}</span><span style="display:inline-block;min-width:0;color:${c.text};">${h.innerHTML}</span><span style="width:28px;height:1px;background:${c.accent};opacity:.55;flex-shrink:0;margin-left:auto;"></span>`;
        h.dataset.coffeeBadgeAdded = '1';
      }
      break;
    case 'tag-badge':
      h.style.color = c.accent;
      h.style.fontWeight = '700';
      h.style.fontSize = tag === 'H1' ? '18px' : tag === 'H2' ? '16px' : '14px';
      h.style.borderBottom = '1px solid #e8e8e8';
      h.style.paddingBottom = '12px';
      h.style.paddingTop = '12px';
      h.style.textAlign = 'left';
      addGradientBar(h, 'left', '4px', '24px', '2px', grad);
      break;
  }
}

// ===================================================================
// QUOTE STYLES
// ===================================================================
function applyQuoteStyle(bq, style, c) {
  const grad = c.gradient || `linear-gradient(135deg, ${c.main}, ${c.accent})`;
  const themeSky = c.sky || c.main;
  const journalPaper = c.paper || c.sub || '#FFF6E8';
  switch(style) {
    case 'blue-bar':
      bq.style.borderLeft = 'none';
      bq.style.borderImage = 'none';
      bq.style.background = c.sub;
      bq.style.padding = '18px 22px 18px 20px';
      bq.style.borderRadius = '0 12px 12px 0';
      bq.style.color = c.text;
      bq.style.position = 'relative';
      bq.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      // gradient left border via pseudo-element hack: use box-shadow inset
      bq.style.borderLeft = `4px solid transparent`;
      bq.style.borderImage = `${grad} 1`;
      break;
    case 'italic-quotes':
      bq.style.fontStyle = 'italic';
      bq.style.padding = '24px 28px';
      bq.style.color = c.text;
      bq.style.borderLeft = 'none';
      bq.style.position = 'relative';
      bq.style.textAlign = 'center';
      bq.style.background = c.sub;
      bq.style.borderRadius = '12px';
      bq.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
      break;
    case 'left-bar-gray':
      bq.style.borderLeft = `4px solid transparent`;
      bq.style.borderImage = `${grad} 1`;
      bq.style.background = c.sub || '#F7F8FA';
      bq.style.padding = '16px 20px';
      bq.style.borderRadius = '0 10px 10px 0';
      bq.style.color = c.text || '#555';
      bq.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
      bq.style.fontSize = '14px';
      break;
    case 'dashed-warm':
      bq.style.border = 'none';
      bq.style.background = c.sub;
      bq.style.padding = '20px 22px';
      bq.style.borderRadius = '12px';
      bq.style.color = c.text;
      bq.style.boxShadow = `inset 0 0 0 1.5px ${c.main}40`;
      bq.style.position = 'relative';
      break;
    case 'color-border-round':
      bq.style.border = 'none';
      bq.style.borderRadius = '16px';
      bq.style.background = c.sub;
      bq.style.padding = '20px 24px';
      bq.style.color = c.text;
      bq.style.boxShadow = `0 0 0 2px ${c.main}30, 0 4px 12px rgba(0,0,0,0.05)`;
      bq.style.position = 'relative';
      break;
    case 'gray-bg-bar':
      bq.style.borderLeft = `4px solid transparent`;
      bq.style.borderImage = `${grad} 1`;
      bq.style.background = c.sub;
      bq.style.padding = '16px 20px';
      bq.style.borderRadius = '0 8px 8px 0';
      bq.style.color = c.text;
      bq.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
      break;
    case 'traditional-border':
      bq.style.border = 'none';
      bq.style.background = `linear-gradient(135deg, ${c.sub}, ${alphaColor(c.main, 0.08, c.bg)})`;
      bq.style.padding = '20px 22px';
      bq.style.borderRadius = '4px';
      bq.style.color = c.text;
      bq.style.position = 'relative';
      bq.style.boxShadow = `inset 0 0 0 2px ${c.main}50`;
      break;
    case 'italic-indent':
      bq.style.fontStyle = 'italic';
      bq.style.paddingLeft = '2em';
      bq.style.borderLeft = 'none';
      bq.style.color = c.text;
      bq.style.opacity = '0.72';
      bq.style.position = 'relative';
      bq.style.letterSpacing = '0.03em';
      // subtle left gradient line
      bq.innerHTML = `<span style="position:absolute;left:0;top:0;width:2px;height:100%;background:${grad};border-radius:1px;opacity:0.4"></span>${bq.innerHTML}`;
      break;
    case 'navy-highlight':
      bq.style.borderLeft = 'none';
      bq.style.background = c.sub;
      bq.style.padding = '18px 22px';
      bq.style.borderRadius = '10px';
      bq.style.color = c.main;
      bq.style.fontWeight = '700';
      bq.style.fontSize = '15px';
      bq.style.lineHeight = '2';
      bq.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      bq.style.borderBottom = `3px solid transparent`;
      bq.style.borderImage = `${grad} 1`;
      break;
    case 'card-tip':
      bq.style.background = c.sub;
      bq.style.borderRadius = '12px';
      bq.style.padding = '20px 24px';
      bq.style.borderLeft = 'none';
      bq.style.color = c.text;
      bq.style.fontSize = '14px';
      bq.style.lineHeight = '1.8';
      bq.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
      break;
    case 'mario-card':
      bq.style.border = `2px solid ${c.main}`;
      bq.style.borderLeft = `8px solid ${c.main}`;
      bq.style.background = `linear-gradient(180deg, ${c.sub}, #FFFFFF)`;
      bq.style.padding = '18px 20px 18px 22px';
      bq.style.borderRadius = '16px';
      bq.style.color = c.text;
      bq.style.fontSize = '14px';
      bq.style.lineHeight = '1.85';
      bq.style.boxShadow = `0 6px 0 ${alphaColor(themeSky, 0.18, 'rgba(30,136,229,0.18)')}`;
      break;
    case 'coffee-note':
      bq.style.border = `1.5px solid ${alphaColor(c.main, 0.42, '#DCC8A7')}`;
      bq.style.borderLeft = `5px solid ${c.accent}`;
      bq.style.background = `linear-gradient(135deg, #FFFFFF, ${journalPaper})`;
      bq.style.padding = '18px 20px';
      bq.style.borderRadius = '14px';
      bq.style.color = c.text;
      bq.style.fontSize = '14px';
      bq.style.lineHeight = '1.9';
      bq.style.boxShadow = `0 6px 18px ${alphaColor(c.main, 0.08, 'rgba(200,135,78,0.08)')}`;
      break;
  }
}

// ===================================================================
// HR STYLES
// ===================================================================
function applyHrStyle(hr, style, c) {
  const grad = c.gradient || `linear-gradient(135deg, ${c.main}, ${c.accent})`;
  const themePipe = c.pipe || c.main;
  const themeSky = c.sky || c.main;
  const journalPaper = c.paper || c.sub || '#FFF6E8';
  hr.style.border = 'none';
  hr.style.height = 'auto';
  hr.style.overflow = 'visible';

  switch(style) {
    case 'basic-line':
      hr.style.height = '1px';
      hr.style.background = alphaColor(c.main, 0.32, '#CBD5E1');
      hr.style.opacity = '1';
      break;
    case 'dot-line':
      hr.outerHTML = `<div style="margin:2em 0;display:flex;align-items:center;justify-content:center;gap:10px"><span style="flex:1;max-width:92px;height:1px;background:${alphaColor(c.main,0.28,'#CBD5E1')}"></span><span style="width:6px;height:6px;border-radius:50%;background:${c.main};opacity:0.55"></span><span style="flex:1;max-width:92px;height:1px;background:${alphaColor(c.main,0.28,'#CBD5E1')}"></span></div>`;
      break;
    case 'ornament-line':
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;display:flex;align-items:center;justify-content:center;gap:12px"><span style="flex:1;max-width:72px;height:1px;background:${alphaColor(c.main,0.24,'#CBD5E1')}"></span><span style="color:${c.main};font-size:14px;opacity:0.6">✦</span><span style="flex:1;max-width:72px;height:1px;background:${alphaColor(c.main,0.24,'#CBD5E1')}"></span></div>`;
      break;
    case 'thin-line':
      hr.style.height = '2px';
      hr.style.background = grad;
      hr.style.opacity = '0.3';
      hr.style.borderRadius = '1px';
      break;
    case 'center-short':
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;display:flex;align-items:center;justify-content:center;gap:12px"><span style="flex:1;max-width:60px;height:1px;background:${c.main}30"></span><span style="color:${c.main};font-size:14px;opacity:0.6">✦</span><span style="flex:1;max-width:60px;height:1px;background:${c.main}30"></span></div>`;
      break;
    case 'numbered':
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:4px;height:4px;border-radius:50%;background:${c.main};opacity:0.4"></span><span style="width:4px;height:4px;border-radius:50%;background:${c.main};opacity:0.6"></span><span style="width:4px;height:4px;border-radius:50%;background:${c.main};opacity:0.4"></span></div>`;
      break;
    case 'wave':
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;height:2px;background:${grad};opacity:0.25;border-radius:1px;max-width:120px;margin-left:auto;margin-right:auto"></div>`;
      break;
    case 'color-wave':
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;display:flex;align-items:center;justify-content:center;gap:6px"><span style="width:20px;height:3px;border-radius:2px;background:${c.main};opacity:0.7"></span><span style="width:20px;height:3px;border-radius:2px;background:${c.accent};opacity:0.5"></span><span style="width:20px;height:3px;border-radius:2px;background:${c.main};opacity:0.7"></span></div>`;
      break;
    case 'double-line':
      hr.style.height = '4px';
      hr.style.background = grad;
      hr.style.opacity = '0.2';
      hr.style.borderRadius = '2px';
      break;
    case 'chinese-pattern':
      hr.outerHTML = `<div style="text-align:center;margin:2em 0;display:flex;align-items:center;justify-content:center;gap:8px"><span style="width:16px;height:1px;background:${c.main}40"></span><span style="color:${c.main};font-size:10px;opacity:0.5">◆</span><span style="width:16px;height:1px;background:${c.main}40"></span><span style="color:${c.main};font-size:8px;opacity:0.35">◇</span><span style="width:16px;height:1px;background:${c.main}40"></span></div>`;
      break;
    case 'mario-coins':
      hr.outerHTML = `<div style="margin:2.2em 0;display:flex;align-items:center;justify-content:center;gap:8px"><span style="flex:1;max-width:86px;height:4px;background:${themePipe};border-radius:999px;box-shadow:0 3px 0 ${alphaColor(themeSky,0.18,'rgba(30,136,229,0.18)')}"></span><span style="width:18px;height:18px;border-radius:50%;background:${c.accent};border:2px solid #111827;box-sizing:border-box;"></span><span style="width:18px;height:18px;border-radius:50%;background:${c.accent};border:2px solid #111827;box-sizing:border-box;"></span><span style="width:18px;height:18px;border-radius:50%;background:${c.accent};border:2px solid #111827;box-sizing:border-box;"></span><span style="flex:1;max-width:86px;height:4px;background:${themePipe};border-radius:999px;box-shadow:0 3px 0 ${alphaColor(themeSky,0.18,'rgba(30,136,229,0.18)')}"></span></div>`;
      break;
    case 'coffee-dots':
      hr.outerHTML = `<div style="margin:2em 0;display:flex;align-items:center;justify-content:center;gap:10px"><span style="width:72px;height:1px;background:${alphaColor(c.main,0.28,'#DCC8A7')}"></span><span style="width:9px;height:9px;border-radius:50%;background:${c.main};"></span><span style="width:9px;height:9px;border-radius:50%;background:${c.accent};"></span><span style="width:9px;height:9px;border-radius:50%;background:${journalPaper};border:1px solid ${alphaColor(c.main,0.34,'#DCC8A7')};box-sizing:border-box;"></span><span style="width:72px;height:1px;background:${alphaColor(c.main,0.28,'#DCC8A7')}"></span></div>`;
      break;
    case 'none':
      hr.style.display = 'none';
      break;
  }
}

// ===================================================================
// MODE APPLICATION
// ===================================================================
function applyMode(mode) {
  STATE.mode = mode.id;
  STATE.titleFont = mode.titleFont;
  STATE.bodyFont = mode.bodyFont;
  STATE.colorScheme = mode.color;
  STATE.customColors = null;
  STATE.lineHeight = mode.lineHeight;
  STATE.paraSpacing = mode.paraSpacing;
  updatePreview();
}

// ===================================================================
// SETTINGS PANEL
// ===================================================================
function togglePocket() {
  const fan = $('pocketFan');
  const btn = $('btnMode');
  if (fan.classList.contains('open')) { closePocket(); return; }
  fan.classList.add('open');
  btn.classList.add('open');
  setTimeout(() => {
    const handler = e => {
      if (!$('pocketWrap').contains(e.target)) {
        closePocket();
        document.removeEventListener('click', handler);
        togglePocket._handler = null;
      }
    };
    togglePocket._handler = handler;
    document.addEventListener('click', handler);
  }, 10);
}
function closePocket() {
  $('pocketFan').classList.remove('open');
  $('btnMode').classList.remove('open');
  if (togglePocket._handler) {
    document.removeEventListener('click', togglePocket._handler);
    togglePocket._handler = null;
  }
}
function openSettings(tab) {
  const overlay = $('settingsOverlay');
  const panel = $('settingsPanel');
  overlay.classList.add('show');
  panel.classList.add('show');
  renderSettingsTab(tab);
}
function closeSettings() {
  $('settingsOverlay').classList.remove('show');
  $('settingsPanel').classList.remove('show');
}
function renderSettingsTab(tab) {
  const title = $('spTitle');
  const body = $('spBody');
  const currentTab = tab || 'mode';
  title.textContent = '样式设置';
  body.innerHTML = `
    <div class="settings-tabs">
      <button class="settings-tab ${currentTab==='mode'?'active':''}" onclick="renderSettingsTab('mode')">排版</button>
      <button class="settings-tab ${currentTab==='font'?'active':''}" onclick="renderSettingsTab('font')">字体</button>
      <button class="settings-tab ${currentTab==='color'?'active':''}" onclick="renderSettingsTab('color')">配色</button>
      <button class="settings-tab ${currentTab==='spacing'?'active':''}" onclick="renderSettingsTab('spacing')">间距</button>
      <button class="settings-tab ${currentTab==='bg'?'active':''}" onclick="renderSettingsTab('bg')">背景</button>
    </div>
    <div id="settingsTabContent"></div>
  `;
  const content = $('settingsTabContent');
  switch(currentTab) {
    case 'mode': renderModeSettingsContent(content); break;
    case 'font': renderFontSettingsContent(content); break;
    case 'color': renderColorSettingsContent(content); break;
    case 'spacing': renderSpacingSettingsContent(content); break;
    case 'bg': renderBgSettingsContent(content); break;
  }
}

function renderModeSettingsContent(content) {
  let html = '<div class="mode-cards">';
  MODES.forEach(m => {
    html += `<div class="mode-card ${STATE.mode === m.id ? 'active' : ''}" onclick="selectMode('${m.id}')">
      <div class="mc-name">${m.name}</div>
      <div class="mc-desc">${m.desc}</div>
    </div>`;
  });
  html += '</div>';
  content.innerHTML = html;
}

function selectMode(id) {
  const mode = MODES.find(m => m.id === id);
  if (mode) applyMode(mode);
  renderSettingsTab('mode');
}

function renderFontSettingsContent(content) {
  let html = '<div class="sp-section"><h4>标题字体</h4><div class="sp-row"><select onchange="STATE.titleFont=+this.value;updatePreview()" style="flex:1">';
  TITLE_FONTS.forEach((f,i) => {
    html += `<option value="${i}" ${STATE.titleFont===i?'selected':''}>${f.name}</option>`;
  });
  html += '</select></div></div>';
  html += '<div class="sp-section"><h4>正文字体</h4><div class="sp-row"><select onchange="STATE.bodyFont=+this.value;updatePreview()" style="flex:1">';
  BODY_FONTS.forEach((f,i) => {
    html += `<option value="${i}" ${STATE.bodyFont===i?'selected':''}>${f.name}</option>`;
  });
  html += '</select></div></div>';
  content.innerHTML = html;
}

function renderColorSettingsContent(content) {
  let html = '<div class="sp-section"><h4>预设配色</h4><div class="color-row">';
  COLOR_SCHEMES.forEach((cs,i) => {
    const active = (!STATE.customColors && STATE.colorScheme === i) ? 'active' : '';
    html += `<div class="color-chip ${active}" title="${escapeAttr(cs.name)}" onclick="selectColorScheme(${i})"><span style="background:${escapeAttr(cs.main)}"></span><span style="background:${escapeAttr(cs.accent)}"></span><span style="background:${escapeAttr(cs.sub)}"></span></div>`;
  });
  html += '</div></div>';

  // Custom colors
  const cc = getColors();
  html += '<div class="sp-section"><h4>自定义配色</h4>';
  html += '<div class="custom-color-grid">';
  const fields = [
    ['main','主色',cc.main],['sub','辅色',cc.sub],['accent','强调色',cc.accent],['text','正文色',cc.text],['bg','背景色',cc.bg]
  ];
  fields.forEach(([key,label,val]) => {
    const safeVal = sanitizeColorValue(val, '#333333');
    html += `<label>${label}</label><input type="text" value="${escapeAttr(safeVal)}" onchange="setCustomColor('${key}',this.value);this.value=getColors()['${key}']" id="cc_${key}"><input type="color" value="${escapeAttr(toColorInputValue(safeVal))}" onchange="setCustomColor('${key}',this.value);$('cc_${key}').value=this.value">`;
  });
  html += '</div></div>';
  content.innerHTML = html;
}

function selectColorScheme(i) {
  STATE.colorScheme = i;
  STATE.customColors = null;
  updatePreview();
  renderSettingsTab('color');
}

function setCustomColor(key, val) {
  if (!STATE.customColors) {
    STATE.customColors = {...COLOR_SCHEMES[STATE.colorScheme]};
  }
  const fallback = COLOR_SCHEMES[STATE.colorScheme][key] || '#333333';
  STATE.customColors[key] = sanitizeColorValue(val, fallback);
  updatePreview();
}

function renderSpacingSettingsContent(content) {
  const lhOptions = [
    {label:'紧凑 1.5', v:1.5},{label:'标准 1.75', v:1.75},{label:'舒适 2.0', v:2.0},{label:'宽松 2.2', v:2.2},{label:'超宽松 2.5', v:2.5}
  ];
  const psOptions = [
    {label:'紧凑 0.5em', v:0.5},{label:'标准 1.0em', v:1.0},{label:'宽松 1.5em', v:1.5},{label:'超宽松 2.0em', v:2.0}
  ];

  let html = '<div class="sp-section"><h4>行距</h4>';
  html += '<div class="sp-row"><select onchange="setLineHeight(this.value)" style="flex:1">';
  lhOptions.forEach(o => {
    html += `<option value="${o.v}" ${Math.abs(STATE.lineHeight - o.v)<0.01?'selected':''}>${o.label}</option>`;
  });
  html += '</select></div>';
  html += `<div class="sp-row"><label style="width:auto">自定义</label><input type="number" step="0.1" min="1.2" max="3.0" value="${STATE.lineHeight}" onchange="setLineHeight(this.value)" style="width:80px"></div></div>`;

  html += '<div class="sp-section"><h4>段距</h4>';
  html += '<div class="sp-row"><select onchange="setParaSpacing(this.value)" style="flex:1">';
  psOptions.forEach(o => {
    html += `<option value="${o.v}" ${Math.abs(STATE.paraSpacing - o.v)<0.01?'selected':''}>${o.label}</option>`;
  });
  html += '</select></div>';
  html += `<div class="sp-row"><label style="width:auto">自定义</label><input type="number" step="0.1" min="0.2" max="3.0" value="${STATE.paraSpacing}" onchange="setParaSpacing(this.value)" style="width:80px"><span style="font-size:12px;color:#999">em</span></div></div>`;

  content.innerHTML = html;
}

function renderBgSettingsContent(content) {
  let html = '<div class="sp-section"><h4>选择背景</h4><div class="mode-cards">';
  BG_TEXTURES.forEach(bg => {
    const active = STATE.bg === bg.id ? 'active' : '';
    const bgSizeAttr = bg.cssBgSize ? `background-size:${bg.cssBgSize};` : '';
    html += `<div class="mode-card ${active}" onclick="selectBg('${bg.id}')" style="height:64px;display:flex;align-items:center;justify-content:center;">`;
    html += `<div style="width:100%;height:100%;border-radius:4px;background:${bg.css};${bgSizeAttr}display:flex;align-items:center;justify-content:center;">`;
    html += `<span style="font-size:11px;font-weight:600;color:#666;text-shadow:0 0 3px #fff,0 0 6px #fff">${bg.name}</span></div></div>`;
  });
  html += '</div></div>';
  content.innerHTML = html;
}

function selectBg(id) {
  STATE.bg = id;
  applyBgTexture();
  renderSettingsTab('bg');
}

function applyBgTexture() {
  const bg = BG_TEXTURES.find(b => b.id === STATE.bg) || BG_TEXTURES[0];
  const wrap = $('previewWrap');
  const frame = $('previewFrame');
  // Apply texture to the preview frame background
  frame.style.background = bg.css;
  frame.style.backgroundSize = bg.cssBgSize || '';
  // Also apply to the preview content itself
  preview.style.background = bg.css;
  preview.style.backgroundSize = bg.cssBgSize || '';
}

function setLineHeight(v) {
  STATE.lineHeight = clampNumber(v, 1.2, 3.0, 1.75);
  updatePreview();
}
function setParaSpacing(v) {
  STATE.paraSpacing = clampNumber(v, 0.2, 3.0, 1.0);
  updatePreview();
}

// ===================================================================
// DIVIDER DRAG
// ===================================================================
function setupDivider() {
  let startX, startLeftW;
  const total = () => panelLeft.parentElement.clientWidth - 5; // minus divider

  divider.addEventListener('mousedown', e => {
    e.preventDefault();
    startX = e.clientX;
    startLeftW = panelLeft.offsetWidth;
    divider.classList.add('active');
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onUp);
  });

  function onDrag(e) {
    const dx = e.clientX - startX;
    let newLeft = startLeftW + dx;
    const t = total();
    if (newLeft < 300) newLeft = 300;
    if (t - newLeft < 350) newLeft = t - 350;
    const pct = (newLeft / (t)) * 100;
    panelLeft.style.width = pct + '%';
    panelRight.style.width = (100 - pct) + '%';
  }
  function onUp() {
    divider.classList.remove('active');
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onUp);
  }
}

// ===================================================================
// SCROLL SYNC
// ===================================================================
function setupScrollSync() {
  let syncing = false;
  editor.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    const pct = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    const target = previewWrap;
    target.scrollTop = pct * (target.scrollHeight - target.clientHeight);
    requestAnimationFrame(() => syncing = false);
  });
  previewWrap.addEventListener('scroll', () => {
    if (syncing) return;
    syncing = true;
    const pct = previewWrap.scrollTop / (previewWrap.scrollHeight - previewWrap.clientHeight || 1);
    editor.scrollTop = pct * (editor.scrollHeight - editor.clientHeight);
    requestAnimationFrame(() => syncing = false);
  });
}

// ===================================================================
// MOBILE PREVIEW
// ===================================================================
function toggleMobile() {
  STATE.isMobile = !STATE.isMobile;
  previewFrame.classList.toggle('mobile', STATE.isMobile);
  $('mobileToggle').classList.toggle('active', STATE.isMobile);
}

// 微信兼容预览：跑一遍粘贴前的全套 normalize（flex→inline-block 等），让你提前看到「粘到公众号会变什么样」
// 默认开启：右侧预览始终是「粘到公众号的真实样子」，避免编辑器里好看、粘出来塌房
let wechatPreviewActive = true;
let wechatPreviewBackup = null;
function toggleWechatPreview() {
  wechatPreviewActive = !wechatPreviewActive;
  $('wechatPreviewToggle').classList.toggle('active', wechatPreviewActive);
  if (wechatPreviewActive) {
    wechatPreviewBackup = preview.innerHTML;
    // 跑一遍微信兼容管道，得到预期的粘贴结果
    const html = buildWechatHTMLFromElement(preview, false);
    preview.innerHTML = html;
  } else if (wechatPreviewBackup !== null) {
    preview.innerHTML = wechatPreviewBackup;
    wechatPreviewBackup = null;
    // 重新跑正常的样式应用
    scheduleUpdate();
  }
}

// ===================================================================
// COPY TO WECHAT - Inline all styles
// ===================================================================
function buildWechatHTMLSnippet() {
  return buildWechatHTMLFromElement(preview, true);
}
function appendRawStyle(el, styleText) {
  const current = (el.getAttribute('style') || '').trim();
  el.setAttribute('style', current ? `${current};${styleText}` : styleText);
}
function restoreWechatCodeBlockNoWrap(root) {
  root.querySelectorAll('pre').forEach(pre => {
    appendRawStyle(pre, 'white-space:pre;word-wrap:normal;overflow-wrap:normal;overflow-x:auto;overflow-y:hidden');
  });
  root.querySelectorAll('pre code').forEach(code => {
    appendRawStyle(code, 'display:block;white-space:pre;word-wrap:normal;overflow-wrap:normal;min-width:max-content;width:max-content;max-width:none');
  });
}
function buildWechatHTMLFromElement(source, includeBg) {
  const clone = source.cloneNode(true);
  inlineAllStyles(clone);
  prepareWechatCompatibility(clone);
  normalizeWechatSpacingParity(clone);
  clone.innerHTML = sanitizeContentHTML(clone.innerHTML);
  restoreWechatCodeBlockNoWrap(clone);
  if (!includeBg) return clone.innerHTML;
  const bg = BG_TEXTURES.find(b => b.id === STATE.bg) || BG_TEXTURES[0];
  let bgStyle = `background:${bg.css};`;
  if (bg.cssBgSize) bgStyle += `background-size:${bg.cssBgSize};`;
  const baseLine = getLineHeightPx(15, STATE.lineHeight);
  return `<section style="${bgStyle}padding:32px 24px;font-size:15px;line-height:${baseLine}px;color:${WECHAT_MODE_SAFE.text};background-color:#FFFFFF;">${clone.innerHTML}</section>`;
}
function setButtonCopied(btn, copiedText, originalText, ms = 2000) {
  if (!btn) return;
  btn.textContent = copiedText;
  btn.classList.add('success');
  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove('success');
  }, ms);
}
function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}
function fallbackCopyHTML(html) {
  const div = document.createElement('div');
  div.contentEditable = 'true';
  div.innerHTML = html;
  div.style.position = 'fixed';
  div.style.left = '-9999px';
  div.style.top = '0';
  div.style.opacity = '0';
  div.style.pointerEvents = 'none';
  document.body.appendChild(div);
  const range = document.createRange();
  range.selectNodeContents(div);
  const sel = window.getSelection();
  const savedRanges = [];
  for (let i = 0; i < sel.rangeCount; i++) savedRanges.push(sel.getRangeAt(i));
  sel.removeAllRanges();
  sel.addRange(range);
  try { document.execCommand('copy'); } catch {}
  sel.removeAllRanges();
  savedRanges.forEach(r => sel.addRange(r));
  document.body.removeChild(div);
}
function copyToWechat() {
  const html = buildWechatHTMLSnippet();

  navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([html], {type: 'text/html'}),
      'text/plain': new Blob([preview.innerText], {type: 'text/plain'})
    })
  ]).then(() => {
    const btn = $('copyBtn');
    setButtonCopied(btn, '✅ 已复制', '🚀 一键复制到公众号');
    showPromote();
  }).catch(err => {
    fallbackCopyHTML(html);
    const btn = $('copyBtn');
    setButtonCopied(btn, '✅ 已复制', '🚀 一键复制到公众号');
    showPromote();
  });
}
function copyHTMLCode() {
  const html = buildWechatHTMLSnippet();
  const btn = $('copyHtmlBtn');
  const done = () => setButtonCopied(btn, '✅ HTML已复制', '复制为 HTML');
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], {type: 'text/html'}),
        'text/plain': new Blob([html], {type: 'text/plain'})
      })
    ]).then(done).catch(() => {
      fallbackCopyHTML(html);
      done();
    });
  } else {
    fallbackCopyHTML(html);
    done();
  }
}

function inlineAllStyles(container) {
  const c = getColors();
  const tf = TITLE_FONTS[STATE.titleFont];
  const bf = BODY_FONTS[STATE.bodyFont];
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];

  // Apply computed styles to all elements
  const all = container.querySelectorAll('*');
  all.forEach(el => {
    const cs = {};
    const computed = el.style;
    // Copy existing inline styles
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      cs[prop] = computed.getPropertyValue(prop);
    }
    // Ensure key properties
    if (['P','LI','SPAN'].includes(el.tagName)) {
      if (!cs['font-family']) el.style.fontFamily = bf.stack;
      if (!cs['line-height']) el.style.lineHeight = String(STATE.lineHeight);
      if (!cs['color']) el.style.color = c.text;
      if (!cs['font-size']) el.style.fontSize = '15px';
    }
    if (['H1','H2','H3'].includes(el.tagName)) {
      if (!cs['font-family']) el.style.fontFamily = tf.stack;
    }
    // Remove classes & ids (wechat strips them)
    el.removeAttribute('class');
    el.removeAttribute('id');
    // Remove contenteditable
    el.removeAttribute('contenteditable');
    // Remove event handlers and unsafe URLs before copying/exporting
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') el.removeAttribute(attr.name);
    });
    if (el.tagName === 'IMG') {
      const safeSrc = sanitizeImageSrc(el.getAttribute('src'));
      if (safeSrc) el.setAttribute('src', safeSrc);
      else el.remove();
    }
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') || '';
      try {
        const u = new URL(href, window.location.href);
        if (u.protocol === 'http:' || u.protocol === 'https:') el.setAttribute('href', u.href);
        else el.removeAttribute('href');
      } catch { el.removeAttribute('href'); }
    }
  });

  // Remove script, style tags
  container.querySelectorAll('script,style,link,iframe,object,embed,form,input,button,textarea,select').forEach(el => el.remove());
}

function parseCssNumber(value) {
  const n = parseFloat(String(value || '').trim());
  return Number.isFinite(n) ? n : null;
}

function getElementFontPx(el, fallback = 15) {
  const inline = parseCssNumber(el.style.fontSize);
  if (inline) return inline;
  const parent = el.parentElement ? getElementFontPx(el.parentElement, fallback) : fallback;
  return parent || fallback;
}

function getLineHeightPx(fontPx, lineHeightValue) {
  const raw = String(lineHeightValue || '').trim();
  const numeric = parseCssNumber(raw);
  if (raw.endsWith('px') && numeric) return Math.round(numeric * 10) / 10;
  if (numeric) return Math.round(fontPx * numeric * 10) / 10;
  return Math.round(fontPx * STATE.lineHeight * 10) / 10;
}

function getMarginPx(fontPx, marginValue, fallbackEm) {
  const raw = String(marginValue || '').trim();
  const numeric = parseCssNumber(raw);
  if (raw.endsWith('px') && numeric !== null) return Math.round(numeric * 10) / 10;
  if (raw.endsWith('em') && numeric !== null) return Math.round(fontPx * numeric * 10) / 10;
  return Math.round(fontPx * fallbackEm * 10) / 10;
}

function normalizeWechatSpacingParity(container) {
  container.querySelectorAll('p,li,blockquote').forEach(el => {
    // design 组件内部的 p 有专属 line-height / margin，不能被全局段落节奏覆盖
    if (el.closest('[data-theme-component]')) return;
    const fontPx = getElementFontPx(el, 15);
    const linePx = getLineHeightPx(fontPx, el.style.lineHeight || STATE.lineHeight);
    el.style.lineHeight = `${linePx}px`;
    if (el.tagName === 'P') {
      const mb = getMarginPx(fontPx, el.style.marginBottom, STATE.paraSpacing);
      el.style.marginTop = '0';
      el.style.marginBottom = `${mb}px`;
    }
    if (el.tagName === 'LI') {
      el.style.marginTop = el.style.marginTop || '0';
      el.style.marginBottom = el.style.marginBottom || `${Math.round(fontPx * 0.4 * 10) / 10}px`;
    }
  });

  container.querySelectorAll('[data-theme-component="tip-card"] [data-theme-role="body"], [data-theme-component="tip-card"] [data-theme-role="body"] *').forEach(el => {
    const fontPx = getElementFontPx(el, 15);
    el.style.lineHeight = `${getLineHeightPx(fontPx, el.style.lineHeight || 1.8)}px`;
  });
}

// ===================================================================
// EXPORT HTML
// ===================================================================
// 把编辑器内容转回 Markdown 文本（保留主要结构：标题/列表/引用/强调/代码/链接/分割线/图片）
function htmlToMarkdown(rootEl) {
  const lines = [];
  function walkBlock(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      lines.push(node.textContent);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName;
    const inline = (el) => Array.from(el.childNodes).map(c => inlineToMd(c)).join('');
    if (tag === 'H1') { lines.push('# ' + inline(node), ''); return; }
    if (tag === 'H2') { lines.push('## ' + inline(node), ''); return; }
    if (tag === 'H3') { lines.push('### ' + inline(node), ''); return; }
    if (tag === 'H4') { lines.push('#### ' + inline(node), ''); return; }
    if (tag === 'BLOCKQUOTE') {
      const inner = inline(node).trim().split('\n').map(l => '> ' + l).join('\n');
      lines.push(inner, '');
      return;
    }
    if (tag === 'UL' || tag === 'OL') {
      Array.from(node.children).forEach((li, i) => {
        if (li.tagName !== 'LI') return;
        const prefix = tag === 'OL' ? `${i + 1}. ` : '- ';
        lines.push(prefix + inline(li));
      });
      lines.push('');
      return;
    }
    if (tag === 'PRE') {
      const code = node.textContent.replace(/\n+$/, '');
      lines.push('```', code, '```', '');
      return;
    }
    if (tag === 'HR') { lines.push('---', ''); return; }
    if (tag === 'P' || tag === 'DIV' || tag === 'SECTION') {
      // 判断是不是被装饰过的 hr 占位（包含一根线 + 装饰，不含真实文本）
      const txt = node.textContent.trim();
      if (!txt && node.querySelector('img') === null) {
        lines.push(''); return;
      }
      // 单纯的 div/section 包文本：当段落处理
      lines.push(inline(node), '');
      return;
    }
    if (tag === 'IMG') {
      const alt = node.getAttribute('alt') || 'image';
      const src = node.getAttribute('src') || '';
      const mark = src.startsWith('data:') ? '[image]' : `![${alt}](${src})`;
      lines.push(mark, '');
      return;
    }
    if (tag === 'BR') { lines.push(''); return; }
    // 兜底：递归子节点
    Array.from(node.childNodes).forEach(walkBlock);
  }
  function inlineToMd(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName;
    const inner = Array.from(node.childNodes).map(inlineToMd).join('');
    if (tag === 'STRONG' || tag === 'B') return `**${inner}**`;
    if (tag === 'EM' || tag === 'I') return `*${inner}*`;
    if (tag === 'CODE') return '`' + inner + '`';
    if (tag === 'A') {
      const href = node.getAttribute('href') || '';
      return `[${inner}](${href})`;
    }
    if (tag === 'IMG') {
      const alt = node.getAttribute('alt') || 'image';
      const src = node.getAttribute('src') || '';
      return src.startsWith('data:') ? '[image]' : `![${alt}](${src})`;
    }
    if (tag === 'BR') return '\n';
    if (tag === 'S' || tag === 'DEL') return `~~${inner}~~`;
    return inner;
  }
  Array.from(rootEl.childNodes).forEach(walkBlock);
  // 折叠多余空行
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
function exportMarkdown() {
  const md = htmlToMarkdown(editor);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  // 用文章首个 h1/h2 / 第一行做文件名
  const firstHeading = (editor.querySelector('h1,h2,h3')?.textContent || '公众号草稿').trim().slice(0, 40);
  a.download = firstHeading.replace(/[\\/:*?"<>|]/g, '_') + '.md';
  a.click();
  URL.revokeObjectURL(a.href);
}
function exportHTML() {
  const clone = preview.cloneNode(true);
  inlineAllStyles(clone);
  prepareWechatCompatibility(clone);
  normalizeWechatSpacingParity(clone);
  clone.innerHTML = sanitizeContentHTML(clone.innerHTML);
  restoreWechatCodeBlockNoWrap(clone);
  const bodyLine = getLineHeightPx(15, STATE.lineHeight);
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>公众号文章</title></head>
<body style="max-width:650px;margin:40px auto;padding:0 20px;font-family:${BODY_FONTS[STATE.bodyFont].stack};font-size:15px;line-height:${bodyLine}px;color:${WECHAT_MODE_SAFE.text};background:#FFFFFF">
${clone.innerHTML}
</body></html>`;
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '公众号文章.html';
  a.click();
  URL.revokeObjectURL(a.href);
}

// ===================================================================
// STYLE SAVE / LOAD
// ===================================================================
function sanitizeState(raw) {
  const src = (raw && typeof raw === 'object') ? raw : {};
  const colorIdx = clampNumber(src.colorScheme, 0, COLOR_SCHEMES.length - 1, STATE.colorScheme);
  const baseColors = COLOR_SCHEMES[colorIdx] || COLOR_SCHEMES[0];
  let customColors = null;
  if (src.customColors && typeof src.customColors === 'object') {
    customColors = {
      name: '自定义',
      main: sanitizeColorValue(src.customColors.main, baseColors.main),
      sub: sanitizeColorValue(src.customColors.sub, baseColors.sub),
      accent: sanitizeColorValue(src.customColors.accent, baseColors.accent),
      text: sanitizeColorValue(src.customColors.text, baseColors.text),
      bg: sanitizeColorValue(src.customColors.bg, baseColors.bg)
    };
    customColors.gradient = `linear-gradient(135deg, ${customColors.main}, ${customColors.accent})`;
  }
  const mode = MODES.some(m => m.id === src.mode) ? src.mode : STATE.mode;
  const bg = BG_TEXTURES.some(b => b.id === src.bg) ? src.bg : 'plain';
  return {
    mode,
    titleFont: Math.round(clampNumber(src.titleFont, 0, TITLE_FONTS.length - 1, STATE.titleFont)),
    bodyFont: Math.round(clampNumber(src.bodyFont, 0, BODY_FONTS.length - 1, STATE.bodyFont)),
    colorScheme: Math.round(colorIdx),
    customColors,
    lineHeight: clampNumber(src.lineHeight, 1.2, 3.0, 1.75),
    paraSpacing: clampNumber(src.paraSpacing, 0.2, 3.0, 1.0),
    isMobile: Boolean(src.isMobile),
    bg
  };
}
function sanitizeSavedStyle(item) {
  if (!item || typeof item !== 'object') return null;
  const name = String(item.name || '').trim().slice(0, 40);
  if (!name) return null;
  const time = Number.isFinite(Number(item.time)) ? Number(item.time) : Date.now();
  return { name, state: sanitizeState(item.state), time };
}
function getSavedStyles() {
  try {
    const raw = JSON.parse(localStorage.getItem('wx_formatter_styles') || '[]');
    return Array.isArray(raw) ? raw.map(sanitizeSavedStyle).filter(Boolean).slice(0, 20) : [];
  } catch { return []; }
}
function setSavedStyles(arr) {
  const safeArr = (Array.isArray(arr) ? arr : []).map(sanitizeSavedStyle).filter(Boolean).slice(0, 20);
  localStorage.setItem('wx_formatter_styles', JSON.stringify(safeArr));
}

function saveStylePrompt() {
  showModal(`
    <h3>保存为我的样式</h3>
    <p style="font-size:13px;color:#666;margin-bottom:12px">当前配置将保存到浏览器本地存储，最多20个。</p>
    <input type="text" id="styleNameInput" placeholder="输入样式名称" autofocus>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="hideModal()">取消</button>
      <button class="btn-primary" onclick="doSaveStyle()">保存</button>
    </div>
  `);
  setTimeout(() => $('styleNameInput')?.focus(), 100);
}

function doSaveStyle() {
  const name = $('styleNameInput')?.value.trim();
  if (!name) { alert('请输入名称'); return; }
  const styles = getSavedStyles();
  if (styles.length >= 20) { alert('最多保存20个样式，请删除一些再试'); return; }
  styles.push({
    name,
    state: sanitizeState(STATE),
    time: Date.now()
  });
  setSavedStyles(styles);
  hideModal();
}

function toggleStylesDropdown() {
  const dd = $('stylesDropdown');
  if (dd.classList.contains('show')) { dd.classList.remove('show'); return; }
  const styles = getSavedStyles();
  if (!styles.length) {
    dd.innerHTML = '<div class="sd-empty">暂无保存的样式<br>点底部「保存为我的样式」添加</div>';
  } else {
    let html = '';
    styles.forEach((s, i) => {
      const cs = COLOR_SCHEMES[s.state.colorScheme] || COLOR_SCHEMES[0];
      const meta = MODE_META[s.state.mode] || { emoji:'🎨', color:'#999' };
      const modeName = (MODES.find(m => m.id === s.state.mode) || {}).name || s.state.mode;
      html += `<div class="sd-card" style="animation-delay:${i * 45}ms">
        <div class="sd-card-colors">
          <span style="background:${escapeAttr(cs.main)}"></span>
          <span style="background:${escapeAttr(cs.sub)}"></span>
          <span style="background:${escapeAttr(cs.accent)}"></span>
        </div>
        <div class="sd-card-body" onclick="applyStyle(${i})">
          <div class="sd-card-name">${escapeHtml(s.name)}</div>
          <div class="sd-card-meta"><span class="sd-card-mode-tag" style="background:${escapeAttr(meta.color)}">${meta.emoji} ${modeName}</span></div>
        </div>
        <div class="sd-card-actions">
          <button onclick="editStyle(${i});event.stopPropagation()" title="编辑">✏️</button>
          <button onclick="deleteStyle(${i});event.stopPropagation()" title="删除">🗑️</button>
        </div>
      </div>`;
    });
    dd.innerHTML = html;
    requestAnimationFrame(() => {
      dd.querySelectorAll('.sd-card').forEach(el => el.classList.add('pop-in'));
    });
  }
  dd.classList.add('show');
  if (toggleStylesDropdown._handler) document.removeEventListener('click', toggleStylesDropdown._handler);
  setTimeout(() => {
    const handler = e => {
      if (!dd.contains(e.target) && e.target.id !== 'btnMyStyles') {
        dd.classList.remove('show');
        document.removeEventListener('click', handler);
        toggleStylesDropdown._handler = null;
      }
    };
    toggleStylesDropdown._handler = handler;
    document.addEventListener('click', handler);
  }, 10);
}

function applyStyle(i) {
  const styles = getSavedStyles();
  if (!styles[i]) return;
  Object.assign(STATE, sanitizeState(styles[i].state));
  updatePreview();
  $('stylesDropdown').classList.remove('show');
}

function editStyle(i) {
  const styles = getSavedStyles();
  const s = styles[i];
  const modeCards = MODES.map(m => {
    const meta = MODE_META[m.id] || { emoji:'🎨', color:'#999' };
    const active = s.state.mode === m.id;
    return `<div class="edit-mode-chip${active?' active':''}"
      style="border-color:${active?meta.color:'var(--dora-light)'};background:${active?meta.color+'18':'#fff'}"
      onclick="selectEditMode(this,'${m.id}','${meta.color}')">
      <span>${meta.emoji}</span>
      <span style="font-size:11px;font-weight:600;color:${meta.color}">${m.name}</span>
    </div>`;
  }).join('');
  const colorChips = COLOR_SCHEMES.map((cs, idx) => {
    const active = s.state.colorScheme === idx;
    return `<div class="color-chip${active?' active':''}" title="${escapeAttr(cs.name)}"
      onclick="selectEditColor(this,${idx})" style="border-color:${active?escapeAttr(cs.main):'transparent'}">
      <span style="background:${escapeAttr(cs.main)}"></span>
      <span style="background:${escapeAttr(cs.accent)}"></span>
      <span style="background:${escapeAttr(cs.sub)}"></span>
    </div>`;
  }).join('');
  showModal(`
    <h3>编辑样式</h3>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div>
        <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">名称</label>
        <input type="text" id="editStyleName" value="${escapeHtml(s.name)}" maxlength="40">
      </div>
      <div>
        <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">排版模式</label>
        <div id="editModeGroup" data-val="${escapeAttr(s.state.mode)}" style="display:flex;flex-wrap:wrap;gap:6px">${modeCards}</div>
      </div>
      <div>
        <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">配色</label>
        <div id="editColorGroup" data-val="${s.state.colorScheme}" style="display:flex;flex-wrap:wrap;gap:6px">${colorChips}</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="hideModal()">取消</button>
      <button class="btn-primary" onclick="doEditStyle(${i})">保存</button>
    </div>
  `);
}
function selectEditMode(el, modeId, color) {
  const group = $('editModeGroup');
  group.dataset.val = modeId;
  group.querySelectorAll('.edit-mode-chip').forEach(c => {
    c.classList.remove('active');
    c.style.borderColor = 'var(--dora-light)';
    c.style.background = '#fff';
  });
  el.classList.add('active');
  el.style.borderColor = color;
  el.style.background = color + '18';
}
function selectEditColor(el, idx) {
  const group = $('editColorGroup');
  group.dataset.val = idx;
  const cs = COLOR_SCHEMES[idx];
  group.querySelectorAll('.color-chip').forEach(c => {
    c.classList.remove('active');
    c.style.borderColor = 'transparent';
  });
  el.classList.add('active');
  el.style.borderColor = cs.main;
}
function doEditStyle(i) {
  const name = $('editStyleName').value.trim().slice(0, 40);
  if (!name) return;
  const styles = getSavedStyles();
  styles[i].name = name;
  styles[i].state.mode = $('editModeGroup').dataset.val;
  styles[i].state.colorScheme = parseInt($('editColorGroup').dataset.val);
  setSavedStyles(styles);
  hideModal();
  toggleStylesDropdown();
  toggleStylesDropdown();
}

function deleteStyle(i) {
  if (!confirm('确定删除此样式？')) return;
  const styles = getSavedStyles();
  styles.splice(i, 1);
  setSavedStyles(styles);
  toggleStylesDropdown();
  toggleStylesDropdown();
}

function exportStyleJSON() {
  const data = {
    version: 1,
    styles: getSavedStyles(),
    current: sanitizeState(STATE)
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '排版样式.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importStyleJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data.styles)) {
          const existing = getSavedStyles();
          const incoming = data.styles.map(sanitizeSavedStyle).filter(Boolean);
          const merged = [...existing, ...incoming].slice(0, 20);
          setSavedStyles(merged);
          alert(`成功导入 ${incoming.length} 个样式`);
        }
        if (data.current) {
          Object.assign(STATE, sanitizeState(data.current));
          updatePreview();
        }
      } catch {
        alert('JSON格式错误');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function importMarkdown() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.markdown,.txt';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed = parseMD(ev.target.result || '');
      editor.innerHTML = sanitizeContentHTML(parsed);
      scheduleUpdate();
    };
    reader.readAsText(file, 'UTF-8');
  };
  input.click();
}

// ===================================================================
// MODAL
// ===================================================================
function showModal(html) {
  $('modalContent').innerHTML = html;
  $('modalOverlay').classList.add('show');
}
function hideModal() {
  $('modalOverlay').classList.remove('show');
}
$('modalOverlay').addEventListener('click', e => {
  if (e.target === $('modalOverlay')) hideModal();
});

// ===================================================================
// HELP
// ===================================================================
function showHelp() {
  showModal(`
    <h3>意疏的 AI 口袋</h3>
    <div class="help-tabs">
      <button class="help-tab active" onclick="switchHelpTab('docs', this)">📝 使用说明</button>
      <button class="help-tab" onclick="switchHelpTab('contact', this)">👋 联系作者</button>
    </div>
    <div id="helpTabDocs" class="help-content">
      <h4>📝 写作</h4>
      <ul>
        <li>左侧编辑、右侧实时预览，<strong>支持 Markdown 直接粘贴</strong>自动解析</li>
        <li><strong>✨ 预处理</strong>（工具栏左二）：5 种文章类型一键梳理结构 —— 保守整理、长文分层、教程步骤、种草清单、口播转图文</li>
        <li><strong>🎛 设计</strong>（工具栏中部）：插入大型设计组件（开篇引导、章节卡、结尾签名等）</li>
        <li>底部状态栏显示<strong>字数 + 预估阅读时长 + 黄金长度提示</strong>（🟢 1200-2000 / 🟡 略长 / 🔴 太长）</li>
      </ul>
      <h4>🎨 排版样式</h4>
      <ul>
        <li><strong>排版模式</strong>：${MODES.length} 种预设风格一键切换</li>
        <li><strong>配色</strong>：${COLOR_SCHEMES.length} 种预设 + 自定义颜色</li>
        <li><strong>字体</strong>：标题和正文字体可独立设置</li>
        <li><strong>行距 / 段距</strong>：5 档预设 + 自定义数值</li>
        <li><strong>背景纹理</strong>：纯色 / 米色 / 格纹等，公众号兼容</li>
      </ul>
      <h4>🖼️ 图片 & 装饰</h4>
      <ul>
        <li><strong>插入图片</strong>（👜哆啦A梦的口袋→📷 插入图片）：本地上传或 URL，支持双图并排</li>
        <li><strong>自动压缩</strong>：超 1200px 自动缩放转 JPEG，单张不超过 200KB（GIF 不压）</li>
        <li><strong>分割线 + 段间空</strong>（👜哆啦A梦的口袋→─ 分割线）：3 种横线 + 3 档可控空隙（小/中/大 12/24/48px）</li>
        <li><strong>提示卡片</strong>（👜哆啦A梦的口袋→📋 提示卡片）：插入带强调色的提示块</li>
        <li><strong>结尾卡片</strong>（顶部工具栏 📝结尾）：4 种风格，自动跟随主题色</li>
        <li>点击图片选中，按 <kbd>Delete</kbd> 删除（双图并排会连同表格一起删）</li>
      </ul>
      <h4>📋 复制 & 导出</h4>
      <ul>
        <li><strong>一键复制到公众号</strong>：所有样式自动转内联样式，公众号后台直接 <kbd>Ctrl</kbd>+<kbd>V</kbd></li>
        <li><strong>💬 微信预览</strong>（预览栏右上）：提前看到「粘到公众号会变什么样」，flex 转 inline-block 等兼容处理实时显示</li>
        <li><strong>导出 HTML</strong> / <strong>导出 MD</strong>：备份原稿，给 AI 改稿，跨工具迁移</li>
        <li><strong>复制为 HTML</strong>：直接拿到一段排版好的 HTML 代码</li>
      </ul>
      <h4>💾 自动保存 & 撤销</h4>
      <ul>
        <li>每 5 秒自动存到本地浏览器，关页面前还会再存一次</li>
        <li>刷新或重开页面，<strong>7 天内的草稿会问是否恢复</strong></li>
        <li><kbd>Ctrl</kbd>+<kbd>Z</kbd> 撤销 / <kbd>Ctrl</kbd>+<kbd>Y</kbd>（或 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>）重做，60 步历史栈</li>
      </ul>
      <h4>💎 样式管理</h4>
      <ul>
        <li>保存当前配置为「我的样式」，下次一键复用，最多 20 个</li>
        <li>支持导出 / 导入 JSON 文件，跨设备分享</li>
      </ul>
      <h4>✍️ Markdown 语法</h4>
      <ul>
        <li><kbd>#</kbd> <kbd>##</kbd> <kbd>###</kbd> 标题</li>
        <li><kbd>**文字**</kbd> 加粗 / <kbd>*文字*</kbd> 斜体</li>
        <li><kbd>> 文字</kbd> 引用</li>
        <li><kbd>- 文字</kbd> 无序列表 / <kbd>1. 文字</kbd> 有序列表</li>
        <li><kbd>\`\`\`代码\`\`\`</kbd> 代码块</li>
        <li><kbd>---</kbd> 分割线</li>
      </ul>
      <h4>🔔 小彩蛋</h4>
      <ul>
        <li>左上角的哆啦A梦戳一下试试，连点更有惊喜</li>
      </ul>
    </div>
    <div id="helpTabContact" class="help-contact" style="display:none">
      <div class="help-contact-card">
        <div class="help-contact-title">👋 我是意疏</div>
        <div class="help-contact-sub">这个排版器是我做的，欢迎一起聊聊</div>
        <img src="assets/qrcode.jpg" alt="意疏的微信二维码" loading="lazy">
        <div class="help-contact-tagline">扫码加我微信</div>
        <div class="help-contact-hint">做产品、做内容、聊 AI，都可以</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="hideModal()">知道了</button>
    </div>
  `);
}
function switchHelpTab(which, btn) {
  $('helpTabDocs').style.display = which === 'docs' ? '' : 'none';
  $('helpTabContact').style.display = which === 'contact' ? '' : 'none';
  btn.parentNode.querySelectorAll('.help-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function toggleDropdown(id) {
  const menu = $(id);
  const wasOpen = menu && menu.classList.contains('open');
  closeDropdowns();
  if (!wasOpen && menu) menu.classList.add('open');
}
function closeDropdowns() {
  document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
}
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown-wrap')) closeDropdowns();
});

// ===================================================================
// BRAND PROMOTION TOAST (after WeChat copy success)
// ===================================================================
let promoteTimer = null;
function showPromote() {
  const toast = $('promoteToast');
  if (!toast) return;
  toast.classList.add('show');
  if (promoteTimer) clearTimeout(promoteTimer);
  promoteTimer = setTimeout(closePromote, 6000);
}
function closePromote() {
  const toast = $('promoteToast');
  if (!toast) return;
  toast.classList.remove('show');
  if (promoteTimer) { clearTimeout(promoteTimer); promoteTimer = null; }
}

// ===================================================================
// FIRST-RUN ONBOARDING (4 steps, gated by localStorage)
// ===================================================================
const OB_DONE_KEY = 'gzh-ob-done';
let obCurrentStep = 1;
function obShow(step) {
  obCurrentStep = step;
  const overlay = $('onboardingOverlay');
  if (!overlay) return;
  overlay.classList.add('show');
  overlay.querySelectorAll('.ob-step').forEach(el => {
    const n = parseInt(el.getAttribute('data-ob-step') || '0', 10);
    el.style.display = (n === step) ? '' : 'none';
  });
}
function obNext() {
  if (obCurrentStep < 4) obShow(obCurrentStep + 1);
  else obFinish();
}
function obSkip() { obFinish(); }
function obFinish() {
  const overlay = $('onboardingOverlay');
  if (overlay) overlay.classList.remove('show');
  try { localStorage.setItem(OB_DONE_KEY, '1'); } catch {}
}
window.addEventListener('DOMContentLoaded', () => {
  try {
    if (!localStorage.getItem(OB_DONE_KEY)) {
      setTimeout(() => obShow(1), 500);
    }
  } catch {}
});
