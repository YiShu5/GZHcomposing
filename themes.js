// ===================================================================
// STATE
// ===================================================================
const DEFAULT_MODE_ID = 'ai-pocket-green';
const STATE = {
  mode: DEFAULT_MODE_ID,
  titleFont: 1,
  bodyFont: 0,
  colorScheme: 0, // index in COLOR_SCHEMES; 0=哆啦A梦
  customColors: null,
  lineHeight: 1.85,
  paraSpacing: 1.2,
  isMobile: false,
  bg: 'plain',
  // 题头(意疏的样式 Hero)：card=整张题头卡开关；brand=品牌件(栏目/月份/头像/底部标签)开关；其余为可改文字/头像
  aiPocket: {
    card: true,
    brand: true,
    column: '意疏的AI口袋',
    month: '',
    footer: '意疏的AI口袋',
    tag1: 'AI 入口',
    tag2: '实测教程',
    avatar: ''
  }
};

const AI_POCKET_AVATAR_SRC = 'data:image/jpeg;base64,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';

// ===================================================================
// BACKGROUND TEXTURES
// ===================================================================
const BG_TEXTURES = [
  { id:'plain', name:'纯白', css:'#FFFFFF' },
  { id:'ivory-fiber', name:'暖米底', css:'radial-gradient(ellipse at 18% 22%, rgba(172,132,76,0.05) 0 0.7px, transparent 1.2px), radial-gradient(ellipse at 64% 40%, rgba(155,128,78,0.04) 0 0.7px, transparent 1.2px), repeating-linear-gradient(22deg, transparent 0 24px, rgba(170,150,110,0.012) 24px 25px), #F5F3F0', cssBgSize:'58px 56px, 68px 66px, 42px 42px' }
];

// ===================================================================
// FONT DEFINITIONS
// ===================================================================
const TITLE_FONTS = [
  { name: '阿里巴巴普惠体 Bold', stack: '"Alibaba PuHuiTi","PingFang SC","Microsoft YaHei",sans-serif', weight: 'bold' },
  { name: '思源黑体 Bold', stack: '"Source Han Sans SC","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif', weight: 'bold' },
  { name: '思源宋体 Bold', stack: '"Source Han Serif SC","Noto Serif SC","STSong","SimSun",serif', weight: 'bold' },
  { name: '苹方 Medium', stack: '"PingFang SC","Microsoft YaHei",sans-serif', weight: '500' },
  { name: '微软雅黑 Bold', stack: '"Microsoft YaHei","PingFang SC",sans-serif', weight: 'bold' },
  { name: '楷体', stack: '"STKaiti","KaiTi","楷体",serif', weight: 'normal' }
];
const BODY_FONTS = [
  { name: '思源黑体 Regular', stack: '"Source Han Sans SC","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif', weight: 'normal' },
  { name: '苹方 Regular', stack: '"PingFang SC","Microsoft YaHei",sans-serif', weight: 'normal' },
  { name: '思源宋体 Regular', stack: '"Source Han Serif SC","Noto Serif SC","STSong","SimSun",serif', weight: 'normal' },
  { name: '楷体', stack: '"STKaiti","KaiTi","楷体",serif', weight: 'normal' }
];

// ===================================================================
// COLOR SCHEMES
// ===================================================================
const COLOR_SCHEMES = [
  { name:'哆啦A梦', main:'#03ADF0', sub:'#E0F4FE', accent:'#F5C518', deep:'#016FAD', text:'#2B2B2B', bg:'#F5F3F0', gradient:'linear-gradient(135deg, #016FAD 0%, #03ADF0 50%, #F5C518 100%)' },
  { name:'AI 口袋绿', main:'#059669', sub:'#ECFDF5', accent:'#10B981', deep:'#065F46', text:'#374151', bg:'#FFFFFF', muted:'#9CA3AF', line:'#E5E7EB', paper:'#FAFAFA', gradient:'linear-gradient(90deg, #059669, #10B981)' }
];

// ===================================================================
// MODE DEFINITIONS
// ===================================================================
const MODES = [
  {
    id:'ai-pocket-green', name:'意疏的样式',
    desc:'AI 口袋 · 稳定日常',
    titleFont:1, bodyFont:0, color:0,
    lineHeight:1.85, paraSpacing:1.2,
    headingStyle:'ai-pocket',
    quoteStyle:'ai-pocket-note',
    hrStyle:'ai-pocket-line'
  },
  {
    id:'ai-pocket-card', name:'卡片精排',
    desc:'终端框 · 问题卡',
    titleFont:1, bodyFont:0, color:0,
    lineHeight:1.85, paraSpacing:1.2,
    headingStyle:'ai-pocket',
    quoteStyle:'ai-pocket-note',
    hrStyle:'ai-pocket-line'
  },
  {
    id:'brand-manual', name:'品牌手册',
    desc:'蓝金 · 克制高级',
    titleFont:1, bodyFont:0, color:0,
    lineHeight:1.85, paraSpacing:1.2,
    headingStyle:'left-bar-gold',
    quoteStyle:'left-bar-blue',
    hrStyle:'center-gold'
  }
];

