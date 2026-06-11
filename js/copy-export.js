// === 微信复制 / HTML导出 / Markdown导出 ===

// 默认开启：右侧预览始终是「粘到公众号的真实样子」，避免编辑器里好看、粘出来塌房
const WECHAT_PREVIEW_KEY = 'gzhcomposing.wechatPreview';
let wechatPreviewActive = localStorage.getItem(WECHAT_PREVIEW_KEY) !== 'false';
let wechatPreviewBackup = null;
function toggleWechatPreview() {
  wechatPreviewActive = !wechatPreviewActive;
  localStorage.setItem(WECHAT_PREVIEW_KEY, wechatPreviewActive);
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
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  if (isAiPocketModeId(mode.id)) {
    root.querySelectorAll('pre').forEach(pre => {
      appendRawStyle(pre, 'white-space:normal;word-wrap:break-word;overflow-wrap:break-word;overflow-x:hidden;overflow-y:hidden');
    });
    root.querySelectorAll('pre code').forEach(code => {
      appendRawStyle(code, 'display:block;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;min-width:0;width:auto;max-width:100%');
    });
    return;
  }
  root.querySelectorAll('pre').forEach(pre => {
    appendRawStyle(pre, 'white-space:pre;word-wrap:normal;overflow-wrap:normal;overflow-x:auto;overflow-y:hidden');
  });
  root.querySelectorAll('pre code').forEach(code => {
    appendRawStyle(code, 'display:block;white-space:pre;word-wrap:normal;overflow-wrap:normal;min-width:max-content;width:max-content;max-width:none');
  });
}
function buildWechatHTMLFromElement(source, includeBg) {
  const clone = source.cloneNode(true);
  const mode = MODES.find(m => m.id === STATE.mode) || MODES[0];
  const aiPocket = isAiPocketModeId(mode.id);
  inlineAllStyles(clone);
  prepareWechatCompatibility(clone);
  normalizeWechatSpacingParity(clone);
  clone.innerHTML = sanitizeContentHTML(clone.innerHTML);
  restoreWechatCodeBlockNoWrap(clone);
  if (!includeBg) return clone.innerHTML;
  const bg = BG_TEXTURES.find(b => b.id === STATE.bg) || BG_TEXTURES[0];
  let bgStyle = aiPocket ? 'background:#FFFFFF;background-color:#FFFFFF;' : `background:${bg.css};`;
  if (!aiPocket && bg.cssBgSize) bgStyle += `background-size:${bg.cssBgSize};`;
  const baseLine = getLineHeightPx(15, STATE.lineHeight);
  const textColor = aiPocket ? '#374151' : WECHAT_MODE_SAFE.text;
  return `<section style="${bgStyle}padding:32px 24px;font-size:15px;line-height:${baseLine}px;color:${textColor};background-color:#FFFFFF;color-scheme:light;">${clone.innerHTML}</section>`;
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
  ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch {}
  document.body.removeChild(ta);
  return ok;
}
function fallbackCopyHTML(html) {
  const div = document.createElement('div');
  div.contentEditable = 'true';
  div.innerHTML = html;
  div.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';
  document.body.appendChild(div);
  const range = document.createRange();
  range.selectNodeContents(div);
  const sel = window.getSelection();
  const savedRanges = [];
  for (let i = 0; i < sel.rangeCount; i++) savedRanges.push(sel.getRangeAt(i));
  sel.removeAllRanges();
  sel.addRange(range);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch {}
  sel.removeAllRanges();
  savedRanges.forEach(r => sel.addRange(r));
  document.body.removeChild(div);
  return ok;
}
function copyToWechat() {
  const html = buildWechatHTMLSnippet();
  const btn = $('copyBtn');
  const done = () => { setButtonCopied(btn, '✅ 已复制', '🚀 一键复制到公众号'); showPromote(); };
  const fail = () => alert('复制失败，请手动全选预览区内容后按 Ctrl+C 复制');
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], {type: 'text/html'}),
        'text/plain': new Blob([preview.innerText], {type: 'text/plain'})
      })
    ]).then(done).catch(() => { fallbackCopyHTML(html) ? done() : fail(); });
  } else {
    fallbackCopyHTML(html) ? done() : fail();
  }
}
function copyHTMLCode() {
  const html = buildWechatHTMLSnippet();
  const btn = $('copyHtmlBtn');
  const done = () => setButtonCopied(btn, '✅ HTML已复制', '复制为 HTML');
  const fail = () => alert('复制失败，请手动复制');
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], {type: 'text/html'}),
        'text/plain': new Blob([html], {type: 'text/plain'})
      })
    ]).then(done).catch(() => { fallbackCopyText(html) ? done() : fail(); });
  } else {
    fallbackCopyText(html) ? done() : fail();
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
      // 判断是否为装饰过的 hr 占位（包含一根线 + 装饰，不含真实文本）
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
