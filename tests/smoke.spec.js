// @ts-check
const { test, expect } = require('@playwright/test');

// 每个 test 都从空白页开始，goto('/') 即 index.html
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // 等编辑器就绪
  await page.waitForSelector('#editor[contenteditable]');
});

// ─── 1. 页面正常加载，无 JS 报错 ───────────────────────────────────────────────
test('页面加载无 JS 报错，编辑器和预览区存在', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  // 重新加载并等待初始化完成
  await page.reload();
  await page.waitForSelector('#editor[contenteditable]');
  await page.waitForSelector('#preview');

  expect(errors, `JS 报错：${errors.join('\n')}`).toHaveLength(0);

  await expect(page.locator('#editor')).toBeVisible();
  await expect(page.locator('#preview')).toBeVisible();
});

// ─── 2. 恶意 HTML 粘贴后，预览区被清洗 ────────────────────────────────────────
test('恶意 HTML 注入预览后 script / onerror 被清洗', async ({ page }) => {
  await page.evaluate(() => {
    // 把安全内容放在恶意内容之前，避免 Chrome contenteditable 在 <script> 之后吞掉段落
    // eslint-disable-next-line no-undef
    editor.innerHTML =
      '<p>安全内容</p>' +
      '<img src=x onerror=alert(1)>' +
      '<script>alert("xss")<\\/script>';
    // eslint-disable-next-line no-undef
    updatePreview();
  });

  await page.waitForTimeout(400);

  const html = await page.locator('#preview').innerHTML();
  expect(html).not.toContain('<script');
  expect(html.toLowerCase()).not.toContain('onerror');
  // 通过 innerText 验证安全文本存在（WeChat 管道可能改变标签结构但不应删内容）
  const text = await page.locator('#preview').innerText();
  expect(text).toContain('安全内容');
});

// ─── 3. Markdown 解析正确 ──────────────────────────────────────────────────────
test('Markdown 解析为 h2 / strong / 列表项文本', async ({ page }) => {
  await page.evaluate(() => {
    const md = '## 标题\n**加粗文字**\n- 列表项';
    // eslint-disable-next-line no-undef
    editor.innerHTML = parseMD(md);
    // eslint-disable-next-line no-undef
    updatePreview();
  });

  await page.waitForTimeout(400);

  const preview = page.locator('#preview');
  await expect(preview.locator('h2').first()).toBeVisible();
  await expect(preview.locator('strong').first()).toBeVisible();
  // WeChat 兼容管道会把 <li> 转换成 <section> 结构，用文本内容验证而非标签
  await expect(preview.getByText('列表项')).toBeVisible();
});

// ─── 4. 样式名含引号，编辑弹窗里是纯文本不会注入 ─────────────────────────────
test('样式名含引号时 editStyle 不触发 HTML 注入', async ({ page }) => {
  const maliciousName = '" autofocus onfocus=alert(1) x="';

  // 直接写入 localStorage，绕过 UI 流程
  await page.evaluate((name) => {
    const entry = JSON.stringify([{
      name,
      // eslint-disable-next-line no-undef
      state: { ...STATE, mode: 'tutorial' },
      time: Date.now(),
    }]);
    localStorage.setItem('wx_formatter_styles', entry);
  }, maliciousName);

  // 监听意外弹出的 alert（如果注入成功会有）
  const alerts = [];
  page.on('dialog', async d => { alerts.push(d.message()); await d.dismiss(); });

  // 打开编辑弹窗
  await page.evaluate(() => {
    // eslint-disable-next-line no-undef
    editStyle(0);
  });

  await page.waitForSelector('#editStyleName', { timeout: 3000 });

  // 检查 input 的 value 是纯文本，没被解析为属性
  const inputValue = await page.locator('#editStyleName').inputValue();
  expect(inputValue).toBe(maliciousName);

  // 没有因注入触发 alert
  expect(alerts).toHaveLength(0);
});

// ─── 5. Clipboard API 不可用时复制按钮走 fallback，不崩 ──────────────────────
test('Clipboard API 不可用时一键复制不崩溃', async ({ page }) => {
  // 屏蔽 Clipboard API
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  // dialog 可能是"复制失败"提示，接受即可
  page.on('dialog', async d => await d.dismiss());

  await page.locator('#copyBtn').click();
  await page.waitForTimeout(600);

  // 核心断言：没有抛出 JS 错误
  expect(errors, `JS 报错：${errors.join('\n')}`).toHaveLength(0);
});

// ─── 6. 导入内容不是合法 JSON → 弹 JSON 格式错误 ─────────────────────────────
test('导入非法 JSON 文件弹格式错误提示', async ({ page }) => {
  const dialogs = [];
  page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    // eslint-disable-next-line no-undef
    page.evaluate(() => importStyleJSON()),
  ]);

  await fileChooser.setFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{bad json content'),
  });

  await page.waitForTimeout(500);
  expect(dialogs.some(d => /JSON|格式/.test(d))).toBe(true);
});

// ─── 7. 导入合法 JSON 但格式不对 → 弹"未识别"提示，页面不崩 ────────────────
test('导入格式不对的合法 JSON 弹未识别提示', async ({ page }) => {
  const dialogs = [];
  page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.evaluate(() => importStyleJSON()),
  ]);

  await fileChooser.setFiles({
    name: 'wrong.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"foo":"bar","num":42}'),
  });

  await page.waitForTimeout(500);
  expect(dialogs.some(d => /未识别|格式|JSON/.test(d))).toBe(true);
});
