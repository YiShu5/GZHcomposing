// === 设置面板 / 样式管理 / 帮助 / 新手引导 / 下拉菜单 ===

function togglePocket() {
  const fan = $('pocketFan');
  const btn = $('btnMode');
  if (fan.classList.contains('open')) { closePocket(); return; }
  fan.classList.add('open');
  btn.classList.add('open');
  setTimeout(() => {
    const handler = e => {
      if (!$('pocketWrap').contains(e.target)) {
        closePocket();
        document.removeEventListener('click', handler);
        togglePocket._handler = null;
      }
    };
    togglePocket._handler = handler;
    document.addEventListener('click', handler);
  }, 10);
}
function closePocket() {
  $('pocketFan').classList.remove('open');
  $('btnMode').classList.remove('open');
  if (togglePocket._handler) {
    document.removeEventListener('click', togglePocket._handler);
    togglePocket._handler = null;
  }
}
function openSettings(tab) {
  const overlay = $('settingsOverlay');
  const panel = $('settingsPanel');
  overlay.classList.add('show');
  panel.classList.add('show');
  renderSettingsTab(tab);
}
function closeSettings() {
  $('settingsOverlay').classList.remove('show');
  $('settingsPanel').classList.remove('show');
}
function renderSettingsTab(tab) {
  const title = $('spTitle');
  const body = $('spBody');
  const currentTab = tab || 'font';
  title.textContent = '样式设置';
  body.innerHTML = `
    <div class="settings-tabs">
      <button class="settings-tab ${currentTab==='font'?'active':''}" onclick="renderSettingsTab('font')">字体</button>
      <button class="settings-tab ${currentTab==='color'?'active':''}" onclick="renderSettingsTab('color')">配色</button>
      <button class="settings-tab ${currentTab==='spacing'?'active':''}" onclick="renderSettingsTab('spacing')">间距</button>
      <button class="settings-tab ${currentTab==='bg'?'active':''}" onclick="renderSettingsTab('bg')">背景</button>
    </div>
    <div id="settingsTabContent"></div>
  `;
  const content = $('settingsTabContent');
  switch(currentTab) {
    case 'font': renderFontSettingsContent(content); break;
    case 'color': renderColorSettingsContent(content); break;
    case 'spacing': renderSpacingSettingsContent(content); break;
    case 'bg': renderBgSettingsContent(content); break;
    default: renderFontSettingsContent(content);
  }
}

function renderFontSettingsContent(content) {
  let html = '<div class="sp-section"><h4>标题字体</h4><div class="sp-row"><select onchange="STATE.titleFont=+this.value;updatePreview()" style="flex:1">';
  TITLE_FONTS.forEach((f,i) => {
    html += `<option value="${i}" ${STATE.titleFont===i?'selected':''}>${f.name}</option>`;
  });
  html += '</select></div></div>';
  html += '<div class="sp-section"><h4>正文字体</h4><div class="sp-row"><select onchange="STATE.bodyFont=+this.value;updatePreview()" style="flex:1">';
  BODY_FONTS.forEach((f,i) => {
    html += `<option value="${i}" ${STATE.bodyFont===i?'selected':''}>${f.name}</option>`;
  });
  html += '</select></div></div>';
  content.innerHTML = html;
}

function renderColorSettingsContent(content) {
  let html = '<div class="sp-section"><h4>预设配色</h4><div class="color-row">';
  COLOR_SCHEMES.forEach((cs,i) => {
    const active = (!STATE.customColors && STATE.colorScheme === i) ? 'active' : '';
    html += `<div class="color-chip ${active}" title="${escapeAttr(cs.name)}" onclick="selectColorScheme(${i})"><span style="background:${escapeAttr(cs.main)}"></span><span style="background:${escapeAttr(cs.accent)}"></span><span style="background:${escapeAttr(cs.sub)}"></span></div>`;
  });
  html += '</div></div>';

  // Custom colors
  const cc = getColors();
  html += '<div class="sp-section"><h4>自定义配色</h4>';
  html += '<div class="custom-color-grid">';
  const fields = [
    ['main','主色',cc.main],['sub','辅色',cc.sub],['accent','强调色',cc.accent],['text','正文色',cc.text],['bg','背景色',cc.bg]
  ];
  fields.forEach(([key,label,val]) => {
    const safeVal = sanitizeColorValue(val, '#333333');
    html += `<label>${label}</label><input type="text" value="${escapeAttr(safeVal)}" onchange="setCustomColor('${key}',this.value);this.value=getColors()['${key}']" id="cc_${key}"><input type="color" value="${escapeAttr(toColorInputValue(safeVal))}" onchange="setCustomColor('${key}',this.value);$('cc_${key}').value=this.value">`;
  });
  html += '</div></div>';
  content.innerHTML = html;
}

