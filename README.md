# Facebook Saved Items Cleanup Utility

A robust JavaScript automation tool designed to streamline the removal of items from the Facebook "Saved" section. This utility utilizes coordinate-based targeting and intelligent element filtering to provide a reliable bulk-deletion solution where native platform features are currently unavailable.

## Table of Contents
* [Technical Logic & Design](#technical-logic--design)
* [Key Features](#key-features)
* [Installation & Usage](#installation--usage)
* [Source Code](#source-code)
* [Performance Tuning](#performance-tuning)
* [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)
* [Disclaimer](#disclaimer)
* [License](#license)

---

## Technical Logic & Design
This utility operates by grouping UI elements into coordinate-based "rows." This allows the script to accurately identify the specific "More" menu associated with a post, even when Facebook's internal class names change. By filtering buttons based on their physical width (maximum 60px), it effectively ignores larger UI elements like "Add to Collection" or "Share" buttons.

### Key Features
* **Top-Priority Execution:** Resets the viewport to `(0, 0)` on every loop to maintain chronological order.
* **Dimensional Filtering:** Targets elements based on physical width (< 60px) to ignore "Share" or "Collection" buttons.
* **Helper One-Liners:** Utilizes `sleep` and `findByText` helpers to reduce code bloat and improve execution speed.
* **State Recovery:** Automatically dispatches `Escape` key events if a menu fails to resolve, preventing script hang-ups.
---

## Installation & Usage

### Prerequisites
* A desktop web browser (Chrome, Firefox, or Edge recommended).
* Access to your [Facebook Saved Items](https://www.facebook.com/saved) page.

### Execution Steps
1. Navigate to the **Saved Items** page on Facebook.
2. Open the **Developer Tools** (Press `Ctrl+Shift+J`).
3. Paste the source code provided below into the console and press **Enter**.
4. To terminate the process at any time, simply **Refresh** the browser tab.

---

## Source Code

```javascript
/**
 * Facebook Saved Items Cleanup Utility - Optimized v1.1.0
 */
(async () => {
    const CFG = { scroll: 1000, action: 500, wait: 800, retry: 12 };
    console.log("Cleanup Optimized: Running...");

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const findByText = (tag, txt) => Array.from(document.querySelectorAll(tag)).find(el => el.innerText?.includes(txt));

    while (true) {
        window.scrollTo(0, 0);
        await sleep(CFG.scroll);

        const btns = Array.from(document.querySelectorAll('div[role="button"]')).filter(b => {
            const r = b.getBoundingClientRect();
            const l = (b.getAttribute('aria-label') || "").toLowerCase();
            return r.top > 120 && r.width > 0 && r.width < 60 && !l.includes("share") && !l.includes("collection");
        });

        if (!btns.length) { window.scrollBy(0, 500); continue; }

        const rows = btns.reduce((acc, b) => {
            const y = Math.round(b.getBoundingClientRect().top / 15) * 15;
            acc[y] = [...(acc[y] || []), b];
            return acc;
        }, {});

        for (const y of Object.keys(rows).sort((a,b) => a-b).slice(0, 3)) {
            const menu = rows[y].reduce((a, b) => a.getBoundingClientRect().left > b.getBoundingClientRect().left ? a : b);
            menu.click();

            let unsave;
            for (let i = 0; i < CFG.retry && !unsave; i++) {
                await sleep(100);
                unsave = findByText('span', 'Unsave');
            }

            if (unsave) {
                unsave.click();
                await sleep(CFG.action);
                const confirm = findByText('span', 'Remove') || findByText('span', 'Unsave');
                if (confirm) confirm.click();
            } else {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            }
            await sleep(CFG.wait);
        }
    }
})();
``` 
## Performance Tuning
You can modify the `CFG` object at the top of the script:

* **scroll**: Increase if your internet is slow and posts take time to appear.
* **action**: Increase if the confirmation pop-up is missing the click.
* **retry**: How many times to look for the "Unsave" button before giving up on that row.

---

## Frequently Asked Questions (FAQ)
**Q: Does this script work on Mobile?** A: No, this requires a desktop browser to access the Developer Console.

**Q: Can I get banned for using this?** A: This script interacts with the page just like a human would (clicking and scrolling). While it is generally safe for personal cleanup, use it at your own discretion.

**Q: The script isn't clicking the buttons anymore. What happened?** A: Facebook occasionally updates their website layout. If the script stops working, check the "Issues" tab on this repository to see if an update is available.

---

## Contributing
Contributions are welcome! If you have suggestions for performance improvements or updates for new Facebook layouts, please feel free to open a **Pull Request** or submit an **Issue**.

---

## Disclaimer
This script is provided for educational purposes. Automated interactions with platform interfaces should be conducted in compliance with the respective platform's Terms of Service. The author assumes no responsibility for account restrictions or data loss resulting from the use of this utility.

## License
Distributed under the MIT License. See the `LICENSE` file for more information.
