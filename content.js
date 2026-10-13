(() => {
  if (window.__hideTrumpLoaded) return;
  window.__hideTrumpLoaded = true;

  // ---- What counts as "Trump" -------------------------------------------
  // Visible text: whole words, case-insensitive. Edit this list to taste.
  const TEXT_RE = /\b(?:trump(?:s|ism|ist|ists|ian|world)?|maga|melania|ivanka|kushner|mar[- ]a[- ]lago|truth social|make america great again|djt)\b/i;
  // URLs, filenames and attributes (catches trump_rally.jpg, /donald-trump/, etc.).
  // "maga" is left out here so "magazine" URLs don't match.
  const ATTR_RE = /(?<![a-z])(?:trump(?!et)|melania|ivanka|kushner|mar-?a-?lago|truthsocial|truth-social)/i;

  const DESCRIPTIVE_ATTRS = ['alt', 'title', 'aria-label', 'data-title'];
  const URL_ATTRS = ['src', 'srcset', 'data-src', 'href', 'poster'];

  // ---- How to pick what to hide ----------------------------------------
  // Whole social-media posts. These win outright, however deeply the match is nested.
  const POSTS = [
    '[role="feed"] > *', '[aria-posinset]', '[data-pagelet^="FeedUnit"]',  // Facebook and other ARIA feeds
    '[data-testid="tweet"]', '[data-testid="cellInnerDiv"]',                // X / Twitter
    'shreddit-post',                                                        // Reddit
    '[data-urn^="urn:li:activity"]',                                        // LinkedIn
    'ytd-rich-item-renderer', 'ytd-video-renderer', 'ytd-compact-video-renderer',
    'ytd-grid-video-renderer', 'ytd-reel-item-renderer'                     // YouTube
  ].join(',');
  // Elements that are almost always one self-contained item (story, post, ad, video).
  const SEMANTIC = [
    'article', '[role="article"]', 'li', 'figure', 'tr',
    'ytd-rich-item-renderer', 'ytd-video-renderer', 'ytd-compact-video-renderer',
    'ytd-grid-video-renderer', 'ytd-reel-item-renderer', 'ytd-playlist-renderer',
    '[data-testid="tweet"]', '[data-testid="cellInnerDiv"]', 'shreddit-post',
    'ins.adsbygoogle', '[id^="google_ads"]', '[data-ad]', '[data-ad-slot]'
  ].join(',');
  const ITEMS = POSTS + ',' + SEMANTIC;
  // Class names sites commonly use for cards.
  const CLASSY = [
    '[class*="card" i]', '[class*="story" i]', '[class*="teaser" i]', '[class*="post" i]',
    '[class*="tile" i]', '[class*="promo" i]', '[class*="item" i]'
  ].join(',');
  const PROTECTED = 'html,body,main,[role="main"]';
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'TEMPLATE', 'HEAD', 'TITLE', 'META', 'LINK']);
  const MAX_TEXT = 2500;   // a "card" bigger than this is probably a whole section
  const MAX_DEPTH = 12;

  const IS_TOP = window === window.top;

  let active = false;
  const hidden = new Map(); // element -> previous inline display ([value, priority])
  const observedRoots = new WeakSet();
  let textLenCache = new Map();
  let host = null, btn = null;

  // ---- Hiding / restoring ----------------------------------------------
  function hide(el) {
    if (!el || el === host || hidden.has(el)) return;
    const stub = isInRow(el) ? makePlaceholder(el) : null;
    hidden.set(el, [el.style.getPropertyValue('display'), el.style.getPropertyPriority('display'), stub]);
    el.style.setProperty('display', 'none', 'important');
  }

  function restoreAll() {
    for (const [el, [value, priority, stub]] of hidden) {
      if (value) el.style.setProperty('display', value, priority);
      else el.style.removeProperty('display');
      if (stub) stub.remove();
    }
    hidden.clear();
  }

  // ---- 💩 placeholders ---------------------------------------------------
  // Items laid out side by side (YouTube's video grid, rows of thumbnails) would leave a hole
  // when removed, so they get a same-sized 💩 instead. Stacked feeds just close up.
  const PLACEHOLDER = 'data-hide-trump-placeholder';

  function isInRow(el) {
    const p = el.parentElement;
    if (!p) return false;
    const s = getComputedStyle(p);
    return s.display.endsWith('grid') || (s.display.endsWith('flex') && s.flexDirection.startsWith('row'));
  }

  function makePlaceholder(el) {
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 40) return null;
    const cs = getComputedStyle(el);
    const stub = document.createElement('div');
    stub.setAttribute(PLACEHOLDER, '');
    stub.title = 'Hidden by Hide Trump';
    stub.textContent = '💩';
    Object.assign(stub.style, {
      boxSizing: 'border-box', width: r.width + 'px', height: r.height + 'px',
      margin: cs.margin, flex: '0 0 auto', gridColumn: cs.gridColumn, gridRow: cs.gridRow,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(Math.min(64, Math.max(20, Math.min(r.width, r.height) / 3))) + 'px',
      background: 'rgba(128,128,128,.12)', borderRadius: '12px', userSelect: 'none'
    });
    el.before(stub);
    return stub;
  }

  // Sites that recycle or remove items (infinite scroll) would leave orphaned 💩s behind.
  function dropOrphanPlaceholders() {
    for (const [el, entry] of hidden) {
      if (!el.isConnected) {
        if (entry[2]) entry[2].remove();
        hidden.delete(el);
      }
    }
  }

  function parentOf(n) {
    if (n.parentElement) return n.parentElement;
    const root = n.getRootNode && n.getRootNode();
    return root instanceof ShadowRoot ? root.host : null;
  }

  function closestAcrossShadow(el, selector) {
    for (let n = el; n; n = parentOf(n)) if (n.matches(selector)) return n;
    return null;
  }

  function insideHidden(el) {
    for (let n = el; n; n = parentOf(n)) if (hidden.has(n)) return true;
    return false;
  }

  function textLen(n) {
    let len = textLenCache.get(n);
    if (len === undefined) textLenCache.set(n, (len = n.textContent.length));
    return len;
  }

  function isBlock(n) {
    const d = getComputedStyle(n).display;
    return d !== 'inline' && d !== 'contents' && d !== 'none';
  }

  // An element whose parent holds 2+ siblings with the same tag + first class is a list item (a card).
  function isRepeated(n) {
    const p = n.parentElement;
    if (!p || p.children.length < 2) return false;
    const sig = n.tagName + '.' + (n.classList[0] || '');
    let count = 0;
    for (const s of p.children) {
      if (s.tagName + '.' + (s.classList[0] || '') === sig && ++count >= 2) return true;
    }
    return false;
  }

  // Walk up from the match to the whole story/post/ad/image card it belongs to.
  function containerFor(start) {
    const post = closestAcrossShadow(start, POSTS);
    if (post && !post.matches(PROTECTED)) return post;
    const headline = !!start.closest('h1,h2,h3,h4');
    let best = null;
    let n = start;
    for (let depth = 0; n && n.nodeType === 1 && depth < MAX_DEPTH; depth++, n = parentOf(n)) {
      if (n === host || n.matches(PROTECTED)) break;
      // A headline about Trump takes its whole article with it; a passing mention in a long piece only hides that paragraph.
      if (textLen(n) > MAX_TEXT && !(headline && n.matches('article,[role="article"]'))) break;
      if (n.matches(SEMANTIC)) return n;
      if (isRepeated(n) && isBlock(n)) return n;
      if (!best && n.matches(CLASSY) && isBlock(n)) best = n;
    }
    return best || start.closest('p,h1,h2,h3,h4,h5,h6,blockquote,figcaption,a,td,label') || start;
  }

  function hideFor(el) {
    if (insideHidden(el) || (document.head && document.head.contains(el))) return;
    // A small embedded frame (typically an ad or embed) that mentions Trump goes entirely.
    if (!IS_TOP && innerWidth * innerHeight < 250000) {
      hide(document.documentElement);
      return;
    }
    const box = containerFor(el);
    hide(box);
    hideAttachedMedia(el, box);
  }

  // ---- Photos attached to Trump text ------------------------------------
  const MEDIA = 'img,picture,video,svg image,[style*="url("]';
  const MAX_ATTACH_DEPTH = 5;

  function storyHref(a) {
    const href = a.href;
    if (!href || /^(javascript|mailto|tel):/i.test(href)) return null;
    const url = href.split('#')[0];
    return url === location.href.split('#')[0] ? null : url;
  }

  // Distinct story links in an area: links with a real headline or a picture in them.
  function storyCount(area) {
    const hrefs = new Set();
    for (const a of area.querySelectorAll('a[href]')) {
      if (a.textContent.trim().length < 25 && !a.querySelector(MEDIA)) continue;
      const h = storyHref(a);
      if (h && hrefs.add(h).size > 1) return 2;
    }
    return hrefs.size;
  }

  function hideMedia(area) {
    for (const m of area.querySelectorAll(MEDIA)) {
      if (insideHidden(m)) continue;
      const wrap = m.closest('figure,picture,a');
      hide(wrap && area.contains(wrap) ? wrap : m);
    }
  }

  let linkIndex = null; // story url -> links that contain a picture
  function linksWithMediaTo(url) {
    if (!linkIndex) {
      linkIndex = new Map();
      for (const a of document.querySelectorAll('a[href]')) {
        if (!a.querySelector(MEDIA)) continue;
        const h = storyHref(a);
        if (!h) continue;
        if (!linkIndex.has(h)) linkIndex.set(h, []);
        linkIndex.get(h).push(a);
      }
    }
    return linkIndex.get(url) || [];
  }

  function hideAttachedMedia(el, box) {
    // 1. Pictures elsewhere that link to the same story as the Trump text.
    const urls = new Set();
    const own = el.closest('a[href]');
    if (own) urls.add(storyHref(own));
    if (box.querySelectorAll && textLen(box) <= MAX_TEXT) {
      for (const a of box.querySelectorAll('a[href]')) urls.add(storyHref(a));
    }
    urls.delete(null);
    for (const url of urls) {
      for (const a of linksWithMediaTo(url)) if (!insideHidden(a)) hide(containerFor(a));
    }
    // 2. Pictures sitting next to the Trump text, as long as the area is still just this one story.
    //    A whole post or card already took its own pictures with it, and its neighbours are other stories.
    if (box.matches(ITEMS) || isRepeated(box)) return;
    let n = parentOf(box);
    for (let depth = 0; n && n.nodeType === 1 && depth < MAX_ATTACH_DEPTH; depth++, n = parentOf(n)) {
      if (n === host || n.matches(PROTECTED) || textLen(n) > MAX_TEXT || storyCount(n) > 1) break;
      if ([...n.querySelectorAll(ITEMS)].some((item) => !item.contains(box) && !item.matches('figure'))) break;
      hideMedia(n);
    }
  }

  // ---- Scanning --------------------------------------------------------
  function checkText(t) {
    const p = t.parentElement;
    if (!p || SKIP_TAGS.has(p.tagName) || p.isContentEditable) return;
    if (t.data.length > 2 && TEXT_RE.test(t.data)) hideFor(p);
  }

  function checkElement(el) {
    if (el === host || SKIP_TAGS.has(el.tagName) || el.hasAttribute(PLACEHOLDER)) return;
    if (el.shadowRoot) {
      if (!observedRoots.has(el.shadowRoot)) {
        observedRoots.add(el.shadowRoot);
        observer.observe(el.shadowRoot, OBSERVE_OPTS);
      }
      scan(el.shadowRoot);
    }
    let hit = false;
    for (const a of DESCRIPTIVE_ATTRS) {
      const v = el.getAttribute(a);
      if (v && (TEXT_RE.test(v) || ATTR_RE.test(v))) { hit = true; break; }
    }
    if (!hit) {
      for (const a of URL_ATTRS) {
        let v = el.getAttribute(a);
        // Only a link's path counts: search pages put "?q=trump" on every link, including menus.
        if (v && a === 'href') v = v.split(/[?#]/)[0];
        if (v && ATTR_RE.test(v)) { hit = true; break; }
      }
    }
    if (!hit) {
      const s = el.getAttribute('style');
      if (s && s.includes('url(') && ATTR_RE.test(s)) hit = true;
    }
    if (hit) hideFor(el);
  }

  function scan(root) {
    if (!root || root === host) return;
    if (root.nodeType === Node.TEXT_NODE) { checkText(root); return; }
    if (root.nodeType === Node.ELEMENT_NODE) {
      if (SKIP_TAGS.has(root.tagName) || insideHidden(root)) return;
      checkElement(root);
    } else if (root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let t; (t = walker.nextNode());) checkText(t);
    for (const el of root.querySelectorAll('*')) checkElement(el);
  }

  // ---- Watching for new content (infinite scroll, lazy ads, SPAs) -------
  const OBSERVE_OPTS = {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['alt', 'title', 'aria-label', 'src', 'srcset', 'href', 'poster']
  };
  const queue = new Set();
  let timer = 0;

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') m.addedNodes.forEach((n) => queue.add(n));
      else queue.add(m.target);
    }
    if (!timer) timer = setTimeout(flush, 100);
  });

  function flush() {
    timer = 0;
    textLenCache = new Map();
    linkIndex = null;
    const nodes = [...queue];
    queue.clear();
    dropOrphanPlaceholders();
    for (const n of nodes) if (n.isConnected) scan(n);
    ensureButton();
    render();
  }

  function setActive(on) {
    if (on === active) return;
    active = on;
    if (on) {
      observer.observe(document.documentElement, OBSERVE_OPTS);
      textLenCache = new Map();
      linkIndex = null;
      scan(document.body || document.documentElement);
    } else {
      observer.disconnect();
      clearTimeout(timer);
      timer = 0;
      queue.clear();
      restoreAll();
    }
    render();
  }

  // ---- The button (top frame only) -------------------------------------
  function ensureButton() {
    if (!IS_TOP) return;
    if (!host) {
      // Built element by element, not with innerHTML: sites that enforce Trusted Types
      // (Reddit, YouTube, Google) block innerHTML, even from extensions.
      const el = document.createElement('hide-trump-button');
      const shadow = el.attachShadow({ mode: 'closed' });
      const style = document.createElement('style');
      style.textContent = `
        :host { all: initial; }
        button {
          position: fixed; top: 10px; left: 10px; z-index: 2147483647;
          font: 600 13px/1 system-ui, -apple-system, "Segoe UI", sans-serif;
          padding: 8px 14px; border-radius: 999px; cursor: pointer;
          background: #fff; color: #111; border: 1px solid rgba(0,0,0,.2);
          box-shadow: 0 2px 8px rgba(0,0,0,.25); opacity: .85;
        }
        button:hover { opacity: 1; }
        button.on { background: #c62828; color: #fff; border-color: #c62828; }`;
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => {
        try { chrome.storage.local.set({ htActive: !active }); }
        catch { setActive(!active); } // extension was reloaded; still work on this page
      });
      shadow.append(style, b);
      host = el;
      btn = b;
      // Some sites rebuild the page and throw out elements they don't know; put the button back.
      new MutationObserver(() => {
        if (!host.isConnected) (document.body || document.documentElement).appendChild(host);
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
    if (!host.isConnected) (document.body || document.documentElement).appendChild(host);
    render();
  }

  function render() {
    if (!btn) return;
    btn.textContent = active ? `Show Trump (${hidden.size} hidden)` : 'Hide Trump';
    btn.classList.toggle('on', active);
  }

  // ---- Wire up ---------------------------------------------------------
  // The on/off state is shared by every tab, so it stays on as you browse.
  chrome.storage.local.get('htActive', (r) => setActive(!!r.htActive));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.htActive) setActive(!!changes.htActive.newValue);
  });

  ensureButton();
  document.addEventListener('DOMContentLoaded', () => {
    ensureButton();
    if (active) scan(document.body);
  });
})();
