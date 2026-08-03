// === 实时 Markdown：边打边转 ===
// 打「## 」+ 空格直接变标题，不必再走 ✨预处理。
// 只认行首标记，且只在光标就在标记末尾时触发，避免改到用户正在编辑的其他位置。

// 行首块级标记 → 处理方式。顺序无关，逐条试。
const LIVE_MD_BLOCK_RULES = [
  { re: /^(#{1,3})$/, apply: m => ({ type: 'heading', tag: 'H' + m[1].length }) },
  { re: /^>$/, apply: () => ({ type: 'quote' }) },
  { re: /^[-*+]$/, apply: () => ({ type: 'list', cmd: 'insertUnorderedList' }) },
  { re: /^\d{1,2}[.)]$/, apply: () => ({ type: 'list', cmd: 'insertOrderedList' }) },
];

// 光标所在的顶层块（editor 的直接子元素）
function liveMdCurrentBlock(node) {
  let el = node && node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  while (el && el !== editor && el.parentNode !== editor) el = el.parentNode;
  return el && el !== editor && editor.contains(el) ? el : null;
}

// 已经在列表/引用/代码块里就不再转，避免嵌套时误伤
function liveMdInProtectedContext(node) {
  let el = node && node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  while (el && el !== editor) {
    const tag = el.tagName;
    if (tag === 'PRE' || tag === 'CODE' || tag === 'LI' || tag === 'BLOCKQUOTE') return true;
    if (el.getAttribute && el.getAttribute('data-theme-component')) return true;
    el = el.parentNode;
  }
  return false;
}

// 空格触发：光标前的文本正好是行首标记时，吃掉标记并套用格式。
// 返回 true 表示已处理，调用方需 preventDefault。
function tryLiveMarkdownBlock() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
  const range = sel.getRangeAt(0);
  const node = range.startContainer;
  if (!editor.contains(node)) return false;
  if (node.nodeType !== Node.TEXT_NODE) return false;
  if (liveMdInProtectedContext(node)) return false;

  const block = liveMdCurrentBlock(node);
  if (!block) return false;
  // 标记必须在块的最开头：光标前的整段文本就是标记本身
  const before = node.textContent.slice(0, range.startOffset);
  if (before !== block.textContent.slice(0, before.length)) return false;
  const marker = before.trim();
  if (!marker || marker !== before) return false;

  for (const rule of LIVE_MD_BLOCK_RULES) {
    const m = marker.match(rule.re);
    if (!m) continue;
    const action = rule.apply(m);

    // 先把标记文本删掉，再套格式
    const del = document.createRange();
    del.setStart(node, 0);
    del.setEnd(node, range.startOffset);
    del.deleteContents();
    sel.removeAllRanges();
    const caret = document.createRange();
    caret.setStart(node, 0);
    caret.collapse(true);
    sel.addRange(caret);

    if (action.type === 'heading') {
      document.execCommand('formatBlock', false, action.tag);
    } else if (action.type === 'quote') {
      document.execCommand('formatBlock', false, 'BLOCKQUOTE');
    } else if (action.type === 'list') {
      document.execCommand(action.cmd);
    }
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  return false;
}

// 回车触发：整行是 --- / *** / ___ 时换成分割线
function tryLiveMarkdownHr() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
  const node = sel.getRangeAt(0).startContainer;
  if (!editor.contains(node)) return false;
  if (liveMdInProtectedContext(node)) return false;
  const block = liveMdCurrentBlock(node);
  if (!block) return false;
  if (!/^(-{3,}|\*{3,}|_{3,})$/.test(block.textContent.trim())) return false;

  const hr = document.createElement('hr');
  hr.setAttribute('data-hr-style', 'basic-line');
  const p = document.createElement('p');
  p.appendChild(document.createElement('br'));
  block.replaceWith(hr);
  hr.after(p);

  const caret = document.createRange();
  caret.setStart(p, 0);
  caret.collapse(true);
  sel.removeAllRanges();
  sel.addRange(caret);
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}
