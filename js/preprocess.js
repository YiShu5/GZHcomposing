// === 智能预处理：纯文本/口播稿 → Markdown 结构化 / Markdown 解析器 ===

const PREPROCESS_MODE_CONFIG = {
  clean: {
    name: '保守整理',
    desc: '清理空行，识别明确标题、列表和引用，不主动新增小标题。'
  },
  longform: {
    name: '长文分层',
    desc: '适合观点文、随笔和复盘，按段落节奏补少量小标题。'
  },
  tutorial: {
    name: '教程步骤',
    desc: '强化步骤、清单、注意事项和常见问题，适合干货教程。'
  }
};

function isConservativeHeadingLine(text, prevLine = '', nextLine = '') {
  const s = String(text || '').trim();
  if (!s) return false;
  if (s.length > 24) return false;
  if (/[。！？!?；;]/.test(s)) return false;
  if (/[，,]/.test(s)) return false;
  if (/^(但|但是|而且|所以|因此|如果|因为|同时|然后|好像|这些|这个|这就|于是|不过|其实|只是|甚至)/.test(s)) return false;

  const prevBlank = !String(prevLine || '').trim();
  const nextBlank = !String(nextLine || '').trim();
  const isolated = prevBlank || nextBlank;
  const numberedHeading = /^(第?[一二三四五六七八九十百千万\d]{1,3}[章节部分条点、.．)）:：]\s*)\S+/.test(s);
  const compactColonHeading = /^[^:：]{2,10}[:：]$/.test(s) && !/[的了是在把被会让让人我们你我他她它]/.test(s.replace(/[:：]$/, ''));
  const commonLabelHeading = /^(前言|导语|引言|目录|摘要|背景|问题|方法|案例|步骤|清单|总结|小结|复盘|结论|写在最后|今日小结|核心观点|重点提示|注意事项)$/.test(s.replace(/[:：]$/, ''));
  const shortIsolatedTitle = isolated && s.length <= 12 && !/[的了是在把被会让]/.test(s) && !/[:：]$/.test(s);

  return numberedHeading || compactColonHeading || commonLabelHeading || shortIsolatedTitle;
}

function isModeHeadingLine(text, mode) {
  const s = String(text || '').trim().replace(/[:：]$/, '');
  if (!s || s.length > 28) return false;
  if (/[。！？!?；;，,]/.test(s)) return false;

  const tutorialLabels = /^(准备工作|前置准备|操作步骤|具体步骤|步骤一|步骤二|步骤三|第一步|第二步|第三步|第四步|注意事项|常见问题|避坑提醒|使用方法|实操流程|案例演示|最终效果)$/;
  const recommendLabels = /^(推荐理由|适合人群|不适合谁|核心亮点|主要优点|缺点不足|使用体验|购买建议|价格参考|总结|一句话总结|我的感受|真实体验)$/;
  const spokenLabels = /^(先说结论|说个重点|还有一点|换句话说|最后总结|讲个例子|重点来了)$/;

  if (mode === 'tutorial') return tutorialLabels.test(s);
  if (mode === 'recommend') return recommendLabels.test(s);
  if (mode === 'spoken') return spokenLabels.test(s);
  return false;
}

