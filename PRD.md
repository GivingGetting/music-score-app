# Product Requirements Document
# 乐谱 · 乐曲 转换器 (MusicScore Web App)

**Version:** 1.0
**Date:** 2026-03-11
**Status:** In Development

---

## 1. 产品概述 (Product Overview)

### 1.1 产品愿景

一款面向音乐爱好者、学生和创作者的 Web 应用，通过 AI 技术打通音频与乐谱之间的双向转换壁垒，并在播放时实现乐谱音符的实时同步高亮，让用户真正"看见"音乐。

### 1.2 核心价值主张

| 用户痛点 | 本产品解决方案 |
|----------|---------------|
| 听到一段旋律，不知道如何记谱 | AI 自动将音频转录为乐谱 |
| 有乐谱但不会演奏，想听听效果 | 一键将乐谱合成为音频播放 |
| 练习时难以对照乐谱跟踪当前演奏位置 | 播放时音符实时高亮同步 |
| 乐谱编辑软件门槛高昂 | 直接编辑 MusicXML，即时预览 |

### 1.3 目标用户

- **音乐学习者**：初学者希望将耳熟能详的旋律转为乐谱练习
- **音乐创作者**：快速将哼唱灵感转为可编辑的乐谱草稿
- **音乐教育者**：展示乐谱与音频的对应关系，辅助教学
- **音乐爱好者**：欣赏乐谱与音频同步的可视化体验

---

## 2. 功能需求 (Functional Requirements)

### 2.1 核心功能模块

#### F1 — 音频转乐谱 (Audio → Score)

| ID | 需求描述 | 优先级 |
|----|----------|--------|
| F1-1 | 支持拖放或点击上传音频文件 | P0 |
| F1-2 | 支持格式：MP3、WAV、M4A、FLAC、OGG、WEBM | P0 |
| F1-3 | 支持麦克风实时录音并转录 | P0 |
| F1-4 | 通过 AI (Spotify basic-pitch) 进行音高检测与转录 | P0 |
| F1-5 | 将转录结果渲染为标准五线谱乐谱 | P0 |
| F1-6 | 显示转录进度状态提示 | P1 |
| F1-7 | 文件大小限制：≤ 50 MB | P1 |
| F1-8 | 不含音高的音频（纯节奏/噪音）给出友好错误提示 | P1 |

#### F2 — 乐谱转音频 (Score → Audio)

| ID | 需求描述 | 优先级 |
|----|----------|--------|
| F2-1 | 支持输入/粘贴 MusicXML 格式乐谱 | P0 |
| F2-2 | 编辑 MusicXML 后乐谱实时预览更新（防抖 600ms）| P0 |
| F2-3 | 使用 SoundFont 钢琴音色合成音频 | P0 |
| F2-4 | 在浏览器端完成音频合成（无需服务端渲染音频）| P0 |
| F2-5 | 支持自定义 BPM（40–240）| P1 |

#### F3 — 乐谱渲染 (Score Rendering)

| ID | 需求描述 | 优先级 |
|----|----------|--------|
| F3-1 | 使用 OSMD 渲染标准五线谱（SVG 格式）| P0 |
| F3-2 | 支持多小节、多声部乐谱渲染 | P0 |
| F3-3 | 响应式布局，乐谱宽度自适应容器 | P1 |
| F3-4 | 空状态占位提示 | P2 |

#### F4 — 同步播放 (Synchronized Playback)

| ID | 需求描述 | 优先级 |
|----|----------|--------|
| F4-1 | 播放时乐谱光标跟随当前音符位置推进 | P0 |
| F4-2 | 播放/暂停/停止控制 | P0 |
| F4-3 | 暂停后恢复播放，光标从暂停位置继续 | P0 |
| F4-4 | 停止后光标重置到起始位置 | P0 |
| F4-5 | BPM 滑块实时调整播放速度 | P1 |
| F4-6 | 音视频同步误差 < 80ms（人眼感知阈值）| P0 |
| F4-7 | 播放结束后自动重置状态 | P1 |

---

## 3. 非功能需求 (Non-Functional Requirements)

### 3.1 性能

| 指标 | 目标值 |
|------|--------|
| 音频转录响应时间（30s 音频）| ≤ 30s |
| 乐谱渲染时间 | ≤ 2s |
| 乐谱编辑防抖延迟 | 600ms |
| 音视频同步误差 | < 80ms |
| SoundFont 首次加载时间 | ≤ 10s（依网速）|

### 3.2 兼容性

