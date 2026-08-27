# Disionario de Elefen — LFN 词典 Web（MVP）

Lingua Franca Nova（Elefen）词典 Web 界面。29,309 词条，数据来自
[elefen.org 官方词典](https://elefen.org/disionario/)。

## 技术栈

- **Astro**（静态生成，GitHub Pages 直出）
- **Svelte 5**（搜索交互岛屿）
- **shadcn-svelte** 组件（Input / Card / Badge / ScrollArea，Tailwind v4）

## 本地开发

```bash
pnpm install
pnpm dev          # 或 astro dev --background（后台模式）
pnpm build        # 输出 dist/
pnpm preview      # 本地预览构建产物
```

## 部署到 GitHub Pages

1. 改 `astro.config.mjs` 里的 `site` / `base`（当前是占位 `https://USERNAME.github.io` / `/lfn-dict-web`）：
   - `site` = `https://<你的用户名>.github.io`
   - `base` = `/` + 你的仓库名（如 `/<repo>`）
2. 推送仓库到 GitHub（main 分支）。
3. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
4. `.github/workflows/deploy.yml` 会自动构建并发布到 Pages。

## 数据

- `public/data/lfndict.json`（2.6 MB，紧凑格式 `词 → [{p:词类, d:定义, e:例句, n:发音}]`）
- `public/data/index.json`（词表索引）
- 数据由 `../../lfn-nushu-font/lfn_dict_convert.py` 从 elefen.org 最新词典生成，
  同时产出 StarDict（`.ifo/.idx/.dict`）、XDXF、CSV、JSON 四种开放格式。

## 离线（Kiwix）打包说明

Kiwix 需要内容打包成 ZIM（用 `zimwriterfs` 工具链），步骤：
1. 为每个词条预渲染一个 HTML 页面（或用本应用的完整构建产物）。
2. 构建搜索索引（Kiwix 全文索引或专用词典索引）。
3. `zimwriterfs` 打包 → `.zim` → 在 Kiwix 桌面/移动/浏览器扩展离线打开。

MVP 阶段用 GitHub Pages 迭代更快；Kiwix 适合发布成熟的离线包。
