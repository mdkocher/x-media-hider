# X Media Hider

A tiny Chrome extension that hides every image and video in your X (Twitter) feed until you ask to see it.

I wanted to scroll X for the text without getting hit by a wall of photos, memes and autoplaying videos. So this collapses the media out of every post and leaves a small **Show** pill in its place. Click the pill and the media drops back in right where it would have been.

## What it does

- Collapses photos, videos, GIFs and link preview images in posts, so the feed is just text
- Adds a **Show** pill to any post that had media
- Clicking **Show** puts that post's media back exactly where it normally sits
- Revealed posts stay revealed while you scroll (until you reload the page)
- Hidden videos don't autoplay
- Profile pictures are left alone, and the full screen photo viewer works like normal

## Install

It isn't on the Chrome Web Store, so you load it yourself. Takes about 30 seconds.

1. Clone or download this repo
   ```bash
   git clone https://github.com/mdkocher/x-media-hider.git
   ```
2. Open `chrome://extensions` in Chrome
3. Turn on **Developer mode** (top right)
4. Click **Load unpacked** and pick the `x-media-hider` folder
5. Refresh x.com

Works in any Chromium browser that supports unpacked extensions (Chrome, Brave, Edge, Arc).

## How it works

There's no build step and no dependencies. It's three files:

| File | What it does |
| --- | --- |
| `manifest.json` | Manifest V3 config. Runs the content script on `x.com` and `twitter.com` |
| `content.js` | Watches the page for new posts, collapses their media and wires up the Show pill |
| `content.css` | Hides the collapsed media and styles the pill |

X loads posts as you scroll, so `content.js` uses a `MutationObserver` to catch new ones as they appear. When it finds media (matched by X's `data-testid` attributes like `tweetPhoto` and `videoPlayer`), it walks up the DOM to the outermost wrapper that only contains media. That way a four photo grid collapses as one block instead of leaving an empty box behind. The text, author name and action buttons are never touched.

The extension doesn't collect anything, doesn't make network requests and doesn't need any special permissions.

## If it breaks

X changes their markup from time to time. If media stops getting hidden, the selectors at the top of `content.js` are the first place to look. If too much or too little gets collapsed, the `STOP` list right below them controls where the collapsing stops.

Issues and PRs are welcome.

## License

MIT