- **浏览器**：Chrome 90+、Safari 15+、Firefox 88+、Edge 90+
- **设备**：桌面优先，移动端响应式支持
- **OS**：macOS、Windows、Linux

### 3.3 可用性

- 所有错误状态给出中文友好提示
- 加载状态给出进度反馈
- 操作按钮在不可用状态时禁用并降低透明度

---

## 4. 技术架构 (Technical Architecture)

### 4.1 系统架构图

```
Browser
├── React (Vite + TypeScript)
│   ├── OSMD          — 乐谱渲染 (SVG)
│   ├── Tone.js       — 音频合成 + Transport 时钟
│   ├── Zustand       — 全局状态管理
│   └── RAF Loop      — 同步引擎 (60fps cursor 驱动)
│
└── HTTP API ──────────────────────────────────┐
                                               │
FastAPI (Python)                               │
├── POST /transcribe   ←─ 音频文件 (multipart)─┘
│   ├── pydub          — 音频格式归一化
│   ├── basic-pitch    — AI 音高检测 (→ MIDI)
│   ├── pretty_midi    — MIDI 文件处理
│   └── music21        — MIDI → MusicXML
│
└── POST /synthesize   ←─ MusicXML (JSON)
    └── music21        — MusicXML → 音符时间表
```

### 4.2 数据流

**音频 → 乐谱：**
```
Audio Blob → /transcribe → { musicxml, notes[], bpm }
    → OSMD.load(musicxml) → 渲染乐谱
    → store.setScore(notes, bpm) → 准备播放
```

**乐谱 → 音频：**
```
MusicXML → /synthesize → { notes[], bpm }
    → Tone.Transport.schedule(notes)
    → Tone.Transport.start()
    → RAF: Transport.beat → OSMD cursor.next()
```

### 4.3 同步机制原理

```
Tone.Transport (audio thread)
      │  ticks / PPQ = currentBeat
      ▼
requestAnimationFrame (main thread, ~60fps)
      │  currentBeat >= note.start_beat ?
      ▼
OSMD cursor.next()  →  SVG 光标更新
```

---

## 5. 用户界面规范 (UI Specification)

### 5.1 页面布局

```
┌─────────────────────────────────────────────────┐
│              🎼 乐谱 · 乐曲 转换器               │  Header
│          音频转乐谱 · 乐谱转音频 · 同步跳动        │
├─────────────────────────────────────────────────┤
│  [🎙 音频→乐谱]  [🎹 乐谱→音频]                  │  Tab Bar
├───────────────────┬─────────────────────────────┤
│                   │                             │
│   Input Panel     │      Score Panel            │
│   (380px fixed)   │      (flex 1)               │
│                   │                             │
│  ┌─────────────┐  │   ┌───────────────────────┐ │
│  │  File Upload│  │   │                       │ │
│  └─────────────┘  │   │    五线谱乐谱           │ │
│  — 或 —           │   │    (OSMD SVG)          │ │
│  ┌─────────────┐  │   │                       │ │
│  │  录音按钮   │  │   └───────────────────────┘ │
│  └─────────────┘  │                             │
│                   ├─────────────────────────────┤
│  [状态提示]        │  ▶播放  ⏸暂停  ⏹停止  BPM─┤  Playback
└───────────────────┴─────────────────────────────┘
```

### 5.2 色彩规范

| Token | 值 | 用途 |
|-------|----|------|
| `--bg` | `#0f1117` | 页面背景 |
| `--surface` | `#1a1d27` | 面板背景 |
| `--accent` | `#6c63ff` | 主操作色（播放按钮、激活标签）|
| `--error` | `#e05c5c` | 错误提示、录音按钮 |
| `--warning` | `#e0a050` | 暂停按钮 |
| `--text` | `#e8eaf0` | 主文字 |
| `--text-muted` | `#8890a8` | 次要文字 |
| 乐谱区域背景 | `#ffffff` | OSMD 要求白底 |

---

## 6. API 规范 (API Specification)

### POST /transcribe

```
Request:  multipart/form-data
  audio: File  (mp3 | wav | m4a | ogg | webm)  max 50MB

Response 200:
{
  "musicxml": "<?xml version=\"1.0\"...",
  "bpm": 120.0,
  "time_signature": "4/4",
  "notes": [
    {
      "pitch_midi": 60,       // MIDI 音高编号
      "pitch_name": "C4",     // 音名
      "start_beat": 0.0,      // 从乐谱起点的 quarter-note offset
      "duration_beats": 1.0,
      "start_sec": 0.0,       // 秒数（基于 BPM 计算）
      "duration_sec": 0.5,
      "velocity": 80,         // 力度 0-127
      "measure": 1,           // 小节号
      "beat_in_measure": 1.0  // 小节内拍位
    }
  ]
}

Errors:
  413  文件过大（> 50MB）
  422  无法检测音高内容
  500  转录内部错误
```

