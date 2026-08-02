// 针对 8b9a6d2 的另两块：手动「变绿」+ 悬浮快捷栏（inline toolbar）
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.errors = errors;
  page.on('dialog', d => d.accept());   // applyTextGreen 未选中时会 alert
  // 预先标记新手引导已看过：否则 onboardingOverlay 会盖住编辑器，拦掉真实鼠标事件
  await page.addInitScript(() => {
    try { localStorage.setItem('gzh-ob-done', '1'); } catch {}
  });
  await page.goto('/');
  await page.waitForTimeout(500);
});

// 在编辑器第一个 <p> 里选中指定字符区间
async function selectInFirstP(page, start, end) {
  await page.evaluate(([s, e]) => {
    const p = editor.querySelector('p');
    const node = p.firstChild;
    const r = document.createRange();
    r.setStart(node, s);
    r.setEnd(node, e);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }, [start, end]);
}

async function setEditorText(page, html) {
  await page.evaluate(h => { editor.innerHTML = h; updatePreview(); }, html);
  await page.waitForTimeout(200);
}

test('变绿：选中文字包成 data-editor-green span', async ({ page }) => {
  await setEditorText(page, '<p>前面绿色后面</p>');
  await selectInFirstP(page, 2, 4);
  await page.evaluate(() => applyTextGreen());
  await page.waitForTimeout(300);
  const html = await page.evaluate(() => editor.innerHTML);
  expect(html).toContain('data-editor-green="true"');
  expect(html).toContain('绿色');
  expect(page.errors).toEqual([]);
});

test('变绿：再点一次取消（unwrap，文字不丢）', async ({ page }) => {
  await setEditorText(page, '<p>前面绿色后面</p>');
  await selectInFirstP(page, 2, 4);
  await page.evaluate(() => applyTextGreen());
  await page.waitForTimeout(250);
  // 选中已变绿的 span 内部再点一次
  await page.evaluate(() => {
    const span = editor.querySelector('[data-editor-green="true"]');
    const r = document.createRange();
    r.selectNodeContents(span);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    applyTextGreen();
  });
  await page.waitForTimeout(300);
  const html = await page.evaluate(() => editor.innerHTML);
  expect(html).not.toContain('data-editor-green');
  expect(await page.evaluate(() => editor.textContent)).toBe('前面绿色后面');
  expect(page.errors).toEqual([]);
});

test('变绿：未选中文字时不炸（弹提示后安全返回）', async ({ page }) => {
  await setEditorText(page, '<p>没有选中</p>');
  await page.evaluate(() => { window.getSelection().removeAllRanges(); applyTextGreen(); });
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => editor.innerHTML)).not.toContain('data-editor-green');
  expect(page.errors).toEqual([]);
});

// 跨段落选中时 markBlockwise 会给每个块各包一个 span，但最终落地走的是
// document.execCommand('insertHTML')。Chrome 在把内容并回首尾两个「只选中一部分」的
// 段落时会重新序列化那两个 span，只保留内联 style，丢掉 data-editor-green 属性，
// 导致首尾段取消不掉（取消逻辑靠 data 属性找元素）。restoreMarkAttr() 按 style 指纹补回属性。
test('变绿：跨段落时每个块都带 data-editor-green', async ({ page }) => {
  await setEditorText(page, '<p>第一段文字</p><p>第二段文字</p><p>第三段文字</p>');
  await page.evaluate(() => {
    const ps = editor.querySelectorAll('p');
    const r = document.createRange();
    r.setStart(ps[0].firstChild, 1);
    r.setEnd(ps[2].firstChild, 3);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    applyTextGreen();
  });
  await page.waitForTimeout(350);
  const greens = await page.evaluate(() => editor.querySelectorAll('[data-editor-green="true"]').length);
  expect(greens).toBe(3);
  expect(page.errors).toEqual([]);
});

