import {nextDate,times,dateKey,addDays} from './dates.js';
export const FIELD=['p1','p2','p3','p4','p5','p6','q1','q2','q3','q4','q5','q6'];
export const ZONES={p1:1,p2:6,p3:5,p4:2,p5:3,p6:4,q1:1,q2:6,q3:5,q4:2,q5:3,q6:4};
export const COORDS={p1:[17,13],p2:[50,13],p3:[83,13],p4:[17,35],p5:[50,35],p6:[83,35],q6:[17,64],q5:[50,64],q4:[83,64],q3:[17,85],q2:[50,85],q1:[83,85]};
export const ROLES=['outside','setter','middle','opposite','libero','universal'];
const bgNames=['Luca B.','Giulia M.','Andrea P.','Sara T.','Matteo C.','Elena R.','Davide S.','Chiara F.','Marco R.','Federico L.','Marta G.','Paolo V.'];
const friends=['Anna Fontana','Lorenzo Bassi','Sofia Riva','Davide Moretti','Elisa Conti','Marco Villa','Giulia Costa','Alessandro Greco','Martina Gallo','Simone Ferri','Chiara Rizzi','Matteo Serra','Valentina Leoni','Paolo Ricci'];
const leonessa=['Francesca Neri','Andrea Colombo','Alice Barbieri','Stefano Sala','Laura Pellegrini','Federico Marin','Sara Gatti','Tommaso Romano','Ilaria Fiore','Nicola Donati','Camilla Rossi','Gabriele Rinaldi','Elena De Luca','Daniele Sarti'];
export const GROUP_SEEDS=[
 {id:'bg-voltaren',name:'Voltaren',city:'Bergamo',province:'BG',venue:'Palestra Don Bosco · Bergamo',weekday:3,start:'20:30',end:'22:30',priceCents:700,capacity:12,confirmed:9,ownerId:'bg-01',level:'mixed',memberApproval:false,bookingApproval:false},
 {id:'bg-smash',name:'Smash & Fun',city:'Bergamo',province:'BG',venue:'Palazzetto Celadina · Bergamo',weekday:4,start:'21:00',end:'23:00',priceCents:600,capacity:12,confirmed:11,ownerId:'bg-04',level:'mixed',memberApproval:true,bookingApproval:false},
 {id:'bg-bagher',name:'Bagher & Spritz',city:'Bergamo',province:'BG',venue:'Palestra Loreto · Bergamo',weekday:4,start:'20:30',end:'22:30',priceCents:700,capacity:14,confirmed:12,ownerId:'bg-07',level:'intermediate',memberApproval:false,bookingApproval:true},
 {id:'bg-volley-spritz',name:'Volley & Spritz',city:'Costa di Mezzate',province:'BG',venue:'Centro sportivo Costa di Mezzate',weekday:4,start:'20:30',end:'22:30',priceCents:700,capacity:12,confirmed:10,ownerId:'bg-02',level:'mixed',memberApproval:true,bookingApproval:true},
 {id:'bs-friends',name:'Brescia Volley Friends',city:'Brescia',province:'BS',venue:'Palestra Demo Friends',weekday:2,start:'20:30',end:'22:30',priceCents:700,capacity:16,confirmed:14,ownerId:'bs-friends-01',level:'mixed',memberApproval:true,bookingApproval:true},
 {id:'bs-leonessa',name:'Leonessa Volley Club',city:'Brescia',province:'BS',venue:'Palestra Demo Leonessa',weekday:5,start:'21:00',end:'23:00',priceCents:800,capacity:16,confirmed:14,ownerId:'bs-leonessa-01',level:'intermediate',memberApproval:false,bookingApproval:false}
];
export function seedPeople(groupId){return groupId.startsWith('bs-')?Array.from({length:14},(_,i)=>`${groupId}-${String(i+1).padStart(2,'0')}`):Array.from({length:12},(_,i)=>`bg-${String(i+1).padStart(2,'0')}`);}
export function addSeedMatch(s,g,now){const date=nextDate(g.weekday,g.start,now),id=`${g.id}-${date}`;if(s.matches[id])return;s.matches[id]={id,groupId:g.id,date,venue:g.venue,city:g.city,...times(date,g.start,g.end),priceCents:g.priceCents,capacity:g.capacity,status:'active',seriesId:`seed-${g.id}`,seeded:true};seedPeople(g.id).slice(0,g.confirmed).forEach((personId,i)=>{const bid=`seed-${id}-${personId}`;s.bookings[bid]={id:bid,personId,matchId:id,slot:i<12?FIELD[i]:`r${i-11}`,status:'confirmed',createdAt:new Date(now).toISOString(),priceCents:g.priceCents,paymentStatus:'unpaid',requestId:null};});}
export function createSeed(now=Date.now()){
 const s={schemaVersion:1,revision:0,seq:100,config:{holdHours:24},authorizedAdmins:['demo-admin'],profiles:{},groups:{},memberships:{},matches:{},bookings:{},requests:{},notifications:{},history:[],payments:{},invitations:{},ratings:{}};
 const profile=(id,name,i,city,photo=null)=>({id,name,city,photo,demo:true,adult:true,role:ROLES[i%ROLES.length],level:i%2?'intermediate':'beginner',bioKey:'demoBio',bio:'',strengths:['attack','reception'],days:[2,4],available:true});
 bgNames.forEach((name,i)=>{const id=`bg-${String(i+1).padStart(2,'0')}`;s.profiles[id]={...profile(id,name,i,'Bergamo',`assets/avatars/${id}.jpg`),avatarSeedV2:true};});
 for(const [prefix,names] of [['bs-friends',friends],['bs-leonessa',leonessa]])names.forEach((name,i)=>{const id=`${prefix}-${String(i+1).padStart(2,'0')}`;s.profiles[id]=profile(id,name,i,'Brescia',`assets/avatars/${id}.jpg`);});
 s.profiles['demo-you']=profile('demo-you','Giocatore Demo',0,'Bergamo');s.profiles['demo-admin']=profile('demo-admin','Amministratore Demo',5,'Bergamo');
 for(const seed of GROUP_SEEDS){const g={...seed,demo:true,storyKey:seed.id.startsWith('bs-')?'bresciaStory':'bergamoStory',description:'',history:'',adminIds:[],createdAt:new Date(now).toISOString()};s.groups[g.id]=g;for(const personId of seedPeople(g.id))s.memberships[`${g.id}:${personId}`]={groupId:g.id,personId,status:'active',role:personId===g.ownerId?'organizer':'member'};addSeedMatch(s,g,now);}
 const pastDate=addDays(dateKey(now),-2),past={id:'demo-past-voltaren',groupId:'bg-voltaren',date:pastDate,venue:s.groups['bg-voltaren'].venue,city:'Bergamo',...times(pastDate,'20:30','22:30'),priceCents:700,capacity:12,status:'finished',seeded:false};s.matches[past.id]=past;s.bookings['demo-past-you']={id:'demo-past-you',personId:'demo-you',matchId:past.id,slot:'p1',status:'confirmed',priceCents:700,paymentStatus:'unpaid',requestId:null,createdAt:past.startsAt};['bg-01','bg-02','bg-03'].forEach((personId,i)=>{const bid='demo-past-'+personId;s.bookings[bid]={id:bid,personId,matchId:past.id,slot:FIELD[i+1],status:'confirmed',priceCents:700,paymentStatus:'unpaid',requestId:null,createdAt:past.startsAt};});return s;
}
// One-time upgrade of existing V002 demo profiles only. User uploads and
// intentional removals after the upgrade survive every subsequent reload.
export function upgradeDemoPhotos(state,manifest){
 for(const asset of manifest){const p=state.profiles[asset.personId];if(!p?.demo||!asset.personId.startsWith('bg-')||p.avatarSeedV2||asset.status!=='generated')continue;if(!p.photo)p.photo=asset.src;p.avatarSeedV2=true;}
 return state;
}
