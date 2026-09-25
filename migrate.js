const fs = require('fs');
const path = require('path');

const files = [
  'arsenal.html', 'habilidades.html', 'instrucoes-mesa.html', 
  'miniaturas.html', 'oneshots.html', 'produto.html', 
  'sistema.html', 'sons.html', 'admin.html'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Extract content between <main> and </main>
  let mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let innerHtml = mainMatch ? mainMatch[1] : '';

  if (!mainMatch) {
     let bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
     if (bodyMatch) innerHtml = bodyMatch[1];
  }

  // Remove header and footer if present in the chunk
  innerHtml = innerHtml.replace(/<header[\s\S]*?<\/header>/gi, '');
  innerHtml = innerHtml.replace(/<footer[\s\S]*?<\/footer>/gi, '');

  // Convert HTML attributes to JSX
  innerHtml = innerHtml
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/style="([^"]*)"/g, (match, p1) => {
      const rules = p1.split(';').filter(r => r.trim());
      const styleObj = rules.map(rule => {
        let [key, ...valParts] = rule.split(':');
        let val = valParts.join(':');
        if(!key || !val) return '';
        key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        return `${key}: '${val.trim().replace(/'/g, "\\'")}'`;
      }).filter(x=>x).join(', ');
      return `style={{${styleObj}}}`;
    })
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
    .replace(/<img([^>]*[^\/])>/gi, '<img$1 />')
    .replace(/<input([^>]*[^\/])>/gi, '<input$1 />')
    .replace(/<br([^>]*[^\/])>/gi, '<br$1 />')
    .replace(/<hr([^>]*[^\/])>/gi, '<hr$1 />')
    .replace(/onclick="([^"]*)"/gi, 'onClick={() => { /* $1 */ }}')
    .replace(/onchange="([^"]*)"/gi, 'onChange={() => { /* $1 */ }}')
    .replace(/onkeyup="([^"]*)"/gi, 'onKeyUp={() => { /* $1 */ }}')
    .replace(/onerror="([^"]*)"/gi, 'onError={() => { /* $1 */ }}');

  // Extract script logic
  let scriptLogic = "";
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
      scriptLogic += match[1] + "\n";
  }

  const componentName = file.replace('.html', '')
                            .split('-')
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join('');

  const tsxContent = `
import React, { useEffect } from 'react';

export function ${componentName}() {
  useEffect(() => {
    /* Legacy Vanilla JS (Needs manual migration):
${scriptLogic}
    */
  }, []);

  return (
    <div className="font-sans">
      ${innerHtml}
    </div>
  );
}
`;

  fs.writeFileSync(path.join('frontend', 'src', 'pages', `${componentName}.tsx`), tsxContent);
  console.log(`Migrated ${file} -> ${componentName}.tsx`);
});
