import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {serve,root} from './server.mjs';
import {avatarManifest} from '../avatar-manifest.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const {server,base}=await serve();const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 assert.equal(avatarManifest.length,40);
 const hashes=new Set();for(const a of avatarManifest){assert.equal(a.status,'generated');const bytes=await fs.readFile(path.join(root,a.src));hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));assert.ok(bytes.length<30000);}assert.equal(hashes.size,40);
 const p=await browser.newPage({viewport:{width:1100,height:1100}});await p.goto(base);
 const profiles=await p.evaluate(()=>Object.values(SV002.getState().profiles).filter(p=>/^(bs-|bg-)/.test(p.id)));
 assert.equal(profiles.length,40);for(const a of avatarManifest)assert.equal(profiles.find(p=>p.id===a.personId).photo,a.src);
 await p.setContent('<html><body style="font:14px system-ui;background:#eaf3fc"><h1>V002 — 40 adulti inesistenti · immagini generate con AI</h1><main style="display:grid;grid-template-columns:repeat(7,1fr);gap:12px">'+avatarManifest.map(a=>`<figure style="margin:0"><img src="${base+a.src}" style="width:100%;border-radius:16px"><figcaption>${a.personId}</figcaption></figure>`).join('')+'</main></body></html>');
 await p.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>img.decode()));});
 assert.equal(await p.locator('img').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth===256&&i.naturalHeight===256)),true);
 await p.screenshot({path:path.join(root,'docs/avatars-contact-sheet.png'),fullPage:true});
 await p.goto(base);await p.locator('#mainNav [data-view=groups]').click();await p.locator('.group-item[data-id=bs-friends]').click();assert.equal(await p.locator('img[src*="bs-friends-"]').count(),14);
 await p.locator('.upcoming-section [data-action=open-match]').first().click();assert.equal(await p.locator('.court img').count(),12);
 console.log('PASS 40 distinct optimized local portraits; stable profile/member/court associations; 256px dimensions');
 await fs.writeFile(path.join(root,'docs/avatar-test-results.json'),JSON.stringify({passed:true,portraits:40,uniqueHashes:hashes.size,dimensions:'256x256',at:new Date().toISOString()},null,2));
}finally{await browser.close();server.close();}

