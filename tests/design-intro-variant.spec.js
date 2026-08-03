// 「意疏的样式」下的开头总结框改用题头设计语言（js/components.js buildAiPocketIntroHTML）
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.errors = errors;
  page.on('dialog', d => d.accept());
  await page.addInitScript(() => { try { localStorage.setItem('gzh-ob-done', '1'); } catch {} });
  await page.goto('/');
  await page.waitForTimeout(500);
});

async function useMode(page, id) {
  await page.evaluate(modeId => {
    const i = MODES.findIndex(m => m.id === modeId);
    STATE.mode = MODES[i].id;
    if (typeof selectMode === 'function') selectMode(i);
    updatePreview();
  }, id);
  await page.waitForTimeout(250);
}

async function insertIntro(page) {
  await page.evaluate(() => {
    editor.innerHTML = '<p><br></p>';
    const r = document.createRange();
    r.selectNodeContents(editor.querySelector('p'));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    savedEditorRange = r.cloneRange();
    insertDesignIntro();
  });
  await page.waitForTimeout(400);
}

test('意疏的样式：开头框走题头变体，带栏目行、色条和署名标签条', async ({ page }) => {
  await useMode(page, 'ai-pocket-green');
  await insertIntro(page);

  const intro = page.locator('#preview [data-theme-component="design-intro"]').first();
  await expect(intro).toHaveCount(1);
  await expect(intro).toHaveAttribute('data-intro-variant', 'ai-pocket');

  // 题头设计语言的三个标志：栏目行 meta、56x5 圆角色条、底部署名条
  await expect(intro.locator('[data-theme-role="meta"]')).toContainText('栏目 ·');
  await expect(intro.locator('[data-theme-role="bar"]')).toHaveCount(1);

  const barBg = await intro.locator('[data-theme-role="bar"]').evaluate(el => getComputedStyle(el).backgroundColor);
  // 纯色而非渐变，且不是透明
  expect(barBg).not.toBe('rgba(0, 0, 0, 0)');
  const barImage = await intro.locator('[data-theme-role="bar"]').evaluate(el => getComputedStyle(el).backgroundImage);
  expect(barImage).toBe('none');

  expect(page.errors).toEqual([]);
});

test('卡片精排：开头框保持原来的样式，不带题头变体标记', async ({ page }) => {
  await useMode(page, 'ai-pocket-card');
  await insertIntro(page);

  const intro = page.locator('#preview [data-theme-component="design-intro"]').first();
  await expect(intro).toHaveCount(1);
  await expect(intro).not.toHaveAttribute('data-intro-variant', 'ai-pocket');
  expect(page.errors).toEqual([]);
});

test('开头框复用题头配置：改栏目名和署名后开头框跟着变', async ({ page }) => {
  await useMode(page, 'ai-pocket-green');
  await page.evaluate(() => {
    const ap = getAiPocket();
    ap.column = '测试栏目XYZ';
    ap.footer = '测试署名ABC';
    if (typeof STATE !== 'undefined') STATE.aiPocket = ap;
  });
  await insertIntro(page);

  const intro = page.locator('#preview [data-theme-component="design-intro"]').first();
  await expect(intro.locator('[data-theme-role="meta"]')).toContainText('测试栏目XYZ');
  await expect(intro.locator('[data-theme-role="bar"]')).toContainText('测试署名ABC');
  expect(page.errors).toEqual([]);
});

test('开头框跟随配色方案：换绿色方案后色条和底栏用主色', async ({ page }) => {
  await useMode(page, 'ai-pocket-green');
  await insertIntro(page);

  const main = await page.evaluate(() => getColors().main);
  const barBg = await page.locator('#preview [data-theme-role="bar"]').first()
    .evaluate(el => getComputedStyle(el).backgroundColor);

  const toRgb = hex => {
    const m = hex.replace('#', '');
    const n = parseInt(m.length === 3 ? m.split('').map(c => c + c).join('') : m, 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  };
  expect(barBg).toBe(toRgb(main));
  expect(page.errors).toEqual([]);
});

test('开头框导出公众号：无 flex 残留，头像宽高锁死', async ({ page }) => {
  await useMode(page, 'ai-pocket-green');
  await insertIntro(page);

  const html = await page.evaluate(() => {
    const src = document.getElementById('preview');
    return typeof buildWechatHTML === 'function' ? buildWechatHTML(src) : src.innerHTML;
  });

  expect(html).toContain('data-theme-component="design-intro"');
  expect(html).not.toMatch(/display\s*:\s*flex/i);

  // 头像若存在，三件套宽度必须都在（防 sanitizeFixedWidthsForWechat 压塌）
  const img = html.match(/<img[^>]*>/i);
  if (img) {
    expect(img[0]).toMatch(/min-width\s*:\s*56px/i);
    expect(img[0]).toMatch(/max-width\s*:\s*56px/i);
  }
  expect(page.errors).toEqual([]);
});
