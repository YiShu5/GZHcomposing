// 针对 8b9a6d2「题头逻辑重做 + 手动变绿 + 题头品牌件可配置」的行为测试
const { test, expect } = require('@playwright/test');

// 切到「意疏的样式」(ai-pocket-green) 主题，题头卡只在该主题下渲染。
// 同时关掉「微信预览」兼容管道：它会二次重写 #preview 并剥掉 data-ai-pocket-* 私有标记
// （导出 HTML 不该带这些属性，属预期行为），但会挡住这里对题头内部结构的断言。
async function useAiPocketMode(page) {
  await page.evaluate(() => {
    wechatPreviewActive = false;
    const i = MODES.findIndex(m => m.id === 'ai-pocket-green');
    STATE.mode = MODES[i].id;
    if (typeof selectMode === 'function') selectMode(i);
    updatePreview();
  });
  await page.waitForTimeout(300);
}

async function setEditor(page, html) {
  await page.evaluate(h => {
    wechatPreviewActive = false;
    editor.innerHTML = h;
    updatePreview();
  }, html);
  await page.waitForTimeout(300);
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.errors = errors;
  await page.goto('/');
  await page.waitForTimeout(500);
  await useAiPocketMode(page);
});

test('首个非空 H1 渲染为题头大卡，含栏目/月份/头像/底部标签', async ({ page }) => {
  await setEditor(page, '<h1>测试标题</h1><p>正文</p>');
  const hero = page.locator('#preview h1').first();
  await expect(hero).toHaveAttribute('data-ai-pocket-hero-added', '1');
  const html = await hero.innerHTML();
  expect(html).toContain('栏目 · 意疏的AI口袋');   // 品牌件栏目行
  expect(html).toContain('测试标题');
  expect(html).toContain('data-theme-role="bar"'); // 底部署名标签条
  expect(html).toContain('<img');                  // 头像
  expect(page.errors).toEqual([]);
});

test('空 H1 不留空白卡（display:none）', async ({ page }) => {
  await setEditor(page, '<h1></h1><p>正文</p>');
  const h1 = page.locator('#preview h1').first();
  await expect(h1).toHaveCSS('display', 'none');
  // 空标题不应该注入题头结构
  expect(await h1.innerHTML()).not.toContain('data-theme-role="bar"');
  expect(page.errors).toEqual([]);
});

test('只有第一个非空 H1 是题头卡，其余 H1 按普通小节标题排', async ({ page }) => {
  await setEditor(page, '<h1>第一个</h1><p>a</p><h1>第二个</h1><p>b</p><h1>第三个</h1>');
  const h1s = page.locator('#preview h1');
  await expect(h1s).toHaveCount(3);
  await expect(h1s.nth(0)).toHaveAttribute('data-ai-pocket-hero-added', '1');
  for (const i of [1, 2]) {
    const el = h1s.nth(i);
    expect(await el.getAttribute('data-ai-pocket-hero-added')).toBeNull();
    expect(await el.innerHTML()).not.toContain('data-theme-role="bar"');
    await expect(el).toHaveCSS('font-size', '16px'); // 普通小节标题尺寸
  }
  expect(page.errors).toEqual([]);
});

test('标题里手动变绿的 span 在题头卡里保留', async ({ page }) => {
  await setEditor(page, '<h1>黑色<span data-editor-green="true" style="color:#059669">绿色</span></h1>');
  const html = await page.locator('#preview h1').first().innerHTML();
  expect(html).toContain('data-editor-green="true"');
  expect(html).toContain('绿色');
  expect(page.errors).toEqual([]);
});

test('标题带逗号不再自动分色（旧行为已移除）', async ({ page }) => {
  await setEditor(page, '<h1>前半句，后半句</h1>');
  const html = await page.locator('#preview h1').first().innerHTML();
  expect(html).not.toContain('data-theme-role="title-accent"');
  expect(html).toContain('前半句，后半句');
  expect(page.errors).toEqual([]);
});

test('关掉题头卡(card=false)：第一个 H1 按普通大标题排，不出大卡', async ({ page }) => {
  await setEditor(page, '<h1>标题</h1><p>正文</p>');
  await page.evaluate(() => { STATE.aiPocket.card = false; updatePreview(); });
  await page.waitForTimeout(300);
  const h1 = page.locator('#preview h1').first();
  expect(await h1.innerHTML()).not.toContain('data-theme-role="bar"');
  await expect(h1).toHaveCSS('font-size', '24px');
  expect(page.errors).toEqual([]);
});

