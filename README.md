# Hide Trump

A Chrome extension that adds a **Hide Trump** button to the top-left corner of every web page. Click it, and articles, posts, photos, videos and ads that mention Trump disappear. Click again to bring them back.

> 💩 **Free and open source. Please share it, and help make it better!** Send the link to anyone who could use a break: **https://github.com/davidschocke/hide-trump**. See [Share it and make it better](#share-it-and-make-it-better) for how to help.

## What it hides

- **Stories and posts**: any news card, Facebook / X / Reddit / LinkedIn post or YouTube video that mentions Trump, MAGA, Melania, Ivanka, Kushner, Mar-a-Lago or Truth Social. The whole card goes, not just the word.
- **Photos attached to that text**: images whose caption, alt text, title or filename mention him, images linking to a Trump story, and photos sitting next to a Trump headline or caption.
- **Ads**: ad slots and small embedded frames that mention him.
- **New content**: anything that loads later (infinite scroll, lazy ads, single-page sites) keeps getting hidden.

A headline about Trump hides the whole article; a passing mention inside a long article only hides that paragraph.

Everything hidden is replaced by a 💩 taking up the same space, so pages keep their layout.

**Pages about Trump:** when the page itself is about him (his Instagram profile, r/trump, a Trump article, a "trump" search), every photo and video on it becomes 💩, even ones with no caption naming him.

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

## Share it and make it better

This is a free, open-source project, and it gets better with every person who uses it and every site someone reports.

**Share it**
- Send the link to friends and family: **https://github.com/davidschocke/hide-trump**
- Post it wherever people would appreciate a quieter internet.
- Click ⭐ **Star** at the top of this page. It helps other people find it.

**Report what it misses (no coding needed)**
- Something about Trump still showing up, or something hidden that shouldn't be? [Open an issue](https://github.com/davidschocke/hide-trump/issues/new) with the website and a screenshot. Every report makes it smarter on that site.

**Improve the code**
1. Fork this repository and make your change in [`content.js`](content.js).
2. Test it: load your folder with **Load unpacked** (see [INSTALL.md](INSTALL.md)), then try the sites you changed.
3. Open a pull request describing what you fixed and which sites you tested.

**Ideas we'd love help with**
- Face recognition, to catch photos of him with no caption.
- Publishing to the Chrome Web Store, Edge Add-ons and Firefox Add-ons.
- A settings page for editing the word list without touching code.
- Better handling for specific sites: anywhere the 💩 lands in the wrong place.

## License

MIT. Free to use, copy and modify. See [LICENSE](LICENSE).
