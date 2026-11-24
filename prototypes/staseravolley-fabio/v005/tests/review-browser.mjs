import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {serve} from '../tools/serve.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'@playwright/test');
const {server,base}=await serve();
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[],metrics=[],shots=new URL('../docs/',import.meta.url);
const nav=(p,view)=>p.locator(view==='messages'?'#messagesButton':`#mainNav [data-view="${view==='bookings'?'home':view}"]`).click();
async function options(p,id){await p.locator('.header-menu>summary').click();await p.locator('#'+id).click();}
async function actor(p,id){await p.locator('#labTools>summary').click();await p.locator('#demoActor').selectOption(id);await p.locator('#labTools>summary').click();}
async function group(p,id){await nav(p,'groups');await p.locator('[data-action=browse-groups]').click();await p.locator(`.group-item[data-id="${id}"]`).click();}
const state=p=>p.evaluate(()=>SV005.getState());
async function check(name,fn,width=390,height=844){
 const ctx=await browser.newContext({viewport:{width,height},timezoneId:'Europe/Rome',colorScheme:'light',reducedMotion:'reduce',geolocation:{latitude:45.54,longitude:10.22},permissions:['geolocation']});
 const p=await ctx.newPage(),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await p.addInitScript(()=>{localStorage.setItem('staseravolley-v003-state-v1','original-state-untouched');localStorage.setItem('staseravolley-v003-settings-v1','original-settings-untouched');});
  await p.goto(base,{waitUntil:'networkidle'});if(await p.locator('#privacyBanner').isVisible())await p.locator('#privacyBanner [data-privacy=allow]').click();await fn(p);
  assert.deepEqual(errors,[],'Browser errors');assert.deepEqual(await p.evaluate(()=>SV005.missingTranslations()),[]);
  assert.equal(await p.evaluate(()=>localStorage.getItem('staseravolley-v003-state-v1')),'original-state-untouched');
  assert.equal(await p.evaluate(()=>localStorage.getItem('staseravolley-v003-settings-v1')),'original-settings-untouched');
  results.push({name,status:'passed',width,height});console.log('PASS',name);
 }catch(e){results.push({name,status:'failed',error:e.stack,width,height});console.log('FAIL',name,e.message);await p.screenshot({path:new URL('failure-'+results.length+'.png',shots).pathname.slice(1),fullPage:true});}
 finally{await ctx.close();}
}
try{
 await check('Compact mobile results and accessible filters',async p=>{
  const metric=await p.evaluate(()=>{const cards=[...document.querySelectorAll('.match-card')],navTop=document.querySelector('#mainNav').getBoundingClientRect().top;return {firstCardTop:cards[0].getBoundingClientRect().top,fullCards:cards.filter(c=>c.getBoundingClientRect().bottom<=navTop).length,width:innerWidth,height:innerHeight};});metrics.push(metric);assert.ok(metric.firstCardTop<365);assert.ok(metric.fullCards>=2);
  await p.screenshot({path:new URL('after-mobile.png',shots).pathname.slice(1)});
  await p.locator('[data-action=open-filters]').click();assert.equal(await p.locator('#modal').getAttribute('aria-labelledby'),'dialogTitle');assert.equal(await p.locator('#dialogTitle').innerText(),'Filtri e ordine');
  await p.locator('#exploreProvince').selectOption('BS');assert.equal(await p.locator('.match-card').count(),2);
  await p.locator('#exploreSort').selectOption('price');await p.screenshot({path:new URL('filters-mobile.png',shots).pathname.slice(1)});
  await p.keyboard.press('Escape');assert.equal(await p.locator('#modal').evaluate(el=>el.open),false);assert.equal(await p.locator('[data-action=open-filters]').evaluate(el=>el===document.activeElement),true);
  const prices=await p.locator('.match-numbers b').allTextContents();assert.ok(prices[0].includes('7,00'));assert.ok(prices[1].includes('8,00'));
  await p.locator('[data-action=open-filters]').click();await p.locator('#exploreSearch').fill('Leonessa');assert.equal(await p.locator('.match-card').count(),1);
  await p.locator('[data-action=reset-discovery]').click();assert.equal(await p.locator('.match-card').count(),6);
  const todayCount=await p.evaluate(async()=>{const {dateKey}=await import(new URL('dates.js',location.href));return Object.values(SV005.getState().matches).filter(m=>m.status==='active'&&m.date===dateKey(Date.now())&&Date.parse(m.startsAt)>Date.now()).length;});
  await p.locator('[data-action=date-filter][data-value=today]').click();assert.equal(await p.locator('.match-card').count(),todayCount);
  await p.locator('[data-action=date-filter][data-value=all]').click();assert.equal(await p.locator('.match-card').count(),6);
  assert.equal(await p.locator('#requestsButton').isVisible(),false);
 });
 await check('Each selected event opens its own Info and Maps destination',async p=>{
  const s=await state(p),ids=await p.locator('.match-card').evaluateAll(els=>els.map(e=>e.dataset.id));
  for(const id of ids){await p.locator(`.match-card[data-id="${id}"]`).click();assert.equal(await p.locator('#tab-court').getAttribute('aria-selected'),'true');assert.equal(await p.locator('.match-summary h2').innerText(),s.groups[s.matches[id].groupId].name);const href=await p.locator('a.map-link').first().getAttribute('href');assert.ok(decodeURIComponent(href).includes(s.matches[id].city));await nav(p,'explore');}
 });
 await check('Location search GPS ordering and functional geographic map',async p=>{
  await p.locator('#nearbyTown').fill('Brescia');await p.locator('#nearbyForm button[type=submit]').click();await p.locator('.origin-summary').waitFor();assert.ok((await p.locator('.match-card').first().innerText()).includes('Brescia Volley Friends'));
  assert.equal(await p.locator('.distance-label').count(),6);await p.locator('[data-action=open-filters]').click();assert.equal(await p.locator('#exploreSort').inputValue(),'distance');await p.locator('#exploreProvince').selectOption('BS');await p.keyboard.press('Escape');
  await p.locator('[data-action=explore-view]').click();await p.locator('.leaflet-marker-icon').first().waitFor();assert.equal(JSON.parse(await p.locator('#eventMap').getAttribute('data-groups')).length,2);
  await p.waitForFunction(()=>[...document.querySelectorAll('.leaflet-tile')].some(img=>img.complete&&img.naturalWidth>0));
  if(await p.locator('.event-map-card').count())await p.locator('.event-map-card').first().click();else{await p.locator('.leaflet-marker-icon').first().click();await p.locator('.event-popup-row').first().click();}assert.equal(await p.locator('#tab-court').getAttribute('aria-selected'),'true');
  await nav(p,'explore');await p.locator('[data-action=my-position]').click();await p.waitForFunction(()=>document.querySelector('.origin-summary')?.textContent.includes('La mia posizione'));assert.ok((await p.locator('.origin-summary').innerText()).includes('posizione'));
 });
 await check('Group membership reserve booking payment and cancellation',async p=>{
  await group(p,'bs-leonessa');await p.locator('[data-action=join-group]').click();await p.locator('.upcoming-section [data-action=open-match]').first().click();
  assert.equal(await p.locator('.court-player').count(),12);assert.equal(await p.locator('.reserve-seat.open-seat').count(),2);assert.equal(await p.locator('.court-player img').count(),12);
  await p.locator('#bookButton').click();assert.equal(await p.locator('#dialogMessage').innerText(),'Scegli un posto nel campo tra quelli a disposizione');await p.locator('#dialogOK').click();
  await p.locator('[data-action=select-seat][data-slot=r3]').click();assert.equal(await p.locator('#bookButton').evaluate(el=>el===document.activeElement),true);await p.locator('#bookButton').click();let s=await state(p),b=Object.values(s.bookings).find(b=>b.personId==='demo-you'&&b.status==='confirmed'&&s.matches[b.matchId].groupId==='bs-leonessa');assert.ok(b);
  await p.locator('#paymentReminder [data-action=payment]').click();await p.locator('#modal select').selectOption('PayPal');await p.locator('#confirmDemoPayment').click();s=await state(p);assert.equal(Object.values(s.payments).find(x=>x.bookingId===b.id).totalCents,840);
  await p.locator('#tab-court').click();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:new URL('detail-mobile.png',shots).pathname.slice(1)});
  await p.locator('[data-action=cancel-booking]').first().click();await p.locator('[data-action=confirm-dialog]').click();assert.equal((await state(p)).bookings[b.id].status,'cancelled');assert.equal(await p.locator('.reserve-seat.open-seat').count(),2);
 });
 await check('Approval and organizer access remain functional',async p=>{
  await group(p,'bs-friends');await p.locator('[data-action=join-group]').click();let s=await state(p),r=Object.values(s.requests).find(r=>r.personId==='demo-you'&&r.type==='membership'&&r.status==='pending');assert.ok(r);
  await actor(p,'bs-friends-01');await options(p,'requestsButton');await p.locator(`[data-action=decide][data-id="${r.id}"][data-accept=true]`).click();assert.equal((await state(p)).requests[r.id].status,'accepted');
  await actor(p,'demo-you');await group(p,'bs-friends');await p.locator('.upcoming-section [data-action=open-match]').first().click();await p.locator('[data-action=select-seat][data-slot=r3]').click();await p.locator('#bookButton').click();s=await state(p);assert.ok(Object.values(s.bookings).some(b=>b.personId==='demo-you'&&b.status==='pending'));assert.equal(await p.locator('[data-action=payment]').count(),0);
 });
 await check('Profile save chat empty state and shared-group messaging',async p=>{
  await nav(p,'profile');await p.locator('[data-action=edit-profile]').first().click();await p.locator('#profileForm [name=name]').fill('Giocatore Test');await p.locator('#profileForm button[type=submit]').click();assert.equal(await p.locator('.profile-hero h2').innerText(),'Giocatore Test');
  await nav(p,'messages');assert.equal(await p.locator('.conversation-row').count(),0);assert.equal(await p.locator('#chatSearch').count(),0);
  await group(p,'bs-leonessa');await p.locator('[data-action=join-group]').click();await nav(p,'messages');await p.locator('[data-action=chat-mode][data-mode=contacts]').click();assert.equal(await p.locator('.conversation-row').count(),0);
  const s=await state(p),peer=Object.values(s.memberships).find(m=>m.groupId==='bs-leonessa'&&m.personId!=='demo-you');await p.locator('#chatSearch').fill(s.profiles[peer.personId].name);await p.locator('[data-action=open-chat]').first().click();await p.locator('#chatText').fill('Ci vediamo in campo! 🏐');await p.locator('#chatForm button[type=submit]').click();assert.equal(await p.locator('.chat-bubble.mine').count(),1);
 });
 await check('Italian English dark theme persistence keyboard tour',async p=>{
  await options(p,'settingsButton');await p.locator('#languageSelect').selectOption('en');await p.locator('#themeSelect').selectOption('dark');await nav(p,'explore');assert.equal(await p.locator('h1').innerText(),'Play near you.');assert.equal(await p.locator('.header-menu>summary').getAttribute('aria-label'),'More options');
  await p.screenshot({path:new URL('after-mobile-dark.png',shots).pathname.slice(1)});await p.reload();assert.equal(await p.locator('h1').innerText(),'Play near you.');assert.equal(await p.locator('body').getAttribute('data-theme'),'dark');
  await options(p,'tutorialButton');assert.equal(await p.locator('#tourDialog').evaluate(el=>el.open),true);await p.keyboard.press('ArrowRight');assert.ok((await p.locator('#tourHeading').innerText()).includes('Filters'));await p.keyboard.press('Escape');
  await options(p,'settingsButton');await p.locator('#languageSelect').selectOption('it');await nav(p,'explore');assert.equal(await p.locator('h1').innerText(),'Si gioca vicino a te.');
 });
 for(const width of [320,820,1440])await check('Responsive navigation width '+width,async p=>{
  for(const view of ['explore','groups','messages','profile']){await nav(p,view);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,view+' overflow');}
  await nav(p,'explore');if(width===1440)await p.screenshot({path:new URL('after-desktop.png',shots).pathname.slice(1)});
 },width,900);
}finally{
 await fs.writeFile(new URL('browser-results.json',shots),JSON.stringify({at:new Date().toISOString(),browser:'Microsoft Edge headless',results,metrics},null,2));await browser.close();server.close();
}
if(results.some(r=>r.status==='failed'))process.exitCode=1;