function selectColorScheme(i) {
  STATE.colorScheme = i;
  STATE.customColors = null;
  updatePreview();
  renderSettingsTab('color');
}

function setCustomColor(key, val) {
  if (!STATE.customColors) {
    STATE.customColors = {...COLOR_SCHEMES[STATE.colorScheme]};
  }
  const fallback = COLOR_SCHEMES[STATE.colorScheme][key] || '#333333';
  STATE.customColors[key] = sanitizeColorValue(val, fallback);
  updatePreview();
}

function renderSpacingSettingsContent(content) {
  const lhOptions = [
    {label:'紧凑 1.5', v:1.5},{label:'标准 1.75', v:1.75},{label:'舒适 2.0', v:2.0},{label:'宽松 2.2', v:2.2},{label:'超宽松 2.5', v:2.5}
  ];
  const psOptions = [
    {label:'紧凑 0.5em', v:0.5},{label:'标准 1.0em', v:1.0},{label:'宽松 1.5em', v:1.5},{label:'超宽松 2.0em', v:2.0}
  ];

  let html = '<div class="sp-section"><h4>行距</h4>';
  html += '<div class="sp-row"><select onchange="setLineHeight(this.value)" style="flex:1">';
  lhOptions.forEach(o => {
    html += `<option value="${o.v}" ${Math.abs(STATE.lineHeight - o.v)<0.01?'selected':''}>${o.label}</option>`;
  });
  html += '</select></div>';
  html += `<div class="sp-row"><label style="width:auto">自定义</label><input type="number" step="0.1" min="1.2" max="3.0" value="${STATE.lineHeight}" onchange="setLineHeight(this.value)" style="width:80px"></div></div>`;

  html += '<div class="sp-section"><h4>段距</h4>';
  html += '<div class="sp-row"><select onchange="setParaSpacing(this.value)" style="flex:1">';
  psOptions.forEach(o => {
    html += `<option value="${o.v}" ${Math.abs(STATE.paraSpacing - o.v)<0.01?'selected':''}>${o.label}</option>`;
  });
  html += '</select></div>';
  html += `<div class="sp-row"><label style="width:auto">自定义</label><input type="number" step="0.1" min="0.2" max="3.0" value="${STATE.paraSpacing}" onchange="setParaSpacing(this.value)" style="width:80px"><span style="font-size:12px;color:#999">em</span></div></div>`;

  content.innerHTML = html;
}

function renderBgSettingsContent(content) {
  let html = '<div class="sp-section"><h4>选择背景</h4><div class="mode-cards">';
  BG_TEXTURES.forEach(bg => {
    const active = STATE.bg === bg.id ? 'active' : '';
    const bgSizeAttr = bg.cssBgSize ? `background-size:${bg.cssBgSize};` : '';
    html += `<div class="mode-card ${active}" onclick="selectBg('${bg.id}')" style="height:64px;display:flex;align-items:center;justify-content:center;">`;
    html += `<div style="width:100%;height:100%;border-radius:4px;background:${bg.css};${bgSizeAttr}display:flex;align-items:center;justify-content:center;">`;
    html += `<span style="font-size:11px;font-weight:600;color:#666;text-shadow:0 0 3px #fff,0 0 6px #fff">${bg.name}</span></div></div>`;
  });
  html += '</div></div>';
  content.innerHTML = html;
}

function selectBg(id) {
  STATE.bg = id;
  applyBgTexture();
  renderSettingsTab('bg');
}

function setLineHeight(v) {
  STATE.lineHeight = clampNumber(v, 1.2, 3.0, 1.75);
  updatePreview();
}
function setParaSpacing(v) {
  STATE.paraSpacing = clampNumber(v, 0.2, 3.0, 1.0);
  updatePreview();
}

