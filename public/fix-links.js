(function() {
    function fixLinks() {
        const editor = document.querySelector('.ProseMirror, [contenteditable="true"]');
        if (!editor) return;

        let content = editor.innerHTML;
        let fixed = 0;

        // Replace the two specific patterns
        content = content.replace(/https:\/\/fineystjackets\.com\/us\/collections\//g, () => {
            fixed++;
            return 'https://www.fineystjackets.com/us/collections/';
        });

        content = content.replace(/https:\/\/www\.fineystjackets\.com\/collections\//g, () => {
            fixed++;
            return 'https://www.fineystjackets.com/us/collections/';
        });

        if (fixed > 0) {
            editor.innerHTML = content;
            alert(`Fixed ${fixed} link(s)`);
        } else {
            alert('No links to fix');
        }
    }

    const btn = document.createElement('button');
    btn.innerHTML = 'Fix Links';
    btn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;background:#007bff;color:white;border:none;padding:10px;border-radius:5px;cursor:pointer';
    btn.onclick = fixLinks;
    document.body.appendChild(btn);
})();