const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.join('frontend', 'src', 'pages')).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(path.join('frontend', 'src', 'pages', file), 'utf8');

  // Uncomment the legacy block
  content = content.replace(/\/\* Legacy Vanilla JS \(Needs manual migration\):([\s\S]*?)\*\//, (match, p1) => {
    let js = p1;
    // Find all function declarations: function foo(a) {
    let funcs = js.match(/function\s+([a-zA-Z0-9_]+)\s*\(/g);
    let bindings = '';
    if (funcs) {
       funcs.forEach(f => {
          let name = f.replace('function', '').replace('(', '').trim();
          bindings += `(window as any).${name} = ${name};\n`;
       });
    }
    return js + '\n// Expose to window for inline React handlers\n' + bindings;
  });

  // Fix React inline events
  content = content.replace(/onClick=\{\(\) => \{ \/\* (.*?) \*\/ \}\}/g, "onClick={(event) => { window.event = event; new Function('$1')(); }}");
  content = content.replace(/onChange=\{\(\) => \{ \/\* (.*?) \*\/ \}\}/g, "onChange={(event) => { window.event = event; new Function('$1')(); }}");
  content = content.replace(/onKeyUp=\{\(\) => \{ \/\* (.*?) \*\/ \}\}/g, "onKeyUp={(event) => { window.event = event; new Function('$1')(); }}");
  content = content.replace(/onError=\{\(\) => \{ \/\* (.*?) \*\/ \}\}/g, "onError={(event) => { window.event = event; new Function('$1')(); }}");

  // Fix some specific variable scoping issues in vanilla JS
  content = content.replace(/const (classSelect|cycleSelect|schoolSelect|searchInput|spellsContainer|loadingDiv|emptyStateDiv|resultsCountSpan|sourceBadge|spellSlotsManager|characterLevelInput|longRestBtn|slotsContainer)/g, 'var $1');

  fs.writeFileSync(path.join('frontend', 'src', 'pages', file), content);
  console.log(`Fixed ${file}`);
});