// ===================================================================
// STYLE SAVE / LOAD
// ===================================================================
function sanitizeState(raw) {
  const src = (raw && typeof raw === 'object') ? raw : {};
  const colorIdx = clampNumber(src.colorScheme, 0, COLOR_SCHEMES.length - 1, STATE.colorScheme);
  const baseColors = COLOR_SCHEMES[colorIdx] || COLOR_SCHEMES[0];
  let customColors = null;
  if (src.customColors && typeof src.customColors === 'object') {
    customColors = {
      name: '自定义',
      main: sanitizeColorValue(src.customColors.main, baseColors.main),
      sub: sanitizeColorValue(src.customColors.sub, baseColors.sub),
      accent: sanitizeColorValue(src.customColors.accent, baseColors.accent),
      text: sanitizeColorValue(src.customColors.text, baseColors.text),
      bg: sanitizeColorValue(src.customColors.bg, baseColors.bg)
    };
    customColors.gradient = `linear-gradient(135deg, ${customColors.main}, ${customColors.accent})`;
  }
  const mode = MODES.some(m => m.id === src.mode) ? src.mode : STATE.mode;
  const bg = BG_TEXTURES.some(b => b.id === src.bg) ? src.bg : 'plain';
  return {
    mode,
    titleFont: Math.round(clampNumber(src.titleFont, 0, TITLE_FONTS.length - 1, STATE.titleFont)),
    bodyFont: Math.round(clampNumber(src.bodyFont, 0, BODY_FONTS.length - 1, STATE.bodyFont)),
    colorScheme: Math.round(colorIdx),
    customColors,
    lineHeight: clampNumber(src.lineHeight, 1.2, 3.0, 1.75),
    paraSpacing: clampNumber(src.paraSpacing, 0.2, 3.0, 1.0),
    isMobile: Boolean(src.isMobile),
    bg
  };
}
function sanitizeSavedStyle(item) {
  if (!item || typeof item !== 'object') return null;
  const name = String(item.name || '').trim().slice(0, 40);
  if (!name) return null;
  const time = Number.isFinite(Number(item.time)) ? Number(item.time) : Date.now();
  return { name, state: sanitizeState(item.state), time };
}
function getSavedStyles() {
  try {
    const raw = JSON.parse(localStorage.getItem('wx_formatter_styles') || '[]');
    return Array.isArray(raw) ? raw.map(sanitizeSavedStyle).filter(Boolean).slice(0, 20) : [];
  } catch { return []; }
}
function setSavedStyles(arr) {
  const safeArr = (Array.isArray(arr) ? arr : []).map(sanitizeSavedStyle).filter(Boolean).slice(0, 20);
  localStorage.setItem('wx_formatter_styles', JSON.stringify(safeArr));
}

function saveStylePrompt() {
  showModal(`
    <h3>保存为我的样式</h3>
    <p style="font-size:13px;color:#666;margin-bottom:12px">当前配置将保存到浏览器本地存储，最多20个。</p>
    <input type="text" id="styleNameInput" placeholder="输入样式名称" autofocus>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="hideModal()">取消</button>
      <button class="btn-primary" onclick="doSaveStyle()">保存</button>
    </div>
  `);
  setTimeout(() => $('styleNameInput')?.focus(), 100);
}

function doSaveStyle() {
  const name = $('styleNameInput')?.value.trim();
  if (!name) { alert('请输入名称'); return; }
  const styles = getSavedStyles();
  if (styles.length >= 20) { alert('最多保存20个样式，请删除一些再试'); return; }
  styles.push({
    name,
    state: sanitizeState(STATE),
    time: Date.now()
  });
  setSavedStyles(styles);
  hideModal();
}

