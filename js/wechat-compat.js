// === 微信公众号兼容处理：flex转table / 颜色对比度 / 间距规范化 ===

function buildWechatListMarker(list, idx, mode, c) {
  const marker = document.createElement('span');
  const isOrdered = list.tagName === 'OL';
  const isCardMode = mode.id === 'mario-theme' || mode.id === 'coffee-journal' || isAiPocketModeId(mode.id) || (mode.id === 'tutorial' && isOrdered);
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
  } else if (isAiPocketModeId(mode.id)) {
    marker.style.background = c.sub || '#ECFDF5';
    marker.style.color = c.main || '#059669';
    marker.style.borderRadius = '50%';
    marker.style.fontSize = '12px';
    marker.style.lineHeight = '24px';
    marker.style.width = '24px';
    marker.style.height = '24px';
  }
  return marker;
}

function isAiPocketQuestionListForWechat(list) {
  if (!list || !['UL', 'OL'].includes(list.tagName)) return false;
  const items = Array.from(list.children).filter(child =>
    child.tagName === 'LI' && child.getAttribute('data-ai-pocket-question-label') !== '1'
  );
  return items.length > 0 && items.every(li => /[?？]\s*$/.test((li.textContent || '').trim()));
}

function isAiPocketNumberedCardListForWechat(list) {
  return !!list && (list.tagName === 'OL' || isAiPocketQuestionListForWechat(list));
}

