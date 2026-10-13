# Hide Trump

A Chrome extension that adds a **Hide Trump** button to the top-left corner of every web page. Click it, and articles, posts, photos, videos and ads that mention Trump disappear. Click again to bring them back.

## What it hides

- **Stories and posts**: any news card, Facebook / X / Reddit / LinkedIn post or YouTube video that mentions Trump, MAGA, Melania, Ivanka, Kushner, Mar-a-Lago or Truth Social. The whole card goes, not just the word.
- **Photos attached to that text**: images whose caption, alt text, title or filename mention him, images linking to a Trump story, and photos sitting next to a Trump headline or caption.
- **Ads**: ad slots and small embedded frames that mention him.
- **New content**: anything that loads later (infinite scroll, lazy ads, single-page sites) keeps getting hidden.

A headline about Trump hides the whole article; a passing mention inside a long article only hides that paragraph.

In grids and rows (like YouTube's video grid), a hidden item is replaced by a same-sized 💩 so the layout doesn't get holes. In ordinary top-to-bottom feeds, the rest of the page simply closes up.

The on/off setting is shared across all tabs, so it stays on as you browse.

## Install

Works in Chrome, Edge, Brave, Opera, Vivaldi and Arc. Firefox works only until it restarts.

**📖 [Full setup guide for every browser →](INSTALL.md)** (includes updating, uninstalling and troubleshooting)

Quick version for Chrome:

1. Download this repository (**Code → Download ZIP**) and unzip it somewhere you'll keep it.
2. Open `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and choose the unzipped `hide-trump-main` folder.

## Customising

The words it looks for are in the two lines near the top of [`content.js`](content.js) (`TEXT_RE` for page text, `ATTR_RE` for links, filenames and image descriptions). Edit them, then reload the extension.

## Limits

- Photos of Trump with no nearby text, caption or filename naming him can't be detected (that would need face recognition).
- Inside ads served from other sites, it can only see the text that ad exposes.
- "trump card" gets hidden too.
- It guesses at page layout, so some sites may see a bit too much or too little hidden.

## Privacy

Everything runs locally in your browser. The extension collects no data and sends nothing anywhere. Its only permission is `storage`, used to remember whether hiding is on or off.

## License

MIT. Free to use, copy and modify. See [LICENSE](LICENSE).
