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

        // Group by Y-axis (rows) and pick the right-most button (the menu)
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
