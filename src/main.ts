import {
  Plugin,
  Modal,
  Setting,
  PluginSettingTab,
  App,
  Editor,
  MarkdownView,
  MarkdownFileInfo,
  Notice,
  TFile,
  TFolder,
  TAbstractFile,
  Menu,
  requestUrl,
  Platform,
} from "obsidian";

// ─── i18n ───────────────────────────────────────────────────────────

interface Translations {
  settingsTitle: string;
  basicTitle: string;
  imageFolderName: string;
  imageFolderNameDesc: string;
  linkStyle: string;
  linkStyleDesc: string;
  linkStyleMarkdown: string;
  linkStyleWikilink: string;
  showRenameModal: string;
  showRenameModalDesc: string;
  compressionTitle: string;
  enableCompression: string;
  enableCompressionDesc: string;
  maxImageWidth: string;
  maxImageWidthDesc: string;
  imageQuality: string;
  imageQualityDesc: string;
  displayTitle: string;
  autoResizeDisplay: string;
  autoResizeDisplayDesc: string;
  portraitWidth: string;
  portraitWidthDesc: string;
  maxDisplayWidth: string;
  maxDisplayWidthDesc: string;
  smartTitle: string;
  detectDuplicates: string;
  detectDuplicatesDesc: string;
  autoDownloadUrl: string;
  autoDownloadUrlDesc: string;
  automationTitle: string;
  autoCleanup: string;
  autoCleanupDesc: string;
  autoMove: string;
  autoMoveDesc: string;
  toolsTitle: string;
  batchOrganize: string;
  batchOrganizeDesc: string;
  batchOrganizeBtn: string;
  convertLinksOnly: string;
  convertLinksOnlyDesc: string;
  convertLinksOnlyBtn: string;
  modalTitle: string;
  modalHint: string;
  modalPlaceholder: string;
  modalSaveTo: string;
  modalFileName: string;
  modalConfirm: string;
  modalCancel: string;
  noActiveNote: string;
  pasteCancelled: string;
  pasteSkipRemaining: (remaining: number) => string;
  imageSaved: (count: number) => string;
  imageSavedPath: (path: string) => string;
  imagesFolderMoved: (path: string) => string;
  imagesFolderMoveFailed: (err: string) => string;
  cleanedUp: (count: number, path: string) => string;
  batchResult: (moved: number, skipped: number, failed: number) => string;
  linksConverted: (count: number) => string;
  batchOrganizeCommand: string;
  convertLinksCommand: string;
  duplicateFound: (name: string) => string;
  downloadingUrl: string;
  downloadFailed: (err: string) => string;
  compressed: (before: number, after: number) => string;
  ctxRename: string;
  ctxRevealFinder: string;
  ctxCopyPath: string;
  statusImages: (count: number) => string;
}

