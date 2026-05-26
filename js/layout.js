// === 分割线拖拽 / 滚动同步 / 移动端预览切换 ===

// ===================================================================
// DIVIDER DRAG
// ===================================================================
function setupDivider() {
  let startX, startLeftW;
  const total = () => (panelLeft && panelLeft.parentElement) ? panelLeft.parentElement.clientWidth - 5 : 800;

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
