// === 预览更新 / 样式应用 / 字数统计 / 标题/引用/分割线/背景 ===

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
function isAiPocketMode(mode) {
  return mode && isAiPocketModeId(mode.id);
}

function isAiPocketQuestionList(list) {
  if (!list || !['UL', 'OL'].includes(list.tagName)) return false;
  const items = Array.from(list.children).filter(child =>
    child.tagName === 'LI' && child.getAttribute('data-ai-pocket-question-label') !== '1'
  );
  return items.length > 0 && items.every(li => /[?？]\s*$/.test((li.textContent || '').trim()));
}

function isAiPocketNumberedCardList(list) {
  return !!list && (list.tagName === 'OL' || isAiPocketQuestionList(list));
}

function ensureAiPocketNumberedListLabel(list, c) {
  if (!list || !isAiPocketNumberedCardList(list)) return;
  const existing = list.querySelector(':scope > [data-ai-pocket-question-label="1"]');
  if (existing) return;
  const label = document.createElement('li');
  label.setAttribute('data-ai-pocket-question-label', '1');
  label.textContent = isAiPocketQuestionList(list) ? 'QUESTION LIST' : 'STEP LIST';
  label.style.cssText = [
    'display:block',
    'list-style:none',
    'margin:0 0 20px',
    'padding:0',
    'font-size:12px',
    'font-weight:900',
    'letter-spacing:3px',
    `color:${c.muted || '#9CA3AF'}`,
    'line-height:1.2'
  ].join(';');
  list.insertBefore(label, list.firstChild);
}

