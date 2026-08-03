// 设计组件（开头框 / 小标题 / 结尾）应当能被 Backspace / Delete 整块删掉
// 回归：组件内部没有可编辑文本节点，光标停在边缘时浏览器无处可删 → 「删不掉的空框」
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
  await page.waitForTimeout(300);
}

// 把光标放到编辑器里最后一个空段落的开头
async function caretInLastEmptyParagraph(page) {
  await page.evaluate(() => {
    const blocks = Array.from(editor.children);
    const target = blocks.reverse().find(b => b.tagName === 'P' && !b.textContent.trim());
    const r = document.createRange();
    r.setStart(target, 0);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  });
}

test('Backspace 从后面的空段落删掉开头框', async ({ page }) => {
  await insertIntro(page);
  await expect(page.locator('#editor [data-theme-component="design-intro"]')).toHaveCount(1);

  await caretInLastEmptyParagraph(page);
  await page.locator('#editor').press('Backspace');
  await page.waitForTimeout(300);

  await expect(page.locator('#editor [data-theme-component="design-intro"]')).toHaveCount(0);
  await expect(page.locator('#preview [data-theme-component="design-intro"]')).toHaveCount(0);
  expect(page.errors).toEqual([]);
});

test('光标落在组件内部时，Backspace 也能整块删掉', async ({ page }) => {
  await insertIntro(page);

  await page.evaluate(() => {
    const intro = editor.querySelector('[data-theme-component="design-intro"]');
    const r = document.createRange();
    r.setStart(intro, 0);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  });
  await page.locator('#editor').press('Backspace');
  await page.waitForTimeout(300);

  await expect(page.locator('#editor [data-theme-component="design-intro"]')).toHaveCount(0);
  expect(page.errors).toEqual([]);
});

test('有文字的段落里按 Backspace 不会误删相邻组件', async ({ page }) => {
  await insertIntro(page);
  await page.evaluate(() => {
    const p = Array.from(editor.children).reverse().find(b => b.tagName === 'P');
    p.textContent = '正文文字';
    const r = document.createRange();
    r.setStart(p.firstChild, 0);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  });
  await page.locator('#editor').press('Backspace');
  await page.waitForTimeout(300);

  // 组件仍在，正文也没被吞
  await expect(page.locator('#editor [data-theme-component="design-intro"]')).toHaveCount(1);
  expect(page.errors).toEqual([]);
});
