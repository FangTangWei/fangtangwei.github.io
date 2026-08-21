---
layout:     post
title:      "Rime 输入法生态完全指南"
subtitle:   "从语音输入到拼音/音形方案、主题美化，同文输入法一站式配置"
date:       2026-09-19 12:00:00
author:     "FangTangWei"
header-img: "img/post-bg-android.jpg"
catalog:    true
tags:
    - Rime
    - 输入法
    - 语音输入
    - Android
---

Rime（中州韻輸入法引擎）是开源、跨平台的输入法框架。在 Android 上，它表现为**同文输入法 (Trime)**；在 Windows 上为**小狼毫 (Weasel)**；macOS 上为**鼠须管 (Squirrel)**。

> 本文重点：**如何在同文输入法中无缝集成高质量语音输入**，同时汇总所有主流输入方案、主题和工具，方便您一站式配置。

---

## 一、语音输入：让同文输入法开口说话

如果您希望在 Rime 上获得接近商业输入法的语音转文字体验，目前最成熟的方案是 **BiBi-Keyboard（"说点啥"）+ 专为联动修改的同文输入法**。这套组合让您可以在同文键盘上直接长按按键调用语音识别，无需切换到其他输入法。

### 1.1 核心组件

| 项目 | 作用 | 链接 |
|------|------|------|
| **BiBi-Keyboard** | 独立的智能语音输入法，支持 18 种语音引擎（含本地离线模型），通过悬浮球可在任意输入法上使用 | `https://github.com/BryceWG/BiBi-Keyboard` |
| **trime-bibi-keyboard** | 基于同文 3.3.9 的修改版，内置 AIDL 通信接口，可直接调用 BiBi-Keyboard 的识别能力 | `https://github.com/BryceWG/trime-bibi-keyboard/releases/tag/3.3.9beta1` |

### 1.2 为什么选择这套方案？

- **高度集成**：修改版同文将语音输入变成键盘原生功能，不需要悬浮球，操作更流畅。
- **识别质量好**：支持讯飞、百度、谷歌、本地 Vosk 等多种引擎，断网也能用。
- **低延迟**：AIDL 直接调用，比模拟按键更迅速。

### 1.3 详细配置步骤（必看）

1. **卸载原版同文**  
   - 修改版与原版包名相同，**必须彻底卸载**才能安装。  
   - **备份您的配置**：将 `/sdcard/rime/` 整个文件夹复制到其他目录，以防丢失。

2. **安装修改版同文**  
   - 从上述 Releases 下载 `trime-3.3.9-bibi.apk` 并安装。  
   - 安装后，前往系统设置 → 语言和输入法，启用该输入法并设为默认。

3. **安装 BiBi-Keyboard**  
   - 从 `https://github.com/BryceWG/BiBi-Keyboard/releases` 下载最新版 APK 安装。  
   - 打开 BiBi-Keyboard，按照引导授予**录音权限**和**悬浮窗权限**（如果需要悬浮球，但联动模式无需开启悬浮球）。

4. **开启联动开关（关键）**  
   - 打开**修改版同文** App → 点击「常规」→ 找到 **"与「说点啥」联动"**，将其开启。  
   - 打开 **BiBi-Keyboard** App → 点击「输入设置」→ 开启 **"允许外部输入法联动 AIDL"**。

5. **设置调用方式**  
   - 在同文输入法的「键盘设置」或「按键绑定」中，将语音输入映射到您习惯的按键（例如**长按空格键**、**长按逗号**，或单独设一个语音键）。  
   - 也可以使用 BiBi-Keyboard 自带的悬浮球（不推荐，因为联动模式已集成）。

6. **测试生效**  
   - 在任意输入框调出同文键盘，长按您设置的按键，即可看到语音识别界面弹出，说话后文字会直接上屏。

### 1.4 常见问题与优化

- **无法弹出语音界面**：检查是否授予录音权限，以及两个 App 的联动开关是否同时打开。
- **识别不准确**：在 BiBi-Keyboard 中更换识别引擎（推荐"讯飞"或"本地 Vosk"），并下载对应离线包。
- **占用空间**：本地语音模型较大（约 200MB），可在 BiBi-Keyboard 内按需下载。
- **与原有配置冲突**：修改版同文与普通版的配置文件结构相同，恢复备份后一般可以正常使用。

> 💡 如果您不想更换同文版本，也可以单独使用 BiBi-Keyboard 的悬浮球功能，它可在任何输入法（包括原版同文）上工作，但体验不如深度集成流畅。

---

## 二、拼音类输入方案（按推荐度排序）

这些方案需要安装在 Rime 客户端（如同文、小狼毫）中使用，选择其中一个即可。

### 2.1 白霜拼音 (Rime-Frost)

