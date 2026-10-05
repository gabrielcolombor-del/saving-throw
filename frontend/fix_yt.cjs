const fs = require('fs');
const file = 'src/pages/Sons.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /        function onYouTubeIframeAPIReady\(\) \{/;
const replacement = `        function initYouTubePlayerSons() {`;
content = content.replace(targetRegex, replacement);

const windowTarget = `(window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;`;
const windowReplacement = `        if (window.YT && window.YT.Player) {
            initYouTubePlayerSons();
        } else {
            (window as any).onYouTubeIframeAPIReady = initYouTubePlayerSons;
        }`;

if (content.includes(windowTarget)) {
    content = content.replace(windowTarget, windowReplacement);
} else {
    // maybe I need to regex it in case of spaces
    const winReg = /\(window\s+as\s+any\)\.onYouTubeIframeAPIReady\s*=\s*onYouTubeIframeAPIReady;/;
    content = content.replace(winReg, windowReplacement);
}

fs.writeFileSync(file, content);
console.log('Fixed Sons.tsx');
