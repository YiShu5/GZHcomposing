// === 编辑器组件：图片插入 / 高亮 / 编号标题 / 提示卡片 / 设计布局 / 结尾样式 / 分割线 ===

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
  editor.focus({ preventScroll: true });
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
  // Toggle badge-only size row visibility: show only when opening from a badge click
  const badgeRow = $('imgBadgeSizeRow');
  if (badgeRow) badgeRow.style.display = (!willClose && targetBadgeForImage) ? 'flex' : 'none';
  // If user is closing the panel without inserting, drop the badge target
  // so the next normal image insert doesn't accidentally land in an old badge.
  if (willClose) targetBadgeForImage = null;
  $('hrPanel')?.classList.remove('show');
  $('alignPanel')?.classList.remove('show');
}
function setBadgePreset(w, h, btn) {
  const wInput = $('imgBadgeW');
  const hInput = $('imgBadgeH');
  if (wInput) wInput.value = w;
  if (hInput) hInput.value = h;
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.badge-preset').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
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
  editor.focus({ preventScroll: true });
  scheduleUpdate();
}
function insertDivider(style) {
  restoreEditorRange(savedEditorRange);
  savedEditorRange = null;
  insertSafeHTML(`<hr data-hr-style="${escapeAttr(style)}">`);
  $('hrPanel')?.classList.remove('show');
  editor.focus({ preventScroll: true });
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
    // 给 badge 明确的 W×H，否则 td 是 white-space:nowrap + section 无显式宽度
    // + img width:100% 形成环形依赖 → 浏览器把列宽算成 0，整个 badge 视觉消失
    // 同时设 min-width / min-height —— 微信兼容管道会把 width:Npx 转 max-width:Npx
    // 而 max-width + min-width 同值 = 强制锁死尺寸，badge 在两种模式下都稳
    const imgSrc = srcList[0];
    const badgeW = clampNumber($('imgBadgeW')?.value, 40, 320, 120);
    const badgeH = clampNumber($('imgBadgeH')?.value, 40, 320, 120);
    const radius = clampNumber($('imgRadius')?.value, 0, 50, 14);
    badge.innerHTML = `<img src="${escapeAttr(imgSrc)}" alt="image" style="display:block;width:${badgeW}px;min-width:${badgeW}px;height:${badgeH}px;min-height:${badgeH}px;border-radius:${radius}px;object-fit:cover;">`;
    badge.setAttribute('data-badge-has-image', '1');
    badge.style.padding = '0';
    badge.style.width = badgeW + 'px';
    badge.style.minWidth = badgeW + 'px';
    badge.style.height = badgeH + 'px';
    badge.style.minHeight = badgeH + 'px';
    badge.style.border = '';
    badge.style.background = '';
    badge.style.backgroundImage = '';
    badge.style.backgroundSize = '';
    badge.style.backgroundPosition = '';
    badge.title = '点击更换图片';
    badge.style.cursor = 'pointer';
    // Hide badge size row after insert
    const _badgeRow = $('imgBadgeSizeRow');
    if (_badgeRow) _badgeRow.style.display = 'none';
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
  editor.focus({ preventScroll: true });
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
    editor.focus({ preventScroll: true });
    scheduleUpdate();
    updateToolbarStates();
    return;
  }
  const c = getColors();
  const color = c.main || '#133363';
  const selectedHTML = getRangeHTML(range);
  document.execCommand('insertHTML', false, `<span data-editor-highlight="true" style="color:${color};font-weight:700">${selectedHTML}</span>`);
  editor.focus({ preventScroll: true });
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
  editor.focus({ preventScroll: true });
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
  editor.focus({ preventScroll: true });
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
  editor.focus({ preventScroll: true });
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
          <section data-theme-role="badge" style="border-radius:16px;background:linear-gradient(135deg,${alphaColor(main,0.16,sub)},${alphaColor(accent,0.12,'#fff')});border:2px dashed #F5C518;text-align:center;padding:24px 14px;cursor:pointer;box-sizing:border-box;" title="点击这里插入图片">
            <span style="display:block;font-size:30px;line-height:1;margin-bottom:6px;">📸</span>
            <span data-badge-text="true" style="display:block;font-size:13px;font-weight:800;color:${main};line-height:1.3;">点这里插图</span>
            <span style="display:block;font-size:10px;color:#016FAD;opacity:0.6;font-weight:700;letter-spacing:1px;margin-top:3px;">🔔 哆啦提示</span>
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
  editor.focus({ preventScroll: true });
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
// 辅助：判断是否块级内容元素（normalizeTipCardBodyHTML 等共用）
// ===================================================================
function isBlockContentElement(node) {
  return node?.nodeType === Node.ELEMENT_NODE && /^(P|H1|H2|H3|BLOCKQUOTE|UL|OL|LI|PRE|DIV|SECTION|TABLE|HR)$/i.test(node.tagName);
}
