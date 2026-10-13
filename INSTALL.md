# Setup guide

Hide Trump isn't in any browser's extension store yet, so you install it by loading its folder directly. It takes about two minutes.

**Contents:** [Download](#step-1-download) · [Chrome](#google-chrome) · [Edge](#microsoft-edge) · [Brave](#brave) · [Opera](#opera) · [Vivaldi](#vivaldi) · [Arc](#arc) · [Firefox](#firefox-testing-only) · [Safari and phones](#safari-and-phones) · [Using it](#using-it) · [Updating](#updating) · [Uninstalling](#uninstalling) · [Troubleshooting](#troubleshooting)

| Browser | Works? |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi, Arc | ✅ Yes |
| Firefox | ⚠️ Only until you restart Firefox |
| Safari, iPhone, Android | ❌ Not yet |

---

## Step 1: Download

1. On the [repository page](https://github.com/davidschocke/hide-trump), click the green **Code** button, then **Download ZIP**.
2. Find `hide-trump-main.zip` in your Downloads folder.
3. **Unzip it.** On Windows, right-click → **Extract All**. On Mac, double-click it.
4. Move the unzipped `hide-trump-main` folder somewhere permanent, such as your Documents folder.

> ⚠️ **Keep the folder.** The browser runs the extension straight from this folder. If you delete or move it, the extension stops working.

You should end up with a folder that has `manifest.json` directly inside it. That's the folder you'll select in the next step.

---

## Step 2: Load it in your browser

### Google Chrome

1. Type `chrome://extensions` in the address bar and press Enter.
2. Turn on **Developer mode** (switch in the top-right corner).
3. Click **Load unpacked** (top-left).
4. Select the `hide-trump-main` folder and click **Select Folder**.
5. *Optional:* click the puzzle-piece icon 🧩 in the toolbar and pin **Hide Trump**.

### Microsoft Edge

1. Go to `edge://extensions`.
2. Turn on **Developer mode** (in the left sidebar, or at the bottom of the page on narrow windows).
3. Click **Load unpacked**.
4. Select the `hide-trump-main` folder.

### Brave

1. Go to `brave://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the `hide-trump-main` folder.

### Opera

1. Go to `opera://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the `hide-trump-main` folder.

### Vivaldi

1. Go to `vivaldi://extensions`.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the `hide-trump-main` folder.

### Arc

1. Go to `arc://extensions` (or open the Arc menu → **Extensions** → **Manage extensions**).
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the `hide-trump-main` folder.

### Firefox (testing only)

Firefox only runs extensions from its own store permanently. You can try Hide Trump, but **it's removed every time Firefox restarts** and you'd need to redo these steps.

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Open the `hide-trump-main` folder and select `manifest.json`.
4. Click the puzzle-piece icon 🧩 in the toolbar, find **Hide Trump**, and choose **Always Allow on All Sites**. Without this, Firefox may not let it run on pages.

### Safari and phones

Not supported yet.

- **Safari** needs the extension wrapped in a Mac/iPhone app and submitted to Apple.
- **Chrome on Android and iPhone** doesn't support extensions at all.

---

## Using it

1. Open any web page (or refresh tabs that were already open).
2. Click the **Hide Trump** button in the top-left corner.
3. The button turns red and shows how many items were hidden, e.g. **Show Trump (14 hidden)**.
4. Click it again to bring everything back.

The setting is shared across all your tabs and remembered between visits, so once it's on, it stays on as you browse.

---

## Updating

1. Download the new ZIP and unzip it (see [Step 1](#step-1-download)).
2. Replace your old `hide-trump-main` folder with the new one, keeping the same name and location.
3. Go to your browser's extensions page (e.g. `chrome://extensions`) and click the reload ↻ icon on the Hide Trump card.
4. Check that the version number on the card matches the new release.
5. **Refresh any open tabs.** Tabs that were open before the update keep running the old version until refreshed.

---

## Uninstalling

Go to your browser's extensions page, click **Remove** on the Hide Trump card, then delete the `hide-trump-main` folder.

---

## Troubleshooting

**I don't see the button.**
- Refresh the page. Tabs opened before you installed the extension won't have it until refreshed.
- Extensions can't run on browser pages (`chrome://…`, `edge://…`), the new-tab page, extension stores, or some built-in PDF viewers. Try a news site.
- Make sure the Hide Trump switch on the extensions page is turned on.

**"Manifest file is missing or unreadable" when loading.**
You selected the wrong folder. Pick the folder that has `manifest.json` directly inside it, not the folder above it and not the ZIP file.

**The extension broke or disappeared after I moved files.**
The browser loads it from the folder you picked. If that folder moved or was deleted, click **Remove** on the extensions page and load it again from the new location.

**My browser shows a warning about developer-mode extensions.**
That's normal for anything not installed from a store. You can dismiss it. Hide Trump collects no data and sends nothing anywhere; the full source code is in this repository.

**Something about Trump still shows up.**
The extension finds Trump content through text: headlines, captions, image descriptions and links. A photo of him with nothing nearby naming him can't be detected yet. If a whole story or post slips through, please [open an issue](https://github.com/davidschocke/hide-trump/issues) with the site name and a screenshot.

**Too much is being hidden on a site.**
Please [open an issue](https://github.com/davidschocke/hide-trump/issues) with the site name and a screenshot so the detection can be tuned.

**Work or school computer won't allow Developer mode.**
Your organisation has blocked unpacked extensions. There's no way around that until Hide Trump is in an extension store.
