import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
const modules=['catalog','math','geometry','renderer','main'];
await mkdir('dist',{recursive:true});
await cp('src','dist/src',{recursive:true});
const html=await readFile('index.html','utf8');await writeFile('dist/index.html',html);
// Import maps retain ES module boundaries while embedding every byte for file:// use.
const imports={};for(const name of modules){const source=(await readFile(`src/${name}.js`,'utf8')).replace(/from '\.\/(\w+)\.js'/g,(_,id)=>`from 'astra:${id}'`);imports[`astra:${name}`]=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;}
const css=await readFile('src/style.css','utf8');
const standalone=html.replace('<link rel="stylesheet" href="./src/style.css">',`<style>${css}</style>`).replace('<script type="module" src="./src/main.js"></script>',`<script type="importmap">${JSON.stringify({imports})}</script><script type="module">import 'astra:main';</script>`);
await writeFile('dist/astra-explosion-standalone.html',standalone);
console.log(`Built static site and standalone HTML (${Buffer.byteLength(standalone).toLocaleString()} bytes). No external assets.`);
