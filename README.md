# Smart Paste Image

An [Obsidian](https://obsidian.md) plugin that smartly organizes pasted and dropped images into structured subfolders — with auto-naming, compression, duplicate detection, and display sizing.

**No more scattered images in your vault root!**

[中文说明](#中文说明)

---

## Features

### Paste & Drop → Auto-organize
When you paste or drag-drop an image into a note, the plugin automatically saves it to:

```
<note-parent>/image/<note-name>/<timestamp>.png
```

For example, pasting into `2025-notes/my-note.md` saves the image to:
```
2025-notes/image/my-note/20260323-143052.png
```

### Naming Dialog with Preview
A dialog pops up showing:
- **Image preview** with dimensions and file size
- **Target path** — know exactly where it will be saved
- **Optional suffix** — add a description like "architecture" → `20260323-143052-architecture.png`

Press Enter to skip the suffix, or turn off the dialog entirely in settings.

### Image Compression
Optionally compress images on paste to reduce vault size:
- Configurable max width (default 1920px) — large images are scaled down proportionally
- Adjustable JPEG quality (0.1–1.0)
- Shows before/after file size

### Smart Display Sizing
Automatically adjusts image display width based on orientation:
- **Portrait images** (e.g. phone screenshots) are displayed at a smaller width (default 300px) to avoid filling the entire page
- **Landscape images** wider than the max display width are capped
- Works with both Markdown (`![alt|300](path)`) and Wikilink (`![[file|300]]`) syntax

### Duplicate Detection
When pasting an image, the plugin computes a SHA-256 hash and compares it with existing images in the target folder. If an identical image already exists, it reuses the existing file instead of creating a duplicate.

### Auto-download Image URLs
Paste a URL to an image (e.g. `https://example.com/photo.jpg`) and the plugin will:
- Download the image automatically
- Save it to the correct folder
- Insert the local link

Works with URLs that have explicit image extensions and also tries to detect image content-type for URLs without extensions.

### Note Lifecycle Sync
- **Move/rename a note** → the image folder follows automatically, links updated
- **Delete a note** → the image folder is cleaned up (with safety check: skips if other notes reference the images)

### Batch Organize
Already have scattered images? Run **Auto organize** from the Command Palette to:
1. Move all referenced images to their correct `image/<note-name>/` folders
2. Convert `![[image.png]]` wikilinks to `![alt](path)` Markdown links (when link style is set to Markdown)
3. Fix vault-absolute paths to note-relative paths (for VSCode compatibility)

Shows progress for large vaults.

### Context Menu
Right-click on an image link in the editor to:
- **Rename image** — rename the file and update all references
- **Reveal in file explorer** — open the image location in Finder/Explorer
- **Copy image path** — copy the vault path to clipboard

### Bilingual UI
The plugin detects your Obsidian language and shows UI in **English** or **Chinese** accordingly.

---

## Settings

### Basic
| Setting | Default | Description |
|---------|---------|-------------|
| Image folder name | `image` | Subfolder name (`image`, `images`, `assets`, etc.) |
| Link style | Markdown | `![alt](path)` or `![[filename]]` |
| Show naming dialog | On | Pop up naming dialog with preview on paste |

### Compression
| Setting | Default | Description |
|---------|---------|-------------|
| Enable compression | Off | Compress pasted images (JPEG) |
| Max width | 1920px | Scale down images wider than this |
| Quality | 0.85 | JPEG quality (0.1–1.0) |

### Display Size
| Setting | Default | Description |
|---------|---------|-------------|
| Auto-resize display | On | Auto-set display width by orientation |
| Portrait width | 300px | Display width for portrait images |
| Max display width | 600px | Cap for all images |

### Smart Features
| Setting | Default | Description |
|---------|---------|-------------|
| Detect duplicates | On | SHA-256 hash comparison to avoid duplicates |
| Auto-download URLs | On | Download image URLs on paste |

### Automation
| Setting | Default | Description |
|---------|---------|-------------|
| Clean up on delete | On | Delete image folder when note is deleted |
| Sync on rename | On | Move image folder when note is moved |

---

## Installation

### From Obsidian Community Plugins
1. Open Settings → Community Plugins → Browse
2. Search for **Smart Paste Image**
3. Install and enable

### Manual Installation
1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/acblbtpccc/obsidian-smart-paste-image/releases)
2. Create folder: `<vault>/.obsidian/plugins/smart-paste-image/`
3. Copy the files into that folder
4. Restart Obsidian → Settings → Community Plugins → Enable "Smart Paste Image"

### Build from Source
```bash
git clone https://github.com/acblbtpccc/obsidian-smart-paste-image.git
cd obsidian-smart-paste-image
npm install
npm run build
```

---

## VSCode Compatibility

When link style is set to **Markdown**, all image links use note-relative paths (e.g. `image/my-note/photo.jpg` instead of vault-absolute paths). This means images render correctly in VSCode's Markdown preview as well.

---

## Compatibility

- Obsidian v1.0.0+
- Desktop only (macOS, Windows, Linux)
- If you have **Paste Image Rename** or similar plugins installed, disable them to avoid conflicts

---

## License

MIT

---

<a id="中文说明"></a>
# 中文说明

一个 [Obsidian](https://obsidian.md) 插件，智能管理粘贴/拖拽的图片 — 自动整理到子文件夹、命名、压缩、去重、调整显示尺寸。

**告别 vault 根目录散乱的图片！**

---

## 功能

### 粘贴/拖拽 → 自动整理
粘贴或拖拽图片到笔记时，插件自动保存到：

```
<笔记所在目录>/image/<笔记名>/<时间戳>.png
```

### 带预览的命名弹窗
- **图片预览** — 显示图片尺寸和文件大小
- **目标路径** — 知道图片会保存到哪
- **可选后缀** — 输入描述如"架构图" → `20260323-143052-架构图.png`

### 图片压缩
- 可配置最大宽度（默认 1920px），超出自动等比缩小
- 可调 JPEG 压缩质量（0.1-1.0）
- 显示压缩前后文件大小

### 智能显示尺寸
根据图片方向自动调整显示宽度：
- **竖屏图片**（如手机截图）缩小显示（默认 300px），避免撑满页面
- **横屏图片**超过最大显示宽度时自动缩放

### 重复检测
粘贴时用 SHA-256 哈希比对，发现相同图片直接复用已有文件。

### 粘贴 URL 自动下载
粘贴图片链接（如 `https://example.com/photo.jpg`）时自动下载到本地。也支持没有扩展名的图片 URL（通过检测 content-type）。

### 笔记生命周期同步
- **移动/重命名笔记** → 图片文件夹自动跟着移动，链接自动更新
- **删除笔记** → 对应的图片文件夹自动清理（安全检查：其他笔记引用的图片不会删除）

### 自动整理（批量）
命令面板运行 **自动整理** 可以：
1. 把散乱图片移到对应 `image/<笔记名>/` 文件夹
2. 把 `![[图片.png]]` 转换为标准 Markdown 链接
3. 修正 vault 绝对路径为笔记相对路径（兼容 VSCode）

大 vault 会显示处理进度。

### 右键菜单
在编辑器中右键图片链接可以：
- **重命名图片** — 改名并自动更新所有引用
- **在文件管理器中显示** — 打开图片所在目录
- **复制图片路径**

### 中英文双语
自动检测 Obsidian 语言，界面显示对应的中文或英文。

---

## 设置项

### 基本
| 设置 | 默认值 | 说明 |
|------|--------|------|
| 图片文件夹名 | `image` | 子文件夹名称 |
| 链接格式 | Markdown | `![alt](path)` 或 `![[filename]]` |
| 粘贴时弹窗命名 | 开 | 粘贴图片时弹出带预览的命名窗口 |

### 压缩
| 设置 | 默认值 | 说明 |
|------|--------|------|
| 启用压缩 | 关 | 粘贴图片时自动压缩 |
| 最大宽度 | 1920px | 超出自动缩小 |
| 压缩质量 | 0.85 | JPEG 质量 0.1-1.0 |

### 显示尺寸
| 设置 | 默认值 | 说明 |
|------|--------|------|
| 自动调整显示宽度 | 开 | 根据方向自动设置 |
| 竖屏图片宽度 | 300px | 手机截图等竖屏图片的显示宽度 |
| 最大显示宽度 | 600px | 所有图片的最大显示宽度 |

### 智能功能
| 设置 | 默认值 | 说明 |
|------|--------|------|
| 重复检测 | 开 | SHA-256 哈希对比避免重复 |
| 自动下载 URL | 开 | 粘贴图片链接自动下载 |

### 自动化
| 设置 | 默认值 | 说明 |
|------|--------|------|
| 删除笔记时清理图片 | 开 | 删除笔记时自动清理图片 |
| 移动笔记时同步图片 | 开 | 重命名/移动时图片跟着走 |

---

## 安装

### 从 Obsidian 社区插件安装
1. 设置 → 第三方插件 → 浏览
2. 搜索 **Smart Paste Image**
3. 安装并启用

### 手动安装
1. 从 [最新 Release](https://github.com/acblbtpccc/obsidian-smart-paste-image/releases) 下载 `main.js` 和 `manifest.json`
2. 创建文件夹: `<vault>/.obsidian/plugins/smart-paste-image/`
3. 将文件放入该文件夹
4. 重启 Obsidian → 设置 → 第三方插件 → 启用

### 从源码构建
```bash
git clone https://github.com/acblbtpccc/obsidian-smart-paste-image.git
cd obsidian-smart-paste-image
npm install
npm run build
```

---

## VSCode 兼容

链接格式设为 **Markdown** 时，所有图片链接使用笔记相对路径（如 `image/my-note/photo.jpg`），VSCode 的 Markdown 预览可以正常显示。

---

## 兼容性

- Obsidian v1.0.0+
- 仅桌面端（macOS、Windows、Linux）
- 如已安装 **Paste Image Rename** 等类似插件，建议禁用以避免冲突

---

## License

MIT
