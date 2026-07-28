(function() {
    if (window.__odSmartDelete) return;
    window.__odSmartDelete = true;

    console.log('%c🗑  OneDrive Smart-Delete ACTIVE — Select any file, it will be deleted automatically', 'color:#FF5722;font-size:14px;font-weight:700');
    console.log('%cRun disableOdSmartDelete() to stop.', 'color:#888');

    var ROW_SEL = [
        '[data-automationid*="FileCard"]',
        '[data-automationid*="GridCell"]',
        '[role="gridcell"]',
        '.ms-List-cell'
    ].join(', ');

    // ─── Helper: delete flow ───
    function triggerDelete() {
        setTimeout(function() {
            var del = document.querySelector('[data-automationid="deleteCommand"]') ||
                      document.querySelector('[data-id="delete"]') ||
                      document.querySelector('button[name="Delete"]') ||
                      document.querySelector('[aria-label*="Delete"]');
            if (del) {
                del.click();
                setTimeout(function() {
                    var conf = document.querySelector('[data-automationid="confirmButton"]') ||
                               document.querySelector('.ms-Button--primary') ||
                               document.querySelector('button[title*="Delete"]');
                    if (conf) conf.click();
                }, 800);
            }
        }, 300);
    }

    // ─── Listen for checkbox selection change ───
    // Jab user file select karta hai to checkbox ka state badalta hai
    document.addEventListener('change', function(e) {
        if (!window.__odSmartDelete) return;

        var checkbox = e.target.closest('[role="checkbox"], [type="checkbox"], .ms-Checkbox');
        if (!checkbox) return;

        // Check agar yeh file row ka checkbox hai
        var row = checkbox.closest(ROW_SEL);
        if (!row) return;

        // Agar check ho gaya hai (user ne select kiya)
        var isChecked = checkbox.getAttribute('aria-checked') === 'true' || checkbox.checked;
        if (isChecked) {
            var nameEl = row.querySelector('[data-automationid*="FileName"], [data-automationid*="Title"], [data-automationid*="Name"]');
            var name = nameEl ? nameEl.textContent.trim() : 'unknown file';
            console.log('%c🗑  Delete triggered for: ' + name, 'color:#FF5722');
            triggerDelete();
        }
    }, true);

    // ─── Alternate: click par detect karo lekin block mat karo ───
    document.addEventListener('click', function(e) {
        if (!window.__odSmartDelete) return;

        var row = e.target.closest(ROW_SEL);
        if (!row) return;

        // Koi blocking nahi — user normal select/file open kar sakta hai
        // Lekin thodi der baad check karo ki select hua ya nahi
        setTimeout(function() {
            var cb = row.querySelector('[role="checkbox"], .ms-Checkbox');
            if (cb) {
                var isChecked = cb.getAttribute('aria-checked') === 'true';
                if (isChecked) {
                    var nameEl = row.querySelector('[data-automationid*="FileName"], [data-automationid*="Title"], [data-automationid*="Name"]');
                    var name = nameEl ? nameEl.textContent.trim() : 'unknown file';
                    console.log('%c🗑  Delete triggered for: ' + name, 'color:#FF5722');
                    triggerDelete();
                }
            }
        }, 200);
    }, false); // bubbling phase — block nahi karta

    // ─── Disable ───
    window.disableOdSmartDelete = function() {
        window.__odSmartDelete = false;
        delete window.disableOdSmartDelete;
        console.log('%c🗑  OneDrive Smart-Delete disabled.', 'color:#4CAF50');
    };
})();
