import {reconcile,transition,RuleError} from './core.js';
const values=Object.values,fail=code=>{throw new RuleError(code)};
export function createDemoAccount(input,p,now=Date.now()){
 const name=String(p.name||'').trim(),city=String(p.city||'').trim(),courtPosition=Number(p.courtPosition||1);if(name.length<2||name.length>70||city.length>80||!Number.isInteger(courtPosition)||courtPosition<1||courtPosition>6)fail('invalidForm');
 const s=structuredClone(reconcile(input,now));let id;do{id='demo-account-'+(++s.seq)}while(s.profiles[id]);s.profiles[id]={id,name,city,courtPosition,photo:null,demo:true,customDemo:true,adult:true,role:'universal',level:'beginner',bio:'',strengths:[],days:[],available:true,createdAt:new Date(now).toISOString()};s.revision++;return {state:s,actorId:id};
}
export function deleteDemoAccount(input,actorId,now=Date.now()){
 let s=structuredClone(reconcile(input,now));const p=s.profiles[actorId];if(!p?.customDemo||p.deletedAt||s.authorizedAdmins.includes(actorId))fail('accountSeedProtected');if(values(s.groups).some(g=>!g.deletedAt&&g.ownerId===actorId))fail('accountOwnsGroups');
 for(const b of values(s.bookings))if(b.personId===actorId&&['pending','confirmed'].includes(b.status)){const m=s.matches[b.matchId];if(m?.status==='active'&&Date.parse(m.startsAt)>now)s=transition(s,actorId,'CANCEL',{bookingId:b.id},now);}
 const at=new Date(now).toISOString();for(const r of values(s.requests))if(r.personId===actorId&&r.status==='pending'){r.status='cancelled';r.decidedBy=actorId;r.decidedAt=at;}
 for(const [key,m]of Object.entries(s.memberships))if(m.personId===actorId)delete s.memberships[key];for(const g of values(s.groups))g.adminIds=g.adminIds.filter(id=>id!==actorId);
 for(const field of ['messages','notifications','invitations'])for(const [key,item]of Object.entries(s[field]||{}))if([item.senderId,item.recipientId,item.personId].includes(actorId))delete s[field][key];
 for(const [key,a]of Object.entries(s.announcements||{}))if(a.authorId===actorId)delete s.announcements[key];for(const key of Object.keys(s.chatPrefs||{}))if(key.split(':').includes(actorId))delete s.chatPrefs[key];
 s.profiles[actorId]={id:actorId,name:'Account eliminato · Demo',city:'',courtPosition:1,photo:null,demo:true,customDemo:true,adult:true,role:'universal',level:'beginner',bio:'',strengths:[],days:[],available:false,deletedAt:at};s.revision++;return s;
}
