// === 选中文字时在光标附近弹出的悬浮快捷栏（inline toolbar）===
// 选中编辑器里的文字 → 在选区上方弹出加粗/斜体/引用/卡片/代码/编号/对齐/图片/分割线

function positionInlineToolbar() {
  const tb = $('inlineToolbar');
  if (!tb) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { hideInlineToolbar(); return; }
  const range = sel.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
  if (!editor.contains(el)) { hideInlineToolbar(); return; }
  const rect = range.getBoundingClientRect();
  if (!rect.width && !rect.height) { hideInlineToolbar(); return; }
  // 先显示以拿到尺寸
  tb.classList.add('show');
  const tbw = tb.offsetWidth, tbh = tb.offsetHeight;
  let left = rect.left + rect.width / 2 - tbw / 2;
  let top = rect.top - tbh - 10;
  left = Math.max(10, Math.min(left, window.innerWidth - tbw - 10));
  if (top < 10) top = rect.bottom + 10; // 上方放不下就翻到选区下方
  tb.style.left = Math.round(left) + 'px';
  tb.style.top = Math.round(top) + 'px';
}

function hideInlineToolbar() {
  const tb = $('inlineToolbar');
  if (tb) tb.classList.remove('show');
}

// 加粗/斜体后保持工具栏并刷新按钮高亮态
function afterInlineFormat() {
  try { updateToolbarStates(); } catch (e) {}
  positionInlineToolbar();
}

function setupInlineToolbar() {
  const tb = $('inlineToolbar');
  if (!tb) return;
  // 点工具栏时阻止编辑器丢失选区
  tb.addEventListener('mousedown', e => e.preventDefault());

  let raf = null;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(positionInlineToolbar); };
  editor.addEventListener('mouseup', schedule);
  editor.addEventListener('keyup', schedule);
  // 选区塌缩（点一下、移动光标）立刻收起
  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) hideInlineToolbar();
  });
  // 滚动 / 缩放 / 点别处都收起，避免停留在错位位置
  window.addEventListener('scroll', hideInlineToolbar, true);
  window.addEventListener('resize', hideInlineToolbar);
  document.addEventListener('mousedown', e => {
    if (!tb.contains(e.target) && !editor.contains(e.target)) hideInlineToolbar();
  });
}

window.addEventListener('DOMContentLoaded', setupInlineToolbar);
