Chrome extension that syncs your clipboard to any computer running Chrome.

Uses [Chrome sign-in](http://support.google.com/chrome/bin/answer.py?hl=en&answer=165139) to sync your clipboard everywhere. To use the extension, copy something to the clipboard and click the clipboard sync icon next to the omnibox. Then, on all other computers where you're signed in and the extension is installed, you'll get a notification. Click on the notification and the text will be copied to the clipboard there.

The extension currently works with text only, and is subject to limitations imposed by the [storage API](http://developer.chrome.com/extensions/storage.html) (maximum length of 4096 characters, no more than 10 syncs per minute).

Available at the Chrome Web Store at [https://chrome.google.com/webstore/detail/dapdfappilfdiljfpjcbkmkblldaemjg](https://chrome.google.com/webstore/detail/dapdfappilfdiljfpjcbkmkblldaemjg).

### Potential future changes

- Use the [Commands API](http://developer.chrome.com/trunk/extensions/commands.html) to define shortcuts for copy and paste.
- Use [event pages](http://developer.chrome.com/trunk/extensions/event_pages.html).
- See if `execCommand` when pasting generates [a paste event](http://dev.w3.org/2006/webapi/clipops/), use that for rich data support.