当前评测中**整句输入准确率最高**的方案，词频基于 7.45 亿高质量语料重新统计，效果已超越关闭云拼音的商业输入法。

- `https://github.com/gaboolic/rime-frost`
- `https://github.com/gaboolic/rime-frost/releases/download/nightly/rime-frost-schemas.zip`

### 2.2 万象拼音 (Wanxiang Pinyin)

功能最全面的方案之一，支持 8 种双拼、7 种辅助码、中英混输、带调拼音、快符命令等。词库经 AI 优化，并带有 200MB 的本地语法模型。

- `https://github.com/amzxyz/rime-wanxiang`
- `https://amzxyz.github.io/rime-wanxiang/`

### 2.3 雾凇拼音 (Rime-Ice)

开箱即用，配置周全，词库长期维护，支持 Emoji、拆字反查、日期时间输入等丰富功能。

- `https://github.com/iDvel/rime-ice`
- `https://github.com/iDvel/rime-ice/releases/latest/download/full.zip`

### 2.4 四叶草拼音 (Clover Pinyin)

目标接近搜狗拼音体验，融合了结巴分词、清华词库、搜狗细胞词库等优质词源。

- `https://github.com/fkxxyz/rime-cloverpinyin`

### 2.5 官方基础方案

- **朙月拼音 (Luna)**：`https://github.com/rime/rime-luna-pinyin`  
- **地球拼音 (Terra，带声调)**：`https://github.com/rime/rime-terra-pinyin`

---

## 三、音形 / 形码方案（高效盲打）

适合追求极致输入速度的用户，这些方案结合拼音和字形，大幅减少重码。

| 方案 | 特点 | 链接 |
|------|------|------|
| **小鹤音形 (Flypy)** | 国内最流行的音形方案 | `https://github.com/jqtmviyu/flypy` / `https://github.com/cubercsl/rime-flypy` |
| **星空键道 (XKJD)** | "顶功"方案，几乎不需选字 | `https://github.com/xkinput/Rime_JD` / `https://github.com/shewer/rime-jiandao` |
| **墨奇音形** | 支持多种双拼+多种辅助码，基于白霜词库 | `https://github.com/gaboolic/rime-shuangpin-fuzhuma` |
| **自然码 (ZRM)** | 老牌辅助码方案 | `https://github.com/ksqsf/rime-moran` |
| **五笔 86/98/新世纪** | 经典形码，支持极点码表 | `https://github.com/KyleBing/rime-wubi86-jidian` |

---

## 四、同文输入法主题（美化界面）

将下载的 `.trime.yaml` 主题文件放入 `/sdcard/rime/` 目录，然后在同文 App 中点击「部署」即可生效。

| 主题名称 | 特点 | 链接 |
|----------|------|------|
| **星天 (Astralwelkin)** | 暗色系，支持滑动操作，需 MiSans 字体 | `https://github.com/Wenti-D/Astralwelkin` |
| **单静主题 (Danjing)** | 简约风格系列 | `https://github.com/cxcn/danjing` |
| **同文风增强版** | 官方主题优化，多种大小/颜色可选 | `https://github.com/SivanLaai/rime-pure` |
| **Gboard 风格** | 仿 Google 键盘配色 | `https://github.com/blueset/trime-gboard-dark-colemak` |
| **Bamboo** | 一款清新主题 | `https://github.com/zbinlin/bamboo` |
| **trime-config 合集** | 社区收集的多款主题和布局 | `https://github.com/jacobax/trime-config` |

---

## 五、其他相关工具

| 项目 | 说明 | 链接 |
|------|------|------|
| **同文输入法官方版 (Trime)** | Android 官方客户端 | `https://github.com/osfans/trime` / `https://f-droid.org/en/packages/com.osfans.trime/` |
| **墨奇输入法 (Moqi IME)** | 独立 Android 输入法，内置白霜拼音 | `https://github.com/gaboolic/moqi-im-windows` |
| **小狼毫 (Weasel)** | Windows 版 Rime | `https://rime.im/` |

---

## 六、资源合集与参考

- **Awesome Rime** – 最全面的 Rime 方案和配置列表  
  `https://github.com/ayaka14732/awesome-rime`

- **Rime 方案评测报告** – 社区对主要拼音方案的横向对比（白霜拼音表现最优）  
  `https://github.com/gaboolic/rime-schema-compare/blob/main/report/latest.md`

---

## 七、快速上手总结

1. **安装修改版同文 + BiBi-Keyboard**，开启联动 → 即可拥有高质量语音输入。
2. **选择拼音方案**：推荐白霜（准确率最高）或万象（功能最全）。
3. **选择主题**：根据喜好下载 `.trime.yaml` 放入 `rime` 文件夹并部署。
4. **如需更多自定义**，可查阅 Awesome Rime 列表。

Happy typing!