function summarizeHeadingCandidate(text) {
  let s = String(text || '').trim().replace(/[:：]\s*$/, '');
  if (!s || s.length > 42) return '';
  if (!/[:：]$/.test(String(text || '').trim())) return '';

  const keywordRules = [
    { re: /不适感|不舒服|不安|焦虑|压力/, title: '不适感' },
    { re: /另一件事|另一层问题/, title: '另一件事' },
    { re: /奇怪的结构|结构/, title: '奇怪结构' },
    { re: /AI的意义|意义/, title: 'AI的意义' },
    { re: /成本|效率|收入|消费/, title: '效率与成本' },
    { re: /总结|小结|复盘/, title: '小结' }
  ];
  const matched = keywordRules.find(rule => rule.re.test(s));
  if (matched) return matched.title;

  const parts = s.split(/[，,；;]/).map(x => x.trim()).filter(Boolean);
  let core = parts.length > 1 ? parts[parts.length - 1] : s;
  core = core
    .replace(/^(这就|这是|这些|这种|那就是|但是|但|所以|因此|然后|其实|只是|好像)/, '')
    .replace(/^(会让人|让人|让我们|让你|让他|让她|产生了?|形成了?|变成了?|带来了?|导致了?)/, '')
    .replace(/^(一个|一种|一件|很强的|很大的|很奇怪的|很明显的|真正的|了一个|了一种|了一件)/, '')
    .replace(/^(的|了|是)/, '')
    .trim();

  core = core.replace(/["""']/g, '').replace(/\s+/g, '');
  if (!core || core.length < 3) return '';
  if (/^(另一件事|一件事|一个问题|这个问题|这些变化)$/.test(core)) return '';
  return core.length > 12 ? core.slice(0, 12) : core;
}

function normalizePreprocessText(text) {
  return String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/ /g, ' ')
    .replace(/\t/g, '  ')
    .replace(/[ \f\v]+$/gm, '');
}

function splitLongPlainLine(line, maxLen) {
  const s = String(line || '').trim();
  if (s.length <= maxLen) return [s];
  const parts = s.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [s];
  const chunks = [];
  let current = '';
  parts.forEach(part => {
    const piece = part.trim();
    if (!piece) return;
    if (current && (current + piece).length > maxLen) {
      chunks.push(current);
      current = piece;
    } else {
      current += piece;
    }
  });
  if (current) chunks.push(current);
  return chunks.length ? chunks : [s];
}

function preparePreprocessLines(rawText, mode) {
  const sourceLines = normalizePreprocessText(rawText).split('\n');
  const lines = [];
  const maxLen = mode === 'spoken' ? 72 : 120;
  const shouldSplit = mode === 'spoken' || mode === 'longform';

  sourceLines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      lines.push('');
      return;
    }
    if (shouldSplit && !/^#{1,3}\s/.test(trimmed) && !/^```/.test(trimmed) && trimmed.length > maxLen) {
      splitLongPlainLine(trimmed, maxLen).forEach(part => lines.push(part));
      return;
    }
    lines.push(trimmed);
  });
  return lines;
}

function convertListLine(trimmed, mode) {
  if (/^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) return trimmed;

  const bulletMatch = trimmed.match(/^[·•●○–—▪▫►▶]\s*(.+)/);
  if (bulletMatch) return '- ' + bulletMatch[1];

  const orderedMatch = trimmed.match(/^(\d{1,2})[、.．)）]\s*(.+)/);
  if (orderedMatch) return `${orderedMatch[1]}. ${orderedMatch[2]}`;

  const bracketMatch = trimmed.match(/^[（(]([一二三四五六七八九十\d]{1,3})[）)]\s*(.+)/);
  if (bracketMatch) return `- ${bracketMatch[2]}`;

  const circledNumbers = '①②③④⑤⑥⑦⑧⑨⑩';
  const circledMatch = trimmed.match(/^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.+)/);
  if (circledMatch) return `${circledNumbers.indexOf(circledMatch[1]) + 1}. ${circledMatch[2]}`;

  const chineseOrder = ['第一', '第二', '第三', '第四', '第五', '第六', '第七', '第八', '第九', '第十'];
  const chineseMatch = trimmed.match(/^(第一|第二|第三|第四|第五|第六|第七|第八|第九|第十)[，,、]\s*(.+)/);
  if (chineseMatch && (mode === 'tutorial' || mode === 'longform')) {
    return `${chineseOrder.indexOf(chineseMatch[1]) + 1}. ${chineseMatch[2]}`;
  }

  const labeledMatch = trimmed.match(/^(优势|优点|缺点|亮点|适合|不适合|推荐理由|使用感受|价格|口感|质地|体验|注意事项|准备材料)[:：]\s*(.+)/);
  if (labeledMatch && (mode === 'recommend' || mode === 'tutorial')) {
    return `- **${labeledMatch[1]}**：${labeledMatch[2]}`;
  }

  return '';
}

function convertQuoteLine(trimmed, mode) {
  if (/^>\s/.test(trimmed)) return trimmed;

  const quoteMatch = trimmed.match(/^["「》【]\s*(.+)/);
  if (quoteMatch) {
    return '> ' + quoteMatch[1].replace(/["」】]\s*$/, '');
  }

  const labelQuote = trimmed.match(/^(注|提示|提醒|注意|重点|结论|金句|避坑)[:：]\s*(.+)/);
  if (labelQuote && (mode === 'tutorial' || mode === 'longform' || mode === 'spoken')) {
    return `> **${labelQuote[1]}**：${labelQuote[2]}`;
  }

  return '';
}

function inferHeadingForMode(text, mode) {
  const s = String(text || '').trim();
  if (!s || s.length < 18) return '';

  if (mode === 'longform' || mode === 'spoken') {
    const colonTitle = summarizeHeadingCandidate(s.endsWith('：') || s.endsWith(':') ? s : '');
    if (colonTitle) return colonTitle;
    const rules = [
      { re: /结论|总结|所以|因此|最后|归根到底|本质上/, title: '先说结论' },
      { re: /问题|痛点|困境|矛盾|难点|不适|焦虑|压力/, title: '问题浮现' },
      { re: /原因|因为|为什么|背后|来自|源于/, title: '背后的原因' },
      { re: /变化|趋势|正在|开始|越来越|已经/, title: '变化正在发生' },
      { re: /案例|比如|举个例子|具体来说/, title: '一个例子' },
      { re: /方法|做法|路径|策略|建议|可以这样/, title: '可以怎么做' }
    ];
    const matched = rules.find(rule => rule.re.test(s));
    // 只用规则命中或冒号标题；匹配不到就不插，避免抽正文首句当标题导致和正文重复
    return matched ? matched.title : '';
  }

  if (mode === 'tutorial') {
    const rules = [
      { re: /准备|材料|工具|账号|环境|前提/, title: '准备工作' },
      { re: /第一步|首先|先|打开|进入|点击|选择|填写|设置/, title: '操作步骤' },
      { re: /注意|不要|避免|坑|错误|失败|提醒/, title: '注意事项' },
      { re: /为什么|原因|原理|逻辑/, title: '原理说明' },
      { re: /完成|效果|结果|验证|检查/, title: '检查结果' }
    ];
    const matched = rules.find(rule => rule.re.test(s));
    return matched ? matched.title : '';
  }

  if (mode === 'recommend') {
    const rules = [
      { re: /推荐|喜欢|值得|入手|购买|安利/, title: '推荐理由' },
      { re: /适合|人群|场景|用来|拿来/, title: '适合谁' },
      { re: /优点|亮点|好处|优势|体验/, title: '核心亮点' },
      { re: /缺点|不足|问题|但是|不过/, title: '不足之处' },
      { re: /价格|预算|性价比|贵|便宜/, title: '价格参考' },
      { re: /总结|最后|总之|一句话/, title: '一句话总结' }
    ];
    const matched = rules.find(rule => rule.re.test(s));
    return matched ? matched.title : '';
  }

  return '';
}

function shouldInsertAutoHeading(mode, state, text) {
  if (mode === 'clean') return '';
  if (state.autoHeadingCount >= 5) return '';

  const title = inferHeadingForMode(text, mode);
  if (!title) return '';
  if (state.usedAutoHeadings && state.usedAutoHeadings.has(title)) return '';

  if (mode === 'longform') {
    if (state.paragraphCount === 0 || state.sinceHeading >= 2) return title;
    return '';
  }
  if (mode === 'spoken') {
    if (state.paragraphCount === 0 || state.sinceHeading >= 3) return title;
    return '';
  }
  if (mode === 'tutorial' || mode === 'recommend') {
    if (state.sinceHeading >= 2 || state.paragraphCount === 0) return title;
  }
  return '';
}

function pushBlank(result) {
  if (result.length && result[result.length - 1] !== '') result.push('');
}

function smartPreprocess() {
  const rawText = editor.innerText || '';
  if (!rawText.trim()) { alert('编辑器为空，请先输入内容'); return; }
  const cards = Object.entries(PREPROCESS_MODE_CONFIG).map(([key, item]) => `
      <div style="border:2px solid #e5e7eb;border-radius:8px;padding:14px;cursor:pointer" onclick="runSmartPreprocess('${key}')">
        <div style="font-size:14px;font-weight:800;color:#6B2303;margin-bottom:4px">${item.name}</div>
        <div style="font-size:12px;color:#888;line-height:1.6">${item.desc}</div>
      </div>
  `).join('');
  showModal(`
    <h3>智能预处理</h3>
    <p style="font-size:12px;color:#777;line-height:1.7;margin-bottom:14px">选择文章类型。所有方式都会尽量保留原文，只增加标题、列表、引用和段落结构。</p>
    <div style="display:grid;grid-template-columns:1fr;gap:10px">
      ${cards}
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="hideModal()">取消</button>
    </div>
  `);
}
function runSmartPreprocess(mode = 'clean') {
  if (mode === 'outline') mode = 'longform';

  // 保留媒体元素：遍历顶层子节点，把纯媒体块替换为占位符，文本块正常提取
  const mediaItems = []; // { marker, outerHTML }
  let rawText = '';
  for (const node of Array.from(editor.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      rawText += node.textContent;
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const mediaEls = node.matches('img,video,iframe')
      ? [node]
      : Array.from(node.querySelectorAll('img,video,iframe'));
    if (mediaEls.length > 0 && !node.textContent.trim()) {
      // 纯媒体块：存下来，插一行占位符
      const marker = `GZHMEDPL${mediaItems.length}`;
      mediaItems.push({ marker, outerHTML: node.outerHTML });
      rawText += `\n${marker}\n`;
    } else {
      rawText += (node.innerText || '') + '\n';
    }
  }

  rawText = rawText.trim();
  if (!rawText) { alert('编辑器为空，请先输入内容'); return; }
  // If already has markdown, warn
  const hasMd = /^#{1,3}\s/m.test(rawText) || /\*\*/.test(rawText) || /^```/m.test(rawText) || /^[-*+]\s/m.test(rawText) || /^\d+\.\s/m.test(rawText);
  if (hasMd && !confirm('检测到已有Markdown语法，是否继续预处理？')) return;

  const lines = preparePreprocessLines(rawText, mode);
  const result = [];
  let prevBlank = false;
  const state = {
    paragraphCount: 0,
    sinceHeading: 0,
    autoHeadingCount: 0,
    usedAutoHeadings: new Set()
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // Empty line -> preserve as blank
    if (!trimmed) {
      if (!prevBlank) result.push('');
      prevBlank = true;
      continue;
    }
    prevBlank = false;

    // Already markdown heading -> keep
    if (/^#{1,3}\s/.test(trimmed)) {
      result.push(trimmed);
      state.sinceHeading = 0;
      continue;
    }

    // Already markdown list -> keep
    if (/^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      result.push(trimmed);
      continue;
    }

    // Already blockquote -> keep
    if (/^>\s/.test(trimmed)) {
      result.push(trimmed);
      continue;
    }

    // Already code fence -> keep
    if (/^```/.test(trimmed)) {
      result.push(trimmed);
      continue;
    }

    const listLine = convertListLine(trimmed, mode);
    if (listLine) {
      result.push(listLine);
      continue;
    }

    const quoteLine = convertQuoteLine(trimmed, mode);
    if (quoteLine) {
      result.push(quoteLine);
      continue;
    }

    // Only promote lines with clear heading signals. Do not guess from ordinary sentences.
    const prevLine = (i > 0) ? lines[i - 1].trim() : '';
    const nextLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
    if (isConservativeHeadingLine(trimmed, prevLine, nextLine) || isModeHeadingLine(trimmed, mode)) {
      result.push('## ' + trimmed);
      state.sinceHeading = 0;
      continue;
    }

    const autoHeading = shouldInsertAutoHeading(mode, state, trimmed);
    if (autoHeading) {
      pushBlank(result);
      result.push('### ' + autoHeading);
      state.sinceHeading = 0;
      state.autoHeadingCount++;
      state.usedAutoHeadings.add(autoHeading);
    }

    // Regular paragraph
    result.push(trimmed);
    state.paragraphCount++;
    state.sinceHeading++;
  }

  const mdText = result.join('\n');
  // Parse MD and set as editor content
  const parsedHtml = parseMD(mdText);
  let finalHtml = sanitizeContentHTML(parsedHtml);

  // 把占位符还原成原始媒体元素
  mediaItems.forEach(({ marker, outerHTML }) => {
    // parseMD 会把占位符包进 <p>，先尝试整段替换
    finalHtml = finalHtml.replace(
      new RegExp('<p[^>]*>\\s*' + marker + '\\s*</p>', 'gi'),
      outerHTML
    );
    // 兜底：直接替换裸文本
    finalHtml = finalHtml.replace(marker, outerHTML);
  });

  editor.innerHTML = finalHtml;
  hideModal();
  scheduleUpdate();
}

// ===================================================================
// MARKDOWN PARSER (basic)
// ===================================================================
function parseMD(text) {
  const lines = text.split('\n');
  let html = '';
  let inCode = false;
  let codeLines = [];
  let inList = false;
  let listType = '';

  function closeList() {
    if (inList) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
      listType = '';
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Strip platform-specific TOC tags (@[toc], [TOC], [[toc]], etc.)
    if (/^@?\[{1,2}[Tt][Oo][Cc]\]{1,2}$/.test(line.trim())) continue;

    // Code block
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html += '<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>';
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList();
      html += '<hr>';
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (hMatch) {
      closeList();
      const level = hMatch[1].length;
      html += `<h${level}>${inlineFormat(hMatch[2])}</h${level}>`;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('> ')) {
      closeList();
      html += `<blockquote>${inlineFormat(line.trim().slice(2))}</blockquote>`;
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        html += '<ul>';
        inList = true;
        listType = 'ul';
      }
      html += `<li>${inlineFormat(ulMatch[1])}</li>`;
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        html += '<ol>';
        inList = true;
        listType = 'ol';
      }
      html += `<li>${inlineFormat(olMatch[1])}</li>`;
      continue;
    }

    closeList();

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Standalone image line: ![alt](url)
    const imgLineMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (imgLineMatch) {
      const safeSrc = sanitizeImageSrc(imgLineMatch[2]);
      if (safeSrc) {
        html += `<p><img src="${escapeAttr(safeSrc)}" alt="${escapeAttr(imgLineMatch[1])}" style="max-width:100%;display:block;height:auto;"></p>`;
      } else {
        html += `<p>${escapeHtml(line)}</p>`;
      }
      continue;
    }

    // Paragraph
    html += `<p>${inlineFormat(line)}</p>`;
  }
  if (inCode) {
    html += '<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>';
  }
  closeList();
  return html;
}

function inlineFormat(t) {
  // Handle inline images before escaping so URLs stay intact
  const imgs = [];
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt, src) => {
    const safeSrc = sanitizeImageSrc(src.trim());
    if (!safeSrc) return match;
    const placeholder = `\x00img${imgs.length}\x00`;
    imgs.push(`<img src="${escapeAttr(safeSrc)}" alt="${escapeAttr(alt)}" style="max-width:100%;display:block;height:auto;">`);
    return placeholder;
  });
  t = escapeHtml(t);
  imgs.forEach((img, i) => { t = t.replace(`\x00img${i}\x00`, img); });
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}
