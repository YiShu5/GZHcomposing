// === DOMContentLoaded 初始化入口 ===

window.addEventListener('DOMContentLoaded', () => {
  // 草稿恢复优先于默认内容
  const draft = loadDraft();
  if (draft && draft.html && draft.html.trim() && draft.html !== DEFAULT_HTML) {
    const minutesAgo = Math.max(1, Math.round((Date.now() - draft.savedAt) / 60000));
    const ok = confirm(`检测到 ${minutesAgo} 分钟前的未保存草稿（约 ${draft.chars} 字），是否恢复？\n\n点「确定」恢复草稿。\n点「取消」加载默认范例（草稿会被覆盖）。`);
    if (ok) editor.innerHTML = sanitizeContentHTML(draft.html);
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

window.addEventListener('DOMContentLoaded', () => {
  try {
    if (!localStorage.getItem(OB_DONE_KEY)) {
      setTimeout(() => obShow(1), 500);
    }
  } catch {}
});