const zhCN: Translations = {
  settingsTitle: "Smart Paste Image - 设置",
  basicTitle: "基本设置",
  imageFolderName: "图片文件夹名",
  imageFolderNameDesc: "存放图片的子文件夹名称（默认 image）",
  linkStyle: "链接格式",
  linkStyleDesc: "插入图片时使用的链接格式",
  linkStyleMarkdown: "Markdown: ![alt](path)",
  linkStyleWikilink: "Wikilink: ![[filename]]",
  showRenameModal: "粘贴时弹窗命名",
  showRenameModalDesc: "粘贴图片时弹出输入框（含预览），输入图片描述后缀。关闭后直接用时间戳命名。",
  compressionTitle: "图片压缩",
  enableCompression: "启用图片压缩",
  enableCompressionDesc: "粘贴图片时自动压缩，减小文件体积",
  maxImageWidth: "最大宽度 (px)",
  maxImageWidthDesc: "超过此宽度的图片会被等比缩小（0 = 不限制）",
  imageQuality: "压缩质量",
  imageQualityDesc: "JPEG/WebP 压缩质量 0.1-1.0（1.0 = 无损，推荐 0.8）",
  displayTitle: "显示尺寸",
  autoResizeDisplay: "自动调整显示宽度",
  autoResizeDisplayDesc: "根据图片方向自动设置显示宽度：竖屏截图缩小显示，避免撑满页面",
  portraitWidth: "竖屏图片显示宽度 (px)",
  portraitWidthDesc: "竖屏图片（高 > 宽）的显示宽度，如手机截图（0 = 不限制）",
  maxDisplayWidth: "最大显示宽度 (px)",
  maxDisplayWidthDesc: "所有图片的最大显示宽度（0 = 不限制）",
  smartTitle: "智能功能",
  detectDuplicates: "重复图片检测",
  detectDuplicatesDesc: "粘贴时检查是否已有相同图片，避免重复存储，直接复用已有图片的链接",
  autoDownloadUrl: "粘贴 URL 自动下载图片",
  autoDownloadUrlDesc: "粘贴图片链接（http 开头的 .png/.jpg 等）时，自动下载图片到本地",
  automationTitle: "自动化",
  autoCleanup: "删除笔记时清理图片",
  autoCleanupDesc: "删除 .md 笔记时，自动删除对应的 image/<笔记名>/ 文件夹及其中所有图片",
  autoMove: "移动/重命名笔记时同步图片",
  autoMoveDesc: "移动或重命名笔记时，自动将对应的 image 文件夹移到新位置，并更新所有链接",
  toolsTitle: "工具",
  batchOrganize: "自动整理",
  batchOrganizeDesc: "一键整理：① 把散乱图片移到对应 note 的 image/ 文件夹 ② 当链接格式为 Markdown 时，把 ![[xxx.png]] 转换为标准 Markdown 链接",
  batchOrganizeBtn: "开始整理",
  convertLinksOnly: "仅转换链接格式",
  convertLinksOnlyDesc: "只将当前笔记中的 ![[图片]] wikilink 转换为 Markdown 相对路径链接，不移动文件",
  convertLinksOnlyBtn: "转换当前笔记",
  modalTitle: "图片命名",
  modalHint: "输入图片描述后缀（可选，直接回车跳过）",
  modalPlaceholder: "例如: 架构图、截屏、流程图...",
  modalSaveTo: "保存到",
  modalFileName: "文件名",
  modalConfirm: "确认",
  modalCancel: "取消",
  noActiveNote: "无法获取当前笔记信息",
  pasteCancelled: "已取消粘贴图片",
  pasteSkipRemaining: (n) => `已取消，跳过剩余 ${n} 张图片`,
  imageSaved: (n) => `已保存 ${n} 张图片`,
  imageSavedPath: (p) => `图片已保存: ${p}`,
  imagesFolderMoved: (p) => `图片文件夹已跟随笔记移动: ${p}`,
  imagesFolderMoveFailed: (e) => `移动图片文件夹失败: ${e}`,
  cleanedUp: (n, p) => `已清理 ${n} 张图片 (${p})`,
  batchResult: (moved, skipped, failed) => {
    let msg = `自动整理完成: 移动 ${moved} 张, 已在正确位置 ${skipped} 张`;
    if (failed > 0) msg += `, 失败 ${failed} 张`;
    return msg;
  },
  linksConverted: (n) => `已转换 ${n} 个链接为 Markdown 格式`,
  batchOrganizeCommand: "自动整理: 移动散乱图片 + 转换 wikilink",
  convertLinksCommand: "转换当前笔记: wikilink → Markdown 链接",
  duplicateFound: (name) => `检测到重复图片，复用已有文件: ${name}`,
  downloadingUrl: "正在下载图片...",
  downloadFailed: (e) => `图片下载失败: ${e}`,
  compressed: (before, after) => `图片已压缩: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
  ctxRename: "重命名图片",
  ctxRevealFinder: "在文件管理器中显示",
  ctxCopyPath: "复制图片路径",
  statusImages: (n) => `🖼 ${n}`,
};

const enUS: Translations = {
  settingsTitle: "Smart Paste Image - Settings",
  basicTitle: "Basic",
  imageFolderName: "Image folder name",
  imageFolderNameDesc: "Subfolder name for storing images (default: image)",
  linkStyle: "Link style",
  linkStyleDesc: "Link format to use when inserting images",
  linkStyleMarkdown: "Markdown: ![alt](path)",
  linkStyleWikilink: "Wikilink: ![[filename]]",
  showRenameModal: "Show naming dialog on paste",
  showRenameModalDesc: "Show a dialog with image preview to name the image when pasting. When off, images are named with timestamp only.",
  compressionTitle: "Compression",
  enableCompression: "Enable image compression",
  enableCompressionDesc: "Automatically compress pasted images to reduce file size",
  maxImageWidth: "Max width (px)",
  maxImageWidthDesc: "Images wider than this will be scaled down proportionally (0 = no limit)",
  imageQuality: "Compression quality",
  imageQualityDesc: "JPEG/WebP quality 0.1-1.0 (1.0 = lossless, recommended 0.8)",
  displayTitle: "Display Size",
  autoResizeDisplay: "Auto-resize display width",
  autoResizeDisplayDesc: "Automatically set display width based on image orientation: shrink portrait screenshots to avoid taking up the full page",
  portraitWidth: "Portrait image width (px)",
  portraitWidthDesc: "Display width for portrait images (height > width), e.g. phone screenshots (0 = no limit)",
  maxDisplayWidth: "Max display width (px)",
  maxDisplayWidthDesc: "Maximum display width for all images (0 = no limit)",
  smartTitle: "Smart Features",
  detectDuplicates: "Detect duplicate images",
  detectDuplicatesDesc: "Check for identical images when pasting to avoid duplicate storage, reusing existing files",
  autoDownloadUrl: "Auto-download image URLs",
  autoDownloadUrlDesc: "When pasting an image URL (http .png/.jpg etc), automatically download and save locally",
  automationTitle: "Automation",
  autoCleanup: "Clean up images on note delete",
  autoCleanupDesc: "When a .md note is deleted, automatically delete its corresponding image/<note-name>/ folder",
  autoMove: "Sync images on note move/rename",
  autoMoveDesc: "When a note is moved or renamed, automatically move the corresponding image folder and update links",
  toolsTitle: "Tools",
  batchOrganize: "Auto organize",
  batchOrganizeDesc: "One-click: (1) Move scattered images to note image/ folders (2) When link style is Markdown, convert ![[]] wikilinks to Markdown links",
  batchOrganizeBtn: "Start organizing",
  convertLinksOnly: "Convert links only",
  convertLinksOnlyDesc: "Convert ![[image]] wikilinks in the current note to Markdown relative path links without moving files",
  convertLinksOnlyBtn: "Convert current note",
  modalTitle: "Name this image",
  modalHint: "Enter a description suffix (optional, press Enter to skip)",
  modalPlaceholder: "e.g. architecture, screenshot, diagram...",
  modalSaveTo: "Save to",
  modalFileName: "Filename",
  modalConfirm: "Confirm",
  modalCancel: "Cancel",
  noActiveNote: "Cannot detect the active note",
  pasteCancelled: "Image paste cancelled",
  pasteSkipRemaining: (n) => `Cancelled, skipping remaining ${n} image(s)`,
  imageSaved: (n) => `Saved ${n} image(s)`,
  imageSavedPath: (p) => `Image saved: ${p}`,
  imagesFolderMoved: (p) => `Image folder moved with note: ${p}`,
  imagesFolderMoveFailed: (e) => `Failed to move image folder: ${e}`,
  cleanedUp: (n, p) => `Cleaned up ${n} image(s) (${p})`,
  batchResult: (moved, skipped, failed) => {
    let msg = `Organize done: ${moved} moved, ${skipped} already in place`;
    if (failed > 0) msg += `, ${failed} failed`;
    return msg;
  },
  linksConverted: (n) => `Converted ${n} link(s) to Markdown format`,
  batchOrganizeCommand: "Auto organize: move images + convert wikilinks",
  convertLinksCommand: "Convert current note: wikilinks → Markdown links",
  duplicateFound: (name) => `Duplicate detected, reusing: ${name}`,
  downloadingUrl: "Downloading image...",
  downloadFailed: (e) => `Image download failed: ${e}`,
  compressed: (before, after) => `Compressed: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
  ctxRename: "Rename image",
  ctxRevealFinder: "Reveal in file explorer",
  ctxCopyPath: "Copy image path",
  statusImages: (n) => `🖼 ${n}`,
};

function getLocale(): Translations {
  const lang = document.documentElement.lang || navigator.language || "en";
  return lang.startsWith("zh") ? zhCN : enUS;
}

// ─── Settings ───────────────────────────────────────────────────────