### POST /synthesize

```
Request:  application/json
{
  "musicxml": "<?xml version=\"1.0\"...",
  "bpm_override": null   // 可选，覆盖乐谱内的 BPM
}

Response 200:
{
  "bpm": 120.0,
  "time_signature": "4/4",
  "total_duration_sec": 32.5,
  "notes": [ ...同上结构... ]
}

Errors:
  422  MusicXML 解析失败 / 无音符
```

---

## 7. 案例演示 (Use Case Demos)

以下为三个典型用户场景的完整操作流程与预期效果，可用于演示、测试验收及新成员 onboarding。

---

### Demo A — 哼唱旋律，生成乐谱

**场景：** 用户脑海中浮现一段旋律，想把它记录成乐谱。

**前置条件：** 浏览器有麦克风权限；后端服务运行中。

**操作步骤：**

```
1. 打开应用，默认进入「🎙 音频 → 乐谱」标签页
2. 点击「开始录音」，对麦克风哼唱旋律（建议 5–20 秒）
   示例旋律：do re mi fa sol la si do（C大调音阶）
3. 点击「停止录音」，录音预览条出现
4. 页面显示「正在转录音频，请稍候...」（约 5–15s）
5. 五线谱区域渲染出转录乐谱，8 个音符显示在五线谱上
6. 点击「▶ 播放」
   → 钢琴音色依次播放 do re mi fa sol la si do
   → 乐谱上红色光标依次跳过每个音符，与音频同步
7. 拖动 BPM 滑块从 120 调至 80
   → 播放速度变慢，光标跳动速度同步减慢
```

**预期结果：**

| 步骤 | 预期状态 |
|------|---------|
| 录音中 | 红点闪烁 + "录音中..." 提示 |
| 转录中 | 紫色 loading banner + spinner |
| 转录完成 | 乐谱渲染，播放控制栏出现 |
| 播放中 | 光标按节拍推进，与音频误差 < 80ms |
| 调速后 | 新 BPM 即时生效，无需重新播放 |

---

### Demo B — 粘贴乐谱，合成试听

**场景：** 用户从网上找到一段 MusicXML 格式乐谱（如《小星星》），想听听演奏效果。

**操作步骤：**

```
1. 切换至「🎹 乐谱 → 音频」标签页
2. 在左侧 MusicXML 编辑框中粘贴以下示例乐谱：
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN"
  "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <!-- 小星星第一句：C C G G A A G- -->
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome><beat-unit>quarter</beat-unit><per-minute>120</per-minute></metronome>
        </direction-type>
      </direction>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
    <!-- 第二句：F F E E D D C- -->
    <measure number="3">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
  </part>
</score-partwise>
```

```
3. 600ms 防抖后，右侧五线谱自动渲染出《小星星》第一段（4 小节）
4. 点击「▶ 播放」
   → 应用自动调用 /synthesize 解析音符时间表
   → Tone.js 以 120 BPM 合成钢琴音频播放
   → 光标依次跳过每个音符节拍
5. 在第 3 小节播放时按「⏸ 暂停」
   → 音频停止，光标停在当前位置
6. 再次点击「▶ 播放」
   → 从暂停处继续，不从头重播
7. 点击「⏹ 停止」
   → 音频停止，光标复位到第 1 小节
```

**预期结果：**

| 行为 | 预期 |
|------|------|
| 粘贴 XML 后 | 乐谱自动渲染，无需手动刷新 |
| 点击播放 | 首次播放前自动加载 SoundFont（约 5s），之后即时响应 |
| 暂停/继续 | 光标位置保持，从原位继续播放 |
| 停止 | 光标回到第 1 小节第 1 拍 |

---

### Demo C — 上传 MP3，修改乐谱，再播放

**场景：** 用户上传一首钢琴曲 MP3，AI 转录后发现某些音符有误，手动修改 MusicXML 再试听，验证改正效果。

**操作步骤：**

```
1. 「🎙 音频 → 乐谱」标签页 → 将 piano.mp3 拖入上传区
2. 转录完成，乐谱渲染出多小节内容
3. 切换至「🎹 乐谱 → 音频」标签页
   → 编辑框自动填充了刚才转录的 MusicXML
4. 在编辑框中定位到某个错误音符，例如将：
     <step>B</step><octave>4</octave>
   修改为：
     <step>A</step><octave>4</octave>
5. 600ms 后右侧乐谱实时更新，显示修改后的音符
6. 点击「▶ 播放」验证修改后的旋律是否正确
7. 调整 BPM 至 90，以较慢速度仔细核对每个音符
```