function getAiPocketMonthLabel() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}.${month}`;
}

function getAiPocketNavCaption(index) {
  return ['AI ENTRY', 'INSTALL', 'WECHAT ASK', 'SAFETY'][index] || `PART ${String(index + 1).padStart(2, '0')}`;
}

function ensureAiPocketPartsNav(root, c) {
  if (!root || root.querySelector('[data-theme-component="ai-pocket-parts-nav"]')) return;
  const hero = root.querySelector('h1[data-theme-component="ai-pocket-heading"]');
  if (!hero) return;
  const h2s = Array.from(root.querySelectorAll('h2[data-theme-component="ai-pocket-heading"]')).slice(0, 4);
  if (!h2s.length) return;

  const nav = document.createElement('section');
  nav.setAttribute('data-theme-component', 'ai-pocket-parts-nav');
  nav.style.cssText = 'display:block;margin:0 0 38px;padding:0;box-sizing:border-box;color:#374151;background:#FFFFFF;overflow:hidden;';

  const labelTable = document.createElement('table');
  labelTable.style.cssText = 'width:100%;border-collapse:collapse;border-spacing:0;border:0;margin:0 0 14px;';
  labelTable.innerHTML = `<tbody><tr><td style="border:0;padding:0;vertical-align:middle;text-align:left;"><span style="display:inline-block;font-size:13px;font-weight:900;letter-spacing:3px;color:${c.muted || '#9CA3AF'};">📦 4 PARTS</span></td><td style="border:0;padding:0;vertical-align:middle;text-align:right;"><span style="display:inline-block;font-size:12px;font-weight:800;color:${c.muted || '#9CA3AF'};">👉 滑动</span></td></tr></tbody>`;
  nav.appendChild(labelTable);

  const scroller = document.createElement('section');
  scroller.style.cssText = 'display:block;overflow-x:scroll;-webkit-overflow-scrolling:touch;white-space:nowrap;padding:0 0 8px;margin:0;box-sizing:border-box;';

  h2s.forEach((h2, idx) => {
    const title = (h2.dataset.aiPocketTitle || h2.textContent || '').trim().replace(/\s+/g, ' ');
    const num = String(idx + 1).padStart(2, '0');
    const active = idx === 0;
    const card = document.createElement('section');
    card.style.cssText = [
      'display:inline-block',
      'vertical-align:top',
      'min-width:132px',
      'max-width:132px',
      'height:124px',
      'box-sizing:border-box',
      'white-space:normal',
      'margin:0 12px 0 0',
      'padding:17px 16px',
      'border-radius:16px',
      `background:${active ? c.main : '#FFFFFF'}`,
      `border:${active ? '1px solid ' + c.main : '1.5px solid ' + (c.line || '#E5E7EB')}`,
      `box-shadow:${active ? '0 10px 22px rgba(5,150,105,0.18)' : '0 4px 14px rgba(17,24,39,0.045)'}`,
      'overflow:hidden'
    ].join(';');
    card.innerHTML = `<p style="margin:0 0 16px;font-size:12px;font-weight:900;letter-spacing:1.8px;color:${active ? 'rgba(255,255,255,0.78)' : (c.muted || '#9CA3AF')};line-height:1;">PART ${num}</p><p style="margin:0;font-size:16px;font-weight:900;line-height:1.35;letter-spacing:0;color:${active ? '#FFFFFF' : '#111827'};">${escapeHtml(title || `第 ${idx + 1} 部分`)}</p><p style="margin:10px 0 0;font-size:11px;font-weight:800;letter-spacing:1px;color:${active ? 'rgba(255,255,255,0.74)' : (c.muted || '#9CA3AF')};line-height:1.35;">${getAiPocketNavCaption(idx)}</p>`;
    scroller.appendChild(card);
  });

  nav.appendChild(scroller);
  hero.insertAdjacentElement('afterend', nav);
}

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
  const aiPocket = isAiPocketMode(mode);
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
  if (aiPocket) {
    preview.style.fontSize = '14px';
    preview.style.letterSpacing = '0.5px';
    preview.style.background = '#FFFFFF';
    preview.style.backgroundColor = '#FFFFFF';
    preview.style.colorScheme = 'light';
  }

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
    if (mode.id === 'brand-manual') {
      // 金色强调色在浅底上做正文导语会糊，导语改用正文色，克制收敛
      openingP.style.color = c.text;
      openingP.style.opacity = '0.92';
    }
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
    if (aiPocket) {
      openingP.style.background = 'transparent';
      openingP.style.border = 'none';
      openingP.style.boxShadow = 'none';
      openingP.style.borderRadius = '0';
      openingP.style.color = c.text;
      openingP.style.fontSize = '14px';
      openingP.style.lineHeight = '1.85';
      openingP.style.padding = '0';
      openingP.style.opacity = '1';
    }
  }

  // Closing section style (last p or p after last hr)
  const allElements = Array.from(preview.children);
  const lastHrIdx = allElements.map((el,i) => (el.tagName === 'HR' || (el.tagName === 'DIV' && el.textContent.trim().length < 10)) ? i : -1).filter(i => i > -1).pop();
  if (!aiPocket && lastHrIdx !== undefined && lastHrIdx >= 0) {
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
  if (aiPocket) ensureAiPocketPartsNav(preview, c);

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
    pre.style.background = aiPocket ? '#FFFFFF' : '#252A33';
    pre.style.borderRadius = aiPocket ? '10px' : '8px';
    pre.style.padding = aiPocket ? '0' : '18px 20px 10px';
    pre.style.overflowX = aiPocket ? 'hidden' : 'auto';
    pre.style.overflowY = 'hidden';
    pre.style.overflow = aiPocket ? 'hidden' : 'auto';
    pre.style.whiteSpace = aiPocket ? 'normal' : 'pre';
    pre.style.wordWrap = aiPocket ? 'break-word' : 'normal';
    pre.style.overflowWrap = aiPocket ? 'break-word' : 'normal';
    pre.style.fontSize = '13px';
    pre.style.lineHeight = '1.8';
    pre.style.margin = '1.4em auto';
    pre.style.fontFamily = aiPocket ? '"SF Mono","Consolas","Menlo","PingFang SC","Microsoft YaHei",monospace' : '"SF Mono","Consolas","Menlo",monospace';
    pre.style.color = aiPocket ? '#1F2937' : '#D7E7FF';
    pre.style.border = aiPocket ? '1.5px solid #E5E7EB' : 'none';
    pre.style.boxShadow = aiPocket ? 'none' : '0 10px 24px rgba(15,23,42,0.26)';
    pre.querySelectorAll('code').forEach(code => {
      code.style.display = 'block';
      code.style.minWidth = aiPocket ? '0' : 'max-content';
      code.style.width = aiPocket ? 'auto' : 'max-content';
      code.style.maxWidth = aiPocket ? '100%' : 'none';
      code.style.background = 'transparent';
      code.style.padding = aiPocket ? '14px' : '0';
      code.style.margin = '0';
      code.style.border = 'none';
      code.style.whiteSpace = aiPocket ? 'pre-wrap' : 'pre';
      code.style.wordWrap = aiPocket ? 'break-word' : 'normal';
      code.style.overflowWrap = aiPocket ? 'break-word' : 'normal';
      code.style.fontSize = '13px';
      code.style.lineHeight = '1.8';
      code.style.fontFamily = aiPocket ? '"SF Mono","Consolas","Menlo","PingFang SC","Microsoft YaHei",monospace' : '"SF Mono","Consolas","Menlo",monospace';
      code.style.color = aiPocket ? '#1F2937' : '#D7E7FF';
      code.style.fontWeight = aiPocket ? '600' : '400';
      code.style.letterSpacing = aiPocket ? '0.5px' : '0';
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
    if (aiPocket) {
      const numberedCard = isAiPocketNumberedCardList(list);
      ensureAiPocketNumberedListLabel(list, c);
      list.style.listStyle = 'none';
      list.style.paddingLeft = '0';
      list.style.margin = '1.2em 0';
      list.style.border = `1px solid ${c.line || '#E5E7EB'}`;
      list.style.borderRadius = numberedCard ? '14px' : '12px';
      list.style.background = '#FFFFFF';
      list.style.padding = numberedCard ? '24px 22px 14px' : '14px 16px 6px';
      list.style.boxSizing = 'border-box';
      list.style.boxShadow = 'none';
    }
  });
  preview.querySelectorAll('li').forEach((li, liIdx) => {
    if (li.getAttribute('data-ai-pocket-question-label') === '1') return;
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
    if (aiPocket) {
      const numberedCard = isAiPocketNumberedCardList(li.parentElement);
      const itemIndex = Array.from(li.parentElement.children)
        .filter(child => child.tagName === 'LI' && child.getAttribute('data-ai-pocket-question-label') !== '1')
        .indexOf(li);
      li.style.position = 'static';
      li.style.marginBottom = numberedCard ? '18px' : '10px';
      li.style.padding = '0';
      li.style.border = 'none';
      li.style.borderRadius = '0';
      li.style.background = 'transparent';
      li.style.boxShadow = 'none';
      li.style.color = numberedCard ? '#374151' : c.text;
      li.style.fontSize = numberedCard ? '16px' : '14px';
      li.style.fontWeight = numberedCard ? '800' : '400';
      li.style.lineHeight = numberedCard ? '1.6' : '1.75';
      li.style.letterSpacing = '0.5px';
      if (!li.dataset.aiPocketMarkerAdded) {
        const marker = numberedCard ? String(itemIndex + 1).padStart(2, '0') : '';
        const markerHtml = numberedCard
          ? `<span style="display:inline-block;width:30px;min-width:30px;height:32px;line-height:32px;border-radius:16px;background:${c.sub};color:${c.main};font-size:14px;font-weight:900;text-align:center;margin-right:12px;vertical-align:middle;">${marker}</span>`
          : `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.main};margin:0 10px 2px 0;"></span>`;
        li.innerHTML = `${markerHtml}<span style="vertical-align:middle;">${li.innerHTML}</span>`;
        li.dataset.aiPocketMarkerAdded = '1';
      }
    }
  });

  // Strong / em colors (skip design components which manage their own colors)
  // 加粗用深色（品牌深蓝），金色 accent 在浅底上做正文强调会糊
  preview.querySelectorAll('strong').forEach(s => { if (s.closest('[data-theme-component]')) return; s.style.color = c.deep || c.accent; s.style.fontWeight = '700'; });
  preview.querySelectorAll('em').forEach(e => { if (e.closest('[data-theme-component]')) return; e.style.color = c.main; e.style.fontStyle = 'italic'; });
  preview.querySelectorAll('img').forEach(img => {
    if (img.closest('[data-theme-component="ai-pocket-heading"]')) return;
    // 跳过 design-intro 的 badge 缩略图：它有自己的固定宽高 + object-fit，
    // 被通用 img 样式（height:auto / margin:8px 0）覆盖会导致缩略图错位甚至消失
    if (img.closest('[data-theme-role="badge"]')) return;
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
    if (aiPocket) {
      img.style.width = img.style.width || '100%';
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.border = 'none';
      img.style.boxShadow = 'none';
      img.style.background = '#FFFFFF';
      img.style.margin = '0 auto';
      const parent = img.parentElement;
      if (parent && parent.tagName === 'P' && parent.textContent.trim() === '') {
        parent.style.margin = '0 0 24px';
        parent.style.padding = '6px';
        parent.style.border = `1px solid ${c.line || '#F3F4F6'}`;
        parent.style.borderRadius = '12px';
        parent.style.background = '#FFFFFF';
        parent.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
      }
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
    case 'left-bar-gold':
      // 品牌手册：标题左侧一条铃铛金竖线，无渐变无圆角，干净利落
      h.style.color = c.text;
      h.style.borderLeft = `3px solid ${c.accent}`;
      h.style.paddingLeft = '14px';
      h.style.textAlign = 'left';
      h.style.letterSpacing = '0.02em';
      h.style.fontWeight = tag === 'H3' ? '600' : '700';
      h.style.fontSize = tag === 'H1' ? '22px' : tag === 'H2' ? '20px' : '17px';
      break;
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
    case 'ai-pocket':
      h.setAttribute('data-theme-component', 'ai-pocket-heading');
      h.querySelectorAll('.heading-bar').forEach(bar => bar.remove());
      h.style.position = 'static';
      h.style.display = 'block';
      h.style.width = '100%';
      h.style.maxWidth = '100%';
      h.style.boxSizing = 'border-box';
      h.style.textAlign = 'left';
      h.style.letterSpacing = tag === 'H1' ? '-1.2px' : '0.02em';
      h.style.boxShadow = 'none';
      h.style.borderImage = 'none';
      if (tag === 'H1') {
        if (!h.dataset.aiPocketHeroAdded) {
          const titleText = h.textContent.trim();
          h.dataset.aiPocketTitle = titleText;
          let first = titleText;
          let second = '';
          const monthLabel = getAiPocketMonthLabel();
          if (titleText.includes('，')) {
            const parts = titleText.split('，');
            first = parts.shift() || titleText;
            second = parts.join('，');
          }
          h.innerHTML = `<table style="width:100%;border-collapse:collapse;border-spacing:0;border:0;margin:0;"><tbody><tr><td style="border:0;padding:28px 24px 0;vertical-align:middle;text-align:left;"><span data-theme-role="meta" style="display:inline-block;margin:0;font-size:11px;font-weight:900;letter-spacing:3px;color:${c.main};line-height:1;">栏目 · 意疏的AI口袋</span><span style="display:inline-block;width:40px;height:1px;background:${alphaColor(c.main, 0.16, '#D1FAE5')};vertical-align:middle;margin-left:12px;"></span></td><td style="border:0;padding:28px 24px 0 8px;vertical-align:middle;text-align:right;width:1%;white-space:nowrap;"><span style="display:inline-block;margin:0;font-size:12px;font-weight:900;letter-spacing:1px;color:#111827;line-height:1;">${monthLabel}</span></td></tr></tbody></table><table style="width:100%;border-collapse:collapse;border-spacing:0;border:0;margin:0;"><tbody><tr><td style="vertical-align:middle;padding:34px 18px 28px 24px;border:0;width:100%;"><span data-theme-role="title-main" style="display:block;color:#111827;font-size:30px;font-weight:900;line-height:1.08;letter-spacing:-1px;">${escapeHtml(first)}</span>${second ? `<span data-theme-role="title-accent" style="display:block;margin-top:4px;color:${c.main};font-size:30px;font-weight:900;line-height:1.08;letter-spacing:-1px;">${escapeHtml(second)}</span>` : ''}<span style="display:block;width:56px;height:5px;border-radius:99px;background:${c.main};margin-top:22px;"></span></td><td style="vertical-align:middle;text-align:right;padding:34px 24px 28px 0;border:0;width:1%;white-space:nowrap;"><img src="${AI_POCKET_AVATAR_SRC}" alt="意疏的AI口袋" width="56" height="56" style="display:inline-block;width:56px;min-width:56px;max-width:56px;height:56px;min-height:56px;max-height:56px;border-radius:50%;border:3px solid #ECFDF5;box-shadow:0 8px 18px rgba(5,150,105,0.16);box-sizing:border-box;background:#FFFFFF;vertical-align:middle;"></td></tr></tbody></table><table data-theme-role="bar" style="width:100%;border-collapse:collapse;border-spacing:0;border:0;margin:0;background:${c.main};"><tbody><tr><td style="border:0;padding:16px 24px;vertical-align:middle;text-align:left;"><span style="display:inline-block;font-size:15px;font-weight:900;color:#FFFFFF;line-height:1.2;letter-spacing:0;">意疏的AI口袋</span></td><td style="border:0;padding:16px 24px 16px 8px;vertical-align:middle;text-align:right;width:1%;white-space:nowrap;"><span style="display:inline-block;margin-left:6px;padding:5px 10px;border-radius:6px;background:rgba(255,255,255,0.18);font-size:11px;font-weight:900;color:#FFFFFF;line-height:1;letter-spacing:1px;">AI 入口</span><span style="display:inline-block;margin-left:6px;padding:5px 10px;border-radius:6px;background:rgba(255,255,255,0.18);font-size:11px;font-weight:900;color:#FFFFFF;line-height:1;letter-spacing:1px;">实测教程</span></td></tr></tbody></table>`;
          h.dataset.aiPocketHeroAdded = '1';
        }
        h.style.margin = '0 0 36px';
        h.style.padding = '0';
        h.style.border = `1.5px solid ${alphaColor(c.main, 0.15, 'rgba(5,150,105,0.15)')}`;
        h.style.borderRadius = '22px';
        h.style.background = '#FBFEFC';
        h.style.boxShadow = '0 14px 34px rgba(17,24,39,0.07)';
        h.style.overflow = 'hidden';
        h.style.fontSize = '28px';
      } else if (tag === 'H2') {
        if (!h.dataset.aiPocketSectionAdded) {
          const sectionTitle = (h.dataset.aiPocketTitle || h.textContent || '').trim();
          h.dataset.aiPocketTitle = sectionTitle;
          const h2s = Array.from(h.parentElement.querySelectorAll('h2'));
          const num = String(h2s.indexOf(h) + 1).padStart(2, '0');
          h.innerHTML = `<span data-theme-role="number" style="display:inline-block;vertical-align:middle;margin-right:12px;text-align:center;"><span style="display:block;margin:0;font-size:28px;font-weight:900;line-height:1;color:${c.main};">${num}</span><span style="display:block;margin:2px 0 0;font-size:10px;font-weight:800;letter-spacing:2px;color:${c.muted || '#9CA3AF'};">PART</span></span><span data-theme-role="divider" style="display:inline-block;vertical-align:middle;border-left:1px solid ${c.line || '#E5E7EB'};height:36px;line-height:36px;margin-right:12px;"></span><span data-theme-role="title" style="display:inline-block;vertical-align:middle;font-size:17px;font-weight:900;color:#111827;line-height:1.4;">${escapeHtml(sectionTitle)}</span>`;
          h.dataset.aiPocketSectionAdded = '1';
        }
        h.style.margin = '48px 0 32px';
        h.style.padding = '0';
        h.style.border = 'none';
        h.style.background = 'transparent';
        h.style.fontSize = '17px';
      } else {
        h.style.margin = '28px 0 14px';
        h.style.padding = '0 0 0 10px';
        h.style.border = 'none';
        h.style.borderLeft = `3px solid ${c.main}`;
        h.style.borderRadius = '0';
        h.style.background = 'transparent';
        h.style.color = '#111827';
        h.style.fontSize = '16px';
        h.style.fontWeight = '900';
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
    case 'ai-pocket-note':
      bq.style.border = 'none';
      bq.style.borderLeft = `3px solid ${c.main}`;
      bq.style.borderImage = 'none';
      bq.style.borderRadius = '10px';
      bq.style.background = c.sub || '#ECFDF5';
      bq.style.padding = '14px 16px';
      bq.style.color = c.deep || '#065F46';
      bq.style.boxShadow = 'none';
      bq.style.fontStyle = 'normal';
      bq.style.fontSize = '14px';
      bq.style.lineHeight = '1.8';
      bq.style.letterSpacing = '0.5px';
      break;
    case 'left-bar-blue':
      // 品牌手册：淡蓝底 + 哆啦A梦蓝竖线，不用渐变不用斜体
      bq.style.borderLeft = `3px solid ${c.main}`;
      bq.style.borderImage = 'none';
      bq.style.background = c.sub;
      bq.style.color = c.text;
      bq.style.padding = '16px 16px 16px 20px';
      bq.style.borderRadius = '4px';
      bq.style.fontStyle = 'normal';
      break;
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
    case 'ai-pocket-line':
      hr.style.border = 'none';
      hr.style.height = '1px';
      hr.style.background = `linear-gradient(90deg, rgba(5,150,105,0), ${alphaColor(c.main, 0.35, 'rgba(5,150,105,0.35)')}, rgba(5,150,105,0))`;
      hr.style.margin = '8px 0 28px';
      break;
    case 'center-gold':
      // 品牌手册：居中 40px 短金线，2px 高，干干净净一条
      // 用 section + border-top（而非给 hr 设 background），躲开微信兼容层把 hr 背景刷灰的逻辑
      hr.outerHTML = `<section style="margin:16px 0;text-align:center;line-height:0;"><span style="display:inline-block;border-top:2px solid ${c.accent};padding:0 20px;line-height:0;font-size:0;vertical-align:middle;">&nbsp;</span></section>`;
      break;
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
  if (typeof syncQuickStyleButtons === 'function') syncQuickStyleButtons();
}

// ===================================================================
// BACKGROUND TEXTURE
// ===================================================================
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
