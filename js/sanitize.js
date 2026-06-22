// === HTML 内容清洗 / 安全过滤 / 图片对布局规范化 ===

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
  'width','height','max-width','min-width','max-height','min-height','object-fit','margin','margin-top','margin-right','margin-bottom','margin-left',
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
    if (!SAFE_STYLE_PROPS.has(prop)) continue;
    if (!isSafeCssValue(value)) continue;
    // 禁用 position:fixed / sticky —— 从公众号 / 第三方网页粘贴时
    // 常带这种用作布局占位的空 div，pasted 后会变成屏幕级 overlay 抢点击
    // 设计组件用的 position:absolute 保留（会被 normalizeWechatPositioning 兜底转成 static）
    if (prop === 'position' && (value === 'fixed' || value === 'sticky')) continue;
    safe.push(`${prop}:${value}`);
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
      if (tag === 'IMG' && (name === 'width' || name === 'height')) {
        if (/^\d{1,4}$/.test(String(value || '').trim())) node.setAttribute(name, String(value).trim());
        else node.removeAttribute(attr.name);
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
      if (['data-ending-block','data-ending-type','data-theme-component','data-theme-role','data-layout','data-editor-highlight','data-hr-style','data-user-align','data-img-id'].includes(name)) return;
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
