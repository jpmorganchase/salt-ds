import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const dir=path.join(root,'packages/icons/scripts/artwork');
const out=path.join(root,'dist/icon-corner-consistency/evidence');
await fs.mkdir(out,{recursive:true});
const configuration=JSON.parse(await fs.readFile(path.join(dir,'corner-reviews.json'),'utf8'));
if(!configuration.comparisonBaseline)throw Error('Set comparisonBaseline for a before/after evidence run.');
import {chromium} from 'playwright';
const before=JSON.parse(await fs.readFile(path.join(root,configuration.comparisonBaseline)));
const names=Object.keys(before).sort();
const rows=await Promise.all(names.map(async name=>({name,before:before[name],svg:(await fs.readFile(path.join(root,'packages/icons/src/SVG',name),'utf8')).replace(/\r\n/g,'\n')})));
const render=(s,w,size)=>s.replace('<svg ',`<svg style="width:${size}px;height:${size}px" `).replace(/stroke-width="([\d.]+)"/g,(_,n)=>`stroke-width="${+n*w/.67}"`);
const css='body{margin:0;font:12px Arial;color:#111;background:#ddd}.grid{display:grid;grid-template-columns:repeat(4,280px);gap:4px}.card{padding:10px;background:white;height:232px}.title{height:18px}.large{display:flex;align-items:center;justify-content:space-around;height:136px}.samples{display:flex;gap:16px;align-items:center;padding:4px 10px;height:25px}.samples div{display:flex;gap:4px;align-items:center}.dark{background:#15202a;color:#fff}.changed{color:#a43a11}';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1140,height:1290},deviceScaleFactor:1});
for(let start=0;start<rows.length;start+=20){
 const html=`<style>${css}</style><div class=grid>${rows.slice(start,start+20).map(r=>`<div class=card><div class="title ${r.before===r.svg?'':'changed'}">${r.name} ${r.before===r.svg?'':'• revised'}</div><div class=large>${render(r.before,1.5,64)}${render(r.svg,1.5,128)}</div>${['light','dark'].map(t=>`<div class="samples ${t}">${[.67,1,4/3,1.5].map(w=>`<div>${render(r.svg,w,12)}${render(r.svg,w,16)}</div>`).join('')}</div>`).join('')}</div>`).join('')}</div>`;
 await page.setContent(html);await page.screenshot({path:path.join(out,`catalogue-${String(start/20+1).padStart(2,'0')}.png`),fullPage:true});
}
await fs.writeFile(path.join(out,'catalogue-order.json'),JSON.stringify(rows.map(r=>r.name)));
await browser.close();console.log('Rendered',Math.ceil(rows.length/20),'catalogue sheets.');