test('变绿：跨段落不产生非法 <span><p> 嵌套（这一半是好的）', async ({ page }) => {
  await setEditorText(page, '<p>第一段文字</p><p>第二段文字</p><p>第三段文字</p>');
  await page.evaluate(() => {
    const ps = editor.querySelectorAll('p');
    const r = document.createRange();
    r.setStart(ps[0].firstChild, 1);
    r.setEnd(ps[2].firstChild, 3);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    applyTextGreen();
  });
  await page.waitForTimeout(350);
  const bad = await page.evaluate(() =>
    editor.querySelectorAll('span p, span h1, span h2, span blockquote, span li').length
  );
  expect(bad).toBe(0);                                   // span 里不该裹块级元素
  expect(await page.evaluate(() => editor.querySelectorAll('p').length)).toBe(3);
  expect(await page.evaluate(() => editor.textContent)).toBe('第一段文字第二段文字第三段文字');
  expect(page.errors).toEqual([]);
});

test('变绿：跨段落后再点一次能把整段绿色全部取消', async ({ page }) => {
  await setEditorText(page, '<p>第一段文字</p><p>第二段文字</p><p>第三段文字</p>');
  await page.evaluate(() => {
    const ps = editor.querySelectorAll('p');
    const r = document.createRange();
    r.setStart(ps[0].firstChild, 1);
    r.setEnd(ps[2].firstChild, 3);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    applyTextGreen();
    // 再全选点一次「变绿」，期望把绿色全部取消
    const r2 = document.createRange();
    r2.selectNodeContents(editor);
    sel.removeAllRanges();
    sel.addRange(r2);
    applyTextGreen();
  });
  await page.waitForTimeout(350);
  const leftover = await page.evaluate(() =>
    Array.from(editor.querySelectorAll('span'))
      .filter(s => /5,\s*150,\s*105|059669/i.test(s.getAttribute('style') || '')).length
  );
  expect(leftover).toBe(0);
  expect(await page.evaluate(() => editor.textContent)).toBe('第一段文字第二段文字第三段文字');
  expect(page.errors).toEqual([]);
});

test('高光跨段落同样每块带 data-editor-highlight 且能整体取消', async ({ page }) => {
  await setEditorText(page, '<p>第一段文字</p><p>第二段文字</p><p>第三段文字</p>');
  await page.evaluate(() => {
    const ps = editor.querySelectorAll('p');
    const r = document.createRange();
    r.setStart(ps[0].firstChild, 1);
    r.setEnd(ps[2].firstChild, 3);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    applyTextHighlight();
  });
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => editor.querySelectorAll('[data-editor-highlight="true"]').length)).toBe(3);

  await page.evaluate(() => {
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(editor);
    sel.removeAllRanges();
    sel.addRange(r);
    applyTextHighlight();
  });
  await page.waitForTimeout(350);
  const leftover = await page.evaluate(() =>
    Array.from(editor.querySelectorAll('span'))
      .filter(s => /252,\s*227,\s*139|FCE38B/i.test(s.getAttribute('style') || '')).length
  );
  expect(leftover).toBe(0);
  expect(page.errors).toEqual([]);
});

test('变绿和高光互不串味：绿色的 span 不会被认成高光', async ({ page }) => {
  await setEditorText(page, '<p>前面绿色中间高光后面</p>');
  await selectInFirstP(page, 2, 4);           // 「绿色」
  await page.evaluate(() => applyTextGreen());
  await page.waitForTimeout(250);
  // 再选「高光」两字（此时 DOM 已变，重新按文本定位）
  await page.evaluate(() => {
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const i = node.textContent.indexOf('高光');
      if (i >= 0) {
        const r = document.createRange();
        r.setStart(node, i);
        r.setEnd(node, i + 2);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        applyTextHighlight();
        return;
      }
    }
  });
  await page.waitForTimeout(350);
  const counts = await page.evaluate(() => ({
    green: editor.querySelectorAll('[data-editor-green="true"]').length,
    highlight: editor.querySelectorAll('[data-editor-highlight="true"]').length,
    both: editor.querySelectorAll('[data-editor-green="true"][data-editor-highlight="true"]').length,
  }));
  expect(counts.green).toBe(1);
  expect(counts.highlight).toBe(1);
  expect(counts.both).toBe(0);        // 一个 span 不该同时被打两种标记
  expect(page.errors).toEqual([]);
});

