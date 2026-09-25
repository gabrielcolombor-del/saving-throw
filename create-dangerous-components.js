const fs = require('fs');
const path = require('path');

const files = [
  'admin.html', 'arsenal.html', 'miniaturas.html', 'produto.html', 
  'sons.html', 'instrucoes-mesa.html', 'oneshots.html', 'sistema.html'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  let mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let innerHtml = mainMatch ? mainMatch[1] : '';

  if (!mainMatch) {
     let bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
     if (bodyMatch) innerHtml = bodyMatch[1];
  }

  innerHtml = innerHtml.replace(/<header[\s\S]*?<\/header>/gi, '');
  innerHtml = innerHtml.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  innerHtml = innerHtml.replace(/<script[\s\S]*?<\/script>/gi, '');

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

  let funcs = scriptLogic.match(/function\s+([a-zA-Z0-9_]+)\s*\(/g);
  let bindings = '';
  if (funcs) {
     funcs.forEach(f => {
        let name = f.replace('function', '').replace('(', '').trim();
        bindings += `(window as any).${name} = ${name};\n`;
     });
  }

  // Replace const/let with var to prevent block-scope redeclaration errors on remounts
  let safeScriptLogic = scriptLogic.replace(/\bconst\b/g, 'var').replace(/\blet\b/g, 'var');

  const tsxContent = `
import React, { useEffect } from 'react';

export function ${componentName}() {
  useEffect(() => {
    try {
      ${safeScriptLogic}
      ${bindings}
    } catch(e) {
      console.error("Error in legacy script for ${componentName}:", e);
    }
  }, []);

  return (
    <div className="font-sans" dangerouslySetInnerHTML={{ __html: \`${innerHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
  );
}
`;

  fs.writeFileSync(path.join('frontend', 'src', 'pages', `${componentName}.tsx`), tsxContent);
  console.log(`Migrated safely ${file} -> ${componentName}.tsx`);
});
