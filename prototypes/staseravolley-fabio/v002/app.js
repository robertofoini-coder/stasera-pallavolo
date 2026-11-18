import {mountGroupMap} from './group-map.js';
import {cropImage} from './crop.js';
import {paymentDues,comparedVersions} from './experience.js';
import {createTour} from './tour.js';
import {createSeed,upgradeDemoPhotos} from './data.js';
import {transition,reconcile,STATE_KEY,SETTINGS_KEY,canManage,myBooking,memberOf} from './core.js';
import {translator,missingKeys} from './translations.js';
import {buildViews,h} from './views.js';
import {avatarManifest} from './avatar-manifest.js';
const $=s=>document.querySelector(s);
const defaults={language:'it',theme:'auto',preview:'auto',actorId:'demo-you'};
let settings={...defaults},s=null,fatal=false,dialogReturn=null,confirmCallback=null,toastTimer=null;
const ui={view:'explore',matchTab:'court',groupView:'list',dateFilter:'all',selections:{},drafts:{},adminUnlocked:false};
const avatarFiles=new Set(avatarManifest.filter(a=>a.status==='generated').map(a=>a.src));
let t=translator('it');
const icons={explore:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-6h6v6"/>',bookings:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M7 11h10M8 15h3"/>',groups:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/>',profile:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21c.5-4 3-6 7-6s6.5 2 7 6"/>'};
const svg=key=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg>`;
function validateState(value){return value?.schemaVersion===1&&['profiles','groups','memberships','matches','bookings','requests','notifications','payments','ratings','invitations'].every(k=>value[k]&&typeof value[k]==='object')&&Array.isArray(value.history)&&Array.isArray(value.authorizedAdmins)&&Number.isInteger(value.seq)&&Number.isInteger(value.revision)&&value.config?.holdHours>0;}
function store(next){localStorage.setItem(STATE_KEY,JSON.stringify(next));s=next;}
function saveSettings(){localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}
function setTheme(){document.body.dataset.preview=settings.preview||'auto';document.body.dataset.theme=settings.theme==='dark'||settings.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
function load(){try{const raw=localStorage.getItem(STATE_KEY);s=raw?JSON.parse(raw):createSeed();if(!validateState(s))throw Error('invalidStorage');upgradeDemoPhotos(s,avatarManifest);for(const asset of avatarManifest){const profile=s.profiles[asset.personId];if(profile?.photo===asset.src.replace('.jpg','.webp'))profile.photo=asset.src;}const stored=localStorage.getItem(SETTINGS_KEY);if(stored){const value=JSON.parse(stored);settings={...defaults,language:value.language==='en'?'en':'it',theme:['light','dark','auto'].includes(value.theme)?value.theme:'auto',preview:['auto','mobile','tablet','desktop'].includes(value.preview)?value.preview:'auto',actorId:s.profiles[value.actorId]?value.actorId:'demo-you'};}store(reconcile(s));saveSettings();t=translator(settings.language);setTheme();}catch(e){fatal=true;}}
function syncTime(){if(!s||fatal)return;const updated=reconcile(s);if(updated!==s){try{store(updated);render();}catch{showMessage('storageError');}}}
function perform(action,p={}){try{const persisted=JSON.parse(localStorage.getItem(STATE_KEY)||'null');if(persisted&&persisted.revision!==s.revision){if(!validateState(persisted))throw Error('invalidStorage');store(reconcile(persisted));render();showMessage('conflict');return false;}const current=reconcile(s);if(current!==s)store(current);const next=transition(s,settings.actorId,action,p);store(next);render();return true;}catch(e){render();showMessage(typeof e.code==='string'?e.code:(['invalidStorage'].includes(e.message)?e.message:'storageError'));return false;}}
function toast(key){clearTimeout(toastTimer);$('#toastText').textContent=t(key);$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3400);}
function views(){return buildViews({s,ui,settings,t,now:Date.now(),avatarFiles});}
function render(){if(fatal){$('#viewRoot').innerHTML=`<section class="fatal-state"><h1>${h(t('invalidStorage'))}</h1><button class="secondary-cta" data-action="export">${h(t('downloadData'))}</button><button class="secondary-cta" data-action="reset">${h(t('resetDemo'))}</button></section>`;return;}t=translator(settings.language);document.documentElement.lang=settings.language;setTheme();const focusId=document.activeElement?.id,start=document.activeElement?.selectionStart,end=document.activeElement?.selectionEnd;const rendered=views();$('#viewRoot').innerHTML=rendered.html;mountGroupMap(t).catch(()=>{});const dues=paymentDues(s,settings.actorId);const reminder=dues.some(b=>!(ui.dismissedPayments?.[settings.actorId]||[]).includes(b.id))?rendered.paymentReminder():'';$('#paymentReminder').innerHTML=reminder;$('#paymentReminder').hidden=!reminder;document.body.classList.toggle('has-payment-due',!!reminder);$('#actorLabel').textContent=t('actor');$('#versionLabel').textContent=t('version');$('#demoFooter').textContent=t('demoExplanation');$('#demoActor').innerHTML=Object.values(s.profiles).map(p=>`<option value="${h(p.id)}">${h(p.name)} · ${h(t('demo'))}</option>`).join('');$('#demoActor').value=settings.actorId;$('#mainNav').innerHTML=['explore','bookings','groups','profile'].map(key=>`<button type="button" data-action="nav" data-view="${key}" class="${ui.view===key||key==='groups'&&['group','groupForm','matchForm'].includes(ui.view)?'active':''}" aria-label="${h(t(key))}">${key==='profile'&&s.profiles[settings.actorId].photo?views().avatar(s.profiles[settings.actorId]):svg(key)}<span>${h(t(key))}</span></button>`).join('');$('#settingsButton').setAttribute('aria-label',t('settings'));$('#tutorialButton').setAttribute('aria-label',t('tutorial'));$('#notificationsButton').setAttribute('aria-label',t('notifications'));const dueCount=paymentDues(s,settings.actorId).length;$('#notificationsButton').classList.toggle('payment-alert',dueCount>0);const unread=Object.values(s.notifications).filter(n=>n.recipientId===settings.actorId&&!n.read).length+dueCount;$('#noticeCount').textContent=unread>99?'99+':unread;$('#noticeCount').hidden=!unread;$('#requestsButton').hidden=!Object.values(s.groups).some(g=>canManage(s,settings.actorId,g.id));$('#requestsButton').setAttribute('aria-label',t('requests'));if(focusId){const focus=document.getElementById(focusId);if(focus&&!focus.disabled){focus.focus({preventScroll:true});if(start!==null&&start!==undefined&&['text','search'].includes(focus.type))focus.setSelectionRange(start,end);}}}
function go(view,extra={}){syncTime();const returnView=ui.view;if(view==='profile'&&!extra.profileId)extra.profileId=settings.actorId;Object.assign(ui,extra,{view,returnView});render();window.scrollTo({top:0,behavior:'instant'});$('#viewRoot').focus({preventScroll:true});}
function showDialog(html){if($('#modal').open)$('#modal').close();dialogReturn=document.activeElement;$('#modal').innerHTML=html;$('#modal').showModal();$('#modal').querySelector('[autofocus],button,input,select')?.focus();}
function closeDialog(){if($('#modal').open)$('#modal').close();if(dialogReturn?.isConnected)dialogReturn.focus({preventScroll:true});}
function showMessage(key){showDialog(`<h2 id="dialogTitle">${h(t(key==='chooseSeat'?'book':'errorTitle'))}</h2><p id="dialogMessage">${h(t(key))}</p><button type="button" class="small-primary" id="dialogOK" data-action="close-dialog" autofocus>${h(t('ok'))}</button>`);}
function confirmMessage(message,callback){confirmCallback=callback;showDialog(`<h2 id="dialogTitle">${h(t('yes'))}</h2><p>${h(message)}</p><div class="button-row"><button type="button" class="secondary-cta" data-action="close-dialog" autofocus>${h(t('cancel'))}</button><button type="button" class="small-primary" data-action="confirm-dialog">${h(t('yes'))}</button></div>`);}
function readForm(form){const f=new FormData(form),data=Object.fromEntries(f);for(const key of ['weekly','skipHolidays','memberApproval','bookingApproval','available'])if(form.querySelector('[name="'+key+'"]'))data[key]=f.has(key);for(const key of ['days','strengths'])if(form.querySelector('[name="'+key+'"]'))data[key]=f.getAll(key);return data;}
function updateDraft(form){const kind=form.dataset.form;if(['group','match','profile'].includes(kind))ui.drafts[kind]={...ui.drafts[kind],...readForm(form)};}
function setSelection(slot){syncTime();if(!memberOf(s,settings.actorId,s.matches[ui.matchId].groupId)){showMessage('membershipRequired');return;}ui.selections[ui.matchId]=slot;render();const target=$('[data-action="move-seat"]')||$('#bookButton');if(target&&!target.disabled){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});target.focus({preventScroll:true});}}
function toggleNotifications(){syncTime();if(ui.view==='notifications'){const y=ui.notificationReturnY||0;go(ui.notificationReturnView||'explore');requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));}else{ui.notificationReturnView=ui.view;ui.notificationReturnY=scrollY;go('notifications');}}
function openMatch(matchId){go('match',{matchId,matchTab:'court'});}
function exportData(){const blob=new Blob([localStorage.getItem(STATE_KEY)||'{}'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='staseravolley-v002-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function uploadPhoto(file,kind='profile'){let url;const actor=settings.actorId,form=$('form[data-form="'+kind+'"]');try{if(!file||!form)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error();updateDraft(form);const image=new Image();url=URL.createObjectURL(file);await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});if(settings.actorId!==actor||!form.isConnected)return;const cropped=await cropImage(image,t);if(!cropped||settings.actorId!==actor||!form.isConnected)return;ui.drafts[kind][kind==='group'?'logo':'photo']=cropped;render();}catch{showMessage('invalidImage');}finally{if(url)URL.revokeObjectURL(url);const input=form?.querySelector('input[type=file]');if(input)input.value='';}}
document.addEventListener('click',e=>{const target=e.target.closest('[data-action]');if(!target||target.disabled)return;const {action,id,view,value,slot,person,accept}=target.dataset;switch(action){
 case 'back-notifications':toggleNotifications();break;
 case 'nav':go(view);break;
 case 'open-group':go('group',{groupId:id});break;
 case 'group-requests':go('requests',{requestGroup:id});break;
 case 'open-event':{const event=s.matches[id];if(event)go('group',{groupId:event.groupId,eventId:id});break;}
 case 'open-match':openMatch(id);break;
 case 'open-profile':go('profile',{profileId:id});break;
 case 'seat-profile':go('profile',{profileId:person});break;
 case 'create-group':ui.drafts.group={};go('groupForm',{editGroupId:null});break;
 case 'edit-group':ui.drafts.group={};go('groupForm',{editGroupId:id});break;
 case 'delete-group':confirmMessage(t('deleteGroupConfirm'),()=>{if(perform('DELETE_GROUP',{groupId:id})){go('groups');toast('groupDeleted');}});break;
 case 'dismiss-payment':ui.dismissedPayments={...ui.dismissedPayments,[settings.actorId]:paymentDues(s,settings.actorId).map(b=>b.id)};render();break;
 case 'choose-photo':{const form=$('form[data-form="'+target.dataset.kind+'"]');if(form){updateDraft(form);form.querySelector('input[type=file]').click();}break;}
 case 'clear-draft-photo':{const kind=target.dataset.kind;updateDraft($('form[data-form="'+kind+'"]'));ui.drafts[kind][kind==='group'?'logo':'photo']=null;render();break;}
 case 'create-match':ui.drafts.match={};go('matchForm',{groupId:id,editMatchId:null});break;
 case 'edit-match':ui.drafts.match={};go('matchForm',{groupId:s.matches[id].groupId,editMatchId:id});break;
 case 'duplicate-match':{const m=s.matches[id];ui.drafts.match={date:m.date,start:new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(m.startsAt)),end:new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(m.endsAt)),venue:m.venue,capacity:m.capacity,price:m.priceCents/100,weekly:false,skipHolidays:true};go('matchForm',{groupId:m.groupId,editMatchId:null});break;}
 case 'join-group':if(perform('JOIN_GROUP',{groupId:id}))toast(s.groups[id].memberApproval?'membershipSent':'memberJoined');break;
 case 'match-tab':ui.matchTab=value;render();$('#tab-'+value)?.focus({preventScroll:true});break;
 case 'group-view':ui.groupView=value;render();$(`[data-action="group-view"][data-value="${value}"]`)?.focus({preventScroll:true});break;
 case 'date-filter':ui.dateFilter=value;ui.exactDate='';render();break;
 case 'select-seat':setSelection(slot);break;
 case 'book':{const selected=ui.selections[id];if(!selected){showMessage('chooseSeat');break;}if(perform('BOOK',{matchId:id,slot:selected})){delete ui.selections[id];render();toast(myBooking(s,settings.actorId,id)?.status==='pending'?'requestSent':'bookingConfirmed');}break;}
 case 'move-seat':if(perform('MOVE',{bookingId:id,slot:ui.selections[ui.matchId]})){delete ui.selections[ui.matchId];render();toast('saved');}break;
 case 'cancel-booking':{const b=s.bookings[id],m=s.matches[b.matchId],payment=Object.values(s.payments).find(p=>p.bookingId===id&&p.type==='charge');const refund=payment&&Date.parse(m.startsAt)-Date.now()>=86400000?payment.amountCents:0;confirmMessage(t('cancelQuestion')+(payment?' '+t('refundAmount',{amount:views().money(refund)}):''),()=>{if(perform('CANCEL',{bookingId:id})){delete ui.selections[b.matchId];render();toast('cancelledMessage');}});break;}
 case 'payment':{syncTime();const b=s.bookings[id];if(!b||b.status!=='confirmed'||b.paymentStatus!=='unpaid'){showMessage('paymentNotAllowed');break;}showDialog(views().paymentDialog(b));break;}
 case 'decide':if(perform('DECIDE',{requestId:id,accept:accept==='true'}))toast('decisionSaved');break;
 case 'read-notices':perform('READ_NOTICES');break;
 case 'notice':{const notice=s.notifications[id];if(perform('READ_NOTICES',{id})){if(target.dataset.match)openMatch(target.dataset.match);else go('requests',{requestGroup:notice.groupId});}break;}
 case 'edit-profile':ui.drafts.profile={};go('profileForm');break;
 case 'edit-profile-photo':ui.drafts.profile={};go('profileForm');$('#photoUpload').click();break;
 case 'toggle-availability':if(perform('PROFILE',{available:!s.profiles[settings.actorId].available}))toast('saved');break;
 case 'remove-group-logo':if(perform('GROUP_LOGO',{groupId:id,logo:null}))toast('saved');break;
 case 'remove-photo':if(perform('PROFILE',{photo:null}))toast('saved');break;
 case 'invite-form':go('invite',{matchId:id});break;
 case 'invite':if(perform('INVITE',{matchId:ui.matchId,personId:id}))toast('inviteSent');break;
 case 'decide-invite':{const invitation=s.invitations[id];if(perform('DECIDE_INVITE',{id,accept:accept==='true'})&&accept==='true')openMatch(invitation.matchId);break;}
 case 'rate':go('rating',{matchId:id});break;
 case 'close-dialog':confirmCallback=null;closeDialog();break;
 case 'confirm-dialog':{const callback=confirmCallback;confirmCallback=null;closeDialog();callback?.();break;}
 case 'reset':confirmMessage(t('resetQuestion'),()=>{try{store(createSeed());fatal=false;settings.actorId='demo-you';saveSettings();Object.assign(ui,{view:'explore',selections:{},drafts:{}});render();toast('saved');}catch{showMessage('storageError');}});break;
 case 'export':exportData();break;
 }});
document.addEventListener('submit',e=>{const form=e.target;if(!form.dataset.form)return;e.preventDefault();if(!form.reportValidity())return;const p=readForm(form);switch(form.dataset.form){
 case 'group':if(perform(ui.editGroupId?'EDIT_GROUP':'CREATE_GROUP',{...p,groupId:ui.editGroupId,...(Object.hasOwn(ui.drafts.group||{},'logo')?{logo:ui.drafts.group.logo}:{})})){ui.drafts.group={};go('group',{groupId:s.lastCreatedGroupId});toast('groupCreated');}break;
 case 'match':if(perform(ui.editMatchId?'EDIT_MATCH':'CREATE_MATCH',{...p,matchId:ui.editMatchId,groupId:ui.groupId})){ui.drafts.match={};openMatch(ui.editMatchId||s.lastCreatedMatchId);toast('matchSaved');}break;
 case 'access':if(perform('GROUP_SETTINGS',{...p,groupId:form.dataset.id}))toast('saved');break;
 case 'payment':if(perform('PAY',{bookingId:form.dataset.id,method:p.method})){closeDialog();toast('paidMessage');}break;
 case 'profile':p.days=p.days.map(Number);if(perform('PROFILE',{...p,...(Object.hasOwn(ui.drafts.profile||{},'photo')?{photo:ui.drafts.profile.photo}:{})})){ui.drafts.profile={};go('profile',{profileId:settings.actorId});toast('saved');}break;
 case 'hold-config':if(perform('HOLD_CONFIG',{hours:p.hours}))toast('saved');break;
 case 'admin-gate':if(p.code==='2468'&&s.authorizedAdmins.includes(settings.actorId)){ui.adminUnlocked=true;go('admin');}else showMessage('unauthorized');break;
 case 'rating':if(perform('RATE',{matchId:ui.matchId,scores:Object.fromEntries(Object.entries(p).map(([k,v])=>[k,Number(v)]))})){go('bookings');toast('ratingSaved');}break;
 }});
document.addEventListener('input',e=>{const form=e.target.closest('form[data-form]');if(form){updateDraft(form);if(form.dataset.form==='match'&&$('#recurrencePreview'))$('#recurrencePreview').innerHTML=views().recurrenceHTML(ui.drafts.match||{});}if(e.target.dataset.filter&&e.target.type==='search'){const key=e.target.dataset.filter;ui[key]=e.target.value;render();}});
document.addEventListener('change',e=>{const target=e.target;if(target.id==='demoActor'){settings.actorId=target.value;saveSettings();closeDialog();Object.assign(ui,{view:'explore',selections:{},drafts:{},adminUnlocked:false,requestGroup:'',requestStatus:'',requestType:''});syncTime();render();return;}if(target.dataset.setting){const previous={...settings};settings[target.dataset.setting]=target.value;try{saveSettings();t=translator(settings.language);render();}catch{settings=previous;showMessage('storageError');}return;}if(target.dataset.filter&&target.type!=='search'){ui[target.dataset.filter]=target.value;if(target.dataset.filter==='exactDate')ui.dateFilter='exact';render();}if(target.dataset.photoKind)uploadPhoto(target.files[0],target.dataset.photoKind);const form=target.closest('form[data-form]');if(form)updateDraft(form);});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement&&e.target.dataset.avatar){e.target.hidden=true;const note=e.target.closest('.profile-hero')?.querySelector('.photo-note');if(note)note.textContent=t('photoFallback');}},true);
document.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tab=e.target.closest('[role=tab]');if(!tab)return;const all=[...tab.parentElement.querySelectorAll('[role=tab]')],i=all.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?all.length-1:(i+(e.key==='ArrowRight'?1:all.length-1))%all.length;e.preventDefault();all[next].click();});
const tour=createTour({getView:()=>ui.view,t:()=>t,render:()=>render()});
$('#settingsButton').onclick=()=>go('settings');$('#notificationsButton').onclick=toggleNotifications;$('#requestsButton').onclick=()=>{syncTime();go('requests');};$('#tutorialButton').onclick=()=>tour.start();$('#closeToast').onclick=()=>$('#toast').hidden=true;
let comparedVersion='v002';$('#prototypeVersion').onchange=e=>{tour.close();const value=e.target.value,previous=comparedVersion,original=value!=='v002';comparedVersion=value;$('#comparison').hidden=!original;$('#appFrame').hidden=original;if(original)$('#comparison').src=`../${value==='v001'&&location.pathname.startsWith('/mockup/')?'archive/v001':value}/index.html`;else $('#comparison').removeAttribute('src');const changes=comparedVersions(previous,value);showDialog(`<h2 id="dialogTitle">${h(t('versionNotes'))}: ${h(previous.toUpperCase())} ↔ ${h(value.toUpperCase())}</h2><p>${h(t('versionSelected',{version:value.toUpperCase()}))}</p>${changes.map(entry=>`<section><h3>${h(entry.version.toUpperCase())}</h3><ul>${entry.features.map(key=>`<li>${h(t(key))}</li>`).join('')}</ul></section>`).join('')}<button type="button" class="small-primary" data-action="close-dialog" autofocus>${h(t('ok'))}</button>`);};
$('#modal').addEventListener('cancel',()=>{confirmCallback=null;});
window.addEventListener('storage',e=>{if(e.key===STATE_KEY||e.key===SETTINGS_KEY){load();render();toast('conflict');}});
window.addEventListener('focus',syncTime);document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncTime();});setInterval(syncTime,15000);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(settings.theme==='auto')setTheme();});
$('#prototypeVersion').insertAdjacentHTML('beforeend','<option value="v003">V003 · Chat demo</option>');
load();render();
// Read-only diagnostics used by the local QA suite; no production APIs exist.
globalThis.SV002={getState:()=>structuredClone(s),getSettings:()=>({...settings}),missingTranslations:()=>[...missingKeys],keys:{state:STATE_KEY,settings:SETTINGS_KEY}};