function toggleStylesDropdown() {
  const dd = $('stylesDropdown');
  if (dd.classList.contains('show')) { dd.classList.remove('show'); return; }
  const styles = getSavedStyles();
  if (!styles.length) {
    dd.innerHTML = '<div class="sd-empty">暂无保存的样式<br>点底部「保存为我的样式」添加</div>';
  } else {
    let html = '';
    styles.forEach((s, i) => {
      const cs = COLOR_SCHEMES[s.state.colorScheme] || COLOR_SCHEMES[0];
      const meta = MODE_META[s.state.mode] || { emoji:'🎨', color:'#999' };
      const modeName = (MODES.find(m => m.id === s.state.mode) || {}).name || s.state.mode;
      html += `<div class="sd-card" style="animation-delay:${i * 45}ms">
        <div class="sd-card-colors">
          <span style="background:${escapeAttr(cs.main)}"></span>
          <span style="background:${escapeAttr(cs.sub)}"></span>
          <span style="background:${escapeAttr(cs.accent)}"></span>
        </div>
        <div class="sd-card-body" onclick="applyStyle(${i})">
          <div class="sd-card-name">${escapeHtml(s.name)}</div>
          <div class="sd-card-meta"><span class="sd-card-mode-tag" style="background:${escapeAttr(meta.color)}">${meta.emoji} ${modeName}</span></div>
        </div>
        <div class="sd-card-actions">
          <button onclick="editStyle(${i});event.stopPropagation()" title="编辑">✏️</button>
          <button onclick="deleteStyle(${i});event.stopPropagation()" title="删除">🗑️</button>
        </div>
      </div>`;
    });
    dd.innerHTML = html;
    requestAnimationFrame(() => {
      dd.querySelectorAll('.sd-card').forEach(el => el.classList.add('pop-in'));
    });
  }
  dd.classList.add('show');
  if (toggleStylesDropdown._timer) clearTimeout(toggleStylesDropdown._timer);
  if (toggleStylesDropdown._handler) document.removeEventListener('click', toggleStylesDropdown._handler);
  toggleStylesDropdown._timer = setTimeout(() => {
    const handler = e => {
      if (!dd.contains(e.target) && e.target.id !== 'btnMyStyles') {
        dd.classList.remove('show');
        document.removeEventListener('click', handler);
        toggleStylesDropdown._handler = null;
      }
    };
    toggleStylesDropdown._handler = handler;
    document.addEventListener('click', handler);
  }, 10);
}

function applyStyle(i) {
  const styles = getSavedStyles();
  if (!styles[i]) return;
  Object.assign(STATE, sanitizeState(styles[i].state));
  updatePreview();
  $('stylesDropdown').classList.remove('show');
}

function editStyle(i) {
  const styles = getSavedStyles();
  const s = styles[i];
  const colorChips = COLOR_SCHEMES.map((cs, idx) => {
    const active = s.state.colorScheme === idx;
    return `<div class="color-chip${active?' active':''}" title="${escapeAttr(cs.name)}"
      onclick="selectEditColor(this,${idx})" style="border-color:${active?escapeAttr(cs.main):'transparent'}">
      <span style="background:${escapeAttr(cs.main)}"></span>
      <span style="background:${escapeAttr(cs.accent)}"></span>
      <span style="background:${escapeAttr(cs.sub)}"></span>
    </div>`;
  }).join('');
  showModal(`
    <h3>编辑样式</h3>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div>
        <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">名称</label>
        <input type="text" id="editStyleName" value="${escapeAttr(s.name)}" maxlength="40">
      </div>
      <div>
        <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">配色</label>
        <div id="editColorGroup" data-val="${s.state.colorScheme}" style="display:flex;flex-wrap:wrap;gap:6px">${colorChips}</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="hideModal()">取消</button>
      <button class="btn-primary" onclick="doEditStyle(${i})">保存</button>
    </div>
  `);
}
function selectEditColor(el, idx) {
  const group = $('editColorGroup');
  group.dataset.val = idx;
  const cs = COLOR_SCHEMES[idx];
  group.querySelectorAll('.color-chip').forEach(c => {
    c.classList.remove('active');
    c.style.borderColor = 'transparent';
  });
  el.classList.add('active');
  el.style.borderColor = cs.main;
}
function doEditStyle(i) {
  const name = $('editStyleName').value.trim().slice(0, 40);
  if (!name) return;
  const styles = getSavedStyles();
  styles[i].name = name;
  styles[i].state.colorScheme = parseInt($('editColorGroup').dataset.val);
  setSavedStyles(styles);
  hideModal();
  toggleStylesDropdown();
  toggleStylesDropdown();
}

function deleteStyle(i) {
  if (!confirm('确定删除此样式？')) return;
  const styles = getSavedStyles();
  styles.splice(i, 1);
  setSavedStyles(styles);
  toggleStylesDropdown();
  toggleStylesDropdown();
}