const MODE_META = {
  'ai-pocket-green': { emoji:'🔵', color:'#03ADF0' },
  'ai-pocket-card': { emoji:'▣', color:'#016FAD' },
  'brand-manual': { emoji:'🔖', color:'#F5C518' },
};

const AI_POCKET_MODE_IDS = ['ai-pocket-green', 'ai-pocket-card'];
function isAiPocketModeId(id) {
  return AI_POCKET_MODE_IDS.includes(id);
}

// ===================================================================
// DEFAULT CONTENT
// ===================================================================
const DEFAULT_HTML = `<h1>我看个番茄小说的功夫，微信已经变成 AI 入口了</h1>
<p>这是「意疏的 AI 口袋」公众号排版器。默认使用 哆啦A梦蓝金教程风：标题有承诺感，步骤有编号，提示词有终端框，截图有相框。</p>
<h2>一种风格，直接写</h2>
<p>不用在十几种模板里反复横跳。AI 口袋蓝卡把字体、配色、标题、引用、分割线一次配齐，你只管写：</p>
<ul>
<li><strong>蓝金只标结构和关键概念</strong> — 页面更像移动端产品文档</li>
<li><strong>标题自动变成编号小节</strong> — 读者扫一眼就知道进度</li>
<li><strong>提示词自动变成终端框</strong> — 适合 AI 教程和 Agent 安装文</li>
<li><strong>截图自动套相框</strong> — 粘到公众号后台更稳</li>
</ul>
<h2>适合这类文章</h2>
<ul>
<li>我这一周在群里到底是什么状态？</li>
<li>我说过多少次“我草”？</li>
<li>我最近是在兴奋，焦虑，还是天天破防？</li>
</ul>
<h2>核心功能速览</h2>
<ul>
<li><strong>✨ 预处理</strong>（工具栏左）— 3 种文章类型一键梳理纯文本：保守整理 / 长文分层 / 教程步骤</li>
<li><strong>🎛 设计</strong>（工具栏中）— 插入大型设计组件（开篇引导、章节卡、结尾签名）</li>
<li><strong>📝 结尾</strong>（工具栏右）— 4 种风格的结尾卡片，自动跟随主题色</li>
<li><strong>💬 微信预览</strong>（预览栏右上）— 提前看到「粘到公众号会变什么样」，避免来回切窗口</li>
<li><strong>📋 一键复制到公众号</strong>（右下）— 所有样式自动转内联，公众号后台直接 Ctrl+V</li>
<li><strong>📤 导出</strong>（右下）— 支持 HTML / Markdown / JSON 样式三种导出</li>
</ul>
<blockquote>不用担心写一半丢稿子 —— 编辑器每 5 秒自动存一次，关页面前再存一次，7 天内重新打开会问你要不要恢复。改错了想反悔？按一下 Ctrl+Z 就回到上一步，最多能回退 60 步。</blockquote>
<h3>Markdown 语法支持</h3>
<p>常用 Markdown 全部支持：<strong>加粗</strong>、<em>斜体</em>、标题、引用、列表、代码块。从飞书 / Word / Notion 复制带 Markdown 的内容自动解析。</p>
<pre><code>// 示例代码块\nfunction hello() {\n  console.log('公众号排版，一键搞定');\n}</code></pre>
<hr>
<p>清空这段内容、开始创作吧。写完点右下角复制按钮，直接粘到公众号后台。</p>
<div data-ending-block="true" data-theme-component="ending" data-ending-type="3" style="margin-top:2em">
  <div data-ending-type="3" style="background:linear-gradient(135deg, rgba(30,58,95,0.12), rgba(15,23,42,0.05));border-radius:12px;padding:32px;text-align:center;margin:2em 0">
    <div data-theme-role="title" style="font-size:16px;font-weight:600;color:#1E3A5F;margin-bottom:8px">欢迎点赞 · 在看 · 转发</div>
    <div data-theme-role="meta" style="font-size:12px;color:#1E3A5F;opacity:0.52">你的支持是我创作的动力</div>
  </div>
</div>`;
