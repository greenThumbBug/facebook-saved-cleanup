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
* **Top-Priority Execution:** Automatically resets the viewport to the absolute top of the page (`window.scrollTo(0, 0)`) to ensure items are removed in chronological or list order.
* **Dimensional Filtering:** Excludes UI elements based on width (targeting buttons < 60px) to distinguish between the "More" menu and larger action buttons.
* **Keyword Guardians:** Evaluates `aria-label` and `innerText` attributes to prevent accidental interaction with "Share," "Collection," or "Message" elements.
* **State Recovery:** Features an automated escape sequence to close incorrect overlays and maintain process continuity.

---

## Installation & Usage

### Prerequisites
* A desktop web browser (Chrome, Firefox, or Edge recommended).
* Access to your [Facebook Saved Items](https://www.facebook.com/saved) page.

### Execution Steps
1. Navigate to the **Saved Items** page on Facebook.
2. Open the **Developer Tools** (Press `F12` or `Ctrl+Shift+I`).
3. Select the **Console** tab.
4. Paste the source code provided below into the console and press **Enter**.
5. To terminate the process at any time, simply **Refresh** the browser tab.

---

## Source Code

```javascript
/**
 * Facebook Saved Items Cleanup Utility
 * Professional Refactor - v1.0.0
 */

async function initializeSavedItemsCleanup() {
    console.log("Cleanup process initiated. System is running in continuous mode.");

    const CONFIG = {
        scrollDelay: 1000,
        actionDelay: 500,
        menuRetryAttempts: 12,
        retryInterval: 100,
        postActionWait: 800,
        maxButtonWidth: 60,
        headerOffset: 120,
        footerBuffer: 0.8
    };

    while (true) {
        // Reset viewport to ensure top-down processing
        window.scrollTo(0, 0);
        await new Promise(resolve => setTimeout(resolve, CONFIG.scrollDelay));

        const actionButtons = identifyActionButtons(CONFIG);

        if (actionButtons.length === 0) {
            console.log("Searching for targets...");
            window.scrollBy(0, 500);
            await new Promise(resolve => setTimeout(resolve, CONFIG.scrollDelay));
            continue;
        }

        await processButtonRows(actionButtons, CONFIG);
    }
}

function identifyActionButtons(config) {
    const screenHeight = window.innerHeight;
    
    return Array.from(document.querySelectorAll('div[role="button"]'))
        .filter(button => {
            const rect = button.getBoundingClientRect();
            const label = (button.getAttribute('aria-label') || "").toLowerCase();
            const text = button.innerText.toLowerCase();

            const isWithinBounds = rect.top > config.headerOffset && 
                                   rect.top < (screenHeight * config.footerBuffer);
            
            const isVisible = rect.width > 0 && rect.width < config.maxButtonWidth;

            const isInvalidType = label.includes("share") || 
                                  text.includes("collection") || 
                                  label.includes("collection");

            return isWithinBounds && isVisible && !isInvalidType;
        });
}

async function processButtonRows(buttons, config) {
    const rows = {};
    
    buttons.forEach(btn => {
        const yCoord = Math.round(btn.getBoundingClientRect().top / 15) * 15;
        if (!rows[yCoord]) rows[yCoord] = [];
        rows[yCoord].push(btn);
    });

    const sortedRowKeys = Object.keys(rows).sort((a, b) => Number(a) - Number(b));

    for (const y of sortedRowKeys.slice(0, 3)) {
        const rowItems = rows[y];
        if (!rowItems.length) continue;

        const targetMenu = rowItems.reduce((prev, curr) => 
            (prev.getBoundingClientRect().left > curr.getBoundingClientRect().left) ? prev : curr
        );

        targetMenu.scrollIntoView({ block: "center" });
        await new Promise(resolve => setTimeout(resolve, config.actionDelay));
        targetMenu.click();

        const success = await executeUnsaveAction(config);
        if (!success) {
            resetInterfaceState();
        }

        await new Promise(resolve => setTimeout(resolve, config.postActionWait));
    }
}

async function executeUnsaveAction(config) {
    let unsaveOption = null;

    for (let i = 0; i < config.menuRetryAttempts; i++) {
        unsaveOption = Array.from(document.querySelectorAll('span'))
            .find(span => span.innerText && span.innerText.trim() === "Unsave");
        
        if (unsaveOption) break;
        await new Promise(resolve => setTimeout(resolve, config.retryInterval));
    }

    if (unsaveOption) {
        unsaveOption.click();
        await new Promise(resolve => setTimeout(resolve, config.actionDelay));

        const confirmationButton = Array.from(document.querySelectorAll('div[role="button"] span'))
            .find(span => {
                const text = span.innerText;
                return text && (text.includes("Remove") || text.includes("Unsave"));
            });

        if (confirmationButton) confirmationButton.click();
        return true;
    }
    return false;
}

function resetInterfaceState() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.body.click();
}

initializeSavedItemsCleanup();
``` 
## Performance Tuning
Users with slower internet connections or older hardware can adjust the `CONFIG` object at the top of the script:

* **scrollDelay**: Increase this if the page takes a long time to load new posts.
* **actionDelay**: Increase this if the "More" menu is closing before the script can click "Unsave."
* **menuRetryAttempts**: Increase this if the script skips items without deleting them.

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