interface PluginSettings {
  imageFolderName: string;
  linkStyle: "markdown" | "wikilink";
  showRenameModal: boolean;
  autoCleanupOnDelete: boolean;
  autoMoveOnRename: boolean;
  enableCompression: boolean;
  maxImageWidth: number;
  imageQuality: number;
  detectDuplicates: boolean;
  autoDownloadUrl: boolean;
  autoResizeDisplay: boolean;
  portraitDisplayWidth: number;
  maxDisplayWidth: number;
}

const DEFAULT_SETTINGS: PluginSettings = {
  imageFolderName: "image",
  linkStyle: "markdown",
  showRenameModal: true,
  autoCleanupOnDelete: true,
  autoMoveOnRename: true,
  enableCompression: false,
  maxImageWidth: 1920,
  imageQuality: 0.85,
  detectDuplicates: true,
  autoDownloadUrl: true,
  autoResizeDisplay: true,
  portraitDisplayWidth: 300,
  maxDisplayWidth: 600,
};

// ─── Helpers ─────────────────────────────────────────────────────────

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function getExtFromMime(mime: string): string {
  const base = mime.split(";")[0].trim().toLowerCase();
  const map: Record<string, string> = {
    "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif",
    "image/webp": "webp", "image/bmp": "bmp", "image/svg+xml": "svg",
  };
  return map[base] || "";
}

function getExtFromName(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

const IMG_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]);
const isImgExt = (ext: string) => IMG_EXTS.has(ext.toLowerCase());

function imgFolderPath(noteFile: TFile, folderName: string): string {
  const p = noteFile.parent?.path || "";
  return p ? `${p}/${folderName}/${noteFile.basename}` : `${folderName}/${noteFile.basename}`;
}

function imgFolderPathFromParts(parentPath: string, basename: string, folderName: string): string {
  return parentPath ? `${parentPath}/${folderName}/${basename}` : `${folderName}/${basename}`;
}

function relImgFolder(noteFile: TFile, folderName: string): string {
  return `${folderName}/${noteFile.basename}`;
}

const IMAGE_URL_RE = /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i;
const GENERIC_URL_RE = /^https?:\/\/.+/i;

function sanitizeFileName(name: string): string {
  return name.replace(/[\/\\:*?"<>|#^[\]]/g, "_").replace(/\s+/g, "-").trim();
}

function getImageDimensions(buf: ArrayBuffer, mimeType: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buf], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("load failed")); };
    img.src = url;
  });
}

async function bufferHash(buf: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function computeDisplayWidth(
  dims: { width: number; height: number },
  settings: PluginSettings
): number {
  if (!settings.autoResizeDisplay) return 0;
  const isPortrait = dims.height > dims.width;
  if (isPortrait && settings.portraitDisplayWidth > 0) return settings.portraitDisplayWidth;
  if (settings.maxDisplayWidth > 0 && dims.width > settings.maxDisplayWidth) return settings.maxDisplayWidth;
  return 0;
}

// ─── Image Naming Modal ─────────────────────────────────────────────

interface ModalResult { suffix: string; cancelled: boolean; }

class ImageSuffixModal extends Modal {
  private resolve: (value: ModalResult) => void;
  private resolved = false;
  private inputValue = "";
  private imageBlob: Blob | null;
  private targetPath: string;
  private blobUrl: string | null = null;
  private t: Translations;

  constructor(app: App, resolve: (value: ModalResult) => void, imageBlob: Blob | null, targetPath: string) {
    super(app);
    this.resolve = resolve;
    this.imageBlob = imageBlob;
    this.targetPath = targetPath;
    this.t = getLocale();
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("auto-image-folder-modal");
    contentEl.createEl("h3", { text: this.t.modalTitle });

    if (this.imageBlob) {
      this.blobUrl = URL.createObjectURL(this.imageBlob);
      const preview = contentEl.createDiv({ cls: "image-preview-container" });
      preview.style.cssText = "margin-bottom:12px;text-align:center;border-radius:6px;overflow:hidden;border:1px solid var(--background-modifier-border);background:var(--background-secondary)";
      const img = preview.createEl("img");
      img.src = this.blobUrl;
      img.style.cssText = "max-width:100%;max-height:200px;object-fit:contain;display:block;margin:0 auto";

      const infoEl = contentEl.createDiv();
      infoEl.style.cssText = "font-size:11px;color:var(--text-faint);text-align:center;margin-bottom:8px";
      const sizeKB = Math.round(this.imageBlob.size / 1024);
      const sizeStr = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      infoEl.setText(sizeStr);
      img.addEventListener("load", () => {
        infoEl.setText(`${img.naturalWidth} × ${img.naturalHeight}  ·  ${sizeStr}`);
      });
    }

    const pathEl = contentEl.createDiv();
    pathEl.style.cssText = "font-size:12px;color:var(--text-muted);margin-bottom:12px;word-break:break-all";
    pathEl.setText(`${this.t.modalSaveTo}: ${this.targetPath}`);
    contentEl.createEl("p", { text: this.t.modalHint, cls: "setting-item-description" });

    const inputEl = contentEl.createEl("input", { type: "text", placeholder: this.t.modalPlaceholder });
    inputEl.style.cssText = "width:100%;padding:8px;margin-bottom:4px;font-size:14px";

    const nameEl = contentEl.createDiv();
    nameEl.style.cssText = "font-size:12px;color:var(--text-muted);margin-bottom:12px";

    const updatePreview = () => {
      const ts = formatDateTime(new Date());
      const sanitized = sanitizeFileName(this.inputValue);
      const name = sanitized ? `${ts}-${sanitized}.png` : `${ts}.png`;
      nameEl.setText(`${this.t.modalFileName}: ${name}`);
    };
    updatePreview();

    inputEl.addEventListener("input", () => { this.inputValue = inputEl.value; updatePreview(); });
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); this.doResolve({ suffix: sanitizeFileName(this.inputValue), cancelled: false }); }
      else if (e.key === "Escape") { e.preventDefault(); this.doResolve({ suffix: "", cancelled: true }); }
    });

    const btns = contentEl.createDiv({ cls: "modal-button-container" });
    btns.createEl("button", { text: this.t.modalConfirm, cls: "mod-cta" })
      .addEventListener("click", () => this.doResolve({ suffix: sanitizeFileName(this.inputValue), cancelled: false }));
    btns.createEl("button", { text: this.t.modalCancel })
      .addEventListener("click", () => this.doResolve({ suffix: "", cancelled: true }));
    setTimeout(() => inputEl.focus(), 50);
  }

  private doResolve(result: ModalResult) {
    if (this.resolved) return;
    this.resolved = true;
    this.resolve(result);
    this.close();
  }

  onClose() {
    if (!this.resolved) {
      this.resolved = true;
      this.resolve({ suffix: "", cancelled: true });
    }
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
    this.contentEl.empty();
  }
}

