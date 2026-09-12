import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { Script } from 'node:vm';

// Deliberately limited bundler for this repository's named const/function/class
// exports. Not a general ES-module transpiler: unsupported syntax fails the build.
const modules = ['catalog', 'math', 'geometry', 'renderer', 'main'];
const available = new Set();
const chunks = ['(function () { "use strict"; const __astraModules = Object.create(null);'];
for (const name of modules) {
  let source = await readFile(`src/${name}.js`, 'utf8');
  source = source.replace(/^import\s*\{([^}]+)\}\s*from\s*['"]\.\/([\w-]+)\.js['"];?[ \t]*$/gm, (_, names, dependency) => {
    if (!available.has(dependency)) throw new Error(`Unknown or unordered import: ${name} -> ${dependency}`);
    const bindings = names.split(',').map(binding => {
      const match = binding.trim().match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/);
      if (!match) throw new Error(`Unsupported import binding in ${name}: ${binding}`);
      return match[2] ? `${match[1]}: ${match[2]}` : match[1];
    }).join(', ');
    return `const { ${bindings} } = __astraModules[${JSON.stringify(dependency)}];`;
  });
  const exports = [];
  source = source.replace(/^export\s+(const|function|class)\s+([\w$]+)/gm, (_, kind, id) => {
    exports.push(id);
    return `${kind} ${id}`;
  });
  if (/^\s*(?:import|export)\b/m.test(source) || /\bimport\s*(?:\(|\.)/.test(source)) {
    throw new Error(`Unsupported module syntax in src/${name}.js`);
  }
  chunks.push(`__astraModules[${JSON.stringify(name)}] = (function () {\n${source}\nreturn Object.freeze({ ${exports.join(', ')} });\n})();`);
  available.add(name);
}
chunks.push('})();');
const bundle = chunks.join('\n');
new Script(bundle, { filename: 'astra.bundle.js' });
const html = await readFile('index.html', 'utf8');
const css = await readFile('src/style.css', 'utf8');
const cssMarker = '<link rel="stylesheet" href="./src/style.css">';
const jsMarker = '<script type="module" src="./src/main.js"></script>';
if (!html.includes(cssMarker) || !html.includes(jsMarker)) throw new Error('Entry markers missing');
const standalone = html
  .replace(cssMarker, () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`)
  .replace(jsMarker, () => `<script>${bundle.replace(/<\/script/gi, '<\\/script')}</script>`);
await mkdir('dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });
// Both user-facing entries are self-contained; double-clicking index.html no
// longer accidentally selects a file:// ES-module application.
for (const name of ['index.html', 'astra-explosion-standalone.html']) {
  await writeFile(`dist/${name}`, standalone);
}
await writeFile('dist/.nojekyll', '');
console.log(`Built two self-contained classic-script entries (${Buffer.byteLength(standalone)} bytes each). No import maps, data modules, eval, or runtime fetch.`);
