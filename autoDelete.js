(function() {
    if (window.__odGalleryNuke) return;
    window.__odGalleryNuke = true;

    console.log('%c💣 OneDrive Gallery-View Nuke INITIATED', 'color:#FF5722;font-size:16px;font-weight:700');

    // ─── Step 1: Saari files select karo ───
    console.log('%c⏳ Selecting all visible files...', 'color:#FFC107');

    // Approach 1: Pehle select-all checkbox dhundho
    var selectAll = document.querySelector('[data-automationid="selectAllCheckbox"]') ||
                    document.querySelector('.ms-DetailsHeader-cellTitle [role="checkbox"]') ||
                    document.querySelector('[aria-label*="Select all"]');

    if (selectAll) {
        selectAll.click();
        console.log('%c✅ Select-all checkbox clicked', 'color:#4CAF50');
    } else {
        // Approach 2: Har visible tile ke checkbox individually click karo
        console.log('%c⚠ No select-all found. Clicking individual checkboxes...', 'color:#FFC107');
        
        var tiles = document.querySelectorAll('[role="gridcell"][data-automationid^="row-"]');
        var clicked = 0;
        
        tiles.forEach(function(tile) {
            var cb = tile.querySelector('[role="checkbox"][data-automationid^="row-selection-"]');
            if (cb && cb.getAttribute('aria-checked') !== 'true') {
                cb.click();
                clicked++;
            }
        });
        
        console.log('%c✅ Selected ' + clicked + ' files individually', 'color:#4CAF50');
        
        if (clicked === 0) {
            // Approach 3: Tile par click karo select karne ke liye
            tiles.forEach(function(tile) {
                tile.click();
                clicked++;
            });
            console.log('%c✅ Clicked ' + clicked + ' tiles for selection', 'color:#4CAF50');
        }
    }

    // ─── Step 2: 800ms baad delete button ───
    setTimeout(function() {
        console.log('%c🗑  Looking for Delete button...', 'color:#FF5722');

        var del = document.querySelector('[data-automationid="deleteCommand"]') ||
                  document.querySelector('[data-id="delete"]') ||
                  document.querySelector('button[data-icon-name="Delete"]') ||
                  document.querySelector('[aria-label*="Delete"]') ||
                  document.querySelector('.ms-CommandBar button[name="Delete"]');

        if (del) {
            console.log('%c✅ Delete button found, clicking...', 'color:#4CAF50');
            del.click();

            // ─── Step 3: 1s baad confirm ───
            setTimeout(function() {
                console.log('%c🗑  Confirming deletion...', 'color:#FF5722');

                var conf = document.querySelector('[data-automationid="confirmButton"]') ||
                           document.querySelector('.ms-Button--primary') ||
                           document.querySelector('button[title*="Delete"]') ||
                           document.querySelector('[role="dialog"] .ms-Button--primary') ||
                           document.querySelector('[data-automationid="confirmDialog"] button');
                
                if (conf) {
                    conf.click();
                    console.log('%c✅✅ ALL FILES DELETED SUCCESSFULLY!', 'color:#4CAF50;font-size:18px;font-weight:700');
                } else {
                    console.error('%c❌ Confirm button not found!', 'color:#F44336');
                    console.log('%cℹ  Dialog might still be open, check manually.', 'color:#2196F3');
                }
            }, 1000);
        } else {
            console.error('%c❌ Delete button not found!', 'color:#F44336');
            console.log('%cℹ  Waiting 2 more seconds and retrying...', 'color:#FFC107');
            
            // Retry after 2 seconds — selection ko UI update karne ka time do
            setTimeout(function() {
                var delRetry = document.querySelector('[data-automationid="deleteCommand"]') ||
                               document.querySelector('[data-id="delete"]');
                if (delRetry) {
                    delRetry.click();
                    setTimeout(function() {
                        var conf = document.querySelector('[data-automationid="confirmButton"]') ||
                                   document.querySelector('.ms-Button--primary');
                        if (conf) conf.click();
                        console.log('%c✅✅ ALL FILES DELETED!', 'color:#4CAF50');
                    }, 1000);
                }
            }, 2000);
        }
    }, 800);

    // ─── Disable ───
    window.disableOdGalleryNuke = function() {
        window.__odGalleryNuke = false;
        delete window.disableOdGalleryNuke;
        console.log('%c💣 Gallery-Nuke disabled.', 'color:#4CAF50');
    };
})();
