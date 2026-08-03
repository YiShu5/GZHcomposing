// 实时 Markdown：打「## 」+ 空格直接变标题（js/live-markdown.js）
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

// 清空编辑器并把光标放进空段落
async function focusEmpty(page) {
  await page.evaluate(() => {
    editor.innerHTML = '<p><br></p>';
    const p = editor.querySelector('p');
    const r = document.createRange();
    r.setStart(p, 0);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    editor.focus();
  });
}

test('打 # 空格变 H1，## 变 H2，### 变 H3', async ({ page }) => {
  for (const [marker, tag] of [['#', 'H1'], ['##', 'H2'], ['###', 'H3']]) {
    await focusEmpty(page);
    await page.keyboard.type(marker + ' ');
    await page.keyboard.type('标题内容');
    await page.waitForTimeout(150);

    const got = await page.evaluate(() => {
      const el = editor.firstElementChild;
      return { tag: el.tagName, text: el.textContent };
    });
    expect(got.tag).toBe(tag);
    // 标记本身要被吃掉，不能留在正文里
    expect(got.text).toBe('标题内容');
  }
  expect(page.errors).toEqual([]);
});

test('打 > 空格变引用，- 空格变无序列表，1. 空格变有序列表', async ({ page }) => {
  const cases = [['>', 'BLOCKQUOTE'], ['-', 'UL'], ['1.', 'OL']];
  for (const [marker, tag] of cases) {
    await focusEmpty(page);
    await page.keyboard.type(marker + ' ');
    await page.keyboard.type('一行字');
    await page.waitForTimeout(150);

    const got = await page.evaluate(() => {
      const el = editor.firstElementChild;
      return { tag: el.tagName, text: el.textContent };
    });
    expect(got.tag).toBe(tag);
    expect(got.text).toContain('一行字');
    expect(got.text).not.toContain('1.');
  }
  expect(page.errors).toEqual([]);
});

test('--- 回车变分割线，光标落到后面的新段落', async ({ page }) => {
  await focusEmpty(page);
  await page.keyboard.type('---');
  await page.keyboard.press('Enter');
  await page.keyboard.type('后面的正文');
  await page.waitForTimeout(150);

  const got = await page.evaluate(() => ({
    first: editor.firstElementChild.tagName,
    hrStyle: editor.querySelector('hr')?.getAttribute('data-hr-style'),
    tail: editor.lastElementChild.textContent,
  }));
  expect(got.first).toBe('HR');
  expect(got.hrStyle).toBe('basic-line');
  expect(got.tail).toBe('后面的正文');
  expect(page.errors).toEqual([]);
});

test('行中间的 # 不触发：正常输入井号不该变标题', async ({ page }) => {
  await focusEmpty(page);
  await page.keyboard.type('C# ');
  await page.keyboard.type('是一门语言');
  await page.waitForTimeout(150);

  const got = await page.evaluate(() => ({
    tag: editor.firstElementChild.tagName,
    text: editor.firstElementChild.textContent,
  }));
  expect(got.tag).toBe('P');
  expect(got.text).toContain('C#');
  expect(page.errors).toEqual([]);
});

test('四个井号不是合法标记，保持正文', async ({ page }) => {
  await focusEmpty(page);
  await page.keyboard.type('#### ');
  await page.keyboard.type('不是标题');
  await page.waitForTimeout(150);

  const got = await page.evaluate(() => ({
    tag: editor.firstElementChild.tagName,
    text: editor.firstElementChild.textContent,
  }));
  expect(got.tag).toBe('P');
  expect(got.text).toContain('####');
  expect(page.errors).toEqual([]);
});

test('代码块里打 # 空格不转标题', async ({ page }) => {
  await page.evaluate(() => {
    editor.innerHTML = '<pre><code>x</code></pre>';
    const code = editor.querySelector('code');
    const r = document.createRange();
    r.setStart(code.firstChild, 1);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    editor.focus();
  });
  await page.keyboard.press('Enter');
  await page.keyboard.type('# ');
  await page.waitForTimeout(150);

  const stillCode = await page.evaluate(() =>
    !!editor.querySelector('pre code') && !editor.querySelector('h1'));
  expect(stillCode).toBe(true);
  expect(page.errors).toEqual([]);
});

test('转换后可撤销，且预览跟着更新', async ({ page }) => {
  await focusEmpty(page);
  await page.keyboard.type('## 小标题');
  await page.waitForTimeout(900); // 等 debounce 入栈

  const beforeUndo = await page.evaluate(() => editor.firstElementChild.tagName);
  expect(beforeUndo).toBe('H2');

  const inPreview = await page.evaluate(() => {
    const pv = document.getElementById('preview');
    return pv ? pv.textContent.includes('小标题') : false;
  });
  expect(inPreview).toBe(true);
  expect(page.errors).toEqual([]);
});