// ─── Rename Modal ───────────────────────────────────────────────────

class RenameModal extends Modal {
  private resolve: (value: string | null) => void;
  private resolved = false;
  private currentName: string;

  constructor(app: App, currentName: string, resolve: (value: string | null) => void) {
    super(app);
    this.currentName = currentName;
    this.resolve = resolve;
  }

  onOpen() {
    const { contentEl } = this;
    const t = getLocale();
    contentEl.createEl("h3", { text: t.ctxRename });

    const inputEl = contentEl.createEl("input", { type: "text", value: this.currentName });
    inputEl.style.cssText = "width:100%;padding:8px;margin-bottom:12px;font-size:14px";
    inputEl.select();

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); this.doResolve(sanitizeFileName(inputEl.value) || null); }
      else if (e.key === "Escape") { e.preventDefault(); this.doResolve(null); }
    });

    const btns = contentEl.createDiv({ cls: "modal-button-container" });
    btns.createEl("button", { text: t.modalConfirm, cls: "mod-cta" })
      .addEventListener("click", () => this.doResolve(sanitizeFileName(inputEl.value) || null));
    btns.createEl("button", { text: t.modalCancel })
      .addEventListener("click", () => this.doResolve(null));
    setTimeout(() => inputEl.focus(), 50);
  }

  private doResolve(val: string | null) {
    if (this.resolved) return;
    this.resolved = true;
    this.resolve(val);
    this.close();
  }

  onClose() {
    if (!this.resolved) { this.resolved = true; this.resolve(null); }
    this.contentEl.empty();
  }
}

// ─── Main Plugin ────────────────────────────────────────────────────

