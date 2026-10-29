(() => {
  const SELECTOR = [
    '[data-testid="tweetPhoto"]',
    '[data-testid="videoPlayer"]',
    '[data-testid="videoComponent"]',
    '[data-testid="card.layoutLarge.media"]',
    '[data-testid="card.layoutSmall.media"]',
  ].join(',');

  // Parts of a tweet that must never be swallowed into the hidden block
  const STOP = [
    '[data-testid="tweetText"]',
    '[data-testid="User-Name"]',
    '[data-testid="Tweet-User-Avatar"]',
    '[role="group"]',
    'time',
  ].join(',');

  // Tweets the user has revealed, so they stay revealed after X re-renders
  // them while scrolling.
  const revealed = new Set();

  function tweetKey(article) {
    const link = article.querySelector('a[href*="/status/"] time')?.closest('a');
    return link ? link.getAttribute('href') : null;
  }

  // True if el has visible text outside of media (e.g. a card's title)
  function hasNonMediaText(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (t.nodeValue.trim() && !t.parentElement.closest(SELECTOR)) return true;
    }
    return false;
  }

  // Climb from a media element to the outermost wrapper that holds only
  // media (the whole photo grid, not just one photo), so hiding it removes
  // the space it took up.
  function mediaBlock(el, article) {
    let node = el;
    for (let i = 0; i < 15; i++) {
      const p = node.parentElement;
      if (!p || p === article || p.querySelector(STOP) || hasNonMediaText(p)) break;
      node = p;
    }
    return node;
  }

  function reveal(article) {
    const key = tweetKey(article);
    if (key) revealed.add(key);
    article.dataset.xmhRevealed = '1';
    article.querySelectorAll('.xmh-pill').forEach((p) => p.remove());
    article.querySelectorAll('.xmh-hidden').forEach((el) => el.classList.remove('xmh-hidden'));
  }

  function hide(el) {
    // Leave the full-screen photo/video viewer alone
    if (el.closest('[aria-modal="true"]')) return;
    const article = el.closest('article');
    if (!article || article.dataset.xmhRevealed) return;
    if (el.closest('.xmh-hidden')) return;
    const key = tweetKey(article);
    if (key && revealed.has(key)) return;

    const block = mediaBlock(el, article);
    block.classList.add('xmh-hidden');
    block.querySelectorAll('video').forEach((v) => v.pause());
    if (block.previousElementSibling?.classList.contains('xmh-pill')) return;

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'xmh-pill';
    pill.textContent = 'Show';
    // Stop X from opening the tweet on this click
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      reveal(pill.closest('article'));
    }, true);
    block.before(pill);
  }

  function scan(root) {
    if (root.matches?.(SELECTOR)) hide(root);
    root.querySelectorAll?.(SELECTOR).forEach(hide);
  }

  // Block autoplay of hidden videos
  document.addEventListener('play', (e) => {
    if (e.target.closest?.('.xmh-hidden')) e.target.pause();
  }, true);

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) scan(node);
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  scan(document);
})();