function normalizeWechatLists(root) {
  const c = getColors();
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  const journalPaper = c.paper || c.sub || '#FFF6E8';
  const themeSky = c.sky || c.main;

  Array.from(root.querySelectorAll('ul,ol')).forEach(list => {
    const items = Array.from(list.children).filter(child =>
      child.tagName === 'LI' && child.getAttribute('data-ai-pocket-question-label') !== '1'
    );
    if (!items.length) return;
    const aiPocket = isAiPocketModeId(mode.id);
    const questionList = aiPocket && isAiPocketQuestionListForWechat(list);
    const numberedCard = aiPocket && isAiPocketNumberedCardListForWechat(list);

    const wrapper = document.createElement('section');
    wrapper.style.display = 'block';
    wrapper.style.margin = list.style.margin || `1em 0 ${STATE.paraSpacing}em`;
    wrapper.style.padding = aiPocket ? (numberedCard ? '24px 22px 14px' : '14px 16px 6px') : '0';
    if (aiPocket) {
      wrapper.setAttribute('data-theme-component', numberedCard ? (questionList ? 'ai-pocket-question-list' : 'ai-pocket-step-list') : 'ai-pocket-list');
      wrapper.style.border = `1px solid ${c.line || '#E5E7EB'}`;
      wrapper.style.borderRadius = numberedCard ? '14px' : '12px';
      wrapper.style.background = '#FFFFFF';
      wrapper.style.boxSizing = 'border-box';
      wrapper.style.overflow = 'hidden';
      if (numberedCard) {
        const label = document.createElement('p');
        label.style.margin = '0 0 20px';
        label.style.fontSize = '12px';
        label.style.fontWeight = '900';
        label.style.letterSpacing = '3px';
        label.style.color = c.muted || '#9CA3AF';
        label.style.lineHeight = '1.2';
        label.textContent = questionList ? 'QUESTION LIST' : 'STEP LIST';
        wrapper.appendChild(label);
      }
    }

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
      item.style.paddingLeft = mode.id === 'mario-theme' ? '48px' : mode.id === 'coffee-journal' ? '42px' : aiPocket ? '0' : '30px';
      item.style.textIndent = mode.id === 'mario-theme' ? '-38px' : mode.id === 'coffee-journal' ? '-34px' : '0';

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
      } else if (aiPocket) {
        item.style.margin = numberedCard ? '0 0 18px 0' : '0 0 10px 0';
        item.style.padding = '0';
        item.style.border = 'none';
        item.style.borderRadius = '0';
        item.style.background = 'transparent';
        item.style.boxShadow = 'none';
        item.style.fontSize = numberedCard ? '16px' : '14px';
        item.style.lineHeight = numberedCard ? '1.6' : '1.75';
        item.style.letterSpacing = '0.5px';
        item.style.color = numberedCard ? '#374151' : c.text;
      } else {
        item.style.padding = '0 0 6px 30px';
      }

      const marker = buildWechatListMarker(list, idx, mode, c);
      marker.style.verticalAlign = 'middle';
      marker.style.marginRight = numberedCard ? '12px' : (mode.id === 'coffee-journal' || aiPocket ? '10px' : '8px');
      marker.style.textIndent = '0';
      if (aiPocket && numberedCard) {
        marker.style.width = '30px';
        marker.style.minWidth = '30px';
        marker.style.height = '32px';
        marker.style.lineHeight = '32px';
        marker.style.borderRadius = '16px';
        marker.style.background = c.sub || '#ECFDF5';
        marker.style.color = c.main || '#059669';
        marker.style.fontSize = '14px';
      } else if (aiPocket) {
        marker.textContent = '';
        marker.style.width = '6px';
        marker.style.minWidth = '6px';
        marker.style.height = '6px';
        marker.style.lineHeight = '6px';
        marker.style.borderRadius = '50%';
        marker.style.background = c.main || '#059669';
      }
      const content = document.createElement('span');
      content.style.textIndent = '0';
      content.style.color = li.style.color || c.text;
      content.style.fontSize = numberedCard ? '16px' : '';
      content.style.fontWeight = numberedCard ? '800' : '400';
      content.style.verticalAlign = 'middle';
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
  if (!pre) return;
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  const promptMode = isAiPocketModeId(mode.id);
  const wanted = promptMode ? 'prompt' : 'terminal';
  const existing = pre.querySelector('[data-theme-role="code-window-bar"]');
  if (existing && existing.getAttribute('data-code-bar-mode') === wanted) return;
  if (existing) existing.remove();
  const bar = document.createElement('section');
  bar.setAttribute('data-theme-role', 'code-window-bar');
  bar.setAttribute('data-code-bar-mode', wanted);
  bar.style.display = 'block';
  bar.style.height = promptMode ? 'auto' : '12px';
  bar.style.lineHeight = promptMode ? '1' : '12px';
  bar.style.margin = promptMode ? '0' : '0 0 18px';
  bar.style.padding = promptMode ? '10px 12px' : '0';
  bar.style.background = promptMode ? '#FAFAFA' : '';
  bar.style.borderBottom = promptMode ? '1px solid #F3F4F6' : '';
  bar.style.whiteSpace = 'nowrap';
  const dots = ['#FF5F56', '#FFBD2E', '#27C93F'];
  dots.forEach(color => {
    const dot = document.createElement('span');
    dot.style.display = 'inline-block';
    dot.style.width = promptMode ? '8px' : '12px';
    dot.style.minWidth = promptMode ? '8px' : '12px';
    dot.style.height = promptMode ? '8px' : '12px';
    dot.style.marginRight = promptMode ? '6px' : '8px';
    dot.style.borderRadius = '50%';
    dot.style.background = color;
    dot.style.verticalAlign = promptMode ? 'middle' : 'top';
    bar.appendChild(dot);
  });
  pre.insertBefore(bar, pre.firstChild);
}

function normalizeWechatCodeBlocks(root) {
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  const promptMode = isAiPocketModeId(mode.id);
  root.querySelectorAll('pre').forEach(pre => {
    ensureTerminalCodeBar(pre);
    pre.style.display = 'block';
    pre.style.width = '100%';
    pre.style.maxWidth = '100%';
    pre.style.boxSizing = 'border-box';
    pre.style.background = promptMode ? '#FFFFFF' : '#252A33';
    pre.style.border = promptMode ? '1.5px solid #E5E7EB' : 'none';
    pre.style.borderRadius = promptMode ? '10px' : '8px';
    pre.style.boxShadow = promptMode ? 'none' : '0 10px 24px rgba(15,23,42,0.26)';
    pre.style.padding = promptMode ? '0' : '18px 20px 10px';
    pre.style.margin = '1.4em auto';
    pre.style.overflowX = promptMode ? 'hidden' : 'auto';
    pre.style.overflowY = 'hidden';
    pre.style.overflow = promptMode ? 'hidden' : 'auto';
    pre.style.whiteSpace = promptMode ? 'normal' : 'pre';
    pre.style.wordWrap = promptMode ? 'break-word' : 'normal';
    pre.style.overflowWrap = promptMode ? 'break-word' : 'normal';
    pre.style.fontSize = promptMode ? '13px' : '13px';
    pre.style.lineHeight = promptMode ? '1.8' : '1.8';
    pre.style.fontFamily = '"SF Mono","Consolas","Menlo","PingFang SC","Microsoft YaHei",monospace';
    pre.style.color = promptMode ? '#1F2937' : '#D7E7FF';

    pre.querySelectorAll('code').forEach(code => {
      code.style.display = 'block';
      code.style.minWidth = promptMode ? '0' : 'max-content';
      code.style.width = promptMode ? 'auto' : 'max-content';
      code.style.maxWidth = promptMode ? '100%' : 'none';
      code.style.background = 'transparent';
      code.style.padding = promptMode ? '14px' : '0';
      code.style.margin = '0';
      code.style.border = 'none';
      code.style.whiteSpace = promptMode ? 'pre-wrap' : 'pre';
      code.style.wordWrap = promptMode ? 'break-word' : 'normal';
      code.style.overflowWrap = promptMode ? 'break-word' : 'normal';
      code.style.fontSize = promptMode ? '13px' : '13px';
      code.style.lineHeight = promptMode ? '1.8' : '1.8';
      code.style.fontFamily = '"SF Mono","Consolas","Menlo","PingFang SC","Microsoft YaHei",monospace';
      code.style.color = promptMode ? '#1F2937' : '#D7E7FF';
      code.style.fontWeight = promptMode ? '600' : '400';
      code.style.letterSpacing = promptMode ? '0.5px' : '0';
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
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  const safe = isAiPocketModeId(mode.id)
    ? {
        text: '#374151',
        muted: '#9CA3AF',
        emphasis: '#059669',
        heading: '#111827',
        border: '#E5E7EB',
        light: '#FFFFFF'
      }
    : WECHAT_MODE_SAFE;

  root.style.color = safe.text;
  if (!root.style.background && !root.style.backgroundColor) root.style.backgroundColor = '#FFFFFF';

  root.querySelectorAll('p,li,blockquote,pre,code,[data-theme-role="body"],[data-theme-role="meta"]').forEach(el => {
    if (el.closest('[data-theme-component]')) return;
    if (isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el)) return;
    if (!isWhiteCss(el.style.color) && hasReadableColorOnBackground(el)) return;
    el.style.color = el.dataset.themeRole === 'meta' ? safe.muted : safe.text;
  });

  root.querySelectorAll('strong,b').forEach(el => {
    if (el.closest('[data-theme-component]')) return;
    if (isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el)) return;
    el.style.color = safe.emphasis;
    el.style.fontWeight = '700';
  });

  root.querySelectorAll('em,i').forEach(el => {
    if (el.closest('[data-theme-component]')) return;
    if (isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el)) return;
    el.style.color = safe.emphasis;
  });

  root.querySelectorAll('h1,h2,h3,[data-theme-role="title"]').forEach(el => {
    if (el.closest('[data-theme-component]')) return;
    const preserveWhiteOnColor = isWhiteCss(el.style.color) && hasDarkReadableBackgroundForWhite(el);
    if (!preserveWhiteOnColor) el.style.color = safe.heading;
  });

  root.querySelectorAll('span').forEach(el => {
    if (el.closest('[data-theme-component]')) return;
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

function parseCssNumber(value) {
  const n = parseFloat(String(value || '').trim());
  return Number.isFinite(n) ? n : null;
}

function getElementFontPx(el, fallback = 15, _depth = 0) {
  if (_depth > 32) return fallback;
  const inline = parseCssNumber(el.style.fontSize);
  if (inline) return inline;
  const parent = el.parentElement ? getElementFontPx(el.parentElement, fallback, _depth + 1) : fallback;
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