function exportStyleJSON() {
  const data = {
    version: 1,
    styles: getSavedStyles(),
    current: sanitizeState(STATE)
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '排版样式.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importStyleJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        let imported = false;
        if (Array.isArray(data.styles)) {
          const existing = getSavedStyles();
          const incoming = data.styles.map(sanitizeSavedStyle).filter(Boolean);
          const merged = [...existing, ...incoming].slice(0, 20);
          setSavedStyles(merged);
          alert(`成功导入 ${incoming.length} 个样式`);
          imported = true;
        }
        if (data.current) {
          Object.assign(STATE, sanitizeState(data.current));
          updatePreview();
          imported = true;
        }
        if (!imported) alert('未识别样式文件，请确认是从本工具导出的 JSON');
      } catch {
        alert('JSON格式错误，文件内容不是合法 JSON');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function importMarkdown() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.markdown,.txt';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed = parseMD(ev.target.result || '');
      editor.innerHTML = sanitizeContentHTML(parsed);
      scheduleUpdate();
    };
    reader.readAsText(file, 'UTF-8');
  };
  input.click();
}

// ===================================================================
// HELP
// ===================================================================
function showHelp() {
  showModal(`
    <h3>意疏的 AI 口袋</h3>
    <div class="help-tabs">
      <button class="help-tab active" onclick="switchHelpTab('docs', this)">📝 使用说明</button>
      <button class="help-tab" onclick="switchHelpTab('contact', this)">👋 联系作者</button>
    </div>
    <div id="helpTabDocs" class="help-content">
      <h4>📝 写作</h4>
      <ul>
        <li>左侧编辑、右侧实时预览，<strong>支持 Markdown 直接粘贴</strong>自动解析</li>
        <li><strong>✨ 预处理</strong>（工具栏左二）：3 种文章类型一键梳理结构 —— 保守整理、长文分层、教程步骤</li>
        <li><strong>🎛 设计</strong>（工具栏中部）：插入大型设计组件（开篇引导、章节卡、结尾签名等）</li>
        <li>底部状态栏显示<strong>字数 + 预估阅读时长 + 黄金长度提示</strong>（🟢 1200-2000 / 🟡 略长 / 🔴 太长）</li>
      </ul>
      <h4>🎨 排版样式</h4>
      <ul>
        <li><strong>品牌手册</strong>：蓝金克制高级的单一风格，标题金竖线、引用蓝竖线、分割线居中金线，不用反复挑模板</li>
        <li><strong>配色</strong>：哆啦A梦蓝金预设 + 自定义颜色微调</li>
        <li><strong>字体</strong>：标题和正文字体可独立设置</li>
        <li><strong>行距 / 段距</strong>：5 档预设 + 自定义数值</li>
        <li><strong>背景纹理</strong>：纯白 / 暖米底，公众号兼容</li>
      </ul>
      <h4>🖼️ 图片 & 装饰</h4>
      <ul>
        <li><strong>插入图片</strong>（👜哆啦A梦的口袋→📷 插入图片）：本地上传或 URL，支持双图并排</li>
        <li><strong>自动压缩</strong>：超 1200px 自动缩放转 JPEG，单张不超过 200KB（GIF 不压）</li>
        <li><strong>分割线 + 段间空</strong>（👜哆啦A梦的口袋→─ 分割线）：3 种横线 + 3 档可控空隙（小/中/大 12/24/48px）</li>
        <li><strong>提示卡片</strong>（👜哆啦A梦的口袋→📋 提示卡片）：插入带强调色的提示块</li>
        <li><strong>结尾卡片</strong>（顶部工具栏 📝结尾）：4 种风格，自动跟随主题色</li>
        <li>点击图片选中，按 <kbd>Delete</kbd> 删除（双图并排会连同表格一起删）</li>
      </ul>
      <h4>📋 复制 & 导出</h4>
      <ul>
        <li><strong>一键复制到公众号</strong>：所有样式自动转内联样式，公众号后台直接 <kbd>Ctrl</kbd>+<kbd>V</kbd></li>
        <li><strong>💬 微信预览</strong>（预览栏右上）：提前看到「粘到公众号会变什么样」，flex 转 inline-block 等兼容处理实时显示</li>
        <li><strong>导出 HTML</strong> / <strong>导出 MD</strong>：备份原稿，给 AI 改稿，跨工具迁移</li>
        <li><strong>复制为 HTML</strong>：直接拿到一段排版好的 HTML 代码</li>
      </ul>
      <h4>💾 自动保存 & 撤销</h4>
      <ul>
        <li>每 5 秒自动存到本地浏览器，关页面前还会再存一次</li>
        <li>刷新或重开页面，<strong>7 天内的草稿会问是否恢复</strong></li>
        <li><kbd>Ctrl</kbd>+<kbd>Z</kbd> 撤销 / <kbd>Ctrl</kbd>+<kbd>Y</kbd>（或 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>）重做，60 步历史栈</li>
      </ul>
      <h4>💎 样式管理</h4>
      <ul>
        <li>保存当前配置为「我的样式」，下次一键复用，最多 20 个</li>
        <li>支持导出 / 导入 JSON 文件，跨设备分享</li>
      </ul>
      <h4>✍️ Markdown 语法</h4>
      <ul>
        <li><kbd>#</kbd> <kbd>##</kbd> <kbd>###</kbd> 标题</li>
        <li><kbd>**文字**</kbd> 加粗 / <kbd>*文字*</kbd> 斜体</li>
        <li><kbd>> 文字</kbd> 引用</li>
        <li><kbd>- 文字</kbd> 无序列表 / <kbd>1. 文字</kbd> 有序列表</li>
        <li><kbd>\`\`\`代码\`\`\`</kbd> 代码块</li>
        <li><kbd>---</kbd> 分割线</li>
      </ul>
      <h4>🔔 小彩蛋</h4>
      <ul>
        <li>左上角的哆啦A梦戳一下试试，连点更有惊喜</li>
      </ul>
    </div>
    <div id="helpTabContact" class="help-contact" style="display:none">
      <div class="help-contact-card">
        <div class="help-contact-title">👋 我是意疏</div>
        <div class="help-contact-sub">这个排版器是我做的，欢迎一起聊聊</div>
        <img src="assets/qrcode.jpg" alt="意疏的微信二维码" loading="lazy">
        <div class="help-contact-tagline">扫码加我微信</div>
        <div class="help-contact-hint">做产品、做内容、聊 AI，都可以</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" onclick="hideModal()">知道了</button>
    </div>
  `);
}
function switchHelpTab(which, btn) {
  $('helpTabDocs').style.display = which === 'docs' ? '' : 'none';
  $('helpTabContact').style.display = which === 'contact' ? '' : 'none';
  btn.parentNode.querySelectorAll('.help-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function toggleDropdown(id) {
  const menu = $(id);
  const wasOpen = menu && menu.classList.contains('open');
  closeDropdowns();
  if (!wasOpen && menu) menu.classList.add('open');
}
function closeDropdowns() {
  document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
}
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown-wrap')) closeDropdowns();
});