test('变绿后预览里绿色 span 存活并带颜色', async ({ page }) => {
  await setEditorText(page, '<p>前面绿色后面</p>');
  await selectInFirstP(page, 2, 4);
  await page.evaluate(() => { applyTextGreen(); updatePreview(); });
  await page.waitForTimeout(400);
  const count = await page.locator('#preview [data-editor-green="true"]').count();
  expect(count).toBeGreaterThan(0);
  const color = await page.locator('#preview [data-editor-green="true"]').first()
    .evaluate(el => getComputedStyle(el).color);
  expect(color).toBe('rgb(5, 150, 105)');
  expect(page.errors).toEqual([]);
});

test('变绿按钮的 active 高亮态跟随光标位置', async ({ page }) => {
  await setEditorText(page, '<p>前面绿色后面</p>');
  await selectInFirstP(page, 2, 4);
  await page.evaluate(() => { applyTextGreen(); updateToolbarStates(); });
  await page.waitForTimeout(250);
  // 光标在绿色里 → 按钮 active
  await page.evaluate(() => {
    const span = editor.querySelector('[data-editor-green="true"]');
    const r = document.createRange();
    r.selectNodeContents(span);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    updateToolbarStates();
  });
  await expect(page.locator('#btnGreen')).toHaveClass(/active/);
  expect(page.errors).toEqual([]);
});

test('悬浮快捷栏：选中文字后出现，选区塌缩后收起', async ({ page }) => {
  await setEditorText(page, '<p>一段用来选中的文字内容</p>');
  // 真实鼠标拖选，才会触发 mouseup → positionInlineToolbar
  const box = await page.locator('#editor p').first().boundingBox();
  await page.mouse.move(box.x + 8, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(350);
  await expect(page.locator('#inlineToolbar')).toHaveClass(/show/);

  // 单击别处让选区塌缩
  await page.mouse.click(box.x + box.width * 0.9, box.y + box.height / 2);
  await page.waitForTimeout(350);
  await expect(page.locator('#inlineToolbar')).not.toHaveClass(/show/);
  expect(page.errors).toEqual([]);
});

test('悬浮快捷栏：不超出视口左右边界', async ({ page }) => {
  await setEditorText(page, '<p>短</p>');
  await page.evaluate(() => {
    const p = editor.querySelector('p');
    const r = document.createRange();
    r.selectNodeContents(p);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    positionInlineToolbar();
  });
  await page.waitForTimeout(250);
  const tb = page.locator('#inlineToolbar');
  if (await tb.evaluate(el => el.classList.contains('show'))) {
    const b = await tb.boundingBox();
    const vw = await page.evaluate(() => window.innerWidth);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(vw + 1);
  }
  expect(page.errors).toEqual([]);
});

test('悬浮快捷栏里的变绿按钮可用（afterInlineFormat 不炸）', async ({ page }) => {
  await setEditorText(page, '<p>前面绿色后面</p>');
  await selectInFirstP(page, 2, 4);
  await page.evaluate(() => { applyTextGreen(); afterInlineFormat(); });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => editor.innerHTML)).toContain('data-editor-green="true"');
  expect(page.errors).toEqual([]);
});

test('粘贴时范例内容被清空，范例标题不占住题头 H1', async ({ page }) => {
  // 初始就是内置范例
  const demoTitle = await page.evaluate(() => DEMO_TITLE_TEXT);
  expect(demoTitle).toBeTruthy();
  expect(await page.evaluate(() => editor.textContent.includes(DEMO_TITLE_TEXT))).toBe(true);

  await page.locator('#editor').click();
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.setData('text/plain', '我粘贴进来的新标题\n新的正文段落');
    editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(500);
  const text = await page.evaluate(() => editor.textContent);
  expect(text).not.toContain(demoTitle);       // 范例标题已被清掉
  expect(text).toContain('我粘贴进来的新标题');
  expect(page.errors).toEqual([]);
});

test('变绿的内容存进草稿再读回来仍是绿色', async ({ page }) => {
  await setEditorText(page, '<p>前面绿色后面</p>');
  await selectInFirstP(page, 2, 4);
  await page.evaluate(() => applyTextGreen());
  await page.waitForTimeout(250);
  const restored = await page.evaluate(() => sanitizeContentHTML(editor.innerHTML));
  expect(restored).toContain('data-editor-green="true"');
  // sanitizeStyleText 会把颜色归一化成 rgb() 写法，等价于 #059669
  expect(restored).toMatch(/color:\s*(#059669|rgb\(5,\s*150,\s*105\))/i);
  expect(page.errors).toEqual([]);
});
