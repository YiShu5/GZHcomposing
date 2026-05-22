// === 编辑器命令 / 工具栏状态 / 粘贴处理 / 富文本复制 ===

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
