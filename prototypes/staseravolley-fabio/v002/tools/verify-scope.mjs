import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=path.resolve(root,'../../..');
const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();
const baseline=JSON.parse(await fs.readFile(path.join(root,'docs/source-baseline.json'),'utf8'));
const inventory=async dir=>{const out=[];async function walk(folder){for(const e of await fs.readdir(folder,{withFileTypes:true})){const f=path.join(folder,e.name);if(e.isDirectory())await walk(f);else{const bytes=await fs.readFile(f);out.push({path:path.relative(path.dirname(root),f).replaceAll('\\','/'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}}await walk(path.resolve(root,'..',dir));return out.sort((a,b)=>a.path.localeCompare(b.path));};
const versions={};for(const v of ['v000','v001']){const actual=await inventory(v);assert.deepEqual(actual,[...baseline[v]].sort((a,b)=>a.path.localeCompare(b.path)));versions[v]={unchanged:true,files:actual.length,tree:git('rev-parse',`HEAD:prototypes/staseravolley-fabio/${v}`),inventory:actual};}
const branch=git('branch','--show-current'),head=git('rev-parse','HEAD');assert.equal(branch,'Html');assert.equal(head,baseline.commit);
const status=git('status','--porcelain','--untracked-files=all');for(const line of status.split('\n').filter(Boolean))assert.ok(line.slice(3).startsWith('prototypes/staseravolley-fabio/v002/'),'Change outside V002: '+line);
assert.equal(git('diff','--stat'),'');assert.equal(git('diff','--cached','--stat'),'');
await fs.writeFile(path.join(root,'docs/final-verification.json'),JSON.stringify({at:new Date().toISOString(),branch,head,versions,changesOnlyV002:true,trackedDiffEmpty:true,indexEmpty:true,status},null,2));
console.log(JSON.stringify({branch,head,V000:versions.v000.files,V001:versions.v001.files,unchanged:true,changesOnlyV002:true},null,2));