test('关掉品牌件(brand=false)：栏目行/头像/底部标签消失，标题仍在', async ({ page }) => {
  await setEditor(page, '<h1>标题</h1><p>正文</p>');
  await page.evaluate(() => { STATE.aiPocket.brand = false; updatePreview(); });
  await page.waitForTimeout(300);
  const html = await page.locator('#preview h1').first().innerHTML();
  expect(html).not.toContain('栏目 · ');
  expect(html).not.toContain('data-theme-role="bar"');
  expect(html).not.toContain('<img');
  expect(html).toContain('标题');
  expect(page.errors).toEqual([]);
});

test('题头文字可配置：栏目/月份/底部署名/标签走 STATE.aiPocket', async ({ page }) => {
  await page.evaluate(() => {
    Object.assign(STATE.aiPocket, {
      column: '自定栏目', month: '2099.12', footer: '自定署名',
      tag1: '标签甲', tag2: '标签乙'
    });
  });
  await setEditor(page, '<h1>标题</h1>');
  const html = await page.locator('#preview h1').first().innerHTML();
  for (const s of ['自定栏目', '2099.12', '自定署名', '标签甲', '标签乙']) {
    expect(html).toContain(s);
  }
  expect(page.errors).toEqual([]);
});

test('题头配置里的 HTML 特殊字符被转义，不注入标签', async ({ page }) => {
  await page.evaluate(() => {
    Object.assign(STATE.aiPocket, { column: '<img src=x onerror=alert(1)>', footer: '"><script>alert(2)<\/script>' });
  });
  await setEditor(page, '<h1>标题</h1>');
  const hero = page.locator('#preview h1').first();
  // 注入的 img/script 不应成为真实元素（头像那个 img 是合法的，故按 onerror/script 判断）
  expect(await hero.locator('img[onerror]').count()).toBe(0);
  expect(await hero.locator('script').count()).toBe(0);
  expect(page.errors).toEqual([]);
});

test('PARTS 横滑导航：题头卡或品牌件关掉就不出现', async ({ page }) => {
  const body = '<h1>大标题</h1><h2>小节一</h2><p>a</p><h2>小节二</h2><p>b</p>';
  await setEditor(page, body);
  const navCount = await page.locator('#preview [data-theme-component="ai-pocket-parts-nav"]').count();

  await page.evaluate(() => { STATE.aiPocket.card = false; updatePreview(); });
  await page.waitForTimeout(300);
  expect(await page.locator('#preview [data-theme-component="ai-pocket-parts-nav"]').count()).toBe(0);

  await page.evaluate(() => { STATE.aiPocket.card = true; STATE.aiPocket.brand = false; updatePreview(); });
  await page.waitForTimeout(300);
  expect(await page.locator('#preview [data-theme-component="ai-pocket-parts-nav"]').count()).toBe(0);

  // 两个都开时应该恢复（若初始就有）
  await page.evaluate(() => { STATE.aiPocket.brand = true; updatePreview(); });
  await page.waitForTimeout(300);
  expect(await page.locator('#preview [data-theme-component="ai-pocket-parts-nav"]').count()).toBe(navCount);
  expect(page.errors).toEqual([]);
});

test('旧草稿没有 aiPocket 字段时题头仍按默认值渲染（兜底）', async ({ page }) => {
  await page.evaluate(() => { delete STATE.aiPocket; });
  await setEditor(page, '<h1>老草稿标题</h1>');
  const html = await page.locator('#preview h1').first().innerHTML();
  expect(html).toContain('栏目 · 意疏的AI口袋');
  expect(html).toContain('老草稿标题');
  expect(page.errors).toEqual([]);
});

test('sanitize 保留 data-editor-green 属性', async ({ page }) => {
  const kept = await page.evaluate(() =>
    sanitizeContentHTML('<p><span data-editor-green="true" style="color:#059669">绿</span></p>')
  );
  expect(kept).toContain('data-editor-green="true"');
  expect(page.errors).toEqual([]);
});
