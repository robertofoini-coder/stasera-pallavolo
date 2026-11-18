import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=Array.from({length:14},(_,i)=>i+1).flatMap(n=>['bs-friends','bs-leonessa'].map(group=>{const personId=`${group}-${String(n).padStart(2,'0')}`,src=`assets/avatars/${personId}.jpg`,file=path.join(root,src),exists=fs.existsSync(file);return {personId,src,status:exists?'generated':'missing',artificial:true,adult:true,...(exists?{bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}:{})};}));
fs.writeFileSync(path.join(root,'avatar-manifest.js'),'// Local optimized portraits of fictional adults. Stable identity mapping.\nexport const avatarManifest='+JSON.stringify(manifest,null,2)+';\n');
fs.writeFileSync(path.join(root,'docs/avatar-manifest.json'),JSON.stringify({generator:'Built-in ImageGen',purpose:'Fictional adult demo portraits; no real identities',size:'256 x 256 JPEG',assets:manifest},null,2)+'\n');
console.log('Portrait assets',manifest.filter(p=>p.status==='generated').length+'/28');