**验证要点：**

```
✓ 编辑框修改 → 乐谱实时预览更新（不闪烁、平滑重渲染）
✓ 修改后播放 → 音频以新音符播放（A音而非B音）
✓ 光标同步 → 新音符位置正确跳动
✓ 慢速播放 → BPM=90 时光标节奏与音频一致
```

---

### 错误场景演示

#### E1 — 上传无音高内容（鼓点/白噪音）

```
操作：上传一段纯鼓点 MP3 或白噪音文件
预期：显示红色 banner「⚠ Could not detect pitched content in audio」
乐谱区域：不变（维持空状态或之前的乐谱）
```

#### E2 — 粘贴格式错误的 XML

```
操作：在编辑框输入非法 XML（如缺少闭合标签）
预期：防抖 600ms 后，播放时调用 /synthesize 返回 422 错误
banner 显示：「⚠ Failed to parse MusicXML: ...」
乐谱渲染：OSMD 可能显示空白或保持上一个有效状态
```

#### E3 — 上传超大文件

```
操作：上传 > 50MB 的音频文件
预期：服务端返回 413，banner 显示「⚠ File too large (max 50 MB)」
```

---

### 演示环境搭建

```bash
# 1. 启动服务
cd /Users/donnaliu/Desktop/Liu/claude/music
./start.sh

# 2. 准备演示素材
#    Demo A：使用浏览器麦克风实时录音
#    Demo B：复制上方《小星星》MusicXML 片段粘贴
#    Demo C：任意钢琴单音旋律 MP3（建议 10–30s，单声部）

# 3. 访问地址
open http://localhost:5173
```

> **演示提示：** SoundFont 首次加载需 5–10 秒（从 CDN 获取钢琴采样），建议演示前先点击一次播放完成预加载，之后响应将即时。

---

## 8. 开发路线图 (Roadmap)

### v1.0 — 当前版本（已完成）

- [x] 音频上传/录音 → AI 转录 → 乐谱渲染
- [x] MusicXML 编辑器 → 乐谱预览
- [x] Tone.js + SoundFont 音频合成播放
- [x] RAF 驱动的 OSMD cursor 同步高亮
- [x] BPM 滑块实时调速
- [x] 响应式两栏布局

### v1.1 — 近期迭代

- [ ] 循环播放开关
- [ ] 导出 MusicXML / MIDI 文件
- [ ] 多音色选择（弦乐、木管等 SoundFont）
- [ ] 转录结果置信度显示
- [ ] 音频波形可视化（录音时）

### v1.2 — 中期迭代

- [ ] 多声部/和弦支持优化
- [ ] 乐谱编辑工具栏（添加/删除音符 GUI）
- [ ] 用户账户 + 乐谱云端保存
- [ ] 分享链接功能

### v2.0 — 长期规划

- [ ] 移动端 App（React Native）
- [ ] 实时协同编辑
- [ ] AI 风格迁移（将旋律转为指定风格的编曲）
- [ ] 视频导出（乐谱动画 + 音频合成）

---

## 8. 已知限制 (Known Limitations)

| 限制 | 说明 | 计划改善 |
|------|------|----------|
| 和弦识别精度 | basic-pitch 对复音内容精度有限 | v1.1 引入更强模型 |
| 长音频性能 | > 60s 音频转录时间较长 | 加进度条 + 分片处理 |
| SoundFont 首加载 | 需从 CDN 加载钢琴采样（~5-10s）| 本地缓存 + loading 状态 |
| Python 3.9 兼容 | 使用 `Optional[T]` 替代 `T \| None` | 升级到 Python 3.10+ |
| 无持久化 | 刷新后乐谱/状态丢失 | v1.2 云端存储 |

---

## 9. 启动说明 (Getting Started)

### 环境要求

- Node.js 18+
- Python 3.9+
- pip3

### 快速启动

```bash
# 克隆项目
cd /path/to/music

# 一键启动前后端
./start.sh

# 访问
# 前端: http://localhost:5173
# 后端 API 文档: http://localhost:8000/docs
```

### 手动启动

```bash
# 后端
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000

# 前端（新终端）
cd frontend
npm install
npm run dev
```

---

*文档版本: 1.0 | 最后更新: 2026-03-11*