export default class AutoImageFolderPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private t: Translations = enUS;
  private statusBarEl: HTMLElement | null = null;
  private statusBarTimer: ReturnType<typeof setTimeout> | null = null;

  onunload() {
    if (this.statusBarTimer) clearTimeout(this.statusBarTimer);
  }

  async onload() {
    await this.loadSettings();
    this.t = getLocale();
    this.addSettingTab(new AutoImageFolderSettingTab(this.app, this));

    this.addRibbonIcon("image-file", this.t.batchOrganizeCommand, () => this.batchOrganize());

    this.statusBarEl = this.addStatusBarItem();
    const scheduleStatusUpdate = () => {
      if (this.statusBarTimer) clearTimeout(this.statusBarTimer);
      this.statusBarTimer = setTimeout(() => this.updateStatusBar(), 300);
    };
    this.registerEvent(this.app.workspace.on("file-open", scheduleStatusUpdate));
    this.registerEvent(this.app.workspace.on("active-leaf-change", scheduleStatusUpdate));
    this.registerEvent(this.app.vault.on("create", scheduleStatusUpdate));
    this.registerEvent(this.app.vault.on("delete", scheduleStatusUpdate));

    // Paste
    this.registerEvent(
      this.app.workspace.on("editor-paste", (evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
        if (evt.defaultPrevented) return;

        if (this.settings.autoDownloadUrl) {
          const text = evt.clipboardData?.getData("text/plain")?.trim();
          if (text && (IMAGE_URL_RE.test(text) || GENERIC_URL_RE.test(text))) {
            const files = evt.clipboardData?.files;
            if (!files || !Array.from(files).some((f) => f.type.startsWith("image/"))) {
              if (IMAGE_URL_RE.test(text)) {
                evt.preventDefault();
                this.handleUrlPaste(text, editor, info).catch((e) => console.error("Smart Paste Image: URL paste error", e));
                return;
              }
              this.tryDownloadAsImage(text, editor, info);
              return;
            }
          }
        }

        const files = evt.clipboardData?.files;
        if (!files || files.length === 0) return;
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (imageFiles.length === 0) return;
        evt.preventDefault();
        this.handleMultipleImages(imageFiles, editor, info).catch((e) => console.error("Smart Paste Image: paste error", e));
      })
    );

    // Drop
    this.registerEvent(
      this.app.workspace.on("editor-drop", (evt: DragEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
        if (evt.defaultPrevented) return;
        const files = evt.dataTransfer?.files;
        if (!files || files.length === 0) return;
        const imageFiles = Array.from(files).filter(
          (f) => f.type.startsWith("image/") || isImgExt(getExtFromName(f.name))
        );
        if (imageFiles.length === 0) return;
        evt.preventDefault();
        this.handleMultipleImages(imageFiles, editor, info).catch((e) => console.error("Smart Paste Image: drop error", e));
      })
    );

    // Context menu
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu: Menu, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const link = this.parseImageLinkAtCursor(line, cursor.ch);
        if (!link || !info.file) return;

        const resolved = this.app.metadataCache.getFirstLinkpathDest(link.fileName, info.file.path);
        if (!resolved) return;

        menu.addItem((item) =>
          item.setTitle(this.t.ctxRename).setIcon("pencil").onClick(() => this.renameImage(resolved))
        );
        menu.addItem((item) =>
          item.setTitle(this.t.ctxRevealFinder).setIcon("folder-open").onClick(() => {
            const adapter = this.app.vault.adapter as any;
            if (adapter.getBasePath) {
              const fullPath = `${adapter.getBasePath()}/${resolved.path}`;
              if (Platform.isMacOS) {
                (require("electron") as any).shell.showItemInFolder(fullPath);
              } else {
                (require("electron") as any).shell.openPath(fullPath.replace(/\/[^/]+$/, ""));
              }
            }
          })
        );
        menu.addItem((item) =>
          item.setTitle(this.t.ctxCopyPath).setIcon("copy").onClick(() => {
            navigator.clipboard.writeText(resolved.path);
            new Notice("Copied: " + resolved.path);
          })
        );
      })
    );

    // Note lifecycle
    this.registerEvent(
      this.app.vault.on("delete", (file: TAbstractFile) => {
        if (!this.settings.autoCleanupOnDelete) return;
        if (!(file instanceof TFile) || file.extension !== "md") return;
        this.cleanupImageFolder(file).catch((e) => console.error("Smart Paste Image: cleanup error", e));
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file: TAbstractFile, oldPath: string) => {
        if (!this.settings.autoMoveOnRename) return;
        if (!(file instanceof TFile) || file.extension !== "md") return;
        this.handleNoteRename(file, oldPath).catch((e) => console.error("Smart Paste Image: rename error", e));
      })
    );

    // Commands
    this.addCommand({ id: "batch-organize", name: this.t.batchOrganizeCommand, callback: () => this.batchOrganize() });
    this.addCommand({
      id: "convert-links-current-note", name: this.t.convertLinksCommand,
      editorCallback: (_editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
        if (ctx.file) this.normalizeImageLinksInNote(ctx.file, true);
      },
    });

    this.updateStatusBar();
  }

  // ─── Status bar (debounced) ──────────────────────────────────────

  private updateStatusBar() {
    if (!this.statusBarEl) return;
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") { this.statusBarEl.setText(""); return; }

    const folder = this.app.vault.getAbstractFileByPath(imgFolderPath(file, this.settings.imageFolderName));
    const count = folder instanceof TFolder
      ? folder.children.filter((c) => c instanceof TFile && isImgExt(c.extension)).length
      : 0;
    this.statusBarEl.setText(this.t.statusImages(count));
  }

  // ─── URL paste ───────────────────────────────────────────────────

  private async handleUrlPaste(url: string, editor: Editor, info: MarkdownView | MarkdownFileInfo) {
    const noteFile = info.file;
    if (!noteFile) { new Notice(this.t.noActiveNote); return; }

    new Notice(this.t.downloadingUrl);
    try {
      const resp = await requestUrl({ url });
      const contentType = resp.headers["content-type"] || resp.headers["Content-Type"] || "";
      let ext = getExtFromMime(contentType);
      if (!ext) ext = getExtFromName(url.split("?")[0]);
      if (!ext || !isImgExt(ext)) ext = "png";

      const mimeType = contentType.split(";")[0].trim() || `image/${ext}`;
      const blob = new Blob([resp.arrayBuffer], { type: mimeType });
      const fakeFile = new File([blob], `download.${ext}`, { type: mimeType });
      const link = await this.processSingleImage(fakeFile, noteFile, 0, 1);
      if (link) editor.replaceSelection(link + "\n");
    } catch (e) {
      new Notice(this.t.downloadFailed(e instanceof Error ? e.message : String(e)));
    }
  }

  private tryDownloadAsImage(url: string, editor: Editor, info: MarkdownView | MarkdownFileInfo) {
    requestUrl({ url }).then(async (resp) => {
      const contentType = (resp.headers["content-type"] || resp.headers["Content-Type"] || "").split(";")[0].trim();
      if (!contentType.startsWith("image/")) return;
      const ext = getExtFromMime(contentType) || "png";
      const noteFile = info.file;
      if (!noteFile) return;

      new Notice(this.t.downloadingUrl);
      const blob = new Blob([resp.arrayBuffer], { type: contentType });
      const fakeFile = new File([blob], `download.${ext}`, { type: contentType });
      const link = await this.processSingleImage(fakeFile, noteFile, 0, 1);
      if (link) editor.replaceSelection(link + "\n");
    }).catch(() => { /* not an image URL, ignore silently */ });
  }

  // ─── Image paste/drop ────────────────────────────────────────────

  private async handleMultipleImages(imageFiles: File[], editor: Editor, info: MarkdownView | MarkdownFileInfo) {
    const activeFile = info.file;
    if (!activeFile) { new Notice(this.t.noActiveNote); return; }

    const links: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const result = await this.processSingleImage(imageFiles[i], activeFile, i, imageFiles.length);
      if (result === null) {
        new Notice(imageFiles.length > 1 ? this.t.pasteSkipRemaining(imageFiles.length - i) : this.t.pasteCancelled);
        break;
      }
      links.push(result);
    }

    if (links.length > 0) {
      editor.replaceSelection(links.join("\n") + "\n");
      if (links.length > 1) new Notice(this.t.imageSaved(links.length));
    }
  }

  private async processSingleImage(imageFile: File, noteFile: TFile, index: number, total: number): Promise<string | null> {
    let buf = await imageFile.arrayBuffer();
    let ext = getExtFromMime(imageFile.type) || getExtFromName(imageFile.name) || "png";
    let mimeForDims = imageFile.type || `image/${ext}`;
    const timestamp = formatDateTime(new Date());
    const folderPath = imgFolderPath(noteFile, this.settings.imageFolderName);
    const relFolder = relImgFolder(noteFile, this.settings.imageFolderName);

    // Compression
    const origSize = buf.byteLength;
    if (this.settings.enableCompression && !/gif|svg/.test(ext)) {
      try {
        const compressed = await this.compressImage(buf, mimeForDims);
        if (compressed.byteLength < origSize) {
          buf = compressed;
          ext = "jpg";
          mimeForDims = "image/jpeg";
        }
      } catch { /* keep original */ }
    }

    // Duplicate detection
    if (this.settings.detectDuplicates) {
      const dup = await this.findDuplicate(buf, folderPath);
      if (dup) {
        new Notice(this.t.duplicateFound(dup.name));
        let dw = 0;
        try { dw = computeDisplayWidth(await getImageDimensions(buf, mimeForDims), this.settings); } catch { /* ok */ }
        return this.formatImageLink(dup.basename, dup.name, `${relFolder}/${dup.name}`, dw);
      }
    }

    // Naming
    let suffix = "";
    if (this.settings.showRenameModal) {
      const label = total > 1 ? `${folderPath}  [${index + 1}/${total}]` : folderPath;
      const blob = new Blob([buf], { type: mimeForDims });
      const result = await this.promptSuffix(blob, label);
      if (result.cancelled) return null;
      suffix = result.suffix;
    }

    const fileName = suffix ? `${timestamp}-${suffix}.${ext}` : `${timestamp}.${ext}`;
    await this.ensureFolder(folderPath);

    let finalPath = `${folderPath}/${fileName}`;
    finalPath = this.deduplicatePath(finalPath, ext);
    await this.app.vault.createBinary(finalPath, buf);

    if (this.settings.enableCompression && buf.byteLength < origSize) {
      new Notice(this.t.compressed(origSize, buf.byteLength));
    }

    const finalName = finalPath.split("/").pop()!;
    const relPath = `${relFolder}/${finalName}`;
    new Notice(this.t.imageSavedPath(relPath));

    let dw = 0;
    try { dw = computeDisplayWidth(await getImageDimensions(buf, mimeForDims), this.settings); } catch { /* ok */ }
    return this.formatImageLink(suffix || finalName, finalName, relPath, dw);
  }

  // ─── Compression ─────────────────────────────────────────────────

  private compressImage(buf: ArrayBuffer, mimeType: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buf], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        const maxW = this.settings.maxImageWidth;
        if (maxW > 0 && width > maxW) { height = Math.round(height * (maxW / width)); width = maxW; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("no canvas ctx")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (result) => result ? result.arrayBuffer().then(resolve).catch(reject) : reject(new Error("toBlob null")),
          "image/jpeg",
          this.settings.imageQuality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img load fail")); };
      img.src = url;
    });
  }

  // ─── Duplicate detection ─────────────────────────────────────────

  private async findDuplicate(newBuf: ArrayBuffer, folderPath: string): Promise<TFile | null> {
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!(folder instanceof TFolder)) return null;

    const newHash = await bufferHash(newBuf);
    for (const child of folder.children) {
      if (!(child instanceof TFile) || !isImgExt(child.extension)) continue;
      if (child.stat.size !== newBuf.byteLength) continue;
      try {
        const existing = await this.app.vault.readBinary(child);
        if (await bufferHash(existing) === newHash) return child;
      } catch { /* skip */ }
    }
    return null;
  }

  // ─── Context menu ────────────────────────────────────────────────

  private parseImageLinkAtCursor(line: string, ch: number): { fileName: string } | null {
    // ![[filename.ext]] or ![[filename.ext|width]]
    const wikiRe = /!\[\[([^\]|]+\.(png|jpe?g|gif|webp|bmp|svg))(\|[^\]]+)?\]\]/gi;
    let m;
    while ((m = wikiRe.exec(line)) !== null) {
      if (ch >= m.index && ch <= m.index + m[0].length) return { fileName: m[1] };
    }
    // ![alt](path) or ![alt|width](path)
    const mdRe = /!\[([^\]]*)\]\(([^)]+\.(png|jpe?g|gif|webp|bmp|svg))\)/gi;
    while ((m = mdRe.exec(line)) !== null) {
      if (ch >= m.index && ch <= m.index + m[0].length) {
        const path = decodeURIComponent(m[2]);
        return { fileName: path.split("/").pop()! };
      }
    }
    return null;
  }

  private async renameImage(imageFile: TFile) {
    const newName = await new Promise<string | null>((resolve) => new RenameModal(this.app, imageFile.basename, resolve).open());
    if (!newName || newName === imageFile.basename) return;
    const newPath = imageFile.path.replace(imageFile.name, `${newName}.${imageFile.extension}`);
    await this.app.fileManager.renameFile(imageFile, newPath);
    new Notice(`Renamed: ${newName}.${imageFile.extension}`);
  }

  // ─── Note rename ─────────────────────────────────────────────────

  private async handleNoteRename(file: TFile, oldPath: string) {
    const oldBasename = oldPath.split("/").pop()?.replace(/\.md$/, "") || "";
    const oldParent = oldPath.includes("/") ? oldPath.slice(0, oldPath.lastIndexOf("/")) : "";
    const oldImgFolder = imgFolderPathFromParts(oldParent, oldBasename, this.settings.imageFolderName);

    const oldFolder = this.app.vault.getAbstractFileByPath(oldImgFolder);
    if (!(oldFolder instanceof TFolder)) return;

    const newImgFolder = imgFolderPath(file, this.settings.imageFolderName);
    if (oldImgFolder === newImgFolder) return;

    try {
      await this.ensureFolder(newImgFolder);
      for (const child of [...oldFolder.children]) {
        if (child instanceof TFile) {
          await this.app.fileManager.renameFile(child, `${newImgFolder}/${child.name}`);
        }
      }

      const refreshed = this.app.vault.getAbstractFileByPath(oldImgFolder);
      if (refreshed instanceof TFolder && refreshed.children.length === 0) await this.app.vault.delete(refreshed);

      const oldParentImg = oldParent ? `${oldParent}/${this.settings.imageFolderName}` : this.settings.imageFolderName;
      const pf = this.app.vault.getAbstractFileByPath(oldParentImg);
      if (pf instanceof TFolder && pf.children.length === 0) await this.app.vault.delete(pf);

      // fileManager.renameFile updates links to vault-absolute paths; normalize them
      if (this.settings.linkStyle === "markdown") {
        await this.normalizeImageLinksInNote(file, false);
      }

      new Notice(this.t.imagesFolderMoved(newImgFolder));
    } catch (e) {
      console.error("Smart Paste Image: move failed", e);
      new Notice(this.t.imagesFolderMoveFailed(e instanceof Error ? e.message : String(e)));
    }
  }

  // ─── Note delete ─────────────────────────────────────────────────

  private async cleanupImageFolder(deletedFile: TFile) {
    const parentPath = deletedFile.parent?.path || "";
    const path = imgFolderPathFromParts(parentPath, deletedFile.basename, this.settings.imageFolderName);
    const folder = this.app.vault.getAbstractFileByPath(path);
    if (!(folder instanceof TFolder)) return;

    const resolvedLinks = this.app.metadataCache.resolvedLinks;
    const deletedNotePath = deletedFile.path;
    const referencedElsewhere = folder.children.some((child) => {
      if (!(child instanceof TFile)) return false;
      for (const [mdPath, links] of Object.entries(resolvedLinks)) {
        if (mdPath === deletedNotePath) continue;
        if (links[child.path]) return true;
      }
      return false;
    });

    if (referencedElsewhere) {
      console.log(`Smart Paste Image: skipping cleanup of ${path} — images still referenced by other notes`);
      return;
    }

    const count = folder.children.length;
    try {
      await this.app.vault.delete(folder, true);
      if (count > 0) new Notice(this.t.cleanedUp(count, path));
    } catch (e) { console.error("Smart Paste Image: cleanup error", e); }
  }

  // ─── Batch organize ──────────────────────────────────────────────

  async batchOrganize() {
    const resolvedLinks = this.app.metadataCache.resolvedLinks;
    const imageToNotes = new Map<string, string[]>();
    for (const [mdPath, links] of Object.entries(resolvedLinks)) {
      if (!mdPath.endsWith(".md")) continue;
      for (const linkedPath of Object.keys(links)) {
        if (!isImgExt(getExtFromName(linkedPath))) continue;
        const notes = imageToNotes.get(linkedPath) || [];
        notes.push(mdPath);
        imageToNotes.set(linkedPath, notes);
      }
    }

    let moved = 0, skipped = 0;
    const errors: string[] = [];
    const total = imageToNotes.size;
    let processed = 0;
    const progressNotice = total > 10 ? new Notice(`${this.t.batchOrganize}: 0/${total}...`, 0) : null;

    for (const [ip, notePaths] of imageToNotes) {
      processed++;
      if (progressNotice && processed % 5 === 0) {
        progressNotice.setMessage(`${this.t.batchOrganize}: ${processed}/${total}...`);
      }

      const imgFile = this.app.vault.getAbstractFileByPath(ip);
      if (!(imgFile instanceof TFile)) continue;

      const noteFile = this.app.vault.getAbstractFileByPath(notePaths[0]);
      if (!(noteFile instanceof TFile)) { errors.push(`${ip} → note not found`); continue; }

      const expected = imgFolderPath(noteFile, this.settings.imageFolderName);
      if (ip.startsWith(expected + "/")) { skipped++; continue; }

      try {
        await this.ensureFolder(expected);
        const target = this.deduplicatePath(`${expected}/${imgFile.name}`, imgFile.extension);
        if (this.app.vault.getAbstractFileByPath(target)) { errors.push(`${ip} → exists: ${target}`); continue; }
        await this.app.fileManager.renameFile(imgFile, target);
        moved++;
      } catch (e) {
        errors.push(`${ip} → ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    if (progressNotice) progressNotice.hide();
    new Notice(this.t.batchResult(moved, skipped, errors.length), 10000);
    if (errors.length > 0) {
      console.group("Smart Paste Image: organize errors");
      errors.forEach((e) => console.warn(e));
      console.groupEnd();
    }

    if (this.settings.linkStyle === "markdown") {
      const mdFiles = this.app.vault.getFiles().filter((f) => f.extension === "md");
      let totalConverted = 0;
      const linkNotice = mdFiles.length > 20 ? new Notice(`Normalizing links: 0/${mdFiles.length}...`, 0) : null;
      for (let i = 0; i < mdFiles.length; i++) {
        if (linkNotice && i % 10 === 0) linkNotice.setMessage(`Normalizing links: ${i}/${mdFiles.length}...`);
        totalConverted += await this.normalizeImageLinksInNote(mdFiles[i], false);
      }
      if (linkNotice) linkNotice.hide();
      if (totalConverted > 0) new Notice(this.t.linksConverted(totalConverted), 8000);
    }

    this.updateStatusBar();
  }

  // ─── Link normalization (wikilink → markdown + fix absolute paths) ──

  async normalizeImageLinksInNote(noteFile: TFile, showNotice: boolean): Promise<number> {
    let content = await this.app.vault.read(noteFile);
    const noteParent = noteFile.parent?.path || "";
    let totalFixed = 0;

    // Phase 1: Convert ![[file.ext]] and ![[file.ext|width]] to markdown
    const wikiRe = /!\[\[([^\]|]+\.(png|jpe?g|gif|webp|bmp|svg))(\|(\d+))?\]\]/gi;
    content = content.replace(wikiRe, (_match, fileName: string, _ext: string, _wg: string, widthStr: string) => {
      const resolved = this.app.metadataCache.getFirstLinkpathDest(fileName, noteFile.path);
      if (!resolved) return _match;
      const rel = this.toRelativePath(resolved.path, noteParent);
      const encoded = rel.split("/").map((s) => encodeURIComponent(s)).join("/");
      const alt = widthStr ? `${resolved.basename}|${widthStr}` : resolved.basename;
      totalFixed++;
      return `![${alt}](${encoded})`;
    });

    // Phase 2: Fix existing markdown image links with vault-absolute paths
    const mdImgRe = /!\[([^\]]*)\]\(([^)]+\.(png|jpe?g|gif|webp|bmp|svg))\)/gi;
    content = content.replace(mdImgRe, (match, alt: string, rawPath: string) => {
      const decodedPath = rawPath.split("/").map((s) => {
        try { return decodeURIComponent(s); } catch { return s; }
      }).join("/");

      const resolved = this.app.vault.getAbstractFileByPath(decodedPath);
      if (!resolved || !(resolved instanceof TFile)) {
        const byLink = this.app.metadataCache.getFirstLinkpathDest(decodedPath, noteFile.path);
        if (!byLink) return match;
        const rel = this.toRelativePath(byLink.path, noteParent);
        const encoded = rel.split("/").map((s) => encodeURIComponent(s)).join("/");
        if (encoded === rawPath) return match;
        totalFixed++;
        return `![${alt}](${encoded})`;
      }

      const rel = this.toRelativePath(resolved.path, noteParent);
      const encoded = rel.split("/").map((s) => encodeURIComponent(s)).join("/");
      if (encoded === rawPath) return match;
      totalFixed++;
      return `![${alt}](${encoded})`;
    });

    if (totalFixed > 0) {
      await this.app.vault.modify(noteFile, content);
      if (showNotice) new Notice(this.t.linksConverted(totalFixed), 5000);
    }
    return totalFixed;
  }

  private toRelativePath(absolutePath: string, noteParent: string): string {
    if (!noteParent) return absolutePath;
    if (absolutePath.startsWith(noteParent + "/")) {
      return absolutePath.slice(noteParent.length + 1);
    }
    const noteParts = noteParent.split("/");
    const fileParts = absolutePath.split("/");
    let common = 0;
    while (common < noteParts.length && common < fileParts.length - 1 && noteParts[common] === fileParts[common]) {
      common++;
    }
    const ups = noteParts.length - common;
    const remainder = fileParts.slice(common).join("/");
    return ups > 0 ? "../".repeat(ups) + remainder : remainder;
  }

  // ─── Link formatting ────────────────────────────────────────────

  private formatImageLink(altText: string, fileName: string, relativePath: string, displayWidth: number): string {
    if (this.settings.linkStyle === "wikilink") {
      return displayWidth > 0 ? `![[${fileName}|${displayWidth}]]` : `![[${fileName}]]`;
    }
    const encoded = relativePath.split("/").map((s) => encodeURIComponent(s)).join("/");
    const alt = displayWidth > 0 ? `${altText}|${displayWidth}` : altText;
    return `![${alt}](${encoded})`;
  }

  // ─── Utilities ───────────────────────────────────────────────────

  private promptSuffix(blob: Blob | null, targetPath: string): Promise<ModalResult> {
    return new Promise((resolve) => new ImageSuffixModal(this.app, resolve, blob, targetPath).open());
  }

  async ensureFolder(path: string) {
    if (this.app.vault.getAbstractFileByPath(path) instanceof TFolder) return;
    const parts = path.split("/");
    let cur = "";
    for (const p of parts) {
      cur = cur ? `${cur}/${p}` : p;
      if (!this.app.vault.getAbstractFileByPath(cur)) {
        try { await this.app.vault.createFolder(cur); } catch { /* race safe */ }
      }
    }
  }

  private deduplicatePath(basePath: string, ext: string): string {
    let path = basePath;
    let n = 1;
    const MAX = 999;
    while (this.app.vault.getAbstractFileByPath(path) && n < MAX) {
      const base = basePath.slice(0, basePath.length - ext.length - 1);
      path = `${base}-${n}.${ext}`;
      n++;
    }
    return path;
  }

  async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
  async saveSettings() { await this.saveData(this.settings); }
}

// ─── Settings Tab ───────────────────────────────────────────────────

class AutoImageFolderSettingTab extends PluginSettingTab {
  plugin: AutoImageFolderPlugin;
  constructor(app: App, plugin: AutoImageFolderPlugin) { super(app, plugin); this.plugin = plugin; }

  display() {
    const { containerEl } = this;
    const t = getLocale();
    containerEl.empty();

    containerEl.createEl("h2", { text: t.settingsTitle });

    containerEl.createEl("h3", { text: t.basicTitle });
    new Setting(containerEl).setName(t.imageFolderName).setDesc(t.imageFolderNameDesc)
      .addText((tx) => tx.setPlaceholder("image").setValue(this.plugin.settings.imageFolderName)
        .onChange(async (v) => { this.plugin.settings.imageFolderName = v || "image"; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t.linkStyle).setDesc(t.linkStyleDesc)
      .addDropdown((d) => d.addOption("markdown", t.linkStyleMarkdown).addOption("wikilink", t.linkStyleWikilink)
        .setValue(this.plugin.settings.linkStyle)
        .onChange(async (v) => { this.plugin.settings.linkStyle = v as any; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t.showRenameModal).setDesc(t.showRenameModalDesc)
      .addToggle((tg) => tg.setValue(this.plugin.settings.showRenameModal)
        .onChange(async (v) => { this.plugin.settings.showRenameModal = v; await this.plugin.saveSettings(); }));

    containerEl.createEl("h3", { text: t.compressionTitle });
    new Setting(containerEl).setName(t.enableCompression).setDesc(t.enableCompressionDesc)
      .addToggle((tg) => tg.setValue(this.plugin.settings.enableCompression)
        .onChange(async (v) => { this.plugin.settings.enableCompression = v; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t.maxImageWidth).setDesc(t.maxImageWidthDesc)
      .addText((tx) => tx.setValue(String(this.plugin.settings.maxImageWidth))
        .onChange(async (v) => { this.plugin.settings.maxImageWidth = parseInt(v) || 0; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t.imageQuality).setDesc(t.imageQualityDesc)
      .addText((tx) => tx.setValue(String(this.plugin.settings.imageQuality))
        .onChange(async (v) => { this.plugin.settings.imageQuality = Math.max(0.1, Math.min(1.0, parseFloat(v) || 0.85)); await this.plugin.saveSettings(); }));

    containerEl.createEl("h3", { text: t.displayTitle });
    new Setting(containerEl).setName(t.autoResizeDisplay).setDesc(t.autoResizeDisplayDesc)
      .addToggle((tg) => tg.setValue(this.plugin.settings.autoResizeDisplay)
        .onChange(async (v) => { this.plugin.settings.autoResizeDisplay = v; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t.portraitWidth).setDesc(t.portraitWidthDesc)
      .addText((tx) => tx.setValue(String(this.plugin.settings.portraitDisplayWidth))
        .onChange(async (v) => { this.plugin.settings.portraitDisplayWidth = parseInt(v) || 0; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t.maxDisplayWidth).setDesc(t.maxDisplayWidthDesc)
      .addText((tx) => tx.setValue(String(this.plugin.settings.maxDisplayWidth))
        .onChange(async (v) => { this.plugin.settings.maxDisplayWidth = parseInt(v) || 0; await this.plugin.saveSettings(); }));

    containerEl.createEl("h3", { text: t.smartTitle });
    new Setting(containerEl).setName(t.detectDuplicates).setDesc(t.detectDuplicatesDesc)
      .addToggle((tg) => tg.setValue(this.plugin.settings.detectDuplicates)
        .onChange(async (v) => { this.plugin.settings.detectDuplicates = v; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t.autoDownloadUrl).setDesc(t.autoDownloadUrlDesc)
      .addToggle((tg) => tg.setValue(this.plugin.settings.autoDownloadUrl)
        .onChange(async (v) => { this.plugin.settings.autoDownloadUrl = v; await this.plugin.saveSettings(); }));

    containerEl.createEl("h3", { text: t.automationTitle });
    new Setting(containerEl).setName(t.autoCleanup).setDesc(t.autoCleanupDesc)
      .addToggle((tg) => tg.setValue(this.plugin.settings.autoCleanupOnDelete)
        .onChange(async (v) => { this.plugin.settings.autoCleanupOnDelete = v; await this.plugin.saveSettings(); }));
    new Setting(containerEl).setName(t.autoMove).setDesc(t.autoMoveDesc)
      .addToggle((tg) => tg.setValue(this.plugin.settings.autoMoveOnRename)
        .onChange(async (v) => { this.plugin.settings.autoMoveOnRename = v; await this.plugin.saveSettings(); }));

    containerEl.createEl("h3", { text: t.toolsTitle });
    new Setting(containerEl).setName(t.batchOrganize).setDesc(t.batchOrganizeDesc)
      .addButton((b) => b.setButtonText(t.batchOrganizeBtn).setCta().onClick(() => this.plugin.batchOrganize()));
    new Setting(containerEl).setName(t.convertLinksOnly).setDesc(t.convertLinksOnlyDesc)
      .addButton((b) => b.setButtonText(t.convertLinksOnlyBtn).onClick(async () => {
        const f = this.app.workspace.getActiveFile();
        if (f) await this.plugin.normalizeImageLinksInNote(f, true);
        else new Notice(t.noActiveNote);
      }));
  }
}