// ===================================================================
// BRAND PROMOTION TOAST (after WeChat copy success)
// ===================================================================
let promoteTimer = null;
function showPromote() {
  const toast = $('promoteToast');
  if (!toast) return;
  toast.classList.add('show');
  if (promoteTimer) clearTimeout(promoteTimer);
  promoteTimer = setTimeout(closePromote, 6000);
}
function closePromote() {
  const toast = $('promoteToast');
  if (!toast) return;
  toast.classList.remove('show');
  if (promoteTimer) { clearTimeout(promoteTimer); promoteTimer = null; }
}

// ===================================================================
// FIRST-RUN ONBOARDING (4 steps, gated by localStorage)
// ===================================================================
const OB_DONE_KEY = 'gzh-ob-done';
let obCurrentStep = 1;
function obShow(step) {
  obCurrentStep = step;
  const overlay = $('onboardingOverlay');
  if (!overlay) return;
  overlay.classList.add('show');
  overlay.querySelectorAll('.ob-step').forEach(el => {
    const n = parseInt(el.getAttribute('data-ob-step') || '0', 10);
    el.style.display = (n === step) ? '' : 'none';
  });
}
function obNext() {
  if (obCurrentStep < 4) obShow(obCurrentStep + 1);
  else obFinish();
}
function obSkip() { obFinish(); }
function obFinish() {
  const overlay = $('onboardingOverlay');
  if (overlay) overlay.classList.remove('show');
  try { localStorage.setItem(OB_DONE_KEY, '1'); } catch {}
}
