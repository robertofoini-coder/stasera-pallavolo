import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {serve} from '../tools/serve.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'docs/screens'),{chromium}=await import(process.env.PLAYWRIGHT_MODULE||'@playwright/test'),{server,base}=await serve(),browser=await chromium.launch({channel:'msedge',headless:true}),results=[],errors=[];
const nav=(p,key)=>p.locator(`#mainNav [data-view="${key}"]`).click();
async function options(p,id){if(!await p.locator('.header-menu').evaluate(e=>e.open))await p.locator('.header-menu>summary').click();await p.locator('#'+id).click();}
async function group(p,id){await nav(p,'groups');await p.locator('[data-action=browse-groups]').click();await p.locator(`.group-item[data-id="${id}"]`).click();}
async function check(p,name,width){assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' overflow');assert.deepEqual(await p.evaluate(()=>SV004.missingTranslations()),[]);results.push({name,width,status:'passed'});}
try{
 for(const [width,lang,theme] of [[320,'en','dark'],[820,'it','light']]){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',timezoneId:'Europe/Rome'}),p=await ctx.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
  try{
   await p.goto(base,{waitUntil:'networkidle'});await p.evaluate(({lang,theme})=>localStorage.setItem(SV004.keys.settings,JSON.stringify({actorId:'bs-friends-01',language:lang,theme,preview:'auto'})),{lang,theme});await p.reload({waitUntil:'networkidle'});
   await check(p,'explore',width);assert.equal(await p.locator('.quick-filters').evaluate(el=>{const date=el.querySelector('.date-filters').lastElementChild.getBoundingClientRect(),filter=el.querySelector('.filter-trigger').getBoundingClientRect();return date.right>filter.left-3;}),false,'date shortcuts overlap filters');
   for(const key of ['groups','bookings','messages','profile']){await nav(p,key);await check(p,key,width);}
   await p.locator('[data-action=edit-profile]').click();await check(p,'profile-editor',width);await p.locator('#profileForm [name=days]').last().focus();await p.keyboard.press('Space');await p.locator('#profileForm button[type=submit]').click();
   await group(p,'bs-friends');await check(p,'group',width);await p.locator('[data-action=group-tab][data-value=evenings]').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('[data-action=group-tab][data-value=members]').getAttribute('aria-selected'),'true');await check(p,'members',width);await p.keyboard.press('ArrowRight');await check(p,'group-info',width);
   await p.locator('.group-admin-section [data-action=edit-group]').click();await check(p,'group-editor',width);await p.locator('#groupForm button[type=submit]').click();await p.locator('[data-action=group-tab][data-value=evenings]').click();await p.locator('[data-action=create-match]').click();await check(p,'match-editor',width);await p.locator('#matchForm [name=weekly]').check();await check(p,'recurrence-editor',width);await p.locator('.form-actions [data-action=open-group]').click();
   await p.locator('.upcoming-section [data-action=open-match]').first().click();await check(p,'court',width);await p.locator('#tab-info').click();await check(p,'match-info',width);await p.locator('#tab-participants').click();await check(p,'participants',width);
   await options(p,'requestsButton');await check(p,'requests',width);await options(p,'notificationsButton');await check(p,'notices',width);await options(p,'settingsButton');await check(p,'settings',width);await p.locator('.lab-settings>summary').click();await check(p,'prototype-tools',width);
   await nav(p,'messages');await p.locator('[data-action=chat-mode][data-mode=contacts]').click();await check(p,'new-chat',width);await p.locator('#chatSearch').fill('Marco');await check(p,'contact-results',width);
   await options(p,'tutorialButton');await check(p,'tutorial',width);await p.keyboard.press('Escape');
   await p.screenshot({path:path.join(out,'responsive-'+width+'.png')});console.log('PASS responsive',width,lang,theme);
  }catch(e){results.push({width,status:'failed',error:e.stack});await p.screenshot({path:path.join(out,'responsive-failure-'+width+'.png'),fullPage:true});console.log('FAIL',width,e.message);}finally{await ctx.close();}
 }
}finally{await browser.close();server.close();await fs.writeFile(path.join(root,'docs/responsive-results.json'),JSON.stringify({at:new Date().toISOString(),results,errors},null,2));}
if(errors.length||results.some(r=>r.status==='failed'))process.exitCode=1;
